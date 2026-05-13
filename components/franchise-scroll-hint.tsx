"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { FranchiseWorldDef } from "@/data/franchise-worlds";

export function FranchiseScrollHint({ world }: { world: FranchiseWorldDef }) {
  // Calculate stats from catalog
  const filmCount = world.catalog.length;
  const avgRating = world.reviewScore;
  const years = world.catalog.map((item) => item.year).sort((a, b) => a - b);
  const minYear = years[0] ?? 2000;
  const maxYear = years[years.length - 1] ?? 2024;
  const yearSpan = maxYear - minYear + 1;

  const stats = [
    { label: "Filme", value: filmCount.toString() },
    { label: "Durchschn. Rating", value: `${avgRating.toFixed(1)}/10` },
    { label: "Zeitraum", value: `${yearSpan} Jahre` },
    { label: "Since", value: `${minYear}` },
  ];

  return (
    <motion.div
      className="relative z-20 flex h-[6svh] min-h-[60px] items-center justify-center overflow-hidden border-t"
      style={{
        background: `linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.6) 100%)`,
        backdropFilter: "blur(12px)",
        borderColor: `${world.accent}22`,
      }}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Left: Stats Grid */}
      <div className="flex flex-1 items-center justify-start gap-3 px-4 sm:gap-6 sm:px-7 lg:px-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="flex flex-col items-start"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <p
              className="text-[10px] uppercase tracking-widest opacity-50"
              style={{ color: world.accent }}
            >
              {stat.label}
            </p>
            <p className="text-sm font-semibold text-zinc-100 sm:text-base">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Center: Divider */}
      <div
        className="mx-2 h-8 w-px opacity-20"
        style={{ backgroundColor: world.accent }}
      />

      {/* Right: Scroll Indicator */}
      <div className="flex flex-1 items-center justify-end pr-4 sm:pr-7 lg:pr-10">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: world.accent }}>
            Mehr erkunden
          </p>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown
              className="h-4 w-4"
              style={{ color: world.accent }}
              strokeWidth={2.5}
            />
          </motion.div>
        </div>
      </div>

      {/* Accent glow line at bottom */}
      <motion.div
        className="absolute bottom-0 left-0 h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${world.accent}44, transparent)`,
        }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
