import * as THREE from 'three';
import { GameStats } from '../managers/GameManager';
import { GAME_CONFIG } from '../config/gameConfig';

export class UIManager {
  private container: HTMLElement;

  // UI Elements
  private menuScreen!: HTMLElement;
  private gameUI!: HTMLElement;
  private gameOverScreen!: HTMLElement;
  private pointsDisplay!: HTMLElement;
  private fishCountDisplay!: HTMLElement;
  private buyFishButton!: HTMLElement;
  private insufficientFundsMessage!: HTMLElement;

  // Callbacks
  private onPlayClick?: () => void;
  private onBuyFishClick?: () => void;
  private onRetryClick?: () => void;
  private onMenuClick?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.createUI();
  }

  private createUI(): void {
    // Create main UI container
    const uiContainer = document.createElement('div');
    uiContainer.id = 'ui-container';
    this.container.appendChild(uiContainer);

    // Create menu screen
    this.createMenuScreen(uiContainer);

    // Create game UI
    this.createGameUI(uiContainer);

    // Create game over screen
    this.createGameOverScreen(uiContainer);
  }

  private createMenuScreen(parent: HTMLElement): void {
    this.menuScreen = document.createElement('div');
    this.menuScreen.className = 'screen menu-screen';
    this.menuScreen.innerHTML = `
      <h1 class="title">ACHOO!</h1>
      <p class="subtitle">3D Fish Aquarium</p>
      <button class="btn btn-primary play-btn">PLAY</button>
      <div class="instructions">
        <p>How to Play:</p>
        <ul>
          <li>Click in the tank to drop food (costs points)</li>
          <li>Fish eat food and grow bigger</li>
          <li>Adult fish produce eggs worth points</li>
          <li>Click eggs to collect them</li>
          <li>Buy more fish to grow your aquarium</li>
          <li>Don't let your fish starve!</li>
        </ul>
      </div>
    `;
    parent.appendChild(this.menuScreen);

    // Add play button listener
    const playBtn = this.menuScreen.querySelector('.play-btn') as HTMLElement;
    playBtn.addEventListener('click', () => {
      if (this.onPlayClick) this.onPlayClick();
    });
  }

  private createGameUI(parent: HTMLElement): void {
    this.gameUI = document.createElement('div');
    this.gameUI.className = 'screen game-ui hidden';
    this.gameUI.innerHTML = `
      <div class="top-bar">
        <div class="stats">
          <div class="points">Points: <span id="points-value">0</span></div>
          <div class="fish-count">Fish: <span id="fish-count-value">0/10</span></div>
        </div>
        <button class="btn btn-success buy-fish-btn">Buy Fish: ${GAME_CONFIG.babyFishCost}</button>
      </div>
      <div class="bottom-bar">
        <p>Click in tank to feed (Cost: ${GAME_CONFIG.feedCost} pts)</p>
      </div>
      <div class="insufficient-funds hidden">Not enough points!</div>
    `;
    parent.appendChild(this.gameUI);

    // Get references
    this.pointsDisplay = this.gameUI.querySelector('#points-value') as HTMLElement;
    this.fishCountDisplay = this.gameUI.querySelector('#fish-count-value') as HTMLElement;
    this.buyFishButton = this.gameUI.querySelector('.buy-fish-btn') as HTMLElement;
    this.insufficientFundsMessage = this.gameUI.querySelector('.insufficient-funds') as HTMLElement;

    // Add buy fish button listener
    this.buyFishButton.addEventListener('click', () => {
      if (this.onBuyFishClick) this.onBuyFishClick();
    });
  }

  private createGameOverScreen(parent: HTMLElement): void {
    this.gameOverScreen = document.createElement('div');
    this.gameOverScreen.className = 'screen game-over-screen hidden';
    this.gameOverScreen.innerHTML = `
      <h1 class="title game-over-title">GAME OVER</h1>
      <p class="subtitle">All your fish have died...</p>
      <div class="stats-panel">
        <h2>YOUR STATS</h2>
        <div class="stat-row">
          <span>Max Points Reached:</span>
          <span id="stat-max-points" class="stat-value">0</span>
        </div>
        <div class="stat-row">
          <span>Total Fish Raised:</span>
          <span id="stat-fish-raised" class="stat-value">0</span>
        </div>
        <div class="stat-row">
          <span>Eggs Collected:</span>
          <span id="stat-eggs" class="stat-value">0</span>
        </div>
        <div class="stat-row">
          <span>Fish Lost:</span>
          <span id="stat-fish-lost" class="stat-value">0</span>
        </div>
      </div>
      <div class="button-row">
        <button class="btn btn-primary retry-btn">TRY AGAIN</button>
        <button class="btn btn-secondary menu-btn">MENU</button>
      </div>
    `;
    parent.appendChild(this.gameOverScreen);

    // Add button listeners
    const retryBtn = this.gameOverScreen.querySelector('.retry-btn') as HTMLElement;
    retryBtn.addEventListener('click', () => {
      if (this.onRetryClick) this.onRetryClick();
    });

    const menuBtn = this.gameOverScreen.querySelector('.menu-btn') as HTMLElement;
    menuBtn.addEventListener('click', () => {
      if (this.onMenuClick) this.onMenuClick();
    });
  }

  // Callbacks setters
  public setOnPlayClick(callback: () => void): void {
    this.onPlayClick = callback;
  }

  public setOnBuyFishClick(callback: () => void): void {
    this.onBuyFishClick = callback;
  }

  public setOnRetryClick(callback: () => void): void {
    this.onRetryClick = callback;
  }

  public setOnMenuClick(callback: () => void): void {
    this.onMenuClick = callback;
  }

  // Show/hide screens
  public showMenu(): void {
    this.menuScreen.classList.remove('hidden');
    this.gameUI.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
  }

  public showGame(): void {
    this.menuScreen.classList.add('hidden');
    this.gameUI.classList.remove('hidden');
    this.gameOverScreen.classList.add('hidden');
  }

  public showGameOver(stats: GameStats): void {
    this.menuScreen.classList.add('hidden');
    this.gameUI.classList.add('hidden');
    this.gameOverScreen.classList.remove('hidden');

    // Update stats
    const maxPoints = this.gameOverScreen.querySelector('#stat-max-points') as HTMLElement;
    const fishRaised = this.gameOverScreen.querySelector('#stat-fish-raised') as HTMLElement;
    const eggs = this.gameOverScreen.querySelector('#stat-eggs') as HTMLElement;
    const fishLost = this.gameOverScreen.querySelector('#stat-fish-lost') as HTMLElement;

    maxPoints.textContent = stats.maxPointsReached.toString();
    fishRaised.textContent = stats.totalFishRaised.toString();
    eggs.textContent = stats.totalEggsCollected.toString();
    fishLost.textContent = stats.fishDied.toString();
  }

  // Update UI elements
  public updatePoints(points: number): void {
    this.pointsDisplay.textContent = points.toString();
    this.pointsDisplay.classList.add('pulse');
    setTimeout(() => {
      this.pointsDisplay.classList.remove('pulse');
    }, 200);
  }

  public updateFishCount(count: number, max: number): void {
    this.fishCountDisplay.textContent = `${count}/${max}`;
  }

  public showInsufficientFunds(required: number, current: number): void {
    this.insufficientFundsMessage.textContent = `Not enough points! Need ${required}, have ${current}`;
    this.insufficientFundsMessage.classList.remove('hidden');
    setTimeout(() => {
      this.insufficientFundsMessage.classList.add('hidden');
    }, 2000);
  }

  public showPointsPopup(_position: THREE.Vector3, value: number): void {
    // Create floating points popup
    const popup = document.createElement('div');
    popup.className = 'points-popup';
    popup.textContent = `+${value}`;

    // Position would need 3D to 2D projection - for now use center
    popup.style.left = '50%';
    popup.style.top = '40%';

    this.gameUI.appendChild(popup);

    // Animate and remove
    setTimeout(() => {
      popup.classList.add('fade-out');
      setTimeout(() => {
        popup.remove();
      }, 500);
    }, 500);
  }
}
