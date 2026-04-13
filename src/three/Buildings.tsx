import { useRef, useMemo, useState, useEffect, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { themeState } from './themeState';
import { InfoTowers } from './InfoTowers';

// Live theme-reactive color getter
function getNeonColors() {
  return {
    pink: themeState.colors.primary,
    cyan: themeState.colors.accent,
    purple: themeState.colors.secondary,
    gold: themeState.colors.gold,
    black: themeState.colors.background,
  };
}

// Keep a static reference for initial renders (updated reactively via useFrame)
let neonColors = getNeonColors();

// ... existing colors ...

const HighTechBuilding = memo(({ position, scale, color }: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}) => {
  const ref = useRef<THREE.Group>(null);
  const [w, h, d] = scale;

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Tier 1 (Base - bottom 40% of building height) */}
      <mesh position={[0, -h * 0.3, 0]} castShadow>
        <boxGeometry args={[w, h * 0.4, d]} />
        <meshStandardMaterial color={neonColors.black} roughness={0.2} metalness={0.9} />
        <Edges linewidth={2} threshold={15} color={color} />
      </mesh>
      
      {/* Tier 2 (Middle - next 40%) */}
      <mesh position={[0, h * 0.1, 0]} castShadow>
        <boxGeometry args={[w * 0.8, h * 0.4, d * 0.8]} />
        <meshStandardMaterial color={neonColors.black} roughness={0.2} metalness={0.9} />
        <Edges linewidth={2} threshold={15} color={color} />
      </mesh>

      {/* Tier 3 (Top Spire - top 20%) */}
      <mesh position={[0, h * 0.4, 0]} castShadow>
        <boxGeometry args={[w * 0.5, h * 0.2, d * 0.5]} />
        <meshStandardMaterial color={neonColors.black} roughness={0.2} metalness={0.9} />
        <Edges linewidth={2} threshold={15} color={color} />
      </mesh>

      {/* Decorative vertical glowing lines on front & back */}
      <mesh position={[0, 0, d * 0.41]} castShadow>
         <boxGeometry args={[w * 0.1, h * 0.95, 0.1]} />
         <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0, -d * 0.41]} castShadow>
         <boxGeometry args={[w * 0.1, h * 0.95, 0.1]} />
         <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      
      {/* Inner Glowing Core */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w * 0.3, h * 0.98, d * 0.3]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
});

HighTechBuilding.displayName = 'HighTechBuilding';

const DataTower = memo(({ position, color }: { position: [number, number, number]; color: string }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Outer Hexagon frame */}
      <mesh>
        <cylinderGeometry args={[2, 2, 12, 6]} />
        <meshStandardMaterial color={neonColors.black} roughness={0.1} metalness={0.9} />
        <Edges linewidth={2} color={color} />
      </mesh>
      {/* Floating inner diamond */}
      <mesh>
        <octahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial emissive={color} emissiveIntensity={5} toneMapped={false} color={color} />
      </mesh>
      {/* Energy Rings */}
      {[4, 0, -4].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.5, 0.05, 8, 24]} />
          <meshBasicMaterial color={neonColors.cyan} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
});

DataTower.displayName = 'DataTower';

const HyperGate = memo(({ position }: { position: [number, number, number] }) => {
  const coreRef = useRef<THREE.Mesh>(null);
  const gateMatRef = useRef<THREE.ShaderMaterial>(null);
  
  const forcefieldShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-8, -0.5);
    shape.lineTo(8, -0.5);
    shape.lineTo(1.2, 14);
    shape.lineTo(-1.2, 14);
    shape.lineTo(-8, -0.5);
    return shape;
  }, []);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y = elapsed * -0.5;
      coreRef.current.position.y = 13 + Math.sin(elapsed * 2) * 0.5;
    }
    if (gateMatRef.current) {
      gateMatRef.current.uniforms.uTime.value = elapsed;
    }
  });

  return (
    <group position={position}>
      {/* Left leg */}
      <mesh position={[-6, 7, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.5, 3, 18, 4]} />
        <meshStandardMaterial color={neonColors.black} roughness={0.1} metalness={0.9} />
        <Edges linewidth={2} color={neonColors.pink} />
      </mesh>
      {/* Right leg */}
      <mesh position={[6, 7, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.5, 3, 18, 4]} />
        <meshStandardMaterial color={neonColors.black} roughness={0.1} metalness={0.9} />
        <Edges linewidth={2} color={neonColors.pink} />
      </mesh>
      
      {/* Energy core in the apex */}
      <mesh ref={coreRef} position={[0, 13, 0]}>
        <octahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial emissive={neonColors.cyan} emissiveIntensity={5} color={neonColors.cyan} toneMapped={false} />
        {/* Floating rings around the apex */}
        {[-0.5, 0, 0.5].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.5 - Math.abs(y), 0.1, 8, 24]} />
            <meshBasicMaterial color={neonColors.purple} transparent opacity={0.6} />
          </mesh>
        ))}
      </mesh>
      
      {/* Entrance energy forcefield */}
      <mesh position={[0, 0, 0]}>
        <shapeGeometry args={[forcefieldShape]} />
        <shaderMaterial
          ref={gateMatRef}
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(neonColors.gold) }
          }}
          vertexShader={`
            varying vec2 vPos;
            void main() {
              vPos = position.xy;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform vec3 uColor;
            varying vec2 vPos;
            void main() {
              // Upward scanning bands simulating a high-tech forcefield
              float bands = sin(vPos.y * 6.0 - uTime * 4.0) * 0.5 + 0.5;
              float microBands = sin(vPos.y * 30.0 - uTime * 8.0) * 0.1;
              float alpha = (bands * 0.15 + microBands + 0.05);
              
              gl_FragColor = vec4(uColor, alpha);
            }
          `}
          transparent={true}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
});

HyperGate.displayName = 'HyperGate';

const QuantumBridge = memo(({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Series of sci-fi rings */}
      {[-12, -6, 0, 6, 12].map((z, i) => (
        <group key={i} position={[0, 1, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[4.5, 0.2, 8, 24]} />
            <meshStandardMaterial color={neonColors.black} metalness={0.9} roughness={0.1} />
            <Edges linewidth={1} color={neonColors.cyan} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[4.7, 0.05, 8, 32]} />
            <meshBasicMaterial color={neonColors.pink} transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
      
      {/* Glowing energy floor the camera flies over */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 32]} />
        <meshBasicMaterial color={neonColors.cyan} transparent opacity={0.15} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* Side energy rails */}
      {[-4, 4].map((x, i) => (
        <mesh key={i} position={[x, -3, 0]}>
          <boxGeometry args={[0.2, 0.2, 32]} />
          <meshBasicMaterial color={neonColors.pink} />
        </mesh>
      ))}
    </group>
  );
});

QuantumBridge.displayName = 'QuantumBridge';

const SignalBeacon = memo(({ position }: { position: [number, number, number] }) => {
  const beamRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // Simplified beam — no more raycasting every frame (huge perf win)
  const beamMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(neonColors.cyan) },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying float vDistFromCore;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vDistFromCore = position.y + 30.0;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      varying float vDistFromCore;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        // Realistic light attenuation
        float normalizedDist = clamp(vDistFromCore / 60.0, 0.0, 1.0);
        float distanceFade = pow(1.0 - normalizedDist, 1.5);
        
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float edgeFade = abs(dot(normal, viewDir));
        
        // Pulsing effect instead of raycast-gated distance
        float pulse = 0.8 + sin(vDistFromCore * 0.3 - uTime * 2.0) * 0.2;
        
        // Soft volumetric mist
        float alpha = distanceFade * mix(0.1, 1.0, edgeFade) * 0.35 * pulse;
        
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  }), []);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    if (beamRef.current) {
      beamRef.current.rotation.y = elapsed * 1.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = -elapsed * 0.8;
      ringRef.current.position.y = 12 + Math.sin(elapsed * 2) * 0.5;
    }
    if (coreRef.current) {
        // Pulsate
        (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 4 + Math.sin(elapsed * 4) * 2;
    }
    // Update beam time uniform
    beamMaterial.uniforms.uTime.value = elapsed;
  });

  return (
    <group position={position}>
      {/* Base structure */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[4, 6, 4, 8]} />
        <meshStandardMaterial color={neonColors.black} roughness={0.1} metalness={0.9} />
        <Edges color={neonColors.cyan} linewidth={2} />
      </mesh>
      
      {/* Main tower body */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[2, 3.5, 16, 8]} />
        <meshStandardMaterial color={neonColors.black} roughness={0.2} metalness={0.8} />
        <Edges color={neonColors.purple} linewidth={2} />
      </mesh>

      {/* Energy Pillars around tower */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        const x = Math.cos(angle) * 2.5;
        const z = Math.sin(angle) * 2.5;
        return (
          <mesh key={i} position={[x, 4, z]}>
            <cylinderGeometry args={[0.15, 0.25, 15.5, 4]} />
            <meshBasicMaterial color={neonColors.pink} />
          </mesh>
        );
      })}

      {/* Floating rings around the light core */}
      <group ref={ringRef} position={[0, 12, 0]}>
        {[-1.5, 0, 1.5].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[3.5 - Math.abs(y) * 0.4, 0.1, 8, 24]} />
            <meshBasicMaterial color={neonColors.gold} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* Primary Glowing Core (The Light) */}
      <mesh ref={coreRef} position={[0, 13, 0]}>
        <octahedronGeometry args={[2.5, 0]} />
        <meshStandardMaterial emissive={neonColors.cyan} emissiveIntensity={6} toneMapped={false} color={neonColors.cyan} />
      </mesh>

      {/* Laser beams sweep — simplified, no raycasting */}
      <group ref={beamRef} position={[0, 13, 0]}>
        {/* Beam 1 */}
        <mesh position={[30, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={beamMaterial}>
          <cylinderGeometry args={[12, 0.2, 60, 16, 1, true]} />
        </mesh>
        
        {/* Beam 2 */}
        <mesh position={[-30, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={beamMaterial}>
          <cylinderGeometry args={[12, 0.2, 60, 16, 1, true]} />
        </mesh>
      </group>
    </group>
  );
});

SignalBeacon.displayName = 'SignalBeacon';

const HexCore = memo(({ position, color }: { position: [number, number, number]; color: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * -0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Outer shell */}
      <mesh>
        <cylinderGeometry args={[3, 4, 18, 6]} />
        <meshStandardMaterial color={neonColors.black} roughness={0.1} metalness={0.8} />
        <Edges linewidth={2} color={color} />
      </mesh>
      {/* Core ring */}
      <mesh position={[0, 9, 0]}>
        <torusGeometry args={[3.5, 0.2, 8, 6]} />
        <meshStandardMaterial emissive={color} emissiveIntensity={3} color={color} toneMapped={false} />
      </mesh>
      {/* Floating top piece */}
      <mesh position={[0, 11, 0]}>
        <cylinderGeometry args={[0, 3, 4, 6]} />
        <meshStandardMaterial color={neonColors.black} roughness={0.1} metalness={0.8} />
        <Edges linewidth={2} color={color} />
      </mesh>
    </group>
  );
});

HexCore.displayName = 'HexCore';

const EnergyPillar = memo(({ position, scale, color }: { position: [number, number, number], scale: number, color: string }) => {
  return (
    <group position={position}>
      {/* Tall central prism */}
      <mesh>
        <boxGeometry args={[1.5 * scale, 20 * scale, 1.5 * scale]} />
        <meshStandardMaterial color={neonColors.black} roughness={0.3} metalness={0.9} />
        <Edges linewidth={2} color={color} />
      </mesh>
      {/* Vertical energy strips */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x * scale, 0, 0.8 * scale]}>
          <boxGeometry args={[0.05 * scale, 18 * scale, 0.05 * scale]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x * scale, 0, -0.8 * scale]}>
          <boxGeometry args={[0.05 * scale, 18 * scale, 0.05 * scale]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
});

EnergyPillar.displayName = 'EnergyPillar';

const ServerStack = memo(({ position, scale, color }: { position: [number, number, number], scale: number, color: string }) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[2 * scale, 16 * scale, 2 * scale]} />
        <meshStandardMaterial color={neonColors.black} roughness={0.2} metalness={0.9} />
        <Edges linewidth={1} color={color} />
      </mesh>
      {/* Server blades */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, -6 * scale + i * 1.7 * scale, 0]}>
          <boxGeometry args={[2.2 * scale, 0.4 * scale, 2.2 * scale]} />
          <meshStandardMaterial emissive={color} emissiveIntensity={i % 2 === 0 ? 3 : 0.5} toneMapped={false} color={color} />
        </mesh>
      ))}
    </group>
  );
});

ServerStack.displayName = 'ServerStack';

const NeonObelisk = memo(({ position, scale, color }: { position: [number, number, number], scale: number, color: string }) => {
  const ringRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      ringRef.current.rotation.y = state.clock.elapsedTime * 0.8;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 8 * scale, 0]}>
        <cylinderGeometry args={[0.1 * scale, 1.5 * scale, 16 * scale, 4]} />
        <meshStandardMaterial color={neonColors.black} metalness={0.9} />
        <Edges linewidth={2} color={color} />
      </mesh>
      <group ref={ringRef} position={[0, 8 * scale, 0]}>
        <mesh>
          <torusGeometry args={[2.5 * scale, 0.1, 8, 24]} />
          <meshBasicMaterial color={neonColors.pink} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3 * scale, 0.05, 8, 24]} />
          <meshBasicMaterial color={neonColors.cyan} />
        </mesh>
      </group>
    </group>
  );
});

NeonObelisk.displayName = 'NeonObelisk';

const Train = ({ speed, color, offset, z, y }: { speed: number, color: string, offset: number, z: number, y: number }) => {
  const trainRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (trainRef.current) {
      const distance = 200;
      const t = ((state.clock.elapsedTime * Math.abs(speed)) + offset) % distance;
      trainRef.current.position.x = speed > 0 ? -100 + t : 100 - t;
    }
  });

  return (
    <group ref={trainRef} position={[0, y, z]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 1.5, 1.5]} />
        <meshStandardMaterial color={neonColors.black} metalness={0.9} />
        <Edges color={color} linewidth={2} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.8, 0.5, 1.6]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {[1, 2, 3].map((i) => (
        <group key={i} position={[(speed > 0 ? -5 : 5) * i, 0, 0]}>
          <mesh>
            <boxGeometry args={[4.5, 1.5, 1.5]} />
            <meshStandardMaterial color={neonColors.black} />
            <Edges color={neonColors.pink} linewidth={1} />
          </mesh>
          <mesh>
            <boxGeometry args={[4.3, 0.3, 1.6]} />
            <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const MetroSystem = memo(() => {
  return (
    <>
      {/* Track 1 */}
      <mesh position={[0, 18, -15]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 200, 8]} />
        <meshBasicMaterial color={neonColors.pink} transparent opacity={0.3} />
      </mesh>
      <Train speed={40} color={neonColors.cyan} offset={0} z={-15} y={18} />

      {/* Track 2 */}
      <mesh position={[0, 26, -35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 200, 8]} />
        <meshBasicMaterial color={neonColors.purple} transparent opacity={0.3} />
      </mesh>
      <Train speed={-35} color={neonColors.gold} offset={50} z={-35} y={26} />
    </>
  );
});

MetroSystem.displayName = 'MetroSystem';

// Glowing data orbs — using instanced mesh for 40 orbs instead of 40 individual components
const FloatingCores = memo(() => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 40;
  
  const { positions, colorArray } = useMemo(() => {
    const pos: [number, number, number][] = [];
    const colors = [neonColors.pink, neonColors.cyan, neonColors.purple, neonColors.gold];
    const col = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      pos.push([
        (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 15),
        Math.random() * 15 + 2,
        -Math.random() * 80,
      ]);
      const c = new THREE.Color(colors[i % colors.length]);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colorArray: col };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Set initial positions
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      dummy.position.set(...positions[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, dummy]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const elapsed = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        positions[i][0],
        positions[i][1] + Math.sin(elapsed * 0.8 + i) * 2,
        positions[i][2]
      );
      dummy.rotation.set(elapsed * 0.5 + i, elapsed * 0.3 + i, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial emissive="#ffffff" emissiveIntensity={3} toneMapped={false} />
    </instancedMesh>
  );
});

FloatingCores.displayName = 'FloatingCores';

// Simplified horizon buildings: static, no individual useFrame hooks
const HorizonBuildings = memo(() => {
  const buildings = useMemo(() => {
    // Reduced from 120 to 60 — most are far in the distance covered by fog
    return Array.from({ length: 60 }).map((_, i) => {
      const typeNum = Math.random();
      const scaleX = 2 + Math.random() * 3;
      const scaleY = 6 + Math.random() * 18;
      const scaleZ = 2 + Math.random() * 3;
      const color = [neonColors.pink, neonColors.cyan, neonColors.purple, neonColors.gold][i % 4];
      const x = (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 150);
      const z = - (Math.random() * 80) - 5;
      
      let y = 0;
      let compType = '';
      if (typeNum > 0.8) {
         compType = 'obelisk';
         y = 0;
      } else if (typeNum > 0.6) {
         compType = 'server';
         y = 8 * (scaleX * 0.6);
      } else if (typeNum > 0.4) {
         compType = 'hex';
         y = 9;
      } else {
         compType = 'hightech';
         y = scaleY / 2;
      }

      return {
        position: [x, y, z] as [number, number, number],
        scale: [scaleX, scaleY, scaleZ] as [number, number, number],
        color,
        compType
      };
    });
  }, []);

  return (
    <>
      {buildings.map((b, i) => {
        if (b.compType === 'obelisk') return <NeonObelisk key={`ambient-${i}`} position={b.position} scale={b.scale[0] * 0.6} color={b.color} />;
        if (b.compType === 'server') return <ServerStack key={`ambient-${i}`} position={b.position} scale={b.scale[0] * 0.6} color={b.color} />;
        if (b.compType === 'hex') return <HexCore key={`ambient-${i}`} position={b.position} color={b.color} />;
        return <HighTechBuilding key={`ambient-${i}`} position={b.position} scale={b.scale} color={b.color} />;
      })}
    </>
  );
});

HorizonBuildings.displayName = 'HorizonBuildings';

// Synthwave infinite grid — reduced from 20 slices to 10
const CyberGrid = memo(({ colors }: { colors: ReturnType<typeof getNeonColors> }) => {
  return (
    <group position={[0, -0.5, 0]}>
      {Array.from({ length: 10 }).map((_, i) => {
        const sliceZ = 150 - (i * 35) - 10;
        return (
          <group key={i} position={[0, 0, sliceZ]}>
            <Grid
              args={[400, 35]}
              cellColor={colors.purple}
              sectionColor={colors.pink}
              cellThickness={0.5}
              sectionThickness={1}
              fadeDistance={200}
            />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
              <planeGeometry args={[400, 35]} />
              <meshBasicMaterial color={colors.black} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
});

CyberGrid.displayName = 'CyberGrid';

export const Buildings = () => {
  const [, setThemeTick] = useState(0);

  useEffect(() => {
    const handler = () => {
      neonColors = getNeonColors();
      setThemeTick(t => t + 1);
    };
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  const c = neonColors;

  return (
    <group>
      <CyberGrid colors={c} />
      <FloatingCores />
      <MetroSystem />

      {/* Entrance */}
      <HyperGate position={[0, 0, 8]} />

      {/* Sector 1 */}
      <DataTower position={[-6, 6, -2]} color={c.cyan} />
      <HexCore position={[-12, 9, -5]} color={c.pink} />
      <HighTechBuilding position={[6, 5, -4]} scale={[4, 10, 4]} color={c.purple} />
      <EnergyPillar position={[14, 12, -8]} scale={1.2} color={c.gold} />

      {/* Sector 2 */}
      <HighTechBuilding position={[-10, 7, -14]} scale={[3, 14, 3]} color={c.pink} />
      <EnergyPillar position={[-16, 15, -18]} scale={1.5} color={c.cyan} />
      <HighTechBuilding position={[9, 5, -16]} scale={[3, 10, 3]} color={c.cyan} />
      <DataTower position={[-5, 6, -20]} color={c.gold} />
      <HexCore position={[12, 9, -22]} color={c.purple} />
      <HighTechBuilding position={[7, 4, -10]} scale={[2.5, 8, 2.5]} color={c.purple} />

      {/* Sector 3 */}
      <DataTower position={[6, 6, -28]} color={c.pink} />
      <HighTechBuilding position={[-10, 6, -26]} scale={[6, 12, 4]} color={c.cyan} />
      <HexCore position={[-18, 9, -30]} color={c.gold} />
      <EnergyPillar position={[-6, 13, -34]} scale={1.3} color={c.purple} />
      <HighTechBuilding position={[12, 7, -32]} scale={[4, 14, 4]} color={c.pink} />

      {/* Bridge */}
      <QuantumBridge position={[0, 2, -38]} />

      {/* Final Beacon */}
      <SignalBeacon position={[0, 0, -65]} />

      {/* Horizon buildings */}
      <HorizonBuildings />

      {/* Information Towers */}
      <InfoTowers />
    </group>
  );
};
