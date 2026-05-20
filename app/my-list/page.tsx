import type { Metadata } from "next";

import { getEnrichedCatalogItems } from "@/lib/catalog";
import { MyListView } from "@/components/my-list-view";

export const metadata: Metadata = {
  title: "My List & Progress",
  description: "Persoenliche Watchlist und Fortschritt innerhalb der Baba Ecke Community."
};

export default async function MyListPage() {
  const catalog = await getEnrichedCatalogItems(180, 180, { overwriteExistingPosters: true });
  return <MyListView catalog={catalog} />;
}
