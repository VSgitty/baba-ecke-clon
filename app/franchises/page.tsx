import type { Metadata } from "next";

import { franchiseWorlds } from "@/data/franchise-worlds";
import {
  resolveMovieAssets,
  resolveCollectionAssets,
  resolveTvAssets,
  type TmdbAssets,
} from "@/lib/tmdb";
import { FranchisesExperience } from "@/components/franchises-experience";

type FranchiseSectionAssets = {
  hero: TmdbAssets;
  catalog: TmdbAssets[];
};

export const metadata: Metadata = {
  title: "Franchises",
  description:
    "Immersive cineastische Reise durch ikonische Film- und Serien-Franchises mit Premium Collector Vibes.",
  alternates: { canonical: "/franchises" }
};

async function fetchWorldAssets(tmdb: (typeof franchiseWorlds)[0]["tmdb"]): Promise<TmdbAssets> {
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

async function fetchCatalogEntryAssets(entry: (typeof franchiseWorlds)[0]["catalog"][number]): Promise<TmdbAssets> {
  const title = entry.searchTitle ?? entry.title;
  if (entry.type === "Serie") {
    return resolveTvAssets(title, entry.year);
  }
  return resolveMovieAssets(title, entry.year);
}

async function fetchHeroSourceAssets(world: (typeof franchiseWorlds)[0]): Promise<TmdbAssets> {
  const source = world.heroSource;
  if (source.type === "tv") {
    return resolveTvAssets(source.title, source.year, source.tmdbId);
  }
  return resolveMovieAssets(source.title, source.year, source.tmdbId);
}

export default async function FranchisesPage() {
  const worldSettled = await Promise.allSettled(
    franchiseWorlds.map(async (world) => {
      const [heroBase, catalogSettled] = await Promise.all([
        fetchHeroSourceAssets(world),
        Promise.allSettled(world.catalog.map((entry) => fetchCatalogEntryAssets(entry))),
      ]);

      const catalogAssets = catalogSettled.map((result) =>
        result.status === "fulfilled"
          ? result.value
          : { posterUrl: null, backdropUrl: null, logoUrl: null }
      );

      const lead = catalogAssets[0] ?? { posterUrl: null, backdropUrl: null, logoUrl: null };
      const hero: TmdbAssets = {
        posterUrl: lead.posterUrl ?? heroBase.posterUrl,
        backdropUrl: lead.backdropUrl ?? heroBase.backdropUrl,
        logoUrl: heroBase.logoUrl ?? lead.logoUrl,
      };

      return { slug: world.slug, assets: { hero, catalog: catalogAssets } satisfies FranchiseSectionAssets };
    })
  );

  const assetsMap: Record<string, FranchiseSectionAssets> = {};
  worldSettled.forEach((result, index) => {
    const slug = franchiseWorlds[index]?.slug;
    if (!slug) return;

    assetsMap[slug] =
      result.status === "fulfilled"
        ? result.value.assets
        : {
            hero: { posterUrl: null, backdropUrl: null, logoUrl: null },
            catalog: franchiseWorlds[index].catalog.map(() => ({ posterUrl: null, backdropUrl: null, logoUrl: null }))
          };
  });

  return <FranchisesExperience assetsMap={assetsMap} />;
}
