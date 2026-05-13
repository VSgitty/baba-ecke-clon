import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      className="mt-24 border-t py-12"
      style={{
        borderColor: "rgba(245,176,52,0.1)",
        background: "linear-gradient(180deg, transparent, rgba(3,5,12,0.6))"
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div>
            <p
              className="mb-1 text-xs font-bold tracking-[0.3em]"
              style={{ color: "var(--brand)", textShadow: "0 0 16px rgba(245,176,52,0.35)" }}
            >
              BABA ECKE
            </p>
            <p className="max-w-[28ch] text-sm leading-relaxed text-zinc-500">
              Deine digitale Videothek im Look der 90er. Alle Titel, alle Infos, alles für echte Cineasten.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-10 text-sm">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Navigation</p>
              {[
                { href: "/", label: "Home" },
                { href: "/my-list", label: "My List" },
                { href: "/streams", label: "Streams" }
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-zinc-400 transition-colors hover:text-zinc-100"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="cine-divider mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-600">
            © 2026 Baba Ecke · Cine-Community mit Charakter, Nostalgie und Progress.
          </p>
          <div className="flex gap-4 text-xs text-zinc-600">
            <span>Datenschutz</span>
            <span>Impressum</span>
            <span>Kontakt</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

