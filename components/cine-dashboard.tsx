"use client";

import { useEffect, useMemo, useState } from "react";
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

  function handleCoverMove(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const tiltX = ((0.5 - py) * 8).toFixed(2);
    const tiltY = ((px - 0.5) * 10).toFixed(2);
    event.currentTarget.style.setProperty("--tilt-x", `${tiltX}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${tiltY}deg`);
  }

  function resetCoverMove(event: React.MouseEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div className="space-y-8">
      <section className="site-shell grid w-full gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <Card className="cine-panel">
          <CardHeader className="pb-2">
            <CardDescription>Gesamtkatalog</CardDescription>
            <CardTitle className="text-3xl text-zinc-50">{catalog.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="cine-panel">
          <CardHeader className="pb-2">
            <CardDescription>Watchlist</CardDescription>
            <CardTitle className="text-3xl text-zinc-50">{Object.keys(watchlist).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="cine-panel">
          <CardHeader className="pb-2">
            <CardDescription>Continue Watching</CardDescription>
            <CardTitle className="text-3xl text-zinc-50">{continueWatching.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="cine-panel">
          <CardHeader className="pb-2">
            <CardDescription>Gefilterte Titel</CardDescription>
            <CardTitle className="text-3xl text-zinc-50">{filteredCatalog.length}</CardTitle>
          </CardHeader>
        </Card>
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
              return (
                <div
                  key={franchise.slug}
                  className="rounded-2xl border border-white/15 bg-white/[0.04] p-4"
                >
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
                <CardTitle>Cine Katalog</CardTitle>
                <CardDescription>Alle Titel aus der Originalseite, neu aufbereitet.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={typeFilter === "all" ? "default" : "ghost"}
                  onClick={() => setTypeFilter("all")}
                >
                  Alle
                </Button>
                <Button
                  size="sm"
                  variant={typeFilter === "movie" ? "default" : "ghost"}
                  onClick={() => setTypeFilter("movie")}
                >
                  Filme
                </Button>
                <Button
                  size="sm"
                  variant={typeFilter === "series" ? "default" : "ghost"}
                  onClick={() => setTypeFilter("series")}
                >
                  Serien
                </Button>
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <select
                    className="h-9 rounded-full border border-white/15 bg-white/5 pl-8 pr-3 text-sm"
                    value={genreFilter}
                    onChange={(event) => setGenreFilter(event.target.value)}
                    aria-label="Genre Filter"
                  >
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              {communityPulse.map((entry) => (
                <div
                  key={entry.label}
                  className="rounded-xl border border-white/15 bg-white/[0.04] p-3"
                >
                  <p className="text-xs text-zinc-400">{entry.label}</p>
                  <p className="text-xl font-semibold text-zinc-100">{entry.value}</p>
                </div>
              ))}
            </div>

            <div className="catalog-shelf grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {filteredCatalog.slice(0, 60).map((item) => {
                const inWatchlist = Boolean(watchlist[item.id]);
                return (
                  <article
                    key={item.id}
                    className="cover-card overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] p-0"
                    onMouseMove={handleCoverMove}
                    onMouseLeave={resetCoverMove}
                  >
                    <div className="cover-tilt relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
                      {item.poster ? (
                        <img
                          src={item.poster}
                          alt={`${item.title} Cover`}
                          loading="lazy"
                          decoding="async"
                          className="cover-media h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-xs text-zinc-500">Kein Cover</div>
                      )}
                      <div className="cover-spine" aria-hidden />
                      <div className="cover-shine" aria-hidden />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(5,8,18,0.82))]" />
                    </div>
                    <div className="cover-reflection" aria-hidden />
                    <div className="p-3">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <h3 className="line-clamp-1 text-[1.05rem] font-semibold leading-tight text-[#e7ba3f]">{item.title}</h3>
                      {item.rating ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-300">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {item.rating.toFixed(1)}
                        </span>
                      ) : null}
                    </div>

                    <p className="text-[11px] text-zinc-400">
                      {item.type} | {item.genre} {item.year ? `| ${item.year}` : ""}
                    </p>
                    <div className="cover-extra">
                      <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-zinc-300">
                        {item.description || "Kein Beschreibungstext hinterlegt."}
                      </p>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <Button size="sm" variant={inWatchlist ? "secondary" : "ghost"} className="h-8 px-2.5 text-xs" onClick={() => toggleWatchlist(item)}>
                          {inWatchlist ? "Gemerkt" : "Zur Watchlist"}
                        </Button>
                        {item.streamUrl ? (
                          <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs" asChild>
                            <a href={item.streamUrl} target="_blank" rel="noreferrer">
                              Stream
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="site-shell grid w-full gap-3 px-4 pb-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        <Card className="cine-panel sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-4 w-4 text-[var(--brand)]" />
              Community Pulse
            </CardTitle>
            <CardDescription>Trend-Sektion fuer schnelle Orientierung im Feed.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["SAW X", "The Substance", "Arcane S2", "Interstellar", "Scream VI"].map((trend) => (
              <Badge key={trend} variant="muted" className="rounded-full px-3 py-1">
                {trend}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <Card className="cine-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-4 w-4 text-[var(--brand)]" />
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
    </div>
  );
}
