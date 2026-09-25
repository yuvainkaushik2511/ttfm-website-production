"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import GrowthEngineGraph from "@/components/three/creators/GrowthEngineGraph";
import type { GrowthNode } from "@/data/creators";

// Clone of components/three/EcosystemScene.tsx's Canvas+Bloom setup — same
// tuned bloom values so only the active node/pulse glows, not the whole scene.
// The ONLY <EffectComposer>/<Bloom> on the /creators route (see plan's WebGL
// budget note) — reserved for this section.
export default function GrowthEngineScene({
  nodes,
  progressRef,
}: {
  nodes: GrowthNode[];
  progressRef: React.MutableRefObject<number>;
}) {
  return (
    <Canvas
      dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)]}
      camera={{ position: [0, 0.4, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <GrowthEngineGraph nodes={nodes} progressRef={progressRef} />
      <EffectComposer>
        <Bloom luminanceThreshold={0.18} luminanceSmoothing={0.4} intensity={0.45} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
