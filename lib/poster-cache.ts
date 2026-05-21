import "server-only";

import { createHash } from "crypto";
import { mkdir, stat, writeFile } from "fs/promises";
import path from "path";

import type { CatalogItem } from "@/lib/catalog";

const POSTER_CACHE_DIR = path.join(process.cwd(), "public", "cache", "posters");

function sanitizeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "item";
}

function detectExtensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith(".png")) return "png";
    if (pathname.endsWith(".webp")) return "webp";
    if (pathname.endsWith(".avif")) return "avif";
    if (pathname.endsWith(".jpeg")) return "jpeg";
    if (pathname.endsWith(".jpg")) return "jpg";
  } catch {
    // ignore parsing errors and use a safe default
  }
  return "jpg";
}

function buildCachedPosterPath(id: string, sourceUrl: string): { abs: string; rel: string } {
  const safeId = sanitizeId(id);
  const hash = createHash("sha1").update(sourceUrl).digest("hex").slice(0, 10);
  const ext = detectExtensionFromUrl(sourceUrl);
  const fileName = `${safeId}-${hash}.${ext}`;
  return {
    abs: path.join(POSTER_CACHE_DIR, fileName),
    rel: `/cache/posters/${fileName}`,
  };
}

async function fileExists(absPath: string): Promise<boolean> {
  try {
    const s = await stat(absPath);
    return s.isFile();
  } catch {
    return false;
  }
}

async function cacheSinglePoster(itemId: string, sourceUrl: string): Promise<string> {
  const { abs, rel } = buildCachedPosterPath(itemId, sourceUrl);

  if (await fileExists(abs)) return rel;

  await mkdir(POSTER_CACHE_DIR, { recursive: true });

  const res = await fetch(sourceUrl, {
    headers: { "User-Agent": "baba-ecke-poster-cache/1.0" },
    next: { revalidate: 604800 },
  });
  if (!res.ok) return sourceUrl;

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) return sourceUrl;

  const arrayBuffer = await res.arrayBuffer();
  await writeFile(abs, Buffer.from(arrayBuffer));
  return rel;
}

export async function cacheCatalogPosters(items: CatalogItem[]): Promise<CatalogItem[]> {
  const cached = await Promise.all(
    items.map(async (item) => {
      if (!item.poster) return item;
      if (item.poster.startsWith("/cache/posters/")) return item;

      const localPoster = await cacheSinglePoster(item.id, item.poster);
      return {
        ...item,
        poster: localPoster,
      };
    })
  );

  return cached;
}
