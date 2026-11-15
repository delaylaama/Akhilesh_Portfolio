import type { Metadata } from "next";
import { CharacterSheet } from "@/components/about/CharacterSheet";
import { PageHeader } from "@/components/ui/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "About", description: `About ${site.name}, ${site.role}.` };

export default function AboutPage() {
  return (
    <div className="world-bg min-h-screen">
      <PageHeader eyebrow="Character select · Player 1" title={<>Meet the <em className="text-gold">designer</em></>} />
      <CharacterSheet />
    </div>
  );
}
