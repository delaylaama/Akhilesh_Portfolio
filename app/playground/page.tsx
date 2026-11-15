import type { Metadata } from "next";
import { Playground } from "@/components/playground/Playground";
import { PageHeader } from "@/components/ui/PageHeader";
import { experiments } from "@/content/playground";

export const metadata: Metadata = { title: "Playground", description: "Experiments, toys and small games." };

export default function PlaygroundPage() {
  return (
    <div className="world-bg min-h-screen">
      <PageHeader
        eyebrow="Arcade · Insert cartridge"
        title={<>The <em className="text-gold">playground</em></>}
        lede="Small experiments in pixels, type and code. Everything here is playable."
      />
      <Playground items={experiments} />
    </div>
  );
}
