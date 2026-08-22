import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Voxel = {
  x: number;
  y: number;
  distance: number;
  seed: number;
  phase: number;
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
        phase: hash(col * 19.31 + row * 7.17) * Math.PI * 2,
      };
    });
  }, [cubeCount, gridSize, spacing]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const elapsed = Date.now() * 0.001;
    const scrollWave = scrollProgress * Math.PI * 12;

    voxels.forEach((voxel, index) => {
      const radialPhase = voxel.distance * 3.35 - scrollWave + elapsed * 0.12 + voxel.seed * 0.35;
      const diagonalPhase = (voxel.x * 0.85 - voxel.y * 0.55) * 2.6 + scrollWave * 0.42;
      const ripple = Math.pow(Math.max(0, Math.cos(radialPhase)), 2.35);
      const fill = Math.min(
        1,
        ripple * 0.82 + Math.pow(Math.sin(diagonalPhase) * 0.5 + 0.5, 2.4) * 0.18,
      );
      const scale = 0.08 + fill * (isMobile ? 0.18 : 0.25);

      dummy.position.set(voxel.x, voxel.y, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);

      const leadingEdge = Math.sin(radialPhase + voxel.phase * 0.08) > 0;
      const colorMix = Math.sin(diagonalPhase + voxel.phase * 0.12) * 0.5 + 0.5;
      const hue = leadingEdge ? 0.54 + colorMix * 0.04 : 0.43 + colorMix * 0.28;
      color.setHSL(hue, 0.58 + fill * 0.18, 0.12 + fill * 0.62);
      mesh.setColorAt(index, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, cubeCount]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial vertexColors transparent opacity={0.9} depthWrite={false} />
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
