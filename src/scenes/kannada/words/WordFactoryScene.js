import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * WordFactoryScene - Build words by combining letters on a conveyor belt
 */
export class WordFactoryScene extends BaseGameScene {
  constructor() {
    super('WordFactoryScene', {
      lives: 5,
      timeLimit: 120
    });

    this.targetWord = null;
    this.conveyorItems = [];
    this.selectedLetters = [];
    this.words = [];
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
    this.createFactory();
    this.createWorkArea();

    this.selectTargetWord();
    this.showInstructions('Build the target word by selecting letters from the conveyor belt!');
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;
    const bg = this.add.rectangle(0, 0, width, height, 0x34495E).setOrigin(0, 0);

    // Factory pipes
    for (let i = 0; i < 3; i++) {
      const x = 100 + (i * 250);
      const pipe = this.add.rectangle(x, 100, 40, 200, 0x95A5A6);
      pipe.setStrokeStyle(2, 0x7F8C8D);
    }
  }

  createFactory() {
    const { width, height } = this.cameras.main;

    // Conveyor belt
    const belt = this.add.rectangle(width / 2, height - 200, width - 100, 100, 0x7F8C8D);
    belt.setStrokeStyle(3, 0x34495E);

    // Belt animation lines
    for (let i = 0; i < 10; i++) {
      const line = this.add.rectangle(
        100 + (i * 70),
        height - 200,
        50,
        10,
        0x34495E
      );

      this.tweens.add({
        targets: line,
        x: line.x + 700,
        duration: 2000,
        repeat: -1,
        onRepeat: () => {
          line.x = 100;
        }
      });
    }

    this.conveyorY = height - 200;
    this.startConveyor();
  }

  createWorkArea() {
    const { width, height } = this.cameras.main;

    // Work area at top
    const workArea = this.add.rectangle(width / 2, 100, width - 100, 120, 0xECF0F1);
    workArea.setStrokeStyle(3, 0x3498DB);

    this.add.text(width / 2, 50, 'Build Word Here:', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#2C3E50'
    }).setOrigin(0.5);

    this.workAreaY = 100;
  }

  selectTargetWord() {
    const { width } = this.cameras.main;

    if (this.wordsData && this.wordsData.basic) {
      const difficulty = this.difficulty || 'beginner';
      const filtered = this.wordsData.basic.filter(w =>
        w.difficulty === difficulty || w.difficulty === 'beginner'
      );

      this.targetWord = Phaser.Utils.Array.GetRandom(filtered);

      if (this.targetWordText) this.targetWordText.destroy();

      this.targetWordText = this.add.text(width / 2, 200, `Target: ${this.targetWord.kannada}`, {
        fontSize: '40px',
        fontFamily: 'Nudi, Arial',
        color: '#2C3E50',
        backgroundColor: '#FFD700',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);
    }
  }

  startConveyor() {
    this.time.addEvent({
      delay: 2000,
      callback: () => this.spawnConveyorItem(),
      loop: true
    });

    // Spawn initial items
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 700, () => this.spawnConveyorItem());
    }
  }

  spawnConveyorItem() {
    const { width } = this.cameras.main;

    if (!this.targetWord) return;

    // Randomly spawn either target letters or distractors
    const letters = this.targetWord.kannada.split('');
    const isTargetLetter = Math.random() < 0.6;

    let letter;
    if (isTargetLetter && letters.length > 0) {
      letter = Phaser.Utils.Array.GetRandom(letters);
    } else {
      // Random distractor
      letter = Phaser.Utils.Array.GetRandom(['ಅ', 'ಆ', 'ಇ', 'ಕ', 'ಗ', 'ತ', 'ನ', 'ಮ']);
    }

    const item = this.add.container(-50, this.conveyorY);

    const bg = this.add.circle(0, 0, 35, 0xFFFFFF);
    bg.setStrokeStyle(3, 0x3498DB);

    const text = this.add.text(0, 0, letter, {
      fontSize: '36px',
      fontFamily: 'Nudi, Arial',
      color: '#000000'
    }).setOrigin(0.5);

    item.add([bg, text]);
    item.setSize(70, 70);
    item.setInteractive({ useHandCursor: true });
    item.setData('letter', letter);

    item.on('pointerdown', () => {
      this.selectLetter(item);
    });

    this.conveyorItems.push(item);

    this.tweens.add({
      targets: item,
      x: width + 50,
      duration: 8000,
      onComplete: () => {
        item.destroy();
        const index = this.conveyorItems.indexOf(item);
        if (index > -1) this.conveyorItems.splice(index, 1);
      }
    });
  }

  selectLetter(item) {
    const letter = item.getData('letter');

    this.audioManager.playClick();

    // Remove from conveyor
    this.tweens.killTweensOf(item);

    // Move to work area
    const targetX = 200 + (this.selectedLetters.length * 50);

    this.tweens.add({
      targets: item,
      x: targetX,
      y: this.workAreaY,
      duration: 300,
      onComplete: () => {
        this.selectedLetters.push({ item, letter });
        this.checkWord();
      }
    });
  }

  checkWord() {
    if (!this.targetWord) return;

    const builtWord = this.selectedLetters.map(s => s.letter).join('');
    const targetWord = this.targetWord.kannada;

    if (builtWord === targetWord) {
      this.onCorrectWord();
    } else if (builtWord.length >= targetWord.length) {
      this.onIncorrectWord();
    }
  }

  onCorrectWord() {
    this.playCorrectFeedback();
    this.addScore(50);

    this.showCelebration('Correct!');

    this.time.delayedCall(1500, () => {
      this.clearWorkArea();
      this.selectTargetWord();
    });
  }

  onIncorrectWord() {
    this.playIncorrectFeedback();
    this.loseLife();

    this.cameras.main.shake(200, 0.01);

    this.time.delayedCall(800, () => {
      this.clearWorkArea();
    });
  }

  clearWorkArea() {
    this.selectedLetters.forEach(({ item }) => {
      this.tweens.add({
        targets: item,
        alpha: 0,
        y: item.y - 50,
        duration: 300,
        onComplete: () => item.destroy()
      });
    });
    this.selectedLetters = [];
  }

  showCelebration(text) {
    const { width, height } = this.cameras.main;

    const celebText = this.add.text(width / 2, height / 2, text, {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#27AE60',
      stroke: '#FFFFFF',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: celebText,
      alpha: 1,
      scale: 1.2,
      duration: 300,
      yoyo: true,
      onComplete: () => celebText.destroy()
    });
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
