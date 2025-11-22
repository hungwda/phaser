import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * MissingLetterScene - Fill in the missing letter to complete the word
 */
export class MissingLetterScene extends BaseGameScene {
  constructor() {
    super('MissingLetterScene', {
      lives: 5,
      timeLimit: 120
    });

    this.currentWord = null;
    this.missingIndex = -1;
    this.optionButtons = [];
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

    this.presentNewWord();
    this.showInstructions('Find the missing letter to complete the word!');
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;
    const bg = this.add.rectangle(0, 0, width, height, 0xE8F5E9).setOrigin(0, 0);

    // Decorative elements
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(20, 40);

      const shape = this.add.circle(x, y, size, 0x4CAF50, 0.1);
    }
  }

  presentNewWord() {
    if (!this.wordsData || !this.wordsData.basic) return;

    // Clear previous word display
    if (this.wordContainer) this.wordContainer.destroy();
    this.optionButtons.forEach(btn => btn.destroy());
    this.optionButtons = [];

    const difficulty = this.difficulty || 'beginner';
    const filtered = this.wordsData.basic.filter(w =>
      w.difficulty === difficulty || w.difficulty === 'beginner'
    );

    this.currentWord = Phaser.Utils.Array.GetRandom(filtered);
    const letters = this.currentWord.kannada.split('');

    // Choose random letter to hide
    this.missingIndex = Phaser.Math.Between(0, letters.length - 1);
    const missingLetter = letters[this.missingIndex];

    this.displayWordWithBlank(letters);
    this.createLetterOptions(missingLetter, letters);

    // Show image hint if available
    if (this.currentWord.imagePath) {
      this.showImageHint();
    }
  }

  displayWordWithBlank(letters) {
    const { width, height } = this.cameras.main;

    this.wordContainer = this.add.container(width / 2, height / 2 - 50);

    const boxWidth = 60;
    const spacing = 10;
    const totalWidth = (boxWidth + spacing) * letters.length - spacing;
    const startX = -totalWidth / 2;

    letters.forEach((letter, index) => {
      const x = startX + (boxWidth + spacing) * index;

      // Letter box
      const box = this.add.rectangle(x + boxWidth/2, 0, boxWidth, 70, 0xFFFFFF);
      box.setStrokeStyle(3, 0x4CAF50);

      this.wordContainer.add(box);

      if (index === this.missingIndex) {
        // Blank space
        const blank = this.add.text(x + boxWidth/2, 0, '?', {
          fontSize: '48px',
          fontFamily: 'Arial',
          color: '#9E9E9E'
        }).setOrigin(0.5);
        this.wordContainer.add(blank);
      } else {
        // Show letter
        const letterText = this.add.text(x + boxWidth/2, 0, letter, {
          fontSize: '48px',
          fontFamily: 'Nudi, Arial',
          color: '#000000'
        }).setOrigin(0.5);
        this.wordContainer.add(letterText);
      }
    });

    // English translation hint
    const hint = this.add.text(0, 80, `(${this.currentWord.english})`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#666666',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    this.wordContainer.add(hint);
  }

  createLetterOptions(correctLetter, wordLetters) {
    const { width, height } = this.cameras.main;

    // Generate options: correct letter + 3 distractors
    const allLetters = ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಕ', 'ಗ', 'ತ', 'ನ', 'ಮ', 'ರ', 'ಲ', 'ವ', 'ಸ', 'ಹ'];
    const distractors = allLetters.filter(l =>
      l !== correctLetter && !wordLetters.includes(l)
    );

    const options = [
      correctLetter,
      ...Phaser.Utils.Array.Shuffle(distractors).slice(0, 3)
    ];

    Phaser.Utils.Array.Shuffle(options);

    const buttonWidth = 80;
    const spacing = 20;
    const totalWidth = (buttonWidth + spacing) * 4 - spacing;
    const startX = (width - totalWidth) / 2;
    const y = height / 2 + 100;

    options.forEach((letter, index) => {
      const x = startX + (buttonWidth + spacing) * index + buttonWidth / 2;

      const button = this.createOptionButton(x, y, letter, correctLetter);
      this.optionButtons.push(button);
    });
  }

  createOptionButton(x, y, letter, correctLetter) {
    const container = this.add.container(x, y);

    const bg = this.add.circle(0, 0, 40, 0x2196F3);
    bg.setStrokeStyle(3, 0xFFFFFF);

    const text = this.add.text(0, 0, letter, {
      fontSize: '40px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(80, 80);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      this.checkAnswer(letter, correctLetter, container);
    });

    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scale: 1.1,
        duration: 100
      });
    });

    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scale: 1.0,
        duration: 100
      });
    });

    return container;
  }

  checkAnswer(selectedLetter, correctLetter, button) {
    // Disable all buttons
    this.optionButtons.forEach(btn => btn.disableInteractive());

    if (selectedLetter === correctLetter) {
      this.onCorrect(button);
    } else {
      this.onIncorrect(button);
    }
  }

  onCorrect(button) {
    this.playCorrectFeedback();
    this.addScore(20);

    // Highlight correct answer
    button.list[0].setFillStyle(0x4CAF50);

    this.showFeedback('Correct! ಸರಿ!', 0x4CAF50);

    this.time.delayedCall(1500, () => {
      this.presentNewWord();
    });
  }

  onIncorrect(button) {
    this.playIncorrectFeedback();
    this.loseLife();

    // Shake wrong answer
    this.tweens.add({
      targets: button,
      x: button.x + 10,
      duration: 50,
      yoyo: true,
      repeat: 3
    });

    button.list[0].setFillStyle(0xF44336);

    this.showFeedback('Try again!', 0xF44336);

    this.time.delayedCall(1000, () => {
      if (this.lives > 0) {
        this.presentNewWord();
      }
    });
  }

  showFeedback(text, color) {
    const { width, height } = this.cameras.main;

    const feedback = this.add.text(width / 2, height - 100, text, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: Phaser.Display.Color.IntegerToColor(color).rgba,
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: feedback,
      alpha: 1,
      duration: 200,
      onComplete: () => {
        this.tweens.add({
          targets: feedback,
          alpha: 0,
          duration: 200,
          delay: 800,
          onComplete: () => feedback.destroy()
        });
      }
    });
  }

  showImageHint() {
    // Placeholder for image hint
    const { width } = this.cameras.main;
    const hintText = this.add.text(width / 2, 150, '🖼️', {
      fontSize: '64px'
    }).setOrigin(0.5);
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
