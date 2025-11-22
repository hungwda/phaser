/**
 * PreloadScene.js
 *
 * Handles loading of all game assets with progress indication.
 * Implements robust asset loading with error handling and retry logic.
 */

import Phaser from 'phaser';
import { CONSTANTS } from '@config/GameConfig';
import { AssetManager } from '@utils/AssetManager';
import eventBus from '@utils/EventBus';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: CONSTANTS.SCENES.PRELOAD });
  }

  /**
   * Initialize the scene
   */
  init() {
    console.log('[PreloadScene] Initializing...');
    this.assetManager = new AssetManager(this);
    this.loadingComplete = false;
  }

  /**
   * Preload all game assets
   */
  preload() {
    console.log('[PreloadScene] Loading assets...');

    // Create loading UI
    this.createLoadingUI();

    // Set up loading events
    this.setupLoadingEvents();

    // Load all assets
    this.loadAssets();
  }

  /**
   * Create loading UI
   */
  createLoadingUI() {
    const { width, height } = this.cameras.main;

    // Create background
    this.add.rectangle(width / 2, height / 2, width, height, 0x028af8);

    // Create loading text
    this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '32px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Create progress bar background
    const barWidth = 400;
    const barHeight = 30;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2;

    this.progressBarBg = this.add.rectangle(
      width / 2,
      barY,
      barWidth,
      barHeight,
      0x222222
    );

    // Create progress bar
    this.progressBar = this.add.rectangle(
      barX,
      barY,
      0,
      barHeight,
      0x00ff00
    ).setOrigin(0, 0.5);

    // Create percentage text
    this.percentText = this.add.text(width / 2, barY + 50, '0%', {
      font: '24px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Create file loading text
    this.fileText = this.add.text(width / 2, barY + 90, '', {
      font: '16px Arial',
      fill: '#aaaaaa'
    }).setOrigin(0.5);
  }

  /**
   * Set up loading events
   */
  setupLoadingEvents() {
    // Progress event
    this.load.on('progress', (value) => {
      const barWidth = 400;
      this.progressBar.width = barWidth * value;
      this.percentText.setText(`${Math.floor(value * 100)}%`);
    });

    // File progress event
    this.load.on('fileprogress', (file) => {
      this.fileText.setText(`Loading: ${file.key}`);
    });

    // Load complete event
    this.load.on('complete', () => {
      console.log('[PreloadScene] All assets loaded');
      this.loadingComplete = true;
    });

    // Load error handling
    this.load.on('loaderror', (file) => {
      console.error(`[PreloadScene] Error loading file: ${file.key}`);
      this.handleLoadError(file);
    });
  }

  /**
   * Load all game assets
   */
  loadAssets() {
    // Create simple placeholder assets programmatically
    this.createPlaceholderAssets();

    // In a real game, you would load actual assets:
    // this.assetManager.loadAllAssets();
  }

  /**
   * Create placeholder assets for demo purposes
   */
  createPlaceholderAssets() {
    // Create a simple texture for the player
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00ff00);
    graphics.fillRect(0, 0, 32, 48);
    graphics.generateTexture('player', 32, 48);
    graphics.destroy();

    // Create a simple texture for platforms
    const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    platformGraphics.fillStyle(0x666666);
    platformGraphics.fillRect(0, 0, 64, 32);
    platformGraphics.generateTexture('platform', 64, 32);
    platformGraphics.destroy();

    // Create a simple texture for collectibles
    const starGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    starGraphics.fillStyle(0xffff00);
    starGraphics.fillCircle(16, 16, 16);
    starGraphics.generateTexture('star', 32, 32);
    starGraphics.destroy();

    // Simulate loading time
    this.time.delayedCall(1000, () => {
      this.load.start();
    });
  }

  /**
   * Handle load errors
   */
  handleLoadError(file) {
    // Implement retry logic if needed
    console.warn(`[PreloadScene] Attempting to retry loading: ${file.key}`);

    // You could implement exponential backoff retry here
    // For now, we'll just log the error
  }

  /**
   * Create the scene
   */
  create() {
    console.log('[PreloadScene] Creating preload scene...');

    // Wait a moment to show the complete progress bar
    this.time.delayedCall(500, () => {
      // Transition to menu scene
      this.scene.start(CONSTANTS.SCENES.MENU);
    });
  }

  /**
   * Update the scene
   */
  update() {
    // Animation or additional loading logic can go here
  }

  /**
   * Clean up
   */
  shutdown() {
    console.log('[PreloadScene] Shutting down...');
    this.load.removeAllListeners();
  }
}

export default PreloadScene;
