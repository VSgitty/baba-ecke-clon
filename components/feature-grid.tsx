import { Film, Sparkles, Users, Zap } from "lucide-react";

import { featureItems } from "@/data/content";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const iconMap = {
  spark: Sparkles,
  film: Film,
  users: Users,
  zap: Zap
} as const;

export function FeatureGrid() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--brand)]">Core Features</p>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Klarer Aufbau statt Overload</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {featureItems.map((item, index) => {
          const Icon = iconMap[item.icon];
          return (
            <ScrollReveal key={item.title} delay={index * 0.04}>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  Optimiert fuer mobile Nutzung, schnelles Scannen und klare Entscheidungen.
                </CardContent>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
