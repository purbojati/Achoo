import * as THREE from 'three';
import { createFishModel, animateFish, setFishDirection } from '../models/FishModel';
import { GAME_CONFIG, TANK_BOUNDS, getFishStage, FishStage, FISH_STAGES } from '../config/gameConfig';

export class Fish3D {
  private group: THREE.Group;
  private fishModel: THREE.Group;
  private time: number = 0;

  // Size and growth
  private _size: number = 0.3;
  private targetSize: number = 0.3;

  // Hunger system
  private timeSinceLastFed: number = 0;
  private isHungry: boolean = false;

  // Egg production
  private timeSinceLastEgg: number = 0;

  // === PERSONALITY TRAITS (randomized per fish) ===
  private personality: {
    speedMultiplier: number;      // How fast this fish swims (0.7 - 1.3)
    turnSpeedMultiplier: number;  // How fast this fish turns (0.6 - 1.4)
    wanderFrequency: number;      // How often fish changes direction (0.5 - 1.5)
    waveAmplitude: number;        // How much the fish wiggles while swimming
    verticalBias: number;         // Preference for swimming up or down (-0.3 to 0.3)
    restlessness: number;         // How far the fish tends to wander (0.5 - 1.5)
  };

  // Movement - Natural swimming
  private targetPosition: THREE.Vector3;
  private currentSpeed: number = 0;
  private baseMaxSpeed: number = GAME_CONFIG.fishSpeed;
  private currentAngle: number = 0;
  private targetAngle: number = 0;
  private wanderTimer: number = 0;
  private baseWanderInterval: number = 2500;
  private isTurning: boolean = false;
  private facingRight: boolean = true; // Track direction explicitly
  
  // Swimming wave motion
  private swimPhase: number;
  private animTimeOffset: number;

  // State
  private isDead: boolean = false;
  private currentStage: FishStage;

  // Food reference
  private foodPositions: THREE.Vector3[] = [];

  // Callbacks
  private onEggProduced?: (x: number, y: number, z: number, value: number) => void;
  private onDeath?: () => void;

  constructor(x: number, y: number, z: number) {
    this.group = new THREE.Group();
    this.group.position.set(x, y, z);

    this._size = 0.3;
    this.targetSize = 0.3;
    this.currentStage = getFishStage(this._size);

    // === Generate unique personality for this fish ===
    this.personality = {
      speedMultiplier: 0.7 + Math.random() * 0.6,        // 0.7 - 1.3
      turnSpeedMultiplier: 0.6 + Math.random() * 0.8,   // 0.6 - 1.4
      wanderFrequency: 0.5 + Math.random() * 1.0,       // 0.5 - 1.5
      waveAmplitude: 0.1 + Math.random() * 0.15,        // 0.1 - 0.25
      verticalBias: (Math.random() - 0.5) * 0.6,        // -0.3 to 0.3
      restlessness: 0.5 + Math.random() * 1.0,          // 0.5 - 1.5
    };

    // Randomize starting phase and animation offset
    this.swimPhase = Math.random() * Math.PI * 2;
    this.animTimeOffset = Math.random() * 10;

    // Random initial facing direction
    this.currentAngle = Math.random() * Math.PI * 2;
    this.targetAngle = this.currentAngle;
    this.facingRight = Math.cos(this.currentAngle) >= 0;

    // Create fish model using sprite-based system
    this.fishModel = createFishModel({
      stage: this.currentStage.stageKey,
      scale: this._size,
    });
    this.group.add(this.fishModel);

    // Set initial direction based on angle
    setFishDirection(this.fishModel, this.facingRight);

    // Initialize movement
    this.targetPosition = new THREE.Vector3(x, y, z);
    
    // Randomize initial wander timer so fish don't all change direction at once
    this.wanderTimer = Math.random() * this.baseWanderInterval;
    
    this.setRandomTarget();

    // Randomize egg timer
    this.timeSinceLastEgg = Math.random() * GAME_CONFIG.eggSpawnInterval;
  }

  public setFoodPositions(positions: THREE.Vector3[]): void {
    this.foodPositions = positions;
  }

  public setOnEggProduced(callback: (x: number, y: number, z: number, value: number) => void): void {
    this.onEggProduced = callback;
  }

  public setOnDeath(callback: () => void): void {
    this.onDeath = callback;
  }

  public update(delta: number): void {
    if (this.isDead) return;

    const deltaSeconds = delta / 1000;
    this.time += deltaSeconds;
    this.swimPhase += deltaSeconds * (2.5 + this.personality.speedMultiplier);

    // Update hunger
    this.updateHunger(delta);

    // Update movement - natural swimming
    this.updateNaturalMovement(deltaSeconds);

    // Update egg production
    this.updateEggProduction(delta);

    // Update visual size
    this.updateVisualSize();

    // Animate fish model with unique timing
    const animTime = this.time + this.animTimeOffset;
    const swimIntensity = 0.5 + (this.currentSpeed / this.getMaxSpeed()) * 0.5;
    animateFish(this.fishModel, animTime, this.isHungry ? 1.3 : 1, swimIntensity);
  }

  private getMaxSpeed(): number {
    return this.baseMaxSpeed * this.personality.speedMultiplier;
  }

  private getTurnSpeed(): number {
    return GAME_CONFIG.fishTurnSpeed * this.personality.turnSpeedMultiplier;
  }

  private getWanderInterval(): number {
    const base = this.baseWanderInterval / this.personality.wanderFrequency;
    return base + Math.random() * base * 0.5;
  }

  private updateHunger(delta: number): void {
    this.timeSinceLastFed += delta;

    if (this.timeSinceLastFed > GAME_CONFIG.hungerThreshold) {
      this.isHungry = true;
      const shrinkAmount = GAME_CONFIG.shrinkRate * (delta / 1000);
      this._size = Math.max(this._size - shrinkAmount, 0);
      this.targetSize = this._size;

      if (this._size <= GAME_CONFIG.minSizeBeforeDeath) {
        this.die();
      }
    } else {
      this.isHungry = false;
    }
  }

  private updateNaturalMovement(deltaSeconds: number): void {
    // Look for food or wander
    const nearestFood = this.findNearestFood();

    if (nearestFood) {
      this.targetPosition.copy(nearestFood);
    } else {
      // Wander randomly based on personality
      this.wanderTimer += deltaSeconds * 1000;
      if (this.wanderTimer >= this.getWanderInterval()) {
        this.setRandomTarget();
        this.wanderTimer = 0;
      }
    }

    // Calculate direction to target
    const toTarget = new THREE.Vector3()
      .subVectors(this.targetPosition, this.group.position);
    const distanceToTarget = toTarget.length();

    // Calculate target angle (only on XY plane for 2D-like movement)
    if (distanceToTarget > 0.3) {
      this.targetAngle = Math.atan2(toTarget.y, toTarget.x);
    }

    // Normalize angle difference to [-PI, PI]
    let angleDiff = this.targetAngle - this.currentAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // Check if we need to turn significantly (fish can't swim backwards)
    const needsToTurn = Math.abs(angleDiff) > Math.PI * 0.4;
    this.isTurning = needsToTurn;

    // Smooth turning - fish turns gradually based on personality
    const turnSpeed = this.getTurnSpeed() * deltaSeconds;
    if (Math.abs(angleDiff) > 0.01) {
      const turnAmount = Math.sign(angleDiff) * Math.min(turnSpeed, Math.abs(angleDiff));
      this.currentAngle += turnAmount;
      
      // Normalize current angle
      while (this.currentAngle > Math.PI) this.currentAngle -= Math.PI * 2;
      while (this.currentAngle < -Math.PI) this.currentAngle += Math.PI * 2;
    }

    // Update sprite direction based on current angle
    this.facingRight = Math.cos(this.currentAngle) >= 0;
    setFishDirection(this.fishModel, this.facingRight);

    // Calculate target speed based on personality
    const maxSpeed = this.getMaxSpeed();
    let targetSpeed = 0;
    if (distanceToTarget > 0.3) {
      if (this.isTurning) {
        // Slow down while turning significantly
        targetSpeed = maxSpeed * 0.25;
      } else if (nearestFood) {
        // Speed up when chasing food
        targetSpeed = maxSpeed * 1.3;
      } else {
        // Normal cruising speed varies by personality
        targetSpeed = maxSpeed * (0.5 + this.personality.restlessness * 0.3);
      }
    }

    // Smooth acceleration/deceleration
    const acceleration = GAME_CONFIG.fishAcceleration;
    if (this.currentSpeed < targetSpeed) {
      this.currentSpeed = Math.min(this.currentSpeed + acceleration * targetSpeed, targetSpeed);
    } else {
      this.currentSpeed = Math.max(this.currentSpeed - acceleration * 2, targetSpeed);
    }

    // Move in the direction the fish is facing (not towards target directly)
    const moveDirection = new THREE.Vector3(
      Math.cos(this.currentAngle),
      Math.sin(this.currentAngle),
      0
    );

    // Add subtle wave motion perpendicular to movement direction (based on personality)
    const waveAmount = Math.sin(this.swimPhase) * this.personality.waveAmplitude * (this.currentSpeed / maxSpeed);
    const perpendicular = new THREE.Vector3(-moveDirection.y, moveDirection.x, 0);
    
    // Apply movement
    const movement = moveDirection.clone()
      .multiplyScalar(this.currentSpeed * deltaSeconds)
      .add(perpendicular.multiplyScalar(waveAmount * deltaSeconds));
    
    this.group.position.add(movement);

    // Add subtle Z-axis drift for depth (unique per fish)
    const zDrift = Math.sin(this.time * 0.4 + this.swimPhase) * 0.25 * deltaSeconds;
    this.group.position.z += zDrift;

    // Visual tilt based on vertical movement and turning
    const verticalTilt = Math.sin(this.currentAngle) * 0.12;
    const turnTilt = this.isTurning ? Math.sign(angleDiff) * 0.08 : 0;
    this.group.rotation.z = THREE.MathUtils.lerp(
      this.group.rotation.z,
      verticalTilt + turnTilt,
      0.06
    );

    // Keep within bounds - if hitting boundary, pick new target
    this.constrainToBoundsWithBounce();
  }

  private findNearestFood(): THREE.Vector3 | null {
    let nearest: THREE.Vector3 | null = null;
    let nearestDistance = Infinity;
    // Detection range also varies slightly by personality (more restless = more aware)
    const detectionRange = (5 + this._size * 3) * (0.8 + this.personality.restlessness * 0.4);

    for (const foodPos of this.foodPositions) {
      const distance = this.group.position.distanceTo(foodPos);
      if (distance < detectionRange && distance < nearestDistance) {
        nearest = foodPos;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  private setRandomTarget(): void {
    // Set a target that's generally in front of the fish (not behind)
    // Distance varies by restlessness
    const forwardBias = (2 + Math.random() * 4) * this.personality.restlessness;
    const lateralOffset = (Math.random() - 0.5) * 8 * this.personality.restlessness;
    // Vertical offset influenced by personality's vertical bias
    const verticalOffset = (Math.random() - 0.5) * 5 + this.personality.verticalBias * 3;

    const forward = new THREE.Vector3(
      Math.cos(this.currentAngle),
      Math.sin(this.currentAngle),
      0
    );
    const lateral = new THREE.Vector3(-forward.y, forward.x, 0);

    const newTarget = this.group.position.clone()
      .add(forward.multiplyScalar(forwardBias))
      .add(lateral.multiplyScalar(lateralOffset));
    newTarget.y += verticalOffset;
    
    // Random Z position
    newTarget.z = TANK_BOUNDS.minZ + Math.random() * (TANK_BOUNDS.maxZ - TANK_BOUNDS.minZ);

    // Clamp to bounds with some padding
    newTarget.x = THREE.MathUtils.clamp(newTarget.x, TANK_BOUNDS.minX + 0.5, TANK_BOUNDS.maxX - 0.5);
    newTarget.y = THREE.MathUtils.clamp(newTarget.y, TANK_BOUNDS.minY + 0.5, TANK_BOUNDS.maxY - 0.5);
    newTarget.z = THREE.MathUtils.clamp(newTarget.z, TANK_BOUNDS.minZ, TANK_BOUNDS.maxZ);

    this.targetPosition.copy(newTarget);
  }

  private constrainToBoundsWithBounce(): void {
    const pos = this.group.position;
    let hitBoundary = false;

    // Check and constrain X
    if (pos.x < TANK_BOUNDS.minX) {
      pos.x = TANK_BOUNDS.minX;
      hitBoundary = true;
    } else if (pos.x > TANK_BOUNDS.maxX) {
      pos.x = TANK_BOUNDS.maxX;
      hitBoundary = true;
    }

    // Check and constrain Y
    if (pos.y < TANK_BOUNDS.minY) {
      pos.y = TANK_BOUNDS.minY;
      hitBoundary = true;
    } else if (pos.y > TANK_BOUNDS.maxY) {
      pos.y = TANK_BOUNDS.maxY;
      hitBoundary = true;
    }

    // Check and constrain Z
    pos.z = THREE.MathUtils.clamp(pos.z, TANK_BOUNDS.minZ, TANK_BOUNDS.maxZ);

    // If hit boundary, pick a new target away from the wall
    if (hitBoundary) {
      this.setRandomTarget();
      this.wanderTimer = 0;
    }
  }

  public canEat(foodPosition: THREE.Vector3): boolean {
    const eatDistance = 0.6 + this._size * 0.4;
    return this.group.position.distanceTo(foodPosition) < eatDistance;
  }

  public eat(): void {
    this.timeSinceLastFed = 0;
    this.isHungry = false;

    // Grow - slower growth
    const maxSize = FISH_STAGES[FISH_STAGES.length - 1].maxSize;
    this._size = Math.min(this._size + GAME_CONFIG.growthPerFood, maxSize);
    this.targetSize = this._size;

    // Update stage
    this.updateStage();
  }

  private updateEggProduction(delta: number): void {
    const stage = getFishStage(this._size);

    if (!stage.canProduceEggs) return;

    this.timeSinceLastEgg += delta;

    if (this.timeSinceLastEgg >= GAME_CONFIG.eggSpawnInterval) {
      this.produceEgg();
      this.timeSinceLastEgg = 0;
    }
  }

  private produceEgg(): void {
    if (!this.onEggProduced) return;

    const stage = getFishStage(this._size);
    const baseValue = GAME_CONFIG.eggBaseValue;
    const sizeBonus = Math.floor(this._size * 10);
    const multiplier = stage.eggMultiplier;
    const eggValue = (baseValue + sizeBonus) * multiplier;

    // Spawn egg behind the fish based on current facing angle
    const behindAngle = this.currentAngle + Math.PI;
    const offset = new THREE.Vector3(
      Math.cos(behindAngle) * 0.6,
      Math.sin(behindAngle) * 0.6,
      0
    );

    this.onEggProduced(
      this.group.position.x + offset.x,
      this.group.position.y + offset.y,
      this.group.position.z + offset.z,
      eggValue
    );
  }

  private updateVisualSize(): void {
    // Get current sprite
    const sprite = this.fishModel.getObjectByName('fishSprite') as THREE.Sprite | undefined;
    
    if (sprite) {
      // Update sprite scale based on size - smooth interpolation
      const baseWidth = 2.5;
      const baseHeight = 1.5;
      
      const targetAbsScaleX = baseWidth * this.targetSize;
      const targetScaleY = baseHeight * this.targetSize;
      
      // Use the tracked direction, not the sprite's current scale sign
      const directionSign = this.facingRight ? 1 : -1;
      const currentAbsScaleX = Math.abs(sprite.scale.x);
      
      // Lerp the magnitude only, then apply the tracked direction
      const newAbsScaleX = THREE.MathUtils.lerp(currentAbsScaleX, targetAbsScaleX, 0.03);
      sprite.scale.x = newAbsScaleX * directionSign;
      sprite.scale.y = THREE.MathUtils.lerp(sprite.scale.y, targetScaleY, 0.03);
    } else {
      // Procedural fish scaling
      const currentScale = this.fishModel.scale.x;
      const diff = this.targetSize - Math.abs(currentScale);

      if (Math.abs(diff) > 0.01) {
        const newScale = currentScale + diff * 0.03;
        this.fishModel.scale.x = newScale;
        this.fishModel.scale.y = Math.abs(newScale);
        this.fishModel.scale.z = Math.sign(this.fishModel.scale.z) * Math.abs(newScale);
      }
    }
  }

  private updateStage(): void {
    const newStage = getFishStage(this._size);
    if (newStage.stageKey !== this.currentStage.stageKey) {
      this.currentStage = newStage;
      
      // Recreate fish model with new stage appearance
      this.group.remove(this.fishModel);
      this.fishModel = createFishModel({
        stage: newStage.stageKey,
        scale: this._size,
      });
      this.group.add(this.fishModel);
      
      // Restore direction using tracked property
      setFishDirection(this.fishModel, this.facingRight);
    }
  }

  private die(): void {
    if (this.isDead) return;
    this.isDead = true;

    if (this.onDeath) {
      this.onDeath();
    }
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  public getPosition(): THREE.Vector3 {
    return this.group.position.clone();
  }

  public isAlive(): boolean {
    return !this.isDead;
  }

  public dispose(): void {
    // Cleanup geometry and materials
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      } else if (child instanceof THREE.Sprite) {
        child.material.dispose();
      }
    });
  }
}
