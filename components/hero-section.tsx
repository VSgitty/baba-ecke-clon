"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform } from "framer-motion";
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
      className="relative overflow-hidden pb-4 pt-0"
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
      <div className="absolute inset-x-0 top-0 -z-[4] h-[34rem] bg-[radial-gradient(circle_at_15%_5%,rgba(255,186,45,0.26),transparent_42%),radial-gradient(circle_at_88%_0%,rgba(88,225,255,0.2),transparent_34%)]" />

      <div className="relative mx-auto h-[42vh] min-h-[260px] w-full max-w-[1800px] sm:h-[48vh] lg:h-[56vh]">
        <div className="absolute inset-x-0 bottom-8 px-4 sm:px-8 lg:px-10">
          <Badge variant="muted" className="mb-4 w-fit border-white/15 bg-white/5 text-zinc-200">
            NOW PLAYING
          </Badge>
          <h1 className="max-w-[42ch] text-3xl leading-[1.04] text-zinc-50 drop-shadow-[0_12px_20px_rgba(0,0,0,0.75)] sm:text-4xl lg:text-6xl">
            watchlist, reviews, kritik, baba filme, babe serien/folgen und sogar kackfilme
          </h1>
        </div>
      </div>
    </section>
  );
}
