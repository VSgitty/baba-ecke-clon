import rawCatalog from "@/data/movies-data.json";

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
};

type RawCatalogEntry = {
  title?: string;
  type?: string;
  genre?: string;
  year?: number | string;
  duration?: string;
  cover?: string;
  rating?: number | string;
  description?: string;
  streamUrl?: string;
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

export function getCatalogItems(limit = 120): CatalogItem[] {
  const entries = Object.entries(rawCatalog as Record<string, RawCatalogEntry>);

  return entries.slice(0, limit).map(([id, item]) => ({
    id,
    title: item.title || "Untitled",
    type: item.type === "series" ? "series" : "movie",
    genre: toGenre(item.genre),
    year: toYear(item.year),
    duration: item.duration,
    poster: item.cover,
    rating: toRating(item.rating),
    description: item.description,
    streamUrl: item.streamUrl
  }));
}
