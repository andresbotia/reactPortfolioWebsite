import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Route = {
  points: THREE.Vector3[];
  color: string;
  speed: number;
  offset: number;
};

function createRoutes(isMobile: boolean): Route[] {
  const routeCount = isMobile ? 8 : 14;
  return Array.from({ length: routeCount }).map((_, index) => {
    const start = (index / routeCount) * Math.PI * 2;
    const radius = 1.4 + (index % 5) * 0.34;
    const height = ((index % 4) - 1.5) * 0.34;
    const points = Array.from({ length: 42 }).map((__, pointIndex) => {
      const t = pointIndex / 41;
      const angle = start + t * (Math.PI * (0.75 + (index % 3) * 0.18));
      const arc = Math.sin(t * Math.PI) * (0.55 + (index % 4) * 0.08);
      return new THREE.Vector3(
        Math.cos(angle) * (radius + arc),
        height + Math.sin(t * Math.PI * 2 + index) * 0.22,
        Math.sin(angle) * (radius + arc) - 0.3,
      );
    });
    return {
      points,
      color: index % 3 === 0 ? "#8be9ff" : index % 3 === 1 ? "#d7e1ea" : "#4ca3ff",
      speed: 0.16 + (index % 4) * 0.035,
      offset: index * 0.071,
    };
  });
}

function RouteSystem() {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRefs = useRef<THREE.Mesh[]>([]);
  const { pointer, viewport } = useThree();
  const isMobile = viewport.width < 6;
  const routes = useMemo(() => createRoutes(isMobile), [isMobile]);
  const nodePositions = useMemo(
    () =>
      routes.flatMap((route, index) =>
        index % 2 === 0
          ? [route.points[0], route.points[Math.floor(route.points.length / 2)], route.points.at(-1)!]
          : [route.points[Math.floor(route.points.length * 0.65)]],
      ),
    [routes],
  );

  const nodeGeometry = useMemo(() => {
    const positions = new Float32Array(nodePositions.length * 3);
    nodePositions.forEach((point, index) => {
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [nodePositions]);
  const routeObjects = useMemo(
    () =>
      routes.map((route) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(route.points);
        const material = new THREE.LineBasicMaterial({
          color: route.color,
          transparent: true,
          opacity: 0.28,
        });
        return new THREE.Line(geometry, material);
      }),
    [routes],
  );

  useFrame(({ camera }) => {
    const elapsed = Date.now() * 0.001;
    if (groupRef.current) {
      groupRef.current.rotation.y = elapsed * 0.055 + pointer.x * 0.1;
      groupRef.current.rotation.x = -0.12 + pointer.y * 0.06;
    }
    camera.position.x += (pointer.x * 0.22 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.16 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    pulseRefs.current.forEach((mesh, index) => {
      const route = routes[index % routes.length];
      const t = (elapsed * route.speed + route.offset) % 1;
      const point = route.points[Math.floor(t * (route.points.length - 1))];
      mesh.position.copy(point);
      const scale = 0.034 + Math.sin(elapsed * 2.2 + index) * 0.006;
      mesh.scale.setScalar(scale);
    });
  });

  return (
    <group ref={groupRef}>
      <points geometry={nodeGeometry}>
        <pointsMaterial
          color="#dfefff"
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>
      {routeObjects.map((line, index) => (
        <primitive
          key={`route-${index}`}
          object={line}
        />
      ))}
      {routes.map((route, index) => (
        <mesh
          key={`pulse-${route.color}-${index}`}
          ref={(node) => {
            if (node) pulseRefs.current[index] = node;
          }}
        >
          <sphereGeometry args={[1, 14, 14]} />
          <meshBasicMaterial color={route.color} transparent opacity={0.86} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.9, -0.4]}>
        <torusGeometry args={[2.4, 0.002, 8, 128]} />
        <meshBasicMaterial color="#2f6a93" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.9, -0.4]}>
        <torusGeometry args={[1.55, 0.002, 8, 128]} />
        <meshBasicMaterial color="#9bdcff" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="hero-canvas"
      camera={{ position: [0, 0.2, 5.4], fov: 48 }}
    >
      <color attach="background" args={["#05070b"]} />
      <fog attach="fog" args={["#05070b", 4, 10]} />
      <ambientLight intensity={0.7} />
      <pointLight position={[2.4, 2.8, 3]} intensity={8} color="#79dfff" />
      <RouteSystem />
    </Canvas>
  );
}
