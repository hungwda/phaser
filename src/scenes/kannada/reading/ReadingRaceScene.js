import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * ReadingRaceScene - Speed reading comprehension game
 */
export class ReadingRaceScene extends BaseGameScene {
  constructor() {
    super('ReadingRaceScene', {
      lives: 5,
      timeLimit: 90
    });

    this.passages = [];
    this.currentPassage = null;
    this.readStartTime = 0;
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
    this.createRaceTrack();

    this.presentPassage();
    this.showInstructions('Read quickly and answer the question! Race against time!');
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;
    const bg = this.add.rectangle(0, 0, width, height, 0xE1F5FE).setOrigin(0, 0);

    // Clouds
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(50, 150);

      const cloud = this.add.ellipse(x, y, 80, 40, 0xFFFFFF, 0.7);
    }
  }

  createRaceTrack() {
    const { width } = this.cameras.main;

    // Track
    const track = this.add.rectangle(width / 2, 80, width - 100, 60, 0x8BC34A);
    track.setStrokeStyle(3, 0x689F38);

    // Racing car (player progress)
    this.raceCar = this.add.text(100, 80, '🏎️', {
      fontSize: '48px'
    }).setOrigin(0.5);

    // Finish line
    this.finishLine = this.add.rectangle(width - 100, 80, 20, 60, 0xFF0000);
    this.finishLine.setStrokeStyle(2, 0xFFFFFF);

    this.add.text(width - 100, 40, '🏁', {
      fontSize: '32px'
    }).setOrigin(0.5);
  }

  presentPassage() {
    const { width, height } = this.cameras.main;

    // Clear previous
    if (this.passageText) this.passageText.destroy();
    if (this.questionContainer) this.questionContainer.destroy();

    if (!this.sentencesData || !this.sentencesData.simple) return;

    const passages = this.sentencesData.simple.filter(s => s.english && s.kannada);
    this.currentPassage = Phaser.Utils.Array.GetRandom(passages);

    // Display passage
    const passageBg = this.add.rectangle(width / 2, height / 2 - 50, 700, 200, 0xFFFFFF);
    passageBg.setStrokeStyle(3, 0x2196F3);

    this.passageText = this.add.text(width / 2, height / 2 - 50,
      this.currentPassage.kannada, {
      fontSize: '28px',
      fontFamily: 'Nudi, Arial',
      color: '#000000',
      align: 'center',
      wordWrap: { width: 650 }
    }).setOrigin(0.5);

    // Start reading timer
    this.readStartTime = this.time.now;

    // Show "I finished reading" button
    const finishBtn = this.add.rectangle(width / 2, height / 2 + 100, 300, 60, 0x4CAF50);
    finishBtn.setStrokeStyle(3, 0xFFFFFF);
    finishBtn.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(width / 2, height / 2 + 100, 'Finished Reading!', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    finishBtn.on('pointerdown', () => {
      const readTime = this.time.now - this.readStartTime;
      finishBtn.destroy();
      btnText.destroy();
      passageBg.destroy();
      this.passageText.destroy();
      this.showComprehensionQuestion(readTime);
    });

    this.finishReadingBtn = finishBtn;
    this.finishBtnText = btnText;
    this.passageBg = passageBg;
  }

  showComprehensionQuestion(readTime) {
    const { width, height } = this.cameras.main;

    this.questionContainer = this.add.container(width / 2, height / 2);

    const questionBg = this.add.rectangle(0, 0, 700, 300, 0xFFF9C4);
    questionBg.setStrokeStyle(3, 0xFF9800);

    // Simple comprehension question about the passage
    const questionText = this.add.text(0, -100,
      'What did the sentence say?', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#000000',
      align: 'center'
    }).setOrigin(0.5);

    this.questionContainer.add([questionBg, questionText]);

    // Answer options (correct answer + distractors)
    const options = [
      this.currentPassage.english,
      'Something completely different',
      'Another random meaning'
    ];

    Phaser.Utils.Array.Shuffle(options);
    const correctIndex = options.indexOf(this.currentPassage.english);

    options.forEach((option, index) => {
      const y = -20 + (index * 70);

      const btn = this.add.rectangle(0, y, 650, 60, 0x2196F3);
      btn.setStrokeStyle(2, 0xFFFFFF);
      btn.setInteractive({ useHandCursor: true });

      const text = this.add.text(0, y, option, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        align: 'center',
        wordWrap: { width: 600 }
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        if (index === correctIndex) {
          this.onCorrectAnswer(readTime);
        } else {
          this.onIncorrectAnswer();
        }
      });

      this.questionContainer.add([btn, text]);
    });
  }

  onCorrectAnswer(readTime) {
    this.playCorrectFeedback();

    // Score based on reading speed
    const baseScore = 30;
    const timeBonus = Math.max(0, 20 - Math.floor(readTime / 1000));
    this.addScore(baseScore + timeBonus);

    // Move race car forward
    const progress = Math.min(this.score / 200, 1);
    const targetX = 100 + (progress * (this.cameras.main.width - 200));

    this.tweens.add({
      targets: this.raceCar,
      x: targetX,
      duration: 500,
      ease: 'Power2'
    });

    this.questionContainer.destroy();

    this.time.delayedCall(1000, () => {
      this.presentPassage();
    });
  }

  onIncorrectAnswer() {
    this.playIncorrectFeedback();
    this.loseLife();

    this.cameras.main.shake(200, 0.01);

    this.questionContainer.destroy();

    if (this.lives > 0) {
      this.time.delayedCall(1000, () => {
        this.presentPassage();
      });
    }
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
