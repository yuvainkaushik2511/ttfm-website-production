// Color identity for the /creators route. Two layers:
//  1. `accent`/`accentBright` — the primary brand accent, seeded from
//     verticalPalette.casting (same hue family as the homepage's Work-section
//     card) but pushed much more saturated/vivid — user feedback was that the
//     original subtle amber felt too corporate-dark for a creator-agency site.
//  2. `spectrum` — a genuinely multi-hue palette (violet/cyan/rose/green/blue,
//     plus the brand gold) used for per-section glows, gradients and the
//     interactive 3D toy elements, so the page reads as colorful/energetic
//     rather than one-accent-on-black.
import { verticalPalette, hexToRgb, rgbToHsl, hslToHex, clamp } from "@/lib/verticalPalette";

const base = hexToRgb(verticalPalette.casting);
const baseHsl = rgbToHsl(base.r, base.g, base.b);

const accentHsl = {
  h: baseHsl.h,
  s: clamp(baseHsl.s + 0.28, 0, 1),
  l: clamp(baseHsl.l + 0.1, 0, 1),
};

const accent = hslToHex(accentHsl.h, accentHsl.s, accentHsl.l);
const accentBright = hslToHex(accentHsl.h, accentHsl.s, clamp(accentHsl.l + 0.18, 0, 1));

function hexToRgbString(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`;
}

const spectrum = {
  gold: accent,
  violet: "#a78bfa",
  cyan: "#22d3ee",
  rose: "#fb7185",
  green: "#34d399",
  blue: "#60a5fa",
} as const;

type SpectrumKey = keyof typeof spectrum;

const spectrumRgb = Object.fromEntries(
  Object.entries(spectrum).map(([key, hex]) => [key, hexToRgbString(hex)])
) as Record<SpectrumKey, string>;

const spectrumList = Object.values(spectrum);
const spectrumRgbList = Object.values(spectrumRgb);

export const creatorsTheme = {
  /** CSS hex — feed into a THREE.Color or a CSS custom property. */
  accent,
  accentBright,
  /** "r, g, b" 0-255 string, matching panelVisuals.ts's EMBER-constant style for use in rgba(). */
  accentRgb: hexToRgbString(accent),
  accentBrightRgb: hexToRgbString(accentBright),
  /** Named vivid hues for section-level color variety. */
  spectrum,
  spectrumRgb,
  /** Same six hues as plain arrays, index-aligned, for cycling/hashing into. */
  spectrumList,
  spectrumRgbList,
};
