"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { verticalPalette } from "@/lib/verticalPalette";

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Procedural film plane: no base image/video to distort, so "lens" character comes
// from a generated diagonal light-leak sampled with a small per-channel offset
// (chromatic fringing) whose amount grows with pointer proximity, plus animated
// grain and a vignette. Everything here is math — no texture asset.
const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec3 uAccent;
  uniform vec3 uPaper;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv - 0.5;
    float dist = length(uv);

    vec2 pointerUv = uPointer * 0.5;
    float pointerDist = length(uv - pointerUv);
    float chroma = smoothstep(0.65, 0.0, pointerDist) * 0.028;

    vec2 dir = normalize(vec2(0.7, 0.32));
    float bandBase = dot(uv, dir) - uTime * 0.045;
    float bandR = smoothstep(0.4, -0.4, abs(sin(bandBase * 2.4 + chroma)));
    float bandG = smoothstep(0.4, -0.4, abs(sin(bandBase * 2.4)));
    float bandB = smoothstep(0.4, -0.4, abs(sin(bandBase * 2.4 - chroma)));

    vec3 leak = vec3(bandR, bandG, bandB) * uAccent * 0.4;

    float vig = smoothstep(0.78, 0.12, dist);
    float grain = (hash(vUv * 420.0 + uTime * 60.0) - 0.5) * 0.07;

    vec3 base = uPaper * 0.05 * vig;
    vec3 color = base + leak * vig + grain;

    float alpha = clamp(vig * 0.85 + (bandR + bandG + bandB) * 0.12, 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;

function FilmPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, pointer } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      // Muted here (not in the shared lib/verticalPalette.ts module) for the
      // homepage Work chapter's monochrome-editorial direction.
      uAccent: { value: new THREE.Color(verticalPalette.film).lerp(new THREE.Color("#8a8a86"), 0.5) },
      uPaper: { value: new THREE.Color("#f3f1ea") },
    }),
    []
  );

  useFrame((state) => {
    // Mutating uniform `.value` fields every frame is the standard three.js/R3F
    // pattern for driving shaders — there's no alternative API. The immutability
    // lint rule doesn't have R3F-awareness and flags this as a general anti-pattern.
    // eslint-disable-next-line react-hooks/immutability
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPointer.value.set(pointer.x, pointer.y);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
      />
    </mesh>
  );
}

export default function ProductionsScene() {
  return (
    <Canvas
      dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)]}
      camera={{ position: [0, 0, 1], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <FilmPlane />
    </Canvas>
  );
}
