# 🎬 Franchise Admin System - Dokumentation

## Überblick

Das neue **Franchise Admin Panel** ermöglicht es dir, neue Franchises über eine benutzerfreundliche Web-UI hinzuzufügen, ohne Code zu editieren. Die Franchises werden in eine JSON-Datei gespeichert und zur Runtime geladen.

---

## 📍 Wo findet man es?

**Admin-Seite:** [`/admin/franchises`](http://localhost:3002/admin/franchises)

**Button auf Franchises-Seite:** "➕ Franchise hinzufügen" (oben rechts)

---

## 🏗️ Architektur

### Dateien

| Datei | Zweck |
|-------|-------|
| `lib/franchise-manager.ts` | Validierung, Form-zu-Def-Konvertierung, Color-Paletten |
| `lib/tmdb-actions.ts` | Server Actions für TMDB-Suche (Movie, TV, Collections) |
| `app/api/franchises/route.ts` | REST API zum Speichern/Laden/Löschen von Franchises |
| `app/admin/franchises/page.tsx` | Admin-Form UI (React Hook Form nicht nötig, einfaches State Management) |
| `app/franchises/page.tsx` | Updated: Lädt Custom-Franchises von `/api/franchises` zur Runtime |
| `public/data/franchises-custom.json` | Persistent storage für Custom-Franchises |
| `components/franchises-experience.tsx` | Updated: Akzeptiert `worlds` Prop |

---

## 🎯 Features

### 1. **Vollständiges Formular**

Die Admin-Seite enthält folgende Abschnitte:

#### 📋 Basis-Informationen
- `slug` – Eindeutige Kennung (z.B. `back-to-future`)
- `title` – Anzeigename
- `subline` – Tagline/Untertitel
- `motionLabel` – Animations-Beschreibung (z.B. "Time flux, neon circuits")
- `releaseLabel` – Zeitspanne (z.B. "2000 - 2011")
- `reviewScore` – IMDB/TMDB-Score (0–10)

#### 🎥 Hero Source (TMDB)
- TMDB-Suche mit **Live-Abfrage**
- Oder manuelle TMDB-ID Eingabe
- Film oder Serie wählbar
- Jahr optional

#### 🔍 TMDB Katalog-Strategie
Vier Strategien zur Datenquelle:
1. **Collection** – TMDB Collection ID
2. **Film** – Einzelner Film (TMDB ID)
3. **Serie** – Serie (TMDB ID)
4. **Suche** – Text-Suche nach Titel + Typ

#### 🏷️ Genres
Multiselect aus: Action, Adventure, Animation, Comedy, Crime, Drama, Fantasy, Horror, Mystery, Sci-Fi, Thriller, Anime (mind. 1 erforderlich)

#### 🎨 Farben & Theming
- **Accent Color** – Hex-Farbwähler mit Preview
- **Vorgesetzte Paletten:**
  - `scifi` – Cyan-Blau
  - `horror` – Violett-Indigo
  - `anime` – Orange-Braun
  - `fantasy` – Purple
  - `action` – Rot
- Manuelle RGBA-Eingabe für: `glow`, `mist`, `tone`, `atmosphere`
- Hintergrund: `/c/header.jpg` oder `/c/lost-wallpaper.png`

#### 📚 Katalog-Einträge
- Mindestens 1 erforderlich, standardmäßig 4
- Pro Eintrag:
  - `title` – Anzeigename
  - `year` – Veröffentlichungsjahr
  - `type` – "Film" oder "Serie"
  - `searchTitle` – Optionale TMDB-Suchanfrage (falls abweichend vom Titel)
- Buttons: "+ Eintrag hinzufügen" und "🗑 Löschen"

---

### 2. **TMDB-Integration**

Die Admin-Seite hat **Server Actions** für TMDB-Suche:

```typescript
// lib/tmdb-actions.ts (Server Actions)
export async function searchTmdbTitleAction(
  query: string, 
  type: "movie" | "tv"
): Promise<...>

export async function searchTmdbCollectionAction(
  query: string
): Promise<...>
```

**Features:**
- Live-Suche beim Tippen (Enter drücken)
- Zeigt bis zu 10 Ergebnisse
- Anzeige: Titel, TMDB-ID, Jahr (falls verfügbar)
- Click → Automatische Formularfüllung

---

### 3. **Persistierung**

#### POST `/api/franchises`
Speichert ein neues Franchise in `public/data/franchises-custom.json`

```bash
curl -X POST http://localhost:3002/api/franchises \
  -H "Content-Type: application/json" \
  -d '{ "slug": "test", "title": "Test", ... }'
```

#### GET `/api/franchises`
Lädt alle Custom-Franchises

```bash
curl http://localhost:3002/api/franchises
```

#### DELETE `/api/franchises?slug=test-horror`
Löscht ein Franchise

---

### 4. **Runtime Loading**

Die `/franchises`-Seite lädt automatisch:
1. **Statische** Franchises aus `data/franchise-worlds.ts` (5 Stück)
2. **Custom** Franchises aus `public/data/franchises-custom.json` (User-erstellt)

```typescript
// app/franchises/page.tsx
async function loadCustomFranchises(): Promise<FranchiseWorldDef[]> {
  const filePath = path.join(process.cwd(), "public", "data", "franchises-custom.json");
  const data = await readFile(filePath, "utf-8");
  return JSON.parse(data);
}

const allWorlds = [...franchiseWorlds, ...customFranchises];
```

**Wichtig:** Der Carousel und die Hero-Section werden **zur Build-Zeit** gerendert. Wenn du ein Franchise hinzufügst, wird die `/franchises`-Seite zur Laufzeit neu geladen.

---

## 🎮 Bedienung

### Schritt 1: Admin-Panel öffnen
Gehe zu [`/admin/franchises`](http://localhost:3002/admin/franchises)

### Schritt 2: Basis-Info ausfüllen
- Slug, Titel, Subline eingeben
- Motion Label, Release Label, Score

### Schritt 3: Hero Source wählen
- Film/Serie zum Suchen eingeben + Enter drücken
- TMDB-Ergebnisse klicken
- Oder manuell TMDB-ID eingeben

### Schritt 4: Katalog-Strategie wählen
- Collection/Film/Serie/Suche
- Entsprechende IDs eingeben

### Schritt 5: Genres & Farben
- Mind. 1 Genre auswählen
- Accent-Farbe mit Farbwähler anpassen
- Oder Palette klicken (z.B. "horror")
- Optional: RGBA-Werte manuell anpassen

### Schritt 6: Katalog-Einträge
- Mindestens 1 Eintrag erforderlich (standardmäßig 4)
- Titel, Jahr, Typ (Film/Serie) ausfüllen
- Search Title optional (falls TMDB-Suche abweicht)

### Schritt 7: Speichern
- Klick "🎬 Franchise erstellen"
- Validierung läuft
- Erfolgs-Nachricht → Redirect zu `/franchises` nach 2 Sekunden

---

## ✅ Validierung

Das System validiert automatisch:

```typescript
export function validateFranchiseInput(input: Partial<FranchiseFormInput>): string[] {
  - slug erforderlich
  - title erforderlich
  - heroSourceTmdbId erforderlich
  - accent muss gültiges Hex-Format sein (#RRGGBB)
  - reviewScore 0–10
  - Mind. 1 Genre
  - Mind. 1 Katalog-Eintrag
}
```

Fehler werden oben im Formular angezeigt, speichern wird blockiert.

---

## 🎨 Color-Paletten

**Vordefinierte Paletten zum Klicken:**

```typescript
const colorPalettes = {
  scifi: {      // Cyan/Türkis
    accent: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.38)",
    tone: "rgba(5, 150, 105, 0.16)",
    atmosphere: "rgba(6, 182, 212, 0.2)",
  },
  horror: {     // Violett/Indigo
    accent: "#6366f1",
    glow: "rgba(99, 102, 241, 0.38)",
    ...
  },
  anime: {      // Orange/Braun
    accent: "#fb923c",
    glow: "rgba(251, 146, 60, 0.42)",
    ...
  },
  // ... fantasy, action
};
```

---

## 📁 Dateistruktur nach Erstellung

Nach dem Erstellen eines Franchises sieht die `franchises-custom.json` so aus:

```json
[
  {
    "slug": "test-horror",
    "title": "Test Horror Collection",
    "subline": "Eerie Whispers",
    "heroSource": {
      "type": "movie",
      "tmdbId": 76338,
      "title": "The Ring",
      "year": 2002
    },
    "tmdb": {
      "strategy": "collection",
      "collectionId": 87399,
      "fallbackTitle": "Horror Classics"
    },
    "bgFallback": "/c/header.jpg",
    "motionLabel": "Ghosts, whispers, eerie shadows",
    "accent": "#6366f1",
    "glow": "rgba(99, 102, 241, 0.38)",
    "mist": "radial-gradient(...)",
    "tone": "rgba(67, 56, 202, 0.18)",
    "atmosphere": "rgba(99, 102, 241, 0.22)",
    "reviewScore": 8.1,
    "genres": ["Horror", "Thriller", "Mystery"],
    "releaseLabel": "2002 - 2020",
    "catalog": [
      {
        "title": "The Ring",
        "year": 2002,
        "type": "Film",
        "searchTitle": "The Ring"
      },
      ...
    ]
  }
]
```

---

## 🔗 Integration mit `/franchises`

Die `/franchises`-Seite zeigt automatisch alle Franchises (statisch + custom):

```tsx
// app/franchises/page.tsx
const customFranchises = await loadCustomFranchises();
const allWorlds = [...franchiseWorlds, ...customFranchises];
// ... fetch TMDB assets ...
<FranchisesExperience assetsMap={assetsMap} worlds={allWorlds} />
```

**Navigation:** Admin-Link (➕) oben rechts auf `/franchises`

---

## 🚀 Nächste Schritte (Optional)

1. **Database-Backend** – Statt JSON-Datei (Supabase, Prisma, etc.)
2. **Edit/Update** – Bestehende Franchises bearbeiten
3. **Preview** – Live-Vorschau im Admin Panel
4. **Admin-Auth** – Password/Token-Schutz
5. **Bulk-Import** – CSV/JSON Import mehrerer Franchises

---

## 🐛 Troubleshooting

| Problem | Lösung |
|---------|--------|
| "500 Error beim Speichern" | Überprüfe, ob `public/data/` Verzeichnis existiert |
| "TMDB-Suche zeigt keine Ergebnisse" | TMDB_API_KEY prüfen (`.env.local`) |
| Franchises erscheinen auf `/franchises` nicht | Server neu starten, Browser-Cache leeren |
| Formular-Validierungsfehler | Alle erforderlichen Felder prüfen (rot markiert) |

---

## 📝 Zusammenfassung

✅ **Umfassendes Formular** mit allen FranchiseWorldDef-Feldern  
✅ **TMDB-Integration** (Live-Suche, Server Actions)  
✅ **Persistierung** (JSON-Datei in `public/data/`)  
✅ **Runtime-Loading** (Automatisch zur Franchises-Seite)  
✅ **Validierung** (Fehlerbehandlung, User-Feedback)  
✅ **Color-Paletten** (Vordefiniert oder manuell)  
✅ **Catalog-Verwaltung** (Dynamische Einträge, Add/Remove)

**Fertig für Production-Ready Admin Experience! 🎬**
