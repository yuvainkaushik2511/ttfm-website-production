"use client";

import { useSyncExternalStore } from "react";

type Tier = "low" | "high";

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number;
}

let cached: Tier | null = null;

function computeTier(): Tier {
  if (cached) return cached;
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return "high";
  }
  const nav = navigator as NavigatorWithHints;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;

  cached = coarsePointer || cores <= 4 || memory <= 4 ? "low" : "high";
  return cached;
}

function subscribe() {
  // Device capability doesn't change mid-session — no-op subscription.
  return () => {};
}

export function useDeviceTier(): Tier {
  return useSyncExternalStore(subscribe, computeTier, () => "high");
}
