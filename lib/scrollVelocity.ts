"use client";

import { createContext, useContext, type MutableRefObject } from "react";

export type VelocityRef = MutableRefObject<number>;

export const ScrollVelocityContext = createContext<VelocityRef | null>(null);

export function useScrollVelocity() {
  return useContext(ScrollVelocityContext);
}
