import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cameraMode } from '@/three/CameraRig';
import { startCombat, endCombat, gameState } from '@/three/gameState';

interface Telemetry {
  altitude: string;
  speed: string;
  x: string;
  z: string;
  yaw: string;
}

const DroneHUD = () => {
  const [active, setActive] = useState(cameraMode.free);
  const [combatActive, setCombatActive] = useState(gameState.combatActive);
  const [telemetry, setTelemetry] = useState<Telemetry>({ altitude: '0', speed: '0', x: '0', z: '0', yaw: '0' });
  const [pointerLocked, setPointerLocked] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onTelemetry = (e: CustomEvent) => setTelemetry(e.detail);
    window.addEventListener('drone-telemetry', onTelemetry as EventListener);

    const onDroneChanged = (e: CustomEvent) => {
      const isActive = e.detail;
      setActive(isActive);
      if (isActive) {
        setTimeout(() => {
          const el = document.getElementById('drone-overlay');
          if (el) el.requestPointerLock();
        }, 200);
      } else {
        if (document.pointerLockElement) document.exitPointerLock();
      }
    };
    window.addEventListener('drone-mode-changed', onDroneChanged as EventListener);

    const onPointerLockChange = () => {
      setPointerLocked(!!document.pointerLockElement);
    };
    document.addEventListener('pointerlockchange', onPointerLockChange);

    const onMouseMove = (e: MouseEvent) => {
      if (!cameraMode.free || !document.pointerLockElement) return;
      window.dispatchEvent(new CustomEvent('drone-mousemove', {
        detail: { dx: e.movementX, dy: e.movementY }
      }));
    };
    window.addEventListener('mousemove', onMouseMove);

    const onKeyDown = (e: KeyboardEvent) => {
      // F key starts combat
      if (e.key === 'f' || e.key === 'F') {
        if (cameraMode.free && !gameState.combatActive) {
          startCombat();
          setCombatActive(true);
        }
      }
      if (e.key === 'Escape' && cameraMode.free) {
        e.preventDefault();
        // If combat is active, end combat first
        if (gameState.combatActive) {
          endCombat();
          setCombatActive(false);
          return;
        }
        // Otherwise exit drone mode
        cameraMode.free = false;
        setActive(false);
        window.dispatchEvent(new CustomEvent('drone-toggle'));
        window.dispatchEvent(new CustomEvent('drone-mode-changed', { detail: false }));
        if (document.pointerLockElement) document.exitPointerLock();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    const onCombatStart = () => setCombatActive(true);
    const onCombatEnd = () => setCombatActive(false);
    window.addEventListener('combat-started', onCombatStart);
    window.addEventListener('combat-ended', onCombatEnd);

    return () => {
      window.removeEventListener('drone-telemetry', onTelemetry as EventListener);
      window.removeEventListener('drone-mode-changed', onDroneChanged as EventListener);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('combat-started', onCombatStart);
      window.removeEventListener('combat-ended', onCombatEnd);
    };
  }, []);

  const handleOverlayClick = () => {
    if (active && !document.pointerLockElement) {
      overlayRef.current?.requestPointerLock();
    }
  };

  // Don't render exploration HUD when combat is active — CombatHUD takes over
  if (combatActive) return null;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          ref={overlayRef}
          id="drone-overlay"
          className="fixed inset-0 z-[60] cursor-none select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={handleOverlayClick}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-6 h-6 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-2 bg-white/50" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-2 bg-white/50" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-px bg-white/50" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-px bg-white/50" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/80" />
            </div>
          </div>

          {/* Top bar — Mode & Exit hint */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-[11px] text-white/70 tracking-wider">
                EXPLORE MODE — Press <span className="text-cyan-400 font-bold">F</span> for Combat · <span className="text-white font-bold">ESC</span> to exit
              </span>
            </div>
          </div>

          {/* Click to lock prompt */}
          {!pointerLocked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="px-8 py-6 rounded-2xl text-center"
                style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <p className="font-mono text-white text-sm mb-2">Click to lock mouse</p>
                <p className="font-mono text-white/40 text-xs">Move mouse to look around</p>
              </div>
            </div>
          )}

          {/* Bottom-left — Telemetry */}
          <div className="absolute bottom-8 left-8 pointer-events-none">
            <div className="rounded-xl p-5 min-w-[200px]"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="font-mono text-[9px] tracking-[0.4em] text-white/30 uppercase mb-3">Telemetry</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Alt</span>
                  <span className="font-mono text-sm text-white/90">{telemetry.altitude}<span className="text-white/30 text-[10px] ml-1">m</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Speed</span>
                  <span className="font-mono text-sm text-white/90">{telemetry.speed}<span className="text-white/30 text-[10px] ml-1">u/s</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Hdg</span>
                  <span className="font-mono text-sm text-white/90">{telemetry.yaw}°</span>
                </div>
                <div className="h-px bg-white/5 my-1" />
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Pos</span>
                  <span className="font-mono text-xs text-white/60">{telemetry.x}, {telemetry.z}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom-right — Controls */}
          <div className="absolute bottom-8 right-8 pointer-events-none">
            <div className="rounded-xl p-5"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="font-mono text-[9px] tracking-[0.4em] text-white/30 uppercase mb-3">Controls</p>
              <div className="space-y-1.5 text-white/50 font-mono text-[11px]">
                <div className="flex gap-3"><span className="text-white/80 w-14">W A S D</span><span>Move</span></div>
                <div className="flex gap-3"><span className="text-white/80 w-14">Mouse</span><span>Look</span></div>
                <div className="flex gap-3"><span className="text-white/80 w-14">Space</span><span>Ascend</span></div>
                <div className="flex gap-3"><span className="text-white/80 w-14">C</span><span>Descend</span></div>
                <div className="flex gap-3"><span className="text-white/80 w-14">Shift</span><span>Turbo</span></div>
                <div className="flex gap-3"><span className="text-white/80 w-14">← → ↑ ↓</span><span>Rotate</span></div>
                <div className="h-px bg-white/10 my-1" />
                <div className="flex gap-3"><span className="text-cyan-400 w-14">F</span><span className="text-cyan-400">Combat Mode</span></div>
              </div>
            </div>
          </div>

          {/* Top-left — Tower Radar Minimap */}
          <div className="absolute top-20 left-8 pointer-events-none">
            <div className="rounded-xl p-4 w-[180px] h-[180px] relative overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="font-mono text-[8px] tracking-[0.4em] text-white/30 uppercase mb-2">Radar</p>
              <div className="absolute inset-4 top-8">
                <div className="w-full h-full relative border border-white/5 rounded">
                  <div className="absolute left-1/2 top-0 w-px h-full bg-white/5" />
                  <div className="absolute top-1/2 left-0 w-full h-px bg-white/5" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400"
                    style={{ boxShadow: '0 0 6px rgba(74,222,128,0.8)' }} />
                  {[
                    { label: 'ID', x: 20, z: 5, color: '#ff2a6d' },
                    { label: 'ED', x: -22, z: -5, color: '#05d9e8' },
                    { label: 'SK', x: 22, z: -18, color: '#b743e8' },
                    { label: 'P1', x: -20, z: -25, color: '#ff2a6d' },
                    { label: 'P2', x: 18, z: -40, color: '#05d9e8' },
                    { label: 'AC', x: -18, z: -48, color: '#ffb800' },
                    { label: 'CT', x: 15, z: -58, color: '#b743e8' },
                  ].map((t) => {
                    const px = ((t.x + 25) / 50) * 100;
                    const py = ((10 - t.z) / 90) * 100;
                    return (
                      <div key={t.label}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5"
                        style={{ left: `${px}%`, top: `${py}%` }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color, boxShadow: `0 0 4px ${t.color}` }} />
                        <span className="font-mono text-[6px] text-white/40">{t.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Edge vignette */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 150px rgba(0,0,0,0.5)' }} />

          {/* Scan lines */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { DroneHUD };
export default DroneHUD;
