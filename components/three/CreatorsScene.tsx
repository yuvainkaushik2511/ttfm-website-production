"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { createRng } from "@/lib/rng";
import { verticalPalette } from "@/lib/verticalPalette";
import { silhouetteWidth } from "@/lib/creatorSilhouette";

// Muted at this point of use (not in the shared lib/verticalPalette.ts module,
// which also drives /creators' own accent system) for the homepage Work
// chapter's monochrome-editorial direction.
const ACCENT = new THREE.Color(verticalPalette.casting).lerp(new THREE.Color("#8a8a86"), 0.5);
const PAPER = new THREE.Color("#f3f1ea");

function BustParticles({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const { viewport } = useThree();

  const [positions, seeds] = useMemo(() => {
    const rng = createRng(0x43524554 ^ count);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 2);

    for (let i = 0; i < count; i++) {
      const y = rng() * 2 - 1;
      const w = silhouetteWidth(y);
      const edgeBias = 0.65 + rng() * 0.35;
      const side = rng() > 0.5 ? 1 : -1;
      const x = side * w * edgeBias;
      const z = (rng() - 0.5) * 0.22;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y * 0.85;
      positions[i * 3 + 2] = z;

      seeds[i * 2] = rng() * Math.PI * 2;
      seeds[i * 2 + 1] = 0.5 + rng() * 0.5;
    }
    return [positions, seeds];
  }, [count]);

  const basePositions = useMemo(() => positions.slice(), [positions]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame((state) => {
    if (!pointsRef.current || !materialRef.current) return;
    const t = state.clock.elapsedTime;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colorAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute;

    const pointerX = state.pointer.x * 0.9;
    const pointerY = state.pointer.y * 0.9;

    for (let i = 0; i < count; i++) {
      const seedPhase = seeds[i * 2];
      const seedAmp = seeds[i * 2 + 1];
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];

      const drift = Math.sin(t * 0.3 + seedPhase) * 0.02 * seedAmp;
      let x = bx + drift;
      let y = by + Math.cos(t * 0.25 + seedPhase) * 0.015 * seedAmp;
      const z = bz;

      const dx = x - pointerX;
      const dy = y - pointerY;
      const dist = Math.hypot(dx, dy);
      const influence = Math.max(0, 1 - dist / 0.4);
      if (influence > 0) {
        const push = influence * 0.12;
        x += (dx / (dist || 1)) * push;
        y += (dy / (dist || 1)) * push;
      }

      posAttr.array[i * 3] = x;
      posAttr.array[i * 3 + 1] = y;
      posAttr.array[i * 3 + 2] = z;

      const glow = 0.5 + influence * 0.5 + Math.sin(t * 1.6 + seedPhase) * 0.08;
      const c = ACCENT.clone().lerp(PAPER, Math.min(1, influence * 1.4));
      colorAttr.array[i * 3] = c.r * glow;
      colorAttr.array[i * 3 + 1] = c.g * glow;
      colorAttr.array[i * 3 + 2] = c.b * glow;
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} scale={Math.min(viewport.height / 1.9, 1.6)}>
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

export default function CreatorsScene() {
  const count = 420;

  return (
    <Canvas
      dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)]}
      camera={{ position: [0, 0, 2.6], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <BustParticles count={count} />
    </Canvas>
  );
}
