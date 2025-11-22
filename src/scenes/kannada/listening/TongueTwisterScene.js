import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * TongueTwisterScene - Practice difficult Kannada tongue twisters
 */
export class TongueTwisterScene extends BaseGameScene {
  constructor() {
    super('TongueTwisterScene', {
      lives: 3,
      timeLimit: 150
    });

    this.currentTwister = null;
    this.attempts = 0;
  }

  preload() {
    super.preload();
    this.load.json('sentences', 'src/data/kannada/sentences.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.sentencesData = this.cache.json.get('sentences');
    this.audioManager = new AudioManager(this);

    this.createGameBackground();
    this.createStandardUI();
    this.createTwisterDisplay();

    this.presentTwister();
    this.showInstructions('Listen to the tongue twister and answer questions about it!');
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;

    // Playful gradient background
    const colors = [0xFF6B9D, 0xC06C84, 0x6C5B7B, 0x355C7D];

    colors.forEach((color, index) => {
      const y = (height / colors.length) * index;
      const rect = this.add.rectangle(0, y, width, height / colors.length, color);
      rect.setOrigin(0, 0);
      rect.setAlpha(0.8);
    });

    // Decorative twisted lines
    for (let i = 0; i < 5; i++) {
      const line = this.add.graphics();
      line.lineStyle(4, 0xFFFFFF, 0.3);
      line.beginPath();

      for (let x = 0; x < width; x += 10) {
        const y = height / 2 + Math.sin(x / 30 + i) * 50 + (i * 30);
        if (x === 0) {
          line.moveTo(x, y);
        } else {
          line.lineTo(x, y);
        }
      }

      line.strokePath();
    }
  }

  createTwisterDisplay() {
    const { width, height } = this.cameras.main;

    this.twisterContainer = this.add.container(width / 2, height / 2 - 50);

    const bg = this.add.rectangle(0, 0, 700, 300, 0xFFFFFF, 0.95);
    bg.setStrokeStyle(4, 0xFF6B9D);

    this.twisterContainer.add(bg);
  }

  presentTwister() {
    const { width, height } = this.cameras.main;

    // Clear previous
    this.twisterContainer.removeAll(true);

    const bg = this.add.rectangle(0, 0, 700, 300, 0xFFFFFF, 0.95);
    bg.setStrokeStyle(4, 0xFF6B9D);
    this.twisterContainer.add(bg);

    // Sample tongue twisters
    const twisters = [
      {
        kannada: 'ಕಪ್ಪು ಕುರಿ ಕರಿಯ ಕುರಿ',
        english: 'Black sheep, dark sheep',
        translation: 'A simple tongue twister',
        words: ['ಕಪ್ಪು', 'ಕುರಿ', 'ಕರಿಯ']
      },
      {
        kannada: 'ಹಣ್ಣು ತಿನ್ನು ಹಣ್ಣು ಕೊಡು',
        english: 'Eat fruit, give fruit',
        translation: 'Practice repetition',
        words: ['ಹಣ್ಣು', 'ತಿನ್ನು', 'ಕೊಡು']
      }
    ];

    this.currentTwister = Phaser.Utils.Array.GetRandom(twisters);

    // Display title
    const title = this.add.text(0, -120, 'Tongue Twister Challenge', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FF6B9D',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Display twister in Kannada
    const twisterText = this.add.text(0, -50, this.currentTwister.kannada, {
      fontSize: '36px',
      fontFamily: 'Nudi, Arial',
      color: '#000000',
      align: 'center',
      wordWrap: { width: 650 }
    }).setOrigin(0.5);

    // Display English translation
    const translation = this.add.text(0, 0, `"${this.currentTwister.english}"`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#666666',
      align: 'center'
    }).setOrigin(0.5);

    // Play button
    const playBtn = this.add.text(0, 60, '🔊 Listen', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#FF6B9D',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playBtn.on('pointerdown', () => {
      this.playTwister();
    });

    // Quiz button
    const quizBtn = this.add.text(0, 120, '📝 Take Quiz', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#6C5B7B',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    quizBtn.on('pointerdown', () => {
      quizBtn.destroy();
      this.showQuiz();
    });

    this.twisterContainer.add([bg, title, twisterText, translation, playBtn, quizBtn]);

    // Auto-play once
    this.time.delayedCall(1000, () => {
      this.playTwister();
    });
  }

  playTwister() {
    this.audioManager.playClick();

    // Simulate playing the tongue twister
    // Visual effect: highlight words one by one
    this.showPlaybackAnimation();
  }

  showPlaybackAnimation() {
    const { width, height } = this.cameras.main;

    const words = this.currentTwister.kannada.split(' ');

    let wordIndex = 0;
    const animateWord = () => {
      if (wordIndex >= words.length) return;

      const word = words[wordIndex];
      const wordDisplay = this.add.text(width / 2, 150, word, {
        fontSize: '48px',
        fontFamily: 'Nudi, Arial',
        color: '#FF6B9D',
        alpha: 0
      }).setOrigin(0.5);

      this.tweens.add({
        targets: wordDisplay,
        alpha: 1,
        scale: 1.2,
        duration: 300,
        onComplete: () => {
          this.tweens.add({
            targets: wordDisplay,
            alpha: 0,
            duration: 300,
            delay: 400,
            onComplete: () => {
              wordDisplay.destroy();
              wordIndex++;
              if (wordIndex < words.length) {
                this.time.delayedCall(100, animateWord);
              }
            }
          });
        }
      });
    };

    animateWord();
  }

  showQuiz() {
    const { width, height } = this.cameras.main;

    // Create quiz overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    overlay.setOrigin(0, 0);
    overlay.setInteractive();

    const quizContainer = this.add.container(width / 2, height / 2);

    const quizBg = this.add.rectangle(0, 0, 650, 350, 0xFFFFFF);
    quizBg.setStrokeStyle(3, 0xFF6B9D);

    // Quiz question: identify a word from the twister
    const randomWord = Phaser.Utils.Array.GetRandom(this.currentTwister.words);

    const question = this.add.text(0, -130,
      'Which word was in the tongue twister?', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#000000',
      align: 'center'
    }).setOrigin(0.5);

    quizContainer.add([quizBg, question]);

    // Answer options
    const allWords = ['ಮನೆ', 'ನೀರು', 'ಬೆಕ್ಕು', ...this.currentTwister.words];
    const uniqueWords = [...new Set(allWords)];
    const distractors = uniqueWords.filter(w => !this.currentTwister.words.includes(w));

    const options = [
      randomWord,
      ...Phaser.Utils.Array.Shuffle(distractors).slice(0, 2)
    ];

    Phaser.Utils.Array.Shuffle(options);
    const correctIndex = options.indexOf(randomWord);

    options.forEach((option, index) => {
      const y = -40 + (index * 80);

      const btn = this.add.rectangle(0, y, 500, 65, 0xFF6B9D);
      btn.setStrokeStyle(2, 0xFFFFFF);
      btn.setInteractive({ useHandCursor: true });

      const text = this.add.text(0, y, option, {
        fontSize: '32px',
        fontFamily: 'Nudi, Arial',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        if (index === correctIndex) {
          this.onQuizCorrect(overlay, quizContainer);
        } else {
          this.onQuizIncorrect(overlay, quizContainer);
        }
      });

      quizContainer.add([btn, text]);
    });
  }

  onQuizCorrect(overlay, quizContainer) {
    this.playCorrectFeedback();
    this.addScore(35);

    overlay.destroy();
    quizContainer.destroy();

    this.time.delayedCall(1000, () => {
      this.presentTwister();
    });
  }

  onQuizIncorrect(overlay, quizContainer) {
    this.playIncorrectFeedback();
    this.loseLife();

    this.cameras.main.shake(200, 0.01);

    overlay.destroy();
    quizContainer.destroy();

    if (this.lives > 0) {
      this.time.delayedCall(1000, () => {
        this.presentTwister();
      });
    }
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
