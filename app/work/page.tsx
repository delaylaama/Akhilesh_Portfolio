import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Inventory } from "@/components/work/Inventory";
import { featuredProjects, projects } from "@/content/projects";

export const metadata: Metadata = { title: "Work", description: "Selected work, presented as an inventory." };

export default function WorkPage() {
  const items = featuredProjects();
  return (
    <div className="world-bg min-h-screen">
      <PageHeader
        eyebrow="Inventory · Selected work"
        title={<>Collected <em className="text-gold">items</em></>}
        lede="Selected case studies. Hover or use the arrow keys to inspect an item, and open it for the full story."
      >
        <Link href="/projects" className="font-pixel text-[10px] uppercase tracking-widest text-dim hover:text-gold">
          Full archive ({projects.length}) →
        </Link>
      </PageHeader>
      <Inventory items={items} />
    </div>
  );
}
