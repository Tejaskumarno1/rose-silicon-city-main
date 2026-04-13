import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useRef, useEffect } from 'react';
import { WORLD_BOUNDS, gameState } from './gameState';
import { scrollProgressRef } from '@/hooks/useScrollProgress';

// Shared state
export const cameraMode = { free: false };

// ============================================================
// COLLISION MAP — all solid structures the drone cannot pass through
// ============================================================
const COLLISION_VOLUMES: { x: number; z: number; r: number; minY: number; maxY: number }[] = [
  // Info Towers
  { x: 20, z: 5, r: 4, minY: 0, maxY: 22 },
  { x: -22, z: -5, r: 4, minY: 0, maxY: 20 },
  { x: 22, z: -18, r: 4, minY: 0, maxY: 24 },
  { x: -20, z: -25, r: 4, minY: 0, maxY: 22 },
  { x: 18, z: -40, r: 4, minY: 0, maxY: 20 },
  { x: -18, z: -48, r: 4, minY: 0, maxY: 22 },
  { x: 15, z: -58, r: 3.5, minY: 0, maxY: 18 },
  // City buildings
  { x: 6, z: -4, r: 3, minY: 0, maxY: 15 },
  { x: -6, z: -2, r: 2.5, minY: 0, maxY: 14 },
  { x: -12, z: -5, r: 3, minY: 0, maxY: 18 },
  { x: 14, z: -8, r: 2, minY: 0, maxY: 25 },
  { x: -10, z: -14, r: 2.5, minY: 0, maxY: 21 },
  { x: -16, z: -18, r: 2, minY: 0, maxY: 28 },
  { x: 9, z: -16, r: 2.5, minY: 0, maxY: 15 },
  { x: -5, z: -20, r: 2.5, minY: 0, maxY: 14 },
  { x: 12, z: -22, r: 3, minY: 0, maxY: 18 },
  { x: 7, z: -10, r: 2, minY: 0, maxY: 12 },
  { x: 6, z: -28, r: 2.5, minY: 0, maxY: 14 },
  { x: -10, z: -26, r: 4, minY: 0, maxY: 18 },
  { x: -18, z: -30, r: 3, minY: 0, maxY: 18 },
  { x: -6, z: -34, r: 2, minY: 0, maxY: 26 },
  { x: 12, z: -32, r: 3, minY: 0, maxY: 21 },
  // SignalBeacon
  { x: 0, z: -65, r: 5, minY: 0, maxY: 20 },
  // HyperGate pillars
  { x: -4, z: 8, r: 2, minY: 0, maxY: 20 },
  { x: 4, z: 8, r: 2, minY: 0, maxY: 20 },
];

// Reusable temp objects to avoid per-frame allocations
const _quat = new THREE.Quaternion();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _thrust = new THREE.Vector3();
const _euler = new THREE.Euler();

export const CameraRig = () => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 5, 30));
  const targetLook = useRef(new THREE.Vector3(0, 7, 8));

  // ===== DRONE STATE =====
  const yaw = useRef(0);
  const pitch = useRef(0);
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef<Record<string, boolean>>({});
  const bobPhase = useRef(0);
  const shakeOffset = useRef(new THREE.Vector3());

  const path = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 5, 30),
      new THREE.Vector3(-3, 4, 8),
      new THREE.Vector3(3, 5, -12),
      new THREE.Vector3(-4, 4, -28),
      new THREE.Vector3(4, 5, -45),
      new THREE.Vector3(0, 5, -55),
    ]);
  }, []);

  const lookPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 7, 8),
      new THREE.Vector3(0, 4, -5),
      new THREE.Vector3(0, 4, -22),
      new THREE.Vector3(0, 4, -40),
      new THREE.Vector3(0, 6, -55),
      new THREE.Vector3(0, 15, -65),
    ]);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };

    const onDroneMouseMove = (e: CustomEvent) => {
      if (!cameraMode.free) return;
      const { dx, dy } = e.detail;
      yaw.current -= dx * 0.003;
      pitch.current -= dy * 0.003;
      pitch.current = Math.max(-1.2, Math.min(1.2, pitch.current));
    };

    const onDroneToggle = () => {
      if (cameraMode.free) {
        _euler.setFromQuaternion(camera.quaternion, 'YXZ');
        yaw.current = _euler.y;
        pitch.current = _euler.x;
        velocity.current.set(0, 0, 0);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('drone-mousemove', onDroneMouseMove as EventListener);
    window.addEventListener('drone-toggle', onDroneToggle);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('drone-mousemove', onDroneMouseMove as EventListener);
      window.removeEventListener('drone-toggle', onDroneToggle);
    };
  }, [camera]);

  // ============================================================
  // COLLISION CHECK
  // ============================================================
  const resolveCollisions = (pos: THREE.Vector3) => {
    const DRONE_RADIUS = 1.2;
    for (const vol of COLLISION_VOLUMES) {
      if (pos.y < vol.minY || pos.y > vol.maxY) continue;
      const dx = pos.x - vol.x;
      const dz = pos.z - vol.z;
      const distXZ = Math.sqrt(dx * dx + dz * dz);
      const minDist = vol.r + DRONE_RADIUS;

      if (distXZ < minDist) {
        if (distXZ < 0.001) {
          pos.x += minDist;
        } else {
          const pushFactor = (minDist - distXZ) / distXZ;
          pos.x += dx * pushFactor;
          pos.z += dz * pushFactor;
        }
        const nx = dx / (distXZ || 1);
        const nz = dz / (distXZ || 1);
        const dot = velocity.current.x * nx + velocity.current.z * nz;
        if (dot < 0) {
          velocity.current.x -= dot * nx;
          velocity.current.z -= dot * nz;
        }
      }
    }
  };

  useFrame((_, delta) => {
    if (cameraMode.free) {
      // ==============================
      // RC DRONE FLIGHT SIMULATION
      // ==============================
      const k = keys.current;
      const dt = Math.min(delta, 0.05);

      _quat.setFromEuler(_euler.set(pitch.current, yaw.current, 0, 'YXZ'));

      _forward.set(0, 0, -1).applyQuaternion(_quat);
      _right.set(1, 0, 0).applyQuaternion(_quat);
      _up.set(0, 1, 0);

      _thrust.set(0, 0, 0);
      const speed = k['ShiftLeft'] || k['ShiftRight'] ? 25 : 12;

      if (k['KeyW']) _thrust.add(_forward);
      if (k['KeyS']) _thrust.sub(_forward);
      if (k['KeyA']) _thrust.sub(_right);
      if (k['KeyD']) _thrust.add(_right);
      if (k['Space']) _thrust.add(_up);
      if (k['KeyC'] || k['ControlLeft']) _thrust.sub(_up);

      if (k['ArrowLeft']) yaw.current += 2.0 * dt;
      if (k['ArrowRight']) yaw.current -= 2.0 * dt;
      if (k['ArrowUp']) pitch.current += 1.2 * dt;
      if (k['ArrowDown']) pitch.current -= 1.2 * dt;
      pitch.current = Math.max(-1.2, Math.min(1.2, pitch.current));

      if (_thrust.lengthSq() > 0) {
        _thrust.normalize().multiplyScalar(speed * dt);
      }

      velocity.current.add(_thrust);
      velocity.current.multiplyScalar(0.92);

      camera.position.add(velocity.current);

      // Hover bob
      bobPhase.current += dt * 3;
      camera.position.y += Math.sin(bobPhase.current) * 0.005;

      // Floor clamp
      if (camera.position.y < WORLD_BOUNDS.minY) camera.position.y = WORLD_BOUNDS.minY;

      // === WORLD BOUNDARY CLAMP ===
      if (camera.position.x < WORLD_BOUNDS.minX + 1) {
        camera.position.x = WORLD_BOUNDS.minX + 1;
        velocity.current.x = Math.max(0, velocity.current.x);
      }
      if (camera.position.x > WORLD_BOUNDS.maxX - 1) {
        camera.position.x = WORLD_BOUNDS.maxX - 1;
        velocity.current.x = Math.min(0, velocity.current.x);
      }
      if (camera.position.z < WORLD_BOUNDS.minZ + 1) {
        camera.position.z = WORLD_BOUNDS.minZ + 1;
        velocity.current.z = Math.max(0, velocity.current.z);
      }
      if (camera.position.z > WORLD_BOUNDS.maxZ - 1) {
        camera.position.z = WORLD_BOUNDS.maxZ - 1;
        velocity.current.z = Math.min(0, velocity.current.z);
      }
      if (camera.position.y > WORLD_BOUNDS.maxY - 1) {
        camera.position.y = WORLD_BOUNDS.maxY - 1;
        velocity.current.y = Math.min(0, velocity.current.y);
      }

      // === BUILDING COLLISION ===
      resolveCollisions(camera.position);

      // === CAMERA SHAKE ===
      if (gameState.shakeIntensity > 0.01) {
        const s = gameState.shakeIntensity;
        shakeOffset.current.set(
          (Math.random() - 0.5) * s,
          (Math.random() - 0.5) * s,
          (Math.random() - 0.5) * s * 0.5
        );
        camera.position.add(shakeOffset.current);
      }

      // Apply rotation
      camera.quaternion.copy(_quat);

      // Store telemetry for boundary warning check
      const telData = {
        altitude: camera.position.y.toFixed(1),
        speed: (velocity.current.length() * 60).toFixed(1),
        x: camera.position.x.toFixed(0),
        z: camera.position.z.toFixed(0),
        yaw: ((yaw.current * 180 / Math.PI) % 360).toFixed(0),
      };
      (window as any).__droneTelemetry = telData;

      // Dispatch telemetry for the HUD
      window.dispatchEvent(new CustomEvent('drone-telemetry', { detail: telData }));

    } else {
      // ==============================
      // SCROLL-DRIVEN CAMERA — reads from ref, no React re-renders needed
      // ==============================
      const scrollProgress = scrollProgressRef.current;
      const t = Math.min(Math.max(scrollProgress, 0), 1);
      const pos = path.getPointAt(t);
      const look = lookPath.getPointAt(t);

      targetPos.current.lerp(pos, delta * 2);
      targetLook.current.lerp(look, delta * 2);

      camera.position.copy(targetPos.current);
      camera.lookAt(targetLook.current);
    }
  });

  return null;
};
