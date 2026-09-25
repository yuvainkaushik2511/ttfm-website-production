"use client";

import { useEffect, useRef } from "react";

// Background video that only downloads/decodes while near the viewport.
// Many simultaneous autoplay videos were exhausting browser memory on laptops
// ("This page couldn't load"); off-screen videos are now paused.
type Props = Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "autoPlay" | "preload">;

export default function LazyVideo({ src, ...rest }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!v.getAttribute("src") && src) v.src = String(src);
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.pause();
    };
  }, [src]);

  return <video ref={ref} muted loop playsInline preload="none" {...rest} />;
}
