"use client";

import Image from "next/image";

type FranchiseLogoItem = {
  slug: string;
  title: string;
  logoUrl: string | null;
  accent?: string;
};

export function FranchiseLogoSlider({ items }: { items: FranchiseLogoItem[] }) {
  const filtered = items.filter((item) => item.logoUrl);
  if (!filtered.length) return null;

  const loop = [...filtered, ...filtered];

  return (
    <section className="relative z-20 -mt-20 pb-4 pt-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#060910] via-[#060910d9] to-transparent" />

      <div className="relative mx-auto w-full max-w-[1800px] safe-reel-inline">
        <div
          className="relative overflow-hidden rounded-2xl border px-3 py-3 sm:px-5"
          style={{
            borderColor: "rgba(255,255,255,0.1)",
            background:
              "linear-gradient(170deg, rgba(7,11,20,0.92), rgba(5,8,16,0.9) 48%, rgba(3,6,14,0.94))",
            boxShadow: "0 24px 80px -38px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#060910] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#060910] to-transparent" />

          <div className="franchise-logo-track flex w-max items-center gap-8 sm:gap-10">
            {loop.map((item, index) => (
              <article
                key={`${item.slug}-${index}`}
                className="group relative flex h-24 w-[220px] shrink-0 items-center justify-center rounded-xl border px-5"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${item.accent || "rgba(245,176,52,0.2)"}, transparent 70%)`,
                  }}
                />

                {item.logoUrl ? (
                  <Image
                    src={item.logoUrl}
                    alt={`${item.title} logo`}
                    width={260}
                    height={90}
                    className="relative z-[1] max-h-[64px] w-auto max-w-full object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.65)]"
                    unoptimized={item.logoUrl.endsWith(".svg")}
                  />
                ) : (
                  <span className="relative z-[1] font-display text-2xl uppercase tracking-wide text-zinc-100">{item.title}</span>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}