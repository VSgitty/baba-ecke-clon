import { tickerTitles } from "@/data/content";

export function CineTicker() {
  const items = [...tickerTitles, ...tickerTitles];

  return (
    <section
      id="cine-ticker-root"
      className="relative z-30 w-full overflow-hidden border-y py-2.5"
      style={{
        borderColor: "rgba(245,176,52,0.1)",
        background:
          "linear-gradient(90deg, rgba(4,6,14,0.95), rgba(6,9,18,0.92) 50%, rgba(4,6,14,0.95))",
        boxShadow: "0 0 40px -10px rgba(245,176,52,0.08)"
      }}
      aria-label="Cine ticker"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-[#050912] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-[#050912] to-transparent" />
      <div className="overflow-hidden px-0">
        <div className="movie-list-track ticker-track whitespace-nowrap text-[0.78rem] font-bold uppercase tracking-[0.12em]">
          {items.map((title, index) => (
            <span
              key={`${title}-${index}`}
              className="mx-4 inline-block"
              style={{
                color:
                  index % 6 === 0
                    ? "var(--brand)"
                    : index % 3 === 0
                      ? "rgba(34,211,238,0.7)"
                      : "rgba(148,163,184,0.5)",
                textShadow:
                  index % 6 === 0 ? "0 0 14px rgba(245,176,52,0.45)" : undefined
              }}
            >
              {index % 6 === 0 ? "★" : "·"} {title}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

