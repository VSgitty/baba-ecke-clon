import type { Metadata } from "next";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LenisProvider } from "@/components/lenis-provider";
import { CinematicSideReels } from "@/components/cinematic-side-reels";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap"
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap"
});

const siteUrl = "https://baba-ecke.de";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Baba Ecke | Cine Community",
    template: "%s | Baba Ecke"
  },
  description:
    "Cine Community mit Charakter: Watchlists, Reviews, Franchise-Tracking und Streams in einer modernen Premium-Experience.",
  keywords: [
    "Baba Ecke",
    "Cine Community",
    "Film Katalog",
    "Franchise Tracker",
    "Watchlist",
    "Streams"
  ],
  icons: {
    icon: "/c/favicon.png"
  },
  openGraph: {
    title: "Baba Ecke | Cine Community",
    description: "Die modernisierte Premium-Version von baba-ecke.de mit vertrauter Markenwelt und starker UX.",
    url: siteUrl,
    siteName: "Baba Ecke",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "/c/header.jpg",
        width: 1600,
        height: 900,
        alt: "Baba Ecke Hero Visual"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Baba Ecke | Cine Community",
    description: "Premium-Upgrade der bekannten baba-ecke Filmwelt.",
    images: ["/c/header.jpg"]
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${bebasNeue.variable} min-h-screen font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LenisProvider>
            <CinematicSideReels />
            <div className="relative flex min-h-screen flex-col overflow-x-clip">
              <SiteHeader />
              <main className="flex-1 pt-16">{children}</main>
              <SiteFooter />
            </div>
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
