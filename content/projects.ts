import type { Project } from "./types";

/**
 * PROJECTS
 * ─────────
 * Every entry here becomes:
 *   • a card in /projects (the full archive)
 *   • an inventory slot in /work (when `featured: true`)
 *   • its own page at /work/<slug>
 *
 * The entries below are TEMPLATES (`sample: true`), not real work. They show every
 * block type a case study supports. Replace their text and media with a real project,
 * or delete them and add your own.
 *
 * Media files go in /public/assets/projects/<slug>/ and are referenced like
 *   { src: "/assets/projects/my-project/cover.jpg", alt: "…", aspect: "16:9" }
 */
export const projects: Project[] = [
  {
    slug: "sample-case-study",
    sample: true,
    featured: true,
    title: "[Project Title]",
    category: "[Brand Identity]",
    year: "[2025]",
    description: "[One or two sentences on what the project was and what changed because of it.]",
    rarity: "legendary",
    accent: "#ffcc33",
    thumbnail: { aspect: "4:3", alt: "[Thumbnail description]" },
    cover: { aspect: "16:9", alt: "[Cover image description]" },
    client: "[Client]",
    role: ["[Role]", "[Role]"],
    tools: ["[Tool]", "[Tool]"],
    duration: "[8 weeks]",
    blocks: [
      { type: "text", label: "01 — Overview", heading: "[Overview heading]", body: "[What the project is, who it was for, and your part in it.]" },
      { type: "text", label: "02 — Problem", heading: "[The problem]", body: ["[Describe the problem or opportunity.]", "[Why it mattered to the people using it.]"] },
      {
        type: "split",
        label: "03 — Research",
        heading: "[What we learned]",
        body: ["[Key research insight.]", "[Another insight that shaped the direction.]"],
        media: { aspect: "4:3", caption: "[Research artefact — affinity map, interview notes…]" },
      },
      { type: "stats", label: "Research in numbers", items: [{ value: "[12]", label: "[Interviews]" }, { value: "[3]", label: "[Personas]" }, { value: "[40+]", label: "[Concepts]" }] },
      {
        type: "gallery",
        label: "04 — Concept development",
        heading: "[Moodboards & sketches]",
        columns: 3,
        items: [{ aspect: "1:1", caption: "[Moodboard]" }, { aspect: "1:1", caption: "[Sketch]" }, { aspect: "1:1", caption: "[Sketch]" }],
      },
      { type: "media", label: "05 — Wireframes", media: { aspect: "16:9", caption: "[Wireframes]" }, wide: true },
      {
        type: "typography",
        label: "06 — Typography",
        heading: "[Type system]",
        faces: [
          { name: "[Display face]", role: "Headlines", sample: "Aa Bb Cc 123", family: "var(--font-display)" },
          { name: "[Text face]", role: "Body & UI", sample: "The quick brown fox jumps over the lazy dog.", family: "var(--font-sans)" },
        ],
      },
      {
        type: "palette",
        label: "07 — Colour",
        heading: "[Colour system]",
        colors: [
          { name: "[Primary]", hex: "#1B1F3B" },
          { name: "[Accent]", hex: "#FFCC33" },
          { name: "[Support]", hex: "#5EE6C9" },
          { name: "[Neutral]", hex: "#F2EFE6" },
        ],
      },
      { type: "list", label: "08 — Design system", heading: "[Components]", items: ["[Buttons]", "[Inputs]", "[Cards]", "[Navigation]", "[Icon set]"] },
      { type: "media", label: "09 — Final screens", media: { aspect: "16:9", caption: "[Final screens]" }, wide: true },
      { type: "gallery", label: "10 — Mockups", columns: 2, items: [{ aspect: "4:5", caption: "[Mockup]" }, { aspect: "4:5", caption: "[Mockup]" }] },
      { type: "media", label: "11 — Motion", media: { kind: "video", aspect: "16:9", caption: "[Animation — add an .mp4 src]" } },
      { type: "quote", text: "[A line of feedback from the client or a user.]", by: "[Name, Role]" },
      { type: "text", label: "12 — Outcome", heading: "[Outcome]", body: "[What shipped, what changed, and what you learned.]" },
    ],
  },
  {
    slug: "sample-interface",
    sample: true,
    featured: true,
    title: "[Project Title]",
    category: "[UI / UX]",
    year: "[2024]",
    description: "[Short description of the project.]",
    rarity: "epic",
    accent: "#9b7bff",
    thumbnail: { aspect: "4:3" },
    role: ["[Role]"],
    blocks: [
      { type: "text", label: "Overview", body: "[Project overview.]" },
      { type: "media", media: { aspect: "16:9", caption: "[Hero screen]" }, wide: true },
    ],
  },
  {
    slug: "sample-illustration",
    sample: true,
    featured: true,
    title: "[Project Title]",
    category: "[Illustration]",
    year: "[2024]",
    description: "[Short description of the project.]",
    rarity: "rare",
    accent: "#5ee6c9",
    thumbnail: { aspect: "4:3" },
    blocks: [
      { type: "text", label: "Overview", body: "[Project overview.]" },
      { type: "gallery", columns: 2, items: [{ aspect: "1:1" }, { aspect: "1:1" }] },
    ],
  },
  {
    slug: "sample-archive",
    sample: true,
    title: "[Project Title]",
    category: "[Packaging]",
    year: "[2023]",
    description: "[Short description of the project.]",
    rarity: "common",
    thumbnail: { aspect: "4:3" },
    blocks: [{ type: "text", label: "Overview", body: "[Project overview.]" }],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const featuredProjects = () => projects.filter((p) => p.featured);
export const categories = () => Array.from(new Set(projects.map((p) => p.category)));
