"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function HomepageScrollTransition() {
  return (
    <motion.div
      className="relative z-20 flex h-[6svh] min-h-[60px] items-center justify-center overflow-hidden border-t border-b"
      style={{
        background: `linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.6) 100%)`,
        backdropFilter: "blur(12px)",
        borderColor: "rgba(59,130,246,0.22)",
      }}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Left: Feature Teaser */}
      <div className="flex flex-1 items-center justify-start gap-6 px-4 sm:gap-8 sm:px-7 lg:px-10">
        <motion.div
          className="flex flex-col items-start"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0, duration: 0.4 }}
        >
          <p className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: "#3b82f6" }}>
            Nächste Sektion
          </p>
          <p className="text-sm font-semibold text-zinc-100 sm:text-base">Core Features</p>
        </motion.div>

        <motion.div
          className="flex flex-col items-start"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08, duration: 0.4 }}
        >
          <p className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: "#3b82f6" }}>
            Erkunde
          </p>
          <p className="text-sm font-semibold text-zinc-100 sm:text-base">4 Premium Tools</p>
        </motion.div>
      </div>

      {/* Center: Divider */}
      <div className="mx-2 h-8 w-px opacity-20" style={{ backgroundColor: "#3b82f6" }} />

      {/* Right: Scroll Indicator */}
      <div className="flex flex-1 items-center justify-end pr-4 sm:pr-7 lg:pr-10">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] uppercase tracking-widest opacity-50" style={{ color: "#3b82f6" }}>
            Scroll weitab
          </p>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown
              className="h-4 w-4"
              style={{ color: "#3b82f6" }}
              strokeWidth={2.5}
            />
          </motion.div>
        </div>
      </div>

      {/* Accent glow line at bottom */}
      <motion.div
        className="absolute bottom-0 left-0 h-px w-full"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)",
        }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
