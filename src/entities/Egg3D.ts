import * as THREE from 'three';
import { createEggModel, animateEgg } from '../models/EggModel';
import { GAME_CONFIG, TANK_BOUNDS } from '../config/gameConfig';

export class Egg3D {
  private group: THREE.Group;
  private time: number = 0;
  private lifetime: number = 0;
  private value: number;
  private isCollected: boolean = false;
  private floatSpeed: number = 0.5;

  private onCollected?: (value: number) => void;
  private onAutoCollect?: () => void;

  constructor(x: number, y: number, z: number, value: number) {
    this.group = new THREE.Group();
    this.group.position.set(x, y, z);
    this.value = value;

    // Create egg model
    const eggModel = createEggModel({ scale: 1 });
    this.group.add(eggModel);

    // Start with scale animation
    this.group.scale.setScalar(0);
  }

  public setOnCollected(callback: (value: number) => void): void {
    this.onCollected = callback;
  }

  public setOnAutoCollect(callback: () => void): void {
    this.onAutoCollect = callback;
  }

  public update(delta: number): void {
    if (this.isCollected) return;

    this.time += delta / 1000;
    this.lifetime += delta;

    // Spawn animation
    if (this.group.scale.x < 1) {
      this.group.scale.setScalar(
        Math.min(1, this.group.scale.x + delta / 200)
      );
    }

    // Float upward
    this.group.position.y += this.floatSpeed * (delta / 1000);

    // Wobble side to side
    this.group.position.x += Math.sin(this.time * 2) * 0.002;
    this.group.position.z += Math.cos(this.time * 1.5) * 0.002;

    // Stop at tank top
    if (this.group.position.y > TANK_BOUNDS.maxY - 0.5) {
      this.group.position.y = TANK_BOUNDS.maxY - 0.5;
    }

    // Animate egg
    animateEgg(this.group, this.time);

    // Auto-collect after timeout
    if (this.lifetime >= GAME_CONFIG.eggAutoCollectTime) {
      this.autoCollect();
    }

    // Pulse effect near auto-collect
    if (this.lifetime > GAME_CONFIG.eggAutoCollectTime - 2000) {
      const pulse = 1 + Math.sin(this.time * 10) * 0.1;
      this.group.scale.setScalar(pulse);
    }
  }

  public collect(): boolean {
    if (this.isCollected) return false;

    this.isCollected = true;

    if (this.onCollected) {
      this.onCollected(this.value);
    }

    return true;
  }

  private autoCollect(): void {
    if (this.isCollected) return;

    this.isCollected = true;

    if (this.onCollected) {
      this.onCollected(this.value);
    }

    if (this.onAutoCollect) {
      this.onAutoCollect();
    }
  }

  public getValue(): number {
    return this.value;
  }

  public isAvailable(): boolean {
    return !this.isCollected;
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  public getPosition(): THREE.Vector3 {
    return this.group.position.clone();
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
