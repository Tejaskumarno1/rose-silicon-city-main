import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollProgressRef } from '@/hooks/useScrollProgress';

export const Lights = () => {
  const pointRef = useRef<THREE.PointLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    const scrollProgress = scrollProgressRef.current;
    if (pointRef.current) {
      const t = state.clock.elapsedTime;
      pointRef.current.color.setHSL(
        (0.95 + Math.sin(t * 0.3) * 0.05) % 1,
        0.6,
        0.7
      );
      pointRef.current.position.z = -scrollProgress * 60;
    }
    if (spotRef.current) {
      spotRef.current.position.z = -scrollProgress * 60 + 5;
    }
  });

  return (
    <>
      <ambientLight color="#1a0030" intensity={0.5} />
      <pointLight
        ref={pointRef}
        position={[0, 8, 0]}
        color="#e8c99a"
        intensity={2}
        distance={40}
      />
      <spotLight
        ref={spotRef}
        position={[5, 10, 5]}
        color="#7fffd4"
        intensity={1.5}
        angle={0.5}
        penumbra={0.8}
        distance={50}
      />
      <pointLight position={[-5, 5, -20]} color="#f4a7b9" intensity={1} distance={30} />
      <pointLight position={[5, 5, -40]} color="#c9b8f5" intensity={1} distance={30} />
    </>
  );
};
