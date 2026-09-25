"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { creatorsTheme } from "@/lib/creatorsTheme";
import { createRng } from "@/lib/rng";

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Procedural "video wall": no footage to tile, so the grid of clips is entirely
// math — each cell hash-seeds its own drifting light band and off-center
// silhouette-blob, echoing ProductionsScene.tsx's light-leak/grain approach but
// extended across an N-cell grid instead of one full-bleed plane. Colors pulled
// from the vivid multi-hue spectrum (not just one accent) per user direction —
// "zyada vibrant/colorful", each cell a different hue.
const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec3 uColor0;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec3 uColor5;
  uniform vec3 uPaper;
  uniform float uZoom;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float hash1(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  // Manual if-chain rather than a dynamically-indexed uniform array — WebGL1/
  // GLSL ES 1.00 disallows non-constant array indexing in fragment shaders,
  // this stays portable to older devices that don't get a WebGL2 context.
  vec3 pickColor(float idx) {
    if (idx < 0.5) return uColor0;
    if (idx < 1.5) return uColor1;
    if (idx < 2.5) return uColor2;
    if (idx < 3.5) return uColor3;
    if (idx < 4.5) return uColor4;
    return uColor5;
  }

  void main() {
    vec2 grid = vec2(4.0, 3.0);
    vec2 uv = (vUv - 0.5) / max(uZoom, 0.001) + 0.5;
    uv += uPointer * 0.01;

    vec2 cell = floor(uv * grid);
    vec2 cellUv = fract(uv * grid);
    float cellId = cell.x + cell.y * grid.x;
    float seed = hash1(cellId * 12.9898);

    vec2 c = cellUv - 0.5;
    vec2 dir = normalize(vec2(0.6 + seed, 0.35 - seed * 0.5));
    float band = sin(dot(c, dir) * 6.0 - uTime * (0.3 + seed * 0.4) + seed * 10.0);
    band = smoothstep(-0.2, 0.9, band);

    vec2 blobCenter = vec2(0.5 + (seed - 0.5) * 0.3, 0.42 + (hash1(seed * 7.0) - 0.5) * 0.2);
    float blobDist = length((cellUv - blobCenter) * vec2(1.6, 1.0));
    float blob = smoothstep(0.5, 0.05, blobDist);

    vec3 cellColor = pickColor(mod(cellId, 6.0));
    vec3 nextColor = pickColor(mod(cellId + 1.0, 6.0));
    vec3 mixColor = mix(cellColor, nextColor, hash1(cellId * 3.1) * 0.5);

    vec3 color = uPaper * 0.05;
    color += mixColor * band * 0.34;
    color += mixColor * blob * 0.26;

    float grain = (hash(vUv * 500.0 + uTime * 40.0) - 0.5) * 0.05;
    color += grain;

    vec2 edge = abs(cellUv - 0.5);
    float sep = smoothstep(0.492, 0.5, max(edge.x, edge.y));
    color = mix(color, cellColor * 0.6, sep * 0.5);

    float vig = smoothstep(0.95, 0.25, length(vUv - 0.5));
    gl_FragColor = vec4(color * vig, 1.0);
  }
`;

function WallPlane({ zoomRef }: { zoomRef: MutableRefObject<number> }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, pointer } = useThree();

  const uniforms = useMemo(() => {
    const [c0, c1, c2, c3, c4, c5] = creatorsTheme.spectrumList.map((hex) => new THREE.Color(hex));
    return {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColor0: { value: c0 },
      uColor1: { value: c1 },
      uColor2: { value: c2 },
      uColor3: { value: c3 },
      uColor4: { value: c4 },
      uColor5: { value: c5 },
      uPaper: { value: new THREE.Color("#f3f1ea") },
      uZoom: { value: 1 },
    };
  }, []);

  // Mutating uniform `.value` fields every frame is the standard three.js/R3F
  // pattern for driving shaders — see ProductionsScene.tsx for the identical note.
  // eslint-disable-next-line react-hooks/immutability
  useFrame((state) => {
    // eslint-disable-next-line react-hooks/immutability
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPointer.value.set(pointer.x, pointer.y);
    uniforms.uZoom.value = zoomRef.current;
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

interface Toy {
  baseX: number;
  baseY: number;
  z: number;
  seed: number;
  shape: 0 | 1 | 2 | 3;
  color: THREE.Color;
  scale: number;
}

// The "khelne jaisa" mouse-reactive toy layer — a handful of vivid primitive
// shapes floating between the camera and the shader wall, drifting on their
// own but springing away from the cursor like a physics toy, then elastically
// returning. Lives in the SAME Canvas/context as the wall shader (not a new
// WebGL context) to stay within the route's WebGL budget.
function PlayfulToys({ count = 9 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const { camera } = useThree();

  const toys = useMemo<Toy[]>(() => {
    const rng = createRng(0x544f5953);
    const colors = creatorsTheme.spectrumList;
    return Array.from({ length: count }, (_, i) => ({
      baseX: (rng() - 0.5) * 2.2,
      baseY: (rng() - 0.5) * 1.3,
      z: 0.25 + rng() * 0.4,
      seed: rng() * Math.PI * 2,
      shape: Math.floor(rng() * 4) as 0 | 1 | 2 | 3,
      color: new THREE.Color(colors[i % colors.length]),
      scale: 0.09 + rng() * 0.09,
    }));
  }, [count]);

  const velocities = useRef(toys.map(() => new THREE.Vector3()));
  const pointerWorld = useRef(new THREE.Vector3());

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    toys.forEach((toy, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      // Convert the normalized pointer to world space at this toy's depth so
      // "repel from cursor" works correctly regardless of how close/far the
      // toy sits between the camera (z=1) and the wall (z=0).
      const planeSize = new THREE.Vector2();
      const distanceToCamera = camera.position.z - toy.z;
      const vFov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
      planeSize.y = 2 * Math.tan(vFov / 2) * distanceToCamera;
      planeSize.x = planeSize.y * (camera as THREE.PerspectiveCamera).aspect;
      pointerWorld.current.set(
        state.pointer.x * (planeSize.x / 2),
        state.pointer.y * (planeSize.y / 2),
        toy.z
      );

      const idleX = toy.baseX + Math.sin(t * 0.25 + toy.seed) * 0.12;
      const idleY = toy.baseY + Math.cos(t * 0.2 + toy.seed) * 0.1;

      const dx = mesh.position.x - pointerWorld.current.x;
      const dy = mesh.position.y - pointerWorld.current.y;
      const dist = Math.hypot(dx, dy);
      const influenceRadius = 0.55;
      const vel = velocities.current[i];

      if (dist < influenceRadius) {
        const push = (1 - dist / influenceRadius) * 0.06;
        vel.x += (dx / (dist || 1)) * push;
        vel.y += (dy / (dist || 1)) * push;
      }

      // Spring back toward the idle drift position, damped — a toy that
      // bounces away from the cursor and settles back, not a static repel.
      vel.x += (idleX - mesh.position.x) * 0.02;
      vel.y += (idleY - mesh.position.y) * 0.02;
      vel.multiplyScalar(0.88);

      mesh.position.x += vel.x;
      mesh.position.y += vel.y;
      mesh.rotation.x = t * 0.3 + toy.seed;
      mesh.rotation.y = t * 0.22 + toy.seed;
    });
  });

  return (
    <group ref={groupRef}>
      {toys.map((toy, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          position={[toy.baseX, toy.baseY, toy.z]}
          scale={toy.scale}
        >
          {toy.shape === 0 && <icosahedronGeometry args={[1, 0]} />}
          {toy.shape === 1 && <torusGeometry args={[0.7, 0.28, 10, 20]} />}
          {toy.shape === 2 && <octahedronGeometry args={[1, 0]} />}
          {toy.shape === 3 && <sphereGeometry args={[1, 12, 12]} />}
          <meshBasicMaterial color={toy.color} wireframe transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

export default function CreatorWallScene({
  zoomRef,
}: {
  zoomRef?: MutableRefObject<number>;
}) {
  const fallbackZoom = useRef(1);

  return (
    <Canvas
      dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)]}
      camera={{ position: [0, 0, 1], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <WallPlane zoomRef={zoomRef ?? fallbackZoom} />
      <PlayfulToys />
    </Canvas>
  );
}
