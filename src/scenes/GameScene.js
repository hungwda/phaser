/**
 * GameScene.js
 *
 * Main game scene with physics, gameplay mechanics, and level management.
 * Demonstrates a robust game implementation with proper state management.
 */

import Phaser from 'phaser';
import { CONSTANTS } from '@config/GameConfig';
import eventBus from '@utils/EventBus';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: CONSTANTS.SCENES.GAME });
  }

  /**
   * Initialize the scene
   */
  init() {
    console.log('[GameScene] Initializing...');

    // Initialize game state
    this.gameState = {
      score: 0,
      lives: 3,
      level: 1,
      isGameOver: false,
      isPaused: false
    };

    // Physics groups
    this.platforms = null;
    this.collectibles = null;
    this.enemies = null;

    // Player reference
    this.player = null;

    // UI elements
    this.scoreText = null;
    this.livesText = null;
  }

  /**
   * Create the game scene
   */
  create() {
    console.log('[GameScene] Creating game scene...');

    const { width, height } = this.cameras.main;

    // Create background
    this.createBackground(width, height);

    // Create platforms
    this.createPlatforms();

    // Create player
    this.createPlayer();

    // Create collectibles
    this.createCollectibles();

    // Create UI
    this.createUI(width);

    // Set up collisions
    this.setupCollisions();

    // Set up input
    this.setupInput();

    // Set up camera
    this.setupCamera();

    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  /**
   * Create background
   */
  createBackground(width, height) {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x1e90ff, 0x1e90ff, 1);
    graphics.fillRect(0, 0, width, height);
  }

  /**
   * Create platforms
   */
  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    const { width, height } = this.cameras.main;

    // Ground platform
    for (let i = 0; i < width / 64; i++) {
      this.platforms.create(i * 64 + 32, height - 16, 'platform');
    }

    // Floating platforms
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(400, 350, 'platform');
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(300, 250, 'platform');
    this.platforms.create(500, 200, 'platform');
  }

  /**
   * Create player
   */
  createPlayer() {
    const { width, height } = this.cameras.main;

    this.player = this.physics.add.sprite(100, height - 100, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Player properties
    this.player.body.setGravityY(300);

    // Add visual indicator for player
    this.player.setTint(0x00ff00);
  }

  /**
   * Create collectibles
   */
  createCollectibles() {
    this.collectibles = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 70, y: 0, stepX: 70 }
    });

    this.collectibles.children.iterate((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      child.setTint(0xffff00);
    });
  }

  /**
   * Create UI
   */
  createUI(width) {
    // Score text
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      font: 'bold 24px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(100);

    // Lives text
    this.livesText = this.add.text(width - 16, 16, 'Lives: 3', {
      font: 'bold 24px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(1, 0);
    this.livesText.setScrollFactor(0);
    this.livesText.setDepth(100);

    // Instructions
    this.add.text(width / 2, 60, 'Arrow Keys to Move | SPACE to Jump | ESC to Menu', {
      font: '16px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
  }

  /**
   * Set up collisions
   */
  setupCollisions() {
    // Player collides with platforms
    this.physics.add.collider(this.player, this.platforms);

    // Collectibles collide with platforms
    this.physics.add.collider(this.collectibles, this.platforms);

    // Player collects collectibles
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );
  }

  /**
   * Set up input
   */
  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();

    // Additional keys
    this.keys = {
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      esc: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    };

    // ESC to return to menu
    this.keys.esc.on('down', () => {
      this.returnToMenu();
    });
  }

  /**
   * Set up camera
   */
  setupCamera() {
    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }

  /**
   * Collect item
   */
  collectItem(player, item) {
    item.disableBody(true, true);

    // Update score
    this.updateScore(10);

    // Play sound effect (if available)
    // this.sound.play('collect');

    // Check if all items collected
    if (this.collectibles.countActive(true) === 0) {
      this.levelComplete();
    }
  }

  /**
   * Update score
   */
  updateScore(points) {
    this.gameState.score += points;
    this.scoreText.setText(`Score: ${this.gameState.score}`);
    eventBus.emit(CONSTANTS.EVENTS.SCORE_UPDATE, this.gameState.score);
  }

  /**
   * Level complete
   */
  levelComplete() {
    console.log('[GameScene] Level complete!');

    // Respawn collectibles
    this.collectibles.children.iterate((child) => {
      child.enableBody(true, child.x, 0, true, true);
    });

    // Increase difficulty
    this.gameState.level++;

    // Show level complete message
    const { width, height } = this.cameras.main;
    const message = this.add.text(
      width / 2,
      height / 2,
      `Level ${this.gameState.level - 1} Complete!\nGet ready...`,
      {
        font: 'bold 32px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'
      }
    ).setOrigin(0.5).setScrollFactor(0);

    this.time.delayedCall(2000, () => {
      message.destroy();
    });
  }

  /**
   * Game over
   */
  gameOver() {
    console.log('[GameScene] Game over!');
    this.gameState.isGameOver = true;

    // Stop physics
    this.physics.pause();

    // Show game over message
    const { width, height } = this.cameras.main;
    this.add.text(
      width / 2,
      height / 2,
      'GAME OVER\nPress ESC for Menu',
      {
        font: 'bold 48px Arial',
        fill: '#ff0000',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center'
      }
    ).setOrigin(0.5).setScrollFactor(0);
  }

  /**
   * Return to menu
   */
  returnToMenu() {
    console.log('[GameScene] Returning to menu...');
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(CONSTANTS.SCENES.MENU);
    });
  }

  /**
   * Update the scene
   */
  update() {
    if (this.gameState.isGameOver || this.gameState.isPaused) {
      return;
    }

    // Player movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    // Player jump
    if (this.keys.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // Check if player fell off the world
    if (this.player.y > this.cameras.main.height + 100) {
      this.playerDied();
    }
  }

  /**
   * Player died
   */
  playerDied() {
    this.gameState.lives--;
    this.livesText.setText(`Lives: ${this.gameState.lives}`);

    if (this.gameState.lives <= 0) {
      this.gameOver();
    } else {
      // Respawn player
      this.player.setPosition(100, this.cameras.main.height - 100);
      this.player.setVelocity(0, 0);
    }
  }

  /**
   * Clean up
   */
  shutdown() {
    console.log('[GameScene] Shutting down...');
    this.input.keyboard.removeAllListeners();
  }
}

export default GameScene;
