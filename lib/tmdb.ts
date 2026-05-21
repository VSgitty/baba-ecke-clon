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
  original_title?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string;
  vote_average?: number;
  popularity?: number;
  release_date?: string;
};

type TmdbTv = {
  id: number;
  name: string;
  original_name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview?: string;
  vote_average?: number;
  popularity?: number;
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

const SEARCH_LANGUAGES = ["de-DE", "en-US"] as const;

// ── Search ───────────────────────────────────────────────────────

export async function searchMovie(title: string, year?: number): Promise<TmdbMovie | null> {
  const strictResults = await searchMovieCandidates(title, year);
  const strictMatch = pickBestMovieResult(strictResults, title, year);
  if (strictMatch) return strictMatch;

  if (year) {
    const relaxedResults = await searchMovieCandidates(title);
    return pickBestMovieResult(relaxedResults, title, year);
  }

  return null;
}

export async function searchTv(title: string, year?: number): Promise<TmdbTv | null> {
  const strictResults = await searchTvCandidates(title, year);
  const strictMatch = pickBestTvResult(strictResults, title, year);
  if (strictMatch) return strictMatch;

  if (year) {
    const relaxedResults = await searchTvCandidates(title);
    return pickBestTvResult(relaxedResults, title, year);
  }

  return null;
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
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`´]/g, "")
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildSearchVariants(title: string): string[] {
  const variants = new Set<string>();
  const trimmed = title.trim();
  if (!trimmed) return [];

  variants.add(trimmed);
  variants.add(trimmed.replace(/[’`´]/g, "'"));
  variants.add(trimmed.replace(/[’'`´]/g, ""));
  variants.add(trimmed.replace(/[:/\\-]+/g, " "));

  for (const value of Array.from(variants)) {
    buildStructuralVariants(value).forEach((variant) => variants.add(variant));
  }

  for (const value of Array.from(variants)) {
    buildPossessiveVariants(value).forEach((variant) => variants.add(variant));
  }

  return Array.from(variants).filter((value) => value.trim().length >= 2);
}

function buildStructuralVariants(value: string): string[] {
  const variants = new Set<string>();
  const trimmed = value.trim();
  if (!trimmed) return [];

  variants.add(trimmed);
  variants.add(trimmed.replace(/[\[\](){}]/g, " ").replace(/\s+/g, " ").trim());
  variants.add(trimmed.replace(/\s*[:\-|/].*$/, "").trim());
  variants.add(trimmed.replace(/\s*\([^)]*\)/g, " ").replace(/\s+/g, " ").trim());
  variants.add(trimmed.replace(/\s*\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim());

  for (const variant of Array.from(variants)) {
    buildSequelNumberVariants(variant).forEach((nextVariant) => variants.add(nextVariant));
  }

  return Array.from(variants).filter((variant) => variant.trim().length >= 2);
}

function buildSequelNumberVariants(value: string): string[] {
  const variants = new Set<string>();
  const trimmed = value.trim();
  if (!trimmed) return [];

  const trailingArabic = trimmed.match(/^(.*?)(\d{1,2})$/);
  if (trailingArabic) {
    const prefix = trailingArabic[1]?.trim();
    const num = Number.parseInt(trailingArabic[2] || "", 10);
    if (prefix) variants.add(prefix);
    const roman = toRoman(num);
    if (prefix && roman) variants.add(`${prefix} ${roman}`);
  }

  const trailingRoman = trimmed.match(/^(.*)\b([IVX]{1,5})$/i);
  if (trailingRoman) {
    const prefix = trailingRoman[1]?.trim();
    const roman = trailingRoman[2]?.toUpperCase();
    const arabic = roman ? fromRoman(roman) : null;
    if (prefix) variants.add(prefix);
    if (prefix && arabic) variants.add(`${prefix} ${arabic}`);
  }

  return Array.from(variants).filter((variant) => variant.trim().length >= 2);
}

function toRoman(value: number): string | null {
  const numerals: Array<[number, string]> = [
    [10, "X"],
    [9, "IX"],
    [8, "VIII"],
    [7, "VII"],
    [6, "VI"],
    [5, "V"],
    [4, "IV"],
    [3, "III"],
    [2, "II"],
    [1, "I"]
  ];

  if (!Number.isInteger(value) || value < 1 || value > 10) return null;

  let remainder = value;
  let result = "";
  for (const [amount, symbol] of numerals) {
    while (remainder >= amount) {
      result += symbol;
      remainder -= amount;
    }
  }

  return result || null;
}

function fromRoman(value: string): number | null {
  const numerals: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10
  };

  if (!/^[IVX]+$/.test(value)) return null;

  let total = 0;
  let previous = 0;
  for (let i = value.length - 1; i >= 0; i -= 1) {
    const current = numerals[value[i] || ""] || 0;
    if (!current) return null;
    total += current < previous ? -current : current;
    previous = current;
  }

  return total >= 1 && total <= 10 ? total : null;
}

function buildPossessiveVariants(value: string): string[] {
  const variants = new Set<string>();
  const normalized = value.replace(/[’`´]/g, "'").trim();
  if (!normalized) return [];

  variants.add(normalized);
  variants.add(normalized.replace(/'/g, ""));
  variants.add(normalized.replace(/'/g, "’"));

  if (!normalized.includes("'")) {
    variants.add(normalized.replace(/\b([A-Za-z0-9]{3,})s\b/g, "$1's"));
  }

  return Array.from(variants).filter((variant) => variant.trim().length >= 2);
}

async function searchMovieCandidates(title: string, year?: number): Promise<TmdbMovie[]> {
  const resultMap = new Map<number, TmdbMovie>();

  for (const query of buildSearchVariants(title)) {
    for (const language of SEARCH_LANGUAGES) {
      const params: Record<string, string> = {
        query,
        include_adult: "false",
        language,
      };
      if (year) params.year = String(year);

      const data = await tmdbFetch<TmdbSearchMovieResult>("/search/movie", params);
      for (const item of data?.results ?? []) {
        if (!resultMap.has(item.id)) {
          resultMap.set(item.id, item);
        }
      }
    }
  }

  return Array.from(resultMap.values());
}

async function searchTvCandidates(title: string, year?: number): Promise<TmdbTv[]> {
  const resultMap = new Map<number, TmdbTv>();

  for (const query of buildSearchVariants(title)) {
    for (const language of SEARCH_LANGUAGES) {
      const params: Record<string, string> = {
        query,
        include_adult: "false",
        language,
      };
      if (year) params.first_air_date_year = String(year);

      const data = await tmdbFetch<TmdbSearchTvResult>("/search/tv", params);
      for (const item of data?.results ?? []) {
        if (!resultMap.has(item.id)) {
          resultMap.set(item.id, item);
        }
      }
    }
  }

  return Array.from(resultMap.values());
}

function scoreTitleMatch(candidate: string | undefined, normalizedQuery: string): number {
  if (!candidate) return 0;

  const normalizedCandidate = normalizeSearchTitle(candidate);
  if (!normalizedCandidate) return 0;
  if (normalizedCandidate === normalizedQuery) return 120;
  if (normalizedCandidate.includes(normalizedQuery) || normalizedQuery.includes(normalizedCandidate)) return 90;

  const queryWords = normalizedQuery.split(" ").filter(Boolean);
  const candidateWords = new Set(normalizedCandidate.split(" ").filter(Boolean));
  const overlap = queryWords.filter((word) => candidateWords.has(word)).length;
  return overlap * 12;
}

function scoreYear(dateValue: string | undefined, year?: number): number {
  if (!year || !dateValue) return 0;
  const resultYear = Number.parseInt(dateValue.slice(0, 4), 10);
  if (!Number.isFinite(resultYear)) return 0;
  if (resultYear === year) return 30;
  if (Math.abs(resultYear - year) === 1) return 10;
  return -20;
}

type MatchScore = {
  titleScore: number;
  yearScore: number;
  total: number;
};

function getMovieMatchScore(item: TmdbMovie, normalizedTitle: string, year?: number): MatchScore {
  const titleScore = Math.max(
    scoreTitleMatch(item.title, normalizedTitle),
    scoreTitleMatch(item.original_title, normalizedTitle)
  );
  const yearScore = scoreYear(item.release_date, year);
  return {
    titleScore,
    yearScore,
    total: titleScore + yearScore + (item.popularity ?? 0) / 100,
  };
}

function getTvMatchScore(item: TmdbTv, normalizedTitle: string, year?: number): MatchScore {
  const titleScore = Math.max(
    scoreTitleMatch(item.name, normalizedTitle),
    scoreTitleMatch(item.original_name, normalizedTitle)
  );
  const yearScore = scoreYear(item.first_air_date, year);
  return {
    titleScore,
    yearScore,
    total: titleScore + yearScore + (item.popularity ?? 0) / 100,
  };
}

function pickBestMovieResult(results: TmdbMovie[], title: string, year?: number): TmdbMovie | null {
  if (!results.length) return null;
  const normalizedTitle = normalizeSearchTitle(title);
  const scored = results
    .map((item) => ({ item, score: getMovieMatchScore(item, normalizedTitle, year) }))
    .sort((a, b) => b.score.total - a.score.total);

  const best = scored[0];
  if (!best) return null;

  // Reject weak fuzzy matches to avoid incorrect artwork.
  if (best.score.titleScore < 48) return null;
  if (year && best.score.yearScore < 0 && best.score.titleScore < 90) return null;

  return best.item;
}

function pickBestTvResult(results: TmdbTv[], title: string, year?: number): TmdbTv | null {
  if (!results.length) return null;
  const normalizedTitle = normalizeSearchTitle(title);
  const scored = results
    .map((item) => ({ item, score: getTvMatchScore(item, normalizedTitle, year) }))
    .sort((a, b) => b.score.total - a.score.total);

  const best = scored[0];
  if (!best) return null;

  // Reject weak fuzzy matches to avoid incorrect artwork.
  if (best.score.titleScore < 48) return null;
  if (year && best.score.yearScore < 0 && best.score.titleScore < 90) return null;

  return best.item;
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
  tmdbId?: number,
): Promise<string | null> {
  // Direct ID lookup — guaranteed correct, no fuzzy matching
  if (tmdbId) {
    const endpoint = type === "series" ? `/tv/${tmdbId}` : `/movie/${tmdbId}`;
    const data = await tmdbFetch<{ poster_path: string | null }>(endpoint);
    return imgPoster(data?.poster_path) ?? null;
  }

  // For safety: without TMDB id we only resolve when year exists,
  // and only if we get an exact normalized title match.
  if (!year) return null;

  const normalizedQuery = normalizeSearchTitle(title);

  if (type === "series") {
    const tv = await searchTv(title, year);
    const isExactTvMatch =
      Boolean(tv) &&
      [tv?.name, tv?.original_name]
        .filter((value): value is string => Boolean(value))
        .some((candidate) => normalizeSearchTitle(candidate) === normalizedQuery);

    if (!isExactTvMatch) return null;
    return imgPoster(tv?.poster_path) ?? null;
  }

  const movie = await searchMovie(title, year);
  const isExactMovieMatch =
    Boolean(movie) &&
    [movie?.title, movie?.original_title]
      .filter((value): value is string => Boolean(value))
      .some((candidate) => normalizeSearchTitle(candidate) === normalizedQuery);

  if (!isExactMovieMatch) return null;
  return imgPoster(movie?.poster_path) ?? null;
}

export type TmdbCatalogAutofill = {
  tmdbId: number;
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

function pickLocalizedText(...values: Array<string | undefined>): string {
  return values.map((value) => value?.trim()).find((value) => Boolean(value)) || "";
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

      const detailDe = await tmdbFetch<TmdbTvDetail>(`/tv/${match.id}`, { language: "de-DE" });
      const detailEn = await tmdbFetch<TmdbTvDetail>(`/tv/${match.id}`, { language: "en-US" });
      const genre = detailDe?.genres?.[0]?.name || detailEn?.genres?.[0]?.name || "Drama";
      const episodes = detailDe?.number_of_episodes ?? detailEn?.number_of_episodes;
      const duration = episodes && episodes > 0 ? `${episodes} Episodes` : "8 Episodes";
      const resolvedYear = toCatalogYear(detailDe?.first_air_date ?? detailEn?.first_air_date ?? match.first_air_date);
      const poster = imgPoster(detailDe?.poster_path ?? detailEn?.poster_path ?? match.poster_path);
      if (!poster) return null;

      return {
        tmdbId: match.id,
        title: pickLocalizedText(detailDe?.name, detailEn?.name, match.name, title),
        type,
        genre,
        year: resolvedYear,
        duration,
        rating: formatRating(detailDe?.vote_average ?? detailEn?.vote_average ?? match.vote_average),
        description: pickLocalizedText(detailDe?.overview, detailEn?.overview, match.overview),
        poster
      };
    }

    const match = await searchMovie(title, year);
    if (!match) return null;

    const detailDe = await tmdbFetch<TmdbMovieDetail>(`/movie/${match.id}`, { language: "de-DE" });
    const detailEn = await tmdbFetch<TmdbMovieDetail>(`/movie/${match.id}`, { language: "en-US" });
    const genre = detailDe?.genres?.[0]?.name || detailEn?.genres?.[0]?.name || "Action";
    const runtime = detailDe?.runtime ?? detailEn?.runtime;
    const duration = runtime && runtime > 0 ? `${runtime} min` : "120 min";
    const resolvedYear = toCatalogYear(detailDe?.release_date ?? detailEn?.release_date ?? match.release_date);
    const poster = imgPoster(detailDe?.poster_path ?? detailEn?.poster_path ?? match.poster_path);
    if (!poster) return null;

    return {
      tmdbId: match.id,
      title: pickLocalizedText(detailDe?.title, detailEn?.title, match.title, title),
      type,
      genre,
      year: resolvedYear,
      duration,
      rating: formatRating(detailDe?.vote_average ?? detailEn?.vote_average ?? match.vote_average),
      description: pickLocalizedText(detailDe?.overview, detailEn?.overview, match.overview),
      poster
    };
  } catch {
    return null;
  }
}
