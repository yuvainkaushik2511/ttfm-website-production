"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { LenisContext, type LenisRef } from "@/lib/lenis";
import { ScrollVelocityContext, type VelocityRef } from "@/lib/scrollVelocity";

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef: LenisRef = useRef(null);
  const velocityRef: VelocityRef = useRef(0);

  useEffect(() => {
    registerGsap();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const instance = new Lenis({
      duration: reducedMotion ? 0.4 : 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reducedMotion,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    lenisRef.current = instance;
    instance.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      instance.raf(time * 1000);
      velocityRef.current = instance.velocity;
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger's cached measurements once web fonts finish
    // swapping in and once the preloader releases the scroll lock — both can
    // reflow section heights (e.g. the chapter title cards' serif headlines)
    // after ScrollTrigger's pinned sections already computed their offsets.
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    const onPreloaded = () => ScrollTrigger.refresh();
    window.addEventListener("ttfm:preloaded", onPreloaded);

    return () => {
      gsap.ticker.remove(raf);
      window.removeEventListener("ttfm:preloaded", onPreloaded);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef}>
      <ScrollVelocityContext.Provider value={velocityRef}>
        {children}
      </ScrollVelocityContext.Provider>
    </LenisContext.Provider>
  );
}
