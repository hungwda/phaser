/**
 * AssetManager.js
 *
 * Centralized asset management system.
 * Supports various loading methods including Base64 for embedded assets.
 */

export class AssetManager {
  constructor(scene) {
    this.scene = scene;
    this.loadedAssets = new Map();
    this.assetManifest = this.getAssetManifest();
  }

  /**
   * Get the asset manifest
   * This can be extended or loaded from a JSON file
   */
  getAssetManifest() {
    return {
      images: {
        logo: { path: 'assets/images/logo.png', type: 'image' },
        background: { path: 'assets/images/background.png', type: 'image' }
      },
      sprites: {
        player: {
          path: 'assets/sprites/player.png',
          frameConfig: { frameWidth: 32, frameHeight: 48 },
          type: 'spritesheet'
        }
      },
      audio: {
        bgm: { path: 'assets/audio/background.mp3', type: 'audio' },
        jump: { path: 'assets/audio/jump.wav', type: 'audio' }
      }
    };
  }

  /**
   * Load all assets from manifest
   */
  loadAllAssets() {
    Object.entries(this.assetManifest.images || {}).forEach(([key, asset]) => {
      this.loadImage(key, asset.path);
    });

    Object.entries(this.assetManifest.sprites || {}).forEach(([key, asset]) => {
      this.loadSpriteSheet(key, asset.path, asset.frameConfig);
    });

    Object.entries(this.assetManifest.audio || {}).forEach(([key, asset]) => {
      this.loadAudio(key, asset.path);
    });
  }

  /**
   * Load an image
   */
  loadImage(key, path) {
    if (!this.scene.textures.exists(key)) {
      this.scene.load.image(key, path);
      this.loadedAssets.set(key, { type: 'image', path });
    }
  }

  /**
   * Load a sprite sheet
   */
  loadSpriteSheet(key, path, frameConfig) {
    if (!this.scene.textures.exists(key)) {
      this.scene.load.spritesheet(key, path, frameConfig);
      this.loadedAssets.set(key, { type: 'spritesheet', path, frameConfig });
    }
  }

  /**
   * Load audio
   */
  loadAudio(key, path) {
    if (!this.scene.cache.audio.exists(key)) {
      this.scene.load.audio(key, path);
      this.loadedAssets.set(key, { type: 'audio', path });
    }
  }

  /**
   * Load asset from Base64 (useful for playable ads)
   */
  loadImageFromBase64(key, base64Data) {
    const img = new Image();
    img.onload = () => {
      this.scene.textures.addImage(key, img);
      this.loadedAssets.set(key, { type: 'image', source: 'base64' });
    };
    img.src = base64Data;
  }

  /**
   * Load asset from Blob
   */
  loadImageFromBlob(key, blob) {
    const url = URL.createObjectURL(blob);
    this.loadImage(key, url);
  }

  /**
   * Check if asset is loaded
   */
  isAssetLoaded(key) {
    return this.loadedAssets.has(key);
  }

  /**
   * Get loaded asset info
   */
  getAssetInfo(key) {
    return this.loadedAssets.get(key);
  }

  /**
   * Unload asset
   */
  unloadAsset(key) {
    if (this.scene.textures.exists(key)) {
      this.scene.textures.remove(key);
    }
    if (this.scene.cache.audio.exists(key)) {
      this.scene.cache.audio.remove(key);
    }
    this.loadedAssets.delete(key);
  }

  /**
   * Get loading progress
   */
  getProgress() {
    return this.scene.load.progress;
  }

  /**
   * Preload essential assets with priority
   */
  preloadEssentialAssets(essentialKeys) {
    const essentials = essentialKeys.map(key => {
      const asset = this.findAssetInManifest(key);
      return { key, asset };
    }).filter(item => item.asset);

    essentials.forEach(({ key, asset }) => {
      if (asset.type === 'image') {
        this.loadImage(key, asset.path);
      } else if (asset.type === 'spritesheet') {
        this.loadSpriteSheet(key, asset.path, asset.frameConfig);
      } else if (asset.type === 'audio') {
        this.loadAudio(key, asset.path);
      }
    });
  }

  /**
   * Find asset in manifest
   */
  findAssetInManifest(key) {
    for (const category of Object.values(this.assetManifest)) {
      if (category[key]) {
        return category[key];
      }
    }
    return null;
  }

  /**
   * Clean up all assets
   */
  cleanup() {
    this.loadedAssets.clear();
  }
}

export default AssetManager;
