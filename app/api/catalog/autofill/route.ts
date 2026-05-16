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

    const result = await resolveCatalogAutofill(title, type, year);
    if (!result) {
      return NextResponse.json({ error: "No TMDB match found" }, { status: 404 });
    }

    return NextResponse.json({ item: result });
  } catch (error) {
    console.error("[GET /api/catalog/autofill] Error:", error);
    return NextResponse.json({ error: "TMDB autofill failed" }, { status: 500 });
  }
}
