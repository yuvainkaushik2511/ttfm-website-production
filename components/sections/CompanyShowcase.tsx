"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { verticals } from "@/data/verticals";
import SplitHeading from "@/components/ui/SplitHeading";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function CompanyShowcase() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeBackRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // A second, larger, rotated duplicate text layer moving opposite the first —
  // the fromanother.love marquee-depth technique (still ink/paper/ember only).
  useEffect(() => {
    if (reducedMotion) return;
    registerGsap();
    const tweens = [
      marqueeRef.current &&
        gsap.to(marqueeRef.current, { xPercent: -50, duration: 28, ease: "none", repeat: -1 }),
      marqueeBackRef.current &&
        gsap.fromTo(
          marqueeBackRef.current,
          { xPercent: -50 },
          { xPercent: 0, duration: 42, ease: "none", repeat: -1 }
        ),
    ].filter(Boolean) as gsap.core.Tween[];
    return () => {
      tweens.forEach((t) => t.kill());
    };
  }, [reducedMotion]);

  // A camera-push entrance (scale + blur settle) on top of the heading's own
  // text reveal — reads as the camera arriving here as Ecosystem's exit-fade
  // recedes, rather than the section just appearing.
  useEffect(() => {
    const content = contentRef.current;
    if (reducedMotion || !content) return;
    registerGsap();

    gsap.set(content, { scale: 0.85, filter: "blur(6px)" });

    const st = ScrollTrigger.create({
      trigger: content,
      start: "top bottom",
      end: "top 55%",
      scrub: 0.6,
      onUpdate: (self) => {
        gsap.set(content, {
          scale: gsap.utils.interpolate(0.85, 1, self.progress),
          filter: `blur(${gsap.utils.interpolate(6, 0, self.progress)}px)`,
        });
      },
    });

    return () => st.kill();
  }, [reducedMotion]);

  const names = [...verticals, ...verticals];

  return (
    <section className="relative overflow-hidden border-y border-line bg-ink py-32">
      <div
        ref={marqueeBackRef}
        className="pointer-events-none absolute left-0 top-1/2 flex w-max origin-center -translate-y-1/2 -rotate-[4deg] gap-14 whitespace-nowrap opacity-[0.04]"
      >
        {names.map((v, i) => (
          <span key={i} className="font-display text-[15vw] font-semibold leading-none text-steel">
            {v.name}
          </span>
        ))}
      </div>

      <div
        ref={marqueeRef}
        className="pointer-events-none absolute left-0 top-10 flex w-max gap-10 whitespace-nowrap opacity-[0.09]"
      >
        {names.map((v, i) => (
          <span key={i} className="font-display text-[10vw] font-semibold leading-none text-paper">
            {v.name}
          </span>
        ))}
      </div>

      <div ref={contentRef} className="container-px relative z-10 mx-auto max-w-4xl text-center">
        <span className="eyebrow">The Studio</span>
        <SplitHeading
          as="h2"
          type="lines"
          skew
          className="font-serif-display mt-6 text-5xl font-normal leading-[1.02] text-paper sm:text-6xl md:text-7xl"
        >
          One studio. Every format.
        </SplitHeading>
        <p className="font-editorial mx-auto mt-8 max-w-xl text-xl text-paper-dim md:text-2xl">
          Feature to frame, produced end to end.
        </p>
      </div>
    </section>
  );
}
