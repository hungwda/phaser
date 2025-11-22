/**
 * AssetManager.test.js
 * Test suite for the AssetManager utility
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { AssetManager } from '../../utils/AssetManager.js';

describe('AssetManager', () => {
  let assetManager;
  let mockScene;

  beforeEach(() => {
    // Create mock scene with all necessary methods
    mockScene = {
      load: {
        image: jest.fn(),
        spritesheet: jest.fn(),
        audio: jest.fn(),
        progress: 0.5,
      },
      textures: {
        exists: jest.fn(() => false),
        addImage: jest.fn(),
        remove: jest.fn(),
      },
      cache: {
        audio: {
          exists: jest.fn(() => false),
          remove: jest.fn(),
        },
      },
    };

    assetManager = new AssetManager(mockScene);
  });

  describe('Constructor', () => {
    test('should create an AssetManager instance', () => {
      expect(assetManager).toBeDefined();
      expect(assetManager.scene).toBe(mockScene);
      expect(assetManager.loadedAssets).toBeInstanceOf(Map);
    });

    test('should initialize asset manifest', () => {
      expect(assetManager.assetManifest).toBeDefined();
      expect(assetManager.assetManifest.images).toBeDefined();
      expect(assetManager.assetManifest.sprites).toBeDefined();
      expect(assetManager.assetManifest.audio).toBeDefined();
    });
  });

  describe('Asset Manifest', () => {
    test('should return valid asset manifest structure', () => {
      const manifest = assetManager.getAssetManifest();

      expect(manifest).toHaveProperty('images');
      expect(manifest).toHaveProperty('sprites');
      expect(manifest).toHaveProperty('audio');
    });

    test('should include default assets in manifest', () => {
      const manifest = assetManager.assetManifest;

      expect(manifest.images.logo).toBeDefined();
      expect(manifest.images.background).toBeDefined();
      expect(manifest.sprites.player).toBeDefined();
      expect(manifest.audio.bgm).toBeDefined();
    });
  });

  describe('Load Image', () => {
    test('should load an image if not already loaded', () => {
      assetManager.loadImage('test-key', 'test/path.png');

      expect(mockScene.textures.exists).toHaveBeenCalledWith('test-key');
      expect(mockScene.load.image).toHaveBeenCalledWith('test-key', 'test/path.png');
      expect(assetManager.loadedAssets.has('test-key')).toBe(true);
    });

    test('should not reload an image if already exists', () => {
      mockScene.textures.exists = jest.fn(() => true);

      assetManager.loadImage('test-key', 'test/path.png');

      expect(mockScene.load.image).not.toHaveBeenCalled();
    });

    test('should store asset metadata', () => {
      assetManager.loadImage('test-key', 'test/path.png');

      const assetInfo = assetManager.loadedAssets.get('test-key');
      expect(assetInfo.type).toBe('image');
      expect(assetInfo.path).toBe('test/path.png');
    });
  });

  describe('Load Sprite Sheet', () => {
    test('should load a sprite sheet with frame config', () => {
      const frameConfig = { frameWidth: 32, frameHeight: 48 };

      assetManager.loadSpriteSheet('sprite-key', 'sprites/player.png', frameConfig);

      expect(mockScene.load.spritesheet).toHaveBeenCalledWith(
        'sprite-key',
        'sprites/player.png',
        frameConfig
      );
    });

    test('should not reload sprite sheet if already exists', () => {
      mockScene.textures.exists = jest.fn(() => true);
      const frameConfig = { frameWidth: 32, frameHeight: 48 };

      assetManager.loadSpriteSheet('sprite-key', 'sprites/player.png', frameConfig);

      expect(mockScene.load.spritesheet).not.toHaveBeenCalled();
    });

    test('should store sprite sheet metadata', () => {
      const frameConfig = { frameWidth: 32, frameHeight: 48 };

      assetManager.loadSpriteSheet('sprite-key', 'sprites/player.png', frameConfig);

      const assetInfo = assetManager.loadedAssets.get('sprite-key');
      expect(assetInfo.type).toBe('spritesheet');
      expect(assetInfo.frameConfig).toEqual(frameConfig);
    });
  });

  describe('Load Audio', () => {
    test('should load audio if not already cached', () => {
      assetManager.loadAudio('audio-key', 'audio/sound.mp3');

      expect(mockScene.cache.audio.exists).toHaveBeenCalledWith('audio-key');
      expect(mockScene.load.audio).toHaveBeenCalledWith('audio-key', 'audio/sound.mp3');
    });

    test('should not reload audio if already cached', () => {
      mockScene.cache.audio.exists = jest.fn(() => true);

      assetManager.loadAudio('audio-key', 'audio/sound.mp3');

      expect(mockScene.load.audio).not.toHaveBeenCalled();
    });
  });

  describe('Load All Assets', () => {
    test('should load all assets from manifest', () => {
      assetManager.loadAllAssets();

      // Should load images
      expect(mockScene.load.image).toHaveBeenCalled();

      // Should load sprites
      expect(mockScene.load.spritesheet).toHaveBeenCalled();

      // Should load audio
      expect(mockScene.load.audio).toHaveBeenCalled();
    });

    test('should handle empty manifest categories', () => {
      assetManager.assetManifest = { images: {}, sprites: {}, audio: {} };

      expect(() => {
        assetManager.loadAllAssets();
      }).not.toThrow();
    });
  });

  describe('Load from Base64', () => {
    test('should load image from base64 data', (done) => {
      const base64Data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      assetManager.loadImageFromBase64('test-base64', base64Data);

      setTimeout(() => {
        expect(assetManager.loadedAssets.has('test-base64')).toBe(true);
        const assetInfo = assetManager.loadedAssets.get('test-base64');
        expect(assetInfo.source).toBe('base64');
        done();
      }, 100);
    });
  });

  describe('Load from Blob', () => {
    test('should load image from blob', () => {
      const blob = new Blob(['test'], { type: 'image/png' });

      assetManager.loadImageFromBlob('test-blob', blob);

      expect(mockScene.load.image).toHaveBeenCalled();
    });
  });

  describe('Asset Info', () => {
    test('should check if asset is loaded', () => {
      assetManager.loadImage('test-key', 'test/path.png');

      expect(assetManager.isAssetLoaded('test-key')).toBe(true);
      expect(assetManager.isAssetLoaded('nonexistent')).toBe(false);
    });

    test('should get asset info', () => {
      assetManager.loadImage('test-key', 'test/path.png');

      const info = assetManager.getAssetInfo('test-key');
      expect(info).toBeDefined();
      expect(info.type).toBe('image');
      expect(info.path).toBe('test/path.png');
    });

    test('should return undefined for nonexistent asset', () => {
      const info = assetManager.getAssetInfo('nonexistent');
      expect(info).toBeUndefined();
    });
  });

  describe('Unload Asset', () => {
    test('should unload texture asset', () => {
      mockScene.textures.exists = jest.fn(() => true);
      assetManager.loadImage('test-key', 'test/path.png');

      assetManager.unloadAsset('test-key');

      expect(mockScene.textures.remove).toHaveBeenCalledWith('test-key');
      expect(assetManager.loadedAssets.has('test-key')).toBe(false);
    });

    test('should unload audio asset', () => {
      mockScene.cache.audio.exists = jest.fn(() => true);
      assetManager.loadAudio('audio-key', 'audio/sound.mp3');

      assetManager.unloadAsset('audio-key');

      expect(mockScene.cache.audio.remove).toHaveBeenCalledWith('audio-key');
      expect(assetManager.loadedAssets.has('audio-key')).toBe(false);
    });

    test('should handle unloading nonexistent asset', () => {
      expect(() => {
        assetManager.unloadAsset('nonexistent');
      }).not.toThrow();
    });
  });

  describe('Get Progress', () => {
    test('should return loading progress', () => {
      const progress = assetManager.getProgress();
      expect(progress).toBe(0.5);
    });
  });

  describe('Preload Essential Assets', () => {
    test('should preload specified essential assets', () => {
      assetManager.preloadEssentialAssets(['logo', 'player']);

      expect(mockScene.load.image).toHaveBeenCalled();
      expect(mockScene.load.spritesheet).toHaveBeenCalled();
    });

    test('should skip nonexistent assets', () => {
      const initialCallCount = mockScene.load.image.mock.calls.length;

      assetManager.preloadEssentialAssets(['nonexistent']);

      expect(mockScene.load.image.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Find Asset in Manifest', () => {
    test('should find asset in manifest', () => {
      const asset = assetManager.findAssetInManifest('logo');

      expect(asset).toBeDefined();
      expect(asset.type).toBe('image');
    });

    test('should return null for nonexistent asset', () => {
      const asset = assetManager.findAssetInManifest('nonexistent');

      expect(asset).toBeNull();
    });

    test('should search all manifest categories', () => {
      const imageAsset = assetManager.findAssetInManifest('logo');
      const spriteAsset = assetManager.findAssetInManifest('player');
      const audioAsset = assetManager.findAssetInManifest('bgm');

      expect(imageAsset).toBeDefined();
      expect(spriteAsset).toBeDefined();
      expect(audioAsset).toBeDefined();
    });
  });

  describe('Cleanup', () => {
    test('should clear all loaded assets', () => {
      assetManager.loadImage('test1', 'path1.png');
      assetManager.loadImage('test2', 'path2.png');

      expect(assetManager.loadedAssets.size).toBe(2);

      assetManager.cleanup();

      expect(assetManager.loadedAssets.size).toBe(0);
    });
  });
});
