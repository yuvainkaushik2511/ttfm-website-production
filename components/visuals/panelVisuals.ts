import { createRng } from "@/lib/rng";
import type { DrawFn } from "./PanelCanvas";

// Blended toward STEEL — a whisper of the brand's crimson accent rather than
// the full-saturation color, matching the homepage's monochrome-editorial
// direction (see app/globals.css's --ember tokens).
const EMBER = "132, 92, 92";
const EMBER_BRIGHT = "158, 100, 100";
const PAPER = "243, 241, 234";
const STEEL = "138, 138, 134";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function quadPoint(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  t: number
): [number, number] {
  const x = lerp(lerp(p0[0], p1[0], t), lerp(p1[0], p2[0], t), t);
  const y = lerp(lerp(p0[1], p1[1], t), lerp(p1[1], p2[1], t), t);
  return [x, y];
}

// ---------------------------------------------------------------------------
// Studio & Creator Space — sparse constellation, drifting nodes with proximity
// connections; reads as a network of connected production infrastructure.
const aiRng = createRng(0x41494c41);
const aiPoints = Array.from({ length: 26 }, () => ({
  x: aiRng(),
  y: aiRng(),
  phase: aiRng() * Math.PI * 2,
  pulsePhase: aiRng() * Math.PI * 2,
}));

export const drawAI: DrawFn = (ctx, t, w, h) => {
  ctx.clearRect(0, 0, w, h);
  const positioned = aiPoints.map((p) => ({
    x: (p.x + Math.sin(t * 0.12 + p.phase) * 0.02) * w,
    y: (p.y + Math.cos(t * 0.1 + p.phase) * 0.02) * h,
    pulse: 0.5 + Math.sin(t * 1.4 + p.pulsePhase) * 0.5,
  }));

  const threshold = Math.min(w, h) * 0.22;
  ctx.lineWidth = 1;
  for (let i = 0; i < positioned.length; i++) {
    for (let j = i + 1; j < positioned.length; j++) {
      const a = positioned[i];
      const b = positioned[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < threshold) {
        const alpha = (1 - d / threshold) * 0.22;
        ctx.strokeStyle = `rgba(${STEEL}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for (const p of positioned) {
    const r = 1.4 + p.pulse * 1.8;
    ctx.beginPath();
    ctx.fillStyle = `rgba(${EMBER}, ${0.4 + p.pulse * 0.5})`;
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
};

// ---------------------------------------------------------------------------
// Post-Production — flowing dashed signal paths with a traveling pulse; reads
// as a timeline being scrubbed through, edit and color passes in motion.
const autoRng = createRng(0x4155544f);
const autoPaths = Array.from({ length: 4 }, (_, i) => ({
  y: 0.2 + (i / 3) * 0.6 + (autoRng() - 0.5) * 0.06,
  bow: (autoRng() - 0.5) * 0.18,
  speed: 0.6 + autoRng() * 0.4,
  offset: autoRng(),
}));

export const drawAutomation: DrawFn = (ctx, t, w, h) => {
  ctx.clearRect(0, 0, w, h);

  for (const path of autoPaths) {
    const p0: [number, number] = [-0.05 * w, path.y * h];
    const p1: [number, number] = [0.5 * w, (path.y + path.bow) * h];
    const p2: [number, number] = [1.05 * w, path.y * h];

    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]);
    ctx.strokeStyle = `rgba(${STEEL}, 0.22)`;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 6]);
    ctx.lineDashOffset = -t * 24 * path.speed;
    ctx.stroke();
    ctx.setLineDash([]);

    const pulseT = (t * 0.18 * path.speed + path.offset) % 1;
    const [px, py] = quadPoint(p0, p1, p2, pulseT);
    const glow = ctx.createRadialGradient(px, py, 0, px, py, 10);
    glow.addColorStop(0, `rgba(${EMBER_BRIGHT}, 0.9)`);
    glow.addColorStop(1, `rgba(${EMBER_BRIGHT}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fill();
  }
};

// ---------------------------------------------------------------------------
// Casting & Talent — drifting rim-light silhouette + floating content
// fragments; reads as a talent profile under studio light.
const creatorsRng = createRng(0x43524554);
const creatorFragments = Array.from({ length: 6 }, () => ({
  x: creatorsRng(),
  y: creatorsRng(),
  w: 0.1 + creatorsRng() * 0.14,
  h: 0.05 + creatorsRng() * 0.07,
  speed: 0.3 + creatorsRng() * 0.4,
  phase: creatorsRng() * Math.PI * 2,
}));

export const drawCreators: DrawFn = (ctx, t, w, h) => {
  ctx.clearRect(0, 0, w, h);

  const cx = w * (0.62 + Math.sin(t * 0.15) * 0.06);
  const cy = h * (0.48 + Math.cos(t * 0.12) * 0.05);
  const radius = Math.min(w, h) * 0.42;
  const glow = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
  glow.addColorStop(0, `rgba(${EMBER_BRIGHT}, 0.28)`);
  glow.addColorStop(1, `rgba(${EMBER_BRIGHT}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  for (const f of creatorFragments) {
    const x = (f.x + Math.sin(t * 0.1 * f.speed + f.phase) * 0.03) * w;
    const y = (f.y + Math.cos(t * 0.08 * f.speed + f.phase) * 0.03) * h;
    const alpha = 0.14 + (Math.sin(t * 0.4 + f.phase) * 0.5 + 0.5) * 0.1;
    ctx.strokeStyle = `rgba(${PAPER}, ${alpha})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, f.w * w, f.h * h);
  }
};

// ---------------------------------------------------------------------------
// Photography — breathing spotlight behind a thin aperture/iris ring.
export const drawStudios: DrawFn = (ctx, t, w, h) => {
  ctx.clearRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.46;
  const breathe = 0.85 + Math.sin(t * 0.5) * 0.15;
  const radius = Math.min(w, h) * 0.5 * breathe;

  const spot = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  spot.addColorStop(0, `rgba(${EMBER_BRIGHT}, 0.3)`);
  spot.addColorStop(0.6, `rgba(${EMBER}, 0.08)`);
  spot.addColorStop(1, `rgba(${EMBER}, 0)`);
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, w, h);

  const ringBase = Math.min(w, h) * 0.3;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${PAPER}, ${0.16 - i * 0.04})`;
    ctx.lineWidth = 1;
    ctx.arc(cx, cy, ringBase + i * 14, 0, Math.PI * 2);
    ctx.stroke();
  }

  const blades = 8;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 0.15);
  for (let i = 0; i < blades; i++) {
    const angle = (i / blades) * Math.PI * 2;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${EMBER_BRIGHT}, 0.35)`;
    ctx.lineWidth = 1.5;
    ctx.moveTo(Math.cos(angle) * ringBase, Math.sin(angle) * ringBase);
    ctx.lineTo(Math.cos(angle) * (ringBase + 10), Math.sin(angle) * (ringBase + 10));
    ctx.stroke();
  }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// Film Production — redrawn film grain, letterbox bars, diagonal light-leak.
export const drawProductions: DrawFn = (ctx, t, w, h) => {
  ctx.clearRect(0, 0, w, h);

  const sweep = ((t * 0.06) % 1.6) - 0.3;
  const leak = ctx.createLinearGradient(
    w * (sweep - 0.3),
    0,
    w * (sweep + 0.3),
    h
  );
  leak.addColorStop(0, `rgba(${EMBER_BRIGHT}, 0)`);
  leak.addColorStop(0.5, `rgba(${EMBER_BRIGHT}, 0.16)`);
  leak.addColorStop(1, `rgba(${EMBER_BRIGHT}, 0)`);
  ctx.fillStyle = leak;
  ctx.fillRect(0, 0, w, h);

  const grainCount = Math.floor((w * h) / 1800);
  for (let i = 0; i < grainCount; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const alpha = Math.random() * 0.06;
    ctx.fillStyle = `rgba(${PAPER}, ${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }

  const barHeight = h * 0.12;
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, 0, w, barHeight);
  ctx.fillRect(0, h - barHeight, w, barHeight);
};

// ---------------------------------------------------------------------------
// Advertising Films — drifting campaign-signal fragments over thin network
// lines; reads as a brand message reaching an audience.
const MEDIA_WORDS = ["SIGNAL", "REACH", "STORY", "PRESS", "VOICE", "PULSE"];
const mediaRng = createRng(0x4d454449);
const mediaWords = MEDIA_WORDS.map((word, i) => ({
  word,
  x: mediaRng(),
  y: 0.15 + (i / MEDIA_WORDS.length) * 0.75,
  speed: 0.015 + mediaRng() * 0.015,
  size: 11 + mediaRng() * 5,
}));

export const drawMedia: DrawFn = (ctx, t, w, h) => {
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = `rgba(${STEEL}, 0.16)`;
  ctx.lineWidth = 1;
  for (let i = 0; i < mediaWords.length - 1; i++) {
    const a = mediaWords[i];
    const b = mediaWords[i + 1];
    ctx.beginPath();
    ctx.moveTo(a.x * w, a.y * h);
    ctx.lineTo(b.x * w, b.y * h);
    ctx.stroke();
  }

  ctx.textBaseline = "middle";
  for (const m of mediaWords) {
    const x = ((m.x + t * m.speed) % 1.3) * w - 0.15 * w;
    ctx.font = `600 ${m.size}px system-ui, sans-serif`;
    ctx.fillStyle = `rgba(${PAPER}, 0.14)`;
    ctx.fillText(m.word, x, m.y * h);
  }
};

// ---------------------------------------------------------------------------
// Music Videos — a pulsing audio-spectrum bar equalizer.
const musicRng = createRng(0x4d555349);
const musicBars = Array.from({ length: 22 }, () => ({
  base: 0.15 + musicRng() * 0.2,
  amp: 0.2 + musicRng() * 0.5,
  speed: 0.6 + musicRng() * 1.2,
  phase: musicRng() * Math.PI * 2,
}));

export const drawMusicVideos: DrawFn = (ctx, t, w, h) => {
  ctx.clearRect(0, 0, w, h);

  const gap = w / musicBars.length;
  const barWidth = gap * 0.5;
  musicBars.forEach((bar, i) => {
    const level = bar.base + Math.abs(Math.sin(t * bar.speed + bar.phase)) * bar.amp;
    const barHeight = Math.min(1, level) * h * 0.7;
    const x = i * gap + (gap - barWidth) / 2;
    ctx.fillStyle = `rgba(${EMBER_BRIGHT}, ${0.35 + level * 0.3})`;
    ctx.fillRect(x, h - barHeight, barWidth, barHeight);
  });
};

export const panelVisuals: Record<string, DrawFn> = {
  film: drawProductions,
  "music-videos": drawMusicVideos,
  advertising: drawMedia,
  casting: drawCreators,
  photography: drawStudios,
  post: drawAutomation,
  studio: drawAI,
};
