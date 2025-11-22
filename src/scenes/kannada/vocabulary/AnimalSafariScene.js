import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';
import { WordCard } from '../../../components/educational/WordCard.js';

/**
 * AnimalSafariScene - Explore and learn animal names in Kannada
 */
export class AnimalSafariScene extends BaseGameScene {
  constructor() {
    super('AnimalSafariScene', {
      lives: 0, // No lives - exploration mode
      timeLimit: null // No time limit
    });

    this.animals = [];
    this.animalSprites = [];
    this.discoveredAnimals = [];
    this.currentChallenge = null;
    this.challengeMode = false;
  }

  preload() {
    super.preload();

    // Load animals data
    this.load.json('animals', 'src/data/kannada/animals.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Load data
    this.animalsData = this.cache.json.get('animals');
    this.animals = this.animalsData.items;

    // Initialize audio manager
    this.audioManager = new AudioManager(this);
    this.registerPronunciations();

    // Create safari scene
    this.createSafariBackground();

    // Create UI (without lives display)
    this.createCustomUI();

    // Create animals in scene
    this.createAnimalSprites();

    // Create info panel
    this.createInfoPanel();

    // Create challenge mode button
    this.createChallengeModeButton();

    // Show instructions
    this.showInstructions([
      'Click on animals to learn their names!',
      'Explore the safari and discover all animals',
      'Try Challenge Mode when ready'
    ]);
  }

  /**
   * Register animal pronunciations
   */
  registerPronunciations() {
    if (this.animals) {
      this.audioManager.registerPronunciationsFromData(this.animals);
    }
  }

  /**
   * Create safari background
   */
  createSafariBackground() {
    const { width, height } = this.cameras.main;

    // Sky
    const sky = this.add.rectangle(0, 0, width, height, 0x87CEEB)
      .setOrigin(0, 0);

    // Ground
    const ground = this.add.rectangle(0, height - 150, width, 150, 0x8B4513)
      .setOrigin(0, 0);

    // Grass
    const grass = this.add.rectangle(0, height - 150, width, 20, 0x228B22)
      .setOrigin(0, 0);

    // Sun
    const sun = this.add.circle(100, 100, 40, 0xFFFF00);

    // Trees (simple)
    this.createTree(150, height - 200);
    this.createTree(650, height - 180);

    // Bushes
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = height - 140;
      this.add.circle(x, y, 20, 0x006400, 0.6);
    }
  }

  /**
   * Create simple tree
   */
  createTree(x, y) {
    // Trunk
    this.add.rectangle(x, y, 20, 60, 0x8B4513);

    // Leaves
    this.add.circle(x, y - 40, 40, 0x228B22);
  }

  /**
   * Create custom UI
   */
  createCustomUI() {
    const { width } = this.cameras.main;

    // Score display
    this.scoreText = this.add.text(20, 20, 'Discovered: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0, 0);

    // Progress
    this.progressText = this.add.text(width - 20, 20, `0/${this.animals.length}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(1, 0);
  }

  /**
   * Create animal sprites
   */
  createAnimalSprites() {
    const { width, height } = this.cameras.main;

    // Positions for animals (scattered across scene)
    const positions = [
      { x: 200, y: height - 250 },
      { x: 350, y: height - 200 },
      { x: 500, y: height - 280 },
      { x: 120, y: height - 320 },
      { x: 620, y: height - 240 },
      { x: 280, y: height - 180 },
      { x: 450, y: height - 310 },
      { x: 680, y: height - 190 },
      { x: 160, y: height - 220 },
      { x: 580, y: height - 270 }
    ];

    this.animals.forEach((animal, index) => {
      if (index >= positions.length) return;

      const pos = positions[index];
      const sprite = this.createAnimalSprite(animal, pos.x, pos.y);
      this.animalSprites.push(sprite);
    });
  }

  /**
   * Create individual animal sprite
   */
  createAnimalSprite(animal, x, y) {
    // Container for animal
    const container = this.add.container(x, y);

    // Placeholder animal (colored circle with emoji)
    const circle = this.add.circle(0, 0, 30, this.getAnimalColor(animal.id));
    circle.setStrokeStyle(3, 0x000000);

    // Simple emoji representation (in production, use actual images)
    const emoji = this.getAnimalEmoji(animal.id);
    const emojiText = this.add.text(0, 0, emoji, {
      fontSize: '32px'
    }).setOrigin(0.5);

    // Question mark overlay (until discovered)
    const questionMark = this.add.text(0, 0, '?', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    container.add([circle, emojiText, questionMark]);

    // Store data
    container.setData('animal', animal);
    container.setData('discovered', false);
    container.setData('questionMark', questionMark);

    // Make interactive
    container.setSize(60, 60);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => this.onAnimalClick(container));

    // Idle animation
    this.tweens.add({
      targets: container,
      y: y - 10,
      duration: 2000 + index * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return container;
  }

  /**
   * Get animal color by ID
   */
  getAnimalColor(id) {
    const colors = {
      animal_dog: 0xA0522D,
      animal_cat: 0xFFA500,
      animal_elephant: 0x808080,
      animal_cow: 0xFFFFFF,
      animal_tiger: 0xFF8C00,
      animal_bird: 0x4169E1,
      animal_monkey: 0xD2691E,
      animal_horse: 0x8B4513,
      animal_rabbit: 0xFFF8DC,
      animal_fish: 0x1E90FF
    };
    return colors[id] || 0xCCCCCC;
  }

  /**
   * Get animal emoji by ID
   */
  getAnimalEmoji(id) {
    const emojis = {
      animal_dog: '🐕',
      animal_cat: '🐱',
      animal_elephant: '🐘',
      animal_cow: '🐄',
      animal_tiger: '🐅',
      animal_bird: '🐦',
      animal_monkey: '🐵',
      animal_horse: '🐴',
      animal_rabbit: '🐰',
      animal_fish: '🐟'
    };
    return emojis[id] || '🦁';
  }

  /**
   * Handle animal click
   */
  onAnimalClick(animalSprite) {
    const animal = animalSprite.getData('animal');
    const discovered = animalSprite.getData('discovered');

    if (this.challengeMode) {
      // Challenge mode - check if correct animal
      this.checkChallengeAnswer(animalSprite);
    } else {
      // Exploration mode - discover animal
      if (!discovered) {
        this.discoverAnimal(animalSprite);
      } else {
        // Already discovered - just show info
        this.showAnimalInfo(animal);
      }
    }
  }

  /**
   * Discover animal
   */
  discoverAnimal(animalSprite) {
    const animal = animalSprite.getData('animal');

    // Mark as discovered
    animalSprite.setData('discovered', true);

    // Hide question mark
    const questionMark = animalSprite.getData('questionMark');
    this.tweens.add({
      targets: questionMark,
      alpha: 0,
      duration: 300,
      onComplete: () => questionMark.setVisible(false)
    });

    // Add to discovered list
    if (!this.discoveredAnimals.includes(animal.id)) {
      this.discoveredAnimals.push(animal.id);

      // Update UI
      this.scoreText.setText(`Discovered: ${this.discoveredAnimals.length}`);
      this.progressText.setText(`${this.discoveredAnimals.length}/${this.animals.length}`);

      // Add score
      this.addScore(10);
    }

    // Show info
    this.showAnimalInfo(animal);

    // Celebration effect
    this.createDiscoveryEffect(animalSprite.x, animalSprite.y);

    // Play correct feedback
    this.playCorrectFeedback();

    // Check if all discovered
    if (this.discoveredAnimals.length === this.animals.length) {
      this.onAllDiscovered();
    }
  }

  /**
   * Show animal info
   */
  showAnimalInfo(animal) {
    // Clear previous info
    if (this.infoPanel) {
      this.infoPanel.removeAll(true);
    } else {
      this.createInfoPanel();
    }

    // Show word card
    const wordCard = new WordCard(this, 0, 0, animal, {
      showImage: true,
      showKannada: true,
      showEnglish: true,
      showTransliteration: true,
      interactive: false
    });

    this.infoPanel.add(wordCard);

    // Animate in
    this.tweens.add({
      targets: this.infoPanel,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Auto-play pronunciation
    this.audioManager.playWord(animal.kannada);
  }

  /**
   * Create info panel
   */
  createInfoPanel() {
    const { width } = this.cameras.main;

    this.infoPanel = this.add.container(width - 100, 150);
    this.infoPanel.setAlpha(0);
    this.infoPanel.setScale(0.5);
  }

  /**
   * Create discovery effect
   */
  createDiscoveryEffect(x, y) {
    // Stars bursting
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const star = this.add.text(x, y, '⭐', {
        fontSize: '20px'
      });

      this.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * 80,
        y: y + Math.sin(angle) * 80,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => star.destroy()
      });
    }
  }

  /**
   * All animals discovered
   */
  onAllDiscovered() {
    this.showHint('Amazing! You discovered all animals! Try Challenge Mode!');

    // Unlock challenge mode button
    if (this.challengeButton) {
      this.challengeButton.setAlpha(1);
    }
  }

  /**
   * Create challenge mode button
   */
  createChallengeModeButton() {
    const { width } = this.cameras.main;

    this.challengeButton = this.add.text(width / 2, 70, '🏆 Challenge Mode', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#FF5722',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    this.challengeButton.setInteractive({ useHandCursor: true });
    this.challengeButton.on('pointerdown', () => this.startChallengeMode());
    this.challengeButton.setAlpha(0.5); // Dimmed until all discovered
  }

  /**
   * Start challenge mode
   */
  startChallengeMode() {
    if (this.discoveredAnimals.length < this.animals.length) {
      this.showHint('Discover all animals first!');
      return;
    }

    this.challengeMode = true;
    this.challengeButton.setVisible(false);

    // Clear info panel
    if (this.infoPanel) {
      this.infoPanel.removeAll(true);
      this.infoPanel.setAlpha(0);
    }

    // Start first challenge
    this.nextChallenge();
  }

  /**
   * Next challenge
   */
  nextChallenge() {
    // Select random animal
    this.currentChallenge = Phaser.Utils.Array.GetRandom(this.animals);

    // Show challenge prompt
    this.showChallengePrompt();
  }

  /**
   * Show challenge prompt
   */
  showChallengePrompt() {
    const { width } = this.cameras.main;

    // Remove previous prompt
    if (this.challengePrompt) {
      this.challengePrompt.destroy();
    }

    this.challengePrompt = this.add.container(width / 2, 100);

    const bg = this.add.rectangle(0, 0, 400, 80, 0x000000, 0.8);
    bg.setStrokeStyle(3, 0xFFD700);

    const text = this.add.text(0, -15, 'Find:', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    const kannadaText = this.add.text(0, 15, this.currentChallenge.kannada, {
      fontSize: '32px',
      fontFamily: 'Nudi, Arial',
      color: '#FFD700'
    }).setOrigin(0.5);

    const audioBtn = this.add.circle(150, 0, 20, 0x4CAF50);
    audioBtn.setInteractive({ useHandCursor: true });
    audioBtn.on('pointerdown', () => {
      this.audioManager.playWord(this.currentChallenge.kannada);
    });

    const audioIcon = this.add.text(150, 0, '🔊', {
      fontSize: '24px'
    }).setOrigin(0.5);

    this.challengePrompt.add([bg, text, kannadaText, audioBtn, audioIcon]);

    // Play pronunciation
    this.time.delayedCall(500, () => {
      this.audioManager.playWord(this.currentChallenge.kannada);
    });
  }

  /**
   * Check challenge answer
   */
  checkChallengeAnswer(animalSprite) {
    const animal = animalSprite.getData('animal');

    if (animal.id === this.currentChallenge.id) {
      // Correct!
      this.addScore(50);
      this.playCorrectFeedback();

      // Flash effect
      this.tweens.add({
        targets: animalSprite,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      });

      // Next challenge after delay
      this.time.delayedCall(1000, () => {
        this.nextChallenge();
      });
    } else {
      // Wrong
      this.playIncorrectFeedback();

      // Shake effect
      this.tweens.add({
        targets: animalSprite,
        x: animalSprite.x - 10,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Power2'
      });
    }
  }

  /**
   * Start game
   */
  onGameStart() {
    // Game starts in exploration mode automatically
  }

  /**
   * Calculate stats
   */
  calculateStats() {
    return {
      score: this.score,
      difficulty: this.difficulty,
      discovered: this.discoveredAnimals.length,
      total: this.animals.length
    };
  }

  /**
   * Cleanup
   */
  shutdown() {
    super.shutdown();
  }
}
