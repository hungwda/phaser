import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * WhichWordScene - Listen and identify the correct word from similar sounding options
 */
export class WhichWordScene extends BaseGameScene {
  constructor() {
    super('WhichWordScene', {
      lives: 5,
      timeLimit: 120
    });

    this.currentWord = null;
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
    this.createListeningArea();

    this.presentChallenge();
    this.showInstructions('Listen carefully and choose the correct word!');
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;

    const bg = this.add.rectangle(0, 0, width, height, 0xFCE4EC).setOrigin(0, 0);

    // Sound wave decorations
    for (let i = 0; i < 6; i++) {
      const wave = this.add.graphics();
      wave.lineStyle(3, 0xE91E63, 0.3);

      const y = 100 + (i * 80);
      wave.beginPath();

      for (let x = 0; x < width; x += 20) {
        const yOffset = Math.sin((x / width) * Math.PI * 2 + i) * 20;
        if (x === 0) {
          wave.moveTo(x, y + yOffset);
        } else {
          wave.lineTo(x, y + yOffset);
        }
      }

      wave.strokePath();
    }
  }

  createListeningArea() {
    const { width, height } = this.cameras.main;

    // Large speaker icon
    this.speakerIcon = this.add.text(width / 2, height / 2 - 100, '🎧', {
      fontSize: '120px'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.speakerIcon.on('pointerdown', () => {
      this.playWord();
    });

    // Pulsing effect
    this.tweens.add({
      targets: this.speakerIcon,
      scale: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const instruction = this.add.text(width / 2, height / 2,
      'Tap to listen', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#E91E63'
    }).setOrigin(0.5);
  }

  presentChallenge() {
    const { width, height } = this.cameras.main;

    if (!this.wordsData || !this.wordsData.basic) return;

    // Clear previous
    if (this.wordOptions) this.wordOptions.destroy();

    const allWords = this.wordsData.basic.filter(w => w.kannada && w.english);
    this.currentWord = Phaser.Utils.Array.GetRandom(allWords);

    // Play word automatically
    this.time.delayedCall(500, () => {
      this.playWord();
    });

    // Show word options
    this.time.delayedCall(2000, () => {
      this.showWordOptions();
    });
  }

  playWord() {
    this.audioManager.playClick();

    // Visual feedback
    this.tweens.add({
      targets: this.speakerIcon,
      scale: 1.3,
      duration: 150,
      yoyo: true,
      repeat: 2
    });

    // Show word briefly for learning
    this.flashWord();
  }

  flashWord() {
    const { width, height } = this.cameras.main;

    const wordFlash = this.add.container(width / 2, height / 2 - 200);

    const bg = this.add.rectangle(0, 0, 300, 80, 0xE91E63, 0.9);
    bg.setStrokeStyle(3, 0xFFFFFF);

    const wordText = this.add.text(0, 0, this.currentWord.kannada, {
      fontSize: '36px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    wordFlash.add([bg, wordText]);
    wordFlash.setAlpha(0);

    this.tweens.add({
      targets: wordFlash,
      alpha: 1,
      duration: 200,
      onComplete: () => {
        this.tweens.add({
          targets: wordFlash,
          alpha: 0,
          duration: 200,
          delay: 1000,
          onComplete: () => wordFlash.destroy()
        });
      }
    });
  }

  showWordOptions() {
    const { width, height } = this.cameras.main;

    this.wordOptions = this.add.container(width / 2, height - 180);

    // Get similar words
    const allWords = this.wordsData.basic;
    const distractors = allWords.filter(w => w.kannada !== this.currentWord.kannada);

    const options = [
      this.currentWord,
      ...Phaser.Utils.Array.Shuffle(distractors).slice(0, 3)
    ];

    Phaser.Utils.Array.Shuffle(options);

    // Display as grid
    const cols = 2;
    const spacing = 300;
    const ySpacing = 90;

    options.forEach((word, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      const x = (col - 0.5) * spacing;
      const y = row * ySpacing;

      const card = this.createWordCard(x, y, word);
      this.wordOptions.add(card);
    });
  }

  createWordCard(x, y, wordData) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 250, 70, 0xFFFFFF);
    bg.setStrokeStyle(3, 0xE91E63);

    const kannadaText = this.add.text(0, -10, wordData.kannada, {
      fontSize: '28px',
      fontFamily: 'Nudi, Arial',
      color: '#000000'
    }).setOrigin(0.5);

    const englishText = this.add.text(0, 20, wordData.english, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#666666'
    }).setOrigin(0.5);

    container.add([bg, kannadaText, englishText]);
    container.setSize(250, 70);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      this.checkAnswer(wordData, container);
    });

    container.on('pointerover', () => {
      bg.setFillStyle(0xF8BBD0);
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 100
      });
    });

    container.on('pointerout', () => {
      bg.setFillStyle(0xFFFFFF);
      this.tweens.add({
        targets: container,
        scale: 1.0,
        duration: 100
      });
    });

    return container;
  }

  checkAnswer(selectedWord, card) {
    // Disable all options
    if (this.wordOptions) {
      this.wordOptions.iterate((child) => {
        if (child.disableInteractive) child.disableInteractive();
      });
    }

    if (selectedWord.kannada === this.currentWord.kannada) {
      this.onCorrect(card);
    } else {
      this.onIncorrect(card);
    }
  }

  onCorrect(card) {
    this.playCorrectFeedback();
    this.addScore(25);

    card.list[0].setFillStyle(0x4CAF50);

    const { width, height } = this.cameras.main;
    const feedback = this.add.text(width / 2, 250, '✓ Perfect!', {
      fontSize: '40px',
      fontFamily: 'Arial',
      color: '#4CAF50',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      feedback.destroy();
      this.presentChallenge();
    });
  }

  onIncorrect(card) {
    this.playIncorrectFeedback();
    this.loseLife();

    card.list[0].setFillStyle(0xF44336);

    this.tweens.add({
      targets: card,
      x: card.x + 10,
      duration: 50,
      yoyo: true,
      repeat: 3
    });

    this.time.delayedCall(1000, () => {
      if (this.lives > 0) {
        this.presentChallenge();
      }
    });
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
