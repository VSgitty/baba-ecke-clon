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

export async function searchMovie(title: string, year?: number, genreHint?: string): Promise<TmdbMovie | null> {
  const strictResults = await searchMovieCandidates(title, year);
  const strictMatch = await pickBestMovieResult(strictResults, title, year, genreHint);
  if (strictMatch) return strictMatch;

  if (year) {
    const relaxedResults = await searchMovieCandidates(title);
    return pickBestMovieResult(relaxedResults, title, year, genreHint);
  }

  return null;
}

export async function searchTv(title: string, year?: number, genreHint?: string): Promise<TmdbTv | null> {
  const strictResults = await searchTvCandidates(title, year);
  const strictMatch = await pickBestTvResult(strictResults, title, year, genreHint);
  if (strictMatch) return strictMatch;

  if (year) {
    const relaxedResults = await searchTvCandidates(title);
    return pickBestTvResult(relaxedResults, title, year, genreHint);
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

function normalizeForTokenSet(value: string): string[] {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "der",
    "die",
    "das",
    "and",
    "und",
    "film",
    "movie",
    "part",
    "chapter",
    "folge",
    "staffel"
  ]);

  return normalizeSearchTitle(value)
    .replace(/\b(i|ii|iii|iv|v|vi|vii|viii|ix|x)\b/g, (roman) => String(fromRoman(roman.toUpperCase()) ?? roman))
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !stopWords.has(token));
}

function extractSequelNumber(value: string | undefined): number | null {
  if (!value) return null;
  const normalized = normalizeSearchTitle(value);
  if (!normalized) return null;

  const digitMatch = normalized.match(/(?:^|\s)(\d{1,2})(?:\s|$)/g);
  if (digitMatch?.length) {
    const raw = digitMatch[digitMatch.length - 1]?.match(/\d{1,2}/)?.[0];
    const parsed = raw ? Number.parseInt(raw, 10) : NaN;
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 99) return parsed;
  }

  const romanTokenMatch = normalized.match(/(?:^|\s)(x|ix|v?i{1,3}|iv|v)(?:\s|$)/g);
  if (!romanTokenMatch?.length) return null;
  const token = romanTokenMatch[romanTokenMatch.length - 1]?.trim().toUpperCase();
  return token ? fromRoman(token) : null;
}

function normalizeBaseTitle(value: string | undefined): string {
  if (!value) return "";
  return normalizeSearchTitle(value)
    .replace(/\b(part|chapter|episode|folge|film|movie|staffel|season|vol|volume)\b/g, " ")
    .replace(/\b(\d{1,2}|x|ix|v?i{1,3}|iv|v)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTrailingSequenceMarker(value: string): string {
  return value.replace(/\s*\(\d{1,2}\)\s*$/, "").trim();
}

function extractComparableYear(dateValue: string | undefined): number | null {
  if (!dateValue) return null;
  const parsed = Number.parseInt(dateValue.slice(0, 4), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function isStrictTitleCandidateMatch(queryTitle: string, candidateTitle: string | undefined): boolean {
  if (!candidateTitle) return false;

  const queryTitleCore = stripTrailingSequenceMarker(queryTitle);
  const querySequel = extractSequelNumber(queryTitleCore);
  const candidateSequel = extractSequelNumber(candidateTitle);

  if (querySequel !== null && candidateSequel !== null && querySequel !== candidateSequel) {
    return false;
  }

  // If query explicitly asks for a sequel part, reject candidates without that part number.
  if (querySequel !== null && candidateSequel === null) {
    return false;
  }

  const queryBase = normalizeBaseTitle(queryTitleCore);
  const candidateBase = normalizeBaseTitle(candidateTitle);
  if (!queryBase || !candidateBase) return false;

  if (candidateBase === queryBase) return true;
  return candidateBase.includes(queryBase) || queryBase.includes(candidateBase);
}

async function isMovieIdMatch(
  item: TmdbMovie | null,
  requestedTitle: string,
  requestedYear?: number,
  genreHint?: string
): Promise<boolean> {
  if (!item) return false;

  const titleOk = [item.title, item.original_title]
    .filter((value): value is string => Boolean(value))
    .some((candidate) => isStrictTitleCandidateMatch(requestedTitle, candidate));

  if (!titleOk) return false;
  if (requestedYear) {
    const itemYear = extractComparableYear(item.release_date);
    if (itemYear !== null && Math.abs(itemYear - requestedYear) > 1) return false;
  }

  const genreHints = parseGenreHints(genreHint);
  if (!genreHints.length) return true;

  const detail = await tmdbFetch<TmdbMovieDetail>(`/movie/${item.id}`, { language: "en-US" });
  const genreOverlap = scoreGenreOverlap(detail?.genres?.map((genre) => genre.name), genreHints);
  return genreOverlap > 0;
}

async function isTvIdMatch(
  item: TmdbTv | null,
  requestedTitle: string,
  requestedYear?: number,
  genreHint?: string
): Promise<boolean> {
  if (!item) return false;

  const titleOk = [item.name, item.original_name]
    .filter((value): value is string => Boolean(value))
    .some((candidate) => isStrictTitleCandidateMatch(requestedTitle, candidate));

  if (!titleOk) return false;
  if (requestedYear) {
    const itemYear = extractComparableYear(item.first_air_date);
    if (itemYear !== null && Math.abs(itemYear - requestedYear) > 1) return false;
  }

  const genreHints = parseGenreHints(genreHint);
  if (!genreHints.length) return true;

  const detail = await tmdbFetch<TmdbTvDetail>(`/tv/${item.id}`, { language: "en-US" });
  const genreOverlap = scoreGenreOverlap(detail?.genres?.map((genre) => genre.name), genreHints);
  return genreOverlap > 0;
}

function tokenDiceScore(queryTokens: string[], candidateTokens: string[]): number {
  if (!queryTokens.length || !candidateTokens.length) return 0;

  const queryCounts = new Map<string, number>();
  queryTokens.forEach((token) => queryCounts.set(token, (queryCounts.get(token) ?? 0) + 1));

  let overlap = 0;
  for (const token of candidateTokens) {
    const count = queryCounts.get(token) ?? 0;
    if (count > 0) {
      overlap += 1;
      queryCounts.set(token, count - 1);
    }
  }

  return (2 * overlap) / (queryTokens.length + candidateTokens.length);
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) row[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    let previousDiagonal = row[0] ?? 0;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = row[j] ?? 0;
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(
        (row[j] ?? 0) + 1,
        (row[j - 1] ?? 0) + 1,
        previousDiagonal + substitutionCost,
      );
      previousDiagonal = temp;
    }
  }

  return row[b.length] ?? 0;
}

function normalizedLevenshteinScore(a: string, b: string): number {
  const left = a.replace(/\s+/g, "");
  const right = b.replace(/\s+/g, "");
  if (!left || !right) return 0;
  const dist = levenshteinDistance(left, right);
  const maxLen = Math.max(left.length, right.length);
  return maxLen ? 1 - dist / maxLen : 0;
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

function normalizeGenreLabel(value: string): string {
  const normalized = normalizeSearchTitle(value);
  if (!normalized) return "";
  if (normalized === "sci fi" || normalized === "science fiction") return "science fiction";
  if (normalized === "tv movie") return "tv movie";
  return normalized;
}

function parseGenreHints(genreHint?: string): string[] {
  if (!genreHint) return [];
  return genreHint
    .split(",")
    .map((genre) => normalizeGenreLabel(genre))
    .filter((genre) => Boolean(genre));
}

function scoreGenreOverlap(candidateGenres: string[] | undefined, genreHints: string[]): number {
  if (!genreHints.length || !candidateGenres?.length) return 0;

  const candidateSet = new Set(candidateGenres.map((genre) => normalizeGenreLabel(genre)).filter(Boolean));
  let overlap = 0;
  for (const genre of genreHints) {
    if (candidateSet.has(genre)) overlap += 1;
  }

  return overlap;
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

  if (normalizedCandidate === normalizedQuery) return 170;

  const queryTokens = normalizeForTokenSet(normalizedQuery);
  const candidateTokens = normalizeForTokenSet(normalizedCandidate);
  const dice = tokenDiceScore(queryTokens, candidateTokens);
  const fuzzy = normalizedLevenshteinScore(normalizedQuery, normalizedCandidate);

  let score = dice * 110 + fuzzy * 55;

  if (normalizedCandidate.includes(normalizedQuery) || normalizedQuery.includes(normalizedCandidate)) {
    score += 24;
  }

  const querySequel = extractSequelNumber(normalizedQuery);
  const candidateSequel = extractSequelNumber(normalizedCandidate);
  if (querySequel && candidateSequel) {
    score += querySequel === candidateSequel ? 22 : -38;
  }

  return score;
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
  genreScore: number;
  total: number;
};

async function getMovieMatchScore(
  item: TmdbMovie,
  normalizedTitle: string,
  year?: number,
  genreHints: string[] = []
): Promise<MatchScore> {
  const titleScore = Math.max(
    scoreTitleMatch(item.title, normalizedTitle),
    scoreTitleMatch(item.original_title, normalizedTitle)
  );
  const yearScore = scoreYear(item.release_date, year);
  const detail = genreHints.length ? await tmdbFetch<TmdbMovieDetail>(`/movie/${item.id}`, { language: "en-US" }) : null;
  const genreOverlap = scoreGenreOverlap(detail?.genres?.map((genre) => genre.name), genreHints);
  const genreScore = genreHints.length ? (genreOverlap > 0 ? 18 + (genreOverlap - 1) * 8 : -32) : 0;

  return {
    titleScore,
    yearScore,
    genreScore,
    total: titleScore + yearScore + genreScore + (item.popularity ?? 0) / 100,
  };
}

async function getTvMatchScore(
  item: TmdbTv,
  normalizedTitle: string,
  year?: number,
  genreHints: string[] = []
): Promise<MatchScore> {
  const titleScore = Math.max(
    scoreTitleMatch(item.name, normalizedTitle),
    scoreTitleMatch(item.original_name, normalizedTitle)
  );
  const yearScore = scoreYear(item.first_air_date, year);
  const detail = genreHints.length ? await tmdbFetch<TmdbTvDetail>(`/tv/${item.id}`, { language: "en-US" }) : null;
  const genreOverlap = scoreGenreOverlap(detail?.genres?.map((genre) => genre.name), genreHints);
  const genreScore = genreHints.length ? (genreOverlap > 0 ? 18 + (genreOverlap - 1) * 8 : -32) : 0;

  return {
    titleScore,
    yearScore,
    genreScore,
    total: titleScore + yearScore + genreScore + (item.popularity ?? 0) / 100,
  };
}

async function pickBestMovieResult(results: TmdbMovie[], title: string, year?: number, genreHint?: string): Promise<TmdbMovie | null> {
  if (!results.length) return null;
  const normalizedTitle = normalizeSearchTitle(title);
  const genreHints = parseGenreHints(genreHint);
  const strictCandidates = results.filter((item) =>
    isStrictTitleCandidateMatch(title, item.title) || isStrictTitleCandidateMatch(title, item.original_title)
  );

  const source = strictCandidates.length ? strictCandidates : results;
  const scored = await Promise.all(
    source.map(async (item) => ({ item, score: await getMovieMatchScore(item, normalizedTitle, year, genreHints) }))
  );
  scored.sort((a, b) => b.score.total - a.score.total);

  const best = scored[0];
  if (!best) return null;
  const second = scored[1];

  // Reject weak fuzzy matches to avoid incorrect artwork.
  if (best.score.titleScore < 86) return null;
  if (year && best.score.yearScore < 0 && best.score.titleScore < 126) return null;
  if (genreHints.length && best.score.genreScore < 0) return null;

  // Reject ambiguous top hits unless the best match is clearly strong.
  if (second && best.score.total - second.score.total < 12 && best.score.titleScore < 145) {
    return null;
  }

  return best.item;
}

async function pickBestTvResult(results: TmdbTv[], title: string, year?: number, genreHint?: string): Promise<TmdbTv | null> {
  if (!results.length) return null;
  const normalizedTitle = normalizeSearchTitle(title);
  const genreHints = parseGenreHints(genreHint);
  const strictCandidates = results.filter((item) =>
    isStrictTitleCandidateMatch(title, item.name) || isStrictTitleCandidateMatch(title, item.original_name)
  );

  const source = strictCandidates.length ? strictCandidates : results;
  const scored = await Promise.all(
    source.map(async (item) => ({ item, score: await getTvMatchScore(item, normalizedTitle, year, genreHints) }))
  );
  scored.sort((a, b) => b.score.total - a.score.total);

  const best = scored[0];
  if (!best) return null;
  const second = scored[1];

  // Reject weak fuzzy matches to avoid incorrect artwork.
  if (best.score.titleScore < 86) return null;
  if (year && best.score.yearScore < 0 && best.score.titleScore < 126) return null;
  if (genreHints.length && best.score.genreScore < 0) return null;

  // Reject ambiguous top hits unless the best match is clearly strong.
  if (second && best.score.total - second.score.total < 12 && best.score.titleScore < 145) {
    return null;
  }

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
  genreHint?: string,
): Promise<string | null> {
  // 1) Prefer explicit TMDB ids, but only if title/year/genre validation passes.
  if (tmdbId) {
    if (type === "series") {
      const tvById = await tmdbFetch<TmdbTv>(`/tv/${tmdbId}`);
      if (await isTvIdMatch(tvById, title, year, genreHint)) {
        return imgPoster(tvById?.poster_path) ?? null;
      }
    } else {
      const movieById = await tmdbFetch<TmdbMovie>(`/movie/${tmdbId}`);
      if (await isMovieIdMatch(movieById, title, year, genreHint)) {
        return imgPoster(movieById?.poster_path) ?? null;
      }
    }
  }

  // 2) Strict fallback search for items without id or with invalid id.
  if (type === "series") {
    const tv = await searchTv(title, year, genreHint);
    const isExactTvMatch =
      Boolean(tv) &&
      [tv?.name, tv?.original_name]
        .filter((value): value is string => Boolean(value))
        .some((candidate) => isStrictTitleCandidateMatch(title, candidate));

    if (!isExactTvMatch) return null;
    return imgPoster(tv?.poster_path) ?? null;
  }

  const movie = await searchMovie(title, year, genreHint);
  const isExactMovieMatch =
    Boolean(movie) &&
    [movie?.title, movie?.original_title]
      .filter((value): value is string => Boolean(value))
      .some((candidate) => isStrictTitleCandidateMatch(title, candidate));

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
