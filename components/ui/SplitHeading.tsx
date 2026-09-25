"use client";

import { useEffect, useRef, type ElementType } from "react";
import { gsap, registerGsap, SplitText } from "@/lib/gsap";
import { useScrollVelocity } from "@/lib/scrollVelocity";
import { onPreloadReady } from "@/lib/preloadReady";
import clsx from "clsx";

interface SplitHeadingProps {
  children: string;
  as?: ElementType;
  className?: string;
  type?: "chars" | "words" | "lines";
  trigger?: "mount" | "scroll" | "preload";
  delay?: number;
  stagger?: number;
  start?: string;
  /** Subtle scroll-velocity skew — typography as a motion object. Used sparingly
   * (Hero + one or two section headlines), not on every heading. */
  skew?: boolean;
}

export default function SplitHeading({
  children,
  as: Component = "h2",
  className,
  type = "lines",
  trigger = "scroll",
  delay = 0,
  stagger = 0.04,
  start = "top 80%",
  skew = false,
}: SplitHeadingProps) {
  const ref = useRef<HTMLElement | null>(null);
  const velocityRef = useScrollVelocity();
  const skewState = useRef({ skew: 0 });
  const skewSetter = useRef<((v: number) => void) | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerGsap();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      gsap.set(el, { autoAlpha: 1 });
      return;
    }

    let split: InstanceType<typeof SplitText> | null = null;
    let ctx: gsap.Context | null = null;
    let cleanupListener: (() => void) | null = null;

    const run = () => {
      gsap.set(el, { autoAlpha: 1 });
      ctx = gsap.context(() => {
        split = SplitText.create(el, {
          type,
          mask: type,
          linesClass: "split-line",
          wordsClass: "split-word",
          charsClass: "split-char",
        });

        const targets =
          type === "chars" ? split.chars : type === "words" ? split.words : split.lines;

        gsap.set(targets, { yPercent: 110, opacity: 0 });

        const anim = {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          delay,
          stagger,
          ease: "power4.out",
        };

        if (trigger === "scroll") {
          gsap.to(targets, {
            ...anim,
            scrollTrigger: { trigger: el, start },
          });
        } else {
          gsap.to(targets, anim);
        }
      }, el);
    };

    if (trigger === "preload") {
      // onPreloadReady fires immediately if the preloader already completed
      // (e.g. this heading mounted after a client-side route change), instead
      // of waiting on a "ttfm:preloaded" DOM event that already happened once
      // and won't fire again — see lib/preloadReady.ts.
      cleanupListener = onPreloadReady(run);
    } else {
      run();
    }

    return () => {
      cleanupListener?.();
      split?.revert();
      ctx?.revert();
    };
  }, [children, type, trigger, delay, stagger, start]);

  useEffect(() => {
    const el = ref.current;
    if (!skew || !el) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    registerGsap();

    // Animate a plain state object and write the transform string manually —
    // gsap's CSSPlugin transform-composition conflicts with Tailwind v4's native
    // `rotate`/`scale`/`translate` CSS properties (see GenerativePanel.tsx).
    const applySkew = () => {
      el.style.transform = `skewX(${skewState.current.skew}deg)`;
    };

    skewSetter.current = gsap.quickTo(skewState.current, "skew", {
      duration: 0.5,
      ease: "power3.out",
      onUpdate: applySkew,
    });

    const tick = () => {
      const velocity = velocityRef?.current ?? 0;
      const target = gsap.utils.clamp(-6, 6, -velocity * 0.6);
      skewSetter.current?.(target);
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [skew, velocityRef]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag: any = Component;

  return (
    <Tag ref={ref} className={clsx("invisible", className)}>
      {children}
    </Tag>
  );
}
