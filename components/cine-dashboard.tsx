"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dice5, ExternalLink, Filter, Flame, Sparkles, Star } from "lucide-react";

import type { CatalogItem } from "@/lib/catalog";
import { franchises } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const WATCHLIST_KEY = "baba_watchlist_v3";
const FRANCHISE_KEY = "baba_franchise_v3";

type FranchiseState = Record<string, Record<string, boolean>>;

type CineDashboardProps = {
  catalog: CatalogItem[];
};

const FRANCHISE_SVG_BY_SLUG: Record<string, string> = {
  "harry-potter": "/c/franchise/fantasy.svg",
  scream: "/c/franchise/horror.svg",
  saw: "/c/franchise/horror.svg"
};

const FRANCHISE_TONE_BY_SLUG: Record<string, string> = {
  "harry-potter": "franchise-tone-fantasy",
  scream: "franchise-tone-horror",
  saw: "franchise-tone-horror"
};

function normalizeTitle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function buildInitialFranchiseState(): FranchiseState {
  return Object.fromEntries(
    franchises.map((franchise) => [
      franchise.slug,
      Object.fromEntries(franchise.parts.map((part) => [part.id, false]))
    ])
  );
}

export function CineDashboard({ catalog }: CineDashboardProps) {
  const [watchlist, setWatchlist] = useState<Record<string, string>>({});
  const [franchiseState, setFranchiseState] = useState<FranchiseState>(buildInitialFranchiseState);
  const [typeFilter, setTypeFilter] = useState<"all" | "movie" | "series">("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [roulettePick, setRoulettePick] = useState<CatalogItem | null>(null);

  type InfoPos = { left: number; top: number; showLeft: boolean };
  const [hoveredItem, setHoveredItem] = useState<CatalogItem | null>(null);
  const [infoPos, setInfoPos] = useState<InfoPos | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const rawWatchlist = window.localStorage.getItem(WATCHLIST_KEY);
    const rawFranchise = window.localStorage.getItem(FRANCHISE_KEY);

    if (rawWatchlist) {
      try {
        setWatchlist(JSON.parse(rawWatchlist) as Record<string, string>);
      } catch {
        setWatchlist({});
      }
    }

    if (rawFranchise) {
      try {
        setFranchiseState((prev) => ({
          ...prev,
          ...(JSON.parse(rawFranchise) as FranchiseState)
        }));
      } catch {
        setFranchiseState(buildInitialFranchiseState());
      }
    }
  }, []);

  const genres = useMemo(() => {
    const values = new Set(catalog.map((item) => item.genre).filter(Boolean));
    return ["all", ...Array.from(values).slice(0, 10)];
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const typeOk = typeFilter === "all" || item.type === typeFilter;
      const genreOk = genreFilter === "all" || item.genre === genreFilter;
      return typeOk && genreOk;
    });
  }, [catalog, typeFilter, genreFilter]);

  const continueWatching = useMemo(() => {
    return franchises
      .map((franchise) => {
        const nextPart = franchise.parts.find((part) => !franchiseState[franchise.slug]?.[part.id]);
        const seen = franchise.parts.filter((part) => franchiseState[franchise.slug]?.[part.id]).length;
        return nextPart
          ? {
              franchise: franchise.title,
              part: nextPart.title,
              progress: Math.round((seen / franchise.parts.length) * 100)
            }
          : null;
      })
      .filter((item): item is { franchise: string; part: string; progress: number } => Boolean(item));
  }, [franchiseState]);

  const communityPulse = useMemo(() => {
    return [
      { label: "In Watchlist", value: Object.keys(watchlist).length.toString() },
      { label: "Gefilterte Titel", value: filteredCatalog.length.toString() },
      {
        label: "Franchise Progress",
        value: `${Object.values(franchiseState)
          .flatMap((parts) => Object.values(parts))
          .filter(Boolean).length}`
      }
    ];
  }, [watchlist, filteredCatalog.length, franchiseState]);

  const franchiseVisuals = useMemo(() => {
    const normalizedCatalog = catalog.map((item) => ({
      ...item,
      normalizedTitle: normalizeTitle(item.title)
    }));

    return Object.fromEntries(
      franchises.map((franchise) => {
        const franchiseTitle = normalizeTitle(franchise.title);
        const partTitles = franchise.parts.map((part) => normalizeTitle(part.title));

        const matchedPoster =
          normalizedCatalog.find((item) => item.normalizedTitle.includes(franchiseTitle))?.poster ||
          normalizedCatalog.find((item) => partTitles.some((title) => item.normalizedTitle.includes(title)))?.poster ||
          null;

        return [
          franchise.slug,
          {
            poster: matchedPoster,
            svgAsset: FRANCHISE_SVG_BY_SLUG[franchise.slug] || "/c/franchise/action.svg",
            toneClass: FRANCHISE_TONE_BY_SLUG[franchise.slug] || "franchise-tone-action"
          }
        ];
      })
    ) as Record<string, { poster: string | null; svgAsset: string; toneClass: string }>;
  }, [catalog]);

  function persistWatchlist(next: Record<string, string>) {
    setWatchlist(next);
    window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  }

  function toggleWatchlist(item: CatalogItem) {
    const next = { ...watchlist };
    if (next[item.id]) {
      delete next[item.id];
    } else {
      next[item.id] = new Date().toISOString();
    }
    persistWatchlist(next);
  }

  function toggleFranchisePart(slug: string, partId: string) {
    setFranchiseState((prev) => {
      const next = {
        ...prev,
        [slug]: {
          ...prev[slug],
          [partId]: !prev[slug]?.[partId]
        }
      };
      window.localStorage.setItem(FRANCHISE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function spinRoulette() {
    if (!filteredCatalog.length) {
      setRoulettePick(null);
      return;
    }
    const index = Math.floor(Math.random() * filteredCatalog.length);
    setRoulettePick(filteredCatalog[index] ?? null);
  }

  const handleCardEnter = useCallback((item: CatalogItem, event: React.MouseEvent<HTMLElement>) => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    const rect = event.currentTarget.getBoundingClientRect();
    const infoW = 272;
    const infoH = 392;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const showLeft = vw - rect.right < infoW + 24;
    const horizontalOffset = 24;
    const verticalLift = Math.min(140, Math.max(78, rect.height * 0.46));
    const rawLeft = showLeft ? rect.left - infoW - horizontalOffset : rect.right - 64;
    const left = Math.max(8, Math.min(rawLeft, vw - infoW - 8));
    const top  = Math.max(8, Math.min(rect.top - verticalLift, vh - infoH - 8));
    setInfoPos({ left, top, showLeft });
    setHoveredItem(item);
  }, []);

  const handleCardLeave = useCallback(() => {
    leaveTimerRef.current = setTimeout(() => {
      setHoveredItem(null);
      setInfoPos(null);
    }, 130);
  }, []);

  const cancelLeave = useCallback(() => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
  }, []);

  function handleCoverMove(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const tiltX = ((0.5 - py) * 10).toFixed(2);
    const tiltY = ((px - 0.5) * 12).toFixed(2);
    event.currentTarget.style.setProperty("--tilt-x", `${tiltX}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${tiltY}deg`);
  }

  function resetCoverMove(event: React.MouseEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div className="space-y-10">
      <section className="site-shell grid w-full gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {[
          { label: "Gesamtkatalog", value: catalog.length, accent: "var(--brand)" },
          { label: "Watchlist", value: Object.keys(watchlist).length, accent: "var(--neon-cyan)" },
          { label: "Continue Watching", value: continueWatching.length, accent: "var(--neon-purple)" },
          { label: "Gefilterte Titel", value: filteredCatalog.length, accent: "var(--brand-strong)" }
        ].map((stat) => (
          <div key={stat.label} className="stat-panel px-5 py-4">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">{stat.label}</p>
            <p
              className="font-display text-4xl"
              style={{ color: stat.accent, textShadow: `0 0 24px ${stat.accent}55` }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="site-shell grid w-full gap-4 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <Card className="cine-panel">
          <CardHeader>
            <CardTitle>Weiter schauen</CardTitle>
            <CardDescription>Naechste sinnvolle Schritte ueber deine Franchises hinweg.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {continueWatching.map((item) => (
              <div
                key={`${item.franchise}-${item.part}`}
                className="rounded-xl border border-white/15 bg-white/[0.04] p-3"
              >
                <p className="text-sm font-medium text-zinc-100">{item.franchise}</p>
                <p className="text-sm text-zinc-300">Next: {item.part}</p>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[var(--brand)]"
                    style={{ width: `${item.progress}%` }}
                    aria-hidden
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="cine-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice5 className="h-5 w-5 text-[var(--brand)]" />
              Film Roulette
            </CardTitle>
            <CardDescription>Ziehe den naechsten Film passend zum aktuellen Filter.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={spinRoulette} className="w-full">
              Spin
            </Button>
            <div className="rounded-xl border border-white/15 bg-white/[0.04] p-3">
              {roulettePick ? (
                <>
                  <p className="font-medium text-zinc-100">{roulettePick.title}</p>
                  <p className="text-sm text-zinc-300">
                    {roulettePick.type} | {roulettePick.genre}
                  </p>
                </>
              ) : (
                <p className="text-sm text-zinc-300">Warte auf den ersten Spin...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="site-shell w-full px-4 sm:px-6 lg:px-8">
        <Card className="cine-panel">
          <CardHeader>
            <CardTitle>Franchise Tracker</CardTitle>
            <CardDescription>Progress pro Reihe mit schnellem Toggle fuer gesehene Teile.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {franchises.map((franchise) => {
              const seen = franchise.parts.filter((part) => franchiseState[franchise.slug]?.[part.id]).length;
              const progress = Math.round((seen / franchise.parts.length) * 100);
              const visual = franchiseVisuals[franchise.slug];
              const railItems = [...franchise.parts.map((part) => part.title), ...franchise.parts.map((part) => part.title)];
              return (
                <div
                  key={franchise.slug}
                  className="franchise-showcase rounded-2xl border border-white/15 bg-white/[0.04]"
                >
                  <div className={`franchise-banner ${visual?.toneClass || "franchise-tone-action"}`}>
                    {visual?.poster ? (
                      <img
                        src={visual.poster}
                        alt={`${franchise.title} Banner`}
                        loading="lazy"
                        decoding="async"
                        className="franchise-banner-media"
                      />
                    ) : (
                      <div className="franchise-banner-fallback" aria-hidden />
                    )}
                    <div className="franchise-banner-shade" aria-hidden />
                    <img
                      src={visual?.svgAsset || "/c/franchise/action.svg"}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="franchise-banner-svg"
                      aria-hidden
                    />
                    <div className="franchise-rail" aria-hidden>
                      <div className="franchise-rail-track">
                        {railItems.map((title, index) => (
                          <span key={`${franchise.slug}-${title}-${index}`}>{title}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-medium text-zinc-100">{franchise.title}</p>
                      <Badge variant="muted">{progress}%</Badge>
                    </div>
                    <div className="space-y-2">
                      {franchise.parts.map((part) => (
                        <label key={part.id} className="flex items-center justify-between gap-3 rounded-lg px-1 py-1.5">
                          <span className="text-sm text-zinc-300">
                            {part.title} ({part.year})
                          </span>
                          <input
                            type="checkbox"
                            checked={Boolean(franchiseState[franchise.slug]?.[part.id])}
                            onChange={() => toggleFranchisePart(franchise.slug, part.id)}
                            className="h-4 w-4 rounded border-border"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="site-shell w-full px-4 sm:px-6 lg:px-8">
        <Card className="cine-panel">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="cine-section-label mb-1">
                  <CardTitle className="text-xl">Cine Katalog</CardTitle>
                </div>
                <CardDescription>Alle Titel aus der Originalseite, neu aufbereitet.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(["all", "movie", "series"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      typeFilter === t
                        ? "bg-[var(--brand)] text-black shadow-[0_0_16px_rgba(245,176,52,0.45)]"
                        : "border border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {t === "all" ? "Alle" : t === "movie" ? "Filme" : "Serien"}
                  </button>
                ))}
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <select
                    className="h-8 rounded-full border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-zinc-300 outline-none focus:border-[var(--brand)]/40"
                    value={genreFilter}
                    onChange={(event) => setGenreFilter(event.target.value)}
                    aria-label="Genre Filter"
                  >
                    {genres.map((genre) => (
                      <option key={genre} value={genre} className="bg-[#080c1a]">
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              {communityPulse.map((entry) => (
                <div
                  key={entry.label}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3"
                >
                  <p className="text-[11px] uppercase tracking-widest text-zinc-500">{entry.label}</p>
                  <p className="mt-0.5 font-display text-3xl text-zinc-100">{entry.value}</p>
                </div>
              ))}
            </div>

            <div className="catalog-shelf grid gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {filteredCatalog.slice(0, 60).map((item) => {
                return (
                  <article
                    key={item.id}
                    className="cover-card p-0"
                    onMouseMove={handleCoverMove}
                    onMouseEnter={(e) => handleCardEnter(item, e)}
                    onMouseLeave={(e) => { resetCoverMove(e); handleCardLeave(); }}
                  >
                    <div className="cover-tilt relative aspect-[2/3] w-full bg-zinc-950">
                      {item.poster ? (
                        <img
                          src={item.poster}
                          alt={`${item.title} Cover`}
                          loading="lazy"
                          decoding="async"
                          className="cover-media h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center">
                          <span className="text-[10px] text-zinc-600 opacity-40">Kein Cover</span>
                        </div>
                      )}
                      <div className="cover-spine" aria-hidden />
                      <div className="cover-shine" aria-hidden />

                      {/* Subtle bottom vignette */}
                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
                        style={{ background: "linear-gradient(to top, rgba(4,6,14,0.7), transparent)" }}
                        aria-hidden
                      />
                      {/* Rating badge */}
                      {item.rating ? (
                        <div
                          className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold backdrop-blur-sm"
                          style={{
                            background: "rgba(0,0,0,0.55)",
                            border: "1px solid rgba(245,176,52,0.3)",
                            color: "var(--brand-strong)"
                          }}
                        >
                          <Star className="h-2.5 w-2.5 fill-current" />
                          {item.rating.toFixed(1)}
                        </div>
                      ) : null}
                    </div>

                    <div className="cover-reflection" aria-hidden />
                  </article>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="site-shell grid w-full gap-3 px-4 pb-6 sm:grid-cols-3 sm:px-6 lg:px-8">
        <Card className="cine-panel sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-4 w-4" style={{ color: "var(--brand)" }} />
              Community Pulse
            </CardTitle>
            <CardDescription>Trend-Sektion fuer schnelle Orientierung im Feed.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["SAW X", "The Substance", "Arcane S2", "Interstellar", "Scream VI"].map((trend) => (
              <span
                key={trend}
                className="rounded-full border px-3 py-1 text-[11px] font-medium text-zinc-300 transition hover:border-[var(--brand)]/40 hover:text-[var(--brand-strong)]"
                style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
              >
                {trend}
              </span>
            ))}
          </CardContent>
        </Card>
        <Card className="cine-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-4 w-4" style={{ color: "var(--brand)" }} />
              Quick Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Das neue Layout reduziert visuelle Last, steigert Lesbarkeit und bringt die gleiche
              Inhaltslogik der Altseite in eine moderne, conversion-starke Struktur.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ── FLOATING INFO CARD OVERLAY ───────────────────────────── */}
      <AnimatePresence>
        {hoveredItem && infoPos && (
          <motion.div
            key={hoveredItem.id}
            className="info-card-float fixed z-[200] w-[272px]"
            style={{ left: infoPos.left, top: infoPos.top }}
            initial={{ opacity: 0, x: infoPos.showLeft ? 10 : -10, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: infoPos.showLeft ? 10 : -10, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            onMouseEnter={cancelLeave}
            onMouseLeave={handleCardLeave}
          >
            {/* Neon top accent */}
            <div
              className="h-[2px] w-full"
              style={{ background: "linear-gradient(90deg, var(--brand), var(--neon-cyan), transparent)" }}
            />

            {/* Poster thumbnail */}
            {hoveredItem.poster && (
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={hoveredItem.poster}
                  alt={hoveredItem.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(5,8,18,0.88) 0%, rgba(5,8,18,0.2) 50%, transparent 100%)" }}
                />
                {/* Type badge */}
                <span
                  className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: hoveredItem.type === "series" ? "var(--neon-cyan)" : "var(--brand)"
                  }}
                >
                  {hoveredItem.type === "series" ? "Serie" : "Film"}
                </span>
              </div>
            )}

            <div className="relative z-10 p-4">
              <motion.h3
                className="font-display text-2xl leading-tight"
                style={{ color: "var(--brand-strong)", textShadow: "0 0 20px rgba(245,176,52,0.3)" }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06, duration: 0.2 }}
              >
                {hoveredItem.title}
              </motion.h3>

              <motion.div
                className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                {hoveredItem.year && (
                  <span className="text-[11px] text-zinc-400">{hoveredItem.year}</span>
                )}
                {hoveredItem.year && <span className="text-zinc-700">·</span>}
                <span className="text-[11px] capitalize text-zinc-400">{hoveredItem.genre}</span>
                {hoveredItem.rating ? (
                  <>
                    <span className="text-zinc-700">·</span>
                    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-400">
                      <Star className="h-3 w-3 fill-current" />
                      {hoveredItem.rating.toFixed(1)}
                    </span>
                  </>
                ) : null}
              </motion.div>

              {hoveredItem.description && (
                <motion.p
                  className="mt-3 line-clamp-3 text-xs leading-relaxed text-zinc-300"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14, duration: 0.22 }}
                >
                  {hoveredItem.description}
                </motion.p>
              )}

              <motion.div
                className="mt-4 flex gap-2"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.22 }}
              >
                <button
                  className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
                  style={
                    watchlist[hoveredItem.id]
                      ? {
                          background: "rgba(245,176,52,0.15)",
                          border: "1px solid rgba(245,176,52,0.45)",
                          color: "var(--brand-strong)"
                        }
                      : {
                          background: "rgba(245,176,52,0.1)",
                          border: "1px solid rgba(245,176,52,0.28)",
                          color: "var(--brand)"
                        }
                  }
                  onClick={() => toggleWatchlist(hoveredItem)}
                >
                  {watchlist[hoveredItem.id] ? "✓ Gemerkt" : "+ Watchlist"}
                </button>
                {hoveredItem.streamUrl && (
                  <a
                    href={hoveredItem.streamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300 transition hover:border-white/20 hover:text-white"
                  >
                    Stream <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
