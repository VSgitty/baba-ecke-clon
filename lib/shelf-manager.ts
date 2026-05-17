import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Sparkles,
  Play,
  Film,
  Clock3,
  Dice5,
  Heart,
  Eye,
  AlertTriangle,
  Zap,
  BookOpen,
  Music,
  Laugh,
} from "lucide-react";

export type CustomShelf = {
  key: string;
  label: string;
  kicker: string;
  accent: string;
  icon?: string;
};

const ICON_MAP: Record<string, LucideIcon> = {
  Flame,
  Sparkles,
  Play,
  Film,
  Clock3,
  Dice5,
  Heart,
  Eye,
  AlertTriangle,
  Zap,
  BookOpen,
  Music,
  Laugh,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export function getIconComponent(iconName: string | undefined): LucideIcon {
  return ICON_MAP[iconName || "Film"] || Film;
}

export async function loadCustomShelves(): Promise<CustomShelf[]> {
  try {
    const response = await fetch("/api/shelves");
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("[loadCustomShelves] Error:", error);
    return [];
  }
}

export async function createCustomShelf(shelf: CustomShelf): Promise<CustomShelf | null> {
  try {
    const response = await fetch("/api/shelves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shelf),
    });

    if (!response.ok) {
      const data = await response.json();
      console.error("[createCustomShelf] Error:", data.error);
      return null;
    }

    const result = await response.json();
    return result.shelf;
  } catch (error) {
    console.error("[createCustomShelf] Exception:", error);
    return null;
  }
}

export async function deleteCustomShelf(key: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/shelves?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      console.error("[deleteCustomShelf] Error:", data.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[deleteCustomShelf] Exception:", error);
    return false;
  }
}
