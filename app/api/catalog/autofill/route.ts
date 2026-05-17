import { NextRequest, NextResponse } from "next/server";

import { resolveCatalogAutofill } from "@/lib/tmdb";

/**
 * GET /api/catalog/autofill?title=...&type=movie|series&year=2024
 * Returns best-match metadata from TMDB to prefill catalog form fields.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title")?.trim() || "";
    const typeParam = searchParams.get("type");
    const type = typeParam === "series" ? "series" : "movie";

    const yearRaw = searchParams.get("year");
    const parsedYear = yearRaw ? Number.parseInt(yearRaw, 10) : undefined;
    const year = Number.isFinite(parsedYear) ? parsedYear : undefined;

    if (!title) {
      return NextResponse.json({ error: "title query parameter required" }, { status: 400 });
    }

    // Check if TMDB_API_KEY is configured
    if (!process.env.TMDB_API_KEY) {
      console.error("[GET /api/catalog/autofill] TMDB_API_KEY not configured");
      return NextResponse.json(
        { error: "TMDB API not configured - check .env.local for TMDB_API_KEY" },
        { status: 503 }
      );
    }

    console.log(`[GET /api/catalog/autofill] Searching for: "${title}" (${type}, year: ${year || "any"})`);
    const result = await resolveCatalogAutofill(title, type, year);
    
    if (!result) {
      console.warn(`[GET /api/catalog/autofill] No TMDB match found for: "${title}"`);
      return NextResponse.json({ error: `No match found for "${title}" on TMDB` }, { status: 404 });
    }

    console.log(`[GET /api/catalog/autofill] Success: found "${result.title}"`);
    return NextResponse.json({ item: result });
  } catch (error) {
    console.error("[GET /api/catalog/autofill] Error:", error);
    const message = error instanceof Error ? error.message : "TMDB autofill failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
