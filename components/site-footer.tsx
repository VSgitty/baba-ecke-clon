import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-black/5 py-10 dark:border-white/10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>baba-ecke 2026. Cine Community mit Struktur, Charakter und Tempo.</p>
        <div className="flex gap-5">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/my-list" className="hover:text-foreground">
            My List
          </Link>
          <Link href="/streams" className="hover:text-foreground">
            Streams
          </Link>
        </div>
      </div>
    </footer>
  );
}
