"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { useIsTouchDevice } from "@/lib/useIsTouchDevice";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { creatorsTheme } from "@/lib/creatorsTheme";

type Rgb = [number, number, number];

function parseRgb(rgbString: string): Rgb {
  const [r, g, b] = rgbString.split(",").map((s) => parseFloat(s.trim()));
  return [r, g, b];
}

function lerpRgbString(a: Rgb, b: Rgb, t: number) {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

const SPECTRUM_STOPS = creatorsTheme.spectrumRgbList.map(parseRgb);
const CYCLE_MS = 6000;

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();
  const reducedMotion = useReducedMotion();
  const active = !isTouch && !reducedMotion;
  const pathname = usePathname();
  // Captured once at mount like Preloader/Navbar/Footer's route branches — this
  // component doesn't remount on client-side navigation either.
  const [isCreators] = useState(() => pathname?.startsWith("/creators") ?? false);

  useEffect(() => {
    if (!active) {
      document.documentElement.classList.remove("has-custom-cursor");
      return;
    }
    document.documentElement.classList.add("has-custom-cursor");

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    const moveDot = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3.out" });
    const moveDotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3.out" });
    const moveLabel = gsap.quickTo(label, "x", { duration: 0.45, ease: "power3.out" });
    const moveLabelY = gsap.quickTo(label, "y", { duration: 0.45, ease: "power3.out" });

    // The ring composes position + hover-scale + a velocity-direction stretch all
    // into one manually-written transform string (not separate gsap tweens on the
    // element) — mixing gsap's own transform composition with a manual write on
    // the same element is what caused the "not eligible for reset" bug found on
    // GenerativePanel's tilt; this keeps a single source of truth instead.
    const ringState = { x: 0, y: 0, scale: 1 };
    const stretchState = { angle: 0, stretch: 1, squash: 1 };
    const velocity = { vx: 0, vy: 0 };
    const lastPointer = { x: 0, y: 0, t: performance.now(), primed: false };

    const applyRingTransform = () => {
      ring.style.transform =
        `translate(-50%, -50%) translate(${ringState.x}px, ${ringState.y}px) ` +
        `rotate(${stretchState.angle}deg) ` +
        `scale(${ringState.scale * stretchState.stretch}, ${ringState.scale * stretchState.squash}) ` +
        `rotate(${-stretchState.angle}deg)`;
    };

    const moveRingX = gsap.quickTo(ringState, "x", {
      duration: 0.45,
      ease: "power3.out",
      onUpdate: applyRingTransform,
    });
    const moveRingY = gsap.quickTo(ringState, "y", {
      duration: 0.45,
      ease: "power3.out",
      onUpdate: applyRingTransform,
    });
    const ringScale = gsap.quickTo(ringState, "scale", {
      duration: 0.35,
      ease: "power3.out",
      onUpdate: applyRingTransform,
    });

    const onMove = (e: MouseEvent) => {
      moveDot(e.clientX);
      moveDotY(e.clientY);
      moveRingX(e.clientX);
      moveRingY(e.clientY);
      moveLabel(e.clientX);
      moveLabelY(e.clientY);

      const now = performance.now();
      if (lastPointer.primed) {
        const dt = Math.max(1, now - lastPointer.t);
        velocity.vx = ((e.clientX - lastPointer.x) / dt) * 16;
        velocity.vy = ((e.clientY - lastPointer.y) / dt) * 16;
      }
      lastPointer.x = e.clientX;
      lastPointer.y = e.clientY;
      lastPointer.t = now;
      lastPointer.primed = true;
    };

    const tick = () => {
      velocity.vx *= 0.82;
      velocity.vy *= 0.82;
      const speed = Math.hypot(velocity.vx, velocity.vy);
      if (speed > 0.05) {
        stretchState.angle = Math.atan2(velocity.vy, velocity.vx) * (180 / Math.PI);
      }
      stretchState.stretch = 1 + Math.min(speed * 0.015, 0.45);
      stretchState.squash = 1 - Math.min(speed * 0.008, 0.22);
      applyRingTransform();

      // Creators route only: cycle the dot/ring through the vivid spectrum
      // instead of a static color — "kuch creative" cursor treatment, separate
      // from the corporate site's plain paper/ember cursor.
      if (isCreators) {
        const now = performance.now();
        const cycleT = (now % CYCLE_MS) / CYCLE_MS;
        const segment = cycleT * SPECTRUM_STOPS.length;
        const idx = Math.floor(segment) % SPECTRUM_STOPS.length;
        const nextIdx = (idx + 1) % SPECTRUM_STOPS.length;
        const localT = segment - Math.floor(segment);
        const color = lerpRgbString(SPECTRUM_STOPS[idx], SPECTRUM_STOPS[nextIdx], localT);
        dot.style.backgroundColor = color;
        ring.style.borderColor = color;
        ring.style.boxShadow = `0 0 18px 2px ${color}`;
      }
    };
    gsap.ticker.add(tick);

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.("[data-cursor]") as HTMLElement | null;
      if (!target) return;
      const labelText = target.dataset.cursorLabel;

      if (labelText) {
        label.textContent = labelText;
        gsap.to(label, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power3.out" });
        gsap.to(ring, { autoAlpha: 0, duration: 0.2 });
        gsap.to(dot, { autoAlpha: 0, duration: 0.2 });
      } else {
        ringScale(2.2);
        gsap.to(ring, { opacity: 0.5, duration: 0.35, ease: "power3.out" });
        gsap.to(dot, { scale: 0, duration: 0.25 });
      }
    };

    const onOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.("[data-cursor]");
      if (!target) return;
      gsap.to(label, { autoAlpha: 0, scale: 0.85, duration: 0.25, ease: "power3.out" });
      ringScale(1);
      gsap.to(ring, { opacity: 1, autoAlpha: 1, duration: 0.35, ease: "power3.out" });
      gsap.to(dot, { scale: 1, autoAlpha: 1, duration: 0.25 });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      gsap.ticker.remove(tick);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [active, isCreators]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] hidden md:block" aria-hidden>
      <div
        ref={ringRef}
        className={
          isCreators
            ? "fixed left-0 top-0 h-9 w-9 rounded-full border-2"
            : "fixed left-0 top-0 h-8 w-8 rounded-full border border-paper/60"
        }
      />
      <div
        ref={dotRef}
        className={
          isCreators
            ? "fixed left-0 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            : "fixed left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember"
        }
      />
      <div
        ref={labelRef}
        className="fixed left-0 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 scale-[0.85] items-center justify-center rounded-full bg-paper text-[0.65rem] font-medium uppercase tracking-wider text-ink opacity-0"
      />
    </div>
  );
}
