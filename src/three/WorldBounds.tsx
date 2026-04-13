import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WORLD_BOUNDS } from './gameState';
import { cameraMode } from './CameraRig';

// ============================================================
// FORCE-FIELD BOUNDARY WALLS — visible only in drone/combat mode
// ============================================================

const gridShaderMaterial = () => new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#05d9e8') },
    uOpacity: { value: 0.12 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main() {
      vUv = uv;
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;
    varying vec3 vWorldPos;

    void main() {
      // Grid pattern
      vec2 grid = abs(fract(vWorldPos.xz * 0.3 + uTime * 0.05) - 0.5);
      float gridLine = step(0.47, max(grid.x, grid.y));

      // Vertical scan line
      float scan = sin(vWorldPos.y * 2.0 + uTime * 3.0) * 0.5 + 0.5;

      // Fade at top and bottom
      float edgeFade = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.85, vUv.y);

      float alpha = (gridLine * 0.6 + scan * 0.15) * edgeFade * uOpacity;
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const BoundaryWall = ({ position, rotation, size }: {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
}) => {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const mat = useRef(gridShaderMaterial());

  useFrame((state) => {
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <primitive object={mat.current} ref={matRef} attach="material" />
    </mesh>
  );
};

export const WorldBounds = () => {
  const [visible, setVisible] = useState(cameraMode.free);

  useEffect(() => {
    const handler = (e: CustomEvent) => setVisible(e.detail);
    window.addEventListener('drone-mode-changed', handler as EventListener);
    return () => window.removeEventListener('drone-mode-changed', handler as EventListener);
  }, []);

  if (!visible) return null;

  const { minX, maxX, minZ, maxZ, maxY } = WORLD_BOUNDS;
  const widthX = maxX - minX; // 100
  const widthZ = maxZ - minZ; // 120
  const height = maxY;        // 60

  return (
    <group>
      {/* Left wall */}
      <BoundaryWall
        position={[minX, height / 2, (minZ + maxZ) / 2]}
        rotation={[0, Math.PI / 2, 0]}
        size={[widthZ, height]}
      />
      {/* Right wall */}
      <BoundaryWall
        position={[maxX, height / 2, (minZ + maxZ) / 2]}
        rotation={[0, -Math.PI / 2, 0]}
        size={[widthZ, height]}
      />
      {/* Front wall */}
      <BoundaryWall
        position={[(minX + maxX) / 2, height / 2, maxZ]}
        rotation={[0, Math.PI, 0]}
        size={[widthX, height]}
      />
      {/* Back wall */}
      <BoundaryWall
        position={[(minX + maxX) / 2, height / 2, minZ]}
        rotation={[0, 0, 0]}
        size={[widthX, height]}
      />
      {/* Ceiling */}
      <BoundaryWall
        position={[(minX + maxX) / 2, maxY, (minZ + maxZ) / 2]}
        rotation={[Math.PI / 2, 0, 0]}
        size={[widthX, widthZ]}
      />
    </group>
  );
};
