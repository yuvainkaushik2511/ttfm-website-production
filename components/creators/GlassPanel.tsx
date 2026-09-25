import clsx from "clsx";
import type { ReactNode } from "react";

// The glass-surface language already used ad hoc by GenerativePanel/Ecosystem's
// mobile cards (border-line + bg-ink-raised/40 + rounded-[2rem]), pulled out into
// one primitive since the creators route reuses it repeatedly (brand popups,
// application form fieldsets, story cards).
export default function GlassPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-[2rem] border border-line bg-ink-raised/40 backdrop-blur-md",
        className
      )}
    >
      {children}
    </div>
  );
}
