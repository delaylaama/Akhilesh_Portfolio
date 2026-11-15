/**
 * SITE SETTINGS — name, copy, skills, contact.
 * Anything in [square brackets] is a placeholder waiting for real details.
 */
export const site = {
  /** Shown on the boot screen, HUD and page titles */
  name: "THEJAS",
  /** Short handle used in the pixel logo (max ~6 characters looks best) */
  handle: "THEJAS",
  role: "Multidisciplinary Designer",
  tagline: "[One line about what you make — e.g. Designing brands, interfaces and small digital worlds.]",
  location: "[City, Country]",
  status: "Available for freelance & full-time",

  /** Optional: path to a .glb room model in /public/assets/models. Leave empty for the built-in low-poly room.
   *  Name empties/objects in Blender `hotspot_about`, `hotspot_work`, `hotspot_projects`, `hotspot_playground`,
   *  `hotspot_contact` and the site will attach clickable markers to them. */
  roomModel: "",

  /** Avatar shown on the About screen. Leave empty to use the built-in pixel sprite. */
  avatar: "",

  about: {
    intro:
      "[Write 2–3 sentences introducing yourself in first person. Who you are, what you design, and what you care about.]",
    background: [
      "[Paragraph about your background — where you studied, how you got into design.]",
      "[Paragraph about the kind of work you do now and the teams you work with.]",
    ],
    philosophy: [
      { title: "[Principle one]", body: "[A sentence on how you approach design.]" },
      { title: "[Principle two]", body: "[A sentence on craft, research, or collaboration.]" },
      { title: "[Principle three]", body: "[A sentence on what makes work feel finished to you.]" },
    ],
    /** 0–10 — rendered as stat bars on the character sheet. Rename freely. */
    stats: [
      { label: "Visual Design", value: 8 },
      { label: "UX / Interaction", value: 7 },
      { label: "Branding", value: 7 },
      { label: "Motion", value: 6 },
      { label: "3D", value: 5 },
      { label: "Prototyping", value: 7 },
    ],
    skills: ["[Skill]", "[Skill]", "[Skill]", "[Skill]", "[Skill]", "[Skill]"],
    tools: ["Figma", "[Tool]", "[Tool]", "[Tool]", "[Tool]", "[Tool]"],
    experience: [
      { role: "[Role]", org: "[Company]", period: "[20XX — Now]", note: "[What you did there in one line.]" },
      { role: "[Role]", org: "[Company]", period: "[20XX — 20XX]", note: "[What you did there in one line.]" },
      { role: "[Degree / Course]", org: "[School]", period: "[20XX — 20XX]", note: "" },
    ],
    /** Small personal touches for the character sheet */
    traits: [
      { label: "Class", value: "Designer" },
      { label: "Alignment", value: "[Chaotic Good]" },
      { label: "Favourite game", value: "[Game]" },
      { label: "Power-up", value: "[Coffee / chai]" },
    ],
  },

  contact: {
    /** Real inbox — used for the mailto link and the form fallback */
    email: "hello@example.com",
    /** Entries with an empty href are hidden automatically */
    links: [
      { label: "LinkedIn", href: "" },
      { label: "Behance", href: "" },
      { label: "Dribbble", href: "" },
      { label: "Instagram", href: "" },
      { label: "Read.cv", href: "" },
    ],
    /** Path to a PDF in /public, e.g. "/assets/brand/resume.pdf". Empty hides the button. */
    resume: "",
  },
};

export const nav = [
  { key: "home", label: "Home", href: "/", hotkey: "1" },
  { key: "about", label: "About", href: "/about", hotkey: "2" },
  { key: "work", label: "Work", href: "/work", hotkey: "3" },
  { key: "projects", label: "Projects", href: "/projects", hotkey: "4" },
  { key: "playground", label: "Playground", href: "/playground", hotkey: "5" },
  { key: "contact", label: "Contact", href: "/contact", hotkey: "6" },
] as const;
