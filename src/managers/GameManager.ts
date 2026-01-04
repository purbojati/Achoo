import { GAME_CONFIG, FishTypeKey, FISH_TYPES } from '../config/gameConfig';

export interface GameStats {
  totalFishRaised: number;
  totalEggsCollected: number;
  maxPointsReached: number;
  fishDied: number;
  fishEatenByShark: number;
}

export class GameManager {
  private _points: number;
  private _fishCount: number = 0;
  private stats: GameStats;

  // Callbacks
  private onPointsChanged?: (points: number) => void;
  private onFishCountChanged?: (count: number) => void;
  private onGameOver?: (stats: GameStats) => void;
  private onInsufficientFunds?: (required: number, current: number) => void;

  constructor() {
    this._points = GAME_CONFIG.startingPoints;
    this.stats = {
      totalFishRaised: 1, // Start with 1 fish
      totalEggsCollected: 0,
      maxPointsReached: this._points,
      fishDied: 0,
      fishEatenByShark: 0,
    };
  }

  // Points management
  get points(): number {
    return this._points;
  }

  addPoints(amount: number): void {
    this._points += amount;
    this.stats.maxPointsReached = Math.max(this.stats.maxPointsReached, this._points);
    this.notifyPointsChanged();
  }

  spendPoints(amount: number): boolean {
    if (this._points >= amount) {
      this._points -= amount;
      this.notifyPointsChanged();
      return true;
    }
    return false;
  }

  canAfford(amount: number): boolean {
    return this._points >= amount;
  }

  canAffordFood(): boolean {
    return this.canAfford(GAME_CONFIG.feedCost);
  }

  canAffordFish(fishType: FishTypeKey = 'clownfish'): boolean {
    const cost = FISH_TYPES[fishType].cost;
    return this.canAfford(cost) && this._fishCount < GAME_CONFIG.maxFish;
  }

  getFishCost(fishType: FishTypeKey): number {
    return FISH_TYPES[fishType].cost;
  }

  // Fish management
  get fishCount(): number {
    return this._fishCount;
  }

  get maxFish(): number {
    return GAME_CONFIG.maxFish;
  }

  setFishCount(count: number): void {
    this._fishCount = count;
    this.notifyFishCountChanged();
  }

  addFish(): boolean {
    if (this._fishCount < GAME_CONFIG.maxFish) {
      this._fishCount++;
      this.stats.totalFishRaised++;
      this.notifyFishCountChanged();
      return true;
    }
    return false;
  }

  removeFish(eatenByShark: boolean = false): void {
    if (this._fishCount > 0) {
      this._fishCount--;
      this.stats.fishDied++;
      if (eatenByShark) {
        this.stats.fishEatenByShark++;
      }
      this.notifyFishCountChanged();

      // Check for game over
      if (this._fishCount === 0) {
        this.triggerGameOver();
      }
    }
  }

  // Purchase actions
  purchaseFood(): boolean {
    if (this.canAffordFood()) {
      this.spendPoints(GAME_CONFIG.feedCost);
      return true;
    }
    if (this.onInsufficientFunds) {
      this.onInsufficientFunds(GAME_CONFIG.feedCost, this._points);
    }
    return false;
  }

  purchaseFish(fishType: FishTypeKey = 'clownfish'): boolean {
    const cost = FISH_TYPES[fishType].cost;
    
    if (!this.canAffordFish(fishType)) {
      if (this._fishCount >= GAME_CONFIG.maxFish) {
        // Tank is full
        return false;
      }
      if (this.onInsufficientFunds) {
        this.onInsufficientFunds(cost, this._points);
      }
      return false;
    }

    this.spendPoints(cost);
    this.addFish();
    return true;
  }

  // Egg collection
  collectEgg(value: number): void {
    this.addPoints(value);
    this.stats.totalEggsCollected++;
  }

  // Stats
  getStats(): GameStats {
    return { ...this.stats };
  }

  // Callbacks
  setOnPointsChanged(callback: (points: number) => void): void {
    this.onPointsChanged = callback;
  }

  setOnFishCountChanged(callback: (count: number) => void): void {
    this.onFishCountChanged = callback;
  }

  setOnGameOver(callback: (stats: GameStats) => void): void {
    this.onGameOver = callback;
  }

  setOnInsufficientFunds(callback: (required: number, current: number) => void): void {
    this.onInsufficientFunds = callback;
  }

  private notifyPointsChanged(): void {
    if (this.onPointsChanged) {
      this.onPointsChanged(this._points);
    }
  }

  private notifyFishCountChanged(): void {
    if (this.onFishCountChanged) {
      this.onFishCountChanged(this._fishCount);
    }
  }

  private triggerGameOver(): void {
    if (this.onGameOver) {
      this.onGameOver(this.getStats());
    }
  }

  // Reset for new game
  reset(): void {
    this._points = GAME_CONFIG.startingPoints;
    this._fishCount = 0;
    this.stats = {
      totalFishRaised: 1,
      totalEggsCollected: 0,
      maxPointsReached: this._points,
      fishDied: 0,
      fishEatenByShark: 0,
    };
    this.notifyPointsChanged();
    this.notifyFishCountChanged();
  }
}
