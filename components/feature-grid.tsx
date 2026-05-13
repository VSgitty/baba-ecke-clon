import { Film, Sparkles, Users, Zap } from "lucide-react";

import { featureItems } from "@/data/content";
import { ScrollReveal } from "@/components/scroll-reveal";

const iconMap = {
  spark: Sparkles,
  film: Film,
  users: Users,
  zap: Zap
} as const;

const accentColors = ["var(--brand)", "var(--neon-cyan)", "var(--neon-purple)", "var(--brand-strong)"] as const;

export function FeatureGrid() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "var(--brand)", textShadow: "0 0 16px rgba(245,176,52,0.38)" }}
        >
          Core Features
        </p>
        <h2
          className="font-display text-3xl tracking-wide text-zinc-100 sm:text-4xl"
        >
          Klarer Aufbau statt Overload
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {featureItems.map((item, index) => {
          const Icon = iconMap[item.icon];
          const accent = accentColors[index % accentColors.length];
          return (
            <ScrollReveal key={item.title} delay={index * 0.06}>
              <div
                className="cine-panel group h-full rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
                style={{
                  borderColor: `color-mix(in srgb, ${accent} 18%, transparent)`
                }}
              >
                <div
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all group-hover:scale-110"
                  style={{
                    background: `color-mix(in srgb, ${accent} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
                    color: accent,
                    boxShadow: `0 0 16px color-mix(in srgb, ${accent} 20%, transparent)`
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 font-display text-xl tracking-wide text-zinc-100">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{item.description}</p>
                <p className="mt-2 text-xs text-zinc-600">
                  Optimiert fuer mobile Nutzung, schnelles Scannen und klare Entscheidungen.
                </p>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}

