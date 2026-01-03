import * as THREE from 'three';
import { Scene3D } from './Scene3D';
import { InputManager } from './InputManager';
import { TankModel } from '../models/TankModel';
import { Fish3D } from '../entities/Fish3D';
import { Food3D } from '../entities/Food3D';
import { Egg3D } from '../entities/Egg3D';
import { GameManager, GameStats } from '../managers/GameManager';
import { UIManager } from '../ui/UIManager';
import { GAME_CONFIG, TANK_BOUNDS, SCENES } from '../config/gameConfig';
import { preloadFishTextures } from '../models/FishModel';

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

    this.uiManager.setOnBuyFishClick(() => {
      this.buyFish();
    });

    this.uiManager.setOnRetryClick(() => {
      this.startGame();
    });

    this.uiManager.setOnMenuClick(() => {
      this.showMenu();
    });
  }

  public async start(): Promise<void> {
    // Preload fish textures before starting
    await preloadFishTextures();
    
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

    // Spawn initial fish
    this.spawnFish(0, 0, 0);

    // Show game UI
    this.uiManager.showGame();
    this.uiManager.updatePoints(this.gameManager.points);
    this.uiManager.updateFishCount(1, GAME_CONFIG.maxFish);
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

  private spawnFish(x: number, y: number, z: number): void {
    const fish = new Fish3D(x, y, z);

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

  private buyFish(): void {
    if (this.gameManager.purchaseFish()) {
      const x = (Math.random() - 0.5) * (TANK_BOUNDS.maxX - TANK_BOUNDS.minX) * 0.6;
      const y = (Math.random() - 0.5) * (TANK_BOUNDS.maxY - TANK_BOUNDS.minY) * 0.6;
      const z = (Math.random() - 0.5) * (TANK_BOUNDS.maxZ - TANK_BOUNDS.minZ) * 0.6;
      this.spawnFish(x, y, z);
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
  }
}
