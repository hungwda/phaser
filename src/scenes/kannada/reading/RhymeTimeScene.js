import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * RhymeTimeScene - Learn Kannada through rhymes and songs
 */
export class RhymeTimeScene extends BaseGameScene {
  constructor() {
    super('RhymeTimeScene', {
      lives: 3,
      timeLimit: 120
    });

    this.currentRhyme = null;
    this.rhymeLines = [];
    this.currentLine = 0;
  }

  preload() {
    super.preload();
    this.load.json('stories', 'src/data/kannada/stories.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.storiesData = this.cache.json.get('stories');
    this.audioManager = new AudioManager(this);

    this.createGameBackground();
    this.createStandardUI();
    this.createRhymeDisplay();

    this.loadRhyme();
    this.showInstructions('Learn the rhyme and complete the missing words!');
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;

    // Colorful background
    const colors = [0xFFEBEE, 0xE3F2FD, 0xF3E5F5, 0xFFF9C4];
    colors.forEach((color, index) => {
      const rect = this.add.rectangle(
        (width / colors.length) * index,
        0,
        width / colors.length,
        height,
        color
      ).setOrigin(0, 0);
    });

    // Musical notes decoration
    const notes = ['♪', '♫', '♬'];
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      const note = Phaser.Utils.Array.GetRandom(notes);

      const text = this.add.text(x, y, note, {
        fontSize: '36px',
        fontFamily: 'Arial',
        color: '#FF4081',
        alpha: 0.3
      });

      // Floating animation
      this.tweens.add({
        targets: text,
        y: y - 20,
        alpha: 0.1,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  createRhymeDisplay() {
    const { width, height } = this.cameras.main;

    // Rhyme display area
    this.rhymeContainer = this.add.container(width / 2, height / 2 - 50);

    const bg = this.add.rectangle(0, 0, 700, 350, 0xFFFFFF, 0.9);
    bg.setStrokeStyle(4, 0xFF4081);

    this.rhymeContainer.add(bg);

    // Play rhyme button
    this.playBtn = this.add.text(width / 2, 150, '🔊 Play Rhyme', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#4CAF50',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.playBtn.on('pointerdown', () => {
      this.playRhyme();
    });
  }

  loadRhyme() {
    // Sample rhyme data
    this.currentRhyme = {
      title: 'ಚಂದದ ಹಾಡು',
      titleEnglish: 'Moon Song',
      lines: [
        { kannada: 'ಚಂದಮಾಮ ದೂರ ಕೆ', english: 'Moon is far away' },
        { kannada: 'ಪೂಸೆ ಪಾಕ ಪೂರ ಕೆ', english: 'Cooking sweet pudding' },
        { kannada: 'ಆಪಕೆ ಕ್ಯಾ ದೂಂ', english: 'What shall I give you' },
        { kannada: 'ಚಾಂದಿ ಕಾ ಜೂನ್', english: 'Silver shoes' }
      ]
    };

    this.displayRhyme();
  }

  displayRhyme() {
    const { width, height } = this.cameras.main;

    // Clear previous content
    this.rhymeContainer.removeAll(true);

    const bg = this.add.rectangle(0, 0, 700, 350, 0xFFFFFF, 0.9);
    bg.setStrokeStyle(4, 0xFF4081);
    this.rhymeContainer.add(bg);

    // Title
    const title = this.add.text(0, -140, this.currentRhyme.title, {
      fontSize: '32px',
      fontFamily: 'Nudi, Arial',
      color: '#FF4081',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const titleEng = this.add.text(0, -105, this.currentRhyme.titleEnglish, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#666666'
    }).setOrigin(0.5);

    this.rhymeContainer.add([title, titleEng]);

    // Display rhyme lines
    this.currentRhyme.lines.forEach((line, index) => {
      const y = -50 + (index * 60);

      const kannadaLine = this.add.text(0, y, line.kannada, {
        fontSize: '24px',
        fontFamily: 'Nudi, Arial',
        color: '#000000',
        align: 'center'
      }).setOrigin(0.5);

      const englishLine = this.add.text(0, y + 25, `(${line.english})`, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#999999',
        align: 'center'
      }).setOrigin(0.5);

      this.rhymeContainer.add([kannadaLine, englishLine]);
    });

    // Show quiz button after displaying rhyme
    this.time.delayedCall(2000, () => {
      this.showQuizButton();
    });
  }

  playRhyme() {
    // Simulate playing rhyme with text animation
    this.currentLine = 0;
    this.audioManager.playClick();

    const animateLines = () => {
      if (this.currentLine >= this.currentRhyme.lines.length) {
        return;
      }

      // Highlight current line
      this.currentLine++;

      this.time.delayedCall(1500, () => animateLines());
    };

    animateLines();
  }

  showQuizButton() {
    const { width, height } = this.cameras.main;

    const quizBtn = this.add.text(width / 2, height - 100, '📝 Take Quiz', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#FF9800',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    quizBtn.on('pointerdown', () => {
      quizBtn.destroy();
      this.showRhymeQuiz();
    });
  }

  showRhymeQuiz() {
    const { width, height } = this.cameras.main;

    // Create quiz: complete the line
    const randomLine = Phaser.Utils.Array.GetRandom(this.currentRhyme.lines);
    const words = randomLine.kannada.split(' ');

    if (words.length < 2) {
      this.addScore(20);
      this.time.delayedCall(1000, () => this.loadRhyme());
      return;
    }

    const missingWordIndex = Phaser.Math.Between(0, words.length - 1);
    const missingWord = words[missingWordIndex];
    words[missingWordIndex] = '_____';

    const incompleteLine = words.join(' ');

    // Quiz overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0, 0);
    overlay.setInteractive();

    const quizContainer = this.add.container(width / 2, height / 2);

    const quizBg = this.add.rectangle(0, 0, 650, 300, 0xFFFFFF);
    quizBg.setStrokeStyle(3, 0xFF4081);

    const questionText = this.add.text(0, -100, 'Complete the line:', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#666666'
    }).setOrigin(0.5);

    const lineText = this.add.text(0, -50, incompleteLine, {
      fontSize: '28px',
      fontFamily: 'Nudi, Arial',
      color: '#000000',
      align: 'center',
      wordWrap: { width: 600 }
    }).setOrigin(0.5);

    quizContainer.add([quizBg, questionText, lineText]);

    // Answer options
    const allWords = this.currentRhyme.lines.flatMap(l => l.kannada.split(' '));
    const uniqueWords = [...new Set(allWords)].filter(w => w !== missingWord);

    const options = [
      missingWord,
      ...Phaser.Utils.Array.Shuffle(uniqueWords).slice(0, 2)
    ];

    Phaser.Utils.Array.Shuffle(options);
    const correctIndex = options.indexOf(missingWord);

    options.forEach((option, index) => {
      const y = 20 + (index * 70);

      const btn = this.add.rectangle(0, y, 500, 55, 0x2196F3);
      btn.setStrokeStyle(2, 0xFFFFFF);
      btn.setInteractive({ useHandCursor: true });

      const text = this.add.text(0, y, option, {
        fontSize: '24px',
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
    this.addScore(30);

    overlay.destroy();
    quizContainer.destroy();

    this.time.delayedCall(1000, () => {
      this.loadRhyme();
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
        this.loadRhyme();
      });
    }
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
