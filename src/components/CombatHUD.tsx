import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameState, startCombat, endCombat } from '@/three/gameState';
import { cameraMode } from '@/three/CameraRig';

// ============================================================
// COMBAT HUD — Full cockpit UI overlay
// ============================================================

const CombatHUD = () => {
  const [active, setActive] = useState(gameState.combatActive);
  const [health, setHealth] = useState(100);
  const [shield, setShield] = useState(0);
  const [score, setScore] = useState(0);
  const [ammo, setAmmo] = useState(50);
  const [wave, setWave] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [killFeed, setKillFeed] = useState<{ text: string; points: number; time: number }[]>([]);
  const [hitMarker, setHitMarker] = useState(false);
  const [criticalHit, setCriticalHit] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);
  const [waveAnnounce, setWaveAnnounce] = useState(0);
  const [nearBoundary, setNearBoundary] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [comboFlash, setComboFlash] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countdownActive, setCountdownActive] = useState(false);
  const [enemyCount, setEnemyCount] = useState(0);
  const [rapidFire, setRapidFire] = useState(false);
  const [lowHealthPulse, setLowHealthPulse] = useState(false);
  const [damageDir, setDamageDir] = useState<'left' | 'right' | 'top' | 'bottom' | null>(null);
  const [stats, setStats] = useState(gameState.stats);
  const [towers, setTowers] = useState(gameState.towers);
  const [gameOverReason, setGameOverReason] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync state from gameState at ~10fps (reduced for perf)
  const prevLens = useRef({ kf: 0, tw: 0 });
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameState.combatActive) return;
      setHealth(gameState.health);
      setShield(gameState.shield);
      setScore(gameState.score);
      setAmmo(gameState.ammo);
      setWave(gameState.wave);
      setGameOver(gameState.gameOver);
      setVictory(gameState.victory);
      setComboCount(gameState.comboCount);
      setComboMultiplier(gameState.comboMultiplier);
      setRapidFire(gameState.rapidFireTimer > 0);
      setLowHealthPulse(gameState.health > 0 && gameState.health <= 30);
      setCountdown(gameState.countdownValue);
      setCountdownActive(gameState.countdownActive);
      setStats({ ...gameState.stats });

      // Only copy arrays when their content actually changed
      if (gameState.killFeed.length !== prevLens.current.kf) {
        setKillFeed([...gameState.killFeed]);
        prevLens.current.kf = gameState.killFeed.length;
      }
      if (gameState.towers.length !== prevLens.current.tw || gameState.towers.some((t, i) => {
        const prev = towers[i];
        return prev && (t.hp !== prev.hp || t.alive !== prev.alive);
      })) {
        setTowers([...gameState.towers]);
        prevLens.current.tw = gameState.towers.length;
      }

      // Count alive enemies without .filter() allocation
      let aliveCount = 0;
      for (let i = 0; i < gameState.enemies.length; i++) {
        if (gameState.enemies[i].alive) aliveCount++;
      }
      setEnemyCount(aliveCount);

      // Boundary warning check
      const tel = (window as any).__droneTelemetry;
      if (tel) {
        const x = parseFloat(tel.x || '0');
        const z = parseFloat(tel.z || '0');
        setNearBoundary(Math.abs(x) > 70 || z > 40 || z < -110);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [towers]);

  // Events
  useEffect(() => {
    const onCombatStart = () => setActive(true);
    const onCombatEnd = () => {
      setActive(false);
      setGameOver(false);
      setVictory(false);
    };
    const onBulletHit = (e: CustomEvent) => {
      setHitMarker(true);
      if (e.detail?.critical) {
        setCriticalHit(true);
        setTimeout(() => setCriticalHit(false), 300);
      }
      setTimeout(() => setHitMarker(false), 150);
    };
    const onPlayerHit = () => {
      setDamageFlash(true);
      setTimeout(() => setDamageFlash(false), 300);

      // Directional indicator
      if (gameState.lastDamageDir) {
        const tel = (window as any).__droneTelemetry;
        if (tel) {
          const px = parseFloat(tel.x || '0');
          const pz = parseFloat(tel.z || '0');
          const ddx = gameState.lastDamageDir[0] - px;
          const ddz = gameState.lastDamageDir[2] - pz;
          if (Math.abs(ddx) > Math.abs(ddz)) {
            setDamageDir(ddx > 0 ? 'right' : 'left');
          } else {
            setDamageDir(ddz > 0 ? 'bottom' : 'top');
          }
          setTimeout(() => setDamageDir(null), 600);
        }
      }
    };
    const onWaveStart = (e: CustomEvent) => {
      setWaveAnnounce(e.detail);
      setTimeout(() => setWaveAnnounce(0), 2500);
    };
    const onPointerLock = () => setPointerLocked(!!document.pointerLockElement);
    const onGameOver = (e: CustomEvent) => {
      setGameOver(true);
      setGameOverReason(e.detail?.reason || 'Player destroyed');
    };
    const onVictory = () => setVictory(true);
    const onComboFlash = () => {
      setComboFlash(true);
      setTimeout(() => setComboFlash(false), 500);
    };

    // Listen for combo updates
    const onEnemyKilled = () => {
      if (gameState.comboCount >= 2) onComboFlash();
    };

    // Fire on mousedown when pointer is locked
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && document.pointerLockElement && gameState.combatActive && !gameState.gameOver && !gameState.countdownActive) {
        window.dispatchEvent(new CustomEvent('drone-fire'));
      }
    };

    window.addEventListener('combat-started', onCombatStart);
    window.addEventListener('combat-ended', onCombatEnd);
    window.addEventListener('bullet-hit', onBulletHit as EventListener);
    window.addEventListener('player-hit', onPlayerHit as EventListener);
    window.addEventListener('wave-started', onWaveStart as EventListener);
    window.addEventListener('game-over', onGameOver as EventListener);
    window.addEventListener('game-victory', onVictory);
    window.addEventListener('enemy-killed', onEnemyKilled);
    document.addEventListener('pointerlockchange', onPointerLock);
    document.addEventListener('mousedown', onMouseDown);

    return () => {
      window.removeEventListener('combat-started', onCombatStart);
      window.removeEventListener('combat-ended', onCombatEnd);
      window.removeEventListener('bullet-hit', onBulletHit as EventListener);
      window.removeEventListener('player-hit', onPlayerHit as EventListener);
      window.removeEventListener('wave-started', onWaveStart as EventListener);
      window.removeEventListener('game-over', onGameOver as EventListener);
      window.removeEventListener('game-victory', onVictory);
      window.removeEventListener('enemy-killed', onEnemyKilled);
      document.removeEventListener('pointerlockchange', onPointerLock);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  const handleClick = () => {
    // Don't fire or lock pointer during end screens
    if (gameOver || victory) return;

    if (active && pointerLocked) {
      window.dispatchEvent(new CustomEvent('drone-fire'));
    } else if (active && !pointerLocked && !countdownActive) {
      overlayRef.current?.requestPointerLock();
    }
  };

  if (!active) return null;

  const hpPct = (health / gameState.maxHealth) * 100;
  const shieldPct = (shield / 50) * 100;
  const ammoPct = (ammo / gameState.maxAmmo) * 100;
  const accuracy = stats.shotsFired > 0 ? Math.round((stats.shotsHit / stats.shotsFired) * 100) : 0;

  const panelStyle = {
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      ref={overlayRef}
      id="combat-overlay"
      className="fixed inset-0 z-[60] cursor-none select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onClick={handleClick}
      style={{ pointerEvents: 'auto' }}
    >
      {/* ===== LOW HEALTH PULSE ===== */}
      {lowHealthPulse && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-[1]"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ border: '3px solid rgba(255,0,0,0.5)', boxShadow: 'inset 0 0 60px rgba(255,0,0,0.2)' }}
        />
      )}

      {/* ===== DIRECTIONAL DAMAGE INDICATORS ===== */}
      {damageDir === 'left' && (
        <div className="absolute left-0 top-1/4 bottom-1/4 w-16 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(255,0,0,0.4), transparent)' }} />
      )}
      {damageDir === 'right' && (
        <div className="absolute right-0 top-1/4 bottom-1/4 w-16 pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgba(255,0,0,0.4), transparent)' }} />
      )}
      {damageDir === 'top' && (
        <div className="absolute top-0 left-1/4 right-1/4 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(255,0,0,0.4), transparent)' }} />
      )}
      {damageDir === 'bottom' && (
        <div className="absolute bottom-0 left-1/4 right-1/4 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(255,0,0,0.4), transparent)' }} />
      )}

      {/* ===== CROSSHAIR ===== */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-12 h-12 relative">
          {/* Outer ring */}
          <div className={`absolute inset-0 border rounded-full transition-all duration-100 ${hitMarker ? 'border-red-400 scale-90' : 'border-cyan-400/30'}`} />
          {/* Cross lines */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-cyan-400/60" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-3 bg-cyan-400/60" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-px bg-cyan-400/60" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-px bg-cyan-400/60" />
          {/* Center dot */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full ${criticalHit ? 'bg-yellow-400 w-2 h-2' : 'bg-cyan-400'}`} />
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/40" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/40" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/40" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/40" />
        </div>
        {/* Hit marker X */}
        {hitMarker && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6">
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 rotate-45 w-px h-2 ${criticalHit ? 'bg-yellow-400' : 'bg-red-400'}`} />
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 -rotate-45 w-px h-2 ${criticalHit ? 'bg-yellow-400' : 'bg-red-400'}`} />
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 -rotate-45 w-2 h-px ${criticalHit ? 'bg-yellow-400' : 'bg-red-400'}`} />
              <div className={`absolute right-0 top-1/2 -translate-y-1/2 rotate-45 w-2 h-px ${criticalHit ? 'bg-yellow-400' : 'bg-red-400'}`} />
            </div>
          </div>
        )}
        {/* Critical hit text */}
        <AnimatePresence>
          {criticalHit && (
            <motion.div
              className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <span className="font-mono text-xs text-yellow-400 font-bold tracking-wider">CRITICAL!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== COUNTDOWN OVERLAY ===== */}
      <AnimatePresence>
        {countdownActive && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-[65] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              {countdown > 0 ? (
                <motion.p
                  key={countdown}
                  className="font-mono text-8xl font-bold text-white"
                  style={{ textShadow: '0 0 40px rgba(5,217,232,0.8)' }}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {countdown}
                </motion.p>
              ) : (
                <motion.p
                  className="font-mono text-6xl font-bold text-cyan-400"
                  style={{ textShadow: '0 0 40px rgba(5,217,232,0.8)' }}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  ENGAGE!
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== COMBO COUNTER ===== */}
      <AnimatePresence>
        {comboCount >= 2 && !gameOver && !victory && (
          <motion.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none text-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: comboFlash ? 1.2 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-mono text-3xl font-bold text-yellow-400"
              style={{ textShadow: '0 0 20px rgba(255,170,0,0.6)' }}>
              {comboMultiplier}x COMBO
            </p>
            <p className="font-mono text-sm text-white/50 mt-1">{comboCount} kills</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== TOP BAR ===== */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-4">
        <div className="flex items-center gap-3 px-5 py-2 rounded-xl" style={panelStyle}>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-[11px] text-red-400 tracking-wider font-bold">
            COMBAT MODE
          </span>
          <span className="font-mono text-[10px] text-white/40 ml-2">
            ESC to exit
          </span>
        </div>
      </div>

      {/* ===== HEALTH BAR — Top Left ===== */}
      <div className="absolute top-4 left-6 pointer-events-none">
        <div className="rounded-xl p-4 min-w-[240px]" style={panelStyle}>
          {/* Health */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase">Shield</span>
            <span className={`font-mono text-sm font-bold ${hpPct > 50 ? 'text-green-400' : hpPct > 25 ? 'text-yellow-400' : 'text-red-400 animate-pulse'}`}>
              {health}
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                hpPct > 50 ? 'bg-green-400' : hpPct > 25 ? 'bg-yellow-400' : 'bg-red-500'
              }`}
              style={{ width: `${hpPct}%`, boxShadow: `0 0 8px ${hpPct > 50 ? '#4ade80' : hpPct > 25 ? '#facc15' : '#ef4444'}` }}
            />
          </div>

          {/* Shield bar (if active) */}
          {shield > 0 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[9px] tracking-[0.3em] text-cyan-400/50 uppercase">Shield</span>
                <span className="font-mono text-xs font-bold text-cyan-400">{shield}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-200"
                  style={{ width: `${shieldPct}%`, boxShadow: '0 0 6px rgba(5,217,232,0.5)' }}
                />
              </div>
            </>
          )}

          {/* Rapid fire indicator */}
          {rapidFire && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="font-mono text-[9px] text-yellow-400 tracking-wider">RAPID FIRE</span>
            </div>
          )}
        </div>
      </div>

      {/* ===== SCORE + WAVE — Top Right ===== */}
      <div className="absolute top-4 right-6 pointer-events-none">
        <div className="rounded-xl p-4 min-w-[200px] text-right" style={panelStyle}>
          <p className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase mb-1">Score</p>
          <p className="font-mono text-2xl font-bold text-cyan-400" style={{ textShadow: '0 0 12px rgba(5,217,232,0.5)' }}>
            {score.toLocaleString()}
          </p>
          <div className="h-px bg-white/5 my-2" />
          <div className="flex items-center justify-end gap-3">
            <span className="font-mono text-[9px] text-white/30 uppercase">Accuracy</span>
            <span className="font-mono text-sm text-white/70">{accuracy}%</span>
          </div>
        </div>
      </div>

      {/* ===== WAVE + ENEMY COUNT — Top Center ===== */}
      {wave > 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-4">
          <span className="font-mono text-[10px] tracking-[0.4em] text-white/30 uppercase">
            Wave {String(wave).padStart(2, '0')}/10
          </span>
          <span className="font-mono text-[10px] text-red-400/60">
            {enemyCount} {enemyCount === 1 ? 'enemy' : 'enemies'} remaining
          </span>
        </div>
      )}

      {/* ===== AMMO — Bottom Center ===== */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="rounded-xl px-6 py-3 flex items-center gap-4" style={panelStyle}>
          <span className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase">Ammo</span>
          <div className="flex items-center gap-2">
            <span className={`font-mono text-lg font-bold ${ammoPct > 20 ? 'text-cyan-400' : 'text-red-400 animate-pulse'}`}>
              {ammo}
            </span>
            <span className="font-mono text-[10px] text-white/30">/ {gameState.maxAmmo}</span>
          </div>
          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 bg-cyan-400"
              style={{ width: `${ammoPct}%`, boxShadow: '0 0 6px rgba(5,217,232,0.5)' }}
            />
          </div>
          <span className="font-mono text-[10px] text-white/30 ml-2">{formatTime(stats.timeSurvived)}</span>
        </div>
      </div>

      {/* ===== WAVE ANNOUNCEMENT ===== */}
      <AnimatePresence>
        {waveAnnounce > 0 && (
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none text-center"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-mono text-[10px] tracking-[0.5em] text-red-400/60 uppercase mb-1">Incoming</p>
            <p className="font-mono text-4xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(255,42,109,0.6)' }}>
              WAVE {String(waveAnnounce).padStart(2, '0')}
            </p>
            {waveAnnounce >= 5 && (
              <p className="font-mono text-xs text-red-400/50 mt-1 tracking-wider">⚠ MOTHERSHIPS DETECTED</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== KILL FEED — Right Side ===== */}
      <div className="absolute top-28 right-6 pointer-events-none space-y-1">
        <AnimatePresence>
          {killFeed.slice(-5).map((entry, i) => (
            <motion.div
              key={entry.time + i}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              {entry.points > 0 && (
                <span className="font-mono text-[10px] text-green-400">+{entry.points}</span>
              )}
              <span className={`font-mono text-[10px] ${entry.points > 0 ? 'text-white/60' : 'text-cyan-400'}`}>{entry.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ===== TOWER HEALTH BARS — Left Side ===== */}
      {towers.length > 0 && (
        <div className="absolute top-28 left-6 pointer-events-none space-y-1">
          <p className="font-mono text-[8px] tracking-[0.3em] text-white/25 uppercase mb-1.5">Towers</p>
          {towers.map(t => {
            const tHpPct = t.alive ? (t.hp / t.maxHp) * 100 : 0;
            return (
              <div key={t.id} className={`flex items-center gap-2 px-2 py-1 rounded-md ${!t.alive ? 'opacity-30' : ''}`}
                style={{ background: 'rgba(0,0,0,0.4)' }}>
                <span className="font-mono text-[8px] text-white/50 w-12 truncate">{t.label.slice(0, 6)}</span>
                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${tHpPct > 50 ? 'bg-green-400' : tHpPct > 25 ? 'bg-yellow-400' : 'bg-red-500'}`}
                    style={{ width: `${tHpPct}%` }}
                  />
                </div>
                {!t.alive && <span className="font-mono text-[7px] text-red-400">✕</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== MINIMAP / RADAR — Bottom Left ===== */}
      <div className="absolute bottom-6 left-6 pointer-events-none">
        <div className="rounded-xl p-3 w-[140px] h-[140px] relative overflow-hidden" style={panelStyle}>
          <p className="font-mono text-[7px] tracking-[0.4em] text-white/25 uppercase">Radar</p>
          <div className="absolute inset-3 top-6">
            <div className="w-full h-full relative border border-white/5 rounded-full">
              {/* Grid */}
              <div className="absolute left-1/2 top-0 w-px h-full bg-white/5" />
              <div className="absolute top-1/2 left-0 w-full h-px bg-white/5" />
              {/* Center = player */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400"
                style={{ boxShadow: '0 0 6px rgba(74,222,128,0.8)' }} />
              {/* Enemy dots */}
              {gameState.enemies.filter(e => e.alive).map(e => {
                const rx = ((e.position[0] + 80) / 160) * 100;
                const ry = ((50 - e.position[2]) / 170) * 100;
                return (
                  <div key={e.id}
                    className="absolute w-1.5 h-1.5 rounded-full bg-red-500 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${rx}%`, top: `${ry}%`, boxShadow: '0 0 4px #ef4444' }}
                  />
                );
              })}
              {/* Power-up dots */}
              {gameState.powerUps.filter(p => p.alive).map(p => {
                const rx = ((p.position[0] + 80) / 160) * 100;
                const ry = ((50 - p.position[2]) / 170) * 100;
                return (
                  <div key={p.id}
                    className="absolute w-1 h-1 rounded-full bg-yellow-400 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${rx}%`, top: `${ry}%` }}
                  />
                );
              })}
              {/* Tower dots */}
              {gameState.towers.filter(t => t.alive).map(t => {
                const rx = ((t.position[0] + 80) / 160) * 100;
                const ry = ((50 - t.position[2]) / 170) * 100;
                return (
                  <div key={t.id}
                    className="absolute w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${rx}%`, top: `${ry}%`, borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderBottom: '5px solid #05d9e8' }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONTROLS — Bottom Right ===== */}
      <div className="absolute bottom-6 right-6 pointer-events-none">
        <div className="rounded-lg px-3 py-2" style={{ ...panelStyle, opacity: 0.6 }}>
          <div className="space-y-1 text-white/40 font-mono text-[9px]">
            <div className="flex gap-2"><span className="text-white/60 w-12">L-Click</span><span>Fire</span></div>
            <div className="flex gap-2"><span className="text-white/60 w-12">W A S D</span><span>Move</span></div>
            <div className="flex gap-2"><span className="text-white/60 w-12">Space</span><span>Ascend</span></div>
            <div className="flex gap-2"><span className="text-white/60 w-12">Shift</span><span>Turbo</span></div>
          </div>
        </div>
      </div>

      {/* ===== BOUNDARY WARNING ===== */}
      <AnimatePresence>
        {nearBoundary && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <div className="px-6 py-3 rounded-xl" style={{ background: 'rgba(255,0,0,0.15)', border: '1px solid rgba(255,80,80,0.4)' }}>
              <span className="font-mono text-sm text-red-400 tracking-wider font-bold">
                ⚠ RETURN TO ZONE
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== DAMAGE FLASH ===== */}
      {damageFlash && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, transparent 50%, rgba(255,0,0,0.3) 100%)' }} />
      )}

      {/* ===== VICTORY SCREEN ===== */}
      <AnimatePresence>
        {victory && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-[70]"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center max-w-md">
              <motion.p
                className="font-mono text-[11px] tracking-[0.5em] text-cyan-400/60 uppercase mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Mission Complete
              </motion.p>
              <motion.p
                className="font-mono text-5xl font-bold text-cyan-400 mb-4"
                style={{ textShadow: '0 0 30px rgba(5,217,232,0.5)' }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                VICTORY!
              </motion.p>

              {/* Stats grid */}
              <motion.div
                className="grid grid-cols-2 gap-3 mb-6 text-left"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="px-4 py-3 rounded-lg" style={{ background: 'rgba(5,217,232,0.1)', border: '1px solid rgba(5,217,232,0.2)' }}>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Final Score</p>
                  <p className="font-mono text-lg font-bold text-cyan-400">{score.toLocaleString()}</p>
                </div>
                <div className="px-4 py-3 rounded-lg" style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)' }}>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Total Kills</p>
                  <p className="font-mono text-lg font-bold text-green-400">{stats.totalKills}</p>
                </div>
                <div className="px-4 py-3 rounded-lg" style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.2)' }}>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Accuracy</p>
                  <p className="font-mono text-lg font-bold text-yellow-400">{accuracy}%</p>
                </div>
                <div className="px-4 py-3 rounded-lg" style={{ background: 'rgba(255,42,109,0.1)', border: '1px solid rgba(255,42,109,0.2)' }}>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Best Combo</p>
                  <p className="font-mono text-lg font-bold text-pink-400">{stats.bestCombo}x</p>
                </div>
                <div className="px-4 py-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Time</p>
                  <p className="font-mono text-lg font-bold text-white/70">{formatTime(stats.timeSurvived)}</p>
                </div>
                <div className="px-4 py-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Power-Ups</p>
                  <p className="font-mono text-lg font-bold text-white/70">{stats.powerUpsCollected}</p>
                </div>
                <div className="px-4 py-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Towers Saved</p>
                  <p className={`font-mono text-lg font-bold ${stats.towersLost < 7 ? 'text-green-400' : 'text-red-400'}`}>{7 - stats.towersLost}/7</p>
                </div>
              </motion.div>

              {/* Kill breakdown */}
              <motion.div
                className="flex justify-center gap-4 mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="text-center">
                  <p className="font-mono text-[9px] text-green-400/50 uppercase">Scouts</p>
                  <p className="font-mono text-sm text-green-400">{stats.scoutsKilled}</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-[9px] text-yellow-400/50 uppercase">Cruisers</p>
                  <p className="font-mono text-sm text-yellow-400">{stats.cruisersKilled}</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-[9px] text-pink-400/50 uppercase">Motherships</p>
                  <p className="font-mono text-sm text-pink-400">{stats.mothershipsKilled}</p>
                </div>
              </motion.div>

              <div className="flex gap-4 justify-center">
                <button
                  className="px-6 py-3 rounded-xl font-mono text-sm text-white tracking-wider pointer-events-auto cursor-pointer transition-all hover:scale-105"
                  style={{ background: 'rgba(5,217,232,0.2)', border: '1px solid rgba(5,217,232,0.4)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (document.pointerLockElement) document.exitPointerLock();
                    startCombat();
                  }}
                >
                  PLAY AGAIN
                </button>
                <button
                  className="px-6 py-3 rounded-xl font-mono text-sm text-white/60 tracking-wider pointer-events-auto cursor-pointer transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (document.pointerLockElement) document.exitPointerLock();
                    endCombat();
                  }}
                >
                  EXIT
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== GAME OVER SCREEN ===== */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-[70]"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center max-w-md">
              <p className="font-mono text-[11px] tracking-[0.5em] text-red-400/60 uppercase mb-2">Mission Failed</p>
              <p className="font-mono text-5xl font-bold text-white mb-2" style={{ textShadow: '0 0 30px rgba(255,42,109,0.5)' }}>
                GAME OVER
              </p>
              <p className="font-mono text-xs text-red-400/60 mb-4">{gameOverReason}</p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-6 text-left">
                <div className="px-4 py-3 rounded-lg" style={{ background: 'rgba(5,217,232,0.1)', border: '1px solid rgba(5,217,232,0.2)' }}>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Final Score</p>
                  <p className="font-mono text-lg font-bold text-cyan-400">{score.toLocaleString()}</p>
                </div>
                <div className="px-4 py-3 rounded-lg" style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)' }}>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Total Kills</p>
                  <p className="font-mono text-lg font-bold text-green-400">{stats.totalKills}</p>
                </div>
                <div className="px-4 py-3 rounded-lg" style={{ background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.2)' }}>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Accuracy</p>
                  <p className="font-mono text-lg font-bold text-yellow-400">{accuracy}%</p>
                </div>
                <div className="px-4 py-3 rounded-lg" style={{ background: 'rgba(255,42,109,0.1)', border: '1px solid rgba(255,42,109,0.2)' }}>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Best Combo</p>
                  <p className="font-mono text-lg font-bold text-pink-400">{stats.bestCombo}x</p>
                </div>
                <div className="px-4 py-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Wave Reached</p>
                  <p className="font-mono text-lg font-bold text-white/70">{wave}/10</p>
                </div>
                <div className="px-4 py-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Towers Lost</p>
                  <p className={`font-mono text-lg font-bold ${stats.towersLost > 0 ? 'text-red-400' : 'text-green-400'}`}>{stats.towersLost}/7</p>
                </div>
              </div>

              {/* Kill breakdown */}
              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center">
                  <p className="font-mono text-[9px] text-green-400/50 uppercase">Scouts</p>
                  <p className="font-mono text-sm text-green-400">{stats.scoutsKilled}</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-[9px] text-yellow-400/50 uppercase">Cruisers</p>
                  <p className="font-mono text-sm text-yellow-400">{stats.cruisersKilled}</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-[9px] text-pink-400/50 uppercase">Motherships</p>
                  <p className="font-mono text-sm text-pink-400">{stats.mothershipsKilled}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  className="px-6 py-3 rounded-xl font-mono text-sm text-white tracking-wider pointer-events-auto cursor-pointer transition-all hover:scale-105"
                  style={{ background: 'rgba(5,217,232,0.2)', border: '1px solid rgba(5,217,232,0.4)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Ensure pointer is unlocked
                    if (document.pointerLockElement) document.exitPointerLock();
                    startCombat();
                  }}
                >
                  RETRY
                </button>
                <button
                  className="px-6 py-3 rounded-xl font-mono text-sm text-white/60 tracking-wider pointer-events-auto cursor-pointer transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (document.pointerLockElement) document.exitPointerLock();
                    endCombat();
                  }}
                >
                  EXIT
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Click to lock prompt ===== */}
      {!pointerLocked && !gameOver && !victory && !countdownActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="px-8 py-6 rounded-2xl text-center"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <p className="font-mono text-white text-sm mb-2">Click to lock mouse & fire</p>
            <p className="font-mono text-white/40 text-xs">Move mouse to aim</p>
          </div>
        </div>
      )}

      {/* ===== Vignette ===== */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.5)' }} />

      {/* ===== Scan lines ===== */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }} />
    </motion.div>
  );
};

export { CombatHUD };
export default CombatHUD;
