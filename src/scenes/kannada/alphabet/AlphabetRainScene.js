import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * AlphabetRainScene - Catch falling letters in a basket
 */
export class AlphabetRainScene extends BaseGameScene {
  constructor() {
    super('AlphabetRainScene', {
      lives: 3,
      timeLimit: 60
    });

    this.basket = null;
    this.fallingLetters = [];
    this.targetLetter = null;
    this.letterPool = [];
    this.spawnTimer = null;
    this.correctCaught = 0;
  }

  preload() {
    super.preload();
    this.load.json('alphabet', 'src/data/kannada/alphabet.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.alphabetData = this.cache.json.get('alphabet');
    this.audioManager = new AudioManager(this);
    this.registerPronunciations();

    this.createBackground();
    this.createStandardUI();
    this.createBasket();
    this.createTargetDisplay();

    this.selectLetterPool();
    this.showInstructions(['Catch the correct letters in your basket!', 'Use arrow keys or mouse to move']);
  }

  registerPronunciations() {
    if (this.alphabetData) {
      this.audioManager.registerPronunciationsFromData(this.alphabetData.vowels);
      this.audioManager.registerPronunciationsFromData(this.alphabetData.consonants);
    }
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0, 0);
  }

  createBasket() {
    const { width, height } = this.cameras.main;

    this.basket = this.add.container(width / 2, height - 80);

    const basketBody = this.add.rectangle(0, 0, 120, 40, 0x8B4513);
    const basketRim = this.add.rectangle(0, -20, 140, 10, 0xD2691E);

    this.basket.add([basketBody, basketRim]);
    this.basket.setData('width', 140);

    // Keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Mouse/touch controls
    this.input.on('pointermove', (pointer) => {
      if (this.isGameActive) {
        this.basket.x = Phaser.Math.Clamp(pointer.x, 70, width - 70);
      }
    });
  }

  createTargetDisplay() {
    const { width } = this.cameras.main;

    const container = this.add.container(width / 2, 120);
    const bg = this.add.rectangle(0, 0, 300, 60, 0x000000, 0.7);
    bg.setStrokeStyle(3, 0xFFD700);

    const label = this.add.text(-120, 0, 'Catch:', {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);

    this.targetText = this.add.text(-40, 0, '', {
      fontSize: '40px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFF00'
    }).setOrigin(0, 0.5);

    const audioBtn = this.add.circle(80, 0, 20, 0x4CAF50)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.playTargetAudio());

    const audioIcon = this.add.text(80, 0, '🔊', { fontSize: '24px' }).setOrigin(0.5);

    container.add([bg, label, this.targetText, audioBtn, audioIcon]);
  }

  selectLetterPool() {
    this.letterPool = [...this.alphabetData.vowels];
    if (this.difficulty !== 'beginner') {
      this.letterPool.push(...this.alphabetData.consonants.slice(0, 5));
    }
  }

  onGameStart() {
    this.selectNewTarget();
    this.startLetterRain();
  }

  selectNewTarget() {
    this.targetLetter = Phaser.Utils.Array.GetRandom(this.letterPool);
    this.targetText.setText(this.targetLetter.letter);
    this.time.delayedCall(500, () => this.playTargetAudio());
  }

  playTargetAudio() {
    this.audioManager.playLetter(this.targetLetter.letter);
    this.tweens.add({
      targets: this.targetText,
      scale: 1.3,
      duration: 200,
      yoyo: true
    });
  }

  startLetterRain() {
    this.spawnTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnLetter,
      callbackScope: this,
      loop: true
    });
    this.spawnLetter();
  }

  spawnLetter() {
    if (!this.isGameActive) return;

    const { width } = this.cameras.main;
    const x = Phaser.Math.Between(80, width - 80);

    const isTarget = Math.random() < 0.6;
    const letterData = isTarget ? this.targetLetter : Phaser.Utils.Array.GetRandom(this.letterPool);

    const letter = this.createFallingLetter(x, -50, letterData);
    this.fallingLetters.push(letter);
  }

  createFallingLetter(x, y, letterData) {
    const container = this.add.container(x, y);

    const bg = this.add.circle(0, 0, 35, 0xFFFFFF, 0.9);
    bg.setStrokeStyle(3, 0x2196F3);

    const text = this.add.text(0, 0, letterData.letter, {
      fontSize: '42px',
      fontFamily: 'Nudi, Arial',
      color: '#000000'
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setData('letterData', letterData);
    container.setData('isTarget', letterData.id === this.targetLetter.id);

    const fallSpeed = 100 + (this.difficulty === 'advanced' ? 50 : 0);

    this.tweens.add({
      targets: container,
      y: this.cameras.main.height + 50,
      duration: 4000 - fallSpeed * 10,
      onComplete: () => {
        if (container.getData('isTarget')) {
          this.loseLife();
        }
        container.destroy();
        this.fallingLetters = this.fallingLetters.filter(l => l !== container);
      }
    });

    this.tweens.add({
      targets: container,
      angle: Phaser.Math.Between(-20, 20),
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    return container;
  }

  update() {
    if (!this.isGameActive) return;

    // Keyboard basket movement
    const speed = 8;
    if (this.cursors.left.isDown) {
      this.basket.x = Math.max(70, this.basket.x - speed);
    } else if (this.cursors.right.isDown) {
      this.basket.x = Math.min(this.cameras.main.width - 70, this.basket.x + speed);
    }

    // Check collisions
    this.fallingLetters.forEach(letter => {
      if (this.checkBasketCollision(letter)) {
        this.catchLetter(letter);
      }
    });
  }

  checkBasketCollision(letter) {
    const basketBounds = {
      left: this.basket.x - 70,
      right: this.basket.x + 70,
      top: this.basket.y - 30,
      bottom: this.basket.y + 30
    };

    return letter.x > basketBounds.left &&
           letter.x < basketBounds.right &&
           letter.y > basketBounds.top &&
           letter.y < basketBounds.bottom;
  }

  catchLetter(letter) {
    const isTarget = letter.getData('isTarget');

    if (isTarget) {
      this.correctCaught++;
      this.addScore(20);
      this.playCorrectFeedback();

      if (this.correctCaught >= 5) {
        this.correctCaught = 0;
        this.selectNewTarget();
      }
    } else {
      this.addScore(-10);
      this.playIncorrectFeedback();
      this.loseLife();
    }

    this.tweens.killTweensOf(letter);
    this.tweens.add({
      targets: letter,
      alpha: 0,
      scale: 0,
      duration: 200,
      onComplete: () => {
        letter.destroy();
        this.fallingLetters = this.fallingLetters.filter(l => l !== letter);
      }
    });
  }

  shutdown() {
    if (this.spawnTimer) this.spawnTimer.remove();
    this.fallingLetters.forEach(l => l.destroy());
    this.fallingLetters = [];
    super.shutdown();
  }
}
