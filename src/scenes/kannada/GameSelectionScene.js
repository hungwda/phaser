import { Button } from '../../components/ui/Button.js';
import { AudioManager } from '../../systems/audio/AudioManager.js';

/**
 * GameSelectionScene - Shows all games in a selected category
 */
export class GameSelectionScene extends Phaser.Scene {
  constructor() {
    super('GameSelectionScene');
  }

  init(data) {
    this.categoryData = data.category;
    this.progressTracker = data.progressTracker;
    this.rewardSystem = data.rewardSystem;
    this.learningEngine = data.learningEngine;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Initialize audio manager
    this.audioManager = new AudioManager(this);

    // Create background
    this.createBackground();

    // Create header
    this.createHeader();

    // Create game grid
    this.createGameGrid();

    // Create back button
    this.createBackButton();
  }

  /**
   * Create animated background
   */
  createBackground() {
    const { width, height } = this.cameras.main;

    // Gradient background with category color
    const bg = this.add.rectangle(0, 0, width, height, this.categoryData.color)
      .setOrigin(0, 0)
      .setAlpha(0.3);

    // Base background
    const baseBg = this.add.rectangle(0, 0, width, height, 0x1E88E5)
      .setOrigin(0, 0);
    baseBg.setDepth(-1);

    // Create decorative stars
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(2, 5);

      const star = this.add.circle(x, y, size, 0xFFFFFF, 0.5);

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

    // Category name in Kannada
    this.add.text(width / 2, 40, this.categoryData.nameKannada, {
      fontSize: '36px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Category name in English
    this.add.text(width / 2, 80, this.categoryData.name, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFD700'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 110, 'Select a game to play', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);
  }

  /**
   * Create game grid
   */
  createGameGrid() {
    const { width, height } = this.cameras.main;
    const games = this.categoryData.games;

    const cols = 2;
    const rows = Math.ceil(games.length / cols);
    const gameWidth = 300;
    const gameHeight = 100;
    const spacingX = 50;
    const spacingY = 30;
    const startX = (width - (cols * gameWidth + (cols - 1) * spacingX)) / 2;
    const startY = 150;

    games.forEach((game, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (gameWidth + spacingX) + gameWidth / 2;
      const y = startY + row * (gameHeight + spacingY);

      this.createGameCard(game, x, y, gameWidth, gameHeight);
    });
  }

  /**
   * Create individual game card
   */
  createGameCard(game, x, y, width, height) {
    const container = this.add.container(x, y);

    // Background
    const bg = this.add.rectangle(0, 0, width, height, this.categoryData.color, 0.9);
    bg.setStrokeStyle(3, 0xFFFFFF);

    // Game icon (use category icon for now)
    const icon = this.add.text(-width / 2 + 40, 0, this.categoryData.icon, {
      fontSize: '48px'
    }).setOrigin(0.5);

    // Game name
    const nameText = this.add.text(-width / 2 + 80, 0, game.name, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold',
      wordWrap: { width: width - 120 }
    }).setOrigin(0, 0.5);

    // Play button indicator
    const playBtn = this.add.text(width / 2 - 30, 0, '▶', {
      fontSize: '32px',
      color: '#FFD700'
    }).setOrigin(0.5);

    container.add([bg, icon, nameText, playBtn]);

    // Make interactive
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.setFillStyle(this.categoryData.color, 1.0);
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100
      });
      this.tweens.add({
        targets: playBtn,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100
      });
    });

    container.on('pointerout', () => {
      bg.setFillStyle(this.categoryData.color, 0.9);
      this.tweens.add({
        targets: container,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 100
      });
      this.tweens.add({
        targets: playBtn,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 100
      });
    });

    container.on('pointerdown', () => {
      this.audioManager.playClick();
      this.startGame(game.scene);
    });
  }

  /**
   * Create back button
   */
  createBackButton() {
    const { width, height } = this.cameras.main;

    const backBtn = new Button(this, width / 2, height - 40, {
      text: 'Back to Categories',
      icon: '←',
      width: 250,
      height: 50,
      bgColor: 0x607D8B,
      onClick: () => {
        this.audioManager.playClick();
        this.scene.start('GameHubScene');
      }
    });
  }

  /**
   * Start a game
   */
  startGame(sceneKey) {
    this.scene.start(sceneKey, {
      difficulty: this.progressTracker.getDifficulty(),
      progressTracker: this.progressTracker,
      rewardSystem: this.rewardSystem,
      learningEngine: this.learningEngine
    });
  }
}
