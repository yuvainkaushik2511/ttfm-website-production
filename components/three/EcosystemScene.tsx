"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import EcosystemGraph from "@/components/three/EcosystemGraph";
import type { Vertical } from "@/data/verticals";

export default function EcosystemScene({
  verticals,
  progressRef,
  holdingRef,
}: {
  verticals: Vertical[];
  progressRef: React.MutableRefObject<number>;
  holdingRef?: React.MutableRefObject<boolean>;
}) {
  return (
    <Canvas
      dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)]}
      camera={{ position: [0, 0.6, 7], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <EcosystemGraph verticals={verticals} progressRef={progressRef} holdingRef={holdingRef} />
      {/* Low, tuned bloom — only the bright active node/core wireframe glows,
          so the graph reads as a living system rather than a decorative effect. */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.24}
          luminanceSmoothing={0.4}
          intensity={0.45}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
