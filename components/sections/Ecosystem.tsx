"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useIsMobile } from "@/lib/useIsMobile";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useLenis } from "@/lib/lenis";
import { verticals } from "@/data/verticals";
import LaunchingBadge from "@/components/ui/LaunchingBadge";
import SplitHeading from "@/components/ui/SplitHeading";
import PanelCanvas from "@/components/visuals/PanelCanvas";
import { panelVisuals } from "@/components/visuals/panelVisuals";
import { verticalPanelTint } from "@/lib/verticalPalette";

const HOLD_PLAY_DURATION = 8; // seconds for a full 0 -> 1 flythrough
const AUTO_PLAY_DURATION = 14; // seconds for a full 0 -> 1 drift, gentler than hold
const AUTO_PLAY_IDLE_MS = 500; // how long scroll must be still before drifting

const EcosystemScene = dynamic(() => import("@/components/three/EcosystemScene"), {
  ssr: false,
});

const stops = [
  { name: "TTFM Production", descriptor: "One studio. Seven crafts.", status: "live" as const },
  ...verticals.map((v) => ({ name: v.name, descriptor: v.descriptor, status: v.status })),
];

function DesktopEcosystem({ active }: { active: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sceneWrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const holdingRef = useRef(false);
  const stRef = useRef<ScrollTrigger | null>(null);
  const holdTweenRef = useRef<gsap.core.Tween | null>(null);
  const autoTweenRef = useRef<gsap.core.Tween | null>(null);
  const lastScrollAtRef = useRef(0);
  const lenisRef = useLenis();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Shared by both scroll-scrub and the press-and-hold flythrough below — whatever
  // sets progress (scroll position or the hold tween) drives the same visual state.
  const applyProgress = (p: number) => {
    progressRef.current = p;
    const idx = Math.round(p * (stops.length - 1));
    setActiveIndex((prev) => (prev === idx ? prev : idx));
    if (sceneWrapperRef.current) {
      const enter = Math.min(1, p / 0.08);
      const exit = Math.min(1, (1 - p) / 0.08);
      gsap.set(sceneWrapperRef.current, { autoAlpha: enter * exit });
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !active) return;
    registerGsap();

    // The WebGL wrapper fades in over the first ~8% of pin progress and now also
    // fades out over the last ~8% instead of holding full opacity until an abrupt
    // unpin — a symmetric envelope so the graph overlaps the outgoing Hero on the
    // way in (see Hero.tsx's exitProgress) and overlaps CompanyShowcase's own
    // scroll-reveal heading on the way out, instead of cutting hard either side.
    gsap.set(sceneWrapperRef.current, { autoAlpha: 0 });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${stops.length * 100}%`,
      pin: true,
      scrub: 0.8,
      onUpdate: (self) => {
        lastScrollAtRef.current = performance.now();
        if (holdingRef.current) return; // press-and-hold owns progress right now
        applyProgress(self.progress);
      },
    });
    stRef.current = st;

    return () => {
      st.kill();
      stRef.current = null;
    };
  }, [active]);

  // Scroll-release auto-continue — the specific "astronaut" behavior: scroll
  // forward/back scrubs normally (already bidirectional via ScrollTrigger scrub
  // above), and letting go makes it keep drifting forward on its own until you
  // scroll again or it reaches the end.
  const stopAutoPlay = () => {
    if (!autoTweenRef.current) return;
    autoTweenRef.current.kill();
    autoTweenRef.current = null;
    setIsAutoPlaying(false);

    const st = stRef.current;
    const lenis = lenisRef?.current;
    lenis?.start();
    if (st && lenis) {
      const targetY = st.start + (st.end - st.start) * progressRef.current;
      lenis.scrollTo(targetY, { immediate: true, force: true });
    }
  };

  const startAutoPlay = () => {
    if (autoTweenRef.current || holdingRef.current) return;
    const st = stRef.current;
    if (!st || !st.isActive || progressRef.current >= 0.999) return;

    setIsAutoPlaying(true);
    lenisRef?.current?.stop();

    const state = { p: progressRef.current };
    autoTweenRef.current = gsap.to(state, {
      p: 1,
      duration: (1 - state.p) * AUTO_PLAY_DURATION,
      ease: "power1.out",
      onUpdate: () => applyProgress(state.p),
      onComplete: () => {
        autoTweenRef.current = null;
        setIsAutoPlaying(false);
        const stNow = stRef.current;
        const lenis = lenisRef?.current;
        lenis?.start();
        if (stNow && lenis) {
          lenis.scrollTo(stNow.end, { immediate: true, force: true });
        }
      },
    });
  };

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      if (holdingRef.current || autoTweenRef.current) return;
      if (performance.now() - lastScrollAtRef.current > AUTO_PLAY_IDLE_MS) {
        startAutoPlay();
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    window.addEventListener("wheel", stopAutoPlay, { passive: true });
    return () => window.removeEventListener("wheel", stopAutoPlay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoPlaying]);

  // Press-and-hold: the Lusion-astronaut equivalent. Hold to fly through the
  // ecosystem at a steady pace, release to freeze exactly where it stopped.
  const handleHoldStart = (e: React.PointerEvent) => {
    if (!active || e.button !== 0) return;
    const st = stRef.current;
    if (!st) return;

    if (autoTweenRef.current) {
      autoTweenRef.current.kill();
      autoTweenRef.current = null;
      setIsAutoPlaying(false);
    }

    holdingRef.current = true;
    setIsHolding(true);
    lenisRef?.current?.stop();

    const startP = progressRef.current > 0.96 ? 0 : progressRef.current;
    const state = { p: startP };
    holdTweenRef.current?.kill();
    holdTweenRef.current = gsap.to(state, {
      p: 1,
      duration: (1 - startP) * HOLD_PLAY_DURATION,
      ease: "none",
      onUpdate: () => applyProgress(state.p),
    });
  };

  const handleHoldEnd = () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setIsHolding(false);
    holdTweenRef.current?.kill();

    const st = stRef.current;
    const lenis = lenisRef?.current;
    // lenis.scrollTo() silently no-ops while lenis.isStopped (see lenis/dist/
    // lenis.mjs: `if ((this.isStopped || this.isLocked) && !force) return;`) —
    // start() must run first (or pass force:true) or the sync below is a no-op
    // and the next real scroll snaps the view back to the pre-hold position.
    lenis?.start();
    if (st && lenis) {
      const targetY = st.start + (st.end - st.start) * progressRef.current;
      lenis.scrollTo(targetY, { immediate: true, force: true });
    }
  };

  useEffect(() => {
    if (!textRef.current) return;
    gsap.fromTo(
      textRef.current,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, [activeIndex]);

  const stop = stops[activeIndex];

  return (
    <div
      ref={sectionRef}
      onPointerDown={handleHoldStart}
      onPointerUp={handleHoldEnd}
      onPointerLeave={handleHoldEnd}
      onPointerCancel={handleHoldEnd}
      data-cursor={active ? "link" : undefined}
      data-cursor-label={
        active ? (isHolding ? "Exploring" : isAutoPlaying ? "Drifting" : "Hold") : undefined
      }
      className={
        active
          ? "relative h-screen w-full overflow-hidden bg-ink"
          : "hidden"
      }
    >
      <div ref={sceneWrapperRef} className="absolute inset-0">
        {active && (
          <EcosystemScene
            verticals={verticals}
            progressRef={progressRef}
            holdingRef={holdingRef}
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />

      <div className="container-px pointer-events-none absolute inset-0 flex flex-col justify-between py-28">
        <div className="flex items-center justify-between">
          <span className="eyebrow">What We Do</span>
          <span className="eyebrow text-steel transition-opacity duration-300">
            {isHolding ? "Exploring…" : isAutoPlaying ? "Drifting…" : "Hold to Explore"}
          </span>
        </div>

        <div ref={textRef} className="mx-auto max-w-2xl text-center">
          <div className="eyebrow mb-4 text-steel">
            {String(activeIndex).padStart(2, "0")} / {String(stops.length - 1).padStart(2, "0")}
          </div>
          <h2 className="font-serif-display text-5xl font-normal text-paper md:text-7xl">
            {stop.name}
          </h2>
          <p className="mt-4 text-base text-paper-dim md:text-lg">{stop.descriptor}</p>
          {stop.status === "launching" && (
            <LaunchingBadge className="mt-5 inline-flex" />
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          {stops.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-8 bg-ember" : "w-1.5 bg-paper-dim/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileEcosystem({ active }: { active: boolean }) {
  return (
    <div className={active ? "container-px relative bg-ink py-24" : "hidden"}>
      <span className="eyebrow">The Ecosystem</span>
      <SplitHeading
        as="h2"
        type="lines"
        className="font-serif-display mt-4 text-4xl font-normal text-paper"
      >
        One studio. Seven crafts.
      </SplitHeading>

      <div className="mt-14 flex flex-col gap-4">
        {verticals.map((v) => (
          <div
            key={v.slug}
            className="flex items-center gap-5 rounded-2xl border border-line bg-ink-raised/40 p-4"
          >
            <div
              className="relative h-16 w-16 flex-none overflow-hidden rounded-xl border border-line"
              style={{ background: verticalPanelTint[v.slug] ?? "#101012" }}
            >
              {panelVisuals[v.slug] && (
                <PanelCanvas draw={panelVisuals[v.slug]} className="absolute inset-0" />
              )}
              <span className="eyebrow absolute bottom-1 right-1.5 text-[0.6rem] text-ember">
                {v.code}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-display text-lg font-medium text-paper">{v.name}</h3>
                {v.status === "launching" && <LaunchingBadge />}
              </div>
              <p className="mt-1 text-sm text-steel">{v.descriptor}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Ecosystem() {
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const desktopActive = !isMobile && !reducedMotion;

  return (
    <section id="ecosystem">
      <DesktopEcosystem active={desktopActive} />
      <MobileEcosystem active={!desktopActive} />
    </section>
  );
}
