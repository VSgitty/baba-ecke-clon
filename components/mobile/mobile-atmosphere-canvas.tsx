"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

import styles from "@/components/mobile/mobile-cinematic-landing.module.css";

function FloatingVhsObjects({ reducedEffects }: { reducedEffects: boolean }) {
  const groupRef = useRef<any>(null);
  const objects = useMemo(
    () =>
      Array.from({ length: reducedEffects ? 5 : 10 }, (_, index) => ({
        key: index,
        position: [(index % 5) * 1.25 - 2.6, Math.sin(index * 0.72) * 0.9, -Math.random() * 2] as [number, number, number],
        speed: 0.35 + index * 0.05,
        scale: 0.55 + (index % 3) * 0.15,
        color: ["#7adfff", "#ff5178", "#b782ff", "#00ffd0"][index % 4]
      })),
    [reducedEffects]
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.08;
    groupRef.current.rotation.x = Math.sin(t * 0.22) * 0.06;

    groupRef.current.children.forEach((child: any, index: number) => {
      child.position.y += Math.sin(t * objects[index].speed + index) * 0.0018;
      child.rotation.z += 0.0012;
    });
  });

  return (
    <group ref={groupRef}>
      {objects.map((obj) => (
        <mesh key={obj.key} position={obj.position} scale={obj.scale}>
          <boxGeometry args={[1.2, 0.7, 0.2]} />
          <meshStandardMaterial
            color={obj.color}
            roughness={0.35}
            metalness={0.65}
            emissive={obj.color}
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

export function MobileAtmosphereCanvas({ reducedEffects }: { reducedEffects: boolean }) {
  return (
    <div className={styles.canvasWrap}>
      <Canvas dpr={[1, reducedEffects ? 1.2 : 1.8]} camera={{ position: [0, 0, 6], fov: 48 }}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[2, 4, 5]} color="#81e8ff" intensity={1.4} />
        <pointLight position={[-2, -1, 2]} color="#ff2d55" intensity={reducedEffects ? 0.7 : 1.3} />
        <FloatingVhsObjects reducedEffects={reducedEffects} />
      </Canvas>
    </div>
  );
}
