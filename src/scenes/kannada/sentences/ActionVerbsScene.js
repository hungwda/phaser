import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * ActionVerbsScene - Simon-says style verb learning game
 */
export class ActionVerbsScene extends BaseGameScene {
  constructor() {
    super('ActionVerbsScene', {
      lives: 3,
      timeLimit: 150
    });

    this.verbs = [];
    this.currentVerb = null;
    this.actionButtons = [];
    this.showingAction = false;
    this.verbsCompleted = 0;
    this.correctAction = null;
  }

  preload() {
    super.preload();
    this.load.json('verbs', 'src/data/kannada/verbs.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.verbsData = this.cache.json.get('verbs');
    this.audioManager = new AudioManager(this);

    // Background
    this.createBackground();

    this.createStandardUI();
    this.updateProgressText();

    // Select verb pool
    this.selectVerbPool();

    this.showInstructions(['Watch the action!', 'Then click the correct verb']);
  }

  createBackground() {
    const { width, height } = this.cameras.main;

    // Orange gradient background
    this.add.rectangle(0, 0, width, height, 0xFF9800).setOrigin(0, 0);

    // Stage area
    const stageY = height / 2;
    this.add.rectangle(width / 2, stageY, 400, 300, 0xFFE0B2, 0.6).setOrigin(0.5);

    // Stage curtains
    this.add.rectangle(width / 2 - 200, stageY - 150, 20, 300, 0x8B4513);
    this.add.rectangle(width / 2 + 200, stageY - 150, 20, 300, 0x8B4513);

    // Spotlight effect
    const spotlight = this.add.circle(width / 2, stageY, 150, 0xFFFFFF, 0.2);
  }

  selectVerbPool() {
    const allVerbs = this.verbsData.items;
    if (this.difficulty === 'beginner') {
      this.verbs = allVerbs.filter(v => v.difficulty === 'beginner');
    } else if (this.difficulty === 'intermediate') {
      this.verbs = allVerbs.filter(v => v.difficulty === 'beginner' || v.difficulty === 'intermediate');
    } else {
      this.verbs = allVerbs;
    }

    Phaser.Utils.Array.Shuffle(this.verbs);
  }

  onGameStart() {
    this.loadNextVerb();
  }

  loadNextVerb() {
    if (this.verbs.length === 0) {
      this.endGame(true, `Learned ${this.verbsCompleted} verbs!`);
      return;
    }

    // Clear previous
    this.clearCurrentVerb();

    this.currentVerb = this.verbs.shift();
    this.correctAction = this.currentVerb.action;

    // Show the action animation
    this.showAction();
  }

  clearCurrentVerb() {
    if (this.actionDisplay) this.actionDisplay.destroy();
    if (this.verbText) this.verbText.destroy();
    if (this.instructionText) this.instructionText.destroy();

    this.actionButtons.forEach(btn => btn.destroy());
    this.actionButtons = [];
  }

  showAction() {
    const { width, height } = this.cameras.main;

    this.showingAction = true;

    // Instruction
    this.instructionText = this.add.text(width / 2, 180, 'Watch the action!', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#000000',
      backgroundColor: '#FFD700',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    // Display action emoji/animation
    const actionEmoji = this.getActionEmoji(this.currentVerb.action);
    this.actionDisplay = this.add.text(width / 2, height / 2, actionEmoji, {
      fontSize: '128px'
    }).setOrigin(0.5);

    // Animate the action
    this.animateAction(this.actionDisplay, this.currentVerb.action);

    // Show Kannada verb text
    this.verbText = this.add.text(width / 2, height / 2 + 100, this.currentVerb.verb, {
      fontSize: '48px',
      fontFamily: 'Nudi, Arial',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    // After animation, show options
    this.time.delayedCall(3000, () => {
      this.showOptions();
    });
  }

  getActionEmoji(action) {
    const emojiMap = {
      'run_in_place': '🏃',
      'jump': '🤸',
      'clap_hands': '👏',
      'sit_down': '🪑',
      'stand_up': '🧍',
      'dance': '💃',
      'wave_hand': '👋',
      'touch_nose': '👃',
      'spin_around': '🔄',
      'raise_hand': '🙋'
    };

    return emojiMap[action] || '🎭';
  }

  animateAction(display, action) {
    // Different animations based on action
    if (action === 'jump') {
      this.tweens.add({
        targets: display,
        y: display.y - 50,
        duration: 400,
        yoyo: true,
        repeat: 3,
        ease: 'Quad.easeInOut'
      });
    } else if (action === 'run_in_place') {
      this.tweens.add({
        targets: display,
        x: display.x + 10,
        duration: 150,
        yoyo: true,
        repeat: 10
      });
    } else if (action === 'spin_around') {
      this.tweens.add({
        targets: display,
        angle: 360,
        duration: 2000,
        ease: 'Linear'
      });
    } else if (action === 'wave_hand') {
      this.tweens.add({
        targets: display,
        angle: 20,
        duration: 300,
        yoyo: true,
        repeat: 4
      });
    } else {
      // Default bounce
      this.tweens.add({
        targets: display,
        scale: 1.2,
        duration: 500,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut'
      });
    }
  }

  showOptions() {
    const { width, height } = this.cameras.main;

    this.showingAction = false;

    // Update instruction
    this.instructionText.setText('What action did you see?');

    // Hide action display and verb text
    if (this.actionDisplay) {
      this.tweens.add({
        targets: [this.actionDisplay, this.verbText],
        alpha: 0,
        duration: 500
      });
    }

    // Get 4 random verbs including the correct one
    const options = [this.currentVerb];
    const otherVerbs = this.verbsData.items.filter(v => v.id !== this.currentVerb.id);
    Phaser.Utils.Array.Shuffle(otherVerbs);

    while (options.length < 4 && otherVerbs.length > 0) {
      options.push(otherVerbs.shift());
    }

    Phaser.Utils.Array.Shuffle(options);

    // Create option buttons
    const buttonWidth = 200;
    const buttonHeight = 80;
    const spacing = 20;
    const cols = 2;
    const rows = 2;

    options.forEach((verb, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = width / 2 - (cols * (buttonWidth + spacing)) / 2 + col * (buttonWidth + spacing) + buttonWidth / 2;
      const y = height - 250 + row * (buttonHeight + spacing);

      const button = this.createActionButton(x, y, buttonWidth, buttonHeight, verb);
      this.actionButtons.push(button);
    });
  }

  createActionButton(x, y, width, height, verb) {
    const container = this.add.container(x, y);
    container.verb = verb;

    // Background
    const bg = this.add.rectangle(0, 0, width, height, 0x2196F3);
    bg.setStrokeStyle(3, 0xFFFFFF);
    container.bg = bg;

    // English text
    const englishText = this.add.text(0, -15, verb.english, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Kannada text
    const kannadaText = this.add.text(0, 15, verb.verb, {
      fontSize: '18px',
      fontFamily: 'Nudi, Arial',
      color: '#FFD700'
    }).setOrigin(0.5);

    container.add([bg, englishText, kannadaText]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.setFillStyle(0x1976D2);
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 100
      });
    });

    container.on('pointerout', () => {
      bg.setFillStyle(0x2196F3);
      this.tweens.add({
        targets: container,
        scale: 1.0,
        duration: 100
      });
    });

    container.on('pointerdown', () => {
      this.checkAnswer(verb);
    });

    return container;
  }

  checkAnswer(selectedVerb) {
    const correct = selectedVerb.id === this.currentVerb.id;

    if (correct) {
      this.onCorrectAnswer();
    } else {
      this.onIncorrectAnswer();
    }
  }

  onCorrectAnswer() {
    this.audioManager.playCorrect();
    this.addScore(100);
    this.verbsCompleted++;
    this.updateProgressText();

    this.showFeedback('✅ Correct!', '#4CAF50');

    // Highlight correct button
    const correctButton = this.actionButtons.find(btn => btn.verb.id === this.currentVerb.id);
    if (correctButton) {
      correctButton.bg.setFillStyle(0x4CAF50);
      this.tweens.add({
        targets: correctButton,
        scale: 1.2,
        duration: 200,
        yoyo: true,
        repeat: 2
      });
    }

    this.time.delayedCall(1500, () => {
      this.loadNextVerb();
    });
  }

  onIncorrectAnswer() {
    this.audioManager.playWrong();
    this.loseLife();

    this.showFeedback('❌ Try again!', '#F44336');

    // Shake all buttons
    this.actionButtons.forEach(btn => {
      this.tweens.add({
        targets: btn,
        x: btn.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          btn.x = this.cameras.main.width / 2 - 220 + (this.actionButtons.indexOf(btn) % 2) * 220;
        }
      });
    });
  }

  updateProgressText() {
    if (this.progressText) {
      this.progressText.setText(`Verbs: ${this.verbsCompleted}`);
    } else {
      this.progressText = this.add.text(20, 140, `Verbs: ${this.verbsCompleted}`, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#000000',
        backgroundColor: '#FFFFFF',
        padding: { x: 10, y: 5 }
      });
    }
  }
}
