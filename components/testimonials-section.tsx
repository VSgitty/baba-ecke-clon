import { ScrollReveal } from "@/components/scroll-reveal";
import { testimonials } from "@/data/content";
import { Card, CardContent } from "@/components/ui/card";

export function TestimonialsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--brand)]">Feedback</p>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Vertrauen durch Klarheit</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((item, index) => (
          <ScrollReveal key={item.name} delay={index * 0.05}>
            <Card className="h-full">
              <CardContent className="space-y-4 p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">"{item.quote}"</p>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
