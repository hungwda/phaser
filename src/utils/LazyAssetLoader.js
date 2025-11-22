/**
 * LazyAssetLoader - Loads assets on-demand per category
 * Reduces initial load time by loading only what's needed
 */
export class LazyAssetLoader {
  constructor(scene) {
    this.scene = scene;
    this.loadedCategories = new Set();
    this.loading = new Map(); // Track in-progress loads
  }

  /**
   * Check if category assets are loaded
   */
  isCategoryLoaded(category) {
    return this.loadedCategories.has(category);
  }

  /**
   * Load assets for a specific category
   */
  async loadCategoryAssets(category) {
    // Already loaded
    if (this.isCategoryLoaded(category)) {
      return Promise.resolve();
    }

    // Already loading
    if (this.loading.has(category)) {
      return this.loading.get(category);
    }

    // Create loading promise
    const loadPromise = new Promise((resolve, reject) => {
      const loader = this.scene.load;

      // Define category assets
      const assets = this.getCategoryAssets(category);

      if (!assets || assets.length === 0) {
        resolve();
        return;
      }

      // Load assets
      assets.forEach(asset => {
        switch (asset.type) {
          case 'json':
            loader.json(asset.key, asset.path);
            break;
          case 'image':
            loader.image(asset.key, asset.path);
            break;
          case 'audio':
            loader.audio(asset.key, asset.path);
            break;
          case 'spritesheet':
            loader.spritesheet(asset.key, asset.path, asset.frameConfig);
            break;
        }
      });

      // Handle load complete
      loader.once('complete', () => {
        this.loadedCategories.add(category);
        this.loading.delete(category);
        resolve();
      });

      // Handle load error
      loader.once('loaderror', (file) => {
        this.loading.delete(category);
        reject(new Error(`Failed to load ${file.key} for category ${category}`));
      });

      // Start loading
      loader.start();
    });

    this.loading.set(category, loadPromise);
    return loadPromise;
  }

  /**
   * Get assets for a specific category
   */
  getCategoryAssets(category) {
    const assetMap = {
      alphabet: [
        { type: 'json', key: 'alphabet', path: 'src/data/kannada/alphabet.json' },
        { type: 'json', key: 'aksharaPopConfig', path: 'src/data/games/akshara-pop.json' }
      ],
      vocabulary: [
        { type: 'json', key: 'fruits', path: 'src/data/kannada/fruits.json' },
        { type: 'json', key: 'animals', path: 'src/data/kannada/animals.json' },
        { type: 'json', key: 'colors', path: 'src/data/kannada/colors.json' },
        { type: 'json', key: 'vegetables', path: 'src/data/kannada/vegetables.json' },
        { type: 'json', key: 'bodyParts', path: 'src/data/kannada/body_parts.json' },
        { type: 'json', key: 'family', path: 'src/data/kannada/family.json' }
      ],
      words: [
        { type: 'json', key: 'words', path: 'src/data/kannada/words.json' }
      ],
      sentences: [
        { type: 'json', key: 'sentences', path: 'src/data/kannada/sentences.json' },
        { type: 'json', key: 'verbs', path: 'src/data/kannada/verbs.json' }
      ],
      reading: [
        { type: 'json', key: 'stories', path: 'src/data/kannada/stories.json' }
      ],
      listening: [
        { type: 'json', key: 'alphabet', path: 'src/data/kannada/alphabet.json' }
      ],
      cultural: [
        { type: 'json', key: 'fruits', path: 'src/data/kannada/fruits.json' },
        { type: 'json', key: 'family', path: 'src/data/kannada/family.json' }
      ]
    };

    return assetMap[category] || [];
  }

  /**
   * Preload multiple categories
   */
  async loadMultipleCategories(categories) {
    const promises = categories.map(cat => this.loadCategoryAssets(cat));
    return Promise.all(promises);
  }

  /**
   * Unload category assets (for memory management)
   */
  unloadCategory(category) {
    if (!this.isCategoryLoaded(category)) {
      return;
    }

    const assets = this.getCategoryAssets(category);
    const cache = this.scene.cache;
    const textures = this.scene.textures;

    assets.forEach(asset => {
      switch (asset.type) {
        case 'json':
          if (cache.json.exists(asset.key)) {
            cache.json.remove(asset.key);
          }
          break;
        case 'image':
          if (textures.exists(asset.key)) {
            textures.remove(asset.key);
          }
          break;
        case 'audio':
          if (cache.audio.exists(asset.key)) {
            cache.audio.remove(asset.key);
          }
          break;
      }
    });

    this.loadedCategories.delete(category);
  }

  /**
   * Get loading progress for a category
   */
  getLoadingProgress(category) {
    if (this.isCategoryLoaded(category)) {
      return 1; // 100%
    }

    if (this.loading.has(category)) {
      return this.scene.load.progress; // Current progress
    }

    return 0;
  }

  /**
   * Clear all loaded categories
   */
  clearAll() {
    this.loadedCategories.forEach(cat => this.unloadCategory(cat));
    this.loadedCategories.clear();
    this.loading.clear();
  }
}

export default LazyAssetLoader;
