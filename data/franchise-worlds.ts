/**
 * Franchise world definitions.
 * Contains both visual theming (used client-side) and TMDB search config (used server-side).
 * Safe to import from both server and client modules — no server-only code here.
 */

export type FranchiseTmdbConfig =
  | { strategy: "collection"; collectionId: number; fallbackTitle: string }
  | { strategy: "movie"; tmdbId: number; title: string }
  | { strategy: "tv"; tmdbId: number; title: string }
  | { strategy: "search"; title: string; type: "movie" | "tv"; year?: number };

export type FranchiseWorldDef = {
  slug: string;
  title: string;
  subline: string;
  /** Primary TMDB lookup config */
  tmdb: FranchiseTmdbConfig;
  /** Fallback local bg image if TMDB unavailable */
  bgFallback: string;
  /** Motion description shown in the UI */
  motionLabel: string;
  /** Accent colour for glows, badges, etc. */
  accent: string;
  /** Glow rgba string */
  glow: string;
  /** CSS radial gradient for the ambient haze layer */
  mist: string;
  /** CSS rgba string for the section background tone */
  tone: string;
  /** CSS rgba string for the radial atmosphere layer */
  atmosphere: string;
  /** Individual catalog entries */
  catalog: { title: string; year: number; type: "Film" | "Serie"; searchTitle?: string }[];
};

export const franchiseWorlds: FranchiseWorldDef[] = [
  {
    slug: "john-wick",
    title: "John Wick",
    subline: "Neon Rain Archive",
    tmdb: { strategy: "collection", collectionId: 404609, fallbackTitle: "John Wick" },
    bgFallback: "/c/header.jpg",
    motionLabel: "Rain, shell glare, city pulse",
    accent: "#f97316",
    glow: "rgba(249, 115, 22, 0.42)",
    mist: "radial-gradient(circle at 14% 18%, rgba(225,29,72,0.26), transparent 48%), radial-gradient(circle at 88% 12%, rgba(59,130,246,0.2), transparent 42%)",
    tone: "rgba(124, 58, 237, 0.18)",
    atmosphere: "rgba(225, 29, 72, 0.24)",
    catalog: [
      { title: "Chapter 1", year: 2014, type: "Film", searchTitle: "John Wick" },
      { title: "Chapter 2", year: 2017, type: "Film", searchTitle: "John Wick: Chapter 2" },
      { title: "Chapter 3", year: 2019, type: "Film", searchTitle: "John Wick: Chapter 3 - Parabellum" },
      { title: "Chapter 4", year: 2023, type: "Film", searchTitle: "John Wick: Chapter 4" }
    ]
  },
  {
    slug: "harry-potter",
    title: "Harry Potter",
    subline: "Wizarding Vault",
    tmdb: { strategy: "collection", collectionId: 1241, fallbackTitle: "Harry Potter" },
    bgFallback: "/c/lost-wallpaper.png",
    motionLabel: "Fog, sparks, magical streaks",
    accent: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.4)",
    mist: "radial-gradient(circle at 18% 20%, rgba(147,197,253,0.25), transparent 44%), radial-gradient(circle at 84% 12%, rgba(250,204,21,0.2), transparent 40%)",
    tone: "rgba(30, 64, 175, 0.2)",
    atmosphere: "rgba(245, 158, 11, 0.2)",
    catalog: [
      { title: "Stein der Weisen", year: 2001, type: "Film", searchTitle: "Harry Potter and the Philosopher's Stone" },
      { title: "Kammer des Schreckens", year: 2002, type: "Film", searchTitle: "Harry Potter and the Chamber of Secrets" },
      { title: "Gefangener von Askaban", year: 2004, type: "Film", searchTitle: "Harry Potter and the Prisoner of Azkaban" },
      { title: "Feuerkelch", year: 2005, type: "Film", searchTitle: "Harry Potter and the Goblet of Fire" }
    ]
  },
  {
    slug: "star-wars",
    title: "Star Wars",
    subline: "Galactic Chronicle Deck",
    tmdb: { strategy: "collection", collectionId: 10, fallbackTitle: "Star Wars" },
    bgFallback: "/c/header.jpg",
    motionLabel: "Stars, warp lines, holo grid",
    accent: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.38)",
    mist: "radial-gradient(circle at 8% 8%, rgba(56,189,248,0.24), transparent 44%), radial-gradient(circle at 86% 18%, rgba(14,165,233,0.22), transparent 42%)",
    tone: "rgba(6, 182, 212, 0.18)",
    atmosphere: "rgba(56, 189, 248, 0.24)",
    catalog: [
      { title: "A New Hope", year: 1977, type: "Film", searchTitle: "Star Wars" },
      { title: "The Empire Strikes Back", year: 1980, type: "Film", searchTitle: "Star Wars: Episode V - The Empire Strikes Back" },
      { title: "The Clone Wars", year: 2008, type: "Serie", searchTitle: "Star Wars: The Clone Wars" },
      { title: "The Mandalorian", year: 2019, type: "Serie", searchTitle: "The Mandalorian" }
    ]
  },
  {
    slug: "horror-archive",
    title: "Saw + Alien",
    subline: "Horror Evidence Room",
    tmdb: { strategy: "movie", tmdbId: 176, title: "Saw" },
    bgFallback: "/c/lost-wallpaper.png",
    motionLabel: "Glitch grain, shadows, pulse flicker",
    accent: "#ef4444",
    glow: "rgba(239, 68, 68, 0.35)",
    mist: "radial-gradient(circle at 16% 22%, rgba(239,68,68,0.2), transparent 44%), radial-gradient(circle at 88% 18%, rgba(34,197,94,0.14), transparent 38%)",
    tone: "rgba(153, 27, 27, 0.2)",
    atmosphere: "rgba(5, 150, 105, 0.2)",
    catalog: [
      { title: "Saw", year: 2004, type: "Film", searchTitle: "Saw" },
      { title: "Saw II", year: 2005, type: "Film", searchTitle: "Saw II" },
      { title: "Alien", year: 1979, type: "Film", searchTitle: "Alien" },
      { title: "Alien: Romulus", year: 2024, type: "Film", searchTitle: "Alien: Romulus" }
    ]
  },
  {
    slug: "anime-sea",
    title: "Naruto + One Piece",
    subline: "Shonen Collector Dock",
    tmdb: { strategy: "tv", tmdbId: 46260, title: "Naruto" },
    bgFallback: "/c/header.jpg",
    motionLabel: "Ink trails, speed lines, drifting embers",
    accent: "#fb923c",
    glow: "rgba(251, 146, 60, 0.42)",
    mist: "radial-gradient(circle at 12% 16%, rgba(59,130,246,0.24), transparent 48%), radial-gradient(circle at 88% 14%, rgba(251,146,60,0.22), transparent 42%)",
    tone: "rgba(37, 99, 235, 0.2)",
    atmosphere: "rgba(251, 146, 60, 0.24)",
    catalog: [
      { title: "Naruto", year: 2002, type: "Serie", searchTitle: "Naruto" },
      { title: "Naruto Shippuden", year: 2007, type: "Serie", searchTitle: "Naruto: Shippuden" },
      { title: "One Piece", year: 1999, type: "Serie", searchTitle: "One Piece" },
      { title: "One Piece Live Action", year: 2023, type: "Serie", searchTitle: "ONE PIECE" }
    ]
  }
];
