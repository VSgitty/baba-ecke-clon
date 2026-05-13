"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { franchiseWorlds } from "@/data/franchise-worlds";

const DEFAULT_ACCENT = "#f5b034";

const reelRows = Array.from({ length: 14 }, (_, index) => index);

function normalizeScroll(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function CinematicSideReels() {
  const [activeAccent, setActiveAccent] = useState(DEFAULT_ACCENT);
  const [activeGlow, setActiveGlow] = useState("rgba(245, 176, 52, 0.28)");
  const [visible, setVisible] = useState(false);
  const scrollY = useMotionValue(0);
  const scrollVelocity = useMotionValue(0);

  const reelShift = useTransform(scrollY, [0, 3200], [0, -240]);
  const reelReverseShift = useTransform(scrollY, [0, 3200], [0, 240]);
  const reelRotate = useTransform(scrollVelocity, [-1, 1], [-8, 8]);
  const reelReverseRotate = useTransform(reelRotate, (value) => -value);
  const reelDepth = useTransform(scrollVelocity, [-1, 1], [0.92, 1.08]);
  const glowOpacity = useTransform(scrollVelocity, [-1, 1], [0.18, 0.34]);

  const accentMap = useMemo(
    () =>
      Object.fromEntries(
        franchiseWorlds.map((world) => [
          world.slug,
          { accent: world.accent, glow: world.glow }
        ])
      ) as Record<string, { accent: string; glow: string }>,
    []
  );

  useEffect(() => {
    const updateFromScroll = () => {
      const scrollTop = window.scrollY;
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const target = normalizeScroll(scrollTop / maxScroll);
      const previous = scrollY.get();
      const velocity = Math.max(-1, Math.min(1, (target - previous) * 22));
      scrollY.set(previous + (target * 3200 - previous) * 0.08);
      scrollVelocity.set(velocity);
    };

    let frame = 0;
    const tick = () => {
      updateFromScroll();
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [scrollVelocity, scrollY]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1400px)");
    const sync = () => setVisible(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-franchise-slug]"));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        const slug = current?.target.getAttribute("data-franchise-slug");
        if (!slug) return;

        const palette = accentMap[slug];
        if (palette) {
          setActiveAccent(palette.accent);
          setActiveGlow(palette.glow);
        }
      },
      { threshold: [0.25, 0.45, 0.65] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [accentMap]);

  if (!visible) {
    return null;
  }

  return (
    <div className="cinematic-side-reels" aria-hidden="true">
      <div className="cinematic-side-reels__rail cinematic-side-reels__rail--left">
        <motion.div
          className="cinematic-side-reels__core"
          style={{
            y: reelShift,
            rotate: reelRotate,
            scale: reelDepth,
            background: `linear-gradient(180deg, rgba(8, 12, 22, 0.94), rgba(14, 18, 30, 0.7))`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${activeAccent} 18%, transparent), 0 0 44px ${activeGlow}`
          }}
        >
          <div className="cinematic-side-reels__spool cinematic-side-reels__spool--top" style={{ borderColor: activeAccent }} />
          <div className="cinematic-side-reels__track">
            <motion.div className="cinematic-side-reels__track-motion" style={{ y: reelShift }}>
              {reelRows.map((row) => (
                <div key={`left-${row}`} className="cinematic-side-reels__frame">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              ))}
            </motion.div>
          </div>
          <div className="cinematic-side-reels__spool cinematic-side-reels__spool--bottom" style={{ borderColor: activeAccent }} />
        </motion.div>
      </div>

      <div className="cinematic-side-reels__rail cinematic-side-reels__rail--right">
        <motion.div
          className="cinematic-side-reels__core cinematic-side-reels__core--reverse"
          style={{
            y: reelReverseShift,
            rotate: reelReverseRotate,
            scale: reelDepth,
            background: `linear-gradient(180deg, rgba(14, 18, 30, 0.7), rgba(8, 12, 22, 0.94))`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${activeAccent} 18%, transparent), 0 0 44px ${activeGlow}`
          }}
        >
          <div className="cinematic-side-reels__spool cinematic-side-reels__spool--top" style={{ borderColor: activeAccent }} />
          <div className="cinematic-side-reels__track cinematic-side-reels__track--reverse">
            <motion.div className="cinematic-side-reels__track-motion" style={{ y: reelReverseShift }}>
              {reelRows.map((row) => (
                <div key={`right-${row}`} className="cinematic-side-reels__frame">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              ))}
            </motion.div>
          </div>
          <div className="cinematic-side-reels__spool cinematic-side-reels__spool--bottom" style={{ borderColor: activeAccent }} />
        </motion.div>
      </div>

      <motion.div
        className="cinematic-side-reels__glare"
        style={{ opacity: glowOpacity, background: `radial-gradient(circle at 50% 50%, ${activeGlow}, transparent 68%)` }}
      />
    </div>
  );
}
