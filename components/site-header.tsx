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
    <header className="site-navbar sticky top-0 z-50 border-b">
      <div className="site-navbar-inner mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="site-brand-badge relative grid h-10 w-10 place-items-center rounded-xl text-base transition-all group-hover:scale-105">
            🎞
            {/* Animated glow on hover */}
            <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
          </div>
          <div className="leading-tight">
            <p className="site-brand-title text-[10px] font-bold tracking-[0.3em] transition-all">
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
                "site-nav-link relative rounded-full px-4 py-2 text-sm transition-all",
                pathname === item.href
                  ? "site-nav-link-active text-zinc-50"
                  : "text-zinc-400 hover:text-zinc-100"
              )}
            >
              {pathname === item.href && <span className="site-nav-active-glow absolute inset-0 rounded-full" aria-hidden />}
              <span className="relative">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            className="site-cta-btn hidden md:inline-flex"
          >
            <Link href="/my-list">Progress-System</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="site-mobile-menu md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="site-mobile-sheet">
              <div className="mt-10 space-y-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "site-mobile-link block rounded-xl px-4 py-3 text-sm font-medium transition",
                      pathname === item.href
                        ? "site-mobile-link-active text-zinc-50"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button
                  asChild
                  className="site-cta-btn mt-4 w-full"
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

