import type { Metadata } from "next";

import { getCombinedCatalogItems } from "@/lib/catalog";
import { MobileCinematicLanding, type MobileCollection } from "@/components/mobile/mobile-cinematic-landing";

const collectionBlueprints: Array<{
  title: string;
  subtitle: string;
  accent: string;
  glow: string;
  genres: string[];
}> = [
  {
    title: "Hollywood Blockbuster",
    subtitle: "Massive setpieces, prestige franchises, maximum impact",
    accent: "#ff4040",
    glow: "rgba(255, 64, 64, 0.35)",
    genres: ["action", "adventure", "drama"]
  },
  {
    title: "Retro Action",
    subtitle: "Neon nights, synth tension, analog velocity",
    accent: "#ff7a18",
    glow: "rgba(255, 122, 24, 0.33)",
    genres: ["action", "thriller", "crime"]
  },
  {
    title: "Sci-Fi Classics",
    subtitle: "Future nostalgia and galactic atmospheres",
    accent: "#33d9ff",
    glow: "rgba(51, 217, 255, 0.32)",
    genres: ["sci-fi", "science fiction", "mystery"]
  },
  {
    title: "Horror Vault",
    subtitle: "Dark corridors, heartbeat pacing, unknown shadows",
    accent: "#ff2d55",
    glow: "rgba(255, 45, 85, 0.33)",
    genres: ["horror", "thriller", "mystery"]
  },
  {
    title: "VHS Collection",
    subtitle: "Tape grain legends and cult late-night sessions",
    accent: "#a964ff",
    glow: "rgba(169, 100, 255, 0.33)",
    genres: ["drama", "crime", "comedy"]
  },
  {
    title: "Cult Cinema",
    subtitle: "Beloved oddities with iconic scenes",
    accent: "#76ff4b",
    glow: "rgba(118, 255, 75, 0.29)",
    genres: ["mystery", "fantasy", "thriller"]
  },
  {
    title: "Arcade Legends",
    subtitle: "Game-inspired universes and electric momentum",
    accent: "#00ffd0",
    glow: "rgba(0, 255, 208, 0.32)",
    genres: ["animation", "adventure", "action"]
  }
];

export const metadata: Metadata = {
  title: "Baba Ecke Mobile Experience",
  description:
    "Immersive mobile landing experience inspired by futuristic streaming worlds and retro cinema culture.",
  alternates: {
    canonical: "/m"
  }
};

export default async function MobileLandingPage() {
  const catalog = await getCombinedCatalogItems(220);
  const fallback = catalog.slice(0, 30);

  const collections: MobileCollection[] = collectionBlueprints.map((blueprint, idx) => {
    const curated = catalog
      .filter((item) => blueprint.genres.includes(item.genre.toLowerCase()))
      .slice(0, 12);

    const merged = [...curated, ...fallback].slice(0, 12);

    return {
      id: `collection-${idx}`,
      title: blueprint.title,
      subtitle: blueprint.subtitle,
      accent: blueprint.accent,
      glow: blueprint.glow,
      items: merged.map((item) => ({
        id: item.id,
        title: item.title,
        year: item.year,
        rating: item.rating,
        poster: item.poster || "/c/header.jpg",
        type: item.type === "series" ? "Serie" : "Film"
      }))
    };
  });

  return (
    <>
      <style>{`
        .site-navbar,
        .site-footer,
        .cinematic-side-reels {
          display: none !important;
        }
      `}</style>
      <MobileCinematicLanding collections={collections} />
    </>
  );
}
