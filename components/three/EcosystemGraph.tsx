"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { Line2 } from "three-stdlib";
import type { Vertical } from "@/data/verticals";
import { verticalPaletteList } from "@/lib/verticalPalette";

const STEEL = new THREE.Color("#54524c");
const PAPER = new THREE.Color("#f3f1ea");

// Per-vertical hue/lightness variance within the ember family, shared with the
// Work-section panels and the Creators/Productions WebGL scenes via
// lib/verticalPalette.ts — hints at 7 distinct entities without breaking the "one
// connected organism" read, and keeps "TTFM AI" the same color everywhere it appears.
const NODE_COLORS = verticalPaletteList.map((hex) => new THREE.Color(hex));

interface EcosystemGraphProps {
  verticals: Vertical[];
  progressRef: React.MutableRefObject<number>;
  holdingRef?: React.MutableRefObject<boolean>;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function Node({
  index,
  angle,
  radius,
  progressRef,
}: {
  index: number;
  angle: number;
  radius: number;
  progressRef: React.MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const position = useMemo<[number, number, number]>(() => {
    const y = Math.sin(index * 1.7) * 0.5;
    return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
  }, [angle, radius, index]);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    const fractional = progressRef.current * 7;
    const amt = 1 - THREE.MathUtils.clamp(Math.abs(fractional - (index + 1)), 0, 1);
    const scale = THREE.MathUtils.lerp(0.34, 0.95, amt);
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.03 * amt;
    meshRef.current.scale.setScalar(scale * pulse);
    // Color lerp is clamped below the scale/opacity amt (max ~0.6) so focused
    // nodes read as a muted hint of their vertical color rather than reaching
    // full saturation — matches the homepage's monochrome-editorial direction.
    const color = STEEL.clone().lerp(NODE_COLORS[index], Math.min(amt, 0.6));
    materialRef.current.color.copy(color);
    materialRef.current.opacity = THREE.MathUtils.lerp(0.35, 1, amt);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[0.42, 1]} />
      <meshBasicMaterial ref={materialRef} color={STEEL} transparent wireframe />
    </mesh>
  );
}

function ConnectionLine({
  index,
  angle,
  radius,
  progressRef,
}: {
  index: number;
  angle: number;
  radius: number;
  progressRef: React.MutableRefObject<number>;
}) {
  const lineRef = useRef<Line2>(null);
  const end = useMemo<[number, number, number]>(() => {
    const y = Math.sin(index * 1.7) * 0.5;
    return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
  }, [angle, radius, index]);

  useFrame(() => {
    if (!lineRef.current?.material) return;
    const fractional = progressRef.current * 7;
    const amt = 1 - THREE.MathUtils.clamp(Math.abs(fractional - (index + 1)), 0, 1);
    const color = STEEL.clone().lerp(NODE_COLORS[index], Math.min(amt, 0.6));
    lineRef.current.material.color.copy(color);
    lineRef.current.material.opacity = THREE.MathUtils.lerp(0.12, 0.85, amt);
  });

  return (
    <Line
      ref={lineRef}
      points={[
        [0, 0, 0],
        end,
      ]}
      color="#54524c"
      transparent
      opacity={0.15}
      lineWidth={1}
    />
  );
}

function Core({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    const amt = 1 - smoothstep(0, 1.6, Math.abs(progressRef.current * 7 - 0));
    const scale = THREE.MathUtils.lerp(0.62, 0.95, amt) * (1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.03);
    meshRef.current.scale.setScalar(scale);
    materialRef.current.opacity = THREE.MathUtils.lerp(0.65, 1, amt);
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.08;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.6, 2]} />
      <meshBasicMaterial ref={materialRef} color={PAPER} transparent wireframe opacity={0.9} />
    </mesh>
  );
}

export default function EcosystemGraph({
  verticals,
  progressRef,
  holdingRef,
}: EcosystemGraphProps) {
  const groupRef = useRef<THREE.Group>(null);
  const radius = 2.6;
  const angles = useMemo(
    () => verticals.map((_, i) => (i / verticals.length) * Math.PI * 2),
    [verticals]
  );
  const { camera } = useThree();
  const BASE_CAMERA_Z = 7;
  const HELD_CAMERA_Z = 6.2;

  // Mutating the R3F camera every frame (below) is the standard three.js pattern
  // for moving it — there's no alternative API — but the lint rule flags it.
  // eslint-disable-next-line react-hooks/immutability
  useFrame(() => {
    if (!groupRef.current) return;
    const fractional = progressRef.current * 7;
    const stageIndex = Math.round(THREE.MathUtils.clamp(fractional, 0, 7));
    const targetAngle = stageIndex === 0 ? 0 : angles[stageIndex - 1];
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      -targetAngle,
      0.045
    );

    // Camera dolly on press-and-hold — a genuine "camera pushes in as you
    // explore" move, not just the node graph rotating underneath a static camera.
    // Mutating the R3F camera every frame is the standard three.js pattern for
    // moving it — there's no alternative API, so this pre-dates React state.
    const targetZ = holdingRef?.current ? HELD_CAMERA_Z : BASE_CAMERA_Z;
    // eslint-disable-next-line react-hooks/immutability
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.06);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <group ref={groupRef}>
        <Core progressRef={progressRef} />
        {verticals.map((v, i) => (
          <ConnectionLine
            key={`line-${v.slug}`}
            index={i}
            angle={angles[i]}
            radius={radius}
            progressRef={progressRef}
          />
        ))}
        {verticals.map((v, i) => (
          <Node
            key={`node-${v.slug}`}
            index={i}
            angle={angles[i]}
            radius={radius}
            progressRef={progressRef}
          />
        ))}
      </group>
    </>
  );
}
