"use server";

const API_BASE = "https://api.themoviedb.org/3";

async function tmdbApiFetch(endpoint: string, params: Record<string, string> = {}) {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY not set");

  const url = new URL(endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`);

  // Auto-detect API key format
  if (key.startsWith("eyJ")) {
    // JWT v4
    return fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });
  } else {
    // v3 format
    url.searchParams.set("api_key", key);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return fetch(url.toString());
  }
}

/**
 * Server Action: Search TMDB for movie/TV titles
 */
export async function searchTmdbTitleAction(
  query: string,
  type: "movie" | "tv" = "movie"
): Promise<Array<{ tmdbId: number; title: string; year?: number; posterPath?: string }>> {
  try {
    const endpoint =
      type === "movie"
        ? `/search/movie?query=${encodeURIComponent(query)}`
        : `/search/tv?query=${encodeURIComponent(query)}`;

    const response = await tmdbApiFetch(endpoint);
    const data = (await response.json()) as any;

    return (data.results || [])
      .slice(0, 10)
      .map((item: any) => ({
        tmdbId: item.id,
        title: item.title || item.name,
        year: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
        posterPath: item.poster_path,
      }));
  } catch (error) {
    console.error("[searchTmdbTitleAction] Error:", error);
    return [];
  }
}

/**
 * Server Action: Search TMDB for collections
 */
export async function searchTmdbCollectionAction(
  query: string
): Promise<Array<{ collectionId: number; name: string; posterPath?: string }>> {
  try {
    const endpoint = `/search/collection?query=${encodeURIComponent(query)}`;
    const response = await tmdbApiFetch(endpoint);
    const data = (await response.json()) as any;

    return (data.results || [])
      .slice(0, 10)
      .map((item: any) => ({
        collectionId: item.id,
        name: item.name,
        posterPath: item.poster_path,
      }));
  } catch (error) {
    console.error("[searchTmdbCollectionAction] Error:", error);
    return [];
  }
}
