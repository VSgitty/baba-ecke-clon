import Script from "next/script";
import { readFile } from "fs/promises";
import path from "path";

import { getEnrichedCatalogItems } from "@/lib/catalog";
import { franchiseWorlds, type FranchiseWorldDef } from "@/data/franchise-worlds";
import { resolveMovieAssets, resolveTvAssets } from "@/lib/tmdb";
import { HeroSection } from "@/components/hero-section";
import { FranchiseLogoSlider } from "@/components/franchise-logo-slider";
import { CineTicker } from "@/components/cine-ticker";
import { CatalogSectionsGrid } from "@/components/catalog-sections-grid";
import { FeatureGrid } from "@/components/feature-grid";
import { CineDashboard } from "@/components/cine-dashboard";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FaqSection } from "@/components/faq-section";
import { CtaBanner } from "@/components/cta-banner";

async function loadCustomFranchises(): Promise<FranchiseWorldDef[]> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "franchises-custom.json");
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function resolveFranchiseHeroLogo(world: FranchiseWorldDef): Promise<string | null> {
  const source = world.heroSource;
  const assets = source.type === "tv"
    ? await resolveTvAssets(source.title, source.year, source.tmdbId)
    : await resolveMovieAssets(source.title, source.year, source.tmdbId);

  return assets.logoUrl;
}

export default async function HomePage() {
  const catalog = await getEnrichedCatalogItems(140);
  const customFranchises = await loadCustomFranchises();
  const worlds = [...franchiseWorlds, ...customFranchises].slice(0, 18);

  const logoSettled = await Promise.allSettled(
    worlds.map(async (world) => {
      const logoUrl = await resolveFranchiseHeroLogo(world);
      return {
        slug: world.slug,
        title: world.title,
        logoUrl,
        accent: world.accent,
      };
    })
  );

  const franchiseLogoItems = logoSettled
    .map((result) => (result.status === "fulfilled" ? result.value : null))
    .filter((item): item is { slug: string; title: string; logoUrl: string | null; accent: string } => Boolean(item));

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Baba Ecke",
    url: "https://baba-ecke.de",
    description: "Premium Cine Community Plattform mit Katalog, Franchise Tracking und Watchlist.",
    inLanguage: "de-DE",
    image: "https://baba-ecke.de/c/header.jpg",
    sameAs: ["https://github.com/VSgitty/baba-ecke-clon"]
  };

  return (
    <>
      <Script
        id="schema-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="fixed top-4 z-50" style={{ right: "max(1rem, var(--reel-safe-inline))" }}>
        <a
          href="/admin/catalog"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm flex items-center gap-2"
        >
          <span>➕ Film hinzufügen</span>
        </a>
      </div>

      <HeroSection />
      <FranchiseLogoSlider items={franchiseLogoItems} />
      <CineTicker />
      <CatalogSectionsGrid />
      <FeatureGrid />
      <CineDashboard catalog={catalog} />
      <TestimonialsSection />
      <FaqSection />
      <CtaBanner />
    </>
  );
}
