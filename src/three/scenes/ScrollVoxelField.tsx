import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Voxel = {
  x: number;
  y: number;
  distance: number;
  seed: number;
  colorSeed: number;
  phase: number;
  pulseSpeed: number;
  pulseStrength: number;
};

function hash(value: number) {
  return Math.abs(Math.sin(value * 12.9898) * 43758.5453) % 1;
}

function VoxelGrid({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const { viewport } = useThree();
  const isMobile = viewport.width < 6;
  const gridSize = isMobile ? 25 : 49;
  const cubeCount = gridSize * gridSize;
  const spacing = isMobile ? 0.26 : 0.23;

  const voxels = useMemo<Voxel[]>(() => {
    const offset = (gridSize - 1) / 2;
    return Array.from({ length: cubeCount }).map((_, index) => {
      const col = index % gridSize;
      const row = Math.floor(index / gridSize);
      const x = (col - offset) * spacing;
      const y = (row - offset) * spacing;
      return {
        x,
        y,
        distance: Math.sqrt(x * x + y * y),
        seed: ((col * 13 + row * 31) % 97) / 97,
        colorSeed: hash(col * 5.73 + row * 17.19),
        phase: hash(col * 19.31 + row * 7.17) * Math.PI * 2,
        pulseSpeed: 0.55 + hash(col * 3.91 + row * 11.7) * 1.8,
        pulseStrength: 0.45 + hash(col * 23.1 + row * 5.43) * 0.55,
      };
    });
  }, [cubeCount, gridSize, spacing]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const elapsed = Date.now() * 0.001;
    const scrollWave = scrollProgress * Math.PI * 12;

    voxels.forEach((voxel, index) => {
      const wave =
        Math.sin(voxel.distance * 2.8 - scrollWave + voxel.seed * Math.PI * 2) * 0.5 + 0.5;
      const ripple =
        Math.sin((voxel.x * 0.9 + voxel.y * 0.35) * 2.3 + scrollWave * 0.6 + elapsed * 0.45) *
          0.5 +
        0.5;
      const randomPulse =
        Math.sin(elapsed * voxel.pulseSpeed + voxel.phase + Math.sin(elapsed * 0.21 + voxel.seed * 8)) *
          0.5 +
        0.5;
      const sharpPulse = Math.pow(randomPulse, 4.5) * voxel.pulseStrength;
      const intensity = Math.min(1, Math.pow(Math.max(wave * 0.62, ripple * 0.48), 2.2) + sharpPulse);
      const scale = 0.075 + intensity * (isMobile ? 0.15 : 0.2);
      const driftX = Math.sin(scrollWave * 0.12 + elapsed * 0.08 + voxel.phase) * 0.012;
      const driftY = Math.cos(scrollWave * 0.1 + elapsed * 0.07 + voxel.phase) * 0.012;

      dummy.position.set(voxel.x + driftX, voxel.y + driftY, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);

      const paletteShift = (scrollProgress * 0.28 + voxel.colorSeed + randomPulse * 0.08) % 1;
      const hue =
        paletteShift < 0.36 ? 0.53 : paletteShift < 0.62 ? 0.43 : paletteShift < 0.84 ? 0.58 : 0.71;
      color.setHSL(hue, 0.62 + intensity * 0.16, 0.16 + intensity * 0.56);
      mesh.setColorAt(index, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, cubeCount]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial vertexColors transparent opacity={0.84} depthWrite={false} />
    </instancedMesh>
  );
}

export default function ScrollVoxelField({ scrollProgress }: { scrollProgress: number }) {
  return (
    <Canvas
      className="voxel-canvas"
      dpr={[1, 1.35]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
    >
      <VoxelGrid scrollProgress={scrollProgress} />
    </Canvas>
  );
}
