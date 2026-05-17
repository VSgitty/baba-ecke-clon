import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import path from "path";
import * as fs from "fs";

export type CustomShelf = {
  key: string;
  label: string;
  kicker: string;
  accent: string;
  icon?: string; // Icon name from lucide-react
};

const CUSTOM_SHELVES_PATH = path.join(process.cwd(), "public", "data", "shelves-custom.json");

async function ensureDir() {
  const dir = path.dirname(CUSTOM_SHELVES_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * GET /api/shelves
 * Retrieve all custom shelves
 */
export async function GET() {
  try {
    await ensureDir();
    const data = await readFile(CUSTOM_SHELVES_PATH, "utf-8");
    const shelves: Record<string, CustomShelf> = JSON.parse(data);
    return NextResponse.json(Object.values(shelves));
  } catch (error) {
    console.log("[GET /api/shelves] No custom shelves file found, returning empty array");
    return NextResponse.json([]);
  }
}

/**
 * POST /api/shelves
 * Add a new custom shelf
 */
export async function POST(request: NextRequest) {
  try {
    const { key, label, kicker, accent, icon }: CustomShelf = await request.json();

    if (!key || !label) {
      return NextResponse.json(
        { error: "Missing required fields: key, label" },
        { status: 400 }
      );
    }

    // Validate key format (lowercase, hyphens only)
    if (!/^[a-z0-9-]+$/.test(key)) {
      return NextResponse.json(
        { error: 'Key must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    await ensureDir();

    // Load existing shelves
    let shelves: Record<string, CustomShelf> = {};
    try {
      const data = await readFile(CUSTOM_SHELVES_PATH, "utf-8");
      shelves = JSON.parse(data);
    } catch {
      // File doesn't exist, start with empty object
    }

    // Check for duplicate key
    if (shelves[key]) {
      return NextResponse.json(
        { error: `Shelf with key "${key}" already exists` },
        { status: 409 }
      );
    }

    // Add new shelf
    const newShelf: CustomShelf = {
      key,
      label,
      kicker: kicker || "New Shelf",
      accent: accent || "#6366f1",
      icon: icon || "Film",
    };

    shelves[key] = newShelf;
    await writeFile(CUSTOM_SHELVES_PATH, JSON.stringify(shelves, null, 2));

    return NextResponse.json({ success: true, shelf: newShelf });
  } catch (error) {
    console.error("[POST /api/shelves] Error:", error);
    return NextResponse.json({ error: "Failed to create shelf" }, { status: 500 });
  }
}

/**
 * DELETE /api/shelves?key=...
 * Remove a custom shelf by key
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "key query parameter required" }, { status: 400 });
    }

    await ensureDir();
    const data = await readFile(CUSTOM_SHELVES_PATH, "utf-8");
    let shelves: Record<string, CustomShelf> = JSON.parse(data);

    if (!shelves[key]) {
      return NextResponse.json({ error: `Shelf not found: ${key}` }, { status: 404 });
    }

    delete shelves[key];
    await writeFile(CUSTOM_SHELVES_PATH, JSON.stringify(shelves, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/shelves] Error:", error);
    return NextResponse.json({ error: "Failed to delete shelf" }, { status: 500 });
  }
}
