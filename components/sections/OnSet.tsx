"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import LazyVideo from "@/components/ui/LazyVideo";

// A dedicated production-immersion beat: full-width crew footage behind
// diverging "ON" / "SET." typography that pulls apart as the section scrolls
// through, then a short line of production metadata settles in.
export default function OnSet() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const onRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;
    registerGsap();

    gsap.set(metaRef.current, { autoAlpha: 0, y: 16 });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=90%",
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(onRef.current, { yPercent: gsap.utils.interpolate(0, -60, p) });
        gsap.set(setRef.current, { yPercent: gsap.utils.interpolate(0, 60, p) });
        const metaT = Math.max(0, (p - 0.4) / 0.6);
        gsap.set(metaRef.current, { autoAlpha: metaT, y: gsap.utils.interpolate(16, 0, metaT) });
      },
    });

    return () => st.kill();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-ink"
    >
      {!reducedMotion && (
        <LazyVideo
          src="/videos/crew-director-shoot.mp4"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-ink/50 to-ink" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div ref={onRef} className="font-headline text-[22vw] leading-[0.8] text-paper sm:text-[15vw] md:text-[11vw]">
          On
        </div>
        <div ref={setRef} className="font-headline text-[22vw] leading-[0.8] text-paper sm:text-[15vw] md:text-[11vw]">
          Set.
        </div>

        <div
          ref={metaRef}
          className="absolute bottom-[-4rem] flex flex-col items-center gap-1 sm:bottom-[-3rem]"
        >
          <span className="eyebrow text-paper-dim">Mumbai Studio &middot; Director-led</span>
        </div>
      </div>
    </section>
  );
}
