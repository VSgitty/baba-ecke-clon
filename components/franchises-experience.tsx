"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Play, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { franchiseWorlds, type FranchiseWorldDef } from "@/data/franchise-worlds";
import type { TmdbAssets } from "@/lib/tmdb";

type FranchiseSectionAssets = {
  hero: TmdbAssets;
  catalog: TmdbAssets[];
};


function FranchiseSection({
  world,
  index,
  assets,
  isActive,
  isLast,
  registerRef,
  onScrollNext,
}: {
  world: FranchiseWorldDef;
  index: number;
  assets: FranchiseSectionAssets;
  isActive: boolean;
  isLast: boolean;
  registerRef: (slug: string, el: HTMLElement | null) => void;
  onScrollNext: () => void;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const hazeY = useTransform(scrollYProgress, [0, 1], ["-14%", "14%"]);
  const fogOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.7, 0.4]);
  const titleY = useTransform(scrollYProgress, [0, 1], [22, -20]);
  const reelY = useTransform(scrollYProgress, [0, 1], [18, -22]);
  const carouselX = useTransform(scrollYProgress, [0, 1], [-16, 16]);
  const carouselY = useTransform(scrollYProgress, [0, 1], [18, -14]);
  const [activeCase, setActiveCase] = useState(0);

  const rotateX = useTransform(pointerY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(pointerX, [-0.5, 0.5], [-10, 10]);
  const shineX = useMotionTemplate`${useTransform(pointerX, [-0.5, 0.5], [15, 85])}%`;
  const shineY = useMotionTemplate`${useTransform(pointerY, [-0.5, 0.5], [20, 80])}%`;

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: `${world.slug}-p-${i}`,
        left: `${(i * 13 + 7) % 100}%`,
        delay: `${(i % 7) * 0.8}s`,
        duration: `${6 + (i % 5)}s`
      })),
    [world.slug]
  );

  function onMove(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    pointerX.set(px - 0.5);
    pointerY.set(py - 0.5);
  }

  function onLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  useEffect(() => {
    registerRef(world.slug, sectionRef.current);
    return () => registerRef(world.slug, null);
  }, [world.slug, registerRef]);

  return (
    <section
      ref={sectionRef}
      id={`franchise-section-${world.slug}`}
      data-franchise-slug={world.slug}
      className="franchise-world relative isolate min-h-[94svh] overflow-clip px-4 py-12 sm:px-7 lg:px-10"
      style={{
        background: assets.hero.backdropUrl
          ? `linear-gradient(160deg, ${world.tone}, rgba(2,6,14,0.92) 38%, rgba(2,4,10,0.98)), radial-gradient(circle at 50% 10%, ${world.atmosphere}, transparent 58%)`
          : `linear-gradient(145deg, ${world.tone} 0%, rgba(2,6,14,0.5) 30%, rgba(2,4,10,0.98) 100%), radial-gradient(ellipse 90% 60% at 50% 0%, ${world.atmosphere} 0%, transparent 62%), radial-gradient(ellipse 40% 38% at 80% 80%, ${world.glow}44, transparent 70%)`
      }}
    >
      {/* Cinematic backdrop — TMDB image when available, franchise gradient otherwise */}
      {assets.hero.backdropUrl && (
        <motion.div className="absolute inset-0 z-0 scale-110" style={{ y: bgY }}>
          <Image
            src={assets.hero.backdropUrl}
            alt={`${world.title} cinematic backdrop`}
            fill
            className="object-cover opacity-80 saturate-125 contrast-110"
            sizes="100vw"
            priority={index === 0}
          />
        </motion.div>
      )}

      <motion.div className="absolute inset-0 z-[1]" style={{ y: hazeY, opacity: fogOpacity }}>
        <div className="franchise-haze absolute inset-0" style={{ background: world.mist }} />
      </motion.div>

      <div className="franchise-noise absolute inset-0 z-[2]" aria-hidden />
      <div className="franchise-vignette absolute inset-0 z-[2]" aria-hidden />

      {/* Active top accent line */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[2px]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            style={{ background: `linear-gradient(90deg, transparent, ${world.accent}, transparent)`, transformOrigin: "center" }}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-[3]" aria-hidden>
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="franchise-particle"
            style={{ left: particle.left, animationDelay: particle.delay, animationDuration: particle.duration, boxShadow: `0 0 14px ${world.glow}` }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1560px] gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div style={{ y: titleY }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-200">
            <Sparkles className="h-3 w-3" style={{ color: world.accent }} />
            Franchise Museum: {String(index + 1).padStart(2, "0")}
          </p>

          {/* TMDB Logo PNG if available, else plain title */}
          {assets.hero.logoUrl ? (
            <div className="my-3 max-w-[480px]">
              <Image
                src={assets.hero.logoUrl}
                alt={`${world.title} logo`}
                width={480}
                height={160}
                className="h-auto max-h-[120px] w-auto object-contain object-left drop-shadow-[0_6px_22px_rgba(0,0,0,0.75)] sm:max-h-[148px]"
                unoptimized={assets.hero.logoUrl.endsWith(".svg")}
              />
            </div>
          ) : (
            <h2 className="font-display text-5xl leading-[0.95] text-zinc-100 drop-shadow-[0_8px_24px_rgba(0,0,0,0.65)] sm:text-7xl lg:text-8xl">
              {world.title}
            </h2>
          )}

          <p className="mt-3 max-w-[60ch] text-base text-zinc-200/85 sm:text-lg">{world.subline} · {world.motionLabel}</p>

          <div className="franchise-hero-meta-grid mt-6">
            <div className="franchise-hero-meta-tile">
              <p className="franchise-hero-meta-kicker">Review Score</p>
              <p className="franchise-hero-meta-value">{world.reviewScore.toFixed(1)}</p>
            </div>
            <div className="franchise-hero-meta-tile">
              <p className="franchise-hero-meta-kicker">Release Arc</p>
              <p className="franchise-hero-meta-value">{world.releaseLabel}</p>
            </div>
            <div className="franchise-hero-meta-tile">
              <p className="franchise-hero-meta-kicker">Collection Size</p>
              <p className="franchise-hero-meta-value">{world.catalog.length} Entries</p>
            </div>
          </div>

          <div className="franchise-hero-tag-row mt-4">
            {world.genres.map((genre) => (
              <span key={`${world.slug}-${genre}`} className="franchise-hero-tag" style={{ borderColor: `${world.accent}44` }}>
                {genre}
              </span>
            ))}
          </div>

          <div className="franchise-hero-cta-row mt-6">
            <button className="franchise-hero-cta franchise-hero-cta--primary" style={{ borderColor: `${world.accent}7a` }}>
              Watch Franchise
            </button>
            <button className="franchise-hero-cta">Explore Collection</button>
            <button className="franchise-hero-cta franchise-hero-cta--icon">
              <Play className="h-3.5 w-3.5" /> Trailer ansehen
            </button>
          </div>

          <motion.div className="franchise-live-row" style={{ y: reelY }}>
            <p className="franchise-live-label" style={{ color: `${world.accent}` }}>Live TMDB Covers</p>
            <div className="franchise-cover-reel" role="list" aria-label={`${world.title} Cover Reel`}>
              {world.catalog.map((entry, i) => {
                const posterUrl = assets.catalog[i]?.posterUrl;
                return (
                  <motion.div
                    key={`${world.slug}-reel-${entry.title}`}
                    className="franchise-cover-chip"
                    role="listitem"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: i * 0.06, duration: 0.32 }}
                    style={{ borderColor: `${world.accent}88`, boxShadow: `0 16px 30px -20px ${world.glow}` }}
                  >
                    {posterUrl ? (
                      <Image src={posterUrl} alt={`${entry.title} cover`} fill className="object-cover scale-[1.03]" sizes="(max-width: 1024px) 90px, 120px" />
                    ) : (
                      <div className="franchise-cover-fallback">{entry.title}</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="franchise-case-shell group relative mx-auto w-full max-w-[540px]"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{ perspective: 1400 }}
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div className="franchise-case-core relative" style={{ rotateX, rotateY, x: carouselX, y: carouselY, transformStyle: "preserve-3d" }}>
            <div className="franchise-case-glow" style={{ background: `radial-gradient(circle at ${shineX} ${shineY}, ${world.glow}, transparent 58%)` }} />

            {world.catalog.map((entry, i) => {
              const isActiveCase = i === activeCase;
              return (
              <motion.article
                key={`${world.slug}-${entry.title}`}
                className="franchise-item-case"
                style={{
                  transform: `translate3d(${i * 34}px, ${i * 18}px, ${-i * 34}px) rotateY(${-14 + i * 4}deg) rotateZ(${(i % 2 === 0 ? -1 : 1) * 0.55}deg)`,
                  borderColor: `${world.accent}55`
                }}
                whileHover={{ x: 18, y: -14, z: 48, rotateY: 0, rotateZ: 0.8, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                onHoverStart={() => setActiveCase(i)}
                animate={
                  isActiveCase
                    ? { scale: 1.07, z: 54, x: 16, y: -6, boxShadow: `0 34px 56px -26px ${world.glow}` }
                    : { scale: 1, z: 0, x: 0, boxShadow: "0 12px 24px -18px rgba(0,0,0,0.78)" }
                }
              >
                {assets.catalog[i]?.posterUrl && (
                  <div className="franchise-item-thumbnail">
                    <Image
                      src={assets.catalog[i].posterUrl as string}
                      alt={entry.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                    <div className="franchise-item-thumbnail-overlay" />
                  </div>
                )}
                <div className="franchise-item-spine" style={{ background: `linear-gradient(180deg, ${world.accent}55, rgba(10,12,20,0.75))` }} />
                <div className="franchise-item-meta">
                  <p className="franchise-item-type">{entry.type}</p>
                  <p className="franchise-item-title">{entry.title}</p>
                  <p className="franchise-item-year">{entry.year}</p>
                </div>
                <div className="franchise-item-holo" />
              </motion.article>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="franchise-transition-ribbon pointer-events-none absolute inset-x-0 bottom-[-26px] z-20 h-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="franchise-transition-shards" style={{ background: `linear-gradient(90deg, transparent, ${world.accent}44, transparent)` }} />
      </motion.div>

      {/* Scroll-to-next hint */}
      {!isLast && (
        <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
          <motion.button
            className="franchise-scroll-hint"
            onClick={onScrollNext}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.45 }}
            aria-label="Zur nächsten Franchise-Welt scrollen"
          >
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              style={{ display: "flex" }}
            >
              <ChevronDown className="h-5 w-5" style={{ color: world.accent }} />
            </motion.span>
          </motion.button>
        </div>
      )}
    </section>
  );
}

// ── MINI-MAP ─────────────────────────────────────────────────────

type MiniMapItem = { slug: string; title: string; accent: string };

function FranchiseMiniMap({
  items,
  activeSlug,
  onNavigate,
}: {
  items: MiniMapItem[];
  activeSlug: string | null;
  onNavigate: (slug: string) => void;
}) {
  return (
    <nav className="franchise-minimap hidden lg:flex" aria-label="Franchise Navigation">
      <div className="franchise-minimap-line" aria-hidden />
      <ul className="franchise-minimap-track">
        {items.map((item) => {
          const isActive = activeSlug === item.slug;
          return (
            <li key={item.slug}>
              <button
                className="franchise-minimap-item"
                onClick={() => onNavigate(item.slug)}
                aria-label={`Zu ${item.title} springen`}
                aria-current={isActive ? "true" : undefined}
              >
                <motion.span
                  className="franchise-minimap-dot"
                  animate={{
                    scale: isActive ? 1.7 : 1,
                    background: isActive ? item.accent : "rgba(255,255,255,0.22)",
                    boxShadow: isActive ? `0 0 14px ${item.accent}88` : "none",
                  }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  style={{ display: "block" }}
                />
                <motion.span
                  className="franchise-minimap-label"
                  animate={{
                    opacity: isActive ? 1 : 0,
                    x: isActive ? 0 : 6,
                    color: item.accent,
                  }}
                  transition={{ duration: 0.22 }}
                  aria-hidden={!isActive}
                  style={{ display: "block" }}
                >
                  {item.title}
                </motion.span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function FranchisesExperience({ assetsMap }: { assetsMap: Record<string, FranchiseSectionAssets> }) {
  const [activeSlug, setActiveSlug] = useState<string | null>("intro");
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const introRef = useRef<HTMLElement | null>(null);

  const registerSection = useCallback((slug: string, el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(slug, el);
    else sectionRefs.current.delete(slug);
  }, []);

  // Stable navigate — only accesses refs
  const navigateTo = useCallback((slug: string) => {
    if (slug === "intro") {
      introRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    sectionRefs.current.get(slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToNextWorld = useCallback((currentSlug: string) => {
    const idx = franchiseWorlds.findIndex((w) => w.slug === currentSlug);
    const next = franchiseWorlds[idx + 1];
    if (next) navigateTo(next.slug);
  }, [navigateTo]);

  // IntersectionObserver — set up once after all children mounted
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0;
        let best: string | null = null;
        entries.forEach((entry) => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            best = entry.target.getAttribute("data-franchise-slug");
          }
        });
        if (best && maxRatio > 0.18) setActiveSlug(best);
      },
      { threshold: [0.18, 0.45, 0.75] }
    );

    if (introRef.current) observer.observe(introRef.current);
    sectionRefs.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []); // runs after first render — children effects have already populated sectionRefs

  // Keyboard navigation (↑ / ↓)
  useEffect(() => {
    const slugList = ["intro", ...franchiseWorlds.map((w) => w.slug)];

    function handleKey(e: KeyboardEvent) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const active = document.activeElement;
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      const cur = activeSlug ? slugList.indexOf(activeSlug) : 0;
      const next =
        e.key === "ArrowDown"
          ? Math.min(cur + 1, slugList.length - 1)
          : Math.max(cur - 1, 0);
      if (next !== cur) navigateTo(slugList[next]);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeSlug, navigateTo]);

  const miniMapItems: MiniMapItem[] = useMemo(
    () => [
      { slug: "intro", title: "Intro", accent: "#f5b034" },
      ...franchiseWorlds.map((w) => ({ slug: w.slug, title: w.title, accent: w.accent })),
    ],
    []
  );

  return (
    <div className="franchise-experience-root pb-20">
      <FranchiseMiniMap items={miniMapItems} activeSlug={activeSlug} onNavigate={navigateTo} />

      <header
        ref={introRef}
        id="franchise-section-intro"
        data-franchise-slug="intro"
        className="franchise-top-intro relative overflow-hidden px-4 pb-14 pt-16 sm:px-7 lg:px-10"
      >
        <div className="franchise-top-aurora" aria-hidden />
        <div className="relative z-10 mx-auto max-w-[1280px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400">Digital Video Archive</p>
          <h1 className="mt-3 max-w-[17ch] font-display text-5xl leading-[0.94] text-zinc-100 sm:text-6xl lg:text-8xl">
            Franchises as Cinematic Worlds
          </h1>
          <p className="mt-4 max-w-[66ch] text-zinc-300 sm:text-lg">
            Keine normale Uebersicht. Jede Section ist eine eigene Sammlerwelt mit cineastischen
            Uebergaengen, parallax Tiefe, atmosphaerischem Licht und einem interaktiven Collector Case Stack.
          </p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <button
              className="franchise-start-btn"
              onClick={() => navigateTo(franchiseWorlds[0].slug)}
            >
              <span>Erste Welt betreten</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                aria-hidden
              >
                →
              </motion.span>
            </button>
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              ↑ ↓ Tastatur · Minimap rechts
            </p>
          </motion.div>
        </div>
      </header>

      <div className="space-y-0">
        {franchiseWorlds.map((world, index) => (
          <FranchiseSection
            key={world.slug}
            world={world}
            index={index}
            assets={assetsMap[world.slug] ?? { hero: { posterUrl: null, backdropUrl: null, logoUrl: null }, catalog: [] }}
            isActive={activeSlug === world.slug}
            isLast={index === franchiseWorlds.length - 1}
            registerRef={registerSection}
            onScrollNext={() => scrollToNextWorld(world.slug)}
          />
        ))}
      </div>
    </div>
  );
}
