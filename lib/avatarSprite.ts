/**
 * Built-in 16×22 pixel avatar. Used until a real avatar is set in content/site.ts (`avatar`).
 * Edit the rows to restyle the character; colours live in PALETTE.
 */
export const PALETTE: Record<string, string> = {
  k: "#12121f", // outline
  h: "#2b2036", // hair
  H: "#4a3a5c", // hair highlight
  s: "#d9a07a", // skin
  S: "#b07a58", // skin shade
  e: "#12121f", // eyes
  g: "#5ee6c9", // headphones
  G: "#2a9c86", // headphones shade
  j: "#ffcc33", // jacket
  J: "#c99a14", // jacket shade
  t: "#f3f0e7", // t-shirt
  p: "#2d3561", // trousers
  b: "#12121f", // shoes
};

export const SPRITE = [
  "....kkkkkkkk....",
  "...kHHhhhhhhk...",
  "..kHhhhhhhhhhk..",
  ".kgkhhhhhhhhkgk.",
  "kGGkhsssssshkGGk",
  "kGGksesssseskGGk",
  ".kgksssssssskgk.",
  "...ksssSSsssk...",
  "....kssssssk....",
  ".....kSSSSk.....",
  "...kkjjttjjkk...",
  "..kjjjjttjjjjk..",
  ".kjjJjjttjjJjjk.",
  ".kjjJjjttjjJjjk.",
  ".kjjkjjttjjkjjk.",
  ".ksskjjttjjkssk.",
  ".kkkkjjjjjjkkkk.",
  "....kppppppk....",
  "....kppkkppk....",
  "....kppkkppk....",
  "...kbbbkkbbbk...",
  "...kkkkkkkkkk...",
];

export const SPRITE_W = 16;
export const SPRITE_H = SPRITE.length;

/** Draw the sprite. `blink` closes the eyes, `bob` shifts the body by 1px for an idle loop. */
export function drawSprite(ctx: CanvasRenderingContext2D, ox: number, oy: number, scale: number, opts: { blink?: boolean; bob?: boolean } = {}) {
  SPRITE.forEach((row, y) => {
    // Head bobs with the body; legs stay planted
    const dy = opts.bob && y < 17 ? 1 : 0;
    row.split("").forEach((k, x) => {
      if (k === ".") return;
      let key = k;
      if (opts.blink && k === "e") key = "S";
      ctx.fillStyle = PALETTE[key];
      ctx.fillRect(ox + x * scale, oy + (y + dy) * scale, scale, scale);
    });
  });
}
