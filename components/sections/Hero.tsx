"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import SplitHeading from "@/components/ui/SplitHeading";
import HeroMontage from "@/components/sections/HeroMontage";

function formatTimecode(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const montageRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const timecodeRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  // A running reel timecode against the montage — an editing-suite detail,
  // not a decorative clock. Tracks elapsed time since mount rather than any
  // single clip's currentTime, since the montage cross-cuts between clips.
  useEffect(() => {
    const label = timecodeRef.current;
    if (!label || reducedMotion) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      label.textContent = formatTimecode((performance.now() - start) / 1000);
    }, 250);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  // A slow camera-push on the montage as the section scrolls away — it scales
  // up gently rather than just cutting to the next section, so the hand-off
  // into Manifesto reads as one continuous move.
  useEffect(() => {
    const section = sectionRef.current;
    const montage = montageRef.current;
    if (!section || !montage || reducedMotion) return;
    registerGsap();

    const st = ScrollTrigger.create({
      trigger: section,
      start: "60% top",
      end: "bottom top",
      scrub: 0.3,
      onUpdate: (self) => {
        gsap.set(montage, { scale: gsap.utils.interpolate(1, 1.15, self.progress) });
      },
    });

    return () => st.kill();
  }, [reducedMotion]);

  useEffect(() => {
    const el = taglineRef.current;
    const cue = cueRef.current;
    if (!el || !cue) return;

    gsap.set([el, cue], { autoAlpha: 0, y: 16 });

    const reveal = () => {
      gsap.to(el, { autoAlpha: 1, y: 0, duration: 1, delay: 0.7, ease: "power3.out" });
      gsap.to(cue, { autoAlpha: 1, y: 0, duration: 0.8, delay: 1.3, ease: "power3.out" });
    };

    if (reducedMotion) {
      gsap.set([el, cue], { autoAlpha: 1, y: 0 });
      return;
    }

    window.addEventListener("ttfm:preloaded", reveal);
    return () => window.removeEventListener("ttfm:preloaded", reveal);
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-ink"
    >
      <div className="absolute inset-0 overflow-hidden">
        {reducedMotion ? (
          <video
            src="/videos/hero-clapperboard.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover opacity-60"
          />
        ) : (
          <HeroMontage ref={montageRef} className="absolute inset-0 h-full w-full opacity-60" />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/20 to-ink" />

      {/* Asymmetric frame: brand mark top-left, statement center-right, location
          bottom-left, scroll cue bottom-right — deliberately not centered. */}
      <div className="pointer-events-none absolute inset-0 z-10 p-6 md:p-12">
        <div className="absolute left-6 top-6 flex items-center gap-3 md:left-12 md:top-12">
          <span ref={timecodeRef} className="font-body text-xs tabular-nums text-paper-dim/60">
            00:00
          </span>
          <span className="eyebrow text-paper-dim">
            TTFM <span className="text-ember">/ 01</span>
          </span>
        </div>

        <div className="absolute bottom-6 left-6 eyebrow leading-relaxed text-paper-dim md:bottom-12 md:left-12">
          Mumbai &mdash; India
        </div>

        <div
          ref={cueRef}
          className="absolute bottom-6 right-6 flex flex-col items-end gap-2 md:bottom-12 md:right-12"
        >
          <span className="eyebrow text-paper-dim">Scroll to explore</span>
          <span className="h-10 w-px bg-gradient-to-b from-paper-dim to-transparent" />
        </div>
      </div>

      <div className="container-px relative z-10 flex w-full justify-center md:justify-end">
        <div className="max-w-3xl text-center md:pr-8 md:text-right">
          <SplitHeading
            as="h1"
            type="chars"
            trigger="preload"
            stagger={0.04}
            skew
            className="font-headline text-[12vw] leading-[0.9] tracking-tight text-paper sm:text-[10vw] md:text-[8vw] lg:text-[7vw]"
          >
            Stories in motion.
          </SplitHeading>

          <p
            ref={taglineRef}
            className="eyebrow mt-6 text-paper-dim md:mt-8"
          >
            Film &middot; Series &middot; Commercial &middot; Music
          </p>
        </div>
      </div>
    </section>
  );
}
