"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import styles from "@/components/tv/tv-cinematic-home.module.css";

export type TvCoverItem = {
  id: string;
  title: string;
  year?: number;
  rating?: number;
  poster: string;
  type: "Film" | "Serie";
  genre: string;
};

export type TvHeroItem = TvCoverItem & {
  description: string;
};

export type TvShelf = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  items: TvCoverItem[];
};

type TvCinematicHomeProps = {
  heroItems: TvHeroItem[];
  shelves: TvShelf[];
  backgroundItems: TvCoverItem[];
};

type FocusTarget =
  | { zone: "queue"; rowIndex: number; itemIndex: number; heroIndex: number }
  | { zone: "shelf"; rowIndex: number; itemIndex: number; heroIndex: number };

function repeatItems<T>(items: T[], minLength: number): T[] {
  if (!items.length) return [];
  const next: T[] = [];
  while (next.length < minLength) {
    next.push(...items);
  }
  return next.slice(0, minLength);
}

function formatClock(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).format(date);
}

export function TvCinematicHome({ heroItems, shelves, backgroundItems }: TvCinematicHomeProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  const [isRemoteMode, setIsRemoteMode] = useState(false);
  const resumeAutoplayRef = useRef<number | null>(null);

  const safeHeroItems = heroItems.length ? heroItems : backgroundItems.map((item) => ({ ...item, description: "TV-Curation aktiv." }));
  const activeHero = safeHeroItems[activeIndex % Math.max(safeHeroItems.length, 1)];

  const coverRails = useMemo(() => {
    const base = backgroundItems.length ? backgroundItems : safeHeroItems;
    return [
      repeatItems(base.slice(0, 8), 16),
      repeatItems(base.slice(4, 12), 16),
      repeatItems(base.slice(2, 10), 16)
    ];
  }, [backgroundItems, safeHeroItems]);

  const nextQueue = useMemo(() => {
    return safeHeroItems
      .map((item, index) => ({ item, index }))
      .filter(({ index }) => index !== activeIndex)
      .slice(0, 4);
  }, [activeIndex, safeHeroItems]);

  const navigableRows = useMemo(() => {
    const queueRows: FocusTarget[] = nextQueue.map(({ item, index }) => {
      const heroIndex = safeHeroItems.findIndex((entry) => entry.id === item.id);
      return {
        zone: "queue",
        rowIndex: 0,
        itemIndex: index,
        heroIndex: heroIndex >= 0 ? heroIndex : 0,
      };
    });

    const shelfRows: FocusTarget[] = shelves.flatMap((shelf, shelfIndex) =>
      shelf.items.slice(0, 10).map((item, itemIndex) => {
        const heroIndex = safeHeroItems.findIndex((entry) => entry.id === item.id);
        return {
          zone: "shelf",
          rowIndex: shelfIndex + 1,
          itemIndex,
          heroIndex: heroIndex >= 0 ? heroIndex : 0,
        } satisfies FocusTarget;
      })
    );

    return [...queueRows, ...shelfRows];
  }, [nextQueue, shelves, safeHeroItems]);

  const previewHero = useMemo(() => {
    if (!focusTarget) return activeHero;
    return safeHeroItems[focusTarget.heroIndex] || activeHero;
  }, [activeHero, focusTarget, safeHeroItems]);

  const previewBackgroundItems = useMemo(() => {
    const lead = previewHero || activeHero;
    const pool = backgroundItems.length ? backgroundItems : safeHeroItems;
    return [lead, ...pool.filter((item) => item.id !== lead?.id)].slice(0, 18);
  }, [activeHero, backgroundItems, previewHero, safeHeroItems]);

  const pauseAutoplay = () => {
    setIsRemoteMode(true);
    if (resumeAutoplayRef.current) {
      window.clearTimeout(resumeAutoplayRef.current);
    }
    resumeAutoplayRef.current = window.setTimeout(() => {
      setIsRemoteMode(false);
      setFocusTarget(null);
    }, 18000);
  };

  useEffect(() => {
    if (safeHeroItems.length < 2 || isRemoteMode) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safeHeroItems.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [isRemoteMode, safeHeroItems.length]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000 * 20);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (resumeAutoplayRef.current) {
        window.clearTimeout(resumeAutoplayRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!navigableRows.length) return;

    const findTarget = (zone: FocusTarget["zone"], rowIndex: number, itemIndex: number) => {
      const sameRow = navigableRows.filter((target) => target.zone === zone && target.rowIndex === rowIndex);
      if (!sameRow.length) return null;
      return sameRow[Math.max(0, Math.min(itemIndex, sameRow.length - 1))] || null;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const navigationKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", " "];
      if (!navigationKeys.includes(event.key)) return;

      if (!["INPUT", "TEXTAREA", "SELECT"].includes((event.target as HTMLElement | null)?.tagName || "")) {
        event.preventDefault();
      }

      pauseAutoplay();

      const current = focusTarget || navigableRows[0];
      if (!current) return;

      const maxShelfRow = shelves.length;

      if (event.key === "ArrowLeft") {
        const next = findTarget(current.zone, current.rowIndex, current.itemIndex - 1) || current;
        setFocusTarget(next);
        return;
      }

      if (event.key === "ArrowRight") {
        const next = findTarget(current.zone, current.rowIndex, current.itemIndex + 1) || current;
        setFocusTarget(next);
        return;
      }

      if (event.key === "ArrowDown") {
        const nextRowIndex = Math.min(maxShelfRow, current.rowIndex + 1);
        const nextZone = nextRowIndex === 0 ? "queue" : "shelf";
        const next = findTarget(nextZone, nextRowIndex, current.itemIndex) || findTarget(nextZone, nextRowIndex, 0) || current;
        setFocusTarget(next);
        return;
      }

      if (event.key === "ArrowUp") {
        const nextRowIndex = Math.max(0, current.rowIndex - 1);
        const nextZone = nextRowIndex === 0 ? "queue" : "shelf";
        const next = findTarget(nextZone, nextRowIndex, current.itemIndex) || findTarget(nextZone, nextRowIndex, 0) || current;
        setFocusTarget(next);
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        setActiveIndex(current.heroIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusTarget, navigableRows, shelves.length]);

  useEffect(() => {
    if (!focusTarget) return;
    const selector = `[data-focus-key="${focusTarget.zone}-${focusTarget.rowIndex}-${focusTarget.itemIndex}"]`;
    const element = document.querySelector<HTMLElement>(selector);
    element?.focus();
    element?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [focusTarget]);

  if (!activeHero) return null;

  return (
    <div className={styles.tvWorld}>
      <div className={styles.backgroundFrame}>
        <AnimatePresence mode="wait">
          <motion.img
            key={`bg-lead-${previewHero.id}`}
            src={previewHero.poster}
            alt={previewHero.title}
            className={styles.previewBackdrop}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            onError={(event) => {
              event.currentTarget.src = "/c/header.jpg";
            }}
          />
        </AnimatePresence>

        {coverRails.map((_, railIndex) => (
          <div
            key={`rail-${railIndex}`}
            className={styles.coverRail}
          >
            <div
              className={`${styles.coverRailTrack} ${railIndex % 2 === 1 ? styles.coverRailReverse : ""}`}
              style={{ animationDuration: `${52 + railIndex * 10}s` }}
            >
              {[...previewBackgroundItems, ...previewBackgroundItems].map((item, index) => (
                <div key={`${railIndex}-${item.id}-${index}`} className={styles.railCard}>
                  <img
                    src={item.poster}
                    alt={item.title}
                    className={styles.railImage}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = "/c/header.jpg";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className={styles.backgroundVignette} />
        <div className={styles.backgroundGlow} />
      </div>

      <section className={styles.heroStage}>
        <div className={styles.topBar}>
          <div>
            <p className={styles.eyebrow}>Baba Ecke TV</p>
            <p className={styles.topSubline}>Eigenstaendige Startseite fuer grosse Screens und Lean-Back-Nutzung.</p>
          </div>
          <div className={styles.statusCluster}>
            <div className={styles.statusCard}>
              <span className={styles.statusLabel}>Live</span>
              <span className={styles.statusValue}>{formatClock(now)}</span>
            </div>
            <div className={styles.statusCard}>
              <span className={styles.statusLabel}>Heute</span>
              <span className={styles.statusValue}>{formatDate(now)}</span>
            </div>
          </div>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.heroKickerRow}>
              <span className={styles.livePill}>TV STARTSEITE</span>
              <span className={styles.genrePill}>{activeHero.genre}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={previewHero.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className={`${styles.heroTitle} font-display`}>{previewHero.title}</h1>
                <p className={styles.heroDescription}>{previewHero.description}</p>

                <div className={styles.metaRow}>
                  <span>{previewHero.type}</span>
                  <span>{previewHero.year || "Archiv"}</span>
                  <span>{(previewHero.rating || 0).toFixed(1)}/10</span>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className={styles.ctaRow}>
              <Link href="/" className={styles.primaryCta}>Zum Hauptportal</Link>
              <Link href="/my-list" className={styles.secondaryCta}>My List</Link>
            </div>
          </div>

          <div className={styles.heroVisualCluster}>
            <div className={styles.activePosterFrame}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={previewHero.id}
                  src={previewHero.poster}
                  alt={previewHero.title}
                  className={styles.activePoster}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  onError={(event) => {
                    event.currentTarget.src = "/c/header.jpg";
                  }}
                />
              </AnimatePresence>
              <div className={styles.activePosterOverlay} />
            </div>

            <div className={styles.queuePanel}>
              <p className={styles.queueTitle}>Naechste Covers</p>
              <div className={styles.queueList}>
                {nextQueue.map(({ item, index }) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.queueItem} ${focusTarget?.zone === "queue" && focusTarget.rowIndex === 0 && focusTarget.itemIndex === index ? styles.focusedItem : ""}`}
                    data-focus-key={`queue-0-${index}`}
                    onClick={() => {
                      pauseAutoplay();
                      setFocusTarget({ zone: "queue", rowIndex: 0, itemIndex: index, heroIndex: (activeIndex + index + 1) % safeHeroItems.length });
                      setActiveIndex((activeIndex + index + 1) % safeHeroItems.length);
                    }}
                    onFocus={() => {
                      pauseAutoplay();
                      setFocusTarget({ zone: "queue", rowIndex: 0, itemIndex: index, heroIndex: (activeIndex + index + 1) % safeHeroItems.length });
                    }}
                  >
                    <img src={item.poster} alt={item.title} className={styles.queuePoster} />
                    <div>
                      <p className={styles.queueItemTitle}>{item.title}</p>
                      <p className={styles.queueItemMeta}>{item.type} · {item.year || "Archiv"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.shelvesWrap}>
        {shelves.map((shelf) => (
          <section key={shelf.id} className={styles.shelfSection}>
            <div className={styles.shelfHeader}>
              <div>
                <p className={styles.shelfEyebrow} style={{ color: shelf.accent }}>Kuratiert fuer TV</p>
                <h2 className={`${styles.shelfTitle} font-display`}>{shelf.title}</h2>
                <p className={styles.shelfSubtitle}>{shelf.subtitle}</p>
              </div>
              <div className={styles.shelfStats}>
                <span>{shelf.items.length} Titel</span>
              </div>
            </div>

            <div className={styles.posterRow}>
              {shelf.items.slice(0, 10).map((item, itemIndex) => {
                const heroIndex = safeHeroItems.findIndex((entry) => entry.id === item.id);
                const isFocused = focusTarget?.zone === "shelf" && focusTarget.rowIndex === shelves.findIndex((entry) => entry.id === shelf.id) + 1 && focusTarget.itemIndex === itemIndex;

                return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.posterCard} ${isFocused ? styles.focusedItem : ""}`}
                  data-focus-key={`shelf-${shelves.findIndex((entry) => entry.id === shelf.id) + 1}-${itemIndex}`}
                  onClick={() => {
                    pauseAutoplay();
                    if (heroIndex >= 0) setActiveIndex(heroIndex);
                    setFocusTarget({ zone: "shelf", rowIndex: shelves.findIndex((entry) => entry.id === shelf.id) + 1, itemIndex, heroIndex: heroIndex >= 0 ? heroIndex : 0 });
                  }}
                  onFocus={() => {
                    pauseAutoplay();
                    setFocusTarget({ zone: "shelf", rowIndex: shelves.findIndex((entry) => entry.id === shelf.id) + 1, itemIndex, heroIndex: heroIndex >= 0 ? heroIndex : 0 });
                  }}
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    className={styles.posterImage}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = "/c/header.jpg";
                    }}
                  />
                  <div className={styles.posterOverlay} />
                  <div className={styles.posterMeta}>
                    <span className={styles.posterType}>{item.type}</span>
                    <h3 className={`${styles.posterTitle} font-display`}>{item.title}</h3>
                    <p className={styles.posterInfo}>{item.genre} · {item.year || "Archiv"} · {(item.rating || 0).toFixed(1)}</p>
                  </div>
                </button>
              )})}
            </div>
          </section>
        ))}
      </section>
    </div>
  );
}