"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createRng } from "@/lib/rng";
import { creatorsTheme } from "@/lib/creatorsTheme";
import CreatorFigure from "@/components/three/creators/CreatorFigure";
import type { CreatorProfile } from "@/data/creators";

interface CardLayout {
  seed: number;
  x: number;
  y: number;
  z: number;
  scale: number;
}

function useCardLayout(count: number): CardLayout[] {
  return useMemo(() => {
    const rng = createRng(0x554e4956);
    const layouts: CardLayout[] = [];
    for (let i = 0; i < count; i++) {
      layouts.push({
        seed: Math.floor(rng() * 0xffffffff),
        x: (rng() - 0.5) * 9,
        y: (rng() - 0.5) * 5,
        z: -rng() * 7 + 1,
        scale: 0.75 + rng() * 0.5,
      });
    }
    return layouts;
  }, [count]);
}

function Card({
  layout,
  creator,
  onHoverCreator,
}: {
  layout: CardLayout;
  creator: CreatorProfile;
  onHoverCreator: (creator: CreatorProfile | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const hoverRef = useRef(0);
  const [hovered, setHovered] = useState(false);

  useFrame((_state, delta) => {
    hoverRef.current = THREE.MathUtils.lerp(hoverRef.current, hovered ? 1 : 0, delta * 5);
    if (groupRef.current) {
      const targetScale = layout.scale * (1 + hoverRef.current * 0.18);
      const current = groupRef.current.scale.x || layout.scale;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(current, targetScale, 0.15));
    }
  });

  return (
    <group ref={groupRef} position={[layout.x, layout.y, layout.z]}>
      {/* Invisible-but-opacity-0 (not visible=false) hit plane — some raycasters
          skip visible=false meshes entirely, opacity:0 keeps it hit-testable.
          Hover label lives as a plain DOM overlay outside the Canvas (see
          CreatorUniverse.tsx) — drei's <Html> portal was pulled after it
          produced a "Failed to execute removeChild" React reconciliation error
          when this scene mounted/unmounted on scroll (useInViewport gating).
          NOTE: data-cursor/data-cursor-label do NOT belong here — R3F meshes
          aren't DOM elements, and R3F tries to interpret unknown JSX props as
          Three.js object properties, crashing with "Cannot set
          'data-cursor-label'". CustomCursor's data-cursor system only works on
          real DOM elements (the hit plane is a <mesh>, not one). */}
      <mesh
        onPointerOver={() => {
          setHovered(true);
          onHoverCreator(creator);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHoverCreator(null);
        }}
      >
        <planeGeometry args={[1.3, 1.7]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <CreatorFigure seed={layout.seed} accent={creatorsTheme.accent} count={180} hoverRef={hoverRef} />
    </group>
  );
}

function Field({
  creators,
  onHoverCreator,
}: {
  creators: CreatorProfile[];
  onHoverCreator: (creator: CreatorProfile | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const layouts = useCardLayout(creators.length);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        pointer.current.x * 0.6,
        0.04
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        pointer.current.y * 0.35,
        0.04
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        pointer.current.x * 0.08,
        0.03
      );
    }
  });

  return (
    <group ref={groupRef}>
      {creators.map((creator, i) => (
        <Card key={creator.slug} layout={layouts[i]} creator={creator} onHoverCreator={onHoverCreator} />
      ))}
    </group>
  );
}

export default function CreatorUniverseScene({
  creators,
  onHoverCreator,
}: {
  creators: CreatorProfile[];
  onHoverCreator: (creator: CreatorProfile | null) => void;
}) {
  return (
    <Canvas
      dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)]}
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.4} />
      <Field creators={creators} onHoverCreator={onHoverCreator} />
    </Canvas>
  );
}
