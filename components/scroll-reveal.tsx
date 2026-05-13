"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

interface ScrollRevealProps extends PropsWithChildren {
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}

export function ScrollReveal({ children, delay = 0, className, direction = "up" }: ScrollRevealProps) {
  const initial = {
    opacity: 0,
    y: direction === "up" ? 24 : direction === "down" ? -24 : 0,
    x: direction === "left" ? 24 : direction === "right" ? -24 : 0,
    scale: 0.97
  };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

