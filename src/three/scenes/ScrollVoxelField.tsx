import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Voxel = {
  x: number;
  y: number;
  distance: number;
  seed: number;
};

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
      const intensity = Math.pow(Math.max(wave, ripple * 0.72), 2.8);
      const z = -2.6 + intensity * 0.72;
      const scale = 0.085 + intensity * (isMobile ? 0.115 : 0.16);

      dummy.position.set(voxel.x, voxel.y, z);
      dummy.rotation.set(0.7 + intensity * 0.4, 0.2 + scrollProgress * Math.PI, 0.18);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);

      const paletteShift = (scrollProgress + voxel.seed + intensity * 0.2) % 1;
      const hue = 0.52 + paletteShift * 0.12;
      color.setHSL(hue, 0.74, 0.28 + intensity * 0.58);
      mesh.setColorAt(index, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, cubeCount]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial vertexColors transparent opacity={0.82} depthWrite={false} />
    </instancedMesh>
  );
}

export default function ScrollVoxelField({ scrollProgress }: { scrollProgress: number }) {
  return (
    <Canvas
      className="voxel-canvas"
      dpr={[1, 1.35]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 4.2], fov: 46 }}
    >
      <VoxelGrid scrollProgress={scrollProgress} />
    </Canvas>
  );
}
