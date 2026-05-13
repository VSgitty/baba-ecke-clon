"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { franchiseWorlds } from "@/data/franchise-worlds";

const DEFAULT_ACCENT = "#f5b034";

function normalizeScroll(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function CinematicSideReels() {
  const [activeAccent, setActiveAccent] = useState(DEFAULT_ACCENT);
  const [activeGlow, setActiveGlow] = useState("rgba(245, 176, 52, 0.28)");
  const [visible, setVisible] = useState(false);
  const [gutterWidth, setGutterWidth] = useState(0);

  const scrollY = useMotionValue(0);
  const scrollVelocity = useMotionValue(0);

  const reelShift = useTransform(scrollY, [0, 4200], [0, -560]);
  const reelReverseShift = useTransform(scrollY, [0, 4200], [0, 560]);
  const spoolRotate = useTransform(scrollY, [0, 4200], [0, 880]);
  const spoolReverseRotate = useTransform(spoolRotate, (value) => -value);
  const glowOpacity = useTransform(scrollVelocity, [-1, 1], [0.14, 0.34]);
  const glareX = useTransform(scrollVelocity, [-1, 1], [30, 72]);

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
    const recalcGutter = () => {
      const anchor = document.querySelector<HTMLElement>(".site-navbar-inner");
      const contentWidth = anchor?.getBoundingClientRect().width ?? Math.min(window.innerWidth * 0.9, 1280);
      const rawGutter = Math.floor((window.innerWidth - contentWidth) / 2);
      const nextGutter = Math.max(70, rawGutter);
      setGutterWidth(nextGutter);
      setVisible(window.innerWidth >= 1100 && rawGutter >= 58);
    };

    const updateFromScroll = () => {
      const scrollTop = window.scrollY;
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const target = normalizeScroll(scrollTop / maxScroll);
      const previous = scrollY.get();
      const velocity = Math.max(-1, Math.min(1, (target - previous) * 20));
      scrollY.set(previous + (target * 4200 - previous) * 0.075);
      scrollVelocity.set(velocity);
    };

    let frame = 0;
    const tick = () => {
      updateFromScroll();
      frame = window.requestAnimationFrame(tick);
    };

    recalcGutter();
    frame = window.requestAnimationFrame(tick);
    window.addEventListener("resize", recalcGutter);

    return () => {
      window.removeEventListener("resize", recalcGutter);
      window.cancelAnimationFrame(frame);
    };
  }, [scrollVelocity, scrollY]);

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

  if (!visible) return null;

  return (
    <div className="cinematic-side-reels" aria-hidden="true">
      <div className="cinematic-side-reels__rail cinematic-side-reels__rail--left" style={{ width: gutterWidth }}>
        <motion.div className="cinematic-side-reels__strip-shell" style={{ boxShadow: `inset 0 0 0 1px ${activeAccent}44, 0 0 42px ${activeGlow}` }}>
          <motion.div className="cinematic-side-reels__strip-run" style={{ y: reelShift }}>
            <div className="cinematic-side-reels__strip-pattern" />
          </motion.div>
        </motion.div>

        <motion.div className="cinematic-side-reels__spool cinematic-side-reels__spool--top" style={{ rotate: spoolRotate, borderColor: activeAccent }} />
        <motion.div className="cinematic-side-reels__spool cinematic-side-reels__spool--bottom" style={{ rotate: spoolRotate, borderColor: activeAccent }} />
      </div>

      <div className="cinematic-side-reels__rail cinematic-side-reels__rail--right" style={{ width: gutterWidth }}>
        <motion.div className="cinematic-side-reels__strip-shell" style={{ boxShadow: `inset 0 0 0 1px ${activeAccent}44, 0 0 42px ${activeGlow}` }}>
          <motion.div className="cinematic-side-reels__strip-run" style={{ y: reelReverseShift }}>
            <div className="cinematic-side-reels__strip-pattern cinematic-side-reels__strip-pattern--reverse" />
          </motion.div>
        </motion.div>

        <motion.div className="cinematic-side-reels__spool cinematic-side-reels__spool--top" style={{ rotate: spoolReverseRotate, borderColor: activeAccent }} />
        <motion.div className="cinematic-side-reels__spool cinematic-side-reels__spool--bottom" style={{ rotate: spoolReverseRotate, borderColor: activeAccent }} />
      </div>

      <motion.div
        className="cinematic-side-reels__glare"
        style={{ opacity: glowOpacity, background: `radial-gradient(circle at ${glareX}% 50%, ${activeGlow}, transparent 64%)` }}
      />
    </div>
  );
}
