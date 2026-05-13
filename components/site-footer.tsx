import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/10 py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 text-sm text-zinc-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>Baba Ecke 2026 · Cine-Community mit Charakter, Nostalgie und Progress.</p>
        <div className="flex gap-5">
          <Link href="/" className="hover:text-zinc-100">
            Home
          </Link>
          <Link href="/my-list" className="hover:text-zinc-100">
            My List
          </Link>
          <Link href="/streams" className="hover:text-zinc-100">
            Streams
          </Link>
        </div>
      </div>
    </footer>
  );
}
