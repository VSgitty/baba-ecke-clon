/**
 * Catalog Manager: Create and manage individual catalog items
 */

import { CatalogItem } from "./catalog";

export type CatalogFormInput = {
  title: string;
  genre: string; // "Thriller, Sci-Fi"
  year: number;
  duration: string; // "120 min" oder "8 Episodes"
  rating: string; // "8.5/10"
  type: "movie" | "series";
  cover: string; // URL
  description: string;
  streamUrl?: string;
};

export function validateCatalogInput(input: Partial<CatalogFormInput>): string[] {
  const errors: string[] = [];

  if (!input.title?.trim()) errors.push("Titel erforderlich");
  if (!input.genre?.trim()) errors.push("Genre erforderlich");
  if (!input.year || input.year < 1900 || input.year > 2100)
    errors.push("Jahr erforderlich (1900-2100)");
  if (!input.duration?.trim()) errors.push("Dauer erforderlich (z.B. '120 min' oder '10 Episodes')");
  if (!input.type) errors.push("Typ erforderlich (Film oder Serie)");
  if (!input.cover?.trim()) errors.push("Cover-URL erforderlich");
  if (!input.description?.trim()) errors.push("Beschreibung erforderlich");

  // Validate rating format
  if (input.rating && !input.rating.match(/^\d+(\.\d+)?\/10$/)) {
    errors.push("Rating muss Format '8.5/10' haben");
  }

  return errors;
}

export function formToCatalogItem(id: string, input: CatalogFormInput): CatalogItem {
  const ratingStr = input.rating;
  const rating = parseFloat(ratingStr.split("/")[0]) || 0;

  return {
    id,
    title: input.title,
    type: input.type,
    genre: input.genre.split(",")[0]?.trim().toLowerCase() || "other",
    year: input.year,
    duration: input.duration,
    poster: input.cover,
    rating,
    description: input.description,
    streamUrl: input.streamUrl,
  };
}

export const genrePresets = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Sci-Fi",
  "Thriller",
  "Romance",
  "Documentary",
];
