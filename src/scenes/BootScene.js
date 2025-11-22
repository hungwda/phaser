/**
 * BootScene.js
 *
 * Initial boot scene that sets up the game environment.
 * Handles initial setup, plugin initialization, and transitions to preload.
 */

import Phaser from 'phaser';
import { CONSTANTS } from '@config/GameConfig';
import eventBus from '@utils/EventBus';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: CONSTANTS.SCENES.BOOT });
  }

  /**
   * Initialize the scene
   */
  init() {
    console.log('[BootScene] Initializing...');
    this.setupEventListeners();
  }

  /**
   * Preload minimal assets needed for loading screen
   */
  preload() {
    console.log('[BootScene] Loading boot assets...');

    // Create simple loading graphics
    this.createLoadingGraphics();
  }

  /**
   * Create the scene
   */
  create() {
    console.log('[BootScene] Creating boot scene...');

    // Set up global game configuration
    this.setupGlobalConfiguration();

    // Initialize plugins
    this.initializePlugins();

    // Check WebGL support
    this.checkWebGLSupport();

    // Emit boot complete event
    eventBus.emit(CONSTANTS.EVENTS.GAME_READY);

    // Transition to preload scene
    this.time.delayedCall(500, () => {
      this.scene.start(CONSTANTS.SCENES.PRELOAD);
    });
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for context loss/restore
    this.game.events.on(CONSTANTS.EVENTS.CONTEXT_LOST, this.onContextLost, this);
    this.game.events.on(CONSTANTS.EVENTS.CONTEXT_RESTORED, this.onContextRestored, this);
  }

  /**
   * Set up global configuration
   */
  setupGlobalConfiguration() {
    // Set up scale manager
    this.scale.on('resize', this.onResize, this);

    // Set up input
    this.input.maxPointers = 1;

    // Disable right-click context menu
    this.input.mouse.disableContextMenu();

    // Set up sound
    this.sound.pauseOnBlur = true;
  }

  /**
   * Initialize custom plugins
   */
  initializePlugins() {
    console.log('[BootScene] Initializing plugins...');
    // Custom plugins can be initialized here
    // Example: this.game.plugins.install('CustomPlugin', CustomPlugin, true);
  }

  /**
   * Check WebGL support
   */
  checkWebGLSupport() {
    const renderer = this.game.renderer;

    if (renderer.type === Phaser.WEBGL) {
      console.log('[BootScene] WebGL renderer active');
      console.log(`[BootScene] WebGL Version: ${renderer.gl.getParameter(renderer.gl.VERSION)}`);
    } else {
      console.warn('[BootScene] Canvas renderer active (WebGL not supported)');
    }
  }

  /**
   * Create loading graphics
   */
  createLoadingGraphics() {
    const { width, height } = this.cameras.main;

    // Create loading text
    this.add.text(width / 2, height / 2, 'Initializing...', {
      font: '24px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  /**
   * Handle resize events
   */
  onResize(gameSize) {
    console.log(`[BootScene] Game resized to ${gameSize.width}x${gameSize.height}`);
  }

  /**
   * Handle context lost
   */
  onContextLost() {
    console.warn('[BootScene] WebGL context lost');
  }

  /**
   * Handle context restored
   */
  onContextRestored() {
    console.log('[BootScene] WebGL context restored');
  }

  /**
   * Clean up
   */
  shutdown() {
    console.log('[BootScene] Shutting down...');
    this.scale.off('resize', this.onResize, this);
    this.game.events.off(CONSTANTS.EVENTS.CONTEXT_LOST, this.onContextLost, this);
    this.game.events.off(CONSTANTS.EVENTS.CONTEXT_RESTORED, this.onContextRestored, this);
  }
}

export default BootScene;
