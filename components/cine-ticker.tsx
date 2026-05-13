import { tickerTitles } from "@/data/content";

export function CineTicker() {
  const items = [...tickerTitles, ...tickerTitles];

  return (
    <section className="mx-auto w-full max-w-[1800px] overflow-hidden border-y border-white/5 bg-[#090d18] px-0 py-2" aria-label="Cine ticker">
      <div className="px-2 sm:px-4">
        <div className="movie-list-track ticker-track whitespace-nowrap text-[0.84rem] font-semibold uppercase tracking-[0.1em] text-zinc-500">
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
