import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * SpellPictureScene - See a picture and spell the word by clicking letters
 */
export class SpellPictureScene extends BaseGameScene {
  constructor() {
    super('SpellPictureScene', {
      lives: 3,
      timeLimit: 120
    });

    this.words = [];
    this.currentWord = null;
    this.letterButtons = [];
    this.selectedLetters = [];
    this.wordsCompleted = 0;
  }

  preload() {
    super.preload();
    this.load.json('words', 'src/data/kannada/words.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.wordsData = this.cache.json.get('words');
    this.audioManager = new AudioManager(this);
    this.registerPronunciations();

    // Background
    this.createBackground();

    this.createStandardUI();
    this.updateProgressText();

    // Select word pool
    this.selectWordPool();

    this.showInstructions(['Look at the picture and spell the word!', 'Click letters in order']);
  }

  registerPronunciations() {
    if (this.wordsData) {
      this.audioManager.registerPronunciationsFromData(this.wordsData.items);
    }
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    this.add.rectangle(0, 0, width, height, 0xE1F5FE).setOrigin(0, 0);
  }

  selectWordPool() {
    const allWords = this.wordsData.items;
    if (this.difficulty === 'beginner') {
      this.words = allWords.filter(w => w.difficulty === 'beginner');
    } else if (this.difficulty === 'intermediate') {
      this.words = allWords.filter(w => w.difficulty === 'beginner' || w.difficulty === 'intermediate');
    } else {
      this.words = allWords;
    }

    Phaser.Utils.Array.Shuffle(this.words);
  }

  onGameStart() {
    this.loadNextWord();
  }

  loadNextWord() {
    if (this.words.length === 0) {
      this.endGame(true, `Completed ${this.wordsCompleted} words!`);
      return;
    }

    this.clearCurrentWord();

    this.currentWord = this.words.shift();
    this.selectedLetters = [];

    this.createPictureDisplay();
    this.createAnswerArea();
    this.createLetterButtons();
  }

  clearCurrentWord() {
    this.letterButtons.forEach(btn => btn.destroy());
    this.letterButtons = [];

    if (this.pictureDisplay) this.pictureDisplay.destroy();
    if (this.hintText) this.hintText.destroy();
    if (this.answerContainer) this.answerContainer.destroy();
    if (this.hearButton) this.hearButton.destroy();
    if (this.hearIcon) this.hearIcon.destroy();
  }

  createPictureDisplay() {
    const { width } = this.cameras.main;

    // Picture frame
    const frame = this.add.rectangle(width / 2, 220, 250, 250, 0xFFFFFF);
    frame.setStrokeStyle(5, 0x795548);

    // Picture (emoji)
    const emoji = this.getWordEmoji(this.currentWord.id);
    this.pictureDisplay = this.add.text(width / 2, 220, emoji, {
      fontSize: '128px'
    }).setOrigin(0.5);

    // Hint text
    this.hintText = this.add.text(width / 2, 370, this.currentWord.hint, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#666666',
      backgroundColor: '#FFFFFF',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5);

    // Hear word button
    this.hearButton = this.add.circle(width / 2 + 140, 220, 30, 0x4CAF50);
    this.hearButton.setStrokeStyle(3, 0xFFFFFF);
    this.hearButton.setInteractive({ useHandCursor: true });
    this.hearButton.on('pointerdown', () => {
      this.audioManager.playWord(this.currentWord.kannada);
      this.tweens.add({
        targets: this.hearButton,
        scale: 1.2,
        duration: 100,
        yoyo: true
      });
    });

    this.hearIcon = this.add.text(width / 2 + 140, 220, '🔊', {
      fontSize: '32px'
    }).setOrigin(0.5);
  }

  getWordEmoji(id) {
    const emojis = {
      word_amma: '👩',
      word_appa: '👨',
      word_mara: '🌳',
      word_neer: '💧',
      word_huli: '🐅',
      word_hoo: '🌸',
      word_mane: '🏠',
      word_ball: '⚽',
      word_pustaka: '📚',
      word_school: '🏫'
    };
    return emojis[id] || '❓';
  }

  createAnswerArea() {
    const { width, height } = this.cameras.main;

    this.answerContainer = this.add.container(width / 2, 450);

    const bg = this.add.rectangle(0, 0, 600, 80, 0xFFFFFF, 0.9);
    bg.setStrokeStyle(4, 0x2196F3);

    const label = this.add.text(-280, 0, 'Your Answer:', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#333333'
    }).setOrigin(0, 0.5);

    this.answerText = this.add.text(0, 0, '', {
      fontSize: '42px',
      fontFamily: 'Nudi, Arial',
      color: '#1976D2'
    }).setOrigin(0.5);

    this.answerContainer.add([bg, label, this.answerText]);
  }

  createLetterButtons() {
    const { width, height } = this.cameras.main;

    // Get unique letters from the word and add some distractors
    const wordLetters = [...this.currentWord.letters];
    const allLetters = this.getAllPossibleLetters();

    // Add some random distractor letters
    const distractorCount = Math.min(3, 8 - wordLetters.length);
    const distractors = [];

    for (let i = 0; i < distractorCount; i++) {
      const randomLetter = Phaser.Utils.Array.GetRandom(allLetters);
      if (!wordLetters.includes(randomLetter)) {
        distractors.push(randomLetter);
      }
    }

    const letters = [...wordLetters, ...distractors];
    Phaser.Utils.Array.Shuffle(letters);

    const buttonWidth = 70;
    const spacing = 15;
    const totalWidth = letters.length * buttonWidth + (letters.length - 1) * spacing;
    const startX = (width - totalWidth) / 2 + buttonWidth / 2;
    const y = height - 120;

    letters.forEach((letter, i) => {
      const x = startX + i * (buttonWidth + spacing);
      const btn = this.createLetterButton(letter, x, y);
      this.letterButtons.push(btn);
    });
  }

  getAllPossibleLetters() {
    // Get some common Kannada letters for distractors
    return ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಕ', 'ಗ', 'ಚ', 'ಜ', 'ತ', 'ದ', 'ನ', 'ಪ', 'ಬ', 'ಮ', 'ಯ', 'ರ', 'ಲ', 'ವ', 'ಸ', 'ಹ'];
  }

  createLetterButton(letter, x, y) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 65, 80, 0x03A9F4, 1);
    bg.setStrokeStyle(3, 0xFFFFFF);

    const text = this.add.text(0, 0, letter, {
      fontSize: '42px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setData('letter', letter);
    container.setData('bg', bg);
    container.setData('used', false);

    container.setSize(65, 80);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => this.selectLetter(container));

    container.on('pointerover', () => {
      if (!container.getData('used')) {
        bg.setFillStyle(0x0288D1);
      }
    });

    container.on('pointerout', () => {
      if (!container.getData('used')) {
        bg.setFillStyle(0x03A9F4);
      }
    });

    return container;
  }

  selectLetter(button) {
    if (button.getData('used')) return;

    const letter = button.getData('letter');
    this.selectedLetters.push(letter);

    // Mark button as used
    button.setData('used', true);
    const bg = button.getData('bg');
    bg.setFillStyle(0x78909C);

    // Update answer display
    this.answerText.setText(this.selectedLetters.join(''));

    // Check if answer is complete
    if (this.selectedLetters.length >= this.currentWord.letters.length) {
      this.time.delayedCall(300, () => this.checkAnswer());
    }
  }

  checkAnswer() {
    const answer = this.selectedLetters.join('');
    const correct = this.currentWord.word;

    if (answer === correct) {
      this.handleCorrect();
    } else {
      this.handleIncorrect();
    }
  }

  handleCorrect() {
    this.wordsCompleted++;
    this.addScore(50);
    this.playCorrectFeedback();

    // Play word audio
    this.audioManager.playWord(this.currentWord.kannada);

    // Success animation
    this.tweens.add({
      targets: this.answerText,
      scale: 1.3,
      color: '#4CAF50',
      duration: 300,
      yoyo: true
    });

    // Show english meaning
    const meaningText = this.add.text(this.cameras.main.width / 2, 500, `✓ ${this.currentWord.english}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#4CAF50',
      backgroundColor: '#FFFFFF',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: meaningText,
      alpha: 1,
      duration: 300
    });

    this.updateProgressText();

    // Load next word
    this.time.delayedCall(2500, () => {
      meaningText.destroy();
      this.loadNextWord();
    });
  }

  handleIncorrect() {
    this.playIncorrectFeedback();
    this.loseLife();

    // Error animation
    this.tweens.add({
      targets: this.answerText,
      x: this.answerText.x + 5,
      duration: 50,
      yoyo: true,
      repeat: 5
    });

    // Reset after delay
    this.time.delayedCall(1000, () => {
      this.selectedLetters = [];
      this.answerText.setText('');

      // Reset all buttons
      this.letterButtons.forEach(btn => {
        btn.setData('used', false);
        const bg = btn.getData('bg');
        bg.setFillStyle(0x03A9F4);
      });
    });
  }

  updateProgressText() {
    this.scoreText.setText(`Words: ${this.wordsCompleted}`);
  }

  shutdown() {
    this.clearCurrentWord();
    super.shutdown();
  }
}
