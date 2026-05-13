"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { navItems } from "@/data/content";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        borderColor: "rgba(245,176,52,0.12)",
        background:
          "linear-gradient(180deg, rgba(4,6,14,0.82) 0%, rgba(6,9,18,0.75) 100%)",
        backdropFilter: "blur(24px) saturate(1.4)",
        WebkitBackdropFilter: "blur(24px) saturate(1.4)",
        boxShadow: "0 1px 0 rgba(245,176,52,0.1), 0 8px 32px -8px rgba(0,0,0,0.5)"
      }}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div
            className="relative grid h-10 w-10 place-items-center rounded-xl text-base transition-all group-hover:scale-105"
            style={{
              background: "rgba(245,176,52,0.1)",
              border: "1px solid rgba(245,176,52,0.25)",
              boxShadow: "0 0 18px rgba(245,176,52,0.2)"
            }}
          >
            🎞
            {/* Animated glow on hover */}
            <span
              className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
              style={{ boxShadow: "0 0 28px rgba(245,176,52,0.5)" }}
              aria-hidden
            />
          </div>
          <div className="leading-tight">
            <p
              className="text-[10px] font-bold tracking-[0.3em] transition-all"
              style={{ color: "var(--brand)", textShadow: "0 0 16px rgba(245,176,52,0.4)" }}
            >
              BABA ECKE
            </p>
            <p className="text-xs text-zinc-400 transition-colors group-hover:text-zinc-200">
              cineastische community
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm transition-all",
                pathname === item.href
                  ? "text-zinc-50"
                  : "text-zinc-400 hover:text-zinc-100"
              )}
            >
              {pathname === item.href && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "rgba(245,176,52,0.1)",
                    border: "1px solid rgba(245,176,52,0.22)",
                    boxShadow: "0 0 16px rgba(245,176,52,0.15)"
                  }}
                  aria-hidden
                />
              )}
              <span className="relative">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            className="hidden md:inline-flex"
            style={{
              background: "linear-gradient(135deg, rgba(245,176,52,0.9), rgba(255,209,119,0.85))",
              color: "#000",
              border: "none",
              fontWeight: 700,
              letterSpacing: "0.04em",
              fontSize: "12px",
              boxShadow: "0 0 24px rgba(245,176,52,0.35), 0 4px 12px rgba(0,0,0,0.4)"
            }}
          >
            <Link href="/my-list">Progress-System</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              style={{
                background: "linear-gradient(160deg, rgba(8,12,24,0.98), rgba(4,6,14,0.99))",
                borderLeft: "1px solid rgba(245,176,52,0.15)"
              }}
            >
              <div className="mt-10 space-y-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-sm font-medium transition",
                      pathname === item.href
                        ? "text-zinc-50"
                        : "text-zinc-400 hover:text-white"
                    )}
                    style={
                      pathname === item.href
                        ? {
                            background: "rgba(245,176,52,0.1)",
                            border: "1px solid rgba(245,176,52,0.22)"
                          }
                        : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }
                    }
                  >
                    {item.label}
                  </Link>
                ))}
                <Button
                  asChild
                  className="mt-4 w-full"
                  style={{
                    background: "linear-gradient(135deg, rgba(245,176,52,0.9), rgba(255,209,119,0.85))",
                    color: "#000",
                    fontWeight: 700
                  }}
                >
                  <Link href="/my-list">Zur My List</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

