import type { Experiment } from "./types";

/**
 * PLAYGROUND
 * Built-in experiments are interactive toys coded into the site.
 * Add your own motion pieces, pixel art, 3D renders or links as `media` / `link` entries:
 *   { slug: "loop-01", kind: "media", title: "Loop 01", description: "…",
 *     media: { kind: "video", src: "/assets/playground/loop-01.mp4", aspect: "1:1" } }
 */
export const experiments: Experiment[] = [
  {
    slug: "dither-lab",
    kind: "built-in",
    title: "Dither Lab",
    description: "Drop any image and crunch it through ordered dithering and retro palettes. Export the result.",
    tags: ["creative coding", "canvas"],
  },
  {
    slug: "pixel-studio",
    kind: "built-in",
    title: "Pixel Studio",
    description: "A tiny 16×16 sprite editor with a limited palette. Draw something, save it as a PNG.",
    tags: ["pixel art", "tool"],
  },
  {
    slug: "kern-catch",
    kind: "built-in",
    title: "Kern Catch",
    description: "Letters fall. Catch the ones that spell the word. A one-minute game about typography.",
    tags: ["game", "type"],
  },
];
