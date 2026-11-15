"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { drawSprite, SPRITE_H, SPRITE_W } from "@/lib/avatarSprite";
import { useGame } from "@/components/providers/GameProvider";
import { site } from "@/content/site";

/** Idle-animated pixel avatar (blink + breathe). Uses `site.avatar` instead when one is supplied. */
export function PixelAvatar({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { reducedMotion } = useGame();

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let f = 0;
    const render = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      // ground shadow
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.fillRect(4, SPRITE_H + 2, SPRITE_W - 0, 2);
      drawSprite(ctx, 2, 2, 1, { blink: f % 16 === 0, bob: !reducedMotion && f % 4 >= 2 });
      f++;
    };
    render();
    if (reducedMotion) return;
    const id = setInterval(render, 180);
    return () => clearInterval(id);
  }, [reducedMotion]);

  if (site.avatar) {
    return (
      <div className={`relative ${className}`} style={{ aspectRatio: `${SPRITE_W + 4} / ${SPRITE_H + 6}` }}>
        <Image src={site.avatar} alt={`${site.name}'s avatar`} fill className="pixelated object-contain" sizes="320px" />
      </div>
    );
  }

  return (
    <canvas
      ref={ref}
      width={SPRITE_W + 4}
      height={SPRITE_H + 6}
      className={`pixelated h-auto w-full ${className}`}
      role="img"
      aria-label={`Pixel-art avatar of ${site.name}`}
    />
  );
}
