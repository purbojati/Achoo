import * as THREE from 'three';
import { Scene3D } from './Scene3D';
import { InputManager } from './InputManager';
import { TankModel } from '../models/TankModel';
import { Fish3D } from '../entities/Fish3D';
import { Food3D } from '../entities/Food3D';
import { Egg3D } from '../entities/Egg3D';
import { Shark3D } from '../entities/Shark3D';
import { GameManager, GameStats } from '../managers/GameManager';
import { UIManager } from '../ui/UIManager';
import { GAME_CONFIG, TANK_BOUNDS, SCENES, FishTypeKey, SHARK_CONFIG } from '../config/gameConfig';
import { preloadFishTextures, preloadSharkTextures } from '../models/FishModel';

export class Game {
  private scene3D: Scene3D;
  private inputManager: InputManager;
  private gameManager: GameManager;
  private uiManager: UIManager;
  private tank: TankModel;
  private clock: THREE.Clock;

  private fishes: Fish3D[] = [];
  private foods: Food3D[] = [];
  private eggs: Egg3D[] = [];
  private shark: Shark3D | null = null;

  // Shark spawn timer
  private sharkSpawnTimer: number = 0;
  private nextSharkSpawnTime: number = 0;
  private sharkWarningTimer: number = 0;
  private isSharkWarning: boolean = false;

  private currentScene: string = SCENES.MENU;
  private isRunning: boolean = false;

  constructor(container: HTMLElement) {
    // Initialize 3D scene
    this.scene3D = new Scene3D(container);

    // Initialize input manager
    this.inputManager = new InputManager(
      this.scene3D.camera,
      this.scene3D.getCanvas()
    );

    // Initialize game manager
    this.gameManager = new GameManager();

    // Initialize UI manager
    this.uiManager = new UIManager(container);

    // Create tank environment
    this.tank = new TankModel();
    this.scene3D.add(this.tank.getGroup());

    // Setup clock for delta time
    this.clock = new THREE.Clock();

    // Setup callbacks
    this.setupCallbacks();
  }

  private setupCallbacks(): void {
    // Input callbacks
    this.inputManager.setOnTankClick((point) => {
      if (this.currentScene === SCENES.GAME) {
        this.tryFeed(point);
      }
    });

    this.inputManager.setOnObjectClick((_point, object) => {
      if (this.currentScene === SCENES.GAME && object) {
        this.handleObjectClick(object);
      }
    });

    // Game manager callbacks
    this.gameManager.setOnPointsChanged((points) => {
      this.uiManager.updatePoints(points);
    });

    this.gameManager.setOnFishCountChanged((count) => {
      this.uiManager.updateFishCount(count, GAME_CONFIG.maxFish);
    });

    this.gameManager.setOnGameOver((stats) => {
      this.handleGameOver(stats);
    });

    this.gameManager.setOnInsufficientFunds((required, current) => {
      this.uiManager.showInsufficientFunds(required, current);
    });

    // UI callbacks
    this.uiManager.setOnPlayClick(() => {
      this.startGame();
    });

    this.uiManager.setOnBuyFishClick((fishType: FishTypeKey) => {
      this.buyFish(fishType);
    });

    this.uiManager.setOnRetryClick(() => {
      this.startGame();
    });

    this.uiManager.setOnMenuClick(() => {
      this.showMenu();
    });
  }

  public async start(): Promise<void> {
    // Preload fish and shark textures before starting
    await Promise.all([
      preloadFishTextures(),
      preloadSharkTextures(),
    ]);
    
    this.showMenu();
    this.animate();
  }

  private showMenu(): void {
    this.currentScene = SCENES.MENU;
    this.isRunning = false;
    this.clearEntities();
    this.uiManager.showMenu();
  }

  private startGame(): void {
    this.currentScene = SCENES.GAME;
    this.isRunning = true;

    // Reset game state
    this.clearEntities();
    this.gameManager.reset();

    // Reset shark spawn timer
    this.sharkSpawnTimer = 0;
    this.nextSharkSpawnTime = this.getRandomSharkSpawnTime();
    this.isSharkWarning = false;
    this.sharkWarningTimer = 0;

    // Spawn initial fish
    this.spawnFish(0, 0, 0, 'clownfish');

    // Show game UI
    this.uiManager.showGame();
    this.uiManager.updatePoints(this.gameManager.points);
    this.uiManager.updateFishCount(1, GAME_CONFIG.maxFish);
  }

  private getRandomSharkSpawnTime(): number {
    return SHARK_CONFIG.minSpawnInterval + 
           Math.random() * (SHARK_CONFIG.maxSpawnInterval - SHARK_CONFIG.minSpawnInterval);
  }

  private handleGameOver(stats: GameStats): void {
    this.currentScene = SCENES.GAME_OVER;
    this.isRunning = false;
    this.uiManager.showGameOver(stats);
  }

  private clearEntities(): void {
    // Remove all fish
    for (const fish of this.fishes) {
      this.scene3D.remove(fish.getGroup());
      fish.dispose();
    }
    this.fishes = [];

    // Remove all food
    for (const food of this.foods) {
      this.scene3D.remove(food.getMesh());
      food.dispose();
    }
    this.foods = [];

    // Remove all eggs
    for (const egg of this.eggs) {
      this.scene3D.remove(egg.getGroup());
      this.inputManager.removeClickable(egg.getGroup());
      egg.dispose();
    }
    this.eggs = [];

    // Remove shark
    if (this.shark) {
      this.scene3D.remove(this.shark.getGroup());
      this.shark.dispose();
      this.shark = null;
    }
    this.uiManager.hideSharkWarning();
  }

  private tryFeed(point: THREE.Vector3): void {
    if (this.gameManager.purchaseFood()) {
      this.spawnFood(point.x, point.y);
    }
  }

  private spawnFood(x: number, y: number): void {
    const count = GAME_CONFIG.foodPerClick;

    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * 2;
      const offsetY = (Math.random() - 0.5) * 0.5;
      const offsetZ = (Math.random() - 0.5) * 2;

      const foodX = Math.max(TANK_BOUNDS.minX, Math.min(TANK_BOUNDS.maxX, x + offsetX));
      const foodY = Math.min(TANK_BOUNDS.maxY, y + offsetY);
      const foodZ = offsetZ;

      const food = new Food3D(foodX, foodY, foodZ);
      this.scene3D.add(food.getMesh());
      this.foods.push(food);
    }
  }

  private spawnFish(x: number, y: number, z: number, fishType: FishTypeKey = 'clownfish'): void {
    const fish = new Fish3D(x, y, z, fishType);

    fish.setOnEggProduced((eggX, eggY, eggZ, value) => {
      this.spawnEgg(eggX, eggY, eggZ, value);
    });

    fish.setOnDeath(() => {
      this.removeFish(fish);
    });

    this.scene3D.add(fish.getGroup());
    this.fishes.push(fish);
    this.gameManager.setFishCount(this.fishes.length);
  }

  private spawnEgg(x: number, y: number, z: number, value: number): void {
    const egg = new Egg3D(x, y, z, value);

    egg.setOnCollected((eggValue) => {
      this.gameManager.collectEgg(eggValue);
      this.uiManager.showPointsPopup(egg.getPosition(), eggValue);
    });

    egg.setOnAutoCollect(() => {
      this.removeEgg(egg);
    });

    this.scene3D.add(egg.getGroup());
    this.inputManager.addClickable(egg.getGroup());
    this.eggs.push(egg);
  }

  private buyFish(fishType: FishTypeKey = 'clownfish'): void {
    if (this.gameManager.purchaseFish(fishType)) {
      const x = (Math.random() - 0.5) * (TANK_BOUNDS.maxX - TANK_BOUNDS.minX) * 0.6;
      const y = (Math.random() - 0.5) * (TANK_BOUNDS.maxY - TANK_BOUNDS.minY) * 0.6;
      const z = (Math.random() - 0.5) * (TANK_BOUNDS.maxZ - TANK_BOUNDS.minZ) * 0.6;
      this.spawnFish(x, y, z, fishType);
    }
  }

  private handleObjectClick(object: THREE.Object3D): void {
    // Check if it's an egg
    for (const egg of this.eggs) {
      if (egg.getGroup() === object || egg.getGroup().children.includes(object)) {
        if (egg.collect()) {
          this.removeEgg(egg);
        }
        return;
      }
    }
  }

  private removeFish(fish: Fish3D): void {
    const index = this.fishes.indexOf(fish);
    if (index > -1) {
      this.fishes.splice(index, 1);
      this.scene3D.remove(fish.getGroup());
      fish.dispose();
      this.gameManager.removeFish();
    }
  }

  private removeEgg(egg: Egg3D): void {
    const index = this.eggs.indexOf(egg);
    if (index > -1) {
      this.eggs.splice(index, 1);
      this.scene3D.remove(egg.getGroup());
      this.inputManager.removeClickable(egg.getGroup());
      egg.dispose();
    }
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();

    if (this.isRunning) {
      this.update(delta);
    }

    // Always update tank animations
    this.tank.update(delta);

    // Render
    this.scene3D.render();
  }

  private update(delta: number): void {
    // Convert delta to milliseconds for compatibility
    const deltaMs = delta * 1000;

    // Update fish
    for (const fish of this.fishes) {
      fish.setFoodPositions(this.foods.filter(f => f.isAvailable()).map(f => f.getPosition()));
      fish.update(deltaMs);
    }

    // Update food
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const food = this.foods[i];
      food.update(deltaMs);

      if (!food.isAvailable()) {
        this.scene3D.remove(food.getMesh());
        food.dispose();
        this.foods.splice(i, 1);
      }
    }

    // Update eggs
    for (let i = this.eggs.length - 1; i >= 0; i--) {
      const egg = this.eggs[i];
      egg.update(deltaMs);

      if (!egg.isAvailable()) {
        this.removeEgg(egg);
      }
    }

    // Check for fish eating food
    for (const fish of this.fishes) {
      for (let i = this.foods.length - 1; i >= 0; i--) {
        const food = this.foods[i];
        if (food.isAvailable() && fish.canEat(food.getPosition())) {
          fish.eat();
          food.consume();
        }
      }
    }

    // Update shark spawning and behavior
    this.updateShark(deltaMs);
  }

  private updateShark(deltaMs: number): void {
    // Handle shark warning phase
    if (this.isSharkWarning) {
      this.sharkWarningTimer += deltaMs;
      if (this.sharkWarningTimer >= SHARK_CONFIG.warningDuration) {
        this.isSharkWarning = false;
        this.sharkWarningTimer = 0;
        this.uiManager.hideSharkWarning();
        this.spawnShark();
      }
      return;
    }

    // Check if shark should spawn (only if we have fish and no shark currently)
    if (!this.shark && this.fishes.length > 0) {
      this.sharkSpawnTimer += deltaMs;
      if (this.sharkSpawnTimer >= this.nextSharkSpawnTime) {
        this.sharkSpawnTimer = 0;
        this.nextSharkSpawnTime = this.getRandomSharkSpawnTime();
        // Start warning phase
        this.isSharkWarning = true;
        this.sharkWarningTimer = 0;
        this.uiManager.showSharkWarning();
      }
    }

    // Update shark if present
    if (this.shark) {
      // Find nearest fish for shark to target
      const nearestFish = this.findNearestFishToShark();
      if (nearestFish) {
        this.shark.setTargetFish(nearestFish.getPosition());
        
        // Check if shark can eat fish
        if (this.shark.canEatFish(nearestFish.getPosition())) {
          this.shark.eatFish(nearestFish.getPosition());
          this.removeFishByShark(nearestFish);
        }
      } else {
        this.shark.setTargetFish(null);
      }

      this.shark.update(deltaMs);

      // Remove shark if it's left
      if (!this.shark.isStillActive()) {
        this.scene3D.remove(this.shark.getGroup());
        this.shark.dispose();
        this.shark = null;
      }
    }
  }

  private spawnShark(): void {
    this.shark = new Shark3D();
    
    this.shark.setOnFishEaten((_position) => {
      // Could add visual effects here
    });

    this.shark.setOnLeave(() => {
      // Shark has left the tank
    });

    this.scene3D.add(this.shark.getGroup());
  }

  private findNearestFishToShark(): Fish3D | null {
    if (!this.shark || this.fishes.length === 0) return null;

    let nearest: Fish3D | null = null;
    let nearestDistance = Infinity;
    const sharkPos = this.shark.getPosition();

    for (const fish of this.fishes) {
      if (!fish.isAlive() || fish.isCurrentlyDying()) continue;
      
      const distance = sharkPos.distanceTo(fish.getPosition());
      if (distance < nearestDistance) {
        nearest = fish;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  private removeFishByShark(fish: Fish3D): void {
    const index = this.fishes.indexOf(fish);
    if (index > -1) {
      this.fishes.splice(index, 1);
      this.scene3D.remove(fish.getGroup());
      fish.dispose();
      this.gameManager.removeFish(true); // true = eaten by shark
    }
  }
}
