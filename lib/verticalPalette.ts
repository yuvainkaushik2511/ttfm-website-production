// Shared per-vertical color identity — a subtle hue/lightness variance within the
// ember brand family, computed once from the base ember token so the Ecosystem
// WebGL graph, the Work-section panels and the Creators/Productions WebGL scenes
// all agree on "TTFM AI is this exact color" instead of drifting independently.
import { verticals } from "@/data/verticals";

const EMBER_HEX = "#7a1f2a";

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

export function rgbToHsl(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: h / 360, s, l };
}

function hueToRgb(p: number, q: number, t: number) {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

export function hslToHex(h: number, s: number, l: number) {
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }
  const toHex = (v: number) =>
    Math.round(clamp(v, 0, 1) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const emberRgb = hexToRgb(EMBER_HEX);
const emberHsl = rgbToHsl(emberRgb.r, emberRgb.g, emberRgb.b);

const order = verticals.map((v) => v.slug);

function shadeFor(index: number, total: number) {
  const hueShift = (index / total - 0.5) * 0.05;
  const lightShift = ((index % 3) - 1) * 0.035;
  return hslToHex(
    (emberHsl.h + hueShift + 1) % 1,
    clamp(emberHsl.s + 0.04, 0, 1),
    clamp(emberHsl.l + lightShift, 0, 1)
  );
}

/** Hex color per vertical slug (e.g. "ai" -> "#c9945f"). */
export const verticalPalette: Record<string, string> = Object.fromEntries(
  order.map((slug, i) => [slug, shadeFor(i, order.length)])
);

/** Same colors, index-aligned with `data/verticals.ts` order. */
export const verticalPaletteList: string[] = order.map((slug) => verticalPalette[slug]);

/**
 * Very dark, low-saturation tint per vertical — same hue identity as
 * `verticalPalette` but pulled down to near-black so it reads as "premium dark
 * with a hint of identity" (a Work-panel background) rather than a bright
 * fromanother.love-style color block, which would contradict the brief's
 * dark/premium direction.
 */
export const verticalPanelTint: Record<string, string> = Object.fromEntries(
  order.map((slug, i) => {
    const hueShift = (i / order.length - 0.5) * 0.05;
    const h = (emberHsl.h + hueShift + 1) % 1;
    return [slug, hslToHex(h, 0.34, 0.065)];
  })
);
