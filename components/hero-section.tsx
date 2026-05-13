import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

import { heroStats } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-10 pt-12 sm:pt-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_15%_5%,rgba(255,186,45,0.22),transparent_42%),radial-gradient(circle_at_88%_0%,rgba(88,225,255,0.18),transparent_34%)]" />

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-end lg:px-8">
        <div className="animate-float-in space-y-6">
          <Badge variant="muted" className="w-fit border-white/15 bg-white/5 text-zinc-200">
            NOW PLAYING
          </Badge>
          <h1 className="max-w-[17ch] text-5xl leading-[0.96] text-zinc-50 sm:text-6xl lg:text-7xl">
            Keine Standard-Filmseite. Eine persoenliche Filmwelt.
          </h1>
          <p className="max-w-[58ch] text-base text-zinc-300 sm:text-lg">
            Watchlists, Reviews, Franchise-Tracking und deine Kommentare - alles hier.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/my-list">
                Zur Sammlung
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/streams">
                Progress-System
                <PlayCircle className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="cine-panel cine-glow relative overflow-hidden rounded-3xl p-6">
          <div className="absolute inset-0">
            <Image
              src="/c/header.jpg"
              alt="Baba Ecke Header"
              fill
              priority
              className="object-cover opacity-40"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,18,0.35),rgba(5,8,18,0.88))]" />
          </div>

          <div className="relative">
            <p className="text-sm font-medium text-zinc-300">Community Snapshot</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md"
              >
                <p className="text-3xl font-semibold tracking-tight text-zinc-50">{stat.value}</p>
                <p className="mt-1 text-sm text-zinc-300">{stat.label}</p>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
