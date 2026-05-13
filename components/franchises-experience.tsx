"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Play, Sparkles } from "lucide-react";
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
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const catalogLength = world.catalog.length;
  const autoplayBeat = useRef(0);

  const rotateX = useTransform(pointerY, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(pointerX, [-0.5, 0.5], [-4, 4]);
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

  const goToCase = useCallback(
    (next: number) => {
      if (!catalogLength) return;
      setActiveCase((next + catalogLength) % catalogLength);
    },
    [catalogLength]
  );

  const getRelativeDelta = useCallback(
    (targetIndex: number) => {
      if (!catalogLength) return 0;
      let delta = targetIndex - activeCase;
      if (delta > catalogLength / 2) delta -= catalogLength;
      if (delta < -catalogLength / 2) delta += catalogLength;
      return delta;
    },
    [activeCase, catalogLength]
  );

  useEffect(() => {
    if (!isActive || isCarouselPaused || catalogLength < 2) return;
    let timer: number | null = null;
    const rhythm = [1800, 2300, 2600, 2100];

    const schedule = () => {
      const delay = rhythm[autoplayBeat.current % rhythm.length];
      autoplayBeat.current += 1;
      timer = window.setTimeout(() => {
        setActiveCase((prev) => (prev + 1) % catalogLength);
        schedule();
      }, delay);
    };

    schedule();
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [catalogLength, isActive, isCarouselPaused]);

  useEffect(() => {
    registerRef(world.slug, sectionRef.current);
    return () => registerRef(world.slug, null);
  }, [world.slug, registerRef]);

  return (
    <section
      ref={sectionRef}
      id={`franchise-section-${world.slug}`}
      data-franchise-slug={world.slug}
      className="franchise-world relative isolate flex min-h-[94svh] flex-col overflow-clip px-4 pb-16 pt-20 sm:px-7 lg:px-10 lg:pb-14 lg:pt-28"
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

      {/* ── TOP: Title / Logo ─────────────────────────────── */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl"
        style={{ y: titleY }}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-200">
          <Sparkles className="h-3 w-3" style={{ color: world.accent }} />
          Franchise Museum: {String(index + 1).padStart(2, "0")}
        </p>
        {assets.hero.logoUrl ? (
          <div className="max-w-[600px]">
            <Image
              src={assets.hero.logoUrl}
              alt={`${world.title} logo`}
              width={600}
              height={200}
              className="h-auto max-h-[160px] w-auto object-contain object-left drop-shadow-[0_8px_28px_rgba(0,0,0,0.8)] sm:max-h-[200px] lg:max-h-[220px]"
              unoptimized={assets.hero.logoUrl.endsWith(".svg")}
            />
          </div>
        ) : (
          <h2 className="font-display text-6xl leading-[0.92] text-zinc-100 drop-shadow-[0_8px_24px_rgba(0,0,0,0.65)] sm:text-8xl lg:text-[7rem]">
            {world.title}
          </h2>
        )}
      </motion.div>

      {/* ── BOTTOM: Meta + Carousel ───────────────────────── */}
      <div className="relative z-10 mt-auto">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}>
          <p className="mb-4 max-w-[60ch] text-base text-zinc-200/80 sm:text-lg">{world.subline} · {world.motionLabel}</p>

          <div className="franchise-hero-meta-grid">
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
          className="franchise-case-shell group relative mx-auto w-full max-w-[500px] self-end"
          onMouseMove={onMove}
          onMouseLeave={() => {
            onLeave();
            setIsCarouselPaused(false);
          }}
          onMouseEnter={() => setIsCarouselPaused(true)}
          style={{ perspective: 1400 }}
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div className="franchise-case-core relative" style={{ rotateX, rotateY, x: carouselX, y: carouselY, transformStyle: "preserve-3d" }}>
            <div className="franchise-case-glow" style={{ background: `radial-gradient(circle at ${shineX} ${shineY}, ${world.glow}, transparent 58%)` }} />

            {world.catalog.map((entry, i) => {
              const delta = getRelativeDelta(i);
              const absDelta = Math.abs(delta);
              const isActiveCase = absDelta === 0;
              const posterUrl = assets.catalog[i]?.posterUrl;
              const spread = delta * 94;
              const lift = isActiveCase ? -10 : absDelta === 1 ? 10 : 22;
              const depth = isActiveCase ? 0 : absDelta === 1 ? -55 : -110;
              const scale = isActiveCase ? 1 : absDelta === 1 ? 0.87 : 0.74;
              const rotate = delta * -22;

              return (
              <motion.button
                key={`${world.slug}-${entry.title}`}
                type="button"
                className="franchise-coverflow-card"
                style={{
                  zIndex: 100 - absDelta,
                  borderColor: isActiveCase ? `${world.accent}ee` : `${world.accent}44`,
                  boxShadow: isActiveCase
                    ? `0 0 0 1px ${world.accent}44, 0 28px 56px -10px ${world.glow}, 0 60px 80px -30px ${world.glow}88, inset 0 1px 0 rgba(255,255,255,0.14)`
                    : `0 12px 28px -10px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)`
                }}
                initial={false}
                animate={
                  absDelta > 2
                    ? { opacity: 0, pointerEvents: "none", transform: "translate3d(0px, 18px, -180px) rotateY(0deg) scale(0.7)" }
                    : {
                        opacity: 1,
                        pointerEvents: "auto",
                        transform: `translate3d(${spread}px, ${lift}px, ${depth}px) rotateY(${rotate}deg) scale(${isActiveCase ? 1.14 : scale})`
                      }
                }
                transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => goToCase(i)}
              >
                <div className="franchise-coverflow-poster">
                  {posterUrl ? (
                    <Image
                      src={posterUrl}
                      alt={entry.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1280px) 180px, 240px"
                    />
                  ) : (
                    <div className="franchise-coverflow-fallback">{entry.title}</div>
                  )}
                  <div className="franchise-coverflow-poster-overlay" />
                </div>

                <div className="franchise-coverflow-meta">
                  <p className="franchise-item-type">{entry.type}</p>
                  <p className="franchise-item-title">{entry.title}</p>
                  <p className="franchise-item-year">{entry.year}</p>
                </div>
                <div className="franchise-coverflow-floor" style={{ opacity: isActiveCase ? 0.8 : 0.36 }} />
                <div className="franchise-item-holo" />
              </motion.button>
              );
            })}
          </motion.div>

          {/* Controls sit OUTSIDE the 3D core so they never overlap cards */}
          <div className="franchise-coverflow-controls">
            <button
              type="button"
              className="franchise-coverflow-nav"
              onClick={() => goToCase(activeCase - 1)}
              aria-label="Vorheriges Cover"
              style={{ borderColor: `${world.accent}55`, boxShadow: `0 0 18px ${world.glow}66` }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="franchise-coverflow-dots" role="tablist" aria-label={`${world.title} Coverflow Position`}>
              {world.catalog.map((entry, i) => (
                <button
                  key={`${world.slug}-dot-${entry.title}`}
                  type="button"
                  className="franchise-coverflow-dot"
                  onClick={() => goToCase(i)}
                  aria-label={`${entry.title} zentrieren`}
                  aria-current={i === activeCase ? "true" : undefined}
                  style={{ background: i === activeCase ? world.accent : "rgba(226,232,240,0.22)", boxShadow: i === activeCase ? `0 0 14px ${world.accent}dd` : "none", transform: i === activeCase ? "scale(1.4)" : "scale(1)" }}
                />
              ))}
            </div>

            <button
              type="button"
              className="franchise-coverflow-nav"
              onClick={() => goToCase(activeCase + 1)}
              aria-label="Nächstes Cover"
              style={{ borderColor: `${world.accent}55`, boxShadow: `0 0 18px ${world.glow}66` }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
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

export function FranchisesExperience({
  assetsMap,
  worlds = franchiseWorlds,
}: {
  assetsMap: Record<string, FranchiseSectionAssets>;
  worlds?: FranchiseWorldDef[];
}) {
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

  const scrollToNextWorld = useCallback(
    (currentSlug: string) => {
      const idx = worlds.findIndex((w) => w.slug === currentSlug);
      const next = worlds[idx + 1];
      if (next) navigateTo(next.slug);
    },
    [worlds, navigateTo]
  );

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
    const slugList = ["intro", ...worlds.map((w) => w.slug)];

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
  }, [activeSlug, navigateTo, worlds]);

  const miniMapItems: MiniMapItem[] = useMemo(
    () => [
      { slug: "intro", title: "Intro", accent: "#f5b034" },
      ...worlds.map((w) => ({ slug: w.slug, title: w.title, accent: w.accent })),
    ],
    [worlds]
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
        {worlds.map((world, index) => (
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
