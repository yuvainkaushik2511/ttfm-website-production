"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import SplitHeading from "@/components/ui/SplitHeading";

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // A brief pin (not a long one — About stays short by design) where a
  // clip-path mask opens on the background image while the heading settles
  // out of a blur — a small camera-focus-pull moment before Contact. This is
  // the site's brand-philosophy beat: one confident claim, dark background,
  // huge type, no supporting copy.
  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const image = imageRef.current;
    if (reducedMotion || !section || !content || !image) return;
    registerGsap();

    gsap.set(content, { filter: "blur(10px)" });
    gsap.set(image, { clipPath: "inset(38% 38% 38% 38%)" });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=80%",
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        const inset = gsap.utils.interpolate(38, 0, self.progress);
        gsap.set(image, { clipPath: `inset(${inset}% ${inset}% ${inset}% ${inset}%)` });
        gsap.set(content, { filter: `blur(${gsap.utils.interpolate(10, 0, self.progress)}px)` });
      },
    });

    return () => st.kill();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden border-t border-line bg-ink py-32 md:py-40"
    >
      <div ref={imageRef} className="absolute inset-0">
        <Image
          src="/images/clapperboard-hand.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40 grayscale"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-ink/60 to-ink" />

      <div ref={contentRef} className="container-px relative z-10 mx-auto max-w-3xl text-center">
        <span className="eyebrow">Philosophy</span>
        <SplitHeading
          as="h2"
          type="lines"
          className="font-headline mt-6 text-3xl leading-[1.3] text-paper sm:text-4xl md:text-5xl"
        >
          The frame is only the start. What people feel is the work.
        </SplitHeading>
      </div>
    </section>
  );
}
