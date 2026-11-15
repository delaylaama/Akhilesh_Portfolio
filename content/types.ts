/**
 * Content types. Everything on the site is driven by the files in /content.
 * Add a project = add an object to content/projects.ts. No layout code changes needed.
 */

/** Any image or video. Leave `src` empty and a labelled placeholder renders at the right ratio. */
export type Media = {
  src?: string;
  /** "image" (default) or "video" */
  kind?: "image" | "video";
  alt?: string;
  /** e.g. "16:9", "4:3", "1:1", "4:5", "9:16" */
  aspect?: string;
  caption?: string;
  /** Poster frame for videos */
  poster?: string;
  /** Pixel art: render with crisp nearest-neighbour scaling */
  pixelated?: boolean;
};

/**
 * Flexible project page blocks. Mix and match in any order.
 * `label` is the small system-style tag shown above a block, e.g. "02 — RESEARCH".
 */
export type Block =
  | { type: "text"; label?: string; heading?: string; body: string | string[] }
  | { type: "media"; label?: string; media: Media; wide?: boolean }
  | { type: "gallery"; label?: string; heading?: string; items: Media[]; columns?: 2 | 3 | 4 }
  | { type: "split"; label?: string; heading?: string; body: string | string[]; media: Media; flip?: boolean }
  | { type: "palette"; label?: string; heading?: string; colors: { name: string; hex: string; note?: string }[] }
  | {
      type: "typography";
      label?: string;
      heading?: string;
      faces: { name: string; role: string; sample?: string; family?: string; weight?: number }[];
    }
  | { type: "quote"; text: string; by?: string }
  | { type: "stats"; label?: string; heading?: string; items: { value: string; label: string }[] }
  | { type: "list"; label?: string; heading?: string; items: string[] }
  | { type: "embed"; label?: string; url: string; aspect?: string; title: string };

export type Project = {
  slug: string;
  title: string;
  /** Shown as the item class in the inventory, e.g. "Brand Identity" */
  category: string;
  year: string;
  /** One or two sentences for cards and previews */
  description: string;
  thumbnail: Media;
  /** Big image at the top of the project page (falls back to thumbnail) */
  cover?: Media;
  client?: string;
  role?: string[];
  tools?: string[];
  team?: string[];
  duration?: string;
  /** Optional external link (live site, Behance case study…) */
  link?: { label: string; href: string };
  /** true = shown in the Work inventory. All projects appear in /projects. */
  featured?: boolean;
  /** Rarity tag for the inventory card — purely decorative */
  rarity?: "common" | "rare" | "epic" | "legendary";
  /** Card accent colour (hex). Defaults to the theme accent. */
  accent?: string;
  /**
   * true = this is a template entry, not real work. Shown with a SAMPLE badge.
   * Delete these entries once you have added your own projects.
   */
  sample?: boolean;
  blocks: Block[];
};

export type Experiment = {
  slug: string;
  title: string;
  /** "built-in" experiments are coded in components/playground. */
  kind: "built-in" | "media" | "link";
  description: string;
  year?: string;
  media?: Media;
  href?: string;
  tags?: string[];
};
