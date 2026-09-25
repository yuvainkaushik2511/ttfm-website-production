"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createRng } from "@/lib/rng";
import { creatorsTheme } from "@/lib/creatorsTheme";
import { ambientIntensity } from "@/lib/ambientIntensity";

const ACCENT = new THREE.Color(creatorsTheme.accent);
const PAPER = new THREE.Color("#f3f1ea");

// The ONE always-mounted Canvas for the whole /creators route (see plan's WebGL
// context-budget risk) — every other scene on the page mounts/unmounts on
// useInViewport. Wide, sparse, slow-drifting depth fog rather than anything with
// a silhouette, so it reads as ambience behind whatever section is in view
// instead of competing with it.
function DepthField({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const [positions, colors, seeds] = useMemo(() => {
    const rng = createRng(0x414d4249);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rng() - 0.5) * 14;
      positions[i * 3 + 1] = (rng() - 0.5) * 9;
      positions[i * 3 + 2] = (rng() - 0.5) * 12 - 4;

      const c = PAPER.clone().lerp(ACCENT, rng() > 0.75 ? 1 : 0);
      c.multiplyScalar(0.3 + rng() * 0.35);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      seeds[i] = rng() * Math.PI * 2;
    }
    return [positions, colors, seeds];
  }, [count]);

  const basePositions = useMemo(() => positions.slice(), [positions]);

  useFrame((state) => {
    if (!pointsRef.current || !materialRef.current || !groupRef.current) return;
    const t = state.clock.elapsedTime;
    const intensity = ambientIntensity.current;

    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.current.x * 0.06,
      0.02
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      pointer.current.y * 0.03,
      0.02
    );

    materialRef.current.opacity = 0.55 * intensity;
    materialRef.current.size = 0.03 * Math.min(1.6, intensity);

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const seed = seeds[i];
      posAttr.array[i * 3 + 1] = basePositions[i * 3 + 1] + Math.sin(t * 0.06 + seed) * 0.3;
      posAttr.array[i * 3] = basePositions[i * 3] + Math.cos(t * 0.05 + seed) * 0.2;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={materialRef}
          size={0.03}
          vertexColors
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function CreatorsAmbientScene({ mobile = false }: { mobile?: boolean }) {
  const count = mobile ? 180 : 480;

  return (
    <Canvas
      dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)]}
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <DepthField count={count} />
    </Canvas>
  );
}
