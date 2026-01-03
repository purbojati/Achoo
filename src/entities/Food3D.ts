import * as THREE from 'three';
import { createFoodModel, animateFood } from '../models/FoodModel';
import { GAME_CONFIG, TANK_BOUNDS } from '../config/gameConfig';

export class Food3D {
  private mesh: THREE.Mesh;
  private time: number = 0;
  private lifetime: number = 0;
  private isConsumed: boolean = false;
  private sinkSpeed: number;

  constructor(x: number, y: number, z: number) {
    this.mesh = createFoodModel({ scale: 1 });
    this.mesh.position.set(x, y, z);

    // Randomize sink speed slightly
    this.sinkSpeed = GAME_CONFIG.foodSinkSpeed * (0.8 + Math.random() * 0.4);
  }

  public update(delta: number): void {
    if (this.isConsumed) return;

    this.time += delta / 1000;
    this.lifetime += delta;

    // Check if expired
    if (this.lifetime >= GAME_CONFIG.foodLifetime) {
      this.isConsumed = true;
      return;
    }

    // Sink
    this.mesh.position.y -= this.sinkSpeed * (delta / 1000);

    // Wobble while sinking
    this.mesh.position.x += Math.sin(this.time * 3) * 0.005;
    this.mesh.position.z += Math.cos(this.time * 2) * 0.003;

    // Stop at tank bottom
    const bottomY = TANK_BOUNDS.minY + 0.3;
    if (this.mesh.position.y < bottomY) {
      this.mesh.position.y = bottomY;
    }

    // Animate food
    animateFood(this.mesh, this.time);

    // Fade out near end of lifetime
    const fadeStart = GAME_CONFIG.foodLifetime - 3000;
    if (this.lifetime > fadeStart) {
      const opacity = 1 - (this.lifetime - fadeStart) / 3000;
      (this.mesh.material as THREE.MeshToonMaterial).opacity = opacity;
      (this.mesh.material as THREE.MeshToonMaterial).transparent = true;
    }
  }

  public consume(): void {
    this.isConsumed = true;
  }

  public isAvailable(): boolean {
    return !this.isConsumed;
  }

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach((m) => m.dispose());
    } else {
      this.mesh.material.dispose();
    }
  }
}
