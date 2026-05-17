import type { Metadata } from "next";

import { getCombinedCatalogItems } from "@/lib/catalog";
import {
  MobileCinematicLanding,
  type MobileCategorySection,
  type MobileFranchiseSection
} from "@/components/mobile/mobile-cinematic-landing";

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

  const categories: MobileCategorySection[] = collectionBlueprints.map((blueprint, idx) => {
    const curated = catalog
      .filter((item) => blueprint.genres.includes(item.genre.toLowerCase()))
      .slice(0, 12);

    const merged = [...curated, ...fallback].slice(0, 12);
    const heroImage = merged[0]?.poster || "/c/header.jpg";

    return {
      id: `category-${idx}`,
      title: blueprint.title,
      subtitle: blueprint.subtitle,
      accent: blueprint.accent,
      glow: blueprint.glow,
      heroImage,
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

  const franchiseBlueprints: Array<{
    id: string;
    title: string;
    subtitle: string;
    accent: string;
    terms: string[];
  }> = [
    {
      id: "franchise-8-show",
      title: "The 8 Show Franchise",
      subtitle: "Psychological game tension and social thriller dynamics",
      accent: "#ff4040",
      terms: ["8 show", "the 8 show"]
    },
    {
      id: "franchise-pyramid-game",
      title: "Pyramid Game Franchise",
      subtitle: "School hierarchy, survival pressure and dark strategy",
      accent: "#33d9ff",
      terms: ["pyramid game"]
    },
    {
      id: "franchise-mad-max",
      title: "Mad Max Franchise",
      subtitle: "Post-apocalyptic action icons and desert chaos",
      accent: "#ff9f1c",
      terms: ["mad max"]
    }
  ];

  const allItems = [...catalog].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const franchises: MobileFranchiseSection[] = franchiseBlueprints.reduce<MobileFranchiseSection[]>((acc, blueprint) => {
    const matched = allItems.filter((item) => {
      const title = item.title.toLowerCase();
      return blueprint.terms.some((term) => title.includes(term));
    });

    const covers = (matched.length ? matched : allItems).slice(0, 6);
    if (!covers.length) return acc;

    acc.push({
      id: blueprint.id,
      title: blueprint.title,
      subtitle: blueprint.subtitle,
      accent: blueprint.accent,
      heroImage: covers[0]?.poster || "/c/header.jpg",
      items: covers.map((item) => ({
        id: item.id,
        title: item.title,
        year: item.year,
        rating: item.rating,
        poster: item.poster || "/c/header.jpg",
        type: item.type === "series" ? "Serie" : "Film" as "Film" | "Serie"
      }))
    });

    return acc;
  }, []);

  return (
    <>
      <style>{`
        .site-navbar,
        .site-footer,
        .cinematic-side-reels {
          display: none !important;
        }
      `}</style>
      <MobileCinematicLanding categories={categories} franchises={franchises} />
    </>
  );
}
