import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config/settings.js';

const config = {
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#34495e',
  scene: [GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

const game = new Phaser.Game(config);

export default game;

