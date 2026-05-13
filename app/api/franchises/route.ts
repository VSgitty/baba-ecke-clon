import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import path from "path";
import { FranchiseWorldDef } from "@/data/franchise-worlds";

const CUSTOM_FRANCHISES_PATH = path.join(process.cwd(), "public", "data", "franchises-custom.json");

/**
 * GET /api/franchises
 * Retrieve all custom franchises from JSON file
 */
export async function GET() {
  try {
    const data = await readFile(CUSTOM_FRANCHISES_PATH, "utf-8");
    const franchises: FranchiseWorldDef[] = JSON.parse(data);
    return NextResponse.json(franchises);
  } catch (error) {
    // File doesn't exist yet or is empty
    console.log("[GET /api/franchises] No custom franchises file found, returning empty array");
    return NextResponse.json([]);
  }
}

/**
 * POST /api/franchises
 * Add a new franchise to the custom collection
 */
export async function POST(request: NextRequest) {
  try {
    const franchise: FranchiseWorldDef = await request.json();

    // Validate required fields
    if (!franchise.slug || !franchise.title) {
      return NextResponse.json({ error: "Missing required fields: slug, title" }, { status: 400 });
    }

    // Load existing franchises
    let franchises: FranchiseWorldDef[] = [];
    try {
      const data = await readFile(CUSTOM_FRANCHISES_PATH, "utf-8");
      franchises = JSON.parse(data);
    } catch {
      // File doesn't exist, start with empty array
    }

    // Check for duplicate slug
    if (franchises.some((f) => f.slug === franchise.slug)) {
      return NextResponse.json({ error: `Franchise with slug "${franchise.slug}" already exists` }, { status: 409 });
    }

    // Add new franchise
    franchises.push(franchise);

    // Ensure directory exists
    const dir = path.dirname(CUSTOM_FRANCHISES_PATH);
    await writeFile(CUSTOM_FRANCHISES_PATH, JSON.stringify(franchises, null, 2));

    return NextResponse.json({ success: true, franchise });
  } catch (error) {
    console.error("[POST /api/franchises] Error:", error);
    return NextResponse.json({ error: "Failed to save franchise" }, { status: 500 });
  }
}

/**
 * DELETE /api/franchises
 * Remove a franchise by slug
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "slug query parameter required" }, { status: 400 });
    }

    const data = await readFile(CUSTOM_FRANCHISES_PATH, "utf-8");
    let franchises: FranchiseWorldDef[] = JSON.parse(data);

    const index = franchises.findIndex((f) => f.slug === slug);
    if (index === -1) {
      return NextResponse.json({ error: `Franchise not found: ${slug}` }, { status: 404 });
    }

    franchises.splice(index, 1);
    await writeFile(CUSTOM_FRANCHISES_PATH, JSON.stringify(franchises, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/franchises] Error:", error);
    return NextResponse.json({ error: "Failed to delete franchise" }, { status: 500 });
  }
}
