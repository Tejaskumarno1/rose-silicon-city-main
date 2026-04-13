import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { gameState, gameTick, fireBullet, fireRocket, UFO_CONFIGS, type UFO as UFOType, type PowerUp as PowerUpType, type Tower as TowerType } from './gameState';
import { cameraMode } from './CameraRig';

// Reusable temp objects — module scope to avoid GC
const _dir = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _up = new THREE.Vector3(0, 1, 0);
const _mat4 = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _scale = new THREE.Vector3(1, 1, 1);

// Power-up colors
const POWERUP_COLORS = {
  health: '#00ff88',
  shield: '#05d9e8',
  rapidfire: '#ffaa00',
} as const;

const POWERUP_LABELS = {
  health: '+HP',
  shield: '+SH',
  rapidfire: 'RAPID',
} as const;

// ============================================================
// SINGLE UFO COMPONENT
// ============================================================

const UFOMesh = ({ ufo }: { ufo: UFOType }) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const cfg = UFO_CONFIGS[ufo.type];

  useFrame((state) => {
    if (!groupRef.current || !ufo.alive) return;

    groupRef.current.position.set(...ufo.position);
    groupRef.current.rotation.y = state.clock.elapsedTime * 2;
    groupRef.current.rotation.z = Math.sin(ufo.phase) * 0.15;

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.15;
    }
  });

  if (!ufo.alive) return null;

  const hpPct = ufo.hp / ufo.maxHp;

  return (
    <group ref={groupRef}>
      {/* Main body */}
      <mesh>
        <dodecahedronGeometry args={[cfg.size, 1]} />
        <meshStandardMaterial
          color={cfg.color}
          emissive={cfg.color}
          emissiveIntensity={1.5}
          roughness={0.2}
          metalness={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Inner glow core */}
      <mesh ref={glowRef}>
        <dodecahedronGeometry args={[cfg.size * 1.15, 1]} />
        <meshBasicMaterial
          color={cfg.color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          wireframe
        />
      </mesh>

      {/* Point light */}
      <pointLight color={cfg.color} intensity={3} distance={15} decay={2} />

      {/* Health bar — Billboard */}
      <Billboard position={[0, cfg.size + 1.2, 0]}>
        {/* BG */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.2, 0.2]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.6} />
        </mesh>
        {/* HP fill */}
        <mesh position={[(hpPct - 1) * 1.05, 0, 0]}>
          <planeGeometry args={[2.1 * hpPct, 0.14]} />
          <meshBasicMaterial
            color={hpPct > 0.5 ? '#00ff88' : hpPct > 0.25 ? '#ffaa00' : '#ff3333'}
          />
        </mesh>
      </Billboard>

      {/* Type label */}
      <Billboard position={[0, cfg.size + 1.8, 0]}>
        <Text
          fontSize={0.25}
          color={cfg.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {ufo.type.toUpperCase()}
        </Text>
      </Billboard>
    </group>
  );
};

// ============================================================
// INSTANCED BULLET RENDERER (all player bullets in 1 draw call)
// ============================================================

const PlayerBullets = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const trailRef = useRef<THREE.InstancedMesh>(null);
  const MAX = 40;

  // Shared geometry + materials (created once)
  const bulletGeo = useMemo(() => new THREE.CylinderGeometry(0.06, 0.06, 2, 6), []);
  const trailGeo = useMemo(() => new THREE.CylinderGeometry(0.03, 0.01, 3, 4), []);
  const bulletMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#05d9e8', toneMapped: false, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending,
  }), []);
  const trailMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#05d9e8', toneMapped: false, transparent: true, opacity: 0.3,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }), []);

  useFrame(() => {
    const mesh = meshRef.current;
    const trail = trailRef.current;
    if (!mesh || !trail) return;

    let count = 0;
    for (let i = 0; i < gameState.bullets.length && count < MAX; i++) {
      const b = gameState.bullets[i];
      if (!b.alive) continue;

      // Orient along direction
      _dir.set(b.direction[0], b.direction[1], b.direction[2]).normalize();
      _quat.setFromUnitVectors(_up, _dir);

      // Bullet body
      _pos.set(b.position[0], b.position[1], b.position[2]);
      _mat4.compose(_pos, _quat, _scale);
      mesh.setMatrixAt(count, _mat4);

      // Trail behind
      _pos.set(
        b.position[0] - b.direction[0] * 1.5,
        b.position[1] - b.direction[1] * 1.5,
        b.position[2] - b.direction[2] * 1.5,
      );
      _mat4.compose(_pos, _quat, _scale);
      trail.setMatrixAt(count, _mat4);

      count++;
    }

    mesh.count = count;
    trail.count = count;
    if (count > 0) {
      mesh.instanceMatrix.needsUpdate = true;
      trail.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[bulletGeo, bulletMat, MAX]} frustumCulled={false} />
      <instancedMesh ref={trailRef} args={[trailGeo, trailMat, MAX]} frustumCulled={false} />
    </>
  );
};

// ============================================================
// INSTANCED ENEMY BULLET RENDERER (all enemy bullets in 1 draw call)
// ============================================================

const EnemyBullets = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const MAX = 80;

  const geo = useMemo(() => new THREE.CylinderGeometry(0.12, 0.04, 1.5, 6), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ff6644', toneMapped: false, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending,
  }), []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    let count = 0;
    for (let i = 0; i < gameState.enemyBullets.length && count < MAX; i++) {
      const eb = gameState.enemyBullets[i];
      if (!eb.alive) continue;

      _dir.set(eb.direction[0], eb.direction[1], eb.direction[2]).normalize();
      _quat.setFromUnitVectors(_up, _dir);
      _pos.set(eb.position[0], eb.position[1], eb.position[2]);
      _mat4.compose(_pos, _quat, _scale);
      mesh.setMatrixAt(count, _mat4);

      count++;
    }

    mesh.count = count;
    if (count > 0) {
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[geo, mat, MAX]} frustumCulled={false} />
  );
};

// ============================================================
// INSTANCED ROCKET RENDERER
// ============================================================

const PlayerRockets = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const trailRef = useRef<THREE.InstancedMesh>(null);
  const MAX = 10;

  const rocketGeo = useMemo(() => new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8), []);
  const trailGeo = useMemo(() => new THREE.SphereGeometry(0.4, 8, 8), []);
  
  const rocketMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffaa00', emissive: '#ff4400', emissiveIntensity: 2, toneMapped: false
  }), []);
  
  const trailMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ff6600', transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false
  }), []);

  useFrame(() => {
    const mesh = meshRef.current;
    const trail = trailRef.current;
    if (!mesh || !trail) return;

    let count = 0;
    for (let i = 0; i < gameState.rockets.length && count < MAX; i++) {
      const r = gameState.rockets[i];
      if (!r.alive) continue;

      _dir.set(r.velocity[0], r.velocity[1], r.velocity[2]).normalize();
      _quat.setFromUnitVectors(_up, _dir);
      _pos.set(r.position[0], r.position[1], r.position[2]);
      
      _mat4.compose(_pos, _quat, _scale);
      mesh.setMatrixAt(count, _mat4);

      // Trail
      _pos.set(
        r.position[0] - _dir.x * 0.8,
        r.position[1] - _dir.y * 0.8,
        r.position[2] - _dir.z * 0.8
      );
      const s = 1.0 + Math.random() * 0.5;
      _scale.set(s, s, s);
      _mat4.compose(_pos, _quat, _scale);
      trail.setMatrixAt(count, _mat4);
      _scale.set(1, 1, 1);

      count++;
    }

    mesh.count = count;
    trail.count = count;
    if (count > 0) {
      mesh.instanceMatrix.needsUpdate = true;
      trail.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[rocketGeo, rocketMat, MAX]} frustumCulled={false} />
      <instancedMesh ref={trailRef} args={[trailGeo, trailMat, MAX]} frustumCulled={false} />
    </>
  );
};

// ============================================================
// POWER-UP COMPONENT
// ============================================================

const PowerUpMesh = ({ powerUp }: { powerUp: PowerUpType }) => {
  const groupRef = useRef<THREE.Group>(null);
  const color = POWERUP_COLORS[powerUp.type];
  const label = POWERUP_LABELS[powerUp.type];

  useFrame((state) => {
    if (!groupRef.current || !powerUp.alive) return;
    groupRef.current.position.set(...powerUp.position);
    groupRef.current.rotation.y = state.clock.elapsedTime * 3;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.3;
  });

  if (!powerUp.alive) return null;

  // Blink when about to despawn (last 3 seconds)
  const blinking = powerUp.age > 12;

  return (
    <group ref={groupRef}>
      {/* Rotating cube */}
      <mesh>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={blinking ? (Math.sin(powerUp.age * 10) > 0 ? 4 : 1) : 3}
          roughness={0.1}
          metalness={0.9}
          toneMapped={false}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.3, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Label */}
      <Billboard position={[0, 1.5, 0]}>
        <Text
          fontSize={0.35}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          {label}
        </Text>
      </Billboard>

      <pointLight color={color} intensity={4} distance={10} decay={2} />
    </group>
  );
};

// ============================================================
// EXPLOSION COMPONENT (lightweight)
// ============================================================

const ExplosionMesh = ({ explosion }: { explosion: { position: [number, number, number]; age: number; alive: boolean; scale?: number } }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const s = (explosion.scale || 1.5) * (1 + explosion.age * 6);
  const opacity = Math.max(0, 1 - explosion.age * 2.5);

  if (!explosion.alive || opacity <= 0) return null;

  return (
    <mesh ref={meshRef} position={explosion.position} scale={[s, s, s]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial
        color="#ff6600"
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
};

// ============================================================
// MUZZLE FLASH
// ============================================================

const MuzzleFlash = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!meshRef.current) return;
    const show = gameState.muzzleFlashTimer > 0;
    meshRef.current.visible = show;
    if (show) {
      const dir = new THREE.Vector3(0, -0.15, -1.2);
      dir.applyQuaternion(camera.quaternion);
      meshRef.current.position.copy(camera.position).add(dir);
    }
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[0.15, 6, 6]} />
      <meshBasicMaterial
        color="#05d9e8"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
};

// ============================================================
// TOWER HEALTH INDICATOR (3D floating bar)
// ============================================================

const TowerHealthBar = ({ tower }: { tower: TowerType }) => {
  if (!tower.alive) return null;

  const hpPct = tower.hp / tower.maxHp;
  const barColor = hpPct > 0.5 ? '#00ff88' : hpPct > 0.25 ? '#ffaa00' : '#ff3333';

  return (
    <group position={[tower.position[0], tower.height + 3, tower.position[2]]}>
      <Billboard>
        {/* BG */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[3.5, 0.3]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.6} />
        </mesh>
        {/* HP fill */}
        <mesh position={[(hpPct - 1) * 1.65, 0, 0]}>
          <planeGeometry args={[3.3 * hpPct, 0.2]} />
          <meshBasicMaterial color={barColor} />
        </mesh>
        {/* Label */}
        <Text
          position={[0, 0.45, 0]}
          fontSize={0.35}
          color="#05d9e8"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          {tower.label}
        </Text>
        {/* Under attack indicator */}
        {hpPct < 1 && (
          <Text
            position={[0, -0.35, 0]}
            fontSize={0.2}
            color={barColor}
            anchorX="center"
            anchorY="middle"
          >
            {Math.round(hpPct * 100)}%
          </Text>
        )}
      </Billboard>

      {/* Pulsing light when damaged */}
      {hpPct < 0.5 && (
        <pointLight color="#ff3333" intensity={5} distance={10} decay={2} />
      )}
    </group>
  );
};

// ============================================================
// COMBAT SYSTEM — master component
// ============================================================

export const CombatSystem = () => {
  const { camera } = useThree();
  const [active, setActive] = useState(gameState.combatActive);
  const [, setRenderTick] = useState(0);
  const tickCount = useRef(0);

  // Listen for combat mode changes
  useEffect(() => {
    const onCombatStart = () => setActive(true);
    const onCombatEnd = () => setActive(false);
    const onDroneChange = (e: CustomEvent) => {
      if (!e.detail) setActive(false);
    };

    window.addEventListener('combat-started', onCombatStart);
    window.addEventListener('combat-ended', onCombatEnd);
    window.addEventListener('drone-mode-changed', onDroneChange as EventListener);

    return () => {
      window.removeEventListener('combat-started', onCombatStart);
      window.removeEventListener('combat-ended', onCombatEnd);
      window.removeEventListener('drone-mode-changed', onDroneChange as EventListener);
    };
  }, []);

  // Fire bullets on click event — use hoisted vectors
  useEffect(() => {
    const fireDir = new THREE.Vector3();
    const firePos = new THREE.Vector3();

    const onFire = () => {
      if (!gameState.combatActive || gameState.gameOver || gameState.countdownActive) return;
      fireDir.set(0, 0, -1).applyQuaternion(camera.quaternion);
      firePos.copy(camera.position).addScaledVector(fireDir, 1.5);

      fireBullet(
        [firePos.x, firePos.y, firePos.z] as [number, number, number],
        [fireDir.x, fireDir.y, fireDir.z] as [number, number, number]
      );
    };

    window.addEventListener('drone-fire', onFire);

    const onFireRocket = () => {
      if (!gameState.combatActive || gameState.gameOver || gameState.countdownActive) return;
      fireDir.set(0, 0, -1).applyQuaternion(camera.quaternion);
      firePos.copy(camera.position).addScaledVector(fireDir, 1.5);

      fireRocket(
        [firePos.x, firePos.y, firePos.z] as [number, number, number],
        [fireDir.x, fireDir.y, fireDir.z] as [number, number, number]
      );
    };

    window.addEventListener('drone-fire-rocket', onFireRocket);

    return () => {
      window.removeEventListener('drone-fire', onFire);
      window.removeEventListener('drone-fire-rocket', onFireRocket);
    };
  }, [camera]);

  useFrame((_, delta) => {
    if (!gameState.combatActive) return;

    const playerPos: [number, number, number] = [
      camera.position.x,
      camera.position.y,
      camera.position.z,
    ];

    gameTick(delta, playerPos);

    // Force React re-render at ~10fps for HUD (reduced from 15fps)
    tickCount.current++;
    if (tickCount.current % 6 === 0) {
      setRenderTick(t => t + 1);
    }
  });

  if (!active) return null;

  return (
    <group>
      {/* UFOs */}
      {gameState.enemies.map(ufo =>
        ufo.alive ? <UFOMesh key={ufo.id} ufo={ufo} /> : null
      )}

      {/* Player Bullets — single instanced draw call */}
      <PlayerBullets />

      {/* Enemy Bullets — single instanced draw call */}
      <EnemyBullets />

      {/* Player Rockets */}
      <PlayerRockets />

      {/* Power-Ups */}
      {gameState.powerUps.map(pu =>
        pu.alive ? <PowerUpMesh key={pu.id} powerUp={pu} /> : null
      )}

      {/* Explosions */}
      {gameState.explosions.map((exp, i) =>
        exp.alive ? <ExplosionMesh key={i} explosion={exp} /> : null
      )}

      {/* Tower Health Bars */}
      {gameState.towers.map(tower =>
        tower.alive ? <TowerHealthBar key={tower.id} tower={tower} /> : null
      )}

      {/* Muzzle Flash */}
      <MuzzleFlash />
    </group>
  );
};
