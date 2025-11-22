import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';
import { LetterSprite } from '../../../components/educational/LetterSprite.js';

/**
 * LetterTracingScene - Trace Kannada letters with your finger/mouse
 */
export class LetterTracingScene extends BaseGameScene {
  constructor() {
    super('LetterTracingScene', {
      lives: 3,
      timeLimit: null // No time limit for tracing
    });

    this.currentLetter = null;
    this.letterPool = [];
    this.tracingPath = null;
    this.userPath = [];
    this.isTracing = false;
    this.tracingGraphics = null;
    this.guideGraphics = null;
    this.correctAttempts = 0;
    this.totalAttempts = 0;
  }

  preload() {
    super.preload();

    // Load Kannada alphabet data
    this.load.json('alphabet', 'src/data/kannada/alphabet.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Load data
    this.alphabetData = this.cache.json.get('alphabet');

    // Initialize audio manager
    this.audioManager = new AudioManager(this);
    this.registerPronunciations();

    // Create background
    this.createGameBackground();

    // Create UI
    this.createStandardUI();

    // Create tracing area
    this.createTracingArea();

    // Select letter pool (vowels for beginner)
    this.selectLetterPool();

    // Show instructions
    this.showInstructions([
      'Trace the Kannada letter',
      'Follow the guide carefully',
      'Complete the shape to proceed'
    ]);
  }

  /**
   * Register letter pronunciations
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

    // Light background
    const bg = this.add.rectangle(0, 0, width, height, 0xF5F5F5)
      .setOrigin(0, 0);
  }

  /**
   * Create tracing area
   */
  createTracingArea() {
    const { width, height } = this.cameras.main;

    // Tracing canvas background
    const tracingBg = this.add.rectangle(
      width / 2, height / 2 + 50,
      500, 400,
      0xFFFFFF
    );
    tracingBg.setStrokeStyle(4, 0x2196F3);

    // Graphics for drawing
    this.tracingGraphics = this.add.graphics();
    this.guideGraphics = this.add.graphics();

    // Letter display area
    this.letterDisplay = this.add.container(width / 2, 180);

    // Instruction text
    this.instructionText = this.add.text(width / 2, height - 100, '', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#666666',
      align: 'center'
    }).setOrigin(0.5);

    // Clear button
    this.createClearButton();

    // Next button (initially hidden)
    this.createNextButton();
  }

  /**
   * Create clear button
   */
  createClearButton() {
    const { width, height } = this.cameras.main;

    const clearBtn = this.add.text(width / 2 - 100, height / 2 + 280, '🔄 Clear', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#FF9800',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    clearBtn.setInteractive({ useHandCursor: true });
    clearBtn.on('pointerdown', () => this.clearTracing());

    this.clearButton = clearBtn;
  }

  /**
   * Create next button
   */
  createNextButton() {
    const { width, height } = this.cameras.main;

    const nextBtn = this.add.text(width / 2 + 100, height / 2 + 280, '➡️ Next', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#4CAF50',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    nextBtn.setInteractive({ useHandCursor: true });
    nextBtn.on('pointerdown', () => this.nextLetter());
    nextBtn.setVisible(false);

    this.nextButton = nextBtn;
  }

  /**
   * Select letter pool
   */
  selectLetterPool() {
    // Start with vowels for beginner difficulty
    this.letterPool = [...this.alphabetData.vowels];

    if (this.difficulty === 'intermediate') {
      this.letterPool.push(...this.alphabetData.consonants.slice(0, 5));
    } else if (this.difficulty === 'advanced') {
      this.letterPool.push(...this.alphabetData.consonants);
    }
  }

  /**
   * Start the game
   */
  onGameStart() {
    // Load first letter
    this.loadNextLetter();

    // Setup input
    this.setupTracingInput();
  }

  /**
   * Load next letter to trace
   */
  loadNextLetter() {
    if (this.letterPool.length === 0) {
      // All letters completed!
      this.endGame(true, 'All letters completed!');
      return;
    }

    // Get random letter from pool
    const index = Phaser.Math.Between(0, this.letterPool.length - 1);
    this.currentLetter = this.letterPool[index];

    // Remove from pool for this session
    this.letterPool.splice(index, 1);

    // Display letter
    this.displayLetter();

    // Clear previous tracing
    this.clearTracing();

    // Hide next button
    this.nextButton.setVisible(false);

    // Update instruction
    this.instructionText.setText('Trace the letter shown above');

    // Play pronunciation
    this.time.delayedCall(500, () => {
      this.audioManager.playLetter(this.currentLetter.letter);
    });
  }

  /**
   * Display current letter
   */
  displayLetter() {
    // Clear previous letter
    this.letterDisplay.removeAll(true);

    // Create letter sprite (non-interactive)
    const letterSprite = new LetterSprite(
      this,
      0, 0,
      this.currentLetter,
      {
        size: 120,
        showAudioButton: true,
        interactive: false
      }
    );

    this.letterDisplay.add(letterSprite);

    // Draw guide (simplified - in production, use actual letter paths)
    this.drawLetterGuide();
  }

  /**
   * Draw letter tracing guide
   */
  drawLetterGuide() {
    const { width, height } = this.cameras.main;

    this.guideGraphics.clear();

    // Draw large letter as guide
    const guideText = this.add.text(
      width / 2, height / 2 + 50,
      this.currentLetter.letter,
      {
        fontSize: '200px',
        fontFamily: 'Nudi, Arial',
        color: '#E0E0E0',
        stroke: '#BDBDBD',
        strokeThickness: 2
      }
    ).setOrigin(0.5);

    this.currentGuideText = guideText;
  }

  /**
   * Setup tracing input
   */
  setupTracingInput() {
    const { width, height } = this.cameras.main;

    // Define tracing area bounds
    const bounds = {
      x: width / 2 - 250,
      y: height / 2 + 50 - 200,
      width: 500,
      height: 400
    };

    // Pointer down - start tracing
    this.input.on('pointerdown', (pointer) => {
      if (this.isPointInBounds(pointer, bounds) && !this.nextButton.visible) {
        this.isTracing = true;
        this.userPath = [];
        this.userPath.push({ x: pointer.x, y: pointer.y });
      }
    });

    // Pointer move - continue tracing
    this.input.on('pointermove', (pointer) => {
      if (this.isTracing && this.isPointInBounds(pointer, bounds)) {
        this.userPath.push({ x: pointer.x, y: pointer.y });
        this.drawUserPath();
      }
    });

    // Pointer up - end tracing
    this.input.on('pointerup', () => {
      if (this.isTracing) {
        this.isTracing = false;
        this.evaluateTracing();
      }
    });
  }

  /**
   * Check if point is in bounds
   */
  isPointInBounds(pointer, bounds) {
    return pointer.x >= bounds.x &&
           pointer.x <= bounds.x + bounds.width &&
           pointer.y >= bounds.y &&
           pointer.y <= bounds.y + bounds.height;
  }

  /**
   * Draw user's tracing path
   */
  drawUserPath() {
    this.tracingGraphics.clear();

    if (this.userPath.length < 2) return;

    this.tracingGraphics.lineStyle(8, 0x2196F3, 1);
    this.tracingGraphics.beginPath();

    this.tracingGraphics.moveTo(this.userPath[0].x, this.userPath[0].y);

    for (let i = 1; i < this.userPath.length; i++) {
      this.tracingGraphics.lineTo(this.userPath[i].x, this.userPath[i].y);
    }

    this.tracingGraphics.strokePath();
  }

  /**
   * Evaluate tracing accuracy
   */
  evaluateTracing() {
    this.totalAttempts++;

    // Simplified evaluation - in production, compare with actual letter paths
    // For now, check if user drew enough (simulated)
    const isGoodAttempt = this.userPath.length > 20;

    if (isGoodAttempt) {
      this.correctAttempts++;
      this.onCorrectTracing();
    } else {
      this.onIncorrectTracing();
    }
  }

  /**
   * Handle correct tracing
   */
  onCorrectTracing() {
    // Add score
    this.addScore(50);

    // Play feedback
    this.playCorrectFeedback();

    // Change traced line to green
    this.tracingGraphics.clear();
    this.tracingGraphics.lineStyle(8, 0x4CAF50, 1);
    this.tracingGraphics.beginPath();
    this.tracingGraphics.moveTo(this.userPath[0].x, this.userPath[0].y);
    for (let i = 1; i < this.userPath.length; i++) {
      this.tracingGraphics.lineTo(this.userPath[i].x, this.userPath[i].y);
    }
    this.tracingGraphics.strokePath();

    // Show success message
    this.instructionText.setText('Great job! ✨');

    // Show next button
    this.nextButton.setVisible(true);

    // Play letter pronunciation
    this.audioManager.playLetter(this.currentLetter.letter);
  }

  /**
   * Handle incorrect tracing
   */
  onIncorrectTracing() {
    // Play feedback
    this.playIncorrectFeedback();

    // Change traced line to red
    this.tracingGraphics.clear();
    this.tracingGraphics.lineStyle(8, 0xF44336, 1);
    this.tracingGraphics.beginPath();
    this.tracingGraphics.moveTo(this.userPath[0].x, this.userPath[0].y);
    for (let i = 1; i < this.userPath.length; i++) {
      this.tracingGraphics.lineTo(this.userPath[i].x, this.userPath[i].y);
    }
    this.tracingGraphics.strokePath();

    // Show hint
    this.instructionText.setText('Try again - trace more carefully');

    // Fade out incorrect path after 1 second
    this.time.delayedCall(1000, () => {
      this.clearTracing();
    });
  }

  /**
   * Clear tracing
   */
  clearTracing() {
    this.tracingGraphics.clear();
    this.userPath = [];
    this.isTracing = false;
    this.instructionText.setText('Trace the letter shown above');
  }

  /**
   * Next letter
   */
  nextLetter() {
    this.loadNextLetter();
  }

  /**
   * Calculate stats
   */
  calculateStats() {
    const accuracy = this.totalAttempts > 0
      ? this.correctAttempts / this.totalAttempts
      : 0;

    return {
      score: this.score,
      difficulty: this.difficulty,
      totalAttempts: this.totalAttempts,
      correctAttempts: this.correctAttempts,
      accuracy
    };
  }

  /**
   * Cleanup
   */
  shutdown() {
    // Remove input listeners
    this.input.off('pointerdown');
    this.input.off('pointermove');
    this.input.off('pointerup');

    super.shutdown();
  }
}
