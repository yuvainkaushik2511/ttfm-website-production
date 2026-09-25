"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const EMBER = new THREE.Color("#c8935b");
const PAPER = new THREE.Color("#f3f1ea");

// Deterministic PRNG (mulberry32) so particle layout generation stays a pure
// function of `count` instead of calling the impure Math.random during render.
function createRng(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ParticleField({
  count,
  exitProgress,
}: {
  count: number;
  exitProgress: React.MutableRefObject<number>;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { viewport, camera } = useThree();
  const BASE_CAMERA_Z = 6.2;

  const [positions, colors, seeds] = useMemo(() => {
    const rng = createRng(0x9e3779b9 ^ count);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 3.2 + rng() * 2.6;
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(rng() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.55;
      positions[i * 3 + 2] = radius * Math.cos(phi) * 0.6;

      // Muted toward a whisper of warmth (0.4 instead of full saturation) for
      // the homepage's monochrome-editorial direction — see Chapter.tsx.
      const mixAmt = rng();
      const c = PAPER.clone().lerp(EMBER, mixAmt > 0.72 ? 0.4 : 0);
      c.multiplyScalar(0.5 + rng() * 0.5);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      seeds[i] = rng() * Math.PI * 2;
    }
    return [positions, colors, seeds];
  }, [count]);

  // Mutating the R3F camera every frame (below) is the standard three.js pattern
  // for moving it — there's no alternative API — but the lint rule flags it.
  // eslint-disable-next-line react-hooks/immutability
  useFrame((state, delta) => {
    if (!pointsRef.current || !groupRef.current || !materialRef.current) return;
    const t = state.clock.elapsedTime;
    const exit = exitProgress.current;

    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;

    groupRef.current.rotation.y += delta * 0.035 * (1 + exit * 5);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      pointer.current.y * 0.15,
      0.03
    );
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      pointer.current.x * 0.25,
      0.03
    );

    const baseScale = Math.min(viewport.width / 8, 1.15);
    groupRef.current.scale.setScalar(baseScale * (1 + exit * 1.8));
    materialRef.current.opacity = 0.85 * (1 - exit);

    // Continuous subtle camera drift, independent of scroll/exit — the opening
    // moment already feels camera-driven rather than static, from frame one.
    // eslint-disable-next-line react-hooks/immutability
    camera.position.z = BASE_CAMERA_Z + Math.sin(t * 0.15) * 0.3;

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const seed = seeds[i];
      const baseY = positions[i * 3 + 1];
      posAttr.array[i * 3 + 1] = baseY + Math.sin(t * 0.4 + seed) * 0.08;
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
          size={0.045}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function HeroScene({
  mobile = false,
  exitProgress,
}: {
  mobile?: boolean;
  exitProgress?: React.MutableRefObject<number>;
}) {
  const count = mobile ? 500 : 1400;
  const fallbackProgress = useRef(0);

  return (
    <Canvas
      dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)]}
      camera={{ position: [0, 0, 6.2], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <ParticleField count={count} exitProgress={exitProgress ?? fallbackProgress} />
    </Canvas>
  );
}
