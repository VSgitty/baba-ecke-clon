import Script from "next/script";

import { getEnrichedCatalogItems } from "@/lib/catalog";
import { HeroSection } from "@/components/hero-section";
import { CineTicker } from "@/components/cine-ticker";
import { FeatureGrid } from "@/components/feature-grid";
import { CineDashboard } from "@/components/cine-dashboard";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FaqSection } from "@/components/faq-section";
import { CtaBanner } from "@/components/cta-banner";

export default async function HomePage() {
  const catalog = await getEnrichedCatalogItems(140);

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

        <HeroSection />
        <div id="reels-start" />
        <CineTicker />
      <FeatureGrid />
      <CineDashboard catalog={catalog} />
      <TestimonialsSection />
      <FaqSection />
      <CtaBanner />
    </>
  );
}
