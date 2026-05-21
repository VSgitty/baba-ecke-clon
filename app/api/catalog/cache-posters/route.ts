import { NextResponse } from "next/server";

import { getEnrichedCatalogItems } from "@/lib/catalog";

/**
 * GET /api/catalog/cache-posters
 * Forces poster resolution + local cache write for the current catalog slice.
 */
export async function GET() {
  try {
    const items = await getEnrichedCatalogItems(500, 500, { overwriteExistingPosters: true });
    const cachedCount = items.filter((item) => item.poster?.startsWith("/cache/posters/")).length;

    return NextResponse.json({
      success: true,
      total: items.length,
      cached: cachedCount,
      message: "Poster cache warmup completed"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Poster cache warmup failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
