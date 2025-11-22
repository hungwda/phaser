/**
 * GameConfig.js
 *
 * Central configuration for the Phaser game.
 * This modular approach allows easy customization and environment-specific settings.
 */

import Phaser from 'phaser';

/**
 * Game configuration object
 * @type {Phaser.Types.Core.GameConfig}
 */
export const gameConfig = {
  type: Phaser.AUTO, // Automatically select WebGL or Canvas
  parent: 'game-container',
  backgroundColor: '#028af8',

  // Scale configuration for responsive design
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
    min: {
      width: 400,
      height: 300
    },
    max: {
      width: 1600,
      height: 1200
    },
    // Snap mode for pixel-perfect scaling
    snap: {
      x: 1,
      y: 1
    }
  },

  // Physics configuration
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },

  // Render configuration
  render: {
    pixelArt: false,
    antialias: true,
    antialiasGL: true,
    mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
    roundPixels: false,
    powerPreference: 'high-performance',
    batchSize: 4096,
    maxTextures: 16
  },

  // Performance optimizations
  fps: {
    target: 60,
    forceSetTimeOut: false,
    deltaHistory: 10,
    panicMax: 120,
    smoothStep: true
  },

  // Audio configuration
  audio: {
    disableWebAudio: false,
    noAudio: false
  },

  // Input configuration
  input: {
    keyboard: true,
    mouse: true,
    touch: true,
    gamepad: false
  },

  // DOM configuration
  dom: {
    createContainer: false
  },

  // Loader configuration
  loader: {
    baseURL: '',
    path: '',
    maxParallelDownloads: 4,
    crossOrigin: 'anonymous',
    timeout: 30000
  },

  // Banner configuration
  banner: {
    hidePhaser: false,
    text: '#fff',
    background: [
      '#ff0000',
      '#ffff00',
      '#00ff00',
      '#00ffff',
      '#000000'
    ]
  }
};

/**
 * Environment-specific configurations
 */
export const ENV = {
  development: {
    debug: true,
    showFPS: true,
    logLevel: 'debug'
  },
  production: {
    debug: false,
    showFPS: false,
    logLevel: 'error'
  }
};

/**
 * Get current environment configuration
 */
export const getCurrentEnv = () => {
  const isDev = import.meta.env.DEV;
  return isDev ? ENV.development : ENV.production;
};

/**
 * Game constants
 */
export const CONSTANTS = {
  SCENES: {
    BOOT: 'BootScene',
    PRELOAD: 'PreloadScene',
    MENU: 'MenuScene',
    GAME: 'GameScene',
    UI: 'UIScene'
  },
  ASSETS: {
    IMAGES: 'images',
    SPRITES: 'sprites',
    AUDIO: 'audio',
    FONTS: 'fonts'
  },
  EVENTS: {
    GAME_READY: 'game:ready',
    LEVEL_COMPLETE: 'level:complete',
    SCORE_UPDATE: 'score:update',
    CONTEXT_LOST: 'context:lost',
    CONTEXT_RESTORED: 'context:restored'
  }
};

export default gameConfig;
