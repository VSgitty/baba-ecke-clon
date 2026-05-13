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
  heroSource: { type: "movie" | "tv"; tmdbId: number; title: string; year?: number };
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
  /** Showcase metadata for hero panel */
  reviewScore: number;
  genres: string[];
  releaseLabel: string;
  /** Individual catalog entries */
  catalog: { title: string; year: number; type: "Film" | "Serie"; searchTitle?: string }[];
};

export const franchiseWorlds: FranchiseWorldDef[] = [
  {
    slug: "john-wick",
    title: "John Wick",
    subline: "Neon Rain Archive",
    heroSource: { type: "movie", tmdbId: 245891, title: "John Wick", year: 2014 },
    tmdb: { strategy: "collection", collectionId: 404609, fallbackTitle: "John Wick" },
    bgFallback: "/c/header.jpg",
    motionLabel: "Rain, shell glare, city pulse",
    accent: "#f97316",
    glow: "rgba(249, 115, 22, 0.42)",
    mist: "radial-gradient(circle at 14% 18%, rgba(225,29,72,0.26), transparent 48%), radial-gradient(circle at 88% 12%, rgba(59,130,246,0.2), transparent 42%)",
    tone: "rgba(124, 58, 237, 0.18)",
    atmosphere: "rgba(225, 29, 72, 0.24)",
    reviewScore: 8.7,
    genres: ["Action", "Neo-Noir", "Crime"],
    releaseLabel: "2014 - 2023",
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
    heroSource: { type: "movie", tmdbId: 671, title: "Harry Potter and the Philosopher's Stone", year: 2001 },
    tmdb: { strategy: "collection", collectionId: 1241, fallbackTitle: "Harry Potter" },
    bgFallback: "/c/lost-wallpaper.png",
    motionLabel: "Fog, sparks, magical streaks",
    accent: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.4)",
    mist: "radial-gradient(circle at 18% 20%, rgba(147,197,253,0.25), transparent 44%), radial-gradient(circle at 84% 12%, rgba(250,204,21,0.2), transparent 40%)",
    tone: "rgba(30, 64, 175, 0.2)",
    atmosphere: "rgba(245, 158, 11, 0.2)",
    reviewScore: 8.4,
    genres: ["Fantasy", "Adventure", "Mystery"],
    releaseLabel: "2001 - 2011",
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
    heroSource: { type: "movie", tmdbId: 11, title: "Star Wars", year: 1977 },
    tmdb: { strategy: "collection", collectionId: 10, fallbackTitle: "Star Wars" },
    bgFallback: "/c/header.jpg",
    motionLabel: "Stars, warp lines, holo grid",
    accent: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.38)",
    mist: "radial-gradient(circle at 8% 8%, rgba(56,189,248,0.24), transparent 44%), radial-gradient(circle at 86% 18%, rgba(14,165,233,0.22), transparent 42%)",
    tone: "rgba(6, 182, 212, 0.18)",
    atmosphere: "rgba(56, 189, 248, 0.24)",
    reviewScore: 8.9,
    genres: ["Sci-Fi", "Adventure", "Space Opera"],
    releaseLabel: "1977 - heute",
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
    heroSource: { type: "movie", tmdbId: 348, title: "Alien", year: 1979 },
    tmdb: { strategy: "movie", tmdbId: 176, title: "Saw" },
    bgFallback: "/c/lost-wallpaper.png",
    motionLabel: "Glitch grain, shadows, pulse flicker",
    accent: "#ef4444",
    glow: "rgba(239, 68, 68, 0.35)",
    mist: "radial-gradient(circle at 16% 22%, rgba(239,68,68,0.2), transparent 44%), radial-gradient(circle at 88% 18%, rgba(34,197,94,0.14), transparent 38%)",
    tone: "rgba(153, 27, 27, 0.2)",
    atmosphere: "rgba(5, 150, 105, 0.2)",
    reviewScore: 8.1,
    genres: ["Horror", "Thriller", "Sci-Fi"],
    releaseLabel: "1979 - 2024",
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
    heroSource: { type: "tv", tmdbId: 37854, title: "One Piece", year: 1999 },
    tmdb: { strategy: "tv", tmdbId: 46260, title: "Naruto" },
    bgFallback: "/c/header.jpg",
    motionLabel: "Ink trails, speed lines, drifting embers",
    accent: "#fb923c",
    glow: "rgba(251, 146, 60, 0.42)",
    mist: "radial-gradient(circle at 12% 16%, rgba(59,130,246,0.24), transparent 48%), radial-gradient(circle at 88% 14%, rgba(251,146,60,0.22), transparent 42%)",
    tone: "rgba(37, 99, 235, 0.2)",
    atmosphere: "rgba(251, 146, 60, 0.24)",
    reviewScore: 8.8,
    genres: ["Anime", "Adventure", "Shonen"],
    releaseLabel: "1999 - heute",
    catalog: [
      { title: "Naruto", year: 2002, type: "Serie", searchTitle: "Naruto" },
      { title: "Naruto Shippuden", year: 2007, type: "Serie", searchTitle: "Naruto: Shippuden" },
      { title: "One Piece", year: 1999, type: "Serie", searchTitle: "One Piece" },
      { title: "One Piece Live Action", year: 2023, type: "Serie", searchTitle: "ONE PIECE" }
    ]
  },
  {
    slug: "back-to-the-future",
    title: "Back to the Future",
    subline: "Temporal Adventure Vault",
    heroSource: { type: "movie", tmdbId: 105, title: "Back to the Future", year: 1985 },
    tmdb: { strategy: "collection", collectionId: 9738, fallbackTitle: "Back to the Future" },
    bgFallback: "/c/header.jpg",
    motionLabel: "Time flux, neon circuits, flux capacitor hum",
    accent: "#ec4899",
    glow: "rgba(236, 72, 153, 0.42)",
    mist: "radial-gradient(circle at 18% 20%, rgba(147,197,253,0.22), transparent 48%), radial-gradient(circle at 82% 16%, rgba(236,72,153,0.2), transparent 44%)",
    tone: "rgba(126, 34, 206, 0.18)",
    atmosphere: "rgba(236, 72, 153, 0.2)",
    reviewScore: 8.5,
    genres: ["Sci-Fi", "Adventure", "Comedy"],
    releaseLabel: "1985 - 1990",
    catalog: [
      { title: "Back to the Future", year: 1985, type: "Film", searchTitle: "Back to the Future" },
      { title: "Back to the Future Part II", year: 1989, type: "Film", searchTitle: "Back to the Future Part II" },
      { title: "Back to the Future Part III", year: 1990, type: "Film", searchTitle: "Back to the Future Part III" },
      { title: "Back to the Future: The Game", year: 2010, type: "Film", searchTitle: "Back to the Future The Game" }
    ]
  },
  {
    slug: "final-destination",
    title: "Final Destination",
    subline: "Death Prediction Archive",
    heroSource: { type: "movie", tmdbId: 14468, title: "Final Destination", year: 2000 },
    tmdb: { strategy: "collection", collectionId: 8864, fallbackTitle: "Final Destination" },
    bgFallback: "/c/lost-wallpaper.png",
    motionLabel: "Eerie whispers, chain reactions, dark fate",
    accent: "#6366f1",
    glow: "rgba(99, 102, 241, 0.38)",
    mist: "radial-gradient(circle at 14% 18%, rgba(124,58,237,0.24), transparent 44%), radial-gradient(circle at 88% 20%, rgba(99,102,241,0.2), transparent 42%)",
    tone: "rgba(67, 56, 202, 0.18)",
    atmosphere: "rgba(99, 102, 241, 0.22)",
    reviewScore: 7.8,
    genres: ["Horror", "Thriller", "Supernatural"],
    releaseLabel: "2000 - 2011",
    catalog: [
      { title: "Final Destination", year: 2000, type: "Film", searchTitle: "Final Destination" },
      { title: "Final Destination 2", year: 2003, type: "Film", searchTitle: "Final Destination 2" },
      { title: "Final Destination 3", year: 2006, type: "Film", searchTitle: "Final Destination 3" },
      { title: "The Final Destination", year: 2009, type: "Film", searchTitle: "The Final Destination" }
    ]
  },
  {
    slug: "cube",
    title: "Cube",
    subline: "Geometric Maze Archive",
    heroSource: { type: "movie", tmdbId: 697, title: "Cube", year: 1997 },
    tmdb: { strategy: "collection", collectionId: 14320, fallbackTitle: "Cube" },
    bgFallback: "/c/header.jpg",
    motionLabel: "Shifting grids, mathematical terror, geometry hum",
    accent: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.38)",
    mist: "radial-gradient(circle at 12% 22%, rgba(34,197,94,0.22), transparent 48%), radial-gradient(circle at 86% 14%, rgba(6,182,212,0.24), transparent 42%)",
    tone: "rgba(5, 150, 105, 0.16)",
    atmosphere: "rgba(6, 182, 212, 0.2)",
    reviewScore: 7.9,
    genres: ["Sci-Fi", "Thriller", "Mystery"],
    releaseLabel: "1997 - 2002",
    catalog: [
      { title: "Cube", year: 1997, type: "Film", searchTitle: "Cube" },
      { title: "Cube 2: Hypercube", year: 2002, type: "Film", searchTitle: "Cube 2 Hypercube" },
      { title: "Cube Zero", year: 2004, type: "Film", searchTitle: "Cube Zero" },
      { title: "Cube (Remake)", year: 2024, type: "Film", searchTitle: "Cube" }
    ]
  },
  {
    slug: "danganronpa",
    title: "Danganronpa",
    subline: "Despair Academy Vault",
    heroSource: { type: "tv", tmdbId: 52722, title: "Danganronpa: The Animation", year: 2013 },
    tmdb: { strategy: "tv", tmdbId: 52722, title: "Danganronpa: The Animation" },
    bgFallback: "/c/lost-wallpaper.png",
    motionLabel: "Red glitches, psycho pop, twisted hope",
    accent: "#f43f5e",
    glow: "rgba(244, 63, 94, 0.42)",
    mist: "radial-gradient(circle at 16% 18%, rgba(229,57,57,0.24), transparent 48%), radial-gradient(circle at 84% 14%, rgba(244,63,94,0.22), transparent 44%)",
    tone: "rgba(190, 24, 93, 0.18)",
    atmosphere: "rgba(244, 63, 94, 0.24)",
    reviewScore: 8.2,
    genres: ["Anime", "Mystery", "Psychological"],
    releaseLabel: "2013 - 2020",
    catalog: [
      { title: "Danganronpa", year: 2013, type: "Serie", searchTitle: "Danganronpa The Animation" },
      { title: "Danganronpa 2", year: 2014, type: "Serie", searchTitle: "Super Danganronpa 2" },
      { title: "Danganronpa 3", year: 2016, type: "Serie", searchTitle: "Danganronpa 3 The End of Hope's Peak High School" },
      { title: "Danganronpa V3", year: 2017, type: "Serie", searchTitle: "New Danganronpa V3" }
    ]
  },
  {
    slug: "death-note",
    title: "Death Note",
    subline: "Supernatural Justice Archive",
    heroSource: { type: "tv", tmdbId: 38165, title: "Death Note", year: 2006 },
    tmdb: { strategy: "tv", tmdbId: 38165, title: "Death Note" },
    bgFallback: "/c/header.jpg",
    motionLabel: "Black pages flutter, divine judgment, noir whispers",
    accent: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.4)",
    mist: "radial-gradient(circle at 18% 20%, rgba(209,213,219,0.2), transparent 44%), radial-gradient(circle at 82% 16%, rgba(251,191,36,0.22), transparent 42%)",
    tone: "rgba(31, 41, 55, 0.18)",
    atmosphere: "rgba(251, 191, 36, 0.18)",
    reviewScore: 8.6,
    genres: ["Anime", "Thriller", "Psychological"],
    releaseLabel: "2006 - 2017",
    catalog: [
      { title: "Death Note", year: 2006, type: "Serie", searchTitle: "Death Note" },
      { title: "Death Note: L Change the World", year: 2008, type: "Film", searchTitle: "Death Note L Change the World" },
      { title: "Death Note (Live Action)", year: 2006, type: "Film", searchTitle: "Death Note" },
      { title: "Death Note New Generation", year: 2016, type: "Film", searchTitle: "Death Note New Generation" }
    ]
  },
  {
    slug: "arcane",
    title: "Arcane",
    subline: "League of Legends Universe",
    heroSource: { type: "tv", tmdbId: 94605, title: "Arcane", year: 2021 },
    tmdb: { strategy: "tv", tmdbId: 94605, title: "Arcane" },
    bgFallback: "/c/header.jpg",
    motionLabel: "Powder smoke, shimmer magic, steel rebellion",
    accent: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.42)",
    mist: "radial-gradient(circle at 14% 18%, rgba(139,92,246,0.24), transparent 48%), radial-gradient(circle at 86% 16%, rgba(167,139,250,0.22), transparent 42%)",
    tone: "rgba(88, 28, 135, 0.18)",
    atmosphere: "rgba(167, 139, 250, 0.2)",
    reviewScore: 9.0,
    genres: ["Anime", "Action", "Fantasy"],
    releaseLabel: "2021 - 2025",
    catalog: [
      { title: "Arcane Season 1", year: 2021, type: "Serie", searchTitle: "Arcane" },
      { title: "Arcane Season 2", year: 2024, type: "Serie", searchTitle: "Arcane" },
      { title: "Arcane: Bridging the Rift", year: 2022, type: "Film", searchTitle: "Arcane Bridging the Rift" },
      { title: "League of Legends: Origins", year: 2020, type: "Film", searchTitle: "League of Legends" }
    ]
  },
  {
    slug: "tokyo-ghoul",
    title: "Tokyo Ghoul",
    subline: "Urban Horror Sanctuary",
    heroSource: { type: "tv", tmdbId: 37412, title: "Tokyo Ghoul", year: 2014 },
    tmdb: { strategy: "tv", tmdbId: 37412, title: "Tokyo Ghoul" },
    bgFallback: "/c/lost-wallpaper.png",
    motionLabel: "Red eyes gleam, kagune slashes, neon midnight",
    accent: "#ef4444",
    glow: "rgba(239, 68, 68, 0.38)",
    mist: "radial-gradient(circle at 16% 20%, rgba(239,68,68,0.22), transparent 44%), radial-gradient(circle at 84% 14%, rgba(236,72,153,0.2), transparent 42%)",
    tone: "rgba(127, 29, 29, 0.16)",
    atmosphere: "rgba(239, 68, 68, 0.2)",
    reviewScore: 8.3,
    genres: ["Anime", "Horror", "Dark Fantasy"],
    releaseLabel: "2014 - 2018",
    catalog: [
      { title: "Tokyo Ghoul", year: 2014, type: "Serie", searchTitle: "Tokyo Ghoul" },
      { title: "Tokyo Ghoul √A", year: 2015, type: "Serie", searchTitle: "Tokyo Ghoul" },
      { title: "Tokyo Ghoul:re", year: 2018, type: "Serie", searchTitle: "Tokyo Ghoul re" },
      { title: "Tokyo Ghoul Live Action", year: 2017, type: "Film", searchTitle: "Tokyo Ghoul S" }
    ]
  },
  {
    slug: "god-eater",
    title: "God Eater",
    subline: "Apocalypse Combat Archive",
    heroSource: { type: "tv", tmdbId: 52857, title: "God Eater", year: 2015 },
    tmdb: { strategy: "tv", tmdbId: 52857, title: "God Eater" },
    bgFallback: "/c/header.jpg",
    motionLabel: "Devour roars, blade clashes, apocalyptic sky",
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.4)",
    mist: "radial-gradient(circle at 14% 16%, rgba(217,119,6,0.24), transparent 48%), radial-gradient(circle at 86% 14%, rgba(245,158,11,0.22), transparent 42%)",
    tone: "rgba(120, 53, 15, 0.16)",
    atmosphere: "rgba(245, 158, 11, 0.2)",
    reviewScore: 7.9,
    genres: ["Anime", "Action", "Sci-Fi"],
    releaseLabel: "2015 - 2020",
    catalog: [
      { title: "God Eater", year: 2015, type: "Serie", searchTitle: "God Eater" },
      { title: "God Eater 2", year: 2015, type: "Serie", searchTitle: "God Eater 2" },
      { title: "God Eater Resurrection", year: 2016, type: "Film", searchTitle: "God Eater Resurrection" },
      { title: "God Eater Movie", year: 2020, type: "Film", searchTitle: "God Eater" }
    ]
  }
];
