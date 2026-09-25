// Pure width(y) profile for a procedural bust silhouette (head -> neck ->
// shoulders), shared between components/three/CreatorsScene.tsx's WebGL points
// and the creators-route preloader's canvas2D particles — no portrait asset, just
// math, sampled edge-biased so points cluster toward the outline. Framework-free
// (no three.js import) so the preloader's first-paint bundle stays light.
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function silhouetteWidth(y: number) {
  if (y > 0.56) {
    const d = (y - 0.78) / 0.22;
    return 0.24 * Math.sqrt(Math.max(0, 1 - d * d));
  }
  if (y > 0.34) {
    const t = (y - 0.34) / (0.56 - 0.34);
    return lerp(0.14, 0.1, t);
  }
  const t = (0.34 - y) / (0.34 + 1);
  return lerp(0.14, 0.62, Math.min(1, t * 1.15));
}
