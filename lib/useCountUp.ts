"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface UseCountUpOptions {
  target: number;
  duration?: number;
  formatter?: (value: number) => string;
  start?: string;
  onComplete?: () => void;
}

/** Count-up bound to a one-shot ScrollTrigger (fires once, on first entry — not
 * scrubbed). Attach the returned ref to the element whose textContent should count. */
export function useCountUp<T extends HTMLElement = HTMLElement>({
  target,
  duration = 1.6,
  formatter,
  start = "top 85%",
  onComplete,
}: UseCountUpOptions) {
  const ref = useRef<T | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerGsap();

    // The element's JSX default already renders the final formatted value
    // (SSR-safe, crawlable, never blank/zero for no-JS visitors or before
    // hydration) — only rewind to 0 here, right before animating up, so
    // JS-enabled visitors still see the count-up.
    if (reducedMotion) return;

    const format = formatter ?? ((v: number) => String(Math.round(v)));
    el.textContent = format(0);
    const counter = { value: 0 };
    const st = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          value: target,
          duration,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = format(counter.value);
          },
          onComplete,
        });
      },
    });

    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, start, reducedMotion]);

  return ref;
}
