import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * AksharaPopScene - Pop the bubbles with the correct Kannada letter
 */
export class AksharaPopScene extends BaseGameScene {
  constructor() {
    super('AksharaPopScene', {
      lives: 5,
      timeLimit: 60
    });

    this.bubbles = [];
    this.currentTargetLetter = null;
    this.letterPool = [];
    this.spawnTimer = null;
    this.targetAttempts = 0;
    this.targetCorrect = 0;
  }

  preload() {
    super.preload();

    // Load Kannada alphabet data
    this.load.json('alphabet', 'src/data/kannada/alphabet.json');

    // Load game config
    this.load.json('aksharaPopConfig', 'src/data/games/akshara-pop.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Load data
    this.alphabetData = this.cache.json.get('alphabet');
    this.gameData = this.cache.json.get('aksharaPopConfig');

    // Initialize audio manager
    this.audioManager = new AudioManager(this);
    this.registerPronunciations();

    // Get difficulty config
    this.difficultyConfig = this.gameData.difficulty[this.difficulty] || this.gameData.difficulty.beginner;

    // Override base config with game-specific values
    this.lives = this.difficultyConfig.lives;
    this.timeLimit = this.difficultyConfig.timeLimit;
    this.timeRemaining = this.timeLimit;

    // Create background
    this.createGameBackground();

    // Create UI
    this.createStandardUI();

    // Create target letter display
    this.createTargetDisplay();

    // Select letter pool based on difficulty
    this.selectLetterPool();

    // Show instructions
    this.showInstructions(this.gameData.instructions);
  }

  /**
   * Register letter pronunciations with audio manager
   */
  registerPronunciations() {
    if (this.alphabetData) {
      this.audioManager.registerPronunciationsFromData(this.alphabetData.vowels);
      this.audioManager.registerPronunciationsFromData(this.alphabetData.consonants);
    }
  }

  /**
   * Create game background
   */
  createGameBackground() {
    const { width, height } = this.cameras.main;

    // Sky gradient
    const bg = this.add.rectangle(0, 0, width, height, 0x87CEEB)
      .setOrigin(0, 0);

    // Add some clouds
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, width - 100);
      const y = Phaser.Math.Between(50, 150);

      this.createCloud(x, y);
    }
  }

  /**
   * Create decorative cloud
   */
  createCloud(x, y) {
    const cloud = this.add.container(x, y);

    // Create cloud circles
    const circle1 = this.add.circle(-20, 0, 30, 0xFFFFFF, 0.7);
    const circle2 = this.add.circle(0, -10, 40, 0xFFFFFF, 0.7);
    const circle3 = this.add.circle(20, 0, 30, 0xFFFFFF, 0.7);

    cloud.add([circle1, circle2, circle3]);

    // Float animation
    this.tweens.add({
      targets: cloud,
      x: x + 50,
      duration: 10000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Create target letter display
   */
  createTargetDisplay() {
    const { width } = this.cameras.main;

    // Container
    this.targetContainer = this.add.container(width / 2, 120);

    // Background
    const bg = this.add.rectangle(0, 0, 400, 80, 0x000000, 0.5);
    bg.setStrokeStyle(3, 0xFFD700);

    // Instruction text
    const instruction = this.add.text(-180, 0, 'Find:', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);

    // Target letter text
    this.targetLetterText = this.add.text(-100, 0, '', {
      fontSize: '48px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFF00'
    }).setOrigin(0, 0.5);

    // Audio button
    const audioBtn = this.add.circle(100, 0, 25, 0x4CAF50);
    audioBtn.setStrokeStyle(2, 0x388E3C);

    const audioIcon = this.add.text(100, 0, '🔊', {
      fontSize: '32px'
    }).setOrigin(0.5);

    audioBtn.setInteractive({ useHandCursor: true });
    audioBtn.on('pointerdown', () => this.playTargetAudio());

    this.targetContainer.add([bg, instruction, this.targetLetterText, audioBtn, audioIcon]);
  }

  /**
   * Select letter pool based on difficulty
   */
  selectLetterPool() {
    const lettersConfig = this.difficultyConfig.letters;
    this.letterPool = [];

    lettersConfig.forEach(config => {
      if (config === 'vowels') {
        this.letterPool.push(...this.alphabetData.vowels);
      } else if (config === 'consonants:basic') {
        // First few consonants
        this.letterPool.push(...this.alphabetData.consonants.slice(0, 5));
      } else if (config === 'all') {
        this.letterPool.push(...this.alphabetData.vowels);
        this.letterPool.push(...this.alphabetData.consonants);
      }
    });
  }

  /**
   * Start the game
   */
  onGameStart() {
    // Select first target letter
    this.selectNewTarget();

    // Start spawning bubbles
    this.startBubbleSpawning();
  }

  /**
   * Select new target letter
   */
  selectNewTarget() {
    // Select random letter from pool
    this.currentTargetLetter = Phaser.Utils.Array.GetRandom(this.letterPool);

    // Update UI
    this.targetLetterText.setText(this.currentTargetLetter.letter);

    // Play pronunciation
    this.time.delayedCall(500, () => {
      this.playTargetAudio();
    });

    // Reset target stats
    this.targetAttempts = 0;
    this.targetCorrect = 0;
  }

  /**
   * Play target letter audio
   */
  playTargetAudio() {
    this.audioManager.playLetter(this.currentTargetLetter.letter);

    // Pulse animation
    this.tweens.add({
      targets: this.targetLetterText,
      scale: 1.3,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
  }

  /**
   * Start spawning bubbles
   */
  startBubbleSpawning() {
    this.spawnTimer = this.time.addEvent({
      delay: this.difficultyConfig.spawnInterval,
      callback: this.spawnBubble,
      callbackScope: this,
      loop: true
    });

    // Spawn first bubble immediately
    this.spawnBubble();
  }

  /**
   * Spawn a bubble
   */
  spawnBubble() {
    if (!this.isGameActive) return;

    const { width, height } = this.cameras.main;

    // Random position at bottom
    const x = Phaser.Math.Between(80, width - 80);
    const y = height + 50;

    // Randomly select letter (70% chance for target, 30% for random)
    const isTarget = Math.random() < 0.7;
    const letterData = isTarget
      ? this.currentTargetLetter
      : Phaser.Utils.Array.GetRandom(this.letterPool);

    // Create bubble
    const bubble = this.createBubble(x, y, letterData);

    // Add to tracking array
    this.bubbles.push(bubble);
  }

  /**
   * Create bubble object
   */
  createBubble(x, y, letterData) {
    // Container for bubble
    const bubble = this.add.container(x, y);

    // Bubble circle with gradient effect
    const graphics = this.make.graphics();
    graphics.fillStyle(0x87CEEB, 0.8);
    graphics.fillCircle(0, 0, 50);
    graphics.lineStyle(3, 0xFFFFFF, 0.6);
    graphics.strokeCircle(0, 0, 50);

    // Letter text
    const letter = this.add.text(0, 0, letterData.letter, {
      fontSize: '48px',
      fontFamily: 'Nudi, Arial',
      color: '#000000'
    }).setOrigin(0.5);

    bubble.add([graphics, letter]);

    // Store letter data
    bubble.setData('letterData', letterData);
    bubble.setData('isTarget', letterData.id === this.currentTargetLetter.id);

    // Make interactive
    bubble.setSize(100, 100);
    bubble.setInteractive({ useHandCursor: true });
    bubble.on('pointerdown', () => this.onBubbleClick(bubble));

    // Float up animation
    this.tweens.add({
      targets: bubble,
      y: -100,
      duration: (this.cameras.main.height + 150) / this.difficultyConfig.bubbleSpeed * 1000,
      onComplete: () => {
        // Bubble escaped - lose a life if it was the target
        if (bubble.getData('isTarget')) {
          this.loseLife();
        }
        bubble.destroy();
        this.bubbles = this.bubbles.filter(b => b !== bubble);
      }
    });

    // Wobble animation
    this.tweens.add({
      targets: bubble,
      angle: -5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return bubble;
  }

  /**
   * Handle bubble click
   */
  onBubbleClick(bubble) {
    if (!this.isGameActive) return;

    const isTarget = bubble.getData('isTarget');
    const letterData = bubble.getData('letterData');

    this.targetAttempts++;

    if (isTarget) {
      // Correct!
      this.targetCorrect++;
      this.onCorrectPop(bubble);
    } else {
      // Wrong!
      this.onWrongPop(bubble);
    }

    // Remove bubble
    bubble.destroy();
    this.bubbles = this.bubbles.filter(b => b !== bubble);
  }

  /**
   * Handle correct bubble pop
   */
  onCorrectPop(bubble) {
    // Add score
    const points = this.gameData.scoring.correctPop;
    this.addScore(points);

    // Play feedback
    this.playCorrectFeedback();

    // Create pop effect
    this.createPopEffect(bubble.x, bubble.y, 0x00FF00);

    // Check if should select new target
    if (this.targetCorrect >= 3) {
      // Mastered this letter, select new one
      this.time.delayedCall(500, () => {
        this.selectNewTarget();
      });
    }

    // Record learning progress
    this.recordLearningAttempt(true);
  }

  /**
   * Handle wrong bubble pop
   */
  onWrongPop(bubble) {
    // Deduct points
    const points = this.gameData.scoring.wrongPop;
    this.addScore(points);

    // Play feedback
    this.playIncorrectFeedback();

    // Create pop effect
    this.createPopEffect(bubble.x, bubble.y, 0xFF0000);

    // Lose a life
    this.loseLife();

    // Record learning attempt
    this.recordLearningAttempt(false);
  }

  /**
   * Create pop visual effect
   */
  createPopEffect(x, y, color) {
    // Create particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const speed = 200;

      const particle = this.add.circle(x, y, 5, color);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 100,
        y: y + Math.sin(angle) * 100,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * Record learning attempt for progress tracking
   */
  recordLearningAttempt(correct) {
    // This would integrate with ProgressTracker
    // For now, just log
    console.log(`Attempt for ${this.currentTargetLetter.letter}: ${correct ? 'correct' : 'wrong'}`);
  }

  /**
   * Calculate stats at game end
   */
  calculateStats() {
    const totalAttempts = this.targetAttempts;
    const correctAttempts = this.targetCorrect;
    const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

    return {
      score: this.score,
      level: this.level,
      difficulty: this.difficulty,
      timeRemaining: this.timeRemaining,
      totalAttempts,
      correctAttempts,
      accuracy
    };
  }

  /**
   * Cleanup
   */
  shutdown() {
    // Stop spawning
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    // Destroy all bubbles
    this.bubbles.forEach(bubble => bubble.destroy());
    this.bubbles = [];

    super.shutdown();
  }

  /**
   * Update loop
   */
  update(time, delta) {
    if (!this.isGameActive) return;

    // Game logic updates
  }
}
