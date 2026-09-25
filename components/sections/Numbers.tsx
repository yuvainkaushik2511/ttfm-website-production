"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import StatCounter from "@/components/creators/StatCounter";

// A short "by the numbers" beat before Contact — closing with plain facts
// rather than another block of prose.
export default function Numbers() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;
    registerGsap();

    gsap.set(imageRef.current, { clipPath: "inset(0% 50% 0% 50%)" });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      onEnter: () => {
        gsap.to(imageRef.current, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.1,
          ease: "power3.out",
        });
      },
    });

    return () => st.kill();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-line bg-ink py-24 md:py-32"
    >
      <div ref={imageRef} className="absolute inset-0">
        <Image
          src="/images/cinema-seat.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-20 grayscale"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-ink/60 to-ink" />

      <div className="container-px relative z-10 mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-3">
          <StatCounter value={150} suffix="+" label="Projects" />
          <div className="flex flex-col items-center text-center">
            <span className="font-display text-[14vw] font-semibold leading-none text-paper sm:text-[8vw] md:text-[5vw]">
              2022
            </span>
            <span className="eyebrow mt-4 text-steel">Est.</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="font-display text-[10vw] font-semibold leading-none text-paper sm:text-[5.5vw] md:text-[3.4vw]">
              India
            </span>
            <span className="eyebrow mt-4 text-steel">Based in</span>
          </div>
        </div>
      </div>
    </section>
  );
}
