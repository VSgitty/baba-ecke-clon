import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-r from-emerald-500/95 to-cyan-500/95 px-6 py-8 text-white shadow-[0_30px_80px_-40px_rgba(15,140,122,0.75)] sm:px-10 sm:py-10">
        <div className="absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/80">Bereit fuer den Relaunch</p>
            <h3 className="mt-2 max-w-[20ch] text-2xl font-semibold leading-tight sm:text-3xl">
              Deine Filmwelt. Klarer, schneller, hochwertiger.
            </h3>
          </div>
          <Button asChild variant="ghost" size="lg" className="bg-white text-zinc-900 hover:bg-white/90">
            <Link href="/my-list">
              Jetzt My List nutzen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
