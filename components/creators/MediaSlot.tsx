"use client";

import { useMemo } from "react";
import PanelCanvas, { type DrawFn } from "@/components/visuals/PanelCanvas";
import { createRng } from "@/lib/rng";
import { creatorsTheme } from "@/lib/creatorsTheme";

export interface MediaSlotProps {
  /** Real asset path — when present, renders actual <video>/<img>. Absent today
   * everywhere on this route; this is the single grep target for "where do real
   * creator assets plug in." */
  mediaSrc?: string;
  posterSrc?: string;
  kind?: "video" | "image";
  /** Drives the generative fallback deterministically. */
  seed: number;
  visual?: DrawFn;
  className?: string;
}

function defaultCreatorTile(seed: number): DrawFn {
  const rng = createRng(seed);
  const bandCount = 3 + Math.floor(rng() * 3);
  const bands = Array.from({ length: bandCount }, () => ({
    y: rng(),
    amp: 0.05 + rng() * 0.08,
    speed: 0.15 + rng() * 0.25,
    phase: rng() * Math.PI * 2,
  }));

  return (ctx, t, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0a0a0b";
    ctx.fillRect(0, 0, w, h);
    for (const b of bands) {
      const y = (b.y + Math.sin(t * b.speed + b.phase) * b.amp) * h;
      const grad = ctx.createLinearGradient(0, y - h * 0.12, 0, y + h * 0.12);
      grad.addColorStop(0, `rgba(${creatorsTheme.accentRgb}, 0)`);
      grad.addColorStop(0.5, `rgba(${creatorsTheme.accentRgb}, 0.18)`);
      grad.addColorStop(1, `rgba(${creatorsTheme.accentRgb}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, y - h * 0.12, w, h * 0.24);
    }
  };
}

export default function MediaSlot({
  mediaSrc,
  posterSrc,
  kind = "video",
  seed,
  visual,
  className,
}: MediaSlotProps) {
  // PanelCanvas lists `draw` in its effect deps (see visuals/PanelCanvas.tsx) — a
  // fresh closure every render tears down and restarts its RAF loop, so the
  // generative fallback must be memoized on `seed`, not recreated per render.
  const fallback = useMemo(() => defaultCreatorTile(seed), [seed]);

  if (mediaSrc) {
    if (kind === "video") {
      return (
        <video
          className={className}
          src={mediaSrc}
          poster={posterSrc}
          muted
          loop
          playsInline
          preload="metadata"
        />
      );
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={mediaSrc} alt="" />;
  }

  return <PanelCanvas draw={visual ?? fallback} className={className} />;
}
