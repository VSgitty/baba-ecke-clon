import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://baba-ecke.de";
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/my-list`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/streams`, changeFrequency: "weekly", priority: 0.8 }
  ];
}
