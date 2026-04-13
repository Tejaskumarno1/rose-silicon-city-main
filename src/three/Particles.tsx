import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { themeState } from './themeState';

export const Particles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 500; // reduced from 800 — barely noticeable visual difference
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const c = themeState.colors;
    const palette = [
      new THREE.Color(c.primary),
      new THREE.Color(c.accent),
      new THREE.Color(c.secondary),
      new THREE.Color(c.gold),
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 20;
      pos[i * 3 + 2] = -Math.random() * 80;

      const clr = palette[Math.floor(Math.random() * palette.length)];
      const intensity = 2.5;
      col[i * 3] = clr.r * intensity;
      col[i * 3 + 1] = clr.g * intensity;
      col[i * 3 + 2] = clr.b * intensity;
    }
    return [pos, col];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeState.currentId]);

  // Store original Y and X positions for animation (avoid cumulative drift)
  const basePositions = useMemo(() => new Float32Array(positions), [positions]);

  // Throttle particle updates — only update every 2nd frame
  const frameSkip = useRef(0);

  useFrame((state) => {
    if (!particlesRef.current) return;
    
    // Only animate every other frame — particles are subtle, nobody notices
    frameSkip.current++;
    if (frameSkip.current % 2 !== 0) return;

    const geo = particlesRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      // Use base positions + offset instead of cumulative mutations (prevents drift)
      arr[i * 3] = basePositions[i * 3] + Math.cos(t * 0.3 + i * 0.05) * 0.5;
      arr[i * 3 + 1] = basePositions[i * 3 + 1] + Math.sin(t * 0.5 + i * 0.1) * 0.5;
    }
    posAttr.needsUpdate = true;

    particlesRef.current.rotation.y = t * 0.02;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
};
