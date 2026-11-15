"use client";

import Image from "next/image";
import type { Media } from "@/content/types";
import { useGame } from "@/components/providers/GameProvider";

export function aspectToCss(aspect = "16:9") {
  const [w, h] = aspect.split(":").map(Number);
  return w && h ? `${w} / ${h}` : "16 / 9";
}

type Props = {
  media: Media;
  /** "world" = dark game UI, "paper" = light editorial pages */
  tone?: "world" | "paper";
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Force a ratio regardless of the media's own (e.g. square inventory slots) */
  aspect?: string;
  /** Hide the caption even if one exists */
  bare?: boolean;
};

/**
 * Renders an image or video at a fixed ratio. With no `src`, renders a labelled
 * empty slot so layouts can be reviewed before real assets arrive.
 */
export function MediaFrame({ media, tone = "world", sizes = "100vw", priority, className = "", aspect, bare }: Props) {
  const { reducedMotion } = useGame();
  const ratio = aspectToCss(aspect ?? media.aspect);
  const kind = media.kind ?? "image";
  const pix = media.pixelated ? "pixelated" : "";

  let inner: React.ReactNode;
  if (!media.src) {
    inner = (
      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 p-3 text-center ${tone === "paper" ? "dither-paper text-print-dim" : "dither text-dim"}`}>
        <span className="font-pixel text-[10px] uppercase tracking-widest">{kind === "video" ? "▶ Video slot" : "▣ Image slot"}</span>
        <span className="font-term text-base leading-none opacity-70">{aspect ?? media.aspect ?? "16:9"}</span>
      </div>
    );
  } else if (kind === "video") {
    inner = (
      <video
        className={`absolute inset-0 h-full w-full object-cover ${pix}`}
        src={media.src}
        poster={media.poster}
        muted
        loop
        playsInline
        autoPlay={!reducedMotion}
        controls={reducedMotion}
        preload="metadata"
        aria-label={media.alt}
      />
    );
  } else {
    inner = (
      <Image
        src={media.src}
        alt={media.alt ?? ""}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${pix}`}
      />
    );
  }

  return (
    <figure className={className}>
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: ratio }}>
        {inner}
      </div>
      {!bare && media.caption && (
        <figcaption className={`mt-2 font-term text-lg leading-tight ${tone === "paper" ? "text-print-dim" : "text-dim"}`}>{media.caption}</figcaption>
      )}
    </figure>
  );
}
