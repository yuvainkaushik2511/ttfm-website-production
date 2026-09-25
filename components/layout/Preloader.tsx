"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { markPreloaded } from "@/lib/preloadReady";
import { createRng } from "@/lib/rng";
import { silhouetteWidth } from "@/lib/creatorSilhouette";
import { creatorsTheme } from "@/lib/creatorsTheme";

const CREATORS_SESSION_KEY = "ttfm:creators-preloaded";
const CREATORS_DURATION_MS = 3400;
const MAIN_SESSION_KEY = "ttfm:main-preloaded";

interface Particle {
  scatterX: number;
  scatterY: number;
  gatherX: number;
  gatherY: number;
  silX: number;
  silY: number;
  burstDirX: number;
  burstDirY: number;
  colorMix: number;
  size: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(t: number) {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

// Three offset silhouette groups (not one) — reads as "a field of creators", not
// a single portrait, matching the spec's "particles gather -> creator
// silhouettes" (plural) beat.
function buildParticles(count: number): Particle[] {
  const rng = createRng(0x50524c44);
  const groupOffsets = [-0.22, 0, 0.22];
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const groupX = groupOffsets[i % groupOffsets.length];
    const y = rng() * 2 - 1;
    const w = silhouetteWidth(y);
    const edgeBias = 0.65 + rng() * 0.35;
    const side = rng() > 0.5 ? 1 : -1;
    const localX = side * w * edgeBias;

    const silX = 0.5 + groupX + localX * 0.34;
    const silY = 0.54 - y * 0.34;

    const gatherAngle = rng() * Math.PI * 2;
    const gatherRadius = rng() * 0.05;

    const dx = silX - 0.5;
    const dy = silY - 0.5;
    const dist = Math.hypot(dx, dy) || 1;

    particles.push({
      scatterX: rng(),
      scatterY: rng(),
      gatherX: 0.5 + Math.cos(gatherAngle) * gatherRadius,
      gatherY: 0.5 + Math.sin(gatherAngle) * gatherRadius * 0.6,
      silX,
      silY,
      burstDirX: dx / dist,
      burstDirY: dy / dist,
      colorMix: rng(),
      size: 1 + rng() * 1.7,
    });
  }
  return particles;
}

// t is 0..1 across the whole creators sequence. Four beats: gather -> resolve
// into silhouettes -> hold (logo locks up over this window) -> explode to stars.
function renderCreatorsFrame(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  t: number,
  w: number,
  h: number
) {
  const gatherEnd = 0.29;
  const resolveEnd = 0.59;
  const holdEnd = 0.82;

  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";

  for (const p of particles) {
    let x: number;
    let y: number;
    let alpha: number;

    if (t < gatherEnd) {
      const lt = smoothstep(t / gatherEnd);
      x = lerp(p.scatterX, p.gatherX, lt);
      y = lerp(p.scatterY, p.gatherY, lt);
      alpha = lerp(0.12, 0.5, lt);
    } else if (t < resolveEnd) {
      const lt = smoothstep((t - gatherEnd) / (resolveEnd - gatherEnd));
      x = lerp(p.gatherX, p.silX, lt);
      y = lerp(p.gatherY, p.silY, lt);
      alpha = lerp(0.5, 0.92, lt);
    } else if (t < holdEnd) {
      x = p.silX;
      y = p.silY;
      alpha = 0.92;
    } else {
      const lt = smoothstep((t - holdEnd) / (1 - holdEnd));
      x = p.silX + p.burstDirX * lt * 1.1;
      y = p.silY + p.burstDirY * lt * 1.1;
      alpha = 0.92 * (1 - lt);
    }

    const px = x * w;
    const py = y * h;

    ctx.beginPath();
    ctx.fillStyle =
      p.colorMix > 0.72
        ? `rgba(${creatorsTheme.accentBrightRgb}, ${alpha})`
        : `rgba(${creatorsTheme.accentRgb}, ${alpha * 0.85})`;
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over";
}

function readSessionSkip(key: string) {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeSessionSkip(key: string) {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    // sessionStorage unavailable (private mode, etc.) — harmless to skip.
  }
}

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const locationRef = useRef<HTMLSpanElement>(null);
  const ttfmCharsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const productionRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const scrollHintRef = useRef<HTMLSpanElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const panelTopRef = useRef<HTMLDivElement>(null);
  const panelBottomRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const skipRef = useRef<(() => void) | null>(null);
  const pathname = usePathname();
  // Captured once at mount, not recomputed on every render: Preloader lives in the
  // root layout and never unmounts across client-side navigation, so if this were
  // read fresh from `pathname` each render it would flip mid-session and re-fire
  // the effect below — replaying the scroll lock and the whole intro sequence the
  // moment a user navigates from "/" to "/creators" (or back).
  const [isCreators] = useState(() => pathname?.startsWith("/creators") ?? false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    document.documentElement.classList.add("lenis-stopped");
    document.body.style.overflow = "hidden";

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      document.body.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
      gsap.set(rootRef.current, { autoAlpha: 0 });
      setDone(true);
      markPreloaded();
      window.dispatchEvent(new CustomEvent("ttfm:preloaded"));
    };

    // Hard safety net: whatever the intro sequence is doing, the visitor is
    // never left staring at a stuck black screen — a throttled background tab,
    // a slow device, or a future timeline bug all resolve into the page after
    // at most 9s instead of hanging indefinitely.
    const safetyTimeout = window.setTimeout(finish, 9000);

    // buildTitleSequence: TTFM Production's entry — a film-title-card beat, not a
    // web loader. Coordinates -> wordmark letters -> full lockup -> a sweeping
    // frame-line -> the black screen splits into two panels (a shutter/iris
    // opening) that slide apart to reveal Hero underneath. No progress bar/counter
    // — that reads as "app loading", which the brief explicitly rules out.
    const buildTitleSequence = () => {
      const ttfmChars = ttfmCharsRef.current.filter((el): el is HTMLSpanElement => el !== null);
      const panels = [panelTopRef.current, panelBottomRef.current].filter(
        (el): el is HTMLDivElement => el !== null
      );

      gsap.set(ttfmChars, { autoAlpha: 0, yPercent: 30 });
      gsap.set(productionRef.current, { autoAlpha: 0, x: -12 });
      gsap.set(lineRef.current, { scaleX: 0 });
      gsap.set(scrollHintRef.current, { autoAlpha: 0 });

      // ~3.4s total — a quick film-title-card beat, not a drawn-out loader.
      // The root itself (not just the two panels) fades out at the very end —
      // the panels sliding apart only reveals a gap between them; the black
      // root div behind them still covers the whole screen until it's
      // explicitly faded too.
      return gsap
        .timeline({ defaults: { ease: "power3.out" }, onComplete: finish })
        .fromTo(locationRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 0.1)
        .to(locationRef.current, { autoAlpha: 0, duration: 0.25 }, 0.6)
        .to(ttfmChars, { autoAlpha: 1, yPercent: 0, duration: 0.4, stagger: 0.04 }, 0.75)
        .to(productionRef.current, { autoAlpha: 1, x: 0, duration: 0.35, ease: "power2.out" }, 1.25)
        .to(lineRef.current, { scaleX: 1, duration: 0.4, ease: "power2.inOut" }, 1.5)
        .to(scrollHintRef.current, { autoAlpha: 1, duration: 0.25 }, 1.75)
        .to(textLayerRef.current, { autoAlpha: 0, duration: 0.3 }, 2.3)
        .to(
          panels,
          {
            yPercent: (i) => (i === 0 ? -100 : 100),
            duration: 0.6,
            ease: "power4.inOut",
          },
          2.6
        )
        .to(rootRef.current, { autoAlpha: 0, duration: 0.35 }, 2.9);
    };

    if (reducedMotion) {
      const tl = gsap.timeline({ onComplete: finish }).set(rootRef.current, { autoAlpha: 0 }, 0.1);
      return () => {
        window.clearTimeout(safetyTimeout);
        tl.kill();
        document.body.style.overflow = "";
      };
    }

    if (!isCreators) {
      // Full ~3.4s title sequence on a visitor's first load this session;
      // returning within the same session gets a quick fade instead of
      // replaying the whole entry every time they revisit "/".
      const seenAlready = readSessionSkip(MAIN_SESSION_KEY);
      const tl = seenAlready
        ? gsap.timeline({ onComplete: finish }).set(rootRef.current, { autoAlpha: 0 }, 0.1)
        : buildTitleSequence();
      if (!seenAlready) writeSessionSkip(MAIN_SESSION_KEY);
      skipRef.current = () => {
        tl?.kill();
        finish();
      };
      return () => {
        window.clearTimeout(safetyTimeout);
        tl?.kill();
        document.body.style.overflow = "";
      };
    }

    if (readSessionSkip(CREATORS_SESSION_KEY)) {
      const tl = buildTitleSequence();
      return () => {
        window.clearTimeout(safetyTimeout);
        tl?.kill();
        document.body.style.overflow = "";
      };
    }

    // Full ~3.4s creators sequence: particles converge -> silhouettes resolve ->
    // logo locks up -> explode into stars -> reveal. Canvas2D only (no WebGL) —
    // this is the very first thing to mount and gets discarded within seconds.
    const particles = buildParticles(300);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d") ?? null;
    if (canvas && ctx) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const start = performance.now();
    const tick = () => {
      if (!ctx) return;
      const t = Math.min(1, (performance.now() - start) / CREATORS_DURATION_MS);
      renderCreatorsFrame(ctx, particles, t, window.innerWidth, window.innerHeight);
    };
    gsap.ticker.add(tick);

    gsap.set(rootRef.current?.querySelectorAll(".preloader-mark") ?? [], {
      autoAlpha: 0,
      scale: 0.9,
    });

    const counter = { value: 0 };
    const tl = gsap
      .timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          gsap.ticker.remove(tick);
          writeSessionSkip(CREATORS_SESSION_KEY);
          finish();
        },
      })
      .to(
        counter,
        {
          value: 100,
          duration: CREATORS_DURATION_MS / 1000,
          onUpdate: () => {
            if (countRef.current) {
              countRef.current.textContent = String(Math.floor(counter.value)).padStart(3, "0");
            }
            if (barRef.current) {
              barRef.current.style.transform = `scaleX(${counter.value / 100})`;
            }
          },
        },
        0
      )
      .to(
        rootRef.current?.querySelectorAll(".preloader-mark") ?? [],
        { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power3.out" },
        2.0
      )
      .to(
        rootRef.current?.querySelectorAll(".preloader-mark") ?? [],
        { yPercent: -110, duration: 0.6, ease: "power4.inOut" },
        2.9
      )
      .to(rootRef.current, { autoAlpha: 0, duration: 0.5 }, 3.0);

    return () => {
      window.clearTimeout(safetyTimeout);
      tl.kill();
      gsap.ticker.remove(tick);
      document.body.style.overflow = "";
    };
  }, [isCreators]);

  if (!isCreators) {
    return (
      <div
        ref={rootRef}
        className="fixed inset-0 z-[1000] overflow-hidden bg-black"
        style={{ pointerEvents: done ? "none" : "auto" }}
        aria-hidden={done}
      >
        <div ref={panelTopRef} className="absolute inset-x-0 top-0 h-1/2 bg-black" />
        <div ref={panelBottomRef} className="absolute inset-x-0 bottom-0 h-1/2 bg-black" />

        <div
          ref={textLayerRef}
          className="absolute inset-0 flex flex-col items-center justify-center gap-6"
        >
          <span ref={locationRef} className="eyebrow tracking-[0.4em] text-paper-dim">
            Mumbai / India
          </span>

          <div className="flex items-baseline overflow-hidden">
            {"TTFM".split("").map((char, i) => (
              <span
                key={i}
                ref={(el) => {
                  ttfmCharsRef.current[i] = el;
                }}
                className="font-headline text-[15vw] leading-none text-paper md:text-[8vw]"
              >
                {char}
              </span>
            ))}
            <span
              ref={productionRef}
              className="font-headline ml-4 text-[4vw] leading-none tracking-[0.15em] text-paper-dim md:text-[1.6vw]"
            >
              PRODUCTION
            </span>
          </div>

          <span ref={lineRef} className="h-px w-40 origin-left bg-ember" />

          <span ref={scrollHintRef} className="eyebrow tracking-[0.4em] text-paper-dim">
            Scroll
          </span>
        </div>

        <button
          type="button"
          onClick={() => skipRef.current?.()}
          className="eyebrow absolute bottom-6 right-6 text-paper-dim/50 transition-colors hover:text-paper md:bottom-12 md:right-12"
        >
          Skip
        </button>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-ink"
      style={{ pointerEvents: done ? "none" : "auto" }}
      aria-hidden={done}
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
      <div className="relative overflow-hidden">
        <div className="preloader-mark font-display text-[13vw] font-semibold leading-none tracking-tight text-paper md:text-[8vw]">
          TTFM <span className="text-ember">/ Creators</span>
        </div>
      </div>
      <div className="relative mt-8 flex w-40 flex-col items-center gap-3">
        <div className="h-px w-full overflow-hidden bg-line">
          <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-ember" />
        </div>
        <span className="eyebrow flex gap-2 tabular-nums">
          <span ref={countRef}>000</span>
          <span className="text-paper-dim">/ 100</span>
        </span>
      </div>
    </div>
  );
}
