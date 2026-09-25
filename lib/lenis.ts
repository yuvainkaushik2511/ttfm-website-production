"use client";

import { createContext, useContext, type MutableRefObject } from "react";
import type Lenis from "lenis";

export type LenisRef = MutableRefObject<Lenis | null>;

export const LenisContext = createContext<LenisRef | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}
