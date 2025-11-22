import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * EchoGameScene - Listen and repeat pronunciation practice
 */
export class EchoGameScene extends BaseGameScene {
  constructor() {
    super('EchoGameScene', {
      lives: 5,
      timeLimit: 120
    });

    this.currentWord = null;
    this.listeningMode = true;
  }

  preload() {
    super.preload();
    this.load.json('words', 'src/data/kannada/words.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.wordsData = this.cache.json.get('words');
    this.audioManager = new AudioManager(this);

    this.createGameBackground();
    this.createStandardUI();
    this.createEchoArea();

    this.presentWord();
    this.showInstructions('Listen to the word and select the correct one!');
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;

    const bg = this.add.rectangle(0, 0, width, height, 0xE8EAF6).setOrigin(0, 0);

    // Sound wave decoration
    for (let i = 0; i < 5; i++) {
      const wave = this.add.ellipse(
        width / 2,
        height / 2,
        100 + (i * 80),
        50 + (i * 40),
        0x3F51B5,
        0.1
      );

      this.tweens.add({
        targets: wave,
        scaleX: 1.2,
        scaleY: 1.2,
        alpha: 0,
        duration: 2000,
        repeat: -1,
        delay: i * 400
      });
    }
  }

  createEchoArea() {
    const { width, height } = this.cameras.main;

    // Speaker icon (play sound button)
    this.speakerBtn = this.add.text(width / 2, height / 2 - 100, '🔊', {
      fontSize: '120px'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.speakerBtn.on('pointerdown', () => {
      this.playCurrentWord();
    });

    // Pulsing animation
    this.tweens.add({
      targets: this.speakerBtn,
      scale: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const instruction = this.add.text(width / 2, height / 2, 'Tap to hear the word', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#666666'
    }).setOrigin(0.5);
  }

  presentWord() {
    const { width, height } = this.cameras.main;

    if (!this.wordsData || !this.wordsData.basic) return;

    // Clear previous options
    if (this.optionsContainer) this.optionsContainer.destroy();

    const filtered = this.wordsData.basic.filter(w => w.kannada && w.english);
    this.currentWord = Phaser.Utils.Array.GetRandom(filtered);

    // Auto-play the word once
    this.time.delayedCall(500, () => {
      this.playCurrentWord();
    });

    // Show options after a delay
    this.time.delayedCall(2000, () => {
      this.showOptions();
    });
  }

  playCurrentWord() {
    this.audioManager.playClick();

    // Simulate playing word pronunciation
    // In real implementation, would play actual audio file

    // Visual feedback
    this.tweens.add({
      targets: this.speakerBtn,
      scale: 1.3,
      duration: 200,
      yoyo: true
    });

    // Show the word briefly in Kannada for learning
    this.showWordBriefly();
  }

  showWordBriefly() {
    const { width, height } = this.cameras.main;

    const wordDisplay = this.add.text(width / 2, height / 2 - 200,
      this.currentWord.kannada, {
      fontSize: '48px',
      fontFamily: 'Nudi, Arial',
      color: '#3F51B5',
      alpha: 0
    }).setOrigin(0.5);

    this.tweens.add({
      targets: wordDisplay,
      alpha: 1,
      duration: 300,
      onComplete: () => {
        this.tweens.add({
          targets: wordDisplay,
          alpha: 0,
          duration: 300,
          delay: 1000,
          onComplete: () => wordDisplay.destroy()
        });
      }
    });
  }

  showOptions() {
    const { width, height } = this.cameras.main;

    this.optionsContainer = this.add.container(width / 2, height / 2 + 150);

    // Generate options: correct word + 3 distractors
    const allWords = this.wordsData.basic.filter(w => w.kannada && w.english);
    const distractors = allWords.filter(w => w.kannada !== this.currentWord.kannada);

    const options = [
      this.currentWord,
      ...Phaser.Utils.Array.Shuffle(distractors).slice(0, 3)
    ];

    Phaser.Utils.Array.Shuffle(options);

    const startX = -300;
    const spacing = 200;

    options.forEach((word, index) => {
      const x = startX + (index * spacing);

      const btn = this.createOptionButton(x, 0, word);
      this.optionsContainer.add(btn);
    });
  }

  createOptionButton(x, y, wordData) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 180, 100, 0x5C6BC0);
    bg.setStrokeStyle(3, 0xFFFFFF);

    const kannadaText = this.add.text(0, -15, wordData.kannada, {
      fontSize: '32px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    const englishText = this.add.text(0, 20, wordData.english, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#E8EAF6'
    }).setOrigin(0.5);

    container.add([bg, kannadaText, englishText]);
    container.setSize(180, 100);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      this.checkAnswer(wordData, container);
    });

    container.on('pointerover', () => {
      bg.setFillStyle(0x3F51B5);
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 100
      });
    });

    container.on('pointerout', () => {
      bg.setFillStyle(0x5C6BC0);
      this.tweens.add({
        targets: container,
        scale: 1.0,
        duration: 100
      });
    });

    return container;
  }

  checkAnswer(selectedWord, button) {
    // Disable all buttons
    if (this.optionsContainer) {
      this.optionsContainer.iterate((child) => {
        if (child.disableInteractive) child.disableInteractive();
      });
    }

    if (selectedWord.kannada === this.currentWord.kannada) {
      this.onCorrect(button);
    } else {
      this.onIncorrect(button);
    }
  }

  onCorrect(button) {
    this.playCorrectFeedback();
    this.addScore(25);

    button.list[0].setFillStyle(0x4CAF50);

    const { width, height } = this.cameras.main;
    const feedback = this.add.text(width / 2, height - 80, '✓ Correct!', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#4CAF50',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      feedback.destroy();
      this.presentWord();
    });
  }

  onIncorrect(button) {
    this.playIncorrectFeedback();
    this.loseLife();

    button.list[0].setFillStyle(0xF44336);

    this.tweens.add({
      targets: button,
      x: button.x + 10,
      duration: 50,
      yoyo: true,
      repeat: 3
    });

    const { width, height } = this.cameras.main;
    const feedback = this.add.text(width / 2, height - 80, '✗ Try again!', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#F44336',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      feedback.destroy();
      if (this.lives > 0) {
        this.presentWord();
      }
    });
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
