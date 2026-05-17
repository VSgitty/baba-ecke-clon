"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";

import styles from "@/components/mobile/mobile-cinematic-landing.module.css";

type MobileCoverItem = {
  id: string;
  title: string;
  year?: number;
  rating?: number;
  poster: string;
  type: "Film" | "Serie";
};

export type MobileCategorySection = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  glow: string;
  heroImage: string;
  items: MobileCoverItem[];
};

export type MobileFranchiseSection = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  heroImage: string;
  items: MobileCoverItem[];
};

const MobileAtmosphere3D = dynamic(
  () => import("@/components/mobile/mobile-atmosphere-canvas").then((mod) => mod.MobileAtmosphereCanvas),
  {
    ssr: false,
    loading: () => <div className={styles.canvasWrap} />
  }
);

type MobileCinematicLandingProps = {
  categories: MobileCategorySection[];
  franchises: MobileFranchiseSection[];
};

export function MobileCinematicLanding({ categories, franchises }: MobileCinematicLandingProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [mobileViewport, setMobileViewport] = useState(true);
  const [reducedEffects, setReducedEffects] = useState(false);

  const introRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  const { scrollYProgress } = useScroll();
  const heroShift = useTransform(scrollYProgress, [0, 0.35], [0, -120]);

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
              {[
                { label: "Hero", href: "#hero" },
                { label: "Kategorien", href: "#categories" },
                { label: "Franchises", href: "#franchises" },
                { label: "My List", href: "/my-list" }
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={styles.menuLink}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section id="hero" className="relative min-h-[92svh] pt-28 pb-12">
        <motion.div style={{ y: heroShift }} className="absolute inset-0">
          <img src="/c/header.jpg" alt="Cinematic hero" className={styles.heroBg} loading="eager" />
          <div className={styles.heroTint} />
        </motion.div>

        <div className={styles.heroScanline} aria-hidden />
        <div className={styles.heroParticles} aria-hidden />

        <div className="relative z-10 px-4">
          <div className={styles.heroPanel}>
            <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-300">Franchise Archive Mobile</p>
            <h2 className="mt-3 font-display text-5xl leading-[0.95]">
              FRANCHISE
              <br />
              COLLECTIONS
            </h2>
            <p className="mt-4 max-w-[33ch] text-sm leading-relaxed text-zinc-300">
              Kategorien mit eigener Hero-Identity, klare Cover-Grids und visuell gruppierte Franchise-Welten.
            </p>
            <a ref={ctaRef} href="#categories" className={styles.heroCta}>
              KOLLEKTIONEN ENTDECKEN
            </a>
          </div>
        </div>

        <div className="relative z-10 mt-8 px-4">
          <MobileAtmosphere3D reducedEffects={reducedEffects} />
        </div>
      </section>

      <section id="categories" className="relative px-4 pb-20">
        <div className={styles.sectionHeaderRow}>
          <h3 className={`${styles.collectionsHeading} font-display`}>Kategorien</h3>
          <span className={styles.sectionLink}>Alle ansehen</span>
        </div>

        <div className={styles.categoryStack}>
          {categories.map((category) => (
            <section key={category.id} className={styles.categorySection}>
              <div className={styles.categoryHero} style={{ borderColor: `${category.accent}77` }}>
                <img
                  src={category.heroImage}
                  alt={category.title}
                  className={styles.categoryHeroImage}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = "/c/header.jpg";
                  }}
                />
                <div className={styles.categoryHeroTint} style={{ boxShadow: `inset 0 -120px 80px -40px ${category.glow}` }} />
                <div className={styles.categoryHeroMeta}>
                  <h4 className={`${styles.collectionTitle} font-display`} style={{ color: category.accent }}>
                    {category.title}
                  </h4>
                  <p className={styles.collectionSubtitle}>{category.subtitle}</p>
                </div>
              </div>

              <div className={styles.coversGrid}>
                {category.items.slice(0, 8).map((item) => (
                  <article key={`${category.id}-${item.id}`} className={styles.coverCard}>
                    <img
                      src={item.poster}
                      alt={item.title}
                      className={styles.coverPoster}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = "/c/header.jpg";
                      }}
                    />
                    <div className={styles.coverMeta}>
                      <p className={styles.coverType}>{item.type}</p>
                      <h5 className={styles.coverTitle}>{item.title}</h5>
                      <p className={styles.coverInfo}>{item.year || "N/A"} · {(item.rating || 0).toFixed(1)}/10</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section id="franchises" className="relative px-4 pb-24">
        <div className={styles.sectionHeaderRow}>
          <h3 className={`${styles.collectionsHeading} font-display`}>Franchise Gruppen</h3>
          <span className={styles.sectionLink}>Alle ansehen</span>
        </div>

        <div className={styles.franchiseStack}>
          {franchises.map((franchise) => (
            <article key={franchise.id} className={styles.franchiseSection}>
              <div className={styles.franchiseHero} style={{ borderColor: `${franchise.accent}77` }}>
                <img
                  src={franchise.heroImage}
                  alt={franchise.title}
                  className={styles.franchiseHeroImage}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = "/c/header.jpg";
                  }}
                />
                <div className={styles.franchiseHeroOverlay} />
                <div className={styles.franchiseHeroContent}>
                  <p className={styles.coverType}>Zur Franchise</p>
                  <h4 className={`${styles.collectionTitle} font-display`} style={{ color: franchise.accent }}>
                    {franchise.title}
                  </h4>
                  <p className={styles.collectionSubtitle}>{franchise.subtitle}</p>
                </div>
              </div>

              <div className={styles.franchiseCoverStrip}>
                {franchise.items.slice(0, 6).map((item) => (
                  <article key={`${franchise.id}-${item.id}`} className={styles.franchiseMiniCard}>
                    <img
                      src={item.poster}
                      alt={item.title}
                      className={styles.franchiseMiniPoster}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = "/c/header.jpg";
                      }}
                    />
                    <div className={styles.franchiseMiniMeta}>
                      <p className={styles.coverType}>{item.type}</p>
                      <h5 className={styles.franchiseMiniTitle}>{item.title}</h5>
                      <p className={styles.coverInfo}>{item.year || "N/A"}</p>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
