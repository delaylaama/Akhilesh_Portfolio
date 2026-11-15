export type HotspotKey = "about" | "work" | "projects" | "playground" | "contact";

export type Hotspot = {
  key: HotspotKey;
  label: string;
  /** What the visitor is looking at in the room */
  object: string;
  /** Short action line, shown in the label and the menu */
  verb: string;
  href: string;
  /** Where the bobbing marker floats */
  marker: [number, number, number];
  /** Floor selection ring: x, z, radius */
  ring: [number, number, number];
  /** Camera position + look target when this object is focused */
  cam: [number, number, number];
  look: [number, number, number];
};

export const hotspots: Hotspot[] = [
  {
    key: "about",
    label: "About",
    object: "Pinboard",
    verb: "Meet the designer",
    href: "/about",
    marker: [-1.35, 3.25, -3.7],
    ring: [-1.35, -3.2, 0.9],
    cam: [0.6, 2.6, 1.6],
    look: [-1.35, 2.2, -3.8],
  },
  {
    key: "work",
    label: "Work",
    object: "CRT monitor",
    verb: "Open the inventory",
    href: "/work",
    marker: [0.75, 2.45, -3.2],
    ring: [0.8, -2.5, 1.25],
    cam: [2.4, 2.4, 0.6],
    look: [0.6, 1.4, -3.3],
  },
  {
    key: "projects",
    label: "Projects",
    object: "Disc shelf",
    verb: "Browse every project",
    href: "/projects",
    marker: [-3.55, 3.05, -1.3],
    ring: [-3.1, -1.3, 1.1],
    cam: [1.6, 2.6, 1.4],
    look: [-3.6, 1.8, -1.3],
  },
  {
    key: "playground",
    label: "Playground",
    object: "Arcade cabinet",
    verb: "Play with experiments",
    href: "/playground",
    marker: [-3.05, 2.85, -3.15],
    ring: [-3.0, -3.1, 0.9],
    cam: [0.4, 2.4, 0.4],
    look: [-3.1, 1.4, -3.2],
  },
  {
    key: "contact",
    label: "Contact",
    object: "Telephone",
    verb: "Send a message",
    href: "/contact",
    marker: [3.0, 1.75, -1.0],
    ring: [3.0, -1.0, 0.8],
    cam: [4.6, 2.4, 2.4],
    look: [3.0, 0.9, -1.0],
  },
];
