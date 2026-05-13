import type { Metadata } from "next";

import { franchiseWorlds } from "@/data/franchise-worlds";
import {
  resolveMovieAssets,
  resolveCollectionAssets,
  resolveTvAssets,
  type TmdbAssets,
} from "@/lib/tmdb";
import { FranchisesExperience } from "@/components/franchises-experience";

export const metadata: Metadata = {
  title: "Franchises",
  description:
    "Immersive cineastische Reise durch ikonische Film- und Serien-Franchises mit Premium Collector Vibes.",
  alternates: { canonical: "/franchises" }
};

async function fetchWorldAssets(slug: string, tmdb: (typeof franchiseWorlds)[0]["tmdb"]): Promise<TmdbAssets> {
  switch (tmdb.strategy) {
    case "collection":
      return resolveCollectionAssets(tmdb.collectionId, tmdb.fallbackTitle);
    case "movie":
      return resolveMovieAssets(tmdb.title, undefined, tmdb.tmdbId);
    case "tv":
      return resolveTvAssets(tmdb.title, undefined, tmdb.tmdbId);
    case "search":
      return tmdb.type === "tv"
        ? resolveTvAssets(tmdb.title, tmdb.year)
        : resolveMovieAssets(tmdb.title, tmdb.year);
  }
}

export default async function FranchisesPage() {
  // Fetch all franchise assets in parallel on the server
  const settled = await Promise.allSettled(
    franchiseWorlds.map((w) => fetchWorldAssets(w.slug, w.tmdb))
  );

  const assetsMap: Record<string, TmdbAssets> = {};
  franchiseWorlds.forEach((w, i) => {
    const result = settled[i];
    assetsMap[w.slug] =
      result?.status === "fulfilled"
        ? result.value
        : { posterUrl: null, backdropUrl: null, logoUrl: null };
  });

  return <FranchisesExperience assetsMap={assetsMap} />;
}
