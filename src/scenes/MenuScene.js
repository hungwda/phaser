/**
 * MenuScene.js
 *
 * Main menu scene with navigation and options.
 * Demonstrates UI creation and scene transitions.
 */

import Phaser from 'phaser';
import { CONSTANTS } from '@config/GameConfig';
import eventBus from '@utils/EventBus';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: CONSTANTS.SCENES.MENU });
  }

  /**
   * Initialize the scene
   */
  init() {
    console.log('[MenuScene] Initializing...');
  }

  /**
   * Create the menu
   */
  create() {
    console.log('[MenuScene] Creating menu...');

    const { width, height } = this.cameras.main;

    // Create background
    this.createBackground(width, height);

    // Create title
    this.createTitle(width, height);

    // Create menu buttons
    this.createMenuButtons(width, height);

    // Create credits
    this.createCredits(width, height);

    // Add keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  /**
   * Create background
   */
  createBackground(width, height) {
    // Create gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x028af8, 0x028af8, 0x001f3f, 0x001f3f, 1);
    graphics.fillRect(0, 0, width, height);

    // Add some decorative elements
    this.createStars(width, height);
  }

  /**
   * Create animated stars in background
   */
  createStars(width, height) {
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);

      const star = this.add.circle(x, y, size, 0xffffff, 0.8);

      // Twinkle animation
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Create title
   */
  createTitle(width, height) {
    const title = this.add.text(width / 2, height / 4, 'PHASER GAME', {
      font: 'bold 64px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Title animation
    this.tweens.add({
      targets: title,
      y: title.y - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.add.text(width / 2, height / 4 + 60, 'A Robust HTML5 Game', {
      font: '24px Arial',
      fill: '#aaaaaa'
    }).setOrigin(0.5);
  }

  /**
   * Create menu buttons
   */
  createMenuButtons(width, height) {
    const buttonY = height / 2;
    const buttonSpacing = 80;

    // Start Game button
    this.createButton(
      width / 2,
      buttonY,
      'START GAME',
      () => this.startGame()
    );

    // Options button
    this.createButton(
      width / 2,
      buttonY + buttonSpacing,
      'OPTIONS',
      () => this.showOptions()
    );

    // Kannada Learning button
    this.createButton(
      width / 2,
      buttonY + buttonSpacing,
      'LEARN KANNADA',
      () => this.startKannadaLearning()
    );

    // Credits button
    this.createButton(
      width / 2,
      buttonY + buttonSpacing * 2,
      'CREDITS',
      () => this.showCredits()
    );
  }

  /**
   * Create a button
   */
  createButton(x, y, text, callback) {
    const buttonWidth = 300;
    const buttonHeight = 60;

    // Button background
    const bg = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x00ff00, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    // Button text
    const label = this.add.text(x, y, text, {
      font: 'bold 24px Arial',
      fill: '#000000'
    }).setOrigin(0.5);

    // Button container
    const container = this.add.container(0, 0, [bg, label]);

    // Hover effects
    bg.on('pointerover', () => {
      bg.setFillStyle(0x00ff00, 1);
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Power2'
      });
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(0x00ff00, 0.8);
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Power2'
      });
    });

    // Click handler
    bg.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: callback
      });
    });

    return container;
  }

  /**
   * Create credits
   */
  createCredits(width, height) {
    this.add.text(width / 2, height - 30, 'Built with Phaser 3 | Press SPACE to start', {
      font: '16px Arial',
      fill: '#888888'
    }).setOrigin(0.5);
  }

  /**
   * Set up keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    this.input.keyboard.on('keydown-SPACE', () => {
      this.startGame();
    });

    this.input.keyboard.on('keydown-ESC', () => {
      // Handle escape if needed
    });
  }

  /**
   * Start the game
   */
  startGame() {
    console.log('[MenuScene] Starting game...');

    // Fade out and transition
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(CONSTANTS.SCENES.GAME);
    });
  }

  /**
   * Start Kannada Learning Hub
   */
  startKannadaLearning() {
    console.log('[MenuScene] Starting Kannada Learning Hub...');

    // Fade out and transition
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameHubScene');
    });
  }

  /**
   * Show options
   */
  showOptions() {
    console.log('[MenuScene] Showing options...');
    // In a real game, this would open an options menu
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Options menu coming soon!',
      {
        font: '32px Arial',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5);
  }

  /**
   * Show credits
   */
  showCredits() {
    console.log('[MenuScene] Showing credits...');
    // In a real game, this would show credits
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Created with Phaser 3\nA Robust Game Framework',
      {
        font: '24px Arial',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 },
        align: 'center'
      }
    ).setOrigin(0.5);
  }

  /**
   * Update the scene
   */
  update() {
    // Menu update logic if needed
  }

  /**
   * Clean up
   */
  shutdown() {
    console.log('[MenuScene] Shutting down...');
    this.input.keyboard.removeAllListeners();
  }
}

export default MenuScene;
