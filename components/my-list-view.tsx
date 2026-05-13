"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { CatalogItem } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const WATCHLIST_KEY = "baba_watchlist_v3";

export function MyListView({ catalog }: { catalog: CatalogItem[] }) {
  const [watchlist, setWatchlist] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WATCHLIST_KEY);
      if (raw) setWatchlist(JSON.parse(raw) as Record<string, string>);
    } catch {
      setWatchlist({});
    }
  }, []);

  const items = useMemo(
    () => catalog.filter((entry) => Boolean(watchlist[entry.id])),
    [catalog, watchlist]
  );

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>My List & Progress</CardTitle>
          <CardDescription>Deine gemerkten Titel aus dem Cine Katalog.</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-border/70 bg-black/[0.02] p-4 dark:bg-white/[0.03]">
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {item.type} | {item.genre} {item.year ? `| ${item.year}` : ""}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Noch keine Titel in deiner Watchlist.</p>
              <Button asChild className="mt-4">
                <Link href="/">Zum Katalog</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
