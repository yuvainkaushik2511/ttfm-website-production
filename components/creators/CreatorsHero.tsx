"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useDeviceTier } from "@/lib/useDeviceTier";
import { onPreloadReady } from "@/lib/preloadReady";
import { creatorsTheme } from "@/lib/creatorsTheme";
import SplitHeading from "@/components/ui/SplitHeading";

const CreatorWallScene = dynamic(
  () => import("@/components/three/creators/CreatorWallScene"),
  { ssr: false }
);

export default function CreatorsHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const reducedMotion = useReducedMotion();
  const tier = useDeviceTier();
  const useWebGL = tier === "high" && !reducedMotion;

  // Camera "push in" on scroll — the exact standalone-ScrollTrigger-onUpdate
  // pattern Hero.tsx uses for its exit dispersion, feeding both a WebGL uniform
  // and a DOM scale/blur settle on the copy block in lockstep.
  useEffect(() => {
    const section = sectionRef.current;
    const copy = copyRef.current;
    if (!section || reducedMotion) return;
    registerGsap();

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      scrub: 0.4,
      onUpdate: (self) => {
        zoomRef.current = 1 + self.progress * 0.7;
        if (copy) {
          gsap.set(copy, {
            scale: 1 + self.progress * 0.15,
            filter: `blur(${self.progress * 10}px)`,
            autoAlpha: 1 - self.progress * 1.1,
          });
        }
      },
    });

    return () => st.kill();
  }, [reducedMotion]);

  // Tagline + scroll cue wait on the preloader via onPreloadReady rather than a
  // fixed delay, so they land correctly whether the full ~3.4s creators intro
  // played, the quick repeat-visit fallback ran, or reduced-motion skipped both.
  useEffect(() => {
    const tagline = taglineRef.current;
    const cue = cueRef.current;
    if (!tagline || !cue) return;

    gsap.set([tagline, cue], { autoAlpha: 0, y: 16 });

    if (reducedMotion) {
      gsap.set([tagline, cue], { autoAlpha: 1, y: 0 });
      return;
    }

    return onPreloadReady(() => {
      gsap.to(tagline, { autoAlpha: 1, y: 0, duration: 1, delay: 0.5, ease: "power3.out" });
      gsap.to(cue, { autoAlpha: 1, y: 0, duration: 0.8, delay: 1.1, ease: "power3.out" });
    });
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-ink"
    >
      {useWebGL ? (
        <div className="absolute inset-0">
          <CreatorWallScene zoomRef={zoomRef} />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 35%, rgba(${creatorsTheme.accentRgb}, 0.22), transparent 65%)`,
          }}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink" />

      <div ref={copyRef} className="container-px relative z-10 flex flex-col items-center text-center">
        <span className="eyebrow text-ember">TTFM Creators</span>
        <SplitHeading
          as="h1"
          type="chars"
          trigger="preload"
          stagger={0.03}
          skew
          className="font-display mt-4 max-w-5xl text-[10.5vw] font-semibold leading-[0.95] tracking-tight text-paper sm:text-[8vw] md:text-[6vw] lg:text-[5vw]"
        >
          Your content. Your empire.
        </SplitHeading>
        <p
          ref={taglineRef}
          className="font-editorial mt-6 max-w-xl text-xl text-paper-dim sm:text-2xl"
        >
          We discover. We build. We produce. We scale.
        </p>
      </div>

      <div
        ref={cueRef}
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="eyebrow">Scroll</span>
        <span className="h-10 w-px bg-gradient-to-b from-paper-dim to-transparent" />
      </div>
    </section>
  );
}
