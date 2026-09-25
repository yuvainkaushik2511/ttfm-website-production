"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ambientIntensity } from "@/lib/ambientIntensity";
import SplitHeading from "@/components/ui/SplitHeading";
import MagneticButton from "@/components/ui/MagneticButton";

// The page's own last section — the spec's "immersive final scene" — rather than
// a new Canvas: raises a density uniform on the already-mounted
// CreatorsAmbientScene (see lib/ambientIntensity.ts) while this section is in
// view, instead of mounting a 7th WebGL context just for the footer. The shared
// Footer below stays a quiet legal strip (see Footer.tsx's /creators branch).
export default function CreatorsFinale() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;
    registerGsap();

    const boost = () => gsap.to(ambientIntensity, { current: 1.7, duration: 1.2, ease: "power2.out" });
    const settle = () => gsap.to(ambientIntensity, { current: 1, duration: 1, ease: "power2.out" });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      end: "bottom top",
      onEnter: boost,
      onEnterBack: boost,
      onLeave: settle,
      onLeaveBack: settle,
    });

    return () => {
      st.kill();
      gsap.to(ambientIntensity, { current: 1, duration: 0.6 });
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="finale"
      className="relative flex h-[90vh] w-full flex-col items-center justify-center overflow-hidden bg-ink text-center"
    >
      <span className="eyebrow text-ember">TTFM Creators</span>
      <SplitHeading
        as="h2"
        type="chars"
        className="font-display mt-6 max-w-4xl text-[11vw] font-semibold leading-[0.95] text-paper sm:text-[8vw] md:text-[6vw]"
      >
        Ready to become a category of one?
      </SplitHeading>
      <MagneticButton
        as="a"
        href="#apply"
        className="mt-12 rounded-full bg-paper px-10 py-5 font-display text-lg font-medium text-ink hover:bg-ember"
      >
        Apply Now
      </MagneticButton>
    </section>
  );
}
