import type { Metadata } from "next";
import { Archive } from "@/components/projects/Archive";
import { PageHeader } from "@/components/ui/PageHeader";
import { projects } from "@/content/projects";

export const metadata: Metadata = { title: "Projects", description: "Every project in one list." };

export default function ProjectsPage() {
  return (
    <div className="world-bg min-h-screen">
      <PageHeader
        eyebrow={`Save file · ${projects.length} entries`}
        title={<>All <em className="text-gold">projects</em></>}
        lede="The quick way in: every project, filterable, no game required."
      />
      <Archive items={projects} />
    </div>
  );
}
