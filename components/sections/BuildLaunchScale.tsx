"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

const WORDS = ["Story.", "Character.", "Image.", "Sound.", "Motion."];
const CLOSING_LINE = "Film is what happens when they become one.";

// TTFM's editorial manifesto beat: the elements of filmmaking cycle through
// one at a time, each intensifying then dissolving into the next — and as the
// last word ("Motion.") dissolves, the closing line crossfades in to answer
// what all of them add up to.
export default function BuildLaunchScale() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);
  const closingRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const animated = !reducedMotion;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !animated) return;
    registerGsap();

    gsap.set(wordRefs.current, { opacity: 0.08, scale: 0.82, filter: "blur(6px)" });
    gsap.set(wordRefs.current[0], { opacity: 1, scale: 1, filter: "blur(0px)" });
    gsap.set(closingRef.current, { autoAlpha: 0 });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${WORDS.length * 100}%`,
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        const fractional = self.progress * (WORDS.length - 1);
        // The last word dissolves through the final ~15% of pin progress instead
        // of holding static — and the closing line crossfades in over that same
        // window, so the manifesto's answer arrives right as "Motion." fades.
        const exitStart = 0.85;
        const exitT = Math.max(0, (self.progress - exitStart) / (1 - exitStart));

        wordRefs.current.forEach((el, i) => {
          if (!el) return;
          const dist = Math.min(Math.abs(fractional - i), 1);
          const amt = 1 - dist;
          const isLast = i === WORDS.length - 1;
          const scale = gsap.utils.interpolate(0.82, 1, amt) * (isLast ? 1 + exitT * 0.7 : 1);
          const blur = gsap.utils.interpolate(6, 0, amt) + (isLast ? exitT * 14 : 0);
          const opacity = gsap.utils.interpolate(0.08, 1, amt) * (isLast ? 1 - exitT * 0.85 : 1);

          gsap.set(el, {
            opacity,
            scale,
            filter: `blur(${blur}px)`,
          });
        });

        gsap.set(closingRef.current, { autoAlpha: exitT });
      },
    });

    return () => st.kill();
  }, [animated]);

  return (
    <>
      <div
        className={
          animated
            ? "hidden"
            : "flex flex-col items-center gap-4 bg-ink py-32"
        }
      >
        {WORDS.map((word) => (
          <div
            key={word}
            className="font-headline text-[13vw] leading-none text-paper md:text-[8vw]"
          >
            {word}
          </div>
        ))}
        <p className="font-headline mt-6 max-w-lg text-center text-2xl leading-snug text-paper-dim md:text-3xl">
          {CLOSING_LINE}
        </p>
      </div>

      <div
        ref={sectionRef}
        className={
          animated
            ? "relative flex h-screen w-full items-center justify-center bg-ink"
            : "hidden"
        }
      >
        <div className="relative flex h-[1.1em] items-center justify-center">
          {WORDS.map((word, i) => (
            <div
              key={word}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              className="font-headline absolute text-[16vw] leading-none text-paper md:text-[11vw]"
            >
              {word}
            </div>
          ))}
        </div>

        <div
          ref={closingRef}
          className="container-px pointer-events-none absolute inset-0 flex items-center justify-center text-center"
        >
          <p className="font-headline max-w-2xl text-3xl leading-snug text-paper sm:text-4xl md:text-5xl">
            {CLOSING_LINE}
          </p>
        </div>
      </div>
    </>
  );
}
