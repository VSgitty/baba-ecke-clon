import { tickerTitles } from "@/data/content";

export function CineTicker() {
  const items = [...tickerTitles, ...tickerTitles];

  return (
    <section className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-4 sm:px-6 lg:px-8" aria-label="Cine ticker">
      <div className="cine-panel rounded-2xl px-0 py-3">
        <div className="ticker-track whitespace-nowrap text-sm text-zinc-300">
          {items.map((title, index) => (
            <span key={`${title}-${index}`} className="mx-3 inline-block">
              {index % 6 === 0 ? "★" : "•"} {title}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
