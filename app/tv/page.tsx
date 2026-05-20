import type { Metadata } from "next";

import { getEnrichedCatalogItems } from "@/lib/catalog";
import {
  TvCinematicHome,
  type TvHeroItem,
  type TvShelf,
} from "@/components/tv/tv-cinematic-home";

export const metadata: Metadata = {
  title: "TV Experience",
  description: "Eigenstaendige TV-Startseite fuer grosse Screens mit cineastischem Cover-Loop und kuratierten Reihen.",
  alternates: {
    canonical: "/tv"
  }
};

const shelfBlueprints: Array<{
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  genres: string[];
}> = [
  {
    id: "spotlight",
    title: "Prime Spotlight",
    subtitle: "Breite Wirkung, starke Bilder, direkt fuer den ersten Screen.",
    accent: "#ff6a3d",
    genres: ["thriller", "action", "drama"]
  },
  {
    id: "after-dark",
    title: "After Dark",
    subtitle: "Horror, Mystery und psychologische Spannung fuer den Nachtmodus.",
    accent: "#ff3f81",
    genres: ["horror", "mystery", "thriller"]
  },
  {
    id: "neon-worlds",
    title: "Neon Worlds",
    subtitle: "Sci-Fi, Anime und stilisierte Serienwelten fuer grosse Panels.",
    accent: "#35e0ff",
    genres: ["sci-fi", "animation", "fantasy"]
  },
  {
    id: "binge-lane",
    title: "Binge Lane",
    subtitle: "Serien mit Sogwirkung, gebaut fuer lange Sessions.",
    accent: "#8fff65",
    genres: ["drama", "crime", "mystery"]
  }
];

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export default async function TvPage() {
  const catalog = await getEnrichedCatalogItems(240, 180, {
    overwriteExistingPosters: true,
  });

  const rated = [...catalog].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const heroItems: TvHeroItem[] = uniqueById(rated)
    .filter((item) => item.poster)
    .slice(0, 16)
    .map((item) => ({
      id: item.id,
      title: item.title,
      year: item.year,
      rating: item.rating,
      poster: item.poster || "/c/header.jpg",
      type: item.type === "series" ? "Serie" : "Film",
      genre: item.genre,
      description: item.description || "Kuratiert fuer den grossen Screen mit Fokus auf starke Cover und klare Wirkung.",
    }));

  const fallbackItems = heroItems.slice(0, 12);

  const shelves: TvShelf[] = shelfBlueprints.map((blueprint) => {
    const curated = catalog.filter((item) => blueprint.genres.includes(item.genre.toLowerCase()));
    const merged = uniqueById([...curated, ...rated]).filter((item) => item.poster).slice(0, 20);

    return {
      id: blueprint.id,
      title: blueprint.title,
      subtitle: blueprint.subtitle,
      accent: blueprint.accent,
      items: merged.map((item) => ({
        id: item.id,
        title: item.title,
        year: item.year,
        rating: item.rating,
        poster: item.poster || "/c/header.jpg",
        type: item.type === "series" ? "Serie" : "Film",
        genre: item.genre,
      }))
    };
  });

  const backgroundItems = uniqueById([...heroItems, ...fallbackItems]).slice(0, 18);

  return (
    <>
      <style>{`
        .site-navbar,
        .site-footer,
        .cinematic-side-reels {
          display: none !important;
        }
      `}</style>
      <TvCinematicHome heroItems={heroItems} shelves={shelves} backgroundItems={backgroundItems} />
    </>
  );
}