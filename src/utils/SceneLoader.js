/**
 * SceneLoader - Dynamically loads scene modules for code splitting
 * Reduces initial bundle size by loading scenes on demand
 */
export class SceneLoader {
  constructor(game) {
    this.game = game;
    this.loadedScenes = new Map();
    this.loading = new Map();
  }

  /**
   * Load scene dynamically
   */
  async loadScene(sceneKey, scenePath) {
    // Already loaded
    if (this.loadedScenes.has(sceneKey)) {
      return this.loadedScenes.get(sceneKey);
    }

    // Currently loading
    if (this.loading.has(sceneKey)) {
      return this.loading.get(sceneKey);
    }

    // Create loading promise
    const loadPromise = this.importScene(scenePath)
      .then(module => {
        const SceneClass = module.default || module[sceneKey];

        if (!SceneClass) {
          throw new Error(`Scene class not found in module: ${sceneKey}`);
        }

        // Add scene to game
        this.game.scene.add(sceneKey, SceneClass, false);

        // Cache the scene class
        this.loadedScenes.set(sceneKey, SceneClass);
        this.loading.delete(sceneKey);

        return SceneClass;
      })
      .catch(error => {
        this.loading.delete(sceneKey);
        throw new Error(`Failed to load scene ${sceneKey}: ${error.message}`);
      });

    this.loading.set(sceneKey, loadPromise);
    return loadPromise;
  }

  /**
   * Import scene module
   */
  async importScene(scenePath) {
    // Dynamic import
    return import(scenePath);
  }

  /**
   * Load and start scene
   */
  async loadAndStart(sceneKey, scenePath, data = {}) {
    try {
      await this.loadScene(sceneKey, scenePath);
      this.game.scene.start(sceneKey, data);
      return true;
    } catch (error) {
      console.error(`Failed to load and start scene ${sceneKey}:`, error);
      return false;
    }
  }

  /**
   * Preload multiple scenes
   */
  async preloadScenes(scenes) {
    const promises = scenes.map(({ key, path }) => this.loadScene(key, path));
    return Promise.all(promises);
  }

  /**
   * Remove scene from game
   */
  removeScene(sceneKey) {
    if (this.game.scene.getScene(sceneKey)) {
      this.game.scene.remove(sceneKey);
    }

    this.loadedScenes.delete(sceneKey);
  }

  /**
   * Check if scene is loaded
   */
  isLoaded(sceneKey) {
    return this.loadedScenes.has(sceneKey);
  }

  /**
   * Get scene mapping for all games
   */
  getSceneMap() {
    return {
      // Alphabet games
      'AksharaPopScene': () => import('../scenes/kannada/alphabet/AksharaPopScene.js'),
      'LetterTracingScene': () => import('../scenes/kannada/alphabet/LetterTracingScene.js'),
      'AlphabetRainScene': () => import('../scenes/kannada/alphabet/AlphabetRainScene.js'),
      'LetterMatchScene': () => import('../scenes/kannada/alphabet/LetterMatchScene.js'),
      'SpinningWheelScene': () => import('../scenes/kannada/alphabet/SpinningWheelScene.js'),

      // Vocabulary games
      'FruitBasketScene': () => import('../scenes/kannada/vocabulary/FruitBasketScene.js'),
      'AnimalSafariScene': () => import('../scenes/kannada/vocabulary/AnimalSafariScene.js'),
      'ColorSplashScene': () => import('../scenes/kannada/vocabulary/ColorSplashScene.js'),
      'NumberRocketsScene': () => import('../scenes/kannada/vocabulary/NumberRocketsScene.js'),
      'VegetableGardenScene': () => import('../scenes/kannada/vocabulary/VegetableGardenScene.js'),
      'BodyPartsRobotScene': () => import('../scenes/kannada/vocabulary/BodyPartsRobotScene.js'),
      'FamilyTreeScene': () => import('../scenes/kannada/vocabulary/FamilyTreeScene.js'),

      // Word games
      'LetterBridgeScene': () => import('../scenes/kannada/words/LetterBridgeScene.js'),
      'WordFactoryScene': () => import('../scenes/kannada/words/WordFactoryScene.js'),
      'SpellPictureScene': () => import('../scenes/kannada/words/SpellPictureScene.js'),
      'MissingLetterScene': () => import('../scenes/kannada/words/MissingLetterScene.js'),
      'CompoundWordsScene': () => import('../scenes/kannada/words/CompoundWordsScene.js'),

      // Sentence games
      'SentenceTrainScene': () => import('../scenes/kannada/sentences/SentenceTrainScene.js'),
      'QuestionAnswerScene': () => import('../scenes/kannada/sentences/QuestionAnswerScene.js'),
      'ActionVerbsScene': () => import('../scenes/kannada/sentences/ActionVerbsScene.js'),
      'StorySequencerScene': () => import('../scenes/kannada/sentences/StorySequencerScene.js'),

      // Reading games
      'StoryBookScene': () => import('../scenes/kannada/reading/StoryBookScene.js'),
      'ReadingRaceScene': () => import('../scenes/kannada/reading/ReadingRaceScene.js'),
      'RhymeTimeScene': () => import('../scenes/kannada/reading/RhymeTimeScene.js'),
      'DialogueDramaScene': () => import('../scenes/kannada/reading/DialogueDramaScene.js'),

      // Listening games
      'EchoGameScene': () => import('../scenes/kannada/listening/EchoGameScene.js'),
      'SoundSafariScene': () => import('../scenes/kannada/listening/SoundSafariScene.js'),
      'WhichWordScene': () => import('../scenes/kannada/listening/WhichWordScene.js'),
      'TongueTwisterScene': () => import('../scenes/kannada/listening/TongueTwisterScene.js'),

      // Cultural games
      'FestivalFunScene': () => import('../scenes/kannada/cultural/FestivalFunScene.js'),
      'MarketShoppingScene': () => import('../scenes/kannada/cultural/MarketShoppingScene.js'),
      'ClassroomScene': () => import('../scenes/kannada/cultural/ClassroomScene.js'),
      'DailyRoutineScene': () => import('../scenes/kannada/cultural/DailyRoutineScene.js')
    };
  }

  /**
   * Load scene by key using scene map
   */
  async loadSceneByKey(sceneKey) {
    const sceneMap = this.getSceneMap();
    const importFn = sceneMap[sceneKey];

    if (!importFn) {
      throw new Error(`Unknown scene key: ${sceneKey}`);
    }

    // Already loaded
    if (this.loadedScenes.has(sceneKey)) {
      return this.loadedScenes.get(sceneKey);
    }

    // Currently loading
    if (this.loading.has(sceneKey)) {
      return this.loading.get(sceneKey);
    }

    const loadPromise = importFn()
      .then(module => {
        const SceneClass = module.default || module[sceneKey];

        if (!SceneClass) {
          throw new Error(`Scene class not found in module: ${sceneKey}`);
        }

        // Add scene to game
        this.game.scene.add(sceneKey, SceneClass, false);

        // Cache the scene class
        this.loadedScenes.set(sceneKey, SceneClass);
        this.loading.delete(sceneKey);

        return SceneClass;
      })
      .catch(error => {
        this.loading.delete(sceneKey);
        throw error;
      });

    this.loading.set(sceneKey, loadPromise);
    return loadPromise;
  }

  /**
   * Preload scenes by category
   */
  async preloadCategory(category) {
    const categoryScenes = {
      alphabet: ['AksharaPopScene', 'LetterTracingScene', 'AlphabetRainScene', 'LetterMatchScene', 'SpinningWheelScene'],
      vocabulary: ['FruitBasketScene', 'AnimalSafariScene', 'ColorSplashScene', 'NumberRocketsScene', 'VegetableGardenScene', 'BodyPartsRobotScene', 'FamilyTreeScene'],
      words: ['LetterBridgeScene', 'WordFactoryScene', 'SpellPictureScene', 'MissingLetterScene', 'CompoundWordsScene'],
      sentences: ['SentenceTrainScene', 'QuestionAnswerScene', 'ActionVerbsScene', 'StorySequencerScene'],
      reading: ['StoryBookScene', 'ReadingRaceScene', 'RhymeTimeScene', 'DialogueDramaScene'],
      listening: ['EchoGameScene', 'SoundSafariScene', 'WhichWordScene', 'TongueTwisterScene'],
      cultural: ['FestivalFunScene', 'MarketShoppingScene', 'ClassroomScene', 'DailyRoutineScene']
    };

    const scenes = categoryScenes[category] || [];
    const promises = scenes.map(key => this.loadSceneByKey(key));

    return Promise.all(promises);
  }
}

export default SceneLoader;
