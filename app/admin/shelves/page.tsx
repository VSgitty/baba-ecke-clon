"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createCustomShelf, deleteCustomShelf, loadCustomShelves, AVAILABLE_ICONS, getIconComponent } from "@/lib/shelf-manager";
import type { CustomShelf } from "@/lib/shelf-manager";

const DEFAULT_COLORS = [
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#6366f1", // indigo
];

export default function AdminShelvesPage() {
  const router = useRouter();
  const [shelves, setShelves] = useState<CustomShelf[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    key: "",
    label: "",
    kicker: "New Shelf",
    accent: DEFAULT_COLORS[0],
    icon: "Film",
  });

  useEffect(() => {
    const loadShelves = async () => {
      setIsLoading(true);
      const customShelves = await loadCustomShelves();
      setShelves(customShelves);
      setIsLoading(false);
    };
    loadShelves();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const generateKey = (label: string) => {
    return label
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage("");

    const validationErrors: string[] = [];
    if (!form.label.trim()) validationErrors.push("Label erforderlich");
    if (!form.key.trim()) validationErrors.push("Kategorie-Schlüssel erforderlich");
    if (!form.accent) validationErrors.push("Farbe erforderlich");

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsCreating(true);
    try {
      const newShelf = await createCustomShelf({
        key: form.key,
        label: form.label,
        kicker: form.kicker,
        accent: form.accent,
        icon: form.icon,
      });

      if (!newShelf) {
        setErrors(["Fehler beim Erstellen des Shelves"]);
        return;
      }

      setShelves((prev) => [...prev, newShelf]);
      setSuccessMessage(`✅ Kategorie "${form.label}" erfolgreich erstellt!`);

      // Reset form
      setForm({
        key: "",
        label: "",
        kicker: "New Shelf",
        accent: DEFAULT_COLORS[0],
        icon: "Film",
      });

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"]);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (key: string, label: string) => {
    if (!confirm(`Möchtest du die Kategorie "${label}" wirklich löschen?`)) return;

    const success = await deleteCustomShelf(key);
    if (success) {
      setShelves((prev) => prev.filter((s) => s.key !== key));
      setSuccessMessage(`✅ Kategorie "${label}" gelöscht!`);
    } else {
      setErrors(["Fehler beim Löschen der Kategorie"]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold">📚 Katalog Kategorien Admin</h1>
          <a
            href="/admin/catalog"
            className="text-sm bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded transition"
          >
            🎬 Film/Serie hinzufügen
          </a>
        </div>
        <p className="text-slate-400 mb-8">Erstelle und verwalte custom Katalog-Kategorien (Shelves)</p>

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

        {/* Form to create new shelf */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 mb-8">
          <h2 className="text-xl font-bold mb-4">➕ Neue Kategorie erstellen</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Kategorie Label (z.B. 'SciFi Hits')"
                value={form.label}
                onChange={(e) => {
                  const label = e.target.value;
                  handleInputChange("label", label);
                  handleInputChange("key", generateKey(label));
                }}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Kategorie-Schlüssel (auto)"
                value={form.key}
                onChange={(e) => handleInputChange("key", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-400"
                disabled
              />
            </div>

            <input
              type="text"
              placeholder="Untertitel/Kicker (z.B. 'Future Classics')"
              value={form.kicker}
              onChange={(e) => handleInputChange("kicker", e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <select
                  value={form.icon}
                  onChange={(e) => handleInputChange("icon", e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2 w-full"
                >
                  {AVAILABLE_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Accent-Farbe</label>
                <div className="flex gap-2 flex-wrap">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleInputChange("accent", color)}
                      className={`w-10 h-10 rounded border-2 transition ${
                        form.accent === color
                          ? "border-white"
                          : "border-slate-600 hover:border-slate-400"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreating || !form.label || !form.key}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/70 text-white font-semibold py-2 rounded flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Erstelle Kategorie...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Kategorie erstellen
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing shelves */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h2 className="text-xl font-bold mb-4">📋 Bestehende Kategorien</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          ) : shelves.length === 0 ? (
            <p className="text-slate-400">Noch keine custom Kategorien erstellt.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shelves.map((shelf) => {
                const IconComponent = getIconComponent(shelf.icon);
                return (
                  <div
                    key={shelf.key}
                    className="bg-slate-800 rounded p-4 border border-slate-700 flex items-start justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded"
                        style={{ backgroundColor: shelf.accent + "20" }}
                      >
                        <IconComponent
                          className="w-5 h-5"
                          style={{ color: shelf.accent }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold">{shelf.label}</h3>
                        <p className="text-sm text-slate-400">{shelf.kicker}</p>
                        <p className="text-xs text-slate-500 mt-1">Key: {shelf.key}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(shelf.key, shelf.label)}
                      className="text-red-400 hover:text-red-300 transition"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
