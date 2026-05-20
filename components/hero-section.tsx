"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const parallaxYBack  = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const parallaxYFront = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const fogOpacity     = useTransform(scrollYProgress, [0, 1], [0.5, 0.94]);
  const titleY         = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const titleOpacity   = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative -mt-16 min-h-[100svh] overflow-hidden pb-0 pt-16"
    >
      {/* Layer 1 — deep background image */}
      <motion.div
        className="hero-parallax-back absolute inset-0 z-0 scale-110"
        style={{ y: parallaxYBack }}
      >
        <Image
          src="/c/lost-wallpaper.png"
          alt="LOST Wallpaper"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>

      {/* Layer 2 — soft foreground blur overlay */}
      <motion.div
        className="hero-parallax-front absolute inset-0 z-[1] scale-110"
        style={{ y: parallaxYFront }}
      >
        <Image
          src="/c/lost-wallpaper.png"
          alt="LOST Wallpaper Overlay"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>

      {/* Layer 3 — cinematic fog */}
      <motion.div className="hero-parallax-fog absolute inset-0 z-[2]" style={{ opacity: fogOpacity }} />

      {/* Layer 4 — ambient light leaks */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[38rem]"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 12% 0%,rgba(245,176,52,0.22),transparent 46%)," +
            "radial-gradient(ellipse 44% 40% at 90% 0%,rgba(34,211,238,0.16),transparent 38%)," +
            "radial-gradient(circle at 50% 0%,rgba(100,60,180,0.07),transparent 48%)"
        }}
      />

      {/* Layer 5 — bottom fade to body */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-44 bg-gradient-to-t from-[#060910] via-[#060910f0] to-transparent" />

      {/* VHS timestamp watermark */}
      <div
        className="pointer-events-none absolute right-6 top-6 z-20 select-none font-mono text-[10px] tracking-widest opacity-30"
        style={{ color: "var(--brand)", textShadow: "0 0 10px rgba(245,176,52,0.6)" }}
        aria-hidden
      >
        REC ● 00:00:00
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1800px] items-end"
        style={{ y: titleY, opacity: titleOpacity }}
      >
        <div className="safe-reel-inline w-full pb-14 sm:pb-16 lg:pb-20">
          <p
            className="mb-3 text-[10px] font-bold uppercase tracking-[0.32em] opacity-80"
            style={{ color: "var(--neon-cyan)", textShadow: "0 0 18px rgba(34,211,238,0.5)" }}
          >
            ★ NOW PLAYING
          </p>

          <h1
            className="max-w-[34ch] text-4xl uppercase leading-[1.02] drop-shadow-[0_14px_24px_rgba(0,0,0,0.8)] sm:text-5xl lg:text-7xl"
            style={{
              color: "#f0e8d5",
              textShadow: "0 4px 28px rgba(0,0,0,0.7), 0 0 60px rgba(245,176,52,0.06)"
            }}
          >
            watchlist, reviews, kritik, baba filme, babe serien/folgen und sogar kackfilme
          </h1>

          <div className="mt-5 flex items-center gap-4">
            <div
              className="h-px w-16 opacity-60"
              style={{ background: "linear-gradient(90deg, var(--brand), transparent)" }}
            />
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">
              Cine Community · Premium Experience
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

