"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from "framer-motion";
import { Sparkles, Layers3, Clapperboard, LibraryBig } from "lucide-react";
import { useMemo, useRef } from "react";

type FranchiseWorld = {
  slug: string;
  title: string;
  subline: string;
  tone: string;
  atmosphere: string;
  accent: string;
  glow: string;
  mist: string;
  bgImage: string;
  motionLabel: string;
  catalog: { title: string; year: number; type: "Film" | "Serie" }[];
};

const worlds: FranchiseWorld[] = [
  {
    slug: "john-wick",
    title: "John Wick",
    subline: "Neon Rain Archive",
    tone: "rgba(124, 58, 237, 0.18)",
    atmosphere: "rgba(225, 29, 72, 0.24)",
    accent: "#f97316",
    glow: "rgba(249, 115, 22, 0.42)",
    mist: "radial-gradient(circle at 14% 18%, rgba(225,29,72,0.26), transparent 48%), radial-gradient(circle at 88% 12%, rgba(59,130,246,0.2), transparent 42%)",
    bgImage: "/c/header.jpg",
    motionLabel: "Rain, shell glare, city pulse",
    catalog: [
      { title: "Chapter 1", year: 2014, type: "Film" },
      { title: "Chapter 2", year: 2017, type: "Film" },
      { title: "Chapter 3", year: 2019, type: "Film" },
      { title: "Chapter 4", year: 2023, type: "Film" }
    ]
  },
  {
    slug: "harry-potter",
    title: "Harry Potter",
    subline: "Wizarding Vault",
    tone: "rgba(30, 64, 175, 0.2)",
    atmosphere: "rgba(245, 158, 11, 0.2)",
    accent: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.4)",
    mist: "radial-gradient(circle at 18% 20%, rgba(147,197,253,0.25), transparent 44%), radial-gradient(circle at 84% 12%, rgba(250,204,21,0.2), transparent 40%)",
    bgImage: "/c/lost-wallpaper.png",
    motionLabel: "Fog, sparks, magical streaks",
    catalog: [
      { title: "Stein der Weisen", year: 2001, type: "Film" },
      { title: "Kammer des Schreckens", year: 2002, type: "Film" },
      { title: "Gefangener von Askaban", year: 2004, type: "Film" },
      { title: "Feuerkelch", year: 2005, type: "Film" }
    ]
  },
  {
    slug: "star-wars",
    title: "Star Wars",
    subline: "Galactic Chronicle Deck",
    tone: "rgba(6, 182, 212, 0.18)",
    atmosphere: "rgba(56, 189, 248, 0.24)",
    accent: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.38)",
    mist: "radial-gradient(circle at 8% 8%, rgba(56,189,248,0.24), transparent 44%), radial-gradient(circle at 86% 18%, rgba(14,165,233,0.22), transparent 42%)",
    bgImage: "/c/header.jpg",
    motionLabel: "Stars, warp lines, holo grid",
    catalog: [
      { title: "A New Hope", year: 1977, type: "Film" },
      { title: "The Empire Strikes Back", year: 1980, type: "Film" },
      { title: "The Clone Wars", year: 2008, type: "Serie" },
      { title: "The Mandalorian", year: 2019, type: "Serie" }
    ]
  },
  {
    slug: "horror-archive",
    title: "Saw + Alien",
    subline: "Horror Evidence Room",
    tone: "rgba(153, 27, 27, 0.2)",
    atmosphere: "rgba(5, 150, 105, 0.2)",
    accent: "#ef4444",
    glow: "rgba(239, 68, 68, 0.35)",
    mist: "radial-gradient(circle at 16% 22%, rgba(239,68,68,0.2), transparent 44%), radial-gradient(circle at 88% 18%, rgba(34,197,94,0.14), transparent 38%)",
    bgImage: "/c/lost-wallpaper.png",
    motionLabel: "Glitch grain, shadows, pulse flicker",
    catalog: [
      { title: "Saw", year: 2004, type: "Film" },
      { title: "Saw II", year: 2005, type: "Film" },
      { title: "Alien", year: 1979, type: "Film" },
      { title: "Alien: Romulus", year: 2024, type: "Film" }
    ]
  },
  {
    slug: "anime-sea",
    title: "Naruto + One Piece",
    subline: "Shonen Collector Dock",
    tone: "rgba(37, 99, 235, 0.2)",
    atmosphere: "rgba(251, 146, 60, 0.24)",
    accent: "#fb923c",
    glow: "rgba(251, 146, 60, 0.42)",
    mist: "radial-gradient(circle at 12% 16%, rgba(59,130,246,0.24), transparent 48%), radial-gradient(circle at 88% 14%, rgba(251,146,60,0.22), transparent 42%)",
    bgImage: "/c/header.jpg",
    motionLabel: "Ink trails, speed lines, drifting embers",
    catalog: [
      { title: "Naruto", year: 2002, type: "Serie" },
      { title: "Naruto Shippuden", year: 2007, type: "Serie" },
      { title: "One Piece", year: 1999, type: "Serie" },
      { title: "One Piece Live Action", year: 2023, type: "Serie" }
    ]
  }
];

function FranchiseSection({ world, index }: { world: FranchiseWorld; index: number }) {
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

  return (
    <section
      ref={sectionRef}
      className="franchise-world relative isolate min-h-[94svh] overflow-clip px-4 py-12 sm:px-7 lg:px-10"
      style={{
        background: `linear-gradient(160deg, ${world.tone}, rgba(2,6,14,0.92) 38%, rgba(2,4,10,0.98)), radial-gradient(circle at 50% 10%, ${world.atmosphere}, transparent 58%)`
      }}
    >
      <motion.div className="absolute inset-0 z-0 scale-110" style={{ y: bgY }}>
        <Image src={world.bgImage} alt={`${world.title} cinematic backdrop`} fill className="object-cover opacity-55" sizes="100vw" />
      </motion.div>

      <motion.div className="absolute inset-0 z-[1]" style={{ y: hazeY, opacity: fogOpacity }}>
        <div className="franchise-haze absolute inset-0" style={{ background: world.mist }} />
      </motion.div>

      <div className="franchise-noise absolute inset-0 z-[2]" aria-hidden />
      <div className="franchise-vignette absolute inset-0 z-[2]" aria-hidden />

      <div className="absolute inset-0 z-[3]" aria-hidden>
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="franchise-particle"
            style={{ left: particle.left, animationDelay: particle.delay, animationDuration: particle.duration, boxShadow: `0 0 14px ${world.glow}` }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1560px] gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <motion.div style={{ y: titleY }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-200">
            <Sparkles className="h-3 w-3" style={{ color: world.accent }} />
            Franchise Museum: {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="font-display text-5xl leading-[0.95] text-zinc-100 drop-shadow-[0_8px_24px_rgba(0,0,0,0.65)] sm:text-7xl lg:text-8xl">
            {world.title}
          </h2>
          <p className="mt-3 max-w-[60ch] text-base text-zinc-200/85 sm:text-lg">{world.subline} · {world.motionLabel}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-zinc-300">
              <Layers3 className="h-3 w-3" /> multi-layer parallax
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-zinc-300">
              <LibraryBig className="h-3 w-3" /> collector case stack
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-zinc-300">
              <Clapperboard className="h-3 w-3" /> cinematic transition
            </span>
          </div>
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
          <motion.div className="franchise-case-core relative" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
            <div className="franchise-case-glow" style={{ background: `radial-gradient(circle at ${shineX} ${shineY}, ${world.glow}, transparent 58%)` }} />

            {world.catalog.map((entry, i) => (
              <motion.article
                key={`${world.slug}-${entry.title}`}
                className="franchise-item-case"
                style={{
                  transform: `translate3d(${i * 10}px, ${i * 10}px, ${-i * 24}px) rotateZ(${(i % 2 === 0 ? -1 : 1) * 0.45}deg)`,
                  borderColor: `${world.accent}55`
                }}
                whileHover={{ x: 16, y: -4, z: 24, rotateZ: 0.5 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <div className="franchise-item-spine" style={{ background: `linear-gradient(180deg, ${world.accent}55, rgba(10,12,20,0.75))` }} />
                <div className="franchise-item-meta">
                  <p className="franchise-item-type">{entry.type}</p>
                  <p className="franchise-item-title">{entry.title}</p>
                  <p className="franchise-item-year">{entry.year}</p>
                </div>
              </motion.article>
            ))}
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
    </section>
  );
}

export function FranchisesExperience() {
  return (
    <div className="franchise-experience-root pb-20">
      <header className="franchise-top-intro relative overflow-hidden px-4 pb-12 pt-16 sm:px-7 lg:px-10">
        <div className="franchise-top-aurora" aria-hidden />
        <div className="relative z-10 mx-auto max-w-[1280px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400">Digital Video Archive</p>
          <h1 className="mt-3 max-w-[17ch] font-display text-5xl leading-[0.94] text-zinc-100 sm:text-6xl lg:text-8xl">
            Franchises as Cinematic Worlds
          </h1>
          <p className="mt-4 max-w-[66ch] text-zinc-300 sm:text-lg">
            Keine normale Uebersicht. Jede Section ist eine eigene Sammlerwelt mit cineastischen Uebergaengen,
            parallax Tiefe, atmosphaerischem Licht und einem interaktiven Collector Case Stack.
          </p>
        </div>
      </header>

      <div className="space-y-0">
        {worlds.map((world, index) => (
          <FranchiseSection key={world.slug} world={world} index={index} />
        ))}
      </div>
    </div>
  );
}
