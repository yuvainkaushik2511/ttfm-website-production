"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "@/lib/gsap";
import { NOISE_SVG } from "@/lib/noise";
import { creatorsTheme } from "@/lib/creatorsTheme";
import { useDeviceTier } from "@/lib/useDeviceTier";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";

const CreatorsAmbientScene = dynamic(
  () => import("@/components/three/creators/CreatorsAmbientScene"),
  { ssr: false }
);

// Mounted once in app/creators/layout.tsx, fixed behind every section: the
// "never static" background system the spec asks for (grain, moving gradients,
// floating particles, depth). Same WebGL gate GenerativePanel already uses
// (tier === "high" && !reducedMotion) since this is the one always-live context
// for the whole route.
export default function CreatorsAmbient() {
  const glowARef = useRef<HTMLDivElement>(null);
  const glowBRef = useRef<HTMLDivElement>(null);
  const glowCRef = useRef<HTMLDivElement>(null);
  const glowDRef = useRef<HTMLDivElement>(null);
  const tier = useDeviceTier();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const useWebGL = tier === "high" && !reducedMotion;

  useEffect(() => {
    if (reducedMotion) return;
    const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
    tl.to(glowARef.current, { xPercent: 14, yPercent: -10, duration: 22 }, 0);
    tl.to(glowBRef.current, { xPercent: -16, yPercent: 12, duration: 26 }, 0);
    tl.to(glowCRef.current, { xPercent: -12, yPercent: -14, duration: 30 }, 0);
    tl.to(glowDRef.current, { xPercent: 10, yPercent: 16, duration: 24 }, 0);
    return () => {
      tl.kill();
    };
  }, [reducedMotion]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink" aria-hidden>
      {/* Four independently-drifting glows across the vivid spectrum — not just
          one accent on black — the "zyada vibrant/colorful" direction. */}
      <div
        ref={glowARef}
        className="absolute -left-1/4 top-[-10%] h-[70vh] w-[70vh] rounded-full opacity-50 blur-[110px]"
        style={{
          background: `radial-gradient(circle, rgba(${creatorsTheme.accentRgb}, 0.6), transparent 70%)`,
        }}
      />
      <div
        ref={glowBRef}
        className="absolute -right-1/4 bottom-[-15%] h-[80vh] w-[80vh] rounded-full opacity-40 blur-[130px]"
        style={{
          background: `radial-gradient(circle, rgba(${creatorsTheme.spectrumRgb.violet}, 0.5), transparent 70%)`,
        }}
      />
      <div
        ref={glowCRef}
        className="absolute right-[-10%] top-[5%] h-[55vh] w-[55vh] rounded-full opacity-35 blur-[120px]"
        style={{
          background: `radial-gradient(circle, rgba(${creatorsTheme.spectrumRgb.cyan}, 0.5), transparent 70%)`,
        }}
      />
      <div
        ref={glowDRef}
        className="absolute bottom-[10%] left-[-8%] h-[50vh] w-[50vh] rounded-full opacity-30 blur-[110px]"
        style={{
          background: `radial-gradient(circle, rgba(${creatorsTheme.spectrumRgb.rose}, 0.45), transparent 70%)`,
        }}
      />

      {useWebGL && <CreatorsAmbientScene mobile={isMobile} />}

      <div
        className="absolute inset-0 opacity-[0.045] mix-blend-overlay"
        style={{ backgroundImage: `url("${NOISE_SVG}")` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink" />
    </div>
  );
}
