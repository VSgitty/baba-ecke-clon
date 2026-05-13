import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"]
  },
  images: {
    remotePatterns: [
      // TMDB — primary media source
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**"
      },
      // JustWatch — existing catalog covers
      {
        protocol: "https",
        hostname: "images.justwatch.com",
        pathname: "/**"
      },
      // Amazon / IMDb assets
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/**"
      },
      // Flixster / Rotten Tomatoes
      {
        protocol: "https",
        hostname: "resizing.flixster.com",
        pathname: "/**"
      },
      // Fanart.tv — logos & character art
      {
        protocol: "https",
        hostname: "assets.fanart.tv",
        pathname: "/**"
      },
      // General media CDNs
      {
        protocol: "https",
        hostname: "*.themoviedb.org",
        pathname: "/**"
      }
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1280, 1920],
    imageSizes: [64, 128, 256, 384, 512]
  }
};

export default nextConfig;
