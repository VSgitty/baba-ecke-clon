import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import path from "path";
import { CatalogItem } from "@/lib/catalog";

const CUSTOM_CATALOG_PATH = path.join(process.cwd(), "public", "data", "catalog-custom.json");

/**
 * GET /api/catalog
 * Retrieve all custom catalog items
 */
export async function GET() {
  try {
    const data = await readFile(CUSTOM_CATALOG_PATH, "utf-8");
    const items: Record<string, CatalogItem> = JSON.parse(data);
    return NextResponse.json(items);
  } catch (error) {
    console.log("[GET /api/catalog] No custom catalog file found, returning empty object");
    return NextResponse.json({});
  }
}

/**
 * POST /api/catalog
 * Add a new catalog item
 */
export async function POST(request: NextRequest) {
  try {
    const { id, item }: { id: string; item: CatalogItem } = await request.json();

    if (!id || !item.title) {
      return NextResponse.json({ error: "Missing required fields: id, item.title" }, { status: 400 });
    }

    // Load existing items
    let items: Record<string, CatalogItem> = {};
    try {
      const data = await readFile(CUSTOM_CATALOG_PATH, "utf-8");
      items = JSON.parse(data);
    } catch {
      // File doesn't exist, start with empty object
    }

    // Check for duplicate id
    if (items[id]) {
      return NextResponse.json({ error: `Catalog item with id "${id}" already exists` }, { status: 409 });
    }

    // Add new item
    items[id] = item;

    // Ensure directory exists
    const dir = path.dirname(CUSTOM_CATALOG_PATH);
    await writeFile(CUSTOM_CATALOG_PATH, JSON.stringify(items, null, 2));

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("[POST /api/catalog] Error:", error);
    return NextResponse.json({ error: "Failed to save catalog item" }, { status: 500 });
  }
}

/**
 * DELETE /api/catalog
 * Remove a catalog item by id
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id query parameter required" }, { status: 400 });
    }

    const data = await readFile(CUSTOM_CATALOG_PATH, "utf-8");
    let items: Record<string, CatalogItem> = JSON.parse(data);

    if (!items[id]) {
      return NextResponse.json({ error: `Catalog item not found: ${id}` }, { status: 404 });
    }

    delete items[id];
    await writeFile(CUSTOM_CATALOG_PATH, JSON.stringify(items, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/catalog] Error:", error);
    return NextResponse.json({ error: "Failed to delete catalog item" }, { status: 500 });
  }
}
