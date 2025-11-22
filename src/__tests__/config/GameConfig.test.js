/**
 * GameConfig.test.js
 * Test suite for the GameConfig module
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { gameConfig, ENV, getCurrentEnv, CONSTANTS } from '../../config/GameConfig.js';

describe('GameConfig', () => {
  describe('Game Configuration Object', () => {
    test('should have valid game configuration', () => {
      expect(gameConfig).toBeDefined();
      expect(gameConfig.type).toBeDefined();
      expect(gameConfig.parent).toBe('game-container');
      expect(gameConfig.backgroundColor).toBe('#028af8');
    });

    test('should have scale configuration', () => {
      expect(gameConfig.scale).toBeDefined();
      expect(gameConfig.scale.width).toBe(800);
      expect(gameConfig.scale.height).toBe(600);
      expect(gameConfig.scale.min).toBeDefined();
      expect(gameConfig.scale.max).toBeDefined();
    });

    test('should have min scale configuration', () => {
      expect(gameConfig.scale.min.width).toBe(400);
      expect(gameConfig.scale.min.height).toBe(300);
    });

    test('should have max scale configuration', () => {
      expect(gameConfig.scale.max.width).toBe(1600);
      expect(gameConfig.scale.max.height).toBe(1200);
    });

    test('should have snap configuration', () => {
      expect(gameConfig.scale.snap).toBeDefined();
      expect(gameConfig.scale.snap.x).toBe(1);
      expect(gameConfig.scale.snap.y).toBe(1);
    });

    test('should have physics configuration', () => {
      expect(gameConfig.physics).toBeDefined();
      expect(gameConfig.physics.default).toBe('arcade');
      expect(gameConfig.physics.arcade).toBeDefined();
    });

    test('should have arcade physics configuration', () => {
      expect(gameConfig.physics.arcade.gravity).toBeDefined();
      expect(gameConfig.physics.arcade.gravity.y).toBe(300);
      expect(gameConfig.physics.arcade.debug).toBe(false);
    });

    test('should have render configuration', () => {
      expect(gameConfig.render).toBeDefined();
      expect(gameConfig.render.pixelArt).toBe(false);
      expect(gameConfig.render.antialias).toBe(true);
      expect(gameConfig.render.powerPreference).toBe('high-performance');
    });

    test('should have FPS configuration', () => {
      expect(gameConfig.fps).toBeDefined();
      expect(gameConfig.fps.target).toBe(60);
      expect(gameConfig.fps.smoothStep).toBe(true);
    });

    test('should have audio configuration', () => {
      expect(gameConfig.audio).toBeDefined();
      expect(gameConfig.audio.disableWebAudio).toBe(false);
      expect(gameConfig.audio.noAudio).toBe(false);
    });

    test('should have input configuration', () => {
      expect(gameConfig.input).toBeDefined();
      expect(gameConfig.input.keyboard).toBe(true);
      expect(gameConfig.input.mouse).toBe(true);
      expect(gameConfig.input.touch).toBe(true);
      expect(gameConfig.input.gamepad).toBe(false);
    });

    test('should have DOM configuration', () => {
      expect(gameConfig.dom).toBeDefined();
      expect(gameConfig.dom.createContainer).toBe(false);
    });

    test('should have loader configuration', () => {
      expect(gameConfig.loader).toBeDefined();
      expect(gameConfig.loader.maxParallelDownloads).toBe(4);
      expect(gameConfig.loader.crossOrigin).toBe('anonymous');
      expect(gameConfig.loader.timeout).toBe(30000);
    });

    test('should have banner configuration', () => {
      expect(gameConfig.banner).toBeDefined();
      expect(gameConfig.banner.hidePhaser).toBe(false);
      expect(gameConfig.banner.text).toBe('#fff');
      expect(gameConfig.banner.background).toBeInstanceOf(Array);
    });
  });

  describe('Environment Configuration', () => {
    test('should have development environment configuration', () => {
      expect(ENV.development).toBeDefined();
      expect(ENV.development.debug).toBe(true);
      expect(ENV.development.showFPS).toBe(true);
      expect(ENV.development.logLevel).toBe('debug');
    });

    test('should have production environment configuration', () => {
      expect(ENV.production).toBeDefined();
      expect(ENV.production.debug).toBe(false);
      expect(ENV.production.showFPS).toBe(false);
      expect(ENV.production.logLevel).toBe('error');
    });
  });

  describe('Get Current Environment', () => {
    test('should return environment configuration', () => {
      const currentEnv = getCurrentEnv();

      expect(currentEnv).toBeDefined();
      expect(currentEnv.debug).toBeDefined();
      expect(currentEnv.showFPS).toBeDefined();
      expect(currentEnv.logLevel).toBeDefined();
    });

    test('should return development or production environment', () => {
      const currentEnv = getCurrentEnv();

      const isValidEnv =
        currentEnv.logLevel === 'debug' || currentEnv.logLevel === 'error';

      expect(isValidEnv).toBe(true);
    });

    test('should have consistent debug and showFPS settings', () => {
      const currentEnv = getCurrentEnv();

      if (currentEnv.debug === true) {
        expect(currentEnv.showFPS).toBe(true);
        expect(currentEnv.logLevel).toBe('debug');
      } else {
        expect(currentEnv.showFPS).toBe(false);
        expect(currentEnv.logLevel).toBe('error');
      }
    });
  });

  describe('Constants', () => {
    test('should have scene constants', () => {
      expect(CONSTANTS.SCENES).toBeDefined();
      expect(CONSTANTS.SCENES.BOOT).toBe('BootScene');
      expect(CONSTANTS.SCENES.PRELOAD).toBe('PreloadScene');
      expect(CONSTANTS.SCENES.MENU).toBe('MenuScene');
      expect(CONSTANTS.SCENES.GAME).toBe('GameScene');
      expect(CONSTANTS.SCENES.UI).toBe('UIScene');
    });

    test('should have asset constants', () => {
      expect(CONSTANTS.ASSETS).toBeDefined();
      expect(CONSTANTS.ASSETS.IMAGES).toBe('images');
      expect(CONSTANTS.ASSETS.SPRITES).toBe('sprites');
      expect(CONSTANTS.ASSETS.AUDIO).toBe('audio');
      expect(CONSTANTS.ASSETS.FONTS).toBe('fonts');
    });

    test('should have event constants', () => {
      expect(CONSTANTS.EVENTS).toBeDefined();
      expect(CONSTANTS.EVENTS.GAME_READY).toBe('game:ready');
      expect(CONSTANTS.EVENTS.LEVEL_COMPLETE).toBe('level:complete');
      expect(CONSTANTS.EVENTS.SCORE_UPDATE).toBe('score:update');
      expect(CONSTANTS.EVENTS.CONTEXT_LOST).toBe('context:lost');
      expect(CONSTANTS.EVENTS.CONTEXT_RESTORED).toBe('context:restored');
    });

    test('should have all expected scenes', () => {
      const expectedScenes = ['BOOT', 'PRELOAD', 'MENU', 'GAME', 'UI'];
      const sceneKeys = Object.keys(CONSTANTS.SCENES);

      expectedScenes.forEach(scene => {
        expect(sceneKeys).toContain(scene);
      });
    });

    test('should have all expected asset types', () => {
      const expectedAssets = ['IMAGES', 'SPRITES', 'AUDIO', 'FONTS'];
      const assetKeys = Object.keys(CONSTANTS.ASSETS);

      expectedAssets.forEach(asset => {
        expect(assetKeys).toContain(asset);
      });
    });

    test('should have all expected events', () => {
      const expectedEvents = [
        'GAME_READY',
        'LEVEL_COMPLETE',
        'SCORE_UPDATE',
        'CONTEXT_LOST',
        'CONTEXT_RESTORED'
      ];
      const eventKeys = Object.keys(CONSTANTS.EVENTS);

      expectedEvents.forEach(event => {
        expect(eventKeys).toContain(event);
      });
    });
  });

  describe('Configuration Validation', () => {
    test('should have valid scale dimensions', () => {
      expect(gameConfig.scale.width).toBeGreaterThan(0);
      expect(gameConfig.scale.height).toBeGreaterThan(0);
      expect(gameConfig.scale.min.width).toBeLessThan(gameConfig.scale.width);
      expect(gameConfig.scale.max.width).toBeGreaterThan(gameConfig.scale.width);
    });

    test('should have valid FPS target', () => {
      expect(gameConfig.fps.target).toBeGreaterThan(0);
      expect(gameConfig.fps.target).toBeLessThanOrEqual(144);
    });

    test('should have valid loader timeout', () => {
      expect(gameConfig.loader.timeout).toBeGreaterThan(0);
      expect(gameConfig.loader.maxParallelDownloads).toBeGreaterThan(0);
    });

    test('should have valid physics gravity', () => {
      expect(gameConfig.physics.arcade.gravity.y).toBeDefined();
      expect(typeof gameConfig.physics.arcade.gravity.y).toBe('number');
    });

    test('should have valid render settings', () => {
      expect(typeof gameConfig.render.antialias).toBe('boolean');
      expect(typeof gameConfig.render.pixelArt).toBe('boolean');
      expect(['low-power', 'high-performance', 'default']).toContain(
        gameConfig.render.powerPreference
      );
    });
  });

  describe('Default Export', () => {
    test('should export gameConfig as default', async () => {
      const module = await import('../../config/GameConfig.js');
      expect(module.default).toBe(gameConfig);
    });
  });

  describe('Type Checks', () => {
    test('should have correct types for all configurations', () => {
      expect(typeof gameConfig.parent).toBe('string');
      expect(typeof gameConfig.backgroundColor).toBe('string');
      expect(typeof gameConfig.scale).toBe('object');
      expect(typeof gameConfig.physics).toBe('object');
      expect(typeof gameConfig.render).toBe('object');
      expect(typeof gameConfig.fps).toBe('object');
      expect(typeof gameConfig.audio).toBe('object');
      expect(typeof gameConfig.input).toBe('object');
      expect(typeof gameConfig.dom).toBe('object');
      expect(typeof gameConfig.loader).toBe('object');
      expect(typeof gameConfig.banner).toBe('object');
    });

    test('should have correct types for environment configurations', () => {
      expect(typeof ENV.development.debug).toBe('boolean');
      expect(typeof ENV.development.showFPS).toBe('boolean');
      expect(typeof ENV.development.logLevel).toBe('string');
      expect(typeof ENV.production.debug).toBe('boolean');
      expect(typeof ENV.production.showFPS).toBe('boolean');
      expect(typeof ENV.production.logLevel).toBe('string');
    });

    test('should have correct types for constants', () => {
      Object.values(CONSTANTS.SCENES).forEach(scene => {
        expect(typeof scene).toBe('string');
      });

      Object.values(CONSTANTS.ASSETS).forEach(asset => {
        expect(typeof asset).toBe('string');
      });

      Object.values(CONSTANTS.EVENTS).forEach(event => {
        expect(typeof event).toBe('string');
      });
    });
  });
});
