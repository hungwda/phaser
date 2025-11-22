import { Button } from '../../components/ui/Button.js';
import { ProgressTracker } from '../../systems/learning/ProgressTracker.js';
import { RewardSystem } from '../../systems/learning/RewardSystem.js';
import { LearningEngine } from '../../systems/learning/LearningEngine.js';
import { AudioManager } from '../../systems/audio/AudioManager.js';

/**
 * GameHubScene - Main game selection hub
 */
export class GameHubScene extends Phaser.Scene {
  constructor() {
    super('GameHubScene');

    // Initialize systems
    this.progressTracker = new ProgressTracker();
    this.rewardSystem = new RewardSystem(this.progressTracker);
    this.learningEngine = new LearningEngine(this.progressTracker);
  }

  create() {
    const { width, height } = this.cameras.main;

    // Initialize audio manager
    this.audioManager = new AudioManager(this);

    // Create background
    this.createBackground();

    // Create header
    this.createHeader();

    // Create profile summary
    this.createProfileSummary();

    // Create game categories
    this.createGameCategories();

    // Create footer
    this.createFooter();

    // Check for new achievements
    this.checkAchievements();
  }

  /**
   * Create animated background
   */
  createBackground() {
    const { width, height } = this.cameras.main;

    // Gradient background
    const bg = this.add.rectangle(0, 0, width, height, 0x1E88E5)
      .setOrigin(0, 0);

    // Create some decorative stars
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(2, 6);

      const star = this.add.circle(x, y, size, 0xFFFFFF, 0.6);

      // Twinkling animation
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 2000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Create header
   */
  createHeader() {
    const { width } = this.cameras.main;

    // Title
    this.add.text(width / 2, 50, 'ಕನ್ನಡ ಕಲಿಯೋಣ', {
      fontSize: '48px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, 95, 'Learn Kannada', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFD700'
    }).setOrigin(0.5);
  }

  /**
   * Create profile summary
   */
  createProfileSummary() {
    const { width } = this.cameras.main;
    const summary = this.progressTracker.getProfileSummary();

    const container = this.add.container(width / 2, 150);

    // Background
    const bg = this.add.rectangle(0, 0, 700, 100, 0x000000, 0.3);
    bg.setStrokeStyle(2, 0xFFD700);

    // Stats
    const statsText = [
      `👤 ${summary.playerName}`,
      `⭐ ${summary.totalStars} Stars`,
      `🎮 ${summary.gamesPlayed} Games`,
      `📚 ${summary.lettersLearned} Letters`
    ].join('    ');

    const stats = this.add.text(0, 0, statsText, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    container.add([bg, stats]);
  }

  /**
   * Create game categories
   */
  createGameCategories() {
    const { width, height } = this.cameras.main;

    // Categories
    const categories = [
      {
        name: 'Alphabet Games',
        nameKannada: 'ಅಕ್ಷರ ಆಟಗಳು',
        icon: '🔤',
        color: 0x4CAF50,
        games: [
          { name: 'Akshara Pop', scene: 'AksharaPopScene' },
          { name: 'Letter Tracing', scene: 'LetterTracingScene' },
          { name: 'Alphabet Rain', scene: 'AlphabetRainScene' },
          { name: 'Letter Match', scene: 'LetterMatchScene' }
        ]
      },
      {
        name: 'Vocabulary Games',
        nameKannada: 'ಶಬ್ದಭಂಡಾರ ಆಟಗಳು',
        icon: '📚',
        color: 0x2196F3,
        games: [
          { name: 'Animal Safari', scene: 'AnimalSafariScene' },
          { name: 'Fruit Basket', scene: 'FruitBasketScene' },
          { name: 'Color Splash', scene: 'ColorSplashScene' },
          { name: 'Number Rockets', scene: 'NumberRocketsScene' },
          { name: 'Vegetable Garden', scene: 'VegetableGardenScene' },
          { name: 'Body Parts Robot', scene: 'BodyPartsRobotScene' },
          { name: 'Family Tree', scene: 'FamilyTreeScene' }
        ]
      },
      {
        name: 'Word Games',
        nameKannada: 'ಪದ ಆಟಗಳು',
        icon: '✍️',
        color: 0xFF9800,
        games: [
          { name: 'Letter Bridge', scene: 'LetterBridgeScene' },
          { name: 'Spell Picture', scene: 'SpellPictureScene' }
        ]
      },
      {
        name: 'Sentence Games',
        nameKannada: 'ವಾಕ್ಯ ಆಟಗಳು',
        icon: '💬',
        color: 0x9C27B0,
        games: [
          { name: 'Sentence Train', scene: 'SentenceTrainScene' },
          { name: 'Question Answer', scene: 'QuestionAnswerScene' },
          { name: 'Action Verbs', scene: 'ActionVerbsScene' },
          { name: 'Story Sequencer', scene: 'StorySequencerScene' }
        ]
      }
    ];

    const startY = 280;
    const spacingY = 100;

    categories.forEach((category, index) => {
      const y = startY + (index * spacingY);

      // Category container
      const container = this.add.container(width / 2, y);

      // Background
      const bg = this.add.rectangle(0, 0, 600, 80, category.color, 0.8);
      bg.setStrokeStyle(3, 0xFFFFFF);

      // Icon
      const icon = this.add.text(-250, 0, category.icon, {
        fontSize: '48px'
      }).setOrigin(0.5);

      // Category name
      const nameText = this.add.text(-150, -15, category.name, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const kannadaText = this.add.text(-150, 15, category.nameKannada, {
        fontSize: '18px',
        fontFamily: 'Nudi, Arial',
        color: '#FFFF00'
      }).setOrigin(0, 0.5);

      // Status text
      let statusText = '';
      if (category.games.length > 0) {
        statusText = `${category.games.length} ${category.games.length === 1 ? 'game' : 'games'} available`;
      } else {
        statusText = 'Coming Soon!';
      }

      const status = this.add.text(200, 0, statusText, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      container.add([bg, icon, nameText, kannadaText, status]);

      // Make interactive if games are available
      if (category.games.length > 0) {
        container.setSize(600, 80);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
          bg.setFillStyle(category.color, 1.0);
          this.tweens.add({
            targets: container,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 100
          });
        });

        container.on('pointerout', () => {
          bg.setFillStyle(category.color, 0.8);
          this.tweens.add({
            targets: container,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 100
          });
        });

        container.on('pointerdown', () => {
          this.audioManager.playClick();

          // For now, launch the first game in category
          if (category.games[0]) {
            this.startGame(category.games[0].scene);
          }
        });
      } else {
        // Disabled appearance
        bg.setAlpha(0.5);
        status.setAlpha(0.7);
      }
    });
  }

  /**
   * Create footer buttons
   */
  createFooter() {
    const { width, height } = this.cameras.main;

    // Profile button
    const profileBtn = new Button(this, width / 2 - 220, height - 60, {
      text: 'Profile',
      icon: '👤',
      width: 150,
      height: 50,
      bgColor: 0x9C27B0,
      onClick: () => {
        this.audioManager.playClick();
        this.scene.start('ProfileScene');
      }
    });

    // Achievements button
    const achievementsBtn = new Button(this, width / 2 - 50, height - 60, {
      text: 'Rewards',
      icon: '🏆',
      width: 150,
      height: 50,
      bgColor: 0xFF9800,
      onClick: () => {
        this.audioManager.playClick();
        this.scene.start('ProfileScene');
      }
    });

    // Settings button
    const settingsBtn = new Button(this, width / 2 + 120, height - 60, {
      text: 'Settings',
      icon: '⚙️',
      width: 150,
      height: 50,
      bgColor: 0x607D8B,
      onClick: () => {
        this.audioManager.playClick();
        this.scene.start('SettingsScene');
      }
    });
  }

  /**
   * Start a game
   */
  startGame(sceneKey) {
    // Pass necessary data to game scene
    this.scene.start(sceneKey, {
      difficulty: this.progressTracker.getDifficulty(),
      progressTracker: this.progressTracker,
      rewardSystem: this.rewardSystem,
      learningEngine: this.learningEngine
    });
  }

  /**
   * Check and show new achievements
   */
  checkAchievements() {
    const newAchievements = this.rewardSystem.checkAchievements();

    if (newAchievements.length > 0) {
      // Show first achievement (can queue multiple)
      this.time.delayedCall(1000, () => {
        this.rewardSystem.showAchievementNotification(this, newAchievements[0]);
      });
    }
  }
}
