"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Search } from "lucide-react";
import {
  searchTmdbTitleAction,
  searchTmdbCollectionAction,
} from "@/lib/tmdb-actions";
import {
  validateFranchiseInput,
  formToDef,
  colorPalettes,
  FranchiseFormInput,
} from "@/lib/franchise-manager";
import { FranchiseWorldDef } from "@/data/franchise-worlds";

type CatalogEntry = FranchiseFormInput["catalogEntries"][0];

export default function AdminFranchisesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState<FranchiseFormInput>({
    slug: "",
    title: "",
    subline: "",
    heroSourceType: "movie",
    heroSourceTmdbId: 0,
    heroSourceTitle: "",
    heroSourceYear: undefined,
    tmdbStrategy: "collection",
    tmdbCollectionId: undefined,
    tmdbMovieTvId: undefined,
    tmdbSearchTitle: "",
    tmdbSearchType: "movie",
    tmdbSearchYear: undefined,
    bgFallback: "/c/header.jpg",
    motionLabel: "",
    accent: "#fb923c",
    glow: "rgba(251, 146, 60, 0.42)",
    mist: "radial-gradient(circle at 12% 16%, rgba(59,130,246,0.24), transparent 48%), radial-gradient(circle at 88% 14%, rgba(251,146,60,0.22), transparent 42%)",
    tone: "rgba(37, 99, 235, 0.2)",
    atmosphere: "rgba(251, 146, 60, 0.24)",
    reviewScore: 8.0,
    genres: [],
    releaseLabel: "",
    catalogEntries: [
      { title: "", year: 2024, type: "Film", searchTitle: "" },
      { title: "", year: 2024, type: "Film", searchTitle: "" },
      { title: "", year: 2024, type: "Film", searchTitle: "" },
      { title: "", year: 2024, type: "Film", searchTitle: "" },
    ],
  });

  const handleInputChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCatalogChange = (index: number, field: keyof CatalogEntry, value: any) => {
    const newCatalog = [...form.catalogEntries];
    newCatalog[index] = { ...newCatalog[index], [field]: value };
    setForm((prev) => ({ ...prev, catalogEntries: newCatalog }));
  };

  const handleAddCatalogEntry = () => {
    setForm((prev) => ({
      ...prev,
      catalogEntries: [...prev.catalogEntries, { title: "", year: 2024, type: "Film", searchTitle: "" }],
    }));
  };

  const handleRemoveCatalogEntry = (index: number) => {
    setForm((prev) => ({
      ...prev,
      catalogEntries: prev.catalogEntries.filter((_, i) => i !== index),
    }));
  };

  const handleGenreToggle = (genre: string) => {
    setForm((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleSearchTmdb = async (query: string, type: "movie" | "tv" | "collection") => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      if (type === "collection") {
        const results = await searchTmdbCollectionAction(query);
        setSearchResults(results as any[]);
      } else {
        const results = await searchTmdbTitleAction(query, type);
        setSearchResults(results as any[]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectHeroSource = (result: any) => {
    setForm((prev) => ({
      ...prev,
      heroSourceTmdbId: result.tmdbId,
      heroSourceTitle: result.title,
      heroSourceYear: result.year,
    }));
    setSearchResults([]);
  };

  const handleSelectTmdbSource = (result: any) => {
    if (form.tmdbStrategy === "collection") {
      setForm((prev) => ({
        ...prev,
        tmdbCollectionId: result.collectionId,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        tmdbMovieTvId: result.tmdbId,
      }));
    }
    setSearchResults([]);
  };

  const handleApplyColorPalette = (palette: keyof typeof colorPalettes) => {
    const colors = colorPalettes[palette];
    setForm((prev) => ({
      ...prev,
      ...colors,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage("");

    // Validate
    const validationErrors = validateFranchiseInput(form);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Convert form to def
      const franchiseDef = formToDef(form);

      // Send to API
      const response = await fetch("/api/franchises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(franchiseDef),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save franchise");
      }

      setSuccessMessage(`✅ Franchise "${form.title}" erfolgreich hinzugefügt!`);
      
      // Reset form
      setForm({
        slug: "",
        title: "",
        subline: "",
        heroSourceType: "movie",
        heroSourceTmdbId: 0,
        heroSourceTitle: "",
        heroSourceYear: undefined,
        tmdbStrategy: "collection",
        tmdbCollectionId: undefined,
        tmdbMovieTvId: undefined,
        tmdbSearchTitle: "",
        tmdbSearchType: "movie",
        tmdbSearchYear: undefined,
        bgFallback: "/c/header.jpg",
        motionLabel: "",
        accent: "#fb923c",
        glow: "rgba(251, 146, 60, 0.42)",
        mist: "radial-gradient(circle at 12% 16%, rgba(59,130,246,0.24), transparent 48%), radial-gradient(circle at 88% 14%, rgba(251,146,60,0.22), transparent 42%)",
        tone: "rgba(37, 99, 235, 0.2)",
        atmosphere: "rgba(251, 146, 60, 0.24)",
        reviewScore: 8.0,
        genres: [],
        releaseLabel: "",
        catalogEntries: [
          { title: "", year: 2024, type: "Film", searchTitle: "" },
          { title: "", year: 2024, type: "Film", searchTitle: "" },
          { title: "", year: 2024, type: "Film", searchTitle: "" },
          { title: "", year: 2024, type: "Film", searchTitle: "" },
        ],
      });

      // Redirect to franchises page after 2 seconds
      setTimeout(() => {
        router.push("/franchises");
      }, 2000);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">🎬 Franchise Admin Panel</h1>
        <p className="text-slate-400 mb-8">Füge ein neues Franchise mit vollständiger Konfiguration hinzu</p>

        {errors.length > 0 && (
          <div className="bg-red-900/40 border border-red-700 rounded p-4 mb-6">
            <h3 className="font-bold text-red-300 mb-2">Fehler:</h3>
            <ul className="space-y-1">
              {errors.map((err, i) => (
                <li key={i} className="text-red-200 text-sm">
                  • {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-900/40 border border-green-700 rounded p-4 mb-6">
            <p className="text-green-200">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">📋 Basis-Informationen</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Slug (z.B. back-to-future)"
                value={form.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Titel"
                value={form.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Subline"
                value={form.subline}
                onChange={(e) => handleInputChange("subline", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 col-span-2"
              />
              <input
                type="text"
                placeholder="Motion Label"
                value={form.motionLabel}
                onChange={(e) => handleInputChange("motionLabel", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 col-span-2"
              />
              <input
                type="text"
                placeholder="Release Label (z.B. 2000 - 2011)"
                value={form.releaseLabel}
                onChange={(e) => handleInputChange("releaseLabel", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Review Score (0-10)"
                min="0"
                max="10"
                step="0.1"
                value={form.reviewScore}
                onChange={(e) => handleInputChange("reviewScore", parseFloat(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Hero Source Section */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">🎥 Hero Source (TMDB)</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Film/Serie zum Suchen"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchTmdb((e.target as HTMLInputElement).value, form.heroSourceType);
                    }
                  }}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2 flex-1"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                    handleSearchTmdb(input.value, form.heroSourceType);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 flex items-center gap-2"
                  disabled={isSearching}
                >
                  {isSearching ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="bg-slate-800 rounded p-4 max-h-64 overflow-y-auto">
                  {searchResults.map((result: any, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectHeroSource(result)}
                      className="w-full text-left p-2 hover:bg-slate-700 rounded mb-2"
                    >
                      <div className="font-medium">{result.title}</div>
                      <div className="text-sm text-slate-400">ID: {result.tmdbId}</div>
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Hero TMDB-ID"
                  value={form.heroSourceTmdbId || ""}
                  onChange={(e) => handleInputChange("heroSourceTmdbId", parseInt(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Hero Titel"
                  value={form.heroSourceTitle}
                  onChange={(e) => handleInputChange("heroSourceTitle", e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Jahr"
                  value={form.heroSourceYear || ""}
                  onChange={(e) => handleInputChange("heroSourceYear", parseInt(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* TMDB Strategy Section */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">🔍 TMDB Katalog-Strategie</h2>
            <div className="space-y-4">
              <select
                value={form.tmdbStrategy}
                onChange={(e) => handleInputChange("tmdbStrategy", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
              >
                <option value="collection">Collection</option>
                <option value="movie">Film (Einzeln)</option>
                <option value="tv">Serie (Einzeln)</option>
                <option value="search">Suche nach Titel</option>
              </select>

              {form.tmdbStrategy === "collection" && (
                <input
                  type="number"
                  placeholder="Collection ID"
                  value={form.tmdbCollectionId || ""}
                  onChange={(e) => handleInputChange("tmdbCollectionId", parseInt(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
                />
              )}

              {(form.tmdbStrategy === "movie" || form.tmdbStrategy === "tv") && (
                <input
                  type="number"
                  placeholder="TMDB-ID (Film/Serie)"
                  value={form.tmdbMovieTvId || ""}
                  onChange={(e) => handleInputChange("tmdbMovieTvId", parseInt(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
                />
              )}

              {form.tmdbStrategy === "search" && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Suchtext"
                    value={form.tmdbSearchTitle}
                    onChange={(e) => handleInputChange("tmdbSearchTitle", e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
                  />
                  <select
                    value={form.tmdbSearchType}
                    onChange={(e) => handleInputChange("tmdbSearchType", e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
                  >
                    <option value="movie">Film</option>
                    <option value="tv">Serie</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Genres Section */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">🏷️ Genres (mind. 1)</h2>
            <div className="flex flex-wrap gap-2">
              {[
                "Action",
                "Adventure",
                "Animation",
                "Comedy",
                "Crime",
                "Drama",
                "Fantasy",
                "Horror",
                "Mystery",
                "Sci-Fi",
                "Thriller",
                "Anime",
              ].map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    form.genres.includes(genre)
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Colors Section */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">🎨 Farben & Theming</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Accent Farbe</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.accent}
                    onChange={(e) => handleInputChange("accent", e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.accent}
                    onChange={(e) => handleInputChange("accent", e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 flex-1 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Hintergrund</label>
                <select
                  value={form.bgFallback}
                  onChange={(e) => handleInputChange("bgFallback", e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
                >
                  <option value="/c/header.jpg">/c/header.jpg</option>
                  <option value="/c/lost-wallpaper.png">/c/lost-wallpaper.png</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-slate-400 block mb-2">Color Paletten</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(colorPalettes).map(([key, _]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleApplyColorPalette(key as keyof typeof colorPalettes)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm capitalize"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Glow (rgba)"
              value={form.glow}
              onChange={(e) => handleInputChange("glow", e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full text-sm font-mono mb-2"
              rows={2}
            />
            <textarea
              placeholder="Mist (gradient)"
              value={form.mist}
              onChange={(e) => handleInputChange("mist", e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full text-sm font-mono mb-2"
              rows={2}
            />
            <textarea
              placeholder="Tone (rgba)"
              value={form.tone}
              onChange={(e) => handleInputChange("tone", e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full text-sm font-mono mb-2"
              rows={1}
            />
            <textarea
              placeholder="Atmosphere (rgba)"
              value={form.atmosphere}
              onChange={(e) => handleInputChange("atmosphere", e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full text-sm font-mono"
              rows={1}
            />
          </div>

          {/* Catalog Entries Section */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">📚 Katalog-Einträge (mind. 1)</h2>
            <div className="space-y-4">
              {form.catalogEntries.map((entry, i) => (
                <div key={i} className="bg-slate-800 rounded p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-400">Eintrag {i + 1}</span>
                    {form.catalogEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCatalogEntry(i)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Titel"
                      value={entry.title}
                      onChange={(e) => handleCatalogChange(i, "title", e.target.value)}
                      className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Jahr"
                      value={entry.year}
                      onChange={(e) => handleCatalogChange(i, "year", parseInt(e.target.value))}
                      className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
                    />
                    <select
                      value={entry.type}
                      onChange={(e) => handleCatalogChange(i, "type", e.target.value)}
                      className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
                    >
                      <option value="Film">Film</option>
                      <option value="Serie">Serie</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Search Title (optional)"
                    value={entry.searchTitle || ""}
                    onChange={(e) => handleCatalogChange(i, "searchTitle", e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm w-full"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddCatalogEntry}
                className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded px-4 py-2 flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Eintrag hinzufügen
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Speichern...
                </>
              ) : (
                "🎬 Franchise erstellen"
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg py-3 font-medium"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
