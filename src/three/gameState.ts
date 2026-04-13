// ============================================================
// GAME STATE — Central store for drone combat mode
// ============================================================

export interface UFO {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  hp: number;
  maxHp: number;
  type: 'scout' | 'cruiser' | 'mothership';
  alive: boolean;
  phase: number;
  shootCooldown: number; // seconds until next shot
  strafeDir: number; // for cruiser strafing AI
  targetMode: 'player' | 'tower'; // what this enemy is targeting
  targetTowerIdx: number; // which tower index to target (-1 = player)
}

export interface Tower {
  id: number;
  label: string;
  position: [number, number, number];
  hp: number;
  maxHp: number;
  alive: boolean;
  height: number;
}

// Tower positions matching InfoTowers.tsx
const TOWER_DATA: { label: string; position: [number, number, number]; height: number }[] = [
  { label: 'IDENTITY',     position: [20, 10, 5],   height: 20 },
  { label: 'EDUCATION',    position: [-22, 9, -5],  height: 18 },
  { label: 'SKILLS',       position: [22, 11, -18], height: 22 },
  { label: 'MAHAYUDH',     position: [-20, 10, -25], height: 20 },
  { label: 'TRAFFIC AI',   position: [18, 9, -40],  height: 18 },
  { label: 'ACHIEVEMENTS', position: [-18, 10, -48], height: 20 },
  { label: 'CONTACT',      position: [15, 8, -58],  height: 16 },
];

export interface Bullet {
  id: number;
  position: [number, number, number];
  direction: [number, number, number];
  alive: boolean;
  age: number;
  isCritical?: boolean;
}

export interface EnemyBullet {
  id: number;
  position: [number, number, number];
  direction: [number, number, number];
  alive: boolean;
  age: number;
  damage: number;
  color: string;
}

export interface Rocket {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  alive: boolean;
  age: number;
  targetId: number; // UFO id to track
}

export interface PowerUp {
  id: number;
  position: [number, number, number];
  type: 'health' | 'shield' | 'rapidfire';
  alive: boolean;
  age: number;
}

export interface Explosion {
  position: [number, number, number];
  age: number;
  alive: boolean;
  scale: number;
}

export interface KillFeedEntry {
  text: string;
  points: number;
  time: number;
  isCritical?: boolean;
}

export interface Dialogue {
  text: string;
  duration: number; // in seconds
  sender?: string;
}

export interface GameStats {
  totalKills: number;
  shotsFired: number;
  shotsHit: number;
  bestCombo: number;
  timeSurvived: number;
  scoutsKilled: number;
  cruisersKilled: number;
  mothershipsKilled: number;
  powerUpsCollected: number;
  damageDealt: number;
  damageTaken: number;
  towersLost: number;
}

// ============================================================
// WORLD BOUNDS — Expanded for more room
// ============================================================
export const WORLD_BOUNDS = {
  minX: -80, maxX: 80,
  minZ: -120, maxZ: 50,
  minY: 0.5, maxY: 80,
};

// ============================================================
// UFO TYPE CONFIGS
// ============================================================
const UFO_CONFIGS = {
  scout:      { hp: 25,  speed: 22,  size: 1.0, points: 100, color: '#00ff88', shootInterval: 1.4, bulletSpeed: 45, bulletDamage: 5,  bulletColor: '#00ff88' },
  cruiser:    { hp: 55,  speed: 14,  size: 1.6, points: 250, color: '#ffaa00', shootInterval: 0.9, bulletSpeed: 50, bulletDamage: 12, bulletColor: '#ffaa00' },
  mothership: { hp: 100, speed: 8,   size: 2.5, points: 500, color: '#ff3366', shootInterval: 0.6, bulletSpeed: 40, bulletDamage: 18, bulletColor: '#ff3366' },
} as const;

// Performance caps
const MAX_PLAYER_BULLETS = 40;
const MAX_ENEMY_BULLETS = 80;
const MAX_EXPLOSIONS = 10;

// Sound throttle — max plays per second for high-freq sounds
let lastEnemyShootSound = 0;
const soundThrottle: Record<string, number> = {};
const SOUND_MIN_INTERVAL: Record<string, number> = {
  shoot: 60,      // max ~16/sec
  hit: 50,        // max 20/sec  
  critical: 100,
  enemyshoot: 100, // max 10/sec
};

export { UFO_CONFIGS };

// ============================================================
// SOUND ENGINE — Web Audio API (no files needed)
// ============================================================
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function playSound(type: 'shoot' | 'hit' | 'kill' | 'damage' | 'powerup' | 'combo' | 'wave' | 'countdown' | 'victory' | 'gameover' | 'critical' | 'enemyshoot' | 'towerdamage' | 'rocket' | 'boost' | 'dialogue') {
  try {
    // Throttle high-frequency sounds to prevent audio node pile-up
    const minInterval = SOUND_MIN_INTERVAL[type];
    if (minInterval) {
      const now = performance.now();
      if (now - (soundThrottle[type] || 0) < minInterval) return;
      soundThrottle[type] = now;
    }

    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'shoot': {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'hit': {
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }
      case 'critical': {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        // Second tone
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1500, now + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        gain2.gain.setValueAtTime(0.07, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc2.start(now + 0.05);
        osc2.stop(now + 0.2);
        break;
      }
      case 'kill': {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case 'damage': {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'powerup': {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'combo': {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.15);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      case 'wave': {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
      case 'countdown': {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'victory': {
        // Arpeggiated win jingle
        const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
        notes.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + i * 0.12);
          g.gain.setValueAtTime(0.08, now + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
          o.start(now + i * 0.12);
          o.stop(now + i * 0.12 + 0.3);
        });
        break;
      }
      case 'gameover': {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
        break;
      }
      case 'enemyshoot': {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'towerdamage': {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
        break;
      }
      case 'rocket': {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.5);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
      case 'boost': {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'dialogue': {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
    }
  } catch {
    // Audio not available, ignore silently
  }
}

// ============================================================
// STATE
// ============================================================
let nextId = 0;

const MAX_WAVES = 10;

export const gameState = {
  combatActive: false,
  health: 150,
  maxHealth: 150,
  shield: 0, // bonus shield from power-ups
  score: 0,
  wave: 0,
  ammo: 60,
  maxAmmo: 60,
  ammoRechargeTimer: 0,
  rapidFireTimer: 0, // remaining seconds of rapid fire

  enemies: [] as UFO[],
  bullets: [] as Bullet[],
  enemyBullets: [] as EnemyBullet[],
  explosions: [] as Explosion[],
  powerUps: [] as PowerUp[],
  killFeed: [] as KillFeedEntry[],
  towers: [] as Tower[],

  // Advanced Combat
  rockets: [] as Rocket[],
  rocketCount: 5,
  maxRockets: 10,
  rocketRechargeTimer: 0,
  boostEnergy: 100,
  maxBoostEnergy: 100,
  isBoosting: false,

  // Narrative System
  dialogueQueue: [] as Dialogue[],
  currentDialogue: null as Dialogue | null,
  dialogueTimer: 0,

  waveTimer: 0,
  waveCooldown: 5,
  waveInProgress: false,
  gameOver: false,
  victory: false,

  // Combo system
  comboCount: 0,
  comboTimer: 0,   // seconds remaining for combo window
  comboMultiplier: 1,
  lastComboFlash: 0, // timestamp of last combo flash

  // Countdown
  countdownValue: 0, // 3, 2, 1, 0 = GO
  countdownActive: false,
  countdownTimer: 0,

  // Camera shake
  shakeIntensity: 0,

  // Muzzle flash
  muzzleFlashTimer: 0,

  // Directional damage
  lastDamageDir: [0, 0, 0] as [number, number, number],

  // Stats
  stats: {
    totalKills: 0,
    shotsFired: 0,
    shotsHit: 0,
    bestCombo: 0,
    timeSurvived: 0,
    scoutsKilled: 0,
    cruisersKilled: 0,
    mothershipsKilled: 0,
    powerUpsCollected: 0,
    damageDealt: 0,
    damageTaken: 0,
    towersLost: 0,
  } as GameStats,
};

// ============================================================
// ACTIONS
// ============================================================

export function startCombat() {
  gameState.combatActive = true;
  gameState.health = 150;
  gameState.maxHealth = 150;
  gameState.shield = 0;
  gameState.score = 0;
  gameState.wave = 0;
  gameState.ammo = 60;
  gameState.rapidFireTimer = 0;
  gameState.enemies = [];
  gameState.bullets = [];
  gameState.enemyBullets = [];
  gameState.explosions = [];
  gameState.powerUps = [];
  gameState.killFeed = [];
  gameState.waveInProgress = false;
  gameState.gameOver = false;
  gameState.victory = false;
  gameState.shakeIntensity = 0;
  gameState.comboCount = 0;
  gameState.comboTimer = 0;
  gameState.comboMultiplier = 1;
  gameState.muzzleFlashTimer = 0;
  gameState.lastDamageDir = [0, 0, 0];
  gameState.stats = {
    totalKills: 0, shotsFired: 0, shotsHit: 0, bestCombo: 0,
    timeSurvived: 0, scoutsKilled: 0, cruisersKilled: 0,
    mothershipsKilled: 0, powerUpsCollected: 0, damageDealt: 0, damageTaken: 0,
    towersLost: 0,
  };

  // Initialize towers from TOWER_DATA
  gameState.towers = TOWER_DATA.map((td, i) => ({
    id: nextId++,
    label: td.label,
    position: [...td.position] as [number, number, number],
    hp: 150,
    maxHp: 150,
    alive: true,
    height: td.height,
  }));

  // Release pointer lock so UI is usable after restart
  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  // Start countdown
  gameState.countdownActive = true;
  gameState.countdownValue = 3;
  gameState.countdownTimer = 1.0;
  playSound('countdown');

  gameState.rocketCount = 5;
  gameState.rocketRechargeTimer = 0;
  gameState.boostEnergy = 100;
  gameState.isBoosting = false;
  gameState.rockets = [];
  gameState.dialogueQueue = [];
  gameState.currentDialogue = null;
  gameState.dialogueTimer = 0;

  // Initial welcome dialogue
  triggerDialogue("SYSTEM ONLINE. City defense protocols initialized by TEJAS.", 4);

  window.dispatchEvent(new CustomEvent('combat-started'));
}

export function endCombat() {
  gameState.combatActive = false;
  gameState.gameOver = false;
  gameState.victory = false;
  
  // Release pointer lock so UI is usable
  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  window.dispatchEvent(new CustomEvent('combat-ended'));
}

export function triggerDialogue(text: string, duration = 3) {
  gameState.dialogueQueue.push({ text, duration });
  if (gameState.dialogueQueue.length > 5) gameState.dialogueQueue.shift();
}

export function fireRocket(pos: [number, number, number], dir: [number, number, number]) {
  if (gameState.rocketCount <= 0 || gameState.countdownActive) return;

  gameState.rocketCount--;
  gameState.muzzleFlashTimer = 0.1;

  // Find target (nearest alive enemy)
  let bestTarget = -1;
  let minDistSq = 10000;
  for (const ufo of gameState.enemies) {
    if (!ufo.alive) continue;
    const dx = ufo.position[0] - pos[0];
    const dy = ufo.position[1] - pos[1];
    const dz = ufo.position[2] - pos[2];
    const dSq = dx * dx + dy * dy + dz * dz;
    if (dSq < minDistSq) {
      minDistSq = dSq;
      bestTarget = ufo.id;
    }
  }

  gameState.rockets.push({
    id: nextId++,
    position: [...pos],
    velocity: [dir[0] * 30, dir[1] * 30, dir[2] * 30],
    alive: true,
    age: 0,
    targetId: bestTarget
  });

  playSound('rocket');
}

export function fireBullet(pos: [number, number, number], dir: [number, number, number]) {
  if (gameState.ammo <= 0) return;
  if (gameState.countdownActive) return; // can't fire during countdown

  gameState.ammo--;
  gameState.stats.shotsFired++;
  gameState.muzzleFlashTimer = 0.06;

  // 15% critical hit chance
  const isCritical = Math.random() < 0.15;

  // Cap player bullets to prevent array bloat
  if (gameState.bullets.length >= MAX_PLAYER_BULLETS) {
    // Recycle oldest dead bullet or skip
    const dead = gameState.bullets.findIndex(b => !b.alive);
    if (dead >= 0) {
      const b = gameState.bullets[dead];
      b.id = nextId++;
      b.position = [...pos];
      b.direction = [...dir];
      b.alive = true;
      b.age = 0;
      b.isCritical = isCritical;
    } else {
      // All alive — force-kill oldest
      gameState.bullets[0].alive = false;
      gameState.bullets.push({
        id: nextId++, position: [...pos], direction: [...dir],
        alive: true, age: 0, isCritical,
      });
    }
  } else {
    gameState.bullets.push({
      id: nextId++, position: [...pos], direction: [...dir],
      alive: true, age: 0, isCritical,
    });
  }

  playSound('shoot');
}

function fireEnemyBullet(ufo: UFO, targetPos: [number, number, number]) {
  const cfg = UFO_CONFIGS[ufo.type];
  if (cfg.shootInterval === 0) return;

  const dx = targetPos[0] - ufo.position[0];
  const dy = targetPos[1] - ufo.position[1];
  const dz = targetPos[2] - ufo.position[2];
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (dist < 0.01) return;

  const dirX = dx / dist;
  const dirY = dy / dist;
  const dirZ = dz / dist;

  // Don't exceed enemy bullet cap
  if (gameState.enemyBullets.length >= MAX_ENEMY_BULLETS) return;

  // Motherships fire 3-bullet spread barrages (reduced from 5 for perf)
  if (ufo.type === 'mothership') {
    const spread = 0.12;
    for (let i = -1; i <= 1; i++) {
      gameState.enemyBullets.push({
        id: nextId++,
        position: [...ufo.position],
        direction: [dirX + i * spread, dirY + (Math.random() - 0.5) * 0.02, dirZ + i * spread * 0.5],
        alive: true, age: 0,
        damage: cfg.bulletDamage,
        color: cfg.bulletColor,
      });
    }
  } else {
    // Cruisers + Scouts: single accurate shot
    const inaccuracy = ufo.type === 'cruiser' ? 0.02 : 0.03;
    gameState.enemyBullets.push({
      id: nextId++,
      position: [...ufo.position],
      direction: [
        dirX + (Math.random() - 0.5) * inaccuracy,
        dirY + (Math.random() - 0.5) * inaccuracy,
        dirZ + (Math.random() - 0.5) * inaccuracy,
      ],
      alive: true, age: 0,
      damage: cfg.bulletDamage,
      color: cfg.bulletColor,
    });
  }

  // Throttle enemy shoot sound to max 10/second
  const now = performance.now();
  if (now - lastEnemyShootSound > 100) {
    playSound('enemyshoot');
    lastEnemyShootSound = now;
  }
}

export function spawnWave() {
  gameState.wave++;
  gameState.waveInProgress = true;

  const w = gameState.wave;
  const count = Math.min(3 + w * 2, 16); // scale more aggressively, cap at 16

  // Decide tower targeting: find alive towers for assignments
  const aliveTowers = gameState.towers.filter(t => t.alive);

  for (let i = 0; i < count; i++) {
    let type: UFO['type'] = 'scout';
    if (w >= 3 && i % 3 === 0) type = 'cruiser';
    if (w >= 5 && i === 0) type = 'mothership';
    if (w >= 8 && i % 4 === 0) type = 'mothership';

    const cfg = UFO_CONFIGS[type];

    // Decide target: scouts always chase player, cruisers 50/50, motherships prefer towers
    let targetMode: UFO['targetMode'] = 'player';
    let targetTowerIdx = -1;
    if (aliveTowers.length > 0) {
      if (type === 'mothership') {
        // Motherships: 70% tower, 30% player
        if (Math.random() < 0.7) {
          targetMode = 'tower';
          targetTowerIdx = Math.floor(Math.random() * aliveTowers.length);
        }
      } else if (type === 'cruiser') {
        // Cruisers: 50% tower, 50% player
        if (Math.random() < 0.5) {
          targetMode = 'tower';
          targetTowerIdx = Math.floor(Math.random() * aliveTowers.length);
        }
      }
      // Scouts: always player
    }

    // Spawn from edges of expanded world
    const edge = Math.floor(Math.random() * 4);
    let x = 0, z = 0;
    const y = 8 + Math.random() * 20;

    switch (edge) {
      case 0: x = WORLD_BOUNDS.minX - 10; z = -40 + Math.random() * 80; break;
      case 1: x = WORLD_BOUNDS.maxX + 10; z = -40 + Math.random() * 80; break;
      case 2: z = WORLD_BOUNDS.maxZ + 10; x = -40 + Math.random() * 80; break;
      case 3: z = WORLD_BOUNDS.minZ - 10; x = -40 + Math.random() * 80; break;
    }

    gameState.enemies.push({
      id: nextId++,
      position: [x, y, z],
      velocity: [0, 0, 0],
      hp: cfg.hp + (w - 1) * 10,
      maxHp: cfg.hp + (w - 1) * 10,
      type,
      alive: true,
      phase: Math.random() * Math.PI * 2,
      shootCooldown: cfg.shootInterval * 0.5 + Math.random() * 0.5, // fire sooner
      strafeDir: Math.random() > 0.5 ? 1 : -1,
      targetMode,
      targetTowerIdx,
    });
  }

  playSound('wave');
  window.dispatchEvent(new CustomEvent('wave-started', { detail: gameState.wave }));
}

function spawnPowerUp(position: [number, number, number]) {
  // 35% chance to drop a power-up (higher to balance deadly enemies)
  if (Math.random() > 0.35) return;

  const types: PowerUp['type'][] = ['health', 'shield', 'rapidfire'];
  const type = types[Math.floor(Math.random() * types.length)];

  gameState.powerUps.push({
    id: nextId++,
    position: [...position],
    type,
    alive: true,
    age: 0,
  });
}

function collectPowerUp(powerUp: PowerUp) {
  powerUp.alive = false;
  gameState.stats.powerUpsCollected++;

  switch (powerUp.type) {
    case 'health':
      gameState.health = Math.min(gameState.maxHealth, gameState.health + 50);
      break;
    case 'shield':
      gameState.shield = Math.min(50, gameState.shield + 25);
      break;
    case 'rapidfire':
      gameState.rapidFireTimer = 8; // 8 seconds of rapid fire
      break;
  }

  playSound('powerup');
  gameState.killFeed.push({
    text: `${powerUp.type.toUpperCase()} COLLECTED`,
    points: 0,
    time: Date.now(),
  });
  window.dispatchEvent(new CustomEvent('powerup-collected', { detail: powerUp.type }));
}

export function damagePlayer(amount: number, fromPos?: [number, number, number]) {
  // Shield absorbs damage first
  if (gameState.shield > 0) {
    const absorbed = Math.min(gameState.shield, amount);
    gameState.shield -= absorbed;
    amount -= absorbed;
  }

  gameState.health = Math.max(0, gameState.health - amount);
  gameState.stats.damageTaken += amount;
  gameState.shakeIntensity = 0.5;

  // Track damage direction for HUD indicator
  if (fromPos) {
    gameState.lastDamageDir = [...fromPos];
  }

  playSound('damage');
  window.dispatchEvent(new CustomEvent('player-hit', { detail: gameState.health }));

  if (gameState.health <= 0) {
    triggerGameOver('Player destroyed');
  } else if (gameState.health < 40 && amount > 0) {
    // Low health warning (once every 10s max)
    const now = performance.now();
    if (now - (soundThrottle['health_alert'] || 0) > 10000) {
      triggerDialogue("WARNING: Hull integrity compromised. Evasive maneuvers required, Tejas!", 4);
      soundThrottle['health_alert'] = now;
    }
  }
}

function damageTower(towerId: number, amount: number) {
  const tower = gameState.towers.find(t => t.id === towerId);
  if (!tower || !tower.alive) return;

  tower.hp = Math.max(0, tower.hp - amount);

  if (tower.hp <= 0) {
    tower.alive = false;
    gameState.stats.towersLost++;

    // Explosion at tower position
    gameState.explosions.push({
      position: [...tower.position] as [number, number, number],
      age: 0,
      alive: true,
      scale: 3.0,
    });

    gameState.killFeed.push({
      text: `⚠ ${tower.label} TOWER DESTROYED`,
      points: 0,
      time: Date.now(),
    });

    playSound('towerdamage');
    gameState.shakeIntensity = 0.8;
    window.dispatchEvent(new CustomEvent('tower-destroyed', { detail: tower.label }));
    triggerDialogue(`CRITICAL: Tower ${tower.label} has been neutralized! Defense grid failing.`);

    // Check if ALL towers destroyed — game over
    const aliveTowerCount = gameState.towers.filter(t => t.alive).length;
    if (aliveTowerCount === 0) {
      triggerGameOver('All towers destroyed');
    }
  } else {
    // Emit tower-hit for HUD effects
    window.dispatchEvent(new CustomEvent('tower-hit', { detail: { id: towerId, hp: tower.hp } }));
  }
}

function triggerGameOver(reason: string) {
  gameState.gameOver = true;

  // Release pointer lock so buttons are clickable
  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  playSound('gameover');
  window.dispatchEvent(new CustomEvent('game-over', { detail: { score: gameState.score, reason } }));
}

function addCombo() {
  gameState.comboCount++;
  gameState.comboTimer = 3.0; // 3 second window

  if (gameState.comboCount >= 2) {
    gameState.comboMultiplier = Math.min(4, 1 + Math.floor(gameState.comboCount / 2));
    gameState.lastComboFlash = Date.now();
    playSound('combo');
  }

  if (gameState.comboCount > gameState.stats.bestCombo) {
    gameState.stats.bestCombo = gameState.comboCount;
  }
}

export function killEnemy(enemy: UFO) {
  enemy.alive = false;
  const cfg = UFO_CONFIGS[enemy.type];
  const basePoints = cfg.points;

  // Apply combo multiplier
  addCombo();
  const points = basePoints * gameState.comboMultiplier;
  gameState.score += points;

  // Stats
  gameState.stats.totalKills++;
  if (enemy.type === 'scout') gameState.stats.scoutsKilled++;
  if (enemy.type === 'cruiser') gameState.stats.cruisersKilled++;
  if (enemy.type === 'mothership') gameState.stats.mothershipsKilled++;

  // Explosion
  gameState.explosions.push({
    position: [...enemy.position] as [number, number, number],
    age: 0,
    alive: true,
    scale: cfg.size,
  });

  // Power-up drop
  spawnPowerUp(enemy.position);

  // Kill feed
  const comboSuffix = gameState.comboMultiplier > 1 ? ` (${gameState.comboMultiplier}x)` : '';
  gameState.killFeed.push({
    text: `${enemy.type.toUpperCase()} DESTROYED${comboSuffix}`,
    points,
    time: Date.now(),
  });

  if (gameState.killFeed.length > 6) gameState.killFeed.shift();

  gameState.shakeIntensity = 0.3;
  playSound('kill');
  window.dispatchEvent(new CustomEvent('enemy-killed', { detail: { type: enemy.type, points } }));
}

// ============================================================
// TICK — called every frame from CombatSystem
// ============================================================
export function gameTick(delta: number, playerPos: [number, number, number]) {
  if (!gameState.combatActive) return;

  const dt = Math.min(delta, 0.05);

  // === COUNTDOWN ===
  if (gameState.countdownActive) {
    gameState.countdownTimer -= dt;
    if (gameState.countdownTimer <= 0) {
      gameState.countdownValue--;
      if (gameState.countdownValue > 0) {
        gameState.countdownTimer = 1.0;
        playSound('countdown');
      } else if (gameState.countdownValue === 0) {
        // "ENGAGE" shown for 1 second
        gameState.countdownTimer = 1.0;
        playSound('wave');
      } else {
        // Countdown done
        gameState.countdownActive = false;
        gameState.waveTimer = 0.5; // short delay before first wave
      }
    }
    return; // no game logic during countdown
  }

  if (gameState.gameOver || gameState.victory) return;

  // === TIME TRACKING ===
  gameState.stats.timeSurvived += dt;

  // === COMBO DECAY ===
  if (gameState.comboTimer > 0) {
    gameState.comboTimer -= dt;
    if (gameState.comboTimer <= 0) {
      gameState.comboCount = 0;
      gameState.comboMultiplier = 1;
    }
  }

  // === RAPID FIRE DECAY ===
  if (gameState.rapidFireTimer > 0) {
    gameState.rapidFireTimer -= dt;
  }

  // === MUZZLE FLASH DECAY ===
  if (gameState.muzzleFlashTimer > 0) {
    gameState.muzzleFlashTimer -= dt;
  }

  // === AMMO RECHARGE — fast reload ===
  const rechargeRate = gameState.rapidFireTimer > 0 ? 0.08 : 0.18;
  gameState.ammoRechargeTimer += dt;
  if (gameState.ammoRechargeTimer >= rechargeRate && gameState.ammo < gameState.maxAmmo) {
    // Recharge 2 at a time during rapid fire
    const rechargeAmount = gameState.rapidFireTimer > 0 ? 2 : 1;
    gameState.ammo = Math.min(gameState.maxAmmo, gameState.ammo + rechargeAmount);
    gameState.ammoRechargeTimer = 0;
  }

  // === WAVE SPAWNING ===
  const aliveEnemies = gameState.enemies.filter(e => e.alive);

  // Victory check
  if (gameState.wave >= MAX_WAVES && aliveEnemies.length === 0 && gameState.waveInProgress) {
    gameState.victory = true;
    gameState.waveInProgress = false;

    // Release pointer lock for victory screen buttons
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    playSound('victory');
    window.dispatchEvent(new CustomEvent('game-victory', { detail: gameState.score }));
    return;
  }

  if (aliveEnemies.length === 0 && !gameState.waveInProgress && gameState.wave < MAX_WAVES) {
    gameState.waveTimer -= dt;
    if (gameState.waveTimer <= 0) {
      spawnWave();
      gameState.waveCooldown = Math.max(2, 4 - gameState.wave * 0.2);
      
      // Narrative milestones
      if (gameState.wave === 3) triggerDialogue("District 03 secured. Portfolio projects are uploading to the cloud.");
      if (gameState.wave === 5) triggerDialogue("Motherships detected. High-level AI architectures approaching!");
      if (gameState.wave === 8) triggerDialogue("Final wave approaching. Show them what Silicon City can do, Tejas!", 5);
    }
  }
  if (aliveEnemies.length === 0 && gameState.waveInProgress && gameState.wave > 0) {
    gameState.waveInProgress = false;
    gameState.waveTimer = gameState.waveCooldown;
  }

  // === UPDATE ENEMIES ===
  for (const ufo of gameState.enemies) {
    if (!ufo.alive) continue;

    ufo.phase += dt;
    const cfg = UFO_CONFIGS[ufo.type];

    // Determine actual target position
    let targetPos: [number, number, number] = playerPos;
    let targetIsTower = false;

    // Check if assigned tower is still alive, otherwise switch to player
    if (ufo.targetMode === 'tower' && ufo.targetTowerIdx >= 0) {
      const aliveTowers = gameState.towers.filter(t => t.alive);
      if (aliveTowers.length > 0) {
        const tIdx = Math.min(ufo.targetTowerIdx, aliveTowers.length - 1);
        targetPos = aliveTowers[tIdx].position;
        targetIsTower = true;
      } else {
        // No towers left — switch to player
        ufo.targetMode = 'player';
        ufo.targetTowerIdx = -1;
      }
    }

    const dx = targetPos[0] - ufo.position[0];
    const dy = targetPos[1] - ufo.position[1];
    const dz = targetPos[2] - ufo.position[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const ndx = dist > 0.01 ? dx / dist : 0;
    const ndy = dist > 0.01 ? dy / dist : 0;
    const ndz = dist > 0.01 ? dz / dist : 0;

    // Also track distance to PLAYER (for contact damage regardless of target)
    const pDx = playerPos[0] - ufo.position[0];
    const pDy = playerPos[1] - ufo.position[1];
    const pDz = playerPos[2] - ufo.position[2];
    const playerDist = Math.sqrt(pDx * pDx + pDy * pDy + pDz * pDz);

    // Per-type AI behavior
    if (ufo.type === 'scout') {
      // Scouts: relentless rush — always charge at full speed
      const steer = cfg.speed * 2.0;
      ufo.velocity[0] += ndx * steer * dt;
      ufo.velocity[1] += ndy * steer * dt * 0.6;
      ufo.velocity[2] += ndz * steer * dt;

      // Aggressive zig-zag when close to dodge player fire
      if (dist < 30) {
        ufo.velocity[0] += Math.sin(ufo.phase * 6) * dt * 6;
        ufo.velocity[2] += Math.cos(ufo.phase * 5) * dt * 5;
      }
    } else if (ufo.type === 'cruiser') {
      if (dist > 20) {
        // Rush in fast to get into firing range
        const steer = cfg.speed * 1.5;
        ufo.velocity[0] += ndx * steer * dt;
        ufo.velocity[1] += ndy * steer * dt * 0.5;
        ufo.velocity[2] += ndz * steer * dt;
      } else {
        // Strafe while shooting — aggressive orbit
        const perpX = -ndz;
        const perpZ = ndx;
        ufo.velocity[0] += perpX * cfg.speed * ufo.strafeDir * dt * 3;
        ufo.velocity[2] += perpZ * cfg.speed * ufo.strafeDir * dt * 3;
        const distForce = (dist - 15) * 0.5;
        ufo.velocity[0] += ndx * distForce * dt;
        ufo.velocity[2] += ndz * distForce * dt;
        if (Math.sin(ufo.phase * 0.8) > 0.9) ufo.strafeDir *= -1;
      }
    } else if (ufo.type === 'mothership') {
      if (dist > 25) {
        const steer = cfg.speed * 1.2;
        ufo.velocity[0] += ndx * steer * dt;
        ufo.velocity[1] += ndy * steer * dt * 0.3;
        ufo.velocity[2] += ndz * steer * dt;
      } else {
        // Closer orbit — stay aggressive
        ufo.velocity[0] += Math.sin(ufo.phase * 0.5) * dt * 4;
        ufo.velocity[2] += Math.cos(ufo.phase * 0.6) * dt * 4;
        const distForce = (dist - 20) * 0.4;
        ufo.velocity[0] += ndx * distForce * dt;
        ufo.velocity[2] += ndz * distForce * dt;
      }
      // Motherships bob aggressively
      ufo.velocity[1] += Math.sin(ufo.phase * 2) * dt * 2.5;
    }

    // Apply velocity
    ufo.position[0] += ufo.velocity[0] * dt;
    ufo.position[1] += ufo.velocity[1] * dt;
    ufo.position[2] += ufo.velocity[2] * dt;

    // Drag — lower drag = enemies maintain momentum and feel faster
    ufo.velocity[0] *= 0.97;
    ufo.velocity[1] *= 0.96;
    ufo.velocity[2] *= 0.97;

    // Clamp Y
    ufo.position[1] = Math.max(3, Math.min(65, ufo.position[1]));

    // Limit speed — allow up to 3x base speed
    const spd = Math.sqrt(ufo.velocity[0] ** 2 + ufo.velocity[1] ** 2 + ufo.velocity[2] ** 2);
    if (spd > cfg.speed * 3) {
      const scale = (cfg.speed * 3) / spd;
      ufo.velocity[0] *= scale;
      ufo.velocity[1] *= scale;
      ufo.velocity[2] *= scale;
    }

    // === ENEMY SHOOTING — fire from further away, faster cooldowns ===
    if (cfg.shootInterval > 0 && dist < 80) {
      ufo.shootCooldown -= dt;
      if (ufo.shootCooldown <= 0) {
        // Shoot at actual target (player OR tower)
        fireEnemyBullet(ufo, targetPos);
        ufo.shootCooldown = cfg.shootInterval * (0.7 + Math.random() * 0.3);
      }
    }

    // UFO → Tower contact damage (for tower-targeting UFOs)
    if (targetIsTower && dist < 5) {
      const towerTarget = gameState.towers.filter(t => t.alive)[Math.min(ufo.targetTowerIdx, gameState.towers.filter(t => t.alive).length - 1)];
      if (towerTarget) {
        damageTower(towerTarget.id, 15);
      }
      // Bounce back
      ufo.velocity[0] = -ndx * cfg.speed * 2;
      ufo.velocity[1] = Math.abs(ndy) * cfg.speed;
      ufo.velocity[2] = -ndz * cfg.speed * 2;
    }

    // UFO → Drone contact damage (always — regardless of target)
    if (playerDist < 3.5) {
      damagePlayer(18, ufo.position);
      const pNdx = playerDist > 0.01 ? pDx / playerDist : 0;
      const pNdy = playerDist > 0.01 ? pDy / playerDist : 0;
      const pNdz = playerDist > 0.01 ? pDz / playerDist : 0;
      ufo.velocity[0] = -pNdx * cfg.speed * 3;
      ufo.velocity[1] = -pNdy * cfg.speed;
      ufo.velocity[2] = -pNdz * cfg.speed * 3;
    }
  }

  // === UPDATE PLAYER BULLETS ===
  const BULLET_SPEED = 90;
  for (let i = 0; i < gameState.bullets.length; i++) {
    const b = gameState.bullets[i];
    if (!b.alive) continue;
    b.age += dt;
    if (b.age > 2.0) { b.alive = false; continue; }

    b.position[0] += b.direction[0] * BULLET_SPEED * dt;
    b.position[1] += b.direction[1] * BULLET_SPEED * dt;
    b.position[2] += b.direction[2] * BULLET_SPEED * dt;

    // Bullet → UFO hit check (use distSq to avoid sqrt)
    for (let j = 0; j < gameState.enemies.length; j++) {
      const ufo = gameState.enemies[j];
      if (!ufo.alive) continue;
      const bdx = b.position[0] - ufo.position[0];
      const bdy = b.position[1] - ufo.position[1];
      const bdz = b.position[2] - ufo.position[2];
      const distSq = bdx * bdx + bdy * bdy + bdz * bdz;
      const hitRadius = UFO_CONFIGS[ufo.type].size + 0.5;

      if (distSq < hitRadius * hitRadius) {
        b.alive = false;
        const damage = b.isCritical ? 60 : 30;
        ufo.hp -= damage;
        gameState.stats.shotsHit++;
        gameState.stats.damageDealt += damage;

        if (ufo.hp <= 0) {
          killEnemy(ufo);
        } else {
          playSound(b.isCritical ? 'critical' : 'hit');
          window.dispatchEvent(new CustomEvent('bullet-hit', { detail: { critical: b.isCritical } }));
        }
        break;
      }
    }
  }

  // === UPDATE ENEMY BULLETS (use index loop, distSq) ===
  for (let i = 0; i < gameState.enemyBullets.length; i++) {
    const eb = gameState.enemyBullets[i];
    if (!eb.alive) continue;
    eb.age += dt;
    if (eb.age > 2.5) { eb.alive = false; continue; }

    const spd = 50;
    eb.position[0] += eb.direction[0] * spd * dt;
    eb.position[1] += eb.direction[1] * spd * dt;
    eb.position[2] += eb.direction[2] * spd * dt;

    // Enemy bullet → player hit (distSq — no sqrt)
    const pdx = eb.position[0] - playerPos[0];
    const pdy = eb.position[1] - playerPos[1];
    const pdz = eb.position[2] - playerPos[2];
    const pDistSq = pdx * pdx + pdy * pdy + pdz * pdz;

    if (pDistSq < 6.25) { // 2.5^2
      eb.alive = false;
      damagePlayer(eb.damage, eb.position as [number, number, number]);
      continue;
    }

    // Enemy bullet → tower hit (distSq)
    for (let t = 0; t < gameState.towers.length; t++) {
      const tower = gameState.towers[t];
      if (!tower.alive) continue;
      const tdx = eb.position[0] - tower.position[0];
      const tdy = eb.position[1] - tower.position[1];
      const tdz = eb.position[2] - tower.position[2];
      const tDistSq = tdx * tdx + tdy * tdy + tdz * tdz;

      if (tDistSq < 16) { // 4^2
        eb.alive = false;
        damageTower(tower.id, eb.damage);
        break;
      }
    }
  }

  // === UPDATE POWER-UPS ===
  for (const pu of gameState.powerUps) {
    if (!pu.alive) continue;
    pu.age += dt;
    if (pu.age > 15) { pu.alive = false; continue; } // despawn after 15s

    // Float upward slowly
    pu.position[1] += Math.sin(pu.age * 2) * dt * 0.5;

    // Player pickup check
    const pdx = pu.position[0] - playerPos[0];
    const pdy = pu.position[1] - playerPos[1];
    const pdz = pu.position[2] - playerPos[2];
    const pdist = Math.sqrt(pdx * pdx + pdy * pdy + pdz * pdz);

    if (pdist < 3.5) {
      collectPowerUp(pu);
    }
  }

  // === UPDATE EXPLOSIONS ===
  for (const exp of gameState.explosions) {
    if (!exp.alive) continue;
    exp.age += dt;
    if (exp.age > 0.8) exp.alive = false;
  }

  // === DECAY CAMERA SHAKE ===
  gameState.shakeIntensity *= 0.9;
  if (gameState.shakeIntensity < 0.01) gameState.shakeIntensity = 0;

  // === UPDATE ROCKETS — homing & AOE ===
  for (let i = 0; i < gameState.rockets.length; i++) {
    const r = gameState.rockets[i];
    if (!r.alive) continue;
    r.age += dt;
    if (r.age > 4.0) { r.alive = false; continue; }

    const speed = 40 + r.age * 20; // accelerate

    // Homing logic
    const target = gameState.enemies.find(e => e.id === r.targetId && e.alive);
    if (target) {
      const rx = target.position[0] - r.position[0];
      const ry = target.position[1] - r.position[1];
      const rz = target.position[2] - r.position[2];
      const rd = Math.sqrt(rx * rx + ry * ry + rz * rz);
      if (rd > 0.1) {
        const homingStr = 2.5 * dt;
        r.velocity[0] = r.velocity[0] * (1 - homingStr) + (rx / rd) * speed * homingStr;
        r.velocity[1] = r.velocity[1] * (1 - homingStr) + (ry / rd) * speed * homingStr;
        r.velocity[2] = r.velocity[2] * (1 - homingStr) + (rz / rd) * speed * homingStr;
      }
    }

    r.position[0] += r.velocity[0] * dt;
    r.position[1] += r.velocity[1] * dt;
    r.position[2] += r.velocity[2] * dt;

    // Rocket → UFO hit
    for (let j = 0; j < gameState.enemies.length; j++) {
      const ufo = gameState.enemies[j];
      if (!ufo.alive) continue;
      const dx = r.position[0] - ufo.position[0];
      const dy = r.position[1] - ufo.position[1];
      const dz = r.position[2] - ufo.position[2];
      const dSq = dx * dx + dy * dy + dz * dz;
      const hitRadius = UFO_CONFIGS[ufo.type].size + 1.2;

      if (dSq < hitRadius * hitRadius) {
        r.alive = false;
        // AOE EXPLOSION
        gameState.explosions.push({
          position: [...r.position],
          age: 0,
          alive: true,
          scale: 4.0
        });

        // Damage nearby enemies
        for (let k = 0; k < gameState.enemies.length; k++) {
          const u2 = gameState.enemies[k];
          if (!u2.alive) continue;
          const aoeX = r.position[0] - u2.position[0];
          const aoeY = r.position[1] - u2.position[1];
          const aoeZ = r.position[2] - u2.position[2];
          const aoeDistSq = aoeX * aoeX + aoeY * aoeY + aoeZ * aoeZ;
          if (aoeDistSq < 100) { // 10m radius
            u2.hp -= 120; // Heavy damage
            if (u2.hp <= 0) killEnemy(u2);
          }
        }
        playSound('kill');
        break;
      }
    }
  }

  // === UPDATE DIALOGUES ===
  if (gameState.currentDialogue) {
    gameState.dialogueTimer -= dt;
    if (gameState.dialogueTimer <= 0) {
      gameState.currentDialogue = null;
    }
  } else if (gameState.dialogueQueue.length > 0) {
    gameState.currentDialogue = gameState.dialogueQueue.shift()!;
    gameState.dialogueTimer = gameState.currentDialogue.duration;
    playSound('dialogue');
  }

  // === BOOST & ROCKET RECHARGE ===
  if (gameState.isBoosting && gameState.boostEnergy > 0) {
    gameState.boostEnergy = Math.max(0, gameState.boostEnergy - 30 * dt);
  } else {
    gameState.boostEnergy = Math.min(gameState.maxBoostEnergy, gameState.boostEnergy + 15 * dt);
    gameState.isBoosting = false;
  }

  gameState.rocketRechargeTimer += dt;
  if (gameState.rocketRechargeTimer > 8) { // rocket every 8s
    if (gameState.rocketCount < gameState.maxRockets) {
      gameState.rocketCount++;
    }
    gameState.rocketRechargeTimer = 0;
  }

  // === CLEANUP DEAD OBJECTS — every frame, fast in-place compaction ===
  compactArray(gameState.bullets);
  compactArray(gameState.enemyBullets);
  compactArray(gameState.explosions);
  compactArray(gameState.rockets);

  // Less frequent cleanups for less-active arrays
  if (gameState.stats.timeSurvived % 1 < dt) {
    compactArray(gameState.enemies);
    compactArray(gameState.powerUps);
    const now = Date.now();
    gameState.killFeed = gameState.killFeed.filter(k => now - k.time < 4000);
  }
}

// Fast in-place array compaction — no allocation, O(n)
function compactArray<T extends { alive: boolean }>(arr: T[]): void {
  let write = 0;
  for (let read = 0; read < arr.length; read++) {
    if (arr[read].alive) {
      if (write !== read) arr[write] = arr[read];
      write++;
    }
  }
  arr.length = write;
}
