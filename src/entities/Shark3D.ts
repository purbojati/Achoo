import * as THREE from 'three';
import { getSharkTexture } from '../models/FishModel';
import { SHARK_CONFIG, TANK_BOUNDS } from '../config/gameConfig';

export class Shark3D {
  private group: THREE.Group;
  private sprite: THREE.Sprite;
  private time: number = 0;

  // Movement
  private targetPosition: THREE.Vector3;
  private currentSpeed: number = 0;
  private currentAngle: number = 0;
  private targetAngle: number = 0;
  private facingRight: boolean = true;

  // Hunting
  private targetFishPosition: THREE.Vector3 | null = null;
  private eatCooldown: number = 0;
  private eatsThisVisit: number = 0;

  // Lifecycle
  private timeAlive: number = 0;
  private stayDuration: number;
  private isLeaving: boolean = false;
  private isActive: boolean = true;

  // Animation
  private swimPhase: number = 0;

  // Callbacks
  private onFishEaten?: (fishPosition: THREE.Vector3) => void;
  private onLeave?: () => void;

  constructor() {
    this.group = new THREE.Group();
    this.stayDuration = SHARK_CONFIG.stayDuration;

    // Start from outside the tank (random side)
    const enterFromRight = Math.random() > 0.5;
    const startX = enterFromRight ? TANK_BOUNDS.maxX + 5 : TANK_BOUNDS.minX - 5;
    const startY = TANK_BOUNDS.minY + Math.random() * (TANK_BOUNDS.maxY - TANK_BOUNDS.minY);
    
    this.group.position.set(startX, startY, 0);
    this.currentAngle = enterFromRight ? Math.PI : 0;
    this.facingRight = !enterFromRight;

    // Create shark sprite
    const texture = getSharkTexture(!this.facingRight);
    if (texture) {
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.1,
      });
      this.sprite = new THREE.Sprite(material);
      this.sprite.scale.set(5, 2.2, 1); // Shark is bigger than regular fish
    } else {
      // Fallback - create a simple gray shark shape
      const material = new THREE.SpriteMaterial({
        color: 0x4a5568,
        transparent: true,
      });
      this.sprite = new THREE.Sprite(material);
      this.sprite.scale.set(5, 2.2, 1);
    }
    
    this.group.add(this.sprite);

    // Set initial target to enter the tank
    this.targetPosition = new THREE.Vector3(
      enterFromRight ? TANK_BOUNDS.maxX - 2 : TANK_BOUNDS.minX + 2,
      startY,
      0
    );

    this.swimPhase = Math.random() * Math.PI * 2;
  }

  public setOnFishEaten(callback: (fishPosition: THREE.Vector3) => void): void {
    this.onFishEaten = callback;
  }

  public setOnLeave(callback: () => void): void {
    this.onLeave = callback;
  }

  public update(delta: number): void {
    if (!this.isActive) return;

    const deltaSeconds = delta / 1000;
    this.time += deltaSeconds;
    this.timeAlive += delta;
    this.swimPhase += deltaSeconds * 3;

    // Update eat cooldown
    if (this.eatCooldown > 0) {
      this.eatCooldown -= delta;
    }

    // Check if it's time to leave
    if (!this.isLeaving && (this.timeAlive >= this.stayDuration || this.eatsThisVisit >= SHARK_CONFIG.maxEatsPerVisit)) {
      this.startLeaving();
    }

    // Update movement
    this.updateMovement(deltaSeconds);

    // Animate
    this.animate();

    // Check if shark has left the tank
    if (this.isLeaving) {
      const distFromCenter = Math.abs(this.group.position.x);
      if (distFromCenter > TANK_BOUNDS.maxX + 8) {
        this.isActive = false;
        if (this.onLeave) {
          this.onLeave();
        }
      }
    }
  }

  private updateMovement(deltaSeconds: number): void {
    // Calculate direction to target
    let targetPos = this.targetPosition;
    
    if (this.targetFishPosition && !this.isLeaving) {
      targetPos = this.targetFishPosition;
    }

    const toTarget = new THREE.Vector3().subVectors(targetPos, this.group.position);
    const distanceToTarget = toTarget.length();

    // Calculate target angle
    if (distanceToTarget > 0.5) {
      this.targetAngle = Math.atan2(toTarget.y, toTarget.x);
    }

    // Normalize angle difference
    let angleDiff = this.targetAngle - this.currentAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // Turn towards target
    const turnSpeed = 2.5 * deltaSeconds;
    if (Math.abs(angleDiff) > 0.01) {
      const turnAmount = Math.sign(angleDiff) * Math.min(turnSpeed, Math.abs(angleDiff));
      this.currentAngle += turnAmount;
    }

    // Update direction sprite
    const newFacingRight = Math.cos(this.currentAngle) >= 0;
    if (newFacingRight !== this.facingRight) {
      this.facingRight = newFacingRight;
      this.updateSpriteDirection();
    }

    // Move
    const targetSpeed = SHARK_CONFIG.speed;
    this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, targetSpeed, 0.05);

    const moveDirection = new THREE.Vector3(
      Math.cos(this.currentAngle),
      Math.sin(this.currentAngle),
      0
    );

    this.group.position.add(moveDirection.multiplyScalar(this.currentSpeed * deltaSeconds));

    // Constrain Y to tank bounds (but allow X to go outside when leaving)
    if (!this.isLeaving) {
      this.group.position.x = THREE.MathUtils.clamp(this.group.position.x, TANK_BOUNDS.minX + 1, TANK_BOUNDS.maxX - 1);
    }
    this.group.position.y = THREE.MathUtils.clamp(this.group.position.y, TANK_BOUNDS.minY + 0.5, TANK_BOUNDS.maxY - 0.5);
    this.group.position.z = THREE.MathUtils.clamp(this.group.position.z, TANK_BOUNDS.minZ, TANK_BOUNDS.maxZ);

    // Randomly pick new wander target if not hunting
    if (!this.targetFishPosition && !this.isLeaving && distanceToTarget < 1) {
      this.setRandomTarget();
    }
  }

  private updateSpriteDirection(): void {
    const texture = getSharkTexture(!this.facingRight);
    if (texture && this.sprite.material.map !== texture) {
      this.sprite.material.map = texture;
      this.sprite.material.needsUpdate = true;
    }
  }

  private animate(): void {
    // Subtle swimming motion
    const bobAmount = Math.sin(this.swimPhase) * 0.05;
    this.sprite.position.y = bobAmount;

    // Body tilt based on vertical movement
    const verticalTilt = Math.sin(this.currentAngle) * 0.08;
    this.group.rotation.z = verticalTilt;
  }

  private setRandomTarget(): void {
    this.targetPosition = new THREE.Vector3(
      TANK_BOUNDS.minX + Math.random() * (TANK_BOUNDS.maxX - TANK_BOUNDS.minX),
      TANK_BOUNDS.minY + Math.random() * (TANK_BOUNDS.maxY - TANK_BOUNDS.minY),
      0
    );
  }

  private startLeaving(): void {
    this.isLeaving = true;
    this.targetFishPosition = null;
    
    // Exit from the opposite side of where we are
    const exitX = this.group.position.x > 0 ? TANK_BOUNDS.maxX + 10 : TANK_BOUNDS.minX - 10;
    this.targetPosition = new THREE.Vector3(exitX, this.group.position.y, 0);
  }

  public setTargetFish(position: THREE.Vector3 | null): void {
    if (!this.isLeaving) {
      this.targetFishPosition = position;
    }
  }

  public canEatFish(fishPosition: THREE.Vector3): boolean {
    if (this.isLeaving || this.eatCooldown > 0 || this.eatsThisVisit >= SHARK_CONFIG.maxEatsPerVisit) {
      return false;
    }
    
    const distance = this.group.position.distanceTo(fishPosition);
    return distance < SHARK_CONFIG.eatDistance;
  }

  public eatFish(fishPosition: THREE.Vector3): void {
    this.eatCooldown = SHARK_CONFIG.eatCooldown;
    this.eatsThisVisit++;
    this.targetFishPosition = null;

    if (this.onFishEaten) {
      this.onFishEaten(fishPosition);
    }
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  public getPosition(): THREE.Vector3 {
    return this.group.position.clone();
  }

  public isStillActive(): boolean {
    return this.isActive;
  }

  public dispose(): void {
    if (this.sprite) {
      this.sprite.material.dispose();
    }
  }
}
