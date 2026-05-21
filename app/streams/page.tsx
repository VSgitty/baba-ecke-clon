import type { Metadata } from "next";
import Link from "next/link";

import { getEnrichedCatalogItems } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Streams",
  description: "Direktzugriff auf Titel mit verfuegbaren Stream-Links aus dem Baba Ecke Katalog."
};

export default async function StreamsPage() {
  const catalog = await getEnrichedCatalogItems(220, 220, { overwriteExistingPosters: false });
  const streamable = catalog.filter((item) => Boolean(item.streamUrl));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Streams</CardTitle>
          <CardDescription>Direktlinks fuer Titel mit hinterlegtem Stream-Ziel.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {streamable.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border/70 bg-black/[0.02] p-4 dark:bg-white/[0.03]">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.type} | {item.genre}
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link href={item.streamUrl || "#"} target="_blank">
                  Stream oeffnen
                </Link>
              </Button>
            </article>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
