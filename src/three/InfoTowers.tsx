import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Edges, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { themeState } from './themeState';
import { cameraMode } from './CameraRig';

// ============================================================
// DATA FOR EACH INFO TOWER
// ============================================================

interface InfoTowerData {
  label: string;
  position: [number, number, number];
  height: number;
  width: number;
  colorKey: 'primary' | 'accent' | 'secondary' | 'gold';
  lines: { text: string; size?: number; bold?: boolean; color?: string; gap?: number }[];
}

const TOWERS: InfoTowerData[] = [
  {
    label: 'IDENTITY',
    position: [20, 0, 5],
    height: 20,
    width: 6,
    colorKey: 'primary',
    lines: [
      { text: 'BODDU TEJAS KUMAR', size: 0.5, bold: true },
      { text: '', gap: 0.3 },
      { text: 'AI/ML · Full-Stack Developer', size: 0.25 },
      { text: 'CSE Undergrad · Class of 2027', size: 0.22 },
      { text: '', gap: 0.5 },
      { text: '3rd-year CSE undergrad at', size: 0.2 },
      { text: 'SR University specialising in', size: 0.2 },
      { text: 'AI/ML and full-stack development.', size: 0.2 },
      { text: '150+ LeetCode problems solved.', size: 0.2 },
      { text: '', gap: 0.4 },
      { text: 'Seeking internship in:', size: 0.18, color: 'muted' },
      { text: 'Backend · AI · Product Eng.', size: 0.22, bold: true },
    ],
  },
  {
    label: 'EDUCATION',
    position: [-22, 0, -5],
    height: 18,
    width: 5.5,
    colorKey: 'accent',
    lines: [
      { text: 'EDUCATION', size: 0.45, bold: true },
      { text: '', gap: 0.4 },
      { text: 'SR University', size: 0.35, bold: true },
      { text: 'Hanamkonda, India', size: 0.18, color: 'muted' },
      { text: '', gap: 0.3 },
      { text: 'Computer Science Engineering', size: 0.22 },
      { text: 'Aug 2023 — May 2027', size: 0.18, color: 'muted' },
      { text: '', gap: 0.5 },
      { text: 'CGPA', size: 0.18, color: 'muted' },
      { text: '7.68 / 10', size: 0.5, bold: true },
      { text: '', gap: 0.5 },
      { text: 'COURSEWORK', size: 0.16, color: 'muted' },
      { text: 'DSA · OS · DBMS', size: 0.22 },
      { text: 'Computer Networks', size: 0.22 },
    ],
  },
  {
    label: 'SKILLS',
    position: [22, 0, -18],
    height: 22,
    width: 5.5,
    colorKey: 'secondary',
    lines: [
      { text: 'SKILLS', size: 0.45, bold: true },
      { text: '', gap: 0.3 },
      { text: '— LANGUAGES —', size: 0.15, color: 'muted' },
      { text: 'Python · Java', size: 0.28 },
      { text: 'JavaScript · SQL', size: 0.28 },
      { text: '', gap: 0.3 },
      { text: '— FRONTEND —', size: 0.15, color: 'muted' },
      { text: 'React.js · HTML/CSS', size: 0.25 },
      { text: '', gap: 0.2 },
      { text: '— BACKEND —', size: 0.15, color: 'muted' },
      { text: 'Node.js · REST APIs', size: 0.25 },
      { text: '', gap: 0.2 },
      { text: '— AI / ML —', size: 0.15, color: 'muted' },
      { text: 'TensorFlow · OpenCV', size: 0.25 },
      { text: 'scikit-learn · NLP', size: 0.25 },
      { text: 'LangChain', size: 0.25 },
      { text: '', gap: 0.2 },
      { text: '— CLOUD —', size: 0.15, color: 'muted' },
      { text: 'AWS · Cloud Foundations', size: 0.22 },
    ],
  },
  {
    label: 'MAHAYUDH',
    position: [-20, 0, -25],
    height: 20,
    width: 6,
    colorKey: 'primary',
    lines: [
      { text: 'PROJECT 01', size: 0.15, color: 'muted' },
      { text: 'MAHAYUDH', size: 0.5, bold: true },
      { text: '', gap: 0.2 },
      { text: 'AI Multi-Agent', size: 0.28 },
      { text: 'Recruitment SaaS', size: 0.28 },
      { text: '', gap: 0.3 },
      { text: '8 specialised AI agents', size: 0.2 },
      { text: 'handling full recruitment:', size: 0.2 },
      { text: '', gap: 0.15 },
      { text: 'JD Parsing · Resume Scoring', size: 0.18 },
      { text: 'Candidate Matching', size: 0.18 },
      { text: 'Automated Screening Calls', size: 0.18 },
      { text: 'Ranking · Skill Assessment', size: 0.18 },
      { text: '', gap: 0.4 },
      { text: 'EFFORT REDUCED', size: 0.15, color: 'muted' },
      { text: '~60%', size: 0.6, bold: true },
    ],
  },
  {
    label: 'TRAFFIC AI',
    position: [18, 0, -40],
    height: 18,
    width: 5.5,
    colorKey: 'accent',
    lines: [
      { text: 'PROJECT 02', size: 0.15, color: 'muted' },
      { text: 'AI TRAFFIC', size: 0.45, bold: true },
      { text: 'OPTIMIZER', size: 0.45, bold: true },
      { text: '', gap: 0.3 },
      { text: 'Real-time multi-lane', size: 0.2 },
      { text: 'traffic monitoring system', size: 0.2 },
      { text: 'using OpenCV + deep learning', size: 0.2 },
      { text: '', gap: 0.2 },
      { text: 'Detects congestion &', size: 0.2 },
      { text: 'rule violations', size: 0.2 },
      { text: '', gap: 0.4 },
      { text: 'ACCURACY', size: 0.15, color: 'muted' },
      { text: '~89%', size: 0.6, bold: true },
      { text: '', gap: 0.2 },
      { text: 'WAIT TIME REDUCED', size: 0.15, color: 'muted' },
      { text: '-30%', size: 0.4, bold: true },
    ],
  },
  {
    label: 'ACHIEVEMENTS',
    position: [-18, 0, -48],
    height: 20,
    width: 5.5,
    colorKey: 'gold',
    lines: [
      { text: 'ACHIEVEMENTS', size: 0.4, bold: true },
      { text: '', gap: 0.4 },
      { text: 'AVISHKAAR Season 3', size: 0.25, bold: true },
      { text: 'Phase 2 — National Level', size: 0.17, color: 'muted' },
      { text: 'Multi-agent AI SaaS platform', size: 0.18 },
      { text: '', gap: 0.3 },
      { text: 'Smart India Hackathon', size: 0.25, bold: true },
      { text: 'Level 1 — National Level', size: 0.17, color: 'muted' },
      { text: '', gap: 0.3 },
      { text: 'SRU Startup Club', size: 0.25, bold: true },
      { text: 'Web Dev & Designer', size: 0.17, color: 'muted' },
      { text: '+40% event registrations', size: 0.2 },
      { text: '', gap: 0.3 },
      { text: '— CERTIFICATIONS —', size: 0.14, color: 'muted' },
      { text: 'AWS Cloud Foundations', size: 0.2 },
      { text: 'AWS Cloud Developing', size: 0.2 },
      { text: 'Google Data Analytics', size: 0.2 },
    ],
  },
  {
    label: 'CONTACT',
    position: [15, 0, -58],
    height: 16,
    width: 5,
    colorKey: 'secondary',
    lines: [
      { text: 'SIGNAL TOWER', size: 0.35, bold: true },
      { text: '', gap: 0.4 },
      { text: 'CONNECT', size: 0.15, color: 'muted' },
      { text: '', gap: 0.2 },
      { text: '// EMAIL', size: 0.14, color: 'muted' },
      { text: 'tejaskumarwgl@gmail.com', size: 0.22 },
      { text: '', gap: 0.25 },
      { text: '// PHONE', size: 0.14, color: 'muted' },
      { text: '+91 81258 65459', size: 0.25 },
      { text: '', gap: 0.25 },
      { text: '// GITHUB', size: 0.14, color: 'muted' },
      { text: 'github.com/Tejaskumarno1', size: 0.2 },
      { text: '', gap: 0.25 },
      { text: '// LINKEDIN', size: 0.14, color: 'muted' },
      { text: 'linkedin.com/in/', size: 0.18 },
      { text: 'boddu-tejas-kumar', size: 0.18 },
    ],
  },
];

// ============================================================
// BEACON — visible only in drone mode, tall laser above tower
// ============================================================

const BEACON_HEIGHT = 35; // how far above the tower top the beam extends

const TowerBeacon = ({ height, color, label }: { height: number; color: string; label: string }) => {
  const beamRef = useRef<THREE.Mesh>(null);
  const diamondRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (diamondRef.current) {
      diamondRef.current.rotation.y = state.clock.elapsedTime * 2;
      diamondRef.current.position.y = height + BEACON_HEIGHT + 2 + Math.sin(state.clock.elapsedTime * 1.5) * 0.5;
    }
    if (beamRef.current) {
      (beamRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <group>
      {/* Vertical laser beam */}
      <mesh ref={beamRef} position={[0, height + BEACON_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, BEACON_HEIGHT, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Glow cylinder (wider, more subtle) */}
      <mesh position={[0, height + BEACON_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[0.4, 0.4, BEACON_HEIGHT, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Floating diamond marker at the top */}
      <mesh ref={diamondRef} position={[0, height + BEACON_HEIGHT + 2, 0]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Billboard label that always faces the camera */}
      <Billboard position={[0, height + BEACON_HEIGHT + 4.5, 0]}>
        <Text
          fontSize={1.2}
          color={color}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {label}
        </Text>
      </Billboard>

      {/* Point light for nearby glow */}
      <pointLight
        position={[0, height + BEACON_HEIGHT, 0]}
        color={color}
        intensity={5}
        distance={25}
        decay={2}
      />
    </group>
  );
};

// ============================================================
// SINGLE INFO TOWER COMPONENT
// ============================================================

const InfoTower = ({ data, droneActive }: { data: InfoTowerData; droneActive: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const c = themeState.colors;
  const accentColor = c[data.colorKey];
  const h = data.height;
  const w = data.width;
  const d = w * 0.6;

  // Pre-calculate text positions (top-down)
  const textElements = useMemo(() => {
    const items: { text: string; y: number; size: number; bold: boolean; isMuted: boolean }[] = [];
    let currentY = h * 0.42; // Start near the top of the tower

    for (const line of data.lines) {
      if (line.text === '') {
        currentY -= (line.gap || 0.3);
        continue;
      }
      const size = line.size || 0.22;
      items.push({
        text: line.text,
        y: currentY,
        size,
        bold: line.bold || false,
        isMuted: line.color === 'muted',
      });
      currentY -= size * 1.6;
    }
    return items;
  }, [data, h]);

  // Gentle pulse on the glow light
  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.intensity = 3 + Math.sin(state.clock.elapsedTime * 1.5) * 1;
    }
  });

  return (
    <group ref={groupRef} position={data.position}>
      {/* ===== TOWER BODY ===== */}

      {/* Main column */}
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#050510" roughness={0.15} metalness={0.95} />
        <Edges linewidth={1.5} threshold={15} color={accentColor} />
      </mesh>

      {/* Top crown (wider cap) */}
      <mesh position={[0, h + 0.15, 0]}>
        <boxGeometry args={[w + 0.6, 0.3, d + 0.6]} />
        <meshStandardMaterial color="#050510" roughness={0.1} metalness={0.95} />
        <Edges linewidth={2} color={accentColor} />
      </mesh>

      {/* Base platform */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[w + 1, 0.3, d + 1]} />
        <meshStandardMaterial color="#050510" roughness={0.1} metalness={0.9} />
        <Edges linewidth={1.5} color={accentColor} />
      </mesh>

      {/* Vertical accent lines on corners */}
      {[
        [w / 2 + 0.05, d / 2 + 0.05],
        [-w / 2 - 0.05, d / 2 + 0.05],
        [w / 2 + 0.05, -d / 2 - 0.05],
        [-w / 2 - 0.05, -d / 2 - 0.05],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, h / 2, z]}>
          <boxGeometry args={[0.08, h, 0.08]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.7} />
        </mesh>
      ))}

      {/* Inner glow core */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w * 0.5, h * 0.9, d * 0.5]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Point light at top */}
      <pointLight
        ref={glowRef}
        position={[0, h + 1, d / 2 + 1]}
        color={accentColor}
        intensity={3}
        distance={15}
        decay={2}
      />

      {/* ===== DRONE-MODE BEACON ===== */}
      {droneActive && (
        <TowerBeacon height={h} color={accentColor} label={data.label} />
      )}

      {/* ===== LABEL BANNER on top ===== */}
      <mesh position={[0, h + 0.8, 0]}>
        <boxGeometry args={[w * 0.7, 0.6, 0.1]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.15} />
      </mesh>
      <Text
        position={[0, h + 0.8, 0.06]}
        fontSize={0.22}
        color={accentColor}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
      >
        {data.label}
      </Text>

      {/* ===== FRONT FACE TEXT ===== */}
      {/* Dark panel behind the text for contrast */}
      <mesh position={[0, h / 2, d / 2 + 0.02]}>
        <planeGeometry args={[w * 0.9, h * 0.9]} />
        <meshBasicMaterial color="#020208" transparent opacity={0.85} side={THREE.FrontSide} />
      </mesh>

      {/* Accent border around text panel */}
      <mesh position={[0, h / 2, d / 2 + 0.025]}>
        <planeGeometry args={[w * 0.92, h * 0.92]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.12} side={THREE.FrontSide} />
      </mesh>

      {/* Text lines on front face */}
      {textElements.map((item, i) => (
        <Text
          key={i}
          position={[0, item.y, d / 2 + 0.04]}
          fontSize={item.size}
          color={item.isMuted ? '#888899' : item.bold ? '#ffffff' : '#ccccdd'}
          anchorX="center"
          anchorY="middle"
          maxWidth={w * 0.8}
          textAlign="center"
          letterSpacing={item.bold ? 0.05 : 0.02}
        >
          {item.text}
        </Text>
      ))}

      {/* ===== BACK FACE (mirrored text) ===== */}
      <mesh position={[0, h / 2, -d / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w * 0.9, h * 0.9]} />
        <meshBasicMaterial color="#020208" transparent opacity={0.85} side={THREE.FrontSide} />
      </mesh>
      <mesh position={[0, h / 2, -d / 2 - 0.025]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w * 0.92, h * 0.92]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.12} side={THREE.FrontSide} />
      </mesh>
      {textElements.map((item, i) => (
        <Text
          key={`back-${i}`}
          position={[0, item.y, -d / 2 - 0.04]}
          rotation={[0, Math.PI, 0]}
          fontSize={item.size}
          color={item.isMuted ? '#888899' : item.bold ? '#ffffff' : '#ccccdd'}
          anchorX="center"
          anchorY="middle"
          maxWidth={w * 0.8}
          textAlign="center"
          letterSpacing={item.bold ? 0.05 : 0.02}
        >
          {item.text}
        </Text>
      ))}

      {/* ===== GROUND GLOW RING ===== */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[w * 0.7, w * 0.85, 32]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// ============================================================
// EXPORT ALL INFO TOWERS
// ============================================================

export const InfoTowers = () => {
  const [droneActive, setDroneActive] = useState(cameraMode.free);

  useEffect(() => {
    const handler = (e: CustomEvent) => setDroneActive(e.detail);
    window.addEventListener('drone-mode-changed', handler as EventListener);
    return () => window.removeEventListener('drone-mode-changed', handler as EventListener);
  }, []);

  return (
    <group>
      {TOWERS.map((tower) => (
        <InfoTower key={tower.label} data={tower} droneActive={droneActive} />
      ))}
    </group>
  );
};
