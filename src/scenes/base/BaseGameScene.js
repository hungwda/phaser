import EventBus from '../../utils/EventBus.js';

/**
 * BaseGameScene - Base class for all educational games
 * Provides common functionality for game lifecycle, scoring, UI, and feedback
 */
export class BaseGameScene extends Phaser.Scene {
  constructor(key, config = {}) {
    super(key);

    // Game configuration
    this.gameConfig = config;
    this.difficulty = config.difficulty || 'beginner';

    // Game state
    this.score = 0;
    this.lives = config.lives || 3;
    this.level = 1;
    this.isGameActive = false;
    this.isPaused = false;

    // Timer
    this.timeLimit = config.timeLimit || null;
    this.timeRemaining = this.timeLimit;
    this.timerEvent = null;

    // UI elements
    this.scoreText = null;
    this.livesText = null;
    this.timerText = null;
    this.instructionText = null;

    // Audio
    this.audioManager = null;

    // Combo system
    this.comboCount = 0;
    this.lastCorrectTime = 0;
    this.comboTimeout = 2000; // 2 seconds to maintain combo
  }

  /**
   * Initialize scene with data from previous scene
   */
  init(data) {
    this.difficulty = data.difficulty || this.difficulty;
    this.level = data.level || 1;

    // Reset game state
    this.score = 0;
    this.lives = this.gameConfig.lives || 3;
    this.isGameActive = false;
    this.isPaused = false;
    this.comboCount = 0;

    // Reset timer
    if (this.timeLimit) {
      this.timeRemaining = this.timeLimit;
    }
  }

  /**
   * Common preload - can be extended by child scenes
   */
  preload() {
    // Load common assets
    this.loadCommonAssets();
  }

  /**
   * Load assets common to all games
   */
  loadCommonAssets() {
    // Load UI assets
    this.load.audio('sfx_correct', 'assets/audio/sfx/correct.mp3');
    this.load.audio('sfx_wrong', 'assets/audio/sfx/wrong.mp3');
    this.load.audio('sfx_click', 'assets/audio/sfx/click.mp3');
    this.load.audio('sfx_celebration', 'assets/audio/sfx/celebration.mp3');
    this.load.audio('sfx_gameover', 'assets/audio/sfx/gameover.mp3');
  }

  /**
   * Create standard UI elements (score, lives, timer)
   */
  createStandardUI() {
    const { width, height } = this.cameras.main;

    // Score display (top left)
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0, 0);

    // Lives display (top right)
    this.livesText = this.add.text(width - 20, 20, `Lives: ${this.lives}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(1, 0);

    // Timer display (top center) - if time limit exists
    if (this.timeLimit) {
      this.timerText = this.add.text(width / 2, 20, `Time: ${this.timeRemaining}s`, {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5, 0);
    }

    // Pause button
    this.createPauseButton();

    // Close button
    this.createCloseButton();

    // Add to a UI container for easy management
    this.uiContainer = this.add.container(0, 0);
    this.uiContainer.setDepth(1000); // Always on top
  }

  /**
   * Create pause button
   */
  createPauseButton() {
    const { width } = this.cameras.main;

    const pauseBtn = this.add.text(width - 20, 70, '⏸', {
      fontSize: '32px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0);

    pauseBtn.setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => this.togglePause());

    this.pauseButton = pauseBtn;
  }

  /**
   * Create close/exit button
   */
  createCloseButton() {
    const { width } = this.cameras.main;

    const closeBtn = this.add.text(width - 20, 120, '✖', {
      fontSize: '32px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0);

    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.confirmExit());

    // Hover effect
    closeBtn.on('pointerover', () => {
      closeBtn.setColor('#FF0000');
    });

    closeBtn.on('pointerout', () => {
      closeBtn.setColor('#FFFFFF');
    });

    this.closeButton = closeBtn;
  }

  /**
   * Show confirmation dialog before exiting
   */
  confirmExit() {
    const { width, height } = this.cameras.main;

    // Pause the game
    this.isPaused = true;
    if (this.physics && this.physics.world) {
      this.physics.pause();
    }

    // Create confirmation overlay
    this.confirmOverlay = this.add.container(0, 0).setDepth(2500);

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85)
      .setOrigin(0, 0);

    const confirmText = this.add.text(width / 2, height / 2 - 60, 'Exit Game?', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    const warningText = this.add.text(width / 2, height / 2, 'Your progress will be lost!', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFF00'
    }).setOrigin(0.5);

    // Yes button
    const yesBtn = this.add.text(width / 2 - 80, height / 2 + 80, 'Yes, Exit', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#D32F2F',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    yesBtn.on('pointerover', () => {
      yesBtn.setScale(1.1);
    });

    yesBtn.on('pointerout', () => {
      yesBtn.setScale(1);
    });

    yesBtn.on('pointerdown', () => {
      this.sound.play('sfx_click');
      this.exitToHub();
    });

    // No button (cancel)
    const noBtn = this.add.text(width / 2 + 80, height / 2 + 80, 'Cancel', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#4CAF50',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    noBtn.on('pointerover', () => {
      noBtn.setScale(1.1);
    });

    noBtn.on('pointerout', () => {
      noBtn.setScale(1);
    });

    noBtn.on('pointerdown', () => {
      this.sound.play('sfx_click');
      this.cancelExit();
    });

    this.confirmOverlay.add([overlay, confirmText, warningText, yesBtn, noBtn]);
  }

  /**
   * Cancel exit and resume game
   */
  cancelExit() {
    if (this.confirmOverlay) {
      this.confirmOverlay.destroy();
      this.confirmOverlay = null;
    }

    // Resume game
    this.isPaused = false;
    if (this.physics && this.physics.world) {
      this.physics.resume();
    }
  }

  /**
   * Exit to GameHub
   */
  exitToHub() {
    // Stop timer
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // Emit exit event
    EventBus.emit('game:exit', {
      scene: this.scene.key,
      score: this.score
    });

    // Return to hub
    this.scene.start('GameHubScene');
  }

  /**
   * Show game instructions
   */
  showInstructions(instructions, duration = 5000) {
    const { width, height } = this.cameras.main;

    // Create semi-transparent overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setDepth(2000);

    // Instructions text
    const instructionsText = Array.isArray(instructions)
      ? instructions.join('\n')
      : instructions;

    this.instructionText = this.add.text(width / 2, height / 2, instructionsText, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      align: 'center',
      wordWrap: { width: width - 100 }
    }).setOrigin(0.5)
      .setDepth(2001);

    // "Tap to start" message
    const startText = this.add.text(width / 2, height - 100, 'Click anywhere to start!', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFF00'
    }).setOrigin(0.5)
      .setDepth(2001);

    // Pulsing animation
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Click to start
    const clickHandler = () => {
      overlay.destroy();
      this.instructionText.destroy();
      startText.destroy();
      this.input.off('pointerdown', clickHandler);
      this.startGame();
    };

    this.input.once('pointerdown', clickHandler);
  }

  /**
   * Start the game
   */
  startGame() {
    this.isGameActive = true;

    // Start timer if time limit exists
    if (this.timeLimit) {
      this.startTimer();
    }

    // Emit game start event
    EventBus.emit('game:start', {
      scene: this.scene.key,
      difficulty: this.difficulty
    });

    // Child classes should override this
    this.onGameStart();
  }

  /**
   * Override in child classes
   */
  onGameStart() {
    // To be implemented by child classes
  }

  /**
   * Start countdown timer
   */
  startTimer() {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  /**
   * Update timer
   */
  updateTimer() {
    if (!this.isPaused && this.isGameActive) {
      this.timeRemaining--;

      if (this.timerText) {
        this.timerText.setText(`Time: ${this.timeRemaining}s`);

        // Warning color when time is running out
        if (this.timeRemaining <= 10) {
          this.timerText.setColor('#FF0000');
        }
      }

      if (this.timeRemaining <= 0) {
        this.onTimeUp();
      }
    }
  }

  /**
   * Handle time running out
   */
  onTimeUp() {
    this.endGame(false, 'Time\'s up!');
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.pauseGame();
    } else {
      this.resumeGame();
    }
  }

  /**
   * Pause the game
   */
  pauseGame() {
    this.isPaused = true;
    this.physics.pause();

    // Show pause overlay
    this.showPauseOverlay();

    EventBus.emit('game:pause', { scene: this.scene.key });
  }

  /**
   * Resume the game
   */
  resumeGame() {
    this.isPaused = false;
    this.physics.resume();

    // Hide pause overlay
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = null;
    }

    EventBus.emit('game:resume', { scene: this.scene.key });
  }

  /**
   * Show pause overlay
   */
  showPauseOverlay() {
    const { width, height } = this.cameras.main;

    this.pauseOverlay = this.add.container(0, 0).setDepth(2000);

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
      .setOrigin(0, 0);

    const pausedText = this.add.text(width / 2, height / 2, 'PAUSED', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    const resumeText = this.add.text(width / 2, height / 2 + 80, 'Click to resume', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFF00'
    }).setOrigin(0.5);

    this.pauseOverlay.add([overlay, pausedText, resumeText]);

    overlay.setInteractive();
    overlay.on('pointerdown', () => this.togglePause());
  }

  /**
   * End the game
   */
  endGame(success, message = '') {
    this.isGameActive = false;

    // Stop timer
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // Calculate final stats
    const stats = this.calculateStats();

    // Emit game end event
    EventBus.emit('game:end', {
      scene: this.scene.key,
      success,
      score: this.score,
      stats
    });

    // Show results
    this.showResults(success, message, stats);
  }

  /**
   * Calculate game statistics
   */
  calculateStats() {
    return {
      score: this.score,
      level: this.level,
      difficulty: this.difficulty,
      timeRemaining: this.timeRemaining
    };
  }

  /**
   * Show game results
   */
  showResults(success, message, stats) {
    const { width, height } = this.cameras.main;

    // Create overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
      .setOrigin(0, 0)
      .setDepth(3000);

    // Result text
    const resultText = this.add.text(width / 2, height / 2 - 100,
      success ? '🎉 Great Job!' : '😢 Game Over',
      {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: success ? '#00FF00' : '#FF0000'
      }).setOrigin(0.5)
      .setDepth(3001);

    // Message
    if (message) {
      this.add.text(width / 2, height / 2 - 40, message, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#FFFFFF'
      }).setOrigin(0.5)
        .setDepth(3001);
    }

    // Score
    const scoreText = this.add.text(width / 2, height / 2 + 20, `Final Score: ${this.score}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FFFF00'
    }).setOrigin(0.5)
      .setDepth(3001);

    // Buttons
    this.createResultButtons(width, height);

    // Play sound
    if (success) {
      this.sound.play('sfx_celebration');
    } else {
      this.sound.play('sfx_gameover');
    }
  }

  /**
   * Create result screen buttons
   */
  createResultButtons(width, height) {
    // Retry button
    const retryBtn = this.add.text(width / 2 - 100, height / 2 + 100, '🔄 Retry', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#4CAF50',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)
      .setDepth(3001)
      .setInteractive({ useHandCursor: true });

    retryBtn.on('pointerdown', () => {
      this.sound.play('sfx_click');
      this.scene.restart();
    });

    // Menu button
    const menuBtn = this.add.text(width / 2 + 100, height / 2 + 100, '🏠 Menu', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#2196F3',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)
      .setDepth(3001)
      .setInteractive({ useHandCursor: true });

    menuBtn.on('pointerdown', () => {
      this.sound.play('sfx_click');
      this.scene.start('GameHubScene');
    });
  }

  /**
   * Add score
   */
  addScore(points) {
    this.score += points;

    if (this.scoreText) {
      this.scoreText.setText(`Score: ${this.score}`);
    }

    // Score popup animation
    this.showScorePopup(points);

    EventBus.emit('score:update', {
      scene: this.scene.key,
      score: this.score,
      points
    });
  }

  /**
   * Show score popup
   */
  showScorePopup(points) {
    const { width } = this.cameras.main;

    const color = points > 0 ? '#00FF00' : '#FF0000';
    const prefix = points > 0 ? '+' : '';

    const popup = this.add.text(width / 2, 150, `${prefix}${points}`, {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)
      .setDepth(1001);

    // Animate
    this.tweens.add({
      targets: popup,
      y: 100,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => popup.destroy()
    });
  }

  /**
   * Lose a life
   */
  loseLife() {
    this.lives--;

    if (this.livesText) {
      this.livesText.setText(`Lives: ${this.lives}`);
    }

    // Screen shake
    this.cameras.main.shake(200, 0.01);

    if (this.lives <= 0) {
      this.onNoLivesRemaining();
    }

    EventBus.emit('lives:update', {
      scene: this.scene.key,
      lives: this.lives
    });
  }

  /**
   * Handle no lives remaining
   */
  onNoLivesRemaining() {
    this.endGame(false, 'No lives remaining!');
  }

  /**
   * Play correct answer feedback
   */
  playCorrectFeedback() {
    this.sound.play('sfx_correct');

    // Update combo
    const now = this.time.now;
    if (now - this.lastCorrectTime < this.comboTimeout) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.lastCorrectTime = now;

    // Show combo if > 1
    if (this.comboCount > 1) {
      this.showComboText();
    }

    // Flash effect
    this.cameras.main.flash(200, 0, 255, 0, false);
  }

  /**
   * Show combo text
   */
  showComboText() {
    const { width } = this.cameras.main;

    const comboText = this.add.text(width / 2, 250, `Combo x${this.comboCount}!`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)
      .setDepth(1002);

    this.tweens.add({
      targets: comboText,
      scale: 1.5,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => comboText.destroy()
    });
  }

  /**
   * Play incorrect answer feedback
   */
  playIncorrectFeedback() {
    this.sound.play('sfx_wrong');

    // Reset combo
    this.comboCount = 0;

    // Red flash
    this.cameras.main.flash(200, 255, 0, 0, false);
  }

  /**
   * Show hint
   */
  showHint(hintText) {
    const { width, height } = this.cameras.main;

    const hint = this.add.text(width / 2, height - 100, `💡 ${hintText}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFF00',
      backgroundColor: '#000000',
      padding: { x: 15, y: 10 }
    }).setOrigin(0.5)
      .setDepth(1003);

    // Auto-hide after 3 seconds
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: hint,
        alpha: 0,
        duration: 500,
        onComplete: () => hint.destroy()
      });
    });
  }

  /**
   * Cleanup
   */
  shutdown() {
    // Remove timer
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // Call parent shutdown
    super.shutdown();
  }
}
