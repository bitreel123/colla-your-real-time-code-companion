import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        pointer.y * 0.5 + state.clock.elapsedTime * 0.1,
        0.05
      );
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        pointer.x * 0.5 + state.clock.elapsedTime * 0.15,
        0.05
      );
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={1.6}>
        <sphereGeometry args={[1, 128, 128]} />
        <MeshDistortMaterial
          color="#0a0a0a"
          roughness={0.15}
          metalness={0.95}
          distort={0.35}
          speed={1.8}
          envMapIntensity={1.2}
        />
      </mesh>
    </Float>
  );
}

export default function HeroSphere() {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-3, -3, 2]} intensity={0.5} color="#666" />
        <pointLight position={[0, 3, 3]} intensity={0.8} color="#aaa" />
        <AnimatedSphere />
      </Canvas>
    </div>
  );
}
