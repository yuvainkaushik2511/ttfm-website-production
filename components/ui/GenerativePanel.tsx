"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { gsap } from "@/lib/gsap";
import { useIsTouchDevice } from "@/lib/useIsTouchDevice";
import { useDeviceTier } from "@/lib/useDeviceTier";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useInViewport } from "@/lib/useInViewport";
import PanelCanvas from "@/components/visuals/PanelCanvas";
import { panelVisuals } from "@/components/visuals/panelVisuals";
import { verticalPanelTint } from "@/lib/verticalPalette";
import { NOISE_SVG } from "@/lib/noise";

const CreatorsScene = dynamic(() => import("@/components/three/CreatorsScene"), {
  ssr: false,
});
const ProductionsScene = dynamic(() => import("@/components/three/ProductionsScene"), {
  ssr: false,
});

// Creators and Productions get bespoke WebGL/shader treatments (see plan round 3);
// the other five stay on the canvas2D generative system, an equally legitimate
// medium per the brief. WebGL scenes fully mount/unmount off-screen (not just
// pause) since a WebGL context is far more expensive than canvas2D and all 7
// card DOM nodes exist at once inside the horizontal Work track.
const WEBGL_SCENES: Record<string, ComponentType> = {
  creators: CreatorsScene,
  productions: ProductionsScene,
};

interface GenerativePanelProps {
  slug: string;
  code: string;
  title: string;
  descriptor: string;
  /** Optional real footage (public/videos/*.mp4) — takes priority over the
   * WebGL/canvas generative treatment when present and motion isn't reduced. */
  video?: string;
}

export default function GenerativePanel({ slug, code, title, descriptor, video }: GenerativePanelProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();
  const draw = panelVisuals[slug];

  const tier = useDeviceTier();
  const reducedMotion = useReducedMotion();
  const inView = useInViewport(cardRef);
  const WebGLScene = WEBGL_SCENES[slug];
  const useWebGL = !!WebGLScene && tier === "high" && !reducedMotion;
  const useVideo = !!video && !reducedMotion;

  // Animate a plain state object rather than the element's transform directly —
  // gsap's CSSPlugin transform-composition conflicts with Tailwind v4's native
  // `rotate`/`scale`/`translate` CSS properties ("not eligible for reset"
  // warning, silently no-op'ing rotateX/rotateY quickTo on the element itself).
  const tiltState = useRef({ rx: 0, ry: 0 });
  const tiltX = useRef<((v: number) => void) | null>(null);
  const tiltY = useRef<((v: number) => void) | null>(null);

  const applyTilt = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `rotateX(${tiltState.current.rx}deg) rotateY(${tiltState.current.ry}deg)`;
  };

  useEffect(() => {
    if (isTouch) return;
    tiltX.current = gsap.quickTo(tiltState.current, "rx", {
      duration: 0.6,
      ease: "power3.out",
      onUpdate: applyTilt,
    });
    tiltY.current = gsap.quickTo(tiltState.current, "ry", {
      duration: 0.6,
      ease: "power3.out",
      onUpdate: applyTilt,
    });
  }, [isTouch]);

  const handleMove = (e: React.MouseEvent) => {
    if (isTouch || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    tiltX.current?.(-relY * 10);
    tiltY.current?.(relX * 10);
  };

  const handleLeave = () => {
    tiltX.current?.(0);
    tiltY.current?.(0);
  };

  return (
    <div
      className="h-full w-[88vw] flex-none md:w-[62vw] lg:w-[46vw]"
      style={{ perspective: 1200 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        data-cursor="link"
        data-cursor-label="Watch"
        style={{
          transformStyle: "preserve-3d",
          background: verticalPanelTint[slug] ?? "#101012",
        }}
        className="relative flex h-full w-full flex-col justify-end overflow-hidden rounded-[2rem] border border-line will-change-transform"
      >
        {useVideo ? (
          inView && (
            <video
              src={video}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          )
        ) : useWebGL ? (
          inView && WebGLScene && <WebGLScene />
        ) : (
          draw && <PanelCanvas draw={draw} className="absolute inset-0" />
        )}

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: `url("${NOISE_SVG}")` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />

        <span
          aria-hidden
          className="font-display pointer-events-none absolute -top-4 left-4 z-0 text-[7rem] font-semibold leading-none text-paper/[0.06] md:text-[9rem]"
        >
          {code}
        </span>

        <div className="relative z-10 p-8 md:p-10">
          <span className="eyebrow text-steel">{code}</span>
          <h3 className="font-display mt-3 text-3xl font-medium text-paper md:text-4xl">{title}</h3>
          <p className="mt-2 max-w-sm text-sm text-paper-dim md:text-base">{descriptor}</p>
        </div>
      </div>
    </div>
  );
}
