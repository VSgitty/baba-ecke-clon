import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

import { heroStats } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-10 pt-14 sm:pt-20">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_15%_5%,rgba(15,140,122,0.20),transparent_45%),radial-gradient(circle_at_95%_0%,rgba(88,100,255,0.16),transparent_36%)]" />

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="animate-float-in space-y-6">
          <Badge variant="muted" className="w-fit">
            Premium Relaunch 2026
          </Badge>
          <h1 className="max-w-[15ch] text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            Eine cineastische Community. Neu gedacht.
          </h1>
          <p className="max-w-[58ch] text-base text-muted-foreground sm:text-lg">
            Die bekannte baba-ecke Struktur bleibt erhalten, aber mit modernem Interface,
            schneller Navigation und hochwertigem Erlebnis auf allen Geraeten.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/my-list">
                Zur My List
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/streams">
                Streams ansehen
                <PlayCircle className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white/75 p-6 shadow-[0_40px_80px_-40px_rgba(16,24,40,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/75">
          <p className="text-sm font-medium text-muted-foreground">Community Snapshot</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-black/5 bg-white/90 p-4 dark:border-white/10 dark:bg-zinc-950/60"
              >
                <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
