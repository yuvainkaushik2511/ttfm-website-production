"use client";

import { useCountUp } from "@/lib/useCountUp";
import clsx from "clsx";

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  className?: string;
  formatter?: (value: number) => string;
}

export default function StatCounter({
  value,
  suffix = "",
  prefix = "",
  label,
  className,
  formatter,
}: StatCounterProps) {
  const format =
    formatter ?? ((v: number) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);
  const ref = useCountUp<HTMLSpanElement>({ target: value, formatter: format });

  return (
    <div className={clsx("flex flex-col items-center text-center", className)}>
      <span
        ref={ref}
        className="font-display text-[14vw] font-semibold leading-none tabular-nums text-paper sm:text-[8vw] md:text-[5vw]"
      >
        {format(value)}
      </span>
      <span className="eyebrow mt-4 text-steel">{label}</span>
    </div>
  );
}
