// Game dimensions
export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

// 3D World dimensions (Three.js units)
export const WORLD_CONFIG = {
  tankWidth: 20,
  tankHeight: 12,
  tankDepth: 8,
  cameraZ: 15,
};

// Scene keys
export const SCENES = {
  MENU: 'menu',
  GAME: 'game',
  GAME_OVER: 'gameOver',
};

// Game economy and mechanics
export const GAME_CONFIG = {
  startingPoints: 100,
  feedCost: 1,
  foodPerClick: 1,
  babyFishCost: 50,
  maxFish: 10,
  eggBaseValue: 10,
  eggSpawnInterval: 8000,
  eggAutoCollectTime: 5000,
  shrinkRate: 0.015,
  hungerThreshold: 10000,
  minSizeBeforeDeath: 0.2,
  foodSinkSpeed: 2,
  foodLifetime: 15000,
  fishSpeed: 2.5,
  fishTurnSpeed: 3, // How fast fish turns (radians per second)
  fishAcceleration: 0.03, // Smooth acceleration
  growthPerFood: 0.025, // Slower growth - takes more food to grow
  fishBaseLifespan: 90000, // Base lifespan in ms (90 seconds)
  fishDyingDuration: 3000, // How long dying animation takes (3 seconds)
  fishDyingFloatSpeed: 0.5, // How fast fish floats up when dying (units/sec)
};

// Fish lifecycle stages
export interface FishStage {
  name: string;
  stageKey: 'baby' | 'juvenile' | 'adult' | 'elder';
  minSize: number;
  maxSize: number;
  canProduceEggs: boolean;
  eggMultiplier: number;
  color: number; // Fallback color for procedural fish
  lifespanMultiplier: number; // Multiplier for base lifespan
}

export const FISH_STAGES: FishStage[] = [
  { name: 'Baby', stageKey: 'baby', minSize: 0.3, maxSize: 0.5, canProduceEggs: false, eggMultiplier: 0, color: 0xff8c42, lifespanMultiplier: 1.0 },
  { name: 'Juvenile', stageKey: 'juvenile', minSize: 0.5, maxSize: 0.8, canProduceEggs: false, eggMultiplier: 0, color: 0xff7b29, lifespanMultiplier: 1.5 },
  { name: 'Adult', stageKey: 'adult', minSize: 0.8, maxSize: 1.2, canProduceEggs: true, eggMultiplier: 1, color: 0xff6b00, lifespanMultiplier: 2.0 },
  { name: 'Elder', stageKey: 'elder', minSize: 1.2, maxSize: 1.5, canProduceEggs: true, eggMultiplier: 2, color: 0xff5500, lifespanMultiplier: 2.5 },
];

// Get fish stage based on size
export function getFishStage(size: number): FishStage {
  for (let i = FISH_STAGES.length - 1; i >= 0; i--) {
    if (size >= FISH_STAGES[i].minSize) {
      return FISH_STAGES[i];
    }
  }
  return FISH_STAGES[0];
}

// Tank boundaries in 3D world coordinates
export const TANK_BOUNDS = {
  minX: -WORLD_CONFIG.tankWidth / 2 + 1,
  maxX: WORLD_CONFIG.tankWidth / 2 - 1,
  minY: -WORLD_CONFIG.tankHeight / 2 + 1,
  maxY: WORLD_CONFIG.tankHeight / 2 - 1,
  minZ: -WORLD_CONFIG.tankDepth / 2 + 0.5,
  maxZ: WORLD_CONFIG.tankDepth / 2 - 0.5,
};

// Colors
export const COLORS = {
  water: 0x0a1628,
  waterFog: 0x0d2847,
  sand: 0xd4a574,
  seaweed: 0x22c55e,
  glass: 0x88ccff,
  ambient: 0x4488ff,
  directional: 0xffffff,
};
