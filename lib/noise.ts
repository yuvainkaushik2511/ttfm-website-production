// Shared fractal-noise data URI — a cheap, license-free grain texture usable as a
// CSS background-image anywhere a subtle overlay is needed (GenerativePanel's card
// grain, the creators route's always-alive ambient background).
export const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
  );
