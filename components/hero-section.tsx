"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";

import { heroStats } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const parallaxYBack = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const parallaxYFront = useTransform(scrollYProgress, [0, 1], ["0%", "9%"]);
  const fogOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.88]);

  const driftX = useMotionTemplate`calc(${pointerX}px * 1.2)`;
  const driftY = useMotionTemplate`calc(${pointerY}px * 1.4)`;

  function handlePointerMove(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    pointerX.set(x);
    pointerY.set(y);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pb-10 pt-12 sm:pt-16"
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointer}
    >
      <motion.div
        className="hero-parallax-back absolute inset-0 -z-20"
        style={{ y: parallaxYBack, x: driftX }}
      >
        <Image
          src="/c/header.jpg"
          alt="LOST Wallpaper"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>

      <motion.div className="hero-parallax-front absolute inset-0 -z-10" style={{ y: parallaxYFront, x: driftY }}>
        <Image
          src="/c/header.jpg"
          alt="LOST Wallpaper Overlay"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>

      <motion.div className="hero-parallax-fog absolute inset-0 -z-[5]" style={{ opacity: fogOpacity }} />
      <div className="absolute inset-x-0 top-0 -z-[4] h-[32rem] bg-[radial-gradient(circle_at_15%_5%,rgba(255,186,45,0.26),transparent_42%),radial-gradient(circle_at_88%_0%,rgba(88,225,255,0.2),transparent_34%)]" />

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-end lg:px-8">
        <div className="animate-float-in space-y-6">
          <Badge variant="muted" className="w-fit border-white/15 bg-white/5 text-zinc-200">
            NOW PLAYING
          </Badge>
          <h1 className="max-w-[17ch] text-5xl leading-[0.96] text-zinc-50 sm:text-6xl lg:text-7xl">
            Keine Standard-Filmseite. Eine persoenliche Filmwelt.
          </h1>
          <p className="max-w-[58ch] text-base text-zinc-300 sm:text-lg">
            Watchlists, Reviews, Franchise-Tracking und deine Kommentare - alles hier.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/my-list">
                Zur Sammlung
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/streams">
                Progress-System
                <PlayCircle className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="cine-panel cine-glow relative overflow-hidden rounded-3xl p-6">
          <div className="relative">
            <p className="text-sm font-medium text-zinc-300">Community Snapshot</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md"
                >
                  <p className="text-3xl font-semibold tracking-tight text-zinc-50">{stat.value}</p>
                  <p className="mt-1 text-sm text-zinc-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
