import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap"
});

const siteUrl = "https://baba-ecke.de";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Baba Ecke | Cine Community Relaunch",
    template: "%s | Baba Ecke"
  },
  description:
    "Moderne Premium-Neuinterpretation von baba-ecke.de mit schneller Navigation, klarer Struktur und hochwertigem Cine-UI.",
  openGraph: {
    title: "Baba Ecke 2026",
    description: "Cine Katalog, Franchise Tracking und Community Pulse in einer modernen, performanten Plattform.",
    url: siteUrl,
    siteName: "Baba Ecke",
    locale: "de_DE",
    type: "website"
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${jakarta.variable} min-h-screen font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
