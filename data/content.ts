export type FeatureItem = {
  title: string;
  description: string;
  icon: "spark" | "film" | "users" | "zap";
};

export type Franchise = {
  slug: string;
  title: string;
  parts: { id: string; title: string; year: number; rating: number }[];
};

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/my-list", label: "My List & Progress" },
  { href: "/streams", label: "Streams" }
] as const;

export const heroStats = [
  { label: "Titel im Katalog", value: "200+" },
  { label: "Franchise Boards", value: "14" },
  { label: "Aktive Community", value: "3.8k" }
];

export const featureItems: FeatureItem[] = [
  {
    title: "Cine Katalog",
    description: "Filme und Serien schnell filtern, vergleichen und in Listen organisieren.",
    icon: "film"
  },
  {
    title: "Franchise Tracker",
    description: "Fortschritt, Bewertungen und Reihenfolge fuer ganze Universen zentral tracken.",
    icon: "spark"
  },
  {
    title: "Community Pulse",
    description: "Sehen, was gerade trendet und welche Titel in der Community diskutiert werden.",
    icon: "users"
  },
  {
    title: "Smart Roulette",
    description: "In Sekunden den naechsten Film finden, mit sinnvollen Filtern statt Zufall ohne Kontext.",
    icon: "zap"
  }
];

export const testimonials = [
  {
    quote:
      "Endlich eine Filmseite, die sich nicht wie ein altes Forum anfuehlt. Klar, schnell, hochwertig.",
    name: "Nora B.",
    role: "Power User"
  },
  {
    quote:
      "Der Franchise-Tracker ist der Grund, warum ich nicht mehr zwischen Notizen und Apps springen muss.",
    name: "Emir K.",
    role: "Collector"
  },
  {
    quote:
      "Besonders auf dem Handy merkt man den Unterschied: sauberes UX, null visuelle Unordnung.",
    name: "Lina R.",
    role: "Community Admin"
  }
];

export const faqs = [
  {
    question: "Bleiben die Inhalte der alten Seite erhalten?",
    answer:
      "Ja. Struktur und Kerninhalte bleiben erhalten, wurden aber visuell, technisch und in der Nutzerfuehrung modernisiert."
  },
  {
    question: "Kann ich weiterhin Watchlist und Fortschritt pflegen?",
    answer:
      "Ja. Watchlist, Fortschritt und Bewertungen sind zentrale Bestandteile der neuen Version und direkt integriert."
  },
  {
    question: "Ist die Seite fuer Mobilgeraete optimiert?",
    answer:
      "Ja. Das Layout wurde mobile-first konzipiert und passt sich auf allen modernen Geraeten sauber an."
  }
];

export const franchises: Franchise[] = [
  {
    slug: "harry-potter",
    title: "Harry Potter",
    parts: [
      { id: "hp-1", title: "Stein der Weisen", year: 2001, rating: 7.6 },
      { id: "hp-2", title: "Kammer des Schreckens", year: 2002, rating: 7.4 },
      { id: "hp-3", title: "Gefangener von Askaban", year: 2004, rating: 8.0 },
      { id: "hp-4", title: "Feuerkelch", year: 2005, rating: 7.7 }
    ]
  },
  {
    slug: "scream",
    title: "Scream",
    parts: [
      { id: "scream-1", title: "Scream", year: 1996, rating: 7.4 },
      { id: "scream-2", title: "Scream 2", year: 1997, rating: 6.3 },
      { id: "scream-3", title: "Scream 3", year: 2000, rating: 5.7 },
      { id: "scream-6", title: "Scream VI", year: 2023, rating: 6.4 }
    ]
  },
  {
    slug: "saw",
    title: "SAW",
    parts: [
      { id: "saw-1", title: "Saw", year: 2004, rating: 7.6 },
      { id: "saw-2", title: "Saw II", year: 2005, rating: 6.6 },
      { id: "saw-3", title: "Saw III", year: 2006, rating: 6.2 },
      { id: "saw-x", title: "Saw X", year: 2023, rating: 6.8 }
    ]
  }
];
