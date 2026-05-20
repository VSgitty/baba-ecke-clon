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

const INTRO_DURATION_MS = 3200;
const IDLE_TIMEOUT_MS = 45000;

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

function isSameFocusTarget(a: FocusTarget | null, b: FocusTarget): boolean {
  return Boolean(a && a.zone === b.zone && a.rowIndex === b.rowIndex && a.itemIndex === b.itemIndex && a.heroIndex === b.heroIndex);
}

export function TvCinematicHome({ heroItems, shelves, backgroundItems }: TvCinematicHomeProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  const [isRemoteMode, setIsRemoteMode] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [idleVisible, setIdleVisible] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const resumeAutoplayRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const introTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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

  const clearIdleTimer = () => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  const scheduleIdleTimer = () => {
    clearIdleTimer();
    idleTimerRef.current = window.setTimeout(() => {
      setIdleVisible(true);
      setIsRemoteMode(false);
      setFocusTarget(null);
    }, IDLE_TIMEOUT_MS);
  };

  const ensureAudioReady = async () => {
    if (typeof window === "undefined") return false;
    const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return false;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    try {
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
      const running = audioContextRef.current.state === "running";
      setAudioReady(running);
      return running;
    } catch {
      return false;
    }
  };

  const playFocusSound = async (tone: "move" | "select" = "move") => {
    const ready = await ensureAudioReady();
    if (!ready || !audioContextRef.current) return;

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime;
    const duration = tone === "select" ? 0.14 : 0.08;

    oscillator.type = tone === "select" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(tone === "select" ? 520 : 360, start);
    oscillator.frequency.exponentialRampToValueAtTime(tone === "select" ? 660 : 430, start + duration);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(tone === "select" ? 0.035 : 0.02, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  };

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

  const registerActivity = (withAudio = false) => {
    if (introVisible) setIntroVisible(false);
    if (idleVisible) setIdleVisible(false);
    if (withAudio) {
      void ensureAudioReady();
    }
    scheduleIdleTimer();
  };

  const setFocusedPreview = (target: FocusTarget, commit = false) => {
    pauseAutoplay();
    if (!isSameFocusTarget(focusTarget, target)) {
      setFocusTarget(target);
      void playFocusSound(commit ? "select" : "move");
    } else if (commit) {
      void playFocusSound("select");
    }

    if (commit) {
      setActiveIndex(target.heroIndex);
    }
  };

  useEffect(() => {
    if (safeHeroItems.length < 2 || isRemoteMode || introVisible || idleVisible) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safeHeroItems.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [idleVisible, introVisible, isRemoteMode, safeHeroItems.length]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000 * 20);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    introTimerRef.current = window.setTimeout(() => {
      setIntroVisible(false);
      scheduleIdleTimer();
    }, INTRO_DURATION_MS);

    return () => {
      if (introTimerRef.current) {
        window.clearTimeout(introTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = () => {
      if (!introVisible && !idleVisible) {
        scheduleIdleTimer();
      }
    };

    const handlePointerActivity = () => {
      registerActivity(true);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mousedown", handlePointerActivity);
    window.addEventListener("touchstart", handlePointerActivity, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousedown", handlePointerActivity);
      window.removeEventListener("touchstart", handlePointerActivity);
    };
  }, [idleVisible, introVisible]);

  useEffect(() => {
    return () => {
      if (resumeAutoplayRef.current) {
        window.clearTimeout(resumeAutoplayRef.current);
      }
      clearIdleTimer();
      void audioContextRef.current?.close();
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

      registerActivity(true);

      if (introVisible || idleVisible) {
        return;
      }

      const current = focusTarget || navigableRows[0];
      if (!current) return;

      const maxShelfRow = shelves.length;

      if (event.key === "ArrowLeft") {
        const next = findTarget(current.zone, current.rowIndex, current.itemIndex - 1) || current;
        setFocusedPreview(next);
        return;
      }

      if (event.key === "ArrowRight") {
        const next = findTarget(current.zone, current.rowIndex, current.itemIndex + 1) || current;
        setFocusedPreview(next);
        return;
      }

      if (event.key === "ArrowDown") {
        const nextRowIndex = Math.min(maxShelfRow, current.rowIndex + 1);
        const nextZone = nextRowIndex === 0 ? "queue" : "shelf";
        const next = findTarget(nextZone, nextRowIndex, current.itemIndex) || findTarget(nextZone, nextRowIndex, 0) || current;
        setFocusedPreview(next);
        return;
      }

      if (event.key === "ArrowUp") {
        const nextRowIndex = Math.max(0, current.rowIndex - 1);
        const nextZone = nextRowIndex === 0 ? "queue" : "shelf";
        const next = findTarget(nextZone, nextRowIndex, current.itemIndex) || findTarget(nextZone, nextRowIndex, 0) || current;
        setFocusedPreview(next);
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        setFocusedPreview(current, true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusTarget, idleVisible, introVisible, navigableRows, shelves.length]);

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
      <AnimatePresence>
        {introVisible && (
          <motion.div className={styles.modeOverlay} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className={styles.modeNoise} />
            <div className={styles.modePanel}>
              <p className={styles.modeEyebrow}>Baba Ecke TV</p>
              <h1 className={`${styles.modeTitle} font-display`}>CINEMA MODE</h1>
              <p className={styles.modeCopy}>Cover-Loop, grosse Reihen und direkte Navigation fuer TV, Console und Lean-Back-Screens.</p>
              <button type="button" className={styles.modeButton} onClick={() => registerActivity(true)}>
                Starten
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {idleVisible && !introVisible && (
          <motion.div className={styles.modeOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className={styles.modeNoise} />
            <div className={`${styles.modePanel} ${styles.idlePanel}`}>
              <p className={styles.modeEyebrow}>Idle Screensaver</p>
              <h2 className={`${styles.modeTitle} font-display`}>{activeHero.title}</h2>
              <p className={styles.modeCopy}>Druecke OK, Enter oder bewege den Zeiger, um direkt in die Navigation zurueckzukehren.</p>
              <div className={styles.idleMetaRow}>
                <span>{formatClock(now)}</span>
                <span>{formatDate(now)}</span>
                <span>{audioReady ? "Focus Audio bereit" : "Audio bei Interaktion"}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div key={`rail-${railIndex}`} className={styles.coverRail}>
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
              <span className={styles.genrePill}>{previewHero.genre}</span>
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
                {nextQueue.map(({ item, index }) => {
                  const target: FocusTarget = {
                    zone: "queue",
                    rowIndex: 0,
                    itemIndex: index,
                    heroIndex: (activeIndex + index + 1) % safeHeroItems.length,
                  };

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.queueItem} ${isSameFocusTarget(focusTarget, target) ? styles.focusedItem : ""}`}
                      data-focus-key={`queue-0-${index}`}
                      onClick={() => {
                        registerActivity(true);
                        setFocusedPreview(target, true);
                      }}
                      onFocus={() => {
                        if (isSameFocusTarget(focusTarget, target)) return;
                        registerActivity(true);
                        setFocusedPreview(target);
                      }}
                    >
                      <img src={item.poster} alt={item.title} className={styles.queuePoster} />
                      <div>
                        <p className={styles.queueItemTitle}>{item.title}</p>
                        <p className={styles.queueItemMeta}>{item.type} · {item.year || "Archiv"}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.shelvesWrap}>
        {shelves.map((shelf, shelfIndex) => {
          const shelfRowIndex = shelfIndex + 1;

          return (
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
                  const target: FocusTarget = {
                    zone: "shelf",
                    rowIndex: shelfRowIndex,
                    itemIndex,
                    heroIndex: heroIndex >= 0 ? heroIndex : 0,
                  };

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.posterCard} ${isSameFocusTarget(focusTarget, target) ? styles.focusedItem : ""}`}
                      data-focus-key={`shelf-${shelfRowIndex}-${itemIndex}`}
                      onClick={() => {
                        registerActivity(true);
                        setFocusedPreview(target, true);
                      }}
                      onFocus={() => {
                        if (isSameFocusTarget(focusTarget, target)) return;
                        registerActivity(true);
                        setFocusedPreview(target);
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
                  );
                })}
              </div>
            </section>
          );
        })}
      </section>
    </div>
  );
}