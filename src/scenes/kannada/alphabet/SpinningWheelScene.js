import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * SpinningWheelScene - Spin the wheel to learn Kannada letters
 */
export class SpinningWheelScene extends BaseGameScene {
  constructor() {
    super('SpinningWheelScene', {
      lives: 3,
      timeLimit: 120
    });

    this.wheel = null;
    this.wheelSegments = [];
    this.spinning = false;
    this.currentRotation = 0;
    this.letterData = null;
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

    this.createGameBackground();
    this.createStandardUI();
    this.createWheel();
    this.createSpinButton();

    this.showInstructions('Spin the wheel to discover Kannada letters! Tap the letter to hear its sound.');
  }

  registerPronunciations() {
    if (this.alphabetData) {
      this.audioManager.registerPronunciationsFromData(this.alphabetData.vowels);
      this.audioManager.registerPronunciationsFromData(this.alphabetData.consonants);
    }
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;
    const bg = this.add.rectangle(0, 0, width, height, 0xFFF8DC).setOrigin(0, 0);

    // Decorative stars
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      this.add.circle(x, y, 3, 0xFFD700, 0.5);
    }
  }

  createWheel() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2 - 50;
    const radius = 200;

    // Get letters for wheel (first 8 vowels)
    const letters = this.alphabetData.vowels.slice(0, 8);
    const segmentAngle = (Math.PI * 2) / letters.length;

    this.wheel = this.add.container(centerX, centerY);

    // Create wheel segments
    letters.forEach((letter, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = (index + 1) * segmentAngle;
      const color = index % 2 === 0 ? 0xFF6B6B : 0x4ECDC4;

      // Draw segment
      const graphics = this.add.graphics();
      graphics.fillStyle(color, 1);
      graphics.beginPath();
      graphics.moveTo(0, 0);
      graphics.arc(0, 0, radius, startAngle, endAngle, false);
      graphics.lineTo(0, 0);
      graphics.closePath();
      graphics.fillPath();
      graphics.lineStyle(3, 0xFFFFFF);
      graphics.strokePath();

      // Add letter text
      const angle = startAngle + segmentAngle / 2;
      const textX = Math.cos(angle) * (radius * 0.7);
      const textY = Math.sin(angle) * (radius * 0.7);

      const letterText = this.add.text(textX, textY, letter.letter, {
        fontSize: '48px',
        fontFamily: 'Nudi, Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      this.wheel.add([graphics, letterText]);
      this.wheelSegments.push({ letter: letter, angle: angle });
    });

    // Center circle
    const centerCircle = this.add.circle(0, 0, 30, 0xFFD700);
    centerCircle.setStrokeStyle(3, 0xFFFFFF);
    this.wheel.add(centerCircle);

    // Pointer
    const pointer = this.add.triangle(0, -radius - 20, 0, 20, -15, -10, 15, -10, 0xFF0000);
    pointer.setStrokeStyle(2, 0xFFFFFF);
    this.add.existing(pointer);
    pointer.x = centerX;
    pointer.y = centerY;
  }

  createSpinButton() {
    const { width, height } = this.cameras.main;

    const button = this.add.rectangle(width / 2, height - 100, 200, 60, 0x4CAF50);
    button.setStrokeStyle(3, 0xFFFFFF);
    button.setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(width / 2, height - 100, 'SPIN!', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    button.on('pointerdown', () => {
      if (!this.spinning) {
        this.spinWheel();
      }
    });

    button.on('pointerover', () => {
      button.setFillStyle(0x66BB6A);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x4CAF50);
    });
  }

  spinWheel() {
    if (this.spinning) return;

    this.spinning = true;
    this.audioManager.playClick();

    const spins = Phaser.Math.Between(3, 5);
    const extraRotation = Phaser.Math.Between(0, 360);
    const totalRotation = (spins * 360) + extraRotation;

    this.tweens.add({
      targets: this.wheel,
      angle: this.currentRotation + totalRotation,
      duration: 3000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.spinning = false;
        this.currentRotation = this.wheel.angle % 360;
        this.checkResult();
      }
    });
  }

  checkResult() {
    const normalizedAngle = (360 - (this.currentRotation % 360)) % 360;
    const segmentAngle = 360 / this.wheelSegments.length;
    const segmentIndex = Math.floor(normalizedAngle / segmentAngle);

    if (this.wheelSegments[segmentIndex]) {
      const selectedLetter = this.wheelSegments[segmentIndex].letter;
      this.showLetterInfo(selectedLetter);
      this.addScore(10);
    }
  }

  showLetterInfo(letter) {
    const { width, height } = this.cameras.main;

    // Play pronunciation
    if (letter.audioPath) {
      this.audioManager.playLetterByPath(letter.audioPath);
    }

    // Show letter info popup
    const popup = this.add.container(width / 2, height - 200);

    const bg = this.add.rectangle(0, 0, 300, 100, 0x000000, 0.8);
    bg.setStrokeStyle(3, 0xFFD700);

    const letterText = this.add.text(0, -20, letter.letter, {
      fontSize: '48px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    const translitText = this.add.text(0, 25, `"${letter.transliteration}"`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFD700'
    }).setOrigin(0.5);

    popup.add([bg, letterText, translitText]);

    this.tweens.add({
      targets: popup,
      alpha: 0,
      duration: 2000,
      delay: 2000,
      onComplete: () => popup.destroy()
    });
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
