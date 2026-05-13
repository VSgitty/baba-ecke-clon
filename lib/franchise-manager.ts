/**
 * Franchise Manager: Create, store, and retrieve custom franchise definitions.
 * Handles form validation and data conversion.
 * TMDB search is handled by Server Actions in lib/tmdb-actions.ts
 */

import { FranchiseWorldDef } from "@/data/franchise-worlds";

const FRANCHISES_DATA_FILE = "franchises-custom.json";

export type FranchiseFormInput = {
  slug: string;
  title: string;
  subline: string;
  heroSourceType: "movie" | "tv";
  heroSourceTmdbId: number;
  heroSourceTitle: string;
  heroSourceYear?: number;
  tmdbStrategy: "collection" | "movie" | "tv" | "search";
  tmdbCollectionId?: number;
  tmdbMovieTvId?: number;
  tmdbSearchTitle?: string;
  tmdbSearchType?: "movie" | "tv";
  tmdbSearchYear?: number;
  bgFallback: string;
  motionLabel: string;
  accent: string;
  glow: string;
  mist: string;
  tone: string;
  atmosphere: string;
  reviewScore: number;
  genres: string[];
  releaseLabel: string;
  catalogEntries: Array<{
    title: string;
    year: number;
    type: "Film" | "Serie";
    searchTitle?: string;
  }>;
};

/**
 * Convert form input to FranchiseWorldDef
 */
export function formToDef(input: FranchiseFormInput): FranchiseWorldDef {
  let tmdbConfig;

  if (input.tmdbStrategy === "collection") {
    tmdbConfig = {
      strategy: "collection" as const,
      collectionId: input.tmdbCollectionId || 0,
      fallbackTitle: input.title,
    };
  } else if (input.tmdbStrategy === "movie") {
    tmdbConfig = {
      strategy: "movie" as const,
      tmdbId: input.tmdbMovieTvId || 0,
      title: input.title,
    };
  } else if (input.tmdbStrategy === "tv") {
    tmdbConfig = {
      strategy: "tv" as const,
      tmdbId: input.tmdbMovieTvId || 0,
      title: input.title,
    };
  } else {
    tmdbConfig = {
      strategy: "search" as const,
      title: input.tmdbSearchTitle || input.title,
      type: (input.tmdbSearchType || "movie") as "movie" | "tv",
      year: input.tmdbSearchYear,
    };
  }

  return {
    slug: input.slug,
    title: input.title,
    subline: input.subline,
    heroSource: {
      type: input.heroSourceType,
      tmdbId: input.heroSourceTmdbId,
      title: input.heroSourceTitle,
      year: input.heroSourceYear,
    },
    tmdb: tmdbConfig,
    bgFallback: input.bgFallback,
    motionLabel: input.motionLabel,
    accent: input.accent,
    glow: input.glow,
    mist: input.mist,
    tone: input.tone,
    atmosphere: input.atmosphere,
    reviewScore: input.reviewScore,
    genres: input.genres,
    releaseLabel: input.releaseLabel,
    catalog: input.catalogEntries,
  };
}

/**
 * Search TMDB for movie/TV titles with cover info
 * MOVED to lib/tmdb-actions.ts as a Server Action
 */

/**
 * Search TMDB for collections
 * MOVED to lib/tmdb-actions.ts as a Server Action
 */

/**
 * Client: Validate form input before submission
 */
export function validateFranchiseInput(input: Partial<FranchiseFormInput>): string[] {
  const errors: string[] = [];

  if (!input.slug?.trim()) errors.push("Slug erforderlich");
  if (!input.title?.trim()) errors.push("Titel erforderlich");
  if (!input.subline?.trim()) errors.push("Subline erforderlich");
  if (!input.heroSourceTmdbId) errors.push("Hero TMDB-ID erforderlich");
  if (!input.motionLabel?.trim()) errors.push("Motion Label erforderlich");
  if (!input.accent?.match(/^#[0-9a-f]{6}$/i)) errors.push("Accent muss gültiges Hex-Farb-Format sein");
  if (!input.reviewScore || input.reviewScore < 0 || input.reviewScore > 10)
    errors.push("Review Score muss zwischen 0 und 10 liegen");
  if (!input.genres || input.genres.length < 1) errors.push("Mindestens 1 Genre erforderlich");
  if (!input.catalogEntries || input.catalogEntries.length < 1) errors.push("Mindestens 1 Katalog-Eintrag erforderlich");

  return errors;
}

/**
 * Color palette suggestions for theming
 */
export const colorPalettes = {
  scifi: {
    accent: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.38)",
    tone: "rgba(5, 150, 105, 0.16)",
    atmosphere: "rgba(6, 182, 212, 0.2)",
  },
  horror: {
    accent: "#6366f1",
    glow: "rgba(99, 102, 241, 0.38)",
    tone: "rgba(67, 56, 202, 0.18)",
    atmosphere: "rgba(99, 102, 241, 0.22)",
  },
  anime: {
    accent: "#fb923c",
    glow: "rgba(251, 146, 60, 0.42)",
    tone: "rgba(37, 99, 235, 0.2)",
    atmosphere: "rgba(251, 146, 60, 0.24)",
  },
  fantasy: {
    accent: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.42)",
    tone: "rgba(88, 28, 135, 0.18)",
    atmosphere: "rgba(167, 139, 250, 0.2)",
  },
  action: {
    accent: "#ef4444",
    glow: "rgba(239, 68, 68, 0.38)",
    tone: "rgba(127, 29, 29, 0.16)",
    atmosphere: "rgba(239, 68, 68, 0.2)",
  },
};

/**
 * Generate mist gradient based on accent color (helper for form)
 */
export function generateMistGradient(accentHex: string, accentName: string = "accent"): string {
  // Convert hex to rough rgba components
  // This is a heuristic; in production, use a proper color converter
  return `radial-gradient(circle at 14% 18%, rgba(124,58,237,0.24), transparent 48%), radial-gradient(circle at 88% 14%, rgba(${accentName},102,241,0.2), transparent 42%)`;
}
