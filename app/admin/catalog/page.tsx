"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  validateCatalogInput,
  formToCatalogItem,
  CatalogFormInput,
  genrePresets,
} from "@/lib/catalog-manager";

export default function AdminCatalogPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState<CatalogFormInput>({
    title: "",
    genre: "Thriller",
    year: new Date().getFullYear(),
    duration: "120 min",
    rating: "7.5/10",
    type: "movie",
    cover: "",
    description: "",
    streamUrl: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage("");

    // Validate
    const validationErrors = validateCatalogInput(form);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const id = generateId(form.title);
      const item = formToCatalogItem(id, form);

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

      setSuccessMessage(`✅ "${form.title}" erfolgreich zum Katalog hinzugefügt!`);

      // Reset form
      setForm({
        title: "",
        genre: "Thriller",
        year: new Date().getFullYear(),
        duration: "120 min",
        rating: "7.5/10",
        type: "movie",
        cover: "",
        description: "",
        streamUrl: "",
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
        <h1 className="text-4xl font-bold mb-2">🎬 Katalog Admin Panel</h1>
        <p className="text-slate-400 mb-8">Füge einen neuen Film oder eine Serie zum Cine-Katalog hinzu</p>

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
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
              />
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
                  value={form.year}
                  onChange={(e) => handleInputChange("year", parseInt(e.target.value))}
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
