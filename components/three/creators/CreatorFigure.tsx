"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createRng } from "@/lib/rng";
import { silhouetteWidth } from "@/lib/creatorSilhouette";

const PAPER = new THREE.Color("#f3f1ea");

interface CreatorFigureProps {
  /** Drives the deterministic point layout — a different seed reads as a
   * different figure. */
  seed: number;
  accent: string;
  count?: number;
  /** 0..1 external hover intensity (lerped by the parent), boosts glow/spread. */
  hoverRef?: React.MutableRefObject<number>;
}

// Parameterized extraction of CreatorsScene.tsx's BustParticles — same math
// (silhouetteWidth profile, edge-biased sampling), generalized to accept a seed/
// accent/count so multiple distinct figures can be placed in the Infinite Creator
// Universe. CreatorsScene.tsx itself is left untouched; it's still on the
// homepage's Work panel critical path.
export default function CreatorFigure({
  seed,
  accent,
  count = 200,
  hoverRef,
}: CreatorFigureProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const accentColor = useMemo(() => new THREE.Color(accent), [accent]);

  const [positions, seeds] = useMemo(() => {
    const rng = createRng(seed);
    const positions = new Float32Array(count * 3);
    const seedsArr = new Float32Array(count * 2);

    for (let i = 0; i < count; i++) {
      const y = rng() * 2 - 1;
      const w = silhouetteWidth(y);
      const edgeBias = 0.65 + rng() * 0.35;
      const side = rng() > 0.5 ? 1 : -1;
      const x = side * w * edgeBias;
      const z = (rng() - 0.5) * 0.18;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y * 0.85;
      positions[i * 3 + 2] = z;

      seedsArr[i * 2] = rng() * Math.PI * 2;
      seedsArr[i * 2 + 1] = 0.5 + rng() * 0.5;
    }
    return [positions, seedsArr];
  }, [seed, count]);

  const basePositions = useMemo(() => positions.slice(), [positions]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame((state) => {
    if (!pointsRef.current || !materialRef.current) return;
    const t = state.clock.elapsedTime;
    const hover = hoverRef?.current ?? 0;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colorAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      const seedPhase = seeds[i * 2];
      const seedAmp = seeds[i * 2 + 1];
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];

      const drift = Math.sin(t * 0.3 + seedPhase) * 0.02 * seedAmp;
      const x = bx + drift + hover * Math.sin(seedPhase) * 0.03;
      const y = by + Math.cos(t * 0.25 + seedPhase) * 0.015 * seedAmp;

      posAttr.array[i * 3] = x;
      posAttr.array[i * 3 + 1] = y;
      posAttr.array[i * 3 + 2] = bz;

      const glow = 0.55 + hover * 0.45 + Math.sin(t * 1.6 + seedPhase) * 0.08;
      const c = accentColor.clone().lerp(PAPER, Math.min(1, hover * 0.75));
      colorAttr.array[i * 3] = c.r * glow;
      colorAttr.array[i * 3 + 1] = c.g * glow;
      colorAttr.array[i * 3 + 2] = c.b * glow;
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    materialRef.current.size = 0.028 * (1 + hover * 0.4);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.028}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
