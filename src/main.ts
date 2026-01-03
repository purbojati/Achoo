import { Game } from './core/Game';
import './ui/styles.css';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  
  if (!container) {
    console.error('Game container not found!');
    return;
  }

  const game = new Game(container);
  game.start();
});
