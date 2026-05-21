import rawCatalog from "@/data/movies-data.json";
import { readFile } from "fs/promises";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";

export type CatalogItem = {
  id: string;
  title: string;
  type: "movie" | "series";
  genre: string;
  year?: number;
  duration?: string;
  poster?: string;
  rating?: number;
  description?: string;
  streamUrl?: string;
  tmdbId?: number;
};

type EnrichCatalogOptions = {
  overwriteExistingPosters?: boolean;
};

type RawCatalogEntry = {
  id?: string;
  title?: string;
  type?: string;
  genre?: string;
  year?: number | string;
  duration?: string;
  poster?: string;
  cover?: string;
  rating?: number | string;
  description?: string;
  streamUrl?: string;
  tmdbId?: number | string;
};

function toGenre(genre: string | undefined): string {
  if (!genre) return "other";
  return genre.split(",")[0]?.trim().toLowerCase() || "other";
}

function toRating(value: number | string | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toYear(value: number | string | undefined): number | undefined {
  if (typeof value === "number") return value;
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toTmdbId(value: number | string | undefined): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toCatalogItem(id: string, item: RawCatalogEntry): CatalogItem {
  return {
    id,
    title: item.title || "Untitled",
    type: item.type === "series" ? "series" : "movie",
    genre: toGenre(item.genre),
    year: toYear(item.year),
    duration: item.duration,
    poster: item.poster || item.cover,
    rating: toRating(item.rating),
    description: item.description,
    streamUrl: item.streamUrl,
    tmdbId: toTmdbId(item.tmdbId),
  };
}

function isLocalCachedPoster(poster: string | undefined): boolean {
  return Boolean(poster && poster.startsWith("/cache/posters/"));
}

export function getCatalogItems(limit?: number): CatalogItem[] {
  const entries = Object.entries(rawCatalog as Record<string, RawCatalogEntry>);
  const actualLimit = limit ? Math.min(limit, entries.length) : entries.length;

  // Prefer most recently added entries when a limit is set.
  const limitedEntries = limit ? entries.slice(-actualLimit) : entries;
  return limitedEntries.map(([id, item]) => toCatalogItem(id, item));
}

async function loadCustomCatalogItems(): Promise<CatalogItem[]> {
  noStore();
  try {
    const filePath = path.join(process.cwd(), "public", "data", "catalog-custom.json");
    const data = await readFile(filePath, "utf-8");
    const customCatalog: Record<string, RawCatalogEntry> = JSON.parse(data);
    return Object.entries(customCatalog).map(([id, item]) => toCatalogItem(item.id || id, item));
  } catch {
    return [];
  }
}

export async function getCombinedCatalogItems(limit?: number): Promise<CatalogItem[]> {
  noStore();
  const staticItems = getCatalogItems(limit);
  const customItems = await loadCustomCatalogItems();

  const itemMap = new Map<string, CatalogItem>();

  // Custom items first so freshly added entries are visible immediately.
  customItems.forEach((item) => {
    if (item.id) itemMap.set(item.id, item);
  });

  staticItems.forEach((item) => {
    if (!itemMap.has(item.id)) {
      itemMap.set(item.id, item);
    }
  });

  const allItems = Array.from(itemMap.values());
  
  // Apply limit at the end - this ensures custom items are always included
  if (limit && limit > 0) {
    return allItems.slice(0, limit);
  }
  
  return allItems;
}

/**
 * Server-side: returns catalog items (static + custom) and prefers TMDB posters over local covers.
 * Import this only from Server Components — it calls the TMDB API.
 * Enrichment is batched (max `enrichLimit` items) and cached 24 h via Next.js fetch.
 */
export async function getEnrichedCatalogItems(
  limit = 120,
  enrichLimit = limit,
  options: EnrichCatalogOptions = {}
): Promise<CatalogItem[]> {
  noStore();
  const allItems = await getCombinedCatalogItems(limit);
  const overwriteExistingPosters = options.overwriteExistingPosters ?? false;

  // Lazy import keeps server-only code tree-shaken from client bundles
  const { resolveItemPoster } = await import("@/lib/tmdb");

  // Re-enrich all items that do not yet use locally cached poster assets.
  // This replaces legacy/original cover URLs with TMDB-derived artwork.
  const itemsToEnrich = allItems
    .filter((item) => {
      if (overwriteExistingPosters) return true;
      return !item.poster || !isLocalCachedPoster(item.poster);
    })
    .slice(0, Math.min(enrichLimit, allItems.length));

  let resolvedItems = allItems;

  if (itemsToEnrich.length > 0) {
    const enriched = await Promise.allSettled(
      itemsToEnrich.map((item) => resolveItemPoster(item.title, item.type, item.year, item.tmdbId))
    );

    const posterMap: Record<string, string | null> = {};
    itemsToEnrich.forEach((item, idx) => {
      const result = enriched[idx];
      posterMap[item.id] = result?.status === "fulfilled" ? result.value : null;
    });

    resolvedItems = allItems.map((item) => {
      const tmdbPoster = posterMap[item.id];
      if (tmdbPoster) return { ...item, poster: tmdbPoster };

      // Keep existing posters as fallback when TMDB can't resolve reliably.
      if (isLocalCachedPoster(item.poster)) return item;
      if (item.poster) return item;
      return { ...item, poster: undefined };
    });
  }

  const { cacheCatalogPosters } = await import("@/lib/poster-cache");
  return cacheCatalogPosters(resolvedItems);
}
