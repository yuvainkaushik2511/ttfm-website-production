"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { Line2 } from "three-stdlib";
import type { GrowthNode } from "@/data/creators";
import { creatorsTheme } from "@/lib/creatorsTheme";

const STEEL = new THREE.Color("#54524c");
const ACCENT = new THREE.Color(creatorsTheme.accent);
const ACCENT_BRIGHT = new THREE.Color(creatorsTheme.accentBright);

// FORK of components/three/EcosystemGraph.tsx (not a refactor — that file is on
// the untouched homepage's critical path and its `* 7` is entangled with
// verticalPaletteList's 7 entries). Chain layout instead of radial, node->node
// segments instead of core->node, plus a traveling pulse mesh per segment so the
// pipeline reads as "data flowing through", not just a static diagram.
function chainPosition(index: number, spacing: number): [number, number, number] {
  return [index * spacing, Math.sin(index * 1.7) * 0.4, 0];
}

interface GraphChildProps {
  index: number;
  total: number;
  spacing: number;
  progressRef: React.MutableRefObject<number>;
}

function NodeMesh({ index, total, spacing, progressRef }: GraphChildProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const position = useMemo(() => chainPosition(index, spacing), [index, spacing]);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    const fractional = progressRef.current * (total - 1);
    const amt = 1 - THREE.MathUtils.clamp(Math.abs(fractional - index), 0, 1);
    const scale = THREE.MathUtils.lerp(0.3, 0.85, amt);
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.03 * amt;
    meshRef.current.scale.setScalar(scale * pulse);
    const color = STEEL.clone().lerp(ACCENT, amt);
    materialRef.current.color.copy(color);
    materialRef.current.opacity = THREE.MathUtils.lerp(0.35, 1, amt);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[0.38, 1]} />
      <meshBasicMaterial ref={materialRef} color={STEEL} transparent wireframe />
    </mesh>
  );
}

function Segment({ index, total, spacing, progressRef }: GraphChildProps) {
  const lineRef = useRef<Line2>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const pulseMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const start = useMemo(() => chainPosition(index, spacing), [index, spacing]);
  const end = useMemo(() => chainPosition(index + 1, spacing), [index, spacing]);
  const startVec = useMemo(() => new THREE.Vector3(...start), [start]);
  const endVec = useMemo(() => new THREE.Vector3(...end), [end]);

  useFrame((state) => {
    if (!lineRef.current?.material) return;
    const fractional = progressRef.current * (total - 1);
    const amt = 1 - THREE.MathUtils.clamp(Math.abs(fractional - (index + 0.5)), 0, 1);
    const color = STEEL.clone().lerp(ACCENT, amt);
    lineRef.current.material.color.copy(color);
    lineRef.current.material.opacity = THREE.MathUtils.lerp(0.12, 0.75, amt);

    if (pulseRef.current && pulseMatRef.current) {
      const t = (state.clock.elapsedTime * 0.4 + index * 0.16) % 1;
      pulseRef.current.position.lerpVectors(startVec, endVec, t);
      pulseMatRef.current.opacity = amt * 0.9;
    }
  });

  return (
    <>
      <Line ref={lineRef} points={[start, end]} color="#54524c" transparent opacity={0.15} lineWidth={1.5} />
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial ref={pulseMatRef} color={ACCENT_BRIGHT} transparent opacity={0} />
      </mesh>
    </>
  );
}

interface GrowthEngineGraphProps {
  nodes: GrowthNode[];
  progressRef: React.MutableRefObject<number>;
}

export default function GrowthEngineGraph({ nodes, progressRef }: GrowthEngineGraphProps) {
  const groupRef = useRef<THREE.Group>(null);
  const total = nodes.length;
  const spacing = 1.5;
  // Center the chain: shift the whole group left by half its total span.
  const offsetX = -((total - 1) * spacing) / 2;

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      (progressRef.current - 0.5) * 0.15,
      0.05
    );
  });

  return (
    <group ref={groupRef} position={[offsetX, 0, 0]}>
      <ambientLight intensity={0.6} />
      {Array.from({ length: total - 1 }, (_, i) => (
        <Segment key={`seg-${i}`} index={i} total={total} spacing={spacing} progressRef={progressRef} />
      ))}
      {nodes.map((_, i) => (
        <NodeMesh key={`node-${i}`} index={i} total={total} spacing={spacing} progressRef={progressRef} />
      ))}
    </group>
  );
}
