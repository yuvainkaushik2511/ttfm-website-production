"use client";

import { useEffect, useRef } from "react";
import { useInViewport } from "@/lib/useInViewport";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  t: number,
  width: number,
  height: number
) => void;

export default function PanelCanvas({
  draw,
  className,
}: {
  draw: DrawFn;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inView = useInViewport(wrapperRef);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let raf = 0;
    const start = performance.now();

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    const renderFrame = (time: number) => {
      draw(ctx, (time - start) / 1000, width, height);
    };

    if (reducedMotion) {
      renderFrame(start);
    } else if (inView) {
      const loop = (time: number) => {
        renderFrame(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [draw, inView, reducedMotion]);

  return (
    <div ref={wrapperRef} className={className}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
