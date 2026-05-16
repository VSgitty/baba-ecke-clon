/**
 * TMDB API Client — SERVER ONLY
 * All functions in this file must be called from Server Components or Server Actions.
 * The TMDB API key is never exposed to the browser.
 */
import "server-only";

const API_BASE = "https://api.themoviedb.org/3";
export const IMG_BASE = "https://image.tmdb.org/t/p";

// ── Image URL helpers ────────────────────────────────────────────

export function imgPoster(path: string | null | undefined, size: "w342" | "w500" | "w780" = "w500"): string | null {
  if (!path) return null;
  return `${IMG_BASE}/${size}${path}`;
}

export function imgBackdrop(path: string | null | undefined, size: "w780" | "w1280" | "original" = "w1280"): string | null {
  if (!path) return null;
  return `${IMG_BASE}/${size}${path}`;
}

export function imgLogo(path: string | null | undefined, size: "w300" | "w500" = "w300"): string | null {
  if (!path) return null;
  return `${IMG_BASE}/${size}${path}`;
}

// ── Internal fetch wrapper ───────────────────────────────────────

function getKey(): string | null {
  return process.env.TMDB_API_KEY ?? null;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  const key = getKey();
  if (!key) return null;

  const url = new URL(`${API_BASE}${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  // Support both v3 API keys (32-char hex) and v4 JWT Read Access Tokens
  const isJwt = key.startsWith("eyJ");
  const headers: Record<string, string> = isJwt
    ? { Authorization: `Bearer ${key}`, Accept: "application/json" }
    : {};
  if (!isJwt) url.searchParams.set("api_key", key);

  try {
    const res = await fetch(url.toString(), { headers, next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ── Types ────────────────────────────────────────────────────────

type TmdbMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string;
  vote_average?: number;
  release_date?: string;
};

type TmdbTv = {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string;
  vote_average?: number;
  first_air_date?: string;
};

type TmdbGenre = {
  id: number;
  name: string;
};

type TmdbMovieDetail = TmdbMovie & {
  runtime?: number;
  genres?: TmdbGenre[];
};

type TmdbTvDetail = TmdbTv & {
  number_of_episodes?: number;
  genres?: TmdbGenre[];
};

type TmdbSearchMovieResult = { results: TmdbMovie[] };
type TmdbSearchTvResult = { results: TmdbTv[] };
type TmdbImagesResult = {
  logos: { file_path: string; iso_639_1: string; vote_average: number }[];
  backdrops: { file_path: string; iso_639_1: string; vote_average: number }[];
  posters: { file_path: string; iso_639_1: string; vote_average: number }[];
};
type TmdbCollectionResult = {
  id: number;
  backdrop_path: string | null;
  poster_path: string | null;
  parts: TmdbMovie[];
};

// ── Search ───────────────────────────────────────────────────────

export async function searchMovie(title: string, year?: number): Promise<TmdbMovie | null> {
  const params: Record<string, string> = { query: title, include_adult: "false" };
  if (year) params.year = String(year);
  const data = await tmdbFetch<TmdbSearchMovieResult>("/search/movie", params);
  return pickBestMovieResult(data?.results ?? [], title, year);
}

export async function searchTv(title: string, year?: number): Promise<TmdbTv | null> {
  const params: Record<string, string> = { query: title, include_adult: "false" };
  if (year) params.first_air_date_year = String(year);
  const data = await tmdbFetch<TmdbSearchTvResult>("/search/tv", params);
  return pickBestTvResult(data?.results ?? [], title, year);
}

// ── Images ───────────────────────────────────────────────────────

async function getMovieImages(movieId: number): Promise<TmdbImagesResult | null> {
  return tmdbFetch<TmdbImagesResult>(`/movie/${movieId}/images`, {
    include_image_language: "en,null",
  });
}

async function getTvImages(tvId: number): Promise<TmdbImagesResult | null> {
  return tmdbFetch<TmdbImagesResult>(`/tv/${tvId}/images`, {
    include_image_language: "en,null",
  });
}

async function getCollection(collectionId: number): Promise<TmdbCollectionResult | null> {
  return tmdbFetch<TmdbCollectionResult>(`/collection/${collectionId}`);
}

function pickBestLogo(images: TmdbImagesResult | null): string | null {
  if (!images?.logos?.length) return null;
  const en = images.logos
    .filter((l) => l.iso_639_1 === "en")
    .sort((a, b) => b.vote_average - a.vote_average);
  return en[0]?.file_path ?? images.logos[0]?.file_path ?? null;
}

function normalizeSearchTitle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function pickBestMovieResult(results: TmdbMovie[], title: string, year?: number): TmdbMovie | null {
  if (!results.length) return null;
  const normalizedTitle = normalizeSearchTitle(title);
  const exact = results.find((result) => normalizeSearchTitle(result.title) === normalizedTitle);
  if (exact) return exact;

  if (year) {
    const yearMatch = results.find((result) => result.release_date?.startsWith(String(year)));
    if (yearMatch) return yearMatch;
  }

  return results[0] ?? null;
}

function pickBestTvResult(results: TmdbTv[], title: string, year?: number): TmdbTv | null {
  if (!results.length) return null;
  const normalizedTitle = normalizeSearchTitle(title);
  const exact = results.find((result) => normalizeSearchTitle(result.name) === normalizedTitle);
  if (exact) return exact;

  if (year) {
    const yearMatch = results.find((result) => result.first_air_date?.startsWith(String(year)));
    if (yearMatch) return yearMatch;
  }

  return results[0] ?? null;
}

// ── Resolved asset bundle ────────────────────────────────────────

export type TmdbAssets = {
  posterUrl: string | null;
  backdropUrl: string | null;
  logoUrl: string | null;
};

export async function resolveMovieAssets(title: string, year?: number, tmdbId?: number): Promise<TmdbAssets> {
  try {
    let movieId = tmdbId;
    let poster: string | null = null;
    let backdrop: string | null = null;

    if (!movieId) {
      const movie = await searchMovie(title, year);
      if (!movie) return { posterUrl: null, backdropUrl: null, logoUrl: null };
      movieId = movie.id;
      poster = movie.poster_path;
      backdrop = movie.backdrop_path;
    } else {
      const data = await tmdbFetch<TmdbMovie>(`/movie/${movieId}`);
      poster = data?.poster_path ?? null;
      backdrop = data?.backdrop_path ?? null;
    }

    const images = await getMovieImages(movieId);
    const logo = pickBestLogo(images);

    return {
      posterUrl: imgPoster(poster),
      backdropUrl: imgBackdrop(backdrop),
      logoUrl: imgLogo(logo, "w300"),
    };
  } catch {
    return { posterUrl: null, backdropUrl: null, logoUrl: null };
  }
}

export async function resolveTvAssets(title: string, year?: number, tmdbId?: number): Promise<TmdbAssets> {
  try {
    let tvId = tmdbId;
    let poster: string | null = null;
    let backdrop: string | null = null;

    if (!tvId) {
      const tv = await searchTv(title, year);
      if (!tv) return { posterUrl: null, backdropUrl: null, logoUrl: null };
      tvId = tv.id;
      poster = tv.poster_path;
      backdrop = tv.backdrop_path;
    } else {
      const data = await tmdbFetch<TmdbTv>(`/tv/${tvId}`);
      poster = data?.poster_path ?? null;
      backdrop = data?.backdrop_path ?? null;
    }

    const images = await getTvImages(tvId);
    const logo = pickBestLogo(images);

    return {
      posterUrl: imgPoster(poster),
      backdropUrl: imgBackdrop(backdrop),
      logoUrl: imgLogo(logo, "w300"),
    };
  } catch {
    return { posterUrl: null, backdropUrl: null, logoUrl: null };
  }
}

export async function resolveCollectionAssets(collectionId: number, fallbackTitle: string): Promise<TmdbAssets> {
  try {
    const collection = await getCollection(collectionId);
    if (!collection) return resolveMovieAssets(fallbackTitle);

    // Use the first part to get images (logos come from individual movies)
    const firstPartId = collection.parts[0]?.id;
    const images = firstPartId ? await getMovieImages(firstPartId) : null;
    const logo = pickBestLogo(images);

    return {
      posterUrl: imgPoster(collection.poster_path),
      backdropUrl: imgBackdrop(collection.backdrop_path),
      logoUrl: imgLogo(logo, "w300"),
    };
  } catch {
    return resolveMovieAssets(fallbackTitle);
  }
}

// ── Catalog enrichment ───────────────────────────────────────────

/**
 * For a single catalog item that is missing a poster:
 * Searches TMDB and returns a poster URL, or null if not found.
 * Results are cached for 24 h by Next.js fetch cache.
 */
export async function resolveItemPoster(
  title: string,
  type: "movie" | "series",
  year?: number,
): Promise<string | null> {
  if (type === "series") {
    const tv = await searchTv(title, year);
    return imgPoster(tv?.poster_path) ?? null;
  }
  const movie = await searchMovie(title, year);
  return imgPoster(movie?.poster_path) ?? null;
}

export type TmdbCatalogAutofill = {
  title: string;
  type: "movie" | "series";
  genre: string;
  year?: number;
  duration: string;
  rating: string;
  description: string;
  poster: string;
};

function formatRating(voteAverage: number | undefined): string {
  if (!voteAverage || !Number.isFinite(voteAverage)) return "7.0/10";
  return `${voteAverage.toFixed(1)}/10`;
}

function toCatalogYear(dateValue: string | undefined): number | undefined {
  if (!dateValue) return undefined;
  const parsed = Number.parseInt(dateValue.slice(0, 4), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function resolveCatalogAutofill(
  title: string,
  type: "movie" | "series",
  year?: number
): Promise<TmdbCatalogAutofill | null> {
  if (!title.trim()) return null;

  try {
    if (type === "series") {
      const match = await searchTv(title, year);
      if (!match) return null;

      const detail = await tmdbFetch<TmdbTvDetail>(`/tv/${match.id}`);
      const genre = detail?.genres?.[0]?.name || "Drama";
      const episodes = detail?.number_of_episodes;
      const duration = episodes && episodes > 0 ? `${episodes} Episodes` : "8 Episodes";
      const resolvedYear = toCatalogYear(detail?.first_air_date ?? match.first_air_date);
      const poster = imgPoster(detail?.poster_path ?? match.poster_path);
      if (!poster) return null;

      return {
        title: detail?.name || match.name || title,
        type,
        genre,
        year: resolvedYear,
        duration,
        rating: formatRating(detail?.vote_average ?? match.vote_average),
        description: detail?.overview?.trim() || match.overview?.trim() || "",
        poster
      };
    }

    const match = await searchMovie(title, year);
    if (!match) return null;

    const detail = await tmdbFetch<TmdbMovieDetail>(`/movie/${match.id}`);
    const genre = detail?.genres?.[0]?.name || "Action";
    const runtime = detail?.runtime;
    const duration = runtime && runtime > 0 ? `${runtime} min` : "120 min";
    const resolvedYear = toCatalogYear(detail?.release_date ?? match.release_date);
    const poster = imgPoster(detail?.poster_path ?? match.poster_path);
    if (!poster) return null;

    return {
      title: detail?.title || match.title || title,
      type,
      genre,
      year: resolvedYear,
      duration,
      rating: formatRating(detail?.vote_average ?? match.vote_average),
      description: detail?.overview?.trim() || match.overview?.trim() || "",
      poster
    };
  } catch {
    return null;
  }
}
