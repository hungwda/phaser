/**
 * main.js
 *
 * Main entry point for the Phaser game application.
 * Initializes the game with all scenes and plugins.
 */

import Phaser from 'phaser';
import { gameConfig, getCurrentEnv, CONSTANTS } from '@config/GameConfig';
import { BootScene } from '@scenes/BootScene';
import { PreloadScene } from '@scenes/PreloadScene';
import { MenuScene } from '@scenes/MenuScene';
import { GameScene } from '@scenes/GameScene';
import { GameHubScene } from './scenes/kannada/GameHubScene';
import { GameSelectionScene } from './scenes/kannada/GameSelectionScene';
import { ProfileScene } from './scenes/kannada/ProfileScene';
import { SettingsScene } from './scenes/kannada/SettingsScene';
import { AksharaPopScene } from './scenes/kannada/alphabet/AksharaPopScene';
import { LetterTracingScene } from './scenes/kannada/alphabet/LetterTracingScene';
import { AlphabetRainScene } from './scenes/kannada/alphabet/AlphabetRainScene';
import { LetterMatchScene } from './scenes/kannada/alphabet/LetterMatchScene';
import { AnimalSafariScene } from './scenes/kannada/vocabulary/AnimalSafariScene';
import { FruitBasketScene } from './scenes/kannada/vocabulary/FruitBasketScene';
import { ColorSplashScene } from './scenes/kannada/vocabulary/ColorSplashScene';
import { NumberRocketsScene } from './scenes/kannada/vocabulary/NumberRocketsScene';
import { VegetableGardenScene } from './scenes/kannada/vocabulary/VegetableGardenScene';
import { BodyPartsRobotScene } from './scenes/kannada/vocabulary/BodyPartsRobotScene';
import { FamilyTreeScene } from './scenes/kannada/vocabulary/FamilyTreeScene';
import { LetterBridgeScene } from './scenes/kannada/words/LetterBridgeScene';
import { SpellPictureScene } from './scenes/kannada/words/SpellPictureScene';
import { SentenceTrainScene } from './scenes/kannada/sentences/SentenceTrainScene';
import { QuestionAnswerScene } from './scenes/kannada/sentences/QuestionAnswerScene';
import { ActionVerbsScene } from './scenes/kannada/sentences/ActionVerbsScene';
import { StorySequencerScene } from './scenes/kannada/sentences/StorySequencerScene';
import { SpinningWheelScene } from './scenes/kannada/alphabet/SpinningWheelScene';
import { WordFactoryScene } from './scenes/kannada/words/WordFactoryScene';
import { MissingLetterScene } from './scenes/kannada/words/MissingLetterScene';
import { CompoundWordsScene } from './scenes/kannada/words/CompoundWordsScene';
import { StoryBookScene } from './scenes/kannada/reading/StoryBookScene';
import { ReadingRaceScene } from './scenes/kannada/reading/ReadingRaceScene';
import { RhymeTimeScene } from './scenes/kannada/reading/RhymeTimeScene';
import { DialogueDramaScene } from './scenes/kannada/reading/DialogueDramaScene';
import { EchoGameScene } from './scenes/kannada/listening/EchoGameScene';
import { SoundSafariScene } from './scenes/kannada/listening/SoundSafariScene';
import { WhichWordScene } from './scenes/kannada/listening/WhichWordScene';
import { TongueTwisterScene } from './scenes/kannada/listening/TongueTwisterScene';
import { FestivalFunScene } from './scenes/kannada/cultural/FestivalFunScene';
import { MarketShoppingScene } from './scenes/kannada/cultural/MarketShoppingScene';
import { ClassroomScene } from './scenes/kannada/cultural/ClassroomScene';
import { DailyRoutineScene } from './scenes/kannada/cultural/DailyRoutineScene';
import { ContextManager } from '@utils/ContextManager';
import { PerformancePlugin } from './plugins/PerformancePlugin';
import { SaveLoadPlugin } from './plugins/SaveLoadPlugin';
import eventBus from '@utils/EventBus';

/**
 * Main Game Class
 * Extends Phaser.Game with additional functionality
 */
class RobustPhaserGame extends Phaser.Game {
  constructor(config) {
    super(config);

    // Store environment configuration
    this.env = getCurrentEnv();

    // Initialize managers
    this.initializeManagers();

    // Set up global event listeners
    this.setupGlobalEvents();

    // Enable debug features in development
    if (this.env.debug) {
      this.enableDebugFeatures();
    }

    console.log('[RobustPhaserGame] Game initialized');
    console.log('[RobustPhaserGame] Environment:', this.env);
  }

  /**
   * Initialize managers
   */
  initializeManagers() {
    // Context manager for WebGL context loss handling
    this.contextManager = new ContextManager(this);

    // Performance monitoring
    if (this.env.showFPS) {
      this.performancePlugin = new PerformancePlugin(this.plugins);
      this.performancePlugin.init({ enabled: true });
      this.performancePlugin.start();
    }

    // Save/Load system
    this.saveLoadPlugin = new SaveLoadPlugin(this.plugins);
    this.saveLoadPlugin.init({});
    this.saveLoadPlugin.start();
  }

  /**
   * Set up global event listeners
   */
  setupGlobalEvents() {
    // Game ready event
    eventBus.on(CONSTANTS.EVENTS.GAME_READY, () => {
      console.log('[RobustPhaserGame] Game ready event received');
    });

    // Score update event
    eventBus.on(CONSTANTS.EVENTS.SCORE_UPDATE, (score) => {
      console.log('[RobustPhaserGame] Score updated:', score);
    });

    // Window visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.onGamePause();
      } else {
        this.onGameResume();
      }
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.onResize();
    });
  }

  /**
   * Enable debug features
   */
  enableDebugFeatures() {
    console.log('[RobustPhaserGame] Debug features enabled');

    // Enable event bus debug mode
    eventBus.enableDebug();

    // Add debug keyboard shortcuts
    window.addEventListener('keydown', (event) => {
      // Press F1 to toggle performance stats
      if (event.key === 'F1') {
        event.preventDefault();
        if (this.performancePlugin) {
          this.performancePlugin.toggle();
        }
      }

      // Press F2 to force context loss (for testing)
      if (event.key === 'F2') {
        event.preventDefault();
        this.contextManager.forceContextLoss();
      }

      // Press F3 to force context restore (for testing)
      if (event.key === 'F3') {
        event.preventDefault();
        this.contextManager.forceContextRestore();
      }

      // Press F4 to save game
      if (event.key === 'F4') {
        event.preventDefault();
        const gameState = this.saveLoadPlugin.getCurrentGameState();
        if (gameState) {
          this.saveLoadPlugin.save(gameState, 'quicksave');
          console.log('[RobustPhaserGame] Quick save complete');
        }
      }

      // Press F5 to load game
      if (event.key === 'F5') {
        event.preventDefault();
        const gameState = this.saveLoadPlugin.load('quicksave');
        if (gameState) {
          console.log('[RobustPhaserGame] Quick load complete', gameState);
        }
      }
    });

    // Make game instance globally accessible for debugging
    window.game = this;
    window.eventBus = eventBus;
  }

  /**
   * Handle game pause
   */
  onGamePause() {
    console.log('[RobustPhaserGame] Game paused');
    // Auto-save on pause
    if (this.saveLoadPlugin) {
      const gameState = this.saveLoadPlugin.getCurrentGameState();
      if (gameState) {
        this.saveLoadPlugin.save(gameState, 'autosave');
      }
    }
  }

  /**
   * Handle game resume
   */
  onGameResume() {
    console.log('[RobustPhaserGame] Game resumed');
  }

  /**
   * Handle resize
   */
  onResize() {
    console.log('[RobustPhaserGame] Window resized');
  }

  /**
   * Update loop
   */
  step(time, delta) {
    super.step(time, delta);

    // Update performance plugin
    if (this.performancePlugin && this.performancePlugin.enabled) {
      this.performancePlugin.update();
    }
  }
}

/**
 * Initialize the game when DOM is ready
 */
function initGame() {
  console.log('[Main] Initializing game...');

  // Remove loading indicator
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }

  // Create game configuration with scenes
  const config = {
    ...gameConfig,
    scene: [
      BootScene,
      PreloadScene,
      MenuScene,
      GameScene,
      GameHubScene,
      GameSelectionScene,
      ProfileScene,
      SettingsScene,
      AksharaPopScene,
      LetterTracingScene,
      AlphabetRainScene,
      LetterMatchScene,
      AnimalSafariScene,
      FruitBasketScene,
      ColorSplashScene,
      NumberRocketsScene,
      VegetableGardenScene,
      BodyPartsRobotScene,
      FamilyTreeScene,
      LetterBridgeScene,
      SpellPictureScene,
      SentenceTrainScene,
      QuestionAnswerScene,
      ActionVerbsScene,
      StorySequencerScene,
      SpinningWheelScene,
      WordFactoryScene,
      MissingLetterScene,
      CompoundWordsScene,
      StoryBookScene,
      ReadingRaceScene,
      RhymeTimeScene,
      DialogueDramaScene,
      EchoGameScene,
      SoundSafariScene,
      WhichWordScene,
      TongueTwisterScene,
      FestivalFunScene,
      MarketShoppingScene,
      ClassroomScene,
      DailyRoutineScene
    ]
  };

  // Create game instance
  const game = new RobustPhaserGame(config);

  // Error handling
  window.addEventListener('error', (event) => {
    console.error('[Main] Unhandled error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Main] Unhandled promise rejection:', event.reason);
  });

  console.log('[Main] Game initialization complete');

  return game;
}

// Start the game
const game = initGame();

// Export for external access if needed
export default game;
