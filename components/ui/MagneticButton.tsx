"use client";

import { useRef, type ReactNode, type ElementType } from "react";
import { gsap } from "@/lib/gsap";
import { useIsTouchDevice } from "@/lib/useIsTouchDevice";
import clsx from "clsx";

interface MagneticButtonProps {
  children: ReactNode;
  as?: ElementType;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  strength?: number;
  onClick?: () => void;
  /** Contextual cursor-bubble text (CustomCursor's data-cursor-label) — e.g.
   * "Start" for the contact CTA, per TTFM's cursor language. */
  cursorLabel?: string;
}

export default function MagneticButton({
  children,
  as: Component = "button",
  href,
  target,
  rel,
  className,
  strength = 0.4,
  onClick,
  cursorLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null);
  const isTouch = useIsTouchDevice();

  const handleMove = (e: React.MouseEvent) => {
    if (isTouch || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    gsap.to(ref.current, {
      x: relX * strength,
      y: relY * strength,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  const handleLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag: any = Component;

  return (
    <Tag
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      data-cursor="link"
      data-cursor-label={cursorLabel}
      className={clsx("inline-flex items-center justify-center will-change-transform", className)}
    >
      {children}
    </Tag>
  );
}
