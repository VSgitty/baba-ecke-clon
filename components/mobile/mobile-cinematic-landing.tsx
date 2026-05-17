"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";

import styles from "@/components/mobile/mobile-cinematic-landing.module.css";

export type MobileCollection = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  glow: string;
  items: Array<{
    id: string;
    title: string;
    year?: number;
    rating?: number;
    poster: string;
    type: "Film" | "Serie";
  }>;
};

const MobileAtmosphere3D = dynamic(
  () => import("@/components/mobile/mobile-atmosphere-canvas").then((mod) => mod.MobileAtmosphereCanvas),
  {
    ssr: false,
    loading: () => <div className={styles.canvasWrap} />
  }
);

export function MobileCinematicLanding({ collections }: { collections: MobileCollection[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [mobileViewport, setMobileViewport] = useState(true);
  const [reducedEffects, setReducedEffects] = useState(false);

  const introRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  const { scrollYProgress } = useScroll();
  const heroShift = useTransform(scrollYProgress, [0, 0.35], [0, -120]);
  const parallaxOpacity = useTransform(scrollYProgress, [0.2, 0.48], [1, 0.35]);

  useEffect(() => {
    const checkViewport = () => {
      const isMobile = window.matchMedia("(max-width: 1024px)").matches || window.matchMedia("(pointer: coarse)").matches;
      setMobileViewport(isMobile);
    };

    const mediaReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const weakDevice =
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4 ||
      (navigator.hardwareConcurrency ?? 8) <= 4;

    setReducedEffects(mediaReduced || weakDevice);
    checkViewport();

    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  useEffect(() => {
    const hardStopTimer = window.setTimeout(() => {
      setIntroDone(true);
    }, 2400);

    if (!introRef.current || !logoRef.current) {
      return () => {
        window.clearTimeout(hardStopTimer);
      };
    }

    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => setIntroDone(true)
    });

    timeline
      .fromTo(
        introRef.current,
        { opacity: 1 },
        { opacity: 1, duration: 0.35 }
      )
      .fromTo(
        ".intro-noise",
        { opacity: 0.15 },
        { opacity: 0.42, duration: 0.55 }
      )
      .fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.84, filter: "blur(10px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.9 },
        "-=0.12"
      )
      .fromTo(
        ".intro-subline",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.55 },
        "-=0.32"
      )
      .to(introRef.current, { opacity: 0, duration: 0.8, delay: 0.42 })
      .set(introRef.current, { pointerEvents: "none" });

    return () => {
      window.clearTimeout(hardStopTimer);
      timeline.kill();
    };
  }, []);

  useEffect(() => {
    if (!ctaRef.current) return;

    const glowTween = gsap.to(ctaRef.current, {
      boxShadow: "0 0 24px rgba(255, 78, 120, 0.35), 0 0 80px rgba(0, 255, 208, 0.22)",
      duration: 2.2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });

    return () => {
      glowTween.kill();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (!mobileViewport) {
    return (
      <div className="min-h-screen bg-black px-6 py-20 text-white">
        <h1 className="font-display text-4xl">Mobile Experience</h1>
        <p className="mt-3 text-sm text-zinc-300">Diese Experience ist exklusiv fuer Smartphones und Touch-Geraete gedacht.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full border border-zinc-700 px-5 py-2 text-sm">
          Zur Desktop-Version
        </Link>
      </div>
    );
  }

  return (
    <div className={`${styles.mobileWorld} relative -mt-16 min-h-screen overflow-x-hidden text-white`}>
      <AnimatePresence>
        {!introDone && (
          <motion.div
            ref={introRef}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${styles.introLayer} fixed inset-0 z-[120] flex items-center justify-center`}
          >
            <div className={`${styles.introNoise} intro-noise`} />
            <div className="relative z-10 text-center px-8">
              <h1 ref={logoRef} className="font-display text-6xl tracking-[0.24em] text-white">
                BABAECKE
              </h1>
              <p className="intro-subline mt-4 text-xs uppercase tracking-[0.4em] text-cyan-300">
                Neon Archive Loading
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 right-0 z-[90] px-4 pt-[max(12px,env(safe-area-inset-top))]">
        <div className={styles.floatingNav}>
          <div className="flex items-center gap-2">
            <span className={styles.navDot} />
            <span className="text-[11px] tracking-[0.32em] text-zinc-200">BABA ARCHIVE</span>
          </div>
          <button onClick={() => setMenuOpen(true)} className={styles.menuButton} type="button">
            MENU
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.fullscreenMenu}
          >
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="absolute right-5 top-6 rounded-full border border-white/20 px-3 py-1 text-xs"
            >
              CLOSE
            </button>
            <div className="mx-auto mt-24 w-[min(92vw,560px)] space-y-3 px-2">
              {["Hero", "Collections", "Vault", "Streams"].map((item) => (
                <a
                  key={item}
                  href={item === "Hero" ? "#hero" : item === "Collections" ? "#collections" : "#vault"}
                  onClick={() => setMenuOpen(false)}
                  className={styles.menuLink}
                >
                  {item}
                </a>
              ))}
              <Link href="/my-list" onClick={() => setMenuOpen(false)} className={styles.menuCta}>
                OPEN MY LIST
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section id="hero" className="relative min-h-[100svh] pt-28 pb-14">
        <motion.div style={{ y: heroShift }} className="absolute inset-0">
          <img src="/c/header.jpg" alt="Cinematic hero" className={styles.heroBg} loading="eager" />
          <div className={styles.heroTint} />
        </motion.div>

        <div className={styles.heroScanline} aria-hidden />
        <div className={styles.heroParticles} aria-hidden />

        <div className="relative z-10 px-4">
          <div className={styles.heroPanel}>
            <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-300">Streaming Future Meets Retro Tape Culture</p>
            <h2 className="mt-3 font-display text-5xl leading-[0.95]">
              ENTER THE
              <br />
              COLLECTION
            </h2>
            <p className="mt-4 max-w-[33ch] text-sm leading-relaxed text-zinc-300">
              Eine mobile AAA Experience zwischen Netflix Intro, Apple-Keynote Motion und 90s Videothek-Atmosphaere.
            </p>
            <a ref={ctaRef} href="#collections" className={styles.heroCta}>
              ENTER THE COLLECTION
            </a>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "VHS Glow",
                "Neon Cinema",
                "Franchise Worlds",
                "Retro Future",
                "AAA Motion"
              ].map((chip) => (
                <span key={chip} className={styles.heroChip}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 px-4">
          <MobileAtmosphere3D reducedEffects={reducedEffects} />
        </div>
      </section>

      <section className="relative px-4 pb-12" id="vault">
        <motion.div style={{ opacity: parallaxOpacity }} className={styles.storyRail}>
          <div className={styles.storyCard}>
            <p className="text-[10px] uppercase tracking-[0.35em] text-fuchsia-300">Chapter One</p>
            <h3 className="mt-2 font-display text-3xl">Retro Videothek Reimagined</h3>
            <p className="mt-3 text-sm text-zinc-300">Langsames Story-Scrolling, Tiefe durch Layer, chromatische Highlights und cineastische Beleuchtung fuer mobile Touch-Navigation.</p>
          </div>
          <div className={styles.storyCardSecondary}>
            <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300">Chapter Two</p>
            <h3 className="mt-2 font-display text-3xl">Streaming Platform DNA</h3>
            <p className="mt-3 text-sm text-zinc-300">Glas-Chrome Cards, Swipe-Galerien und Performance-optimierte Effekte mit adaptiver Last fuer schwache Geraete.</p>
          </div>
        </motion.div>
      </section>

      <section id="collections" className="relative pb-24">
        <div className="px-4">
          <h3 className={`${styles.collectionsHeading} font-display`}>Franchise Collections</h3>
          <p className={`${styles.collectionsSubheading} mt-2 text-sm text-zinc-300`}>
            Sieben Universen mit eigener Farbwelt, Lichtstimmung und Motion-Signatur.
          </p>
        </div>

        <div className="mt-6 space-y-8">
          {collections.map((collection, rowIndex) => (
            <section key={collection.id} className="relative">
              <div className="px-4">
                <div className="flex items-baseline justify-between">
                  <h4 className={`${styles.collectionTitle} font-display leading-none`} style={{ color: collection.accent }}>
                    {collection.title}
                  </h4>
                  <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">Swipe</span>
                </div>
                <p className={`${styles.collectionSubtitle} mt-2 text-xs text-zinc-400`}>{collection.subtitle}</p>
              </div>

              <div className={styles.cardScroller} style={{ boxShadow: `inset 0 0 120px -40px ${collection.glow}` }}>
                {collection.items.map((item, itemIndex) => (
                  <motion.article
                    key={`${collection.id}-${item.id}-${itemIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.44, delay: itemIndex * 0.03 }}
                    className={styles.collectionCard}
                    style={{ borderColor: `${collection.accent}66` }}
                  >
                    <img
                      src={item.poster}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className={styles.collectionPoster}
                      onError={(event) => {
                        event.currentTarget.src = "/c/header.jpg";
                      }}
                    />
                    <div className={styles.posterSheen} />
                    <div className={styles.collectionMeta}>
                      <p className="line-clamp-1 text-xs uppercase tracking-[0.2em] text-cyan-200">{item.type}</p>
                      <h5 className={`${styles.cardTitle} mt-1 line-clamp-2 font-display`}>{item.title}</h5>
                      <div className="mt-3 flex items-center justify-between text-xs text-zinc-300">
                        <span>{item.year || "N/A"}</span>
                        <span>{(item.rating || 0).toFixed(1)}/10</span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {rowIndex !== collections.length - 1 && <div className={styles.rowDivider} />}
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
