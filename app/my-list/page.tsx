import type { Metadata } from "next";

import { getCatalogItems } from "@/lib/catalog";
import { MyListView } from "@/components/my-list-view";

export const metadata: Metadata = {
  title: "My List & Progress",
  description: "Persoenliche Watchlist und Fortschritt innerhalb der Baba Ecke Community."
};

export default function MyListPage() {
  const catalog = getCatalogItems(180);
  return <MyListView catalog={catalog} />;
}
