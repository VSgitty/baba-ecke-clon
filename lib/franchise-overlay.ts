import type { CatalogItem } from "@/lib/catalog";

type OverlayTheme = "anime" | "horror" | "scifi" | "fantasy" | "action";

export type FranchiseOverlay = {
  theme: OverlayTheme;
  label: string;
  asset: string;
  glowClass: string;
};

const THEME_ASSET: Record<OverlayTheme, string> = {
  anime: "/c/franchise/anime.svg",
  horror: "/c/franchise/horror.svg",
  scifi: "/c/franchise/scifi.svg",
  fantasy: "/c/franchise/fantasy.svg",
  action: "/c/franchise/action.svg"
};

const THEME_GLOW: Record<OverlayTheme, string> = {
  anime: "franchise-glow-anime",
  horror: "franchise-glow-horror",
  scifi: "franchise-glow-scifi",
  fantasy: "franchise-glow-fantasy",
  action: "franchise-glow-action"
};

function pickTheme(item: CatalogItem): OverlayTheme {
  const title = item.title.toLowerCase();
  const genre = item.genre.toLowerCase();

  if (title.includes("anime") || title.includes("dangan") || genre.includes("anime")) return "anime";
  if (title.includes("horror") || title.includes("saw") || title.includes("scream") || genre.includes("horror")) return "horror";
  if (title.includes("star") || title.includes("alien") || title.includes("interstellar") || genre.includes("sci")) return "scifi";
  if (title.includes("lord") || title.includes("witch") || title.includes("dragon") || genre.includes("fantasy")) return "fantasy";
  return "action";
}

function shortLabel(title: string): string {
  const cleaned = title.replace(/[^a-zA-Z0-9\s]/g, " ").trim();
  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, 2);
  if (words.length === 0) return "COLLECTOR";
  return words.join(" ").toUpperCase();
}

export function getFranchiseOverlay(item: CatalogItem): FranchiseOverlay {
  const theme = pickTheme(item);
  return {
    theme,
    label: shortLabel(item.title),
    asset: THEME_ASSET[theme],
    glowClass: THEME_GLOW[theme]
  };
}
