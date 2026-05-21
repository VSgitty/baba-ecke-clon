"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Wand2 } from "lucide-react";
import {
  validateCatalogInput,
  formToCatalogItem,
  CatalogFormInput,
  genrePresets,
} from "@/lib/catalog-manager";

export default function AdminCatalogPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [autofillMessage, setAutofillMessage] = useState("");

  const [form, setForm] = useState<CatalogFormInput>({
    title: "",
    genre: "Thriller",
    year: undefined,
    duration: "120 min",
    rating: "7.5/10",
    type: "movie",
    cover: "",
    description: "",
    streamUrl: "",
    tmdbId: undefined,
  });

  const handleInputChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const generateId = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  const autofillFromTmdb = useCallback(async (applyToForm = true) => {
    const title = form.title.trim();
    if (!title) {
      setAutofillMessage("");
      return null;
    }

    setIsAutofilling(true);
    setAutofillMessage("");

    try {
      const params = new URLSearchParams({
        title,
        type: form.type,
        year: String(form.year || "")
      });

      const response = await fetch(`/api/catalog/autofill?${params.toString()}`, {
        method: "GET"
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error || "TMDB Autofill fehlgeschlagen";
        setAutofillMessage(`❌ TMDB Fehler: ${errorMsg}`);
        console.error("[autofillFromTmdb] API error:", errorMsg);
        return null;
      }

      const tmdbItem = data?.item;
      if (!tmdbItem) {
        setAutofillMessage(`❌ Kein Film/Serie "${title}" auf TMDB gefunden`);
        return null;
      }

      if (applyToForm) {
        setForm((prev) => ({
          ...prev,
          tmdbId: tmdbItem.tmdbId || prev.tmdbId,
          title: tmdbItem.title || prev.title,
          type: tmdbItem.type || prev.type,
          genre: tmdbItem.genre || prev.genre,
          year: tmdbItem.year || prev.year,
          duration: tmdbItem.duration || prev.duration,
          rating: tmdbItem.rating || prev.rating,
          cover: tmdbItem.poster || prev.cover,
          description: tmdbItem.description || prev.description
        }));
        setAutofillMessage(`✅ TMDB-Daten für "${tmdbItem.title}" automatisch übernommen.`);
      }

      return tmdbItem as {
        tmdbId?: number;
        title?: string;
        type?: "movie" | "series";
        genre?: string;
        year?: number;
        duration?: string;
        rating?: string;
        poster?: string;
        description?: string;
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unbekannter Fehler";
      setAutofillMessage(`❌ Autofill Fehler: ${errorMsg}`);
      console.error("[autofillFromTmdb] Exception:", error);
      return null;
    } finally {
      setIsAutofilling(false);
    }
  }, [form.title, form.type, form.year]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage("");
    setAutofillMessage("");

    // Try to enrich missing metadata before validation.
    const tmdbItem = await autofillFromTmdb(false);
    const effectiveForm: CatalogFormInput = tmdbItem
      ? {
          ...form,
          tmdbId: tmdbItem.tmdbId || form.tmdbId,
          title: tmdbItem.title || form.title,
          type: tmdbItem.type || form.type,
          genre: tmdbItem.genre || form.genre,
          year: tmdbItem.year || form.year,
          duration: tmdbItem.duration || form.duration,
          rating: tmdbItem.rating || form.rating,
          cover: tmdbItem.poster || form.cover,
          description: tmdbItem.description || form.description
        }
      : form;

    if (tmdbItem) {
      setForm(effectiveForm);
      setAutofillMessage("TMDB-Daten automatisch uebernommen.");
    }

    // Validate
    const validationErrors = validateCatalogInput(effectiveForm);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const id = generateId(effectiveForm.title);
      const item = formToCatalogItem(id, effectiveForm);

      // Send to API
      const response = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, item }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save catalog item");
      }

      setSuccessMessage(`✅ "${effectiveForm.title}" erfolgreich zum Katalog hinzugefügt!`);

      // Reset form
      setForm({
        title: "",
        genre: "Thriller",
        year: undefined,
        duration: "120 min",
        rating: "7.5/10",
        type: "movie",
        cover: "",
        description: "",
        streamUrl: "",
        tmdbId: undefined,
      });

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold">🎬 Katalog Admin Panel</h1>
          <a
            href="/admin/shelves"
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition"
          >
            📚 Kategorien verwalten
          </a>
        </div>
        <p className="text-slate-400 mb-8">Füge einen neuen Film oder eine Serie zum Cine-Katalog hinzu</p>

        {autofillMessage && (
          <div className="bg-blue-900/40 border border-blue-700 rounded p-4 mb-6">
            <p className="text-blue-200">{autofillMessage}</p>
          </div>
        )}

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
          {/* Basic Info */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">📋 Basis-Informationen</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Titel (z.B. Avatar 2)"
                value={form.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                onBlur={() => {
                  if (form.title.trim().length >= 2) {
                    void autofillFromTmdb();
                  }
                }}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
              />
              <button
                type="button"
                onClick={() => void autofillFromTmdb()}
                disabled={isAutofilling || !form.title.trim()}
                className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/70 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded flex items-center justify-center gap-2"
              >
                {isAutofilling ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Lade TMDB...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Auto-Fill aus TMDB
                  </>
                )}
              </button>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={form.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                >
                  <option value="movie">Film</option>
                  <option value="series">Serie</option>
                </select>
                <input
                  type="number"
                  placeholder="Jahr"
                  min="1900"
                  max="2100"
                  value={form.year ?? ""}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    handleInputChange("year", value ? parseInt(value, 10) : undefined);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Genre & Duration */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">🏷️ Genre & Dauer</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Genre (z.B. Action, Sci-Fi)"
                value={form.genre}
                onChange={(e) => handleInputChange("genre", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full mb-2"
              />
              <div className="flex flex-wrap gap-2">
                {genrePresets.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleInputChange("genre", genre)}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      form.genre === genre
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Dauer (z.B. '120 min' oder '8 Episodes')"
                value={form.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
              />
            </div>
          </div>

          {/* Rating & Cover */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">⭐ Bewertung & Cover</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Rating (z.B. 8.5/10)"
                value={form.rating}
                onChange={(e) => handleInputChange("rating", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
              />
              <input
                type="url"
                placeholder="Cover-URL (z.B. https://images.justwatch.com/...)"
                value={form.cover}
                onChange={(e) => handleInputChange("cover", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
              />
              {form.cover && (
                <div className="rounded border border-slate-700 p-2 max-w-xs">
                  <img
                    src={form.cover}
                    alt={form.title}
                    className="w-full h-auto rounded object-cover max-h-64"
                    onError={() => setErrors(["Cover-URL ungültig"])}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description & Stream */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">📝 Beschreibung & Stream</h2>
            <div className="space-y-4">
              <textarea
                placeholder="Beschreibung (z.B. 'Ein Abenteuer im Weltall mit beeindruckenden Visuals')"
                value={form.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full text-sm font-mono"
                rows={4}
              />
              <input
                type="url"
                placeholder="Stream-URL (optional)"
                value={form.streamUrl}
                onChange={(e) => handleInputChange("streamUrl", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
              />
            </div>
          </div>

          {/* Submit */}
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
                <>
                  <Plus className="w-5 h-5" />
                  Zum Katalog hinzufügen
                </>
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
