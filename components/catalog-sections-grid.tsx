"use client";

import { Film, Bookmark, Play, Filter } from "lucide-react";
import { motion } from "framer-motion";

const catalogSections = [
  {
    id: "catalog",
    title: "Gesamtkatalog",
    description: "Kompletter Film- und Serienkatalog mit erweiterten Suchfiltern und Bewertungen.",
    icon: Film,
    accent: "var(--brand)",
    href: "/streams"
  },
  {
    id: "watchlist",
    title: "Watchlist",
    description: "Deine persönliche Liste mit Titeln, die du später anschauen möchtest.",
    icon: Bookmark,
    accent: "var(--neon-cyan)",
    href: "/my-list"
  },
  {
    id: "continue",
    title: "Continue Watching",
    description: "Automatisches Tracking deiner zuletzt angeschauten Filme und Serien.",
    icon: Play,
    accent: "var(--neon-purple)",
    href: "#"
  },
  {
    id: "filter",
    title: "Gefilterte Titel",
    description: "Intelligente Filterung nach Genre, Rating, Länge und persönlichen Vorlieben.",
    icon: Filter,
    accent: "var(--brand-strong)",
    href: "/streams"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export function CatalogSectionsGrid() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "var(--brand)", textShadow: "0 0 16px rgba(245,176,52,0.38)" }}
        >
          Dein Zugang
        </p>
        <h2
          className="font-display text-3xl tracking-wide text-zinc-100 sm:text-4xl"
        >
          Erkunde dein Kino
        </h2>
      </div>

      <motion.div
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {catalogSections.map((section) => {
          const Icon = section.icon;
          return (
            <motion.a
              key={section.id}
              href={section.href}
              variants={itemVariants}
              className="cine-panel group h-full rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              style={{
                borderColor: `color-mix(in srgb, ${section.accent} 18%, transparent)`
              }}
            >
              <div
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all group-hover:scale-110"
                style={{
                  background: `color-mix(in srgb, ${section.accent} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${section.accent} 25%, transparent)`,
                  color: section.accent,
                  boxShadow: `0 0 16px color-mix(in srgb, ${section.accent} 20%, transparent)`
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 font-display text-xl tracking-wide text-zinc-100">{section.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{section.description}</p>
              <p className="mt-2 text-xs text-zinc-600">
                Organisiert und jederzeit verfügbar.
              </p>
            </motion.a>
          );
        })}
      </motion.div>
    </section>
  );
}
