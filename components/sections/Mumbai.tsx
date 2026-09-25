"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import SplitHeading from "@/components/ui/SplitHeading";
import FrameLine from "@/components/ui/FrameLine";
import LazyVideo from "@/components/ui/LazyVideo";

// TTFM's geographic identity beat — coordinates, then the city, then what it
// means for the work. Real Mumbai skyline footage (free-license, see
// public/videos/mumbai-skyline.mp4), not stand-in imagery from elsewhere.
export default function Mumbai() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;
    registerGsap();

    const items = section.querySelectorAll<HTMLElement>("[data-reveal]");
    gsap.set(items, { autoAlpha: 0, y: 16 });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 60%",
      onEnter: () => {
        gsap.to(items, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.25, ease: "power3.out" });
      },
    });

    return () => st.kill();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="mumbai"
      className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden border-t border-line bg-ink py-32 text-center"
    >
      {!reducedMotion && (
        <LazyVideo
          aria-hidden
          src="/videos/mumbai-skyline.mp4"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-ink/70 to-ink"
      />

      <div className="relative z-10 flex flex-col items-center">
        <span data-reveal className="font-body text-xs tracking-[0.3em] text-paper-dim/60">
          19&deg;04&prime; N / 72&deg;52&prime; E
        </span>

        <h2
          data-reveal
          className="font-headline mt-6 text-[20vw] leading-[0.85] text-paper sm:text-[13vw] md:text-[9vw]"
        >
          Mumbai
        </h2>

        <div data-reveal className="mt-10 w-full max-w-40">
          <FrameLine />
        </div>

        <SplitHeading
          as="p"
          type="words"
          className="font-editorial mt-10 max-w-xl text-2xl text-paper-dim md:text-3xl"
        >
          Where stories meet scale.
        </SplitHeading>
      </div>
    </section>
  );
}
