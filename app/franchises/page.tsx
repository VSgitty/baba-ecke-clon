import type { Metadata } from "next";

import { FranchisesExperience } from "@/components/franchises-experience";

export const metadata: Metadata = {
  title: "Franchises",
  description:
    "Immersive cineastische Reise durch ikonische Film- und Serien-Franchises mit Premium Collector Vibes.",
  alternates: {
    canonical: "/franchises"
  }
};

export default function FranchisesPage() {
  return <FranchisesExperience />;
}
