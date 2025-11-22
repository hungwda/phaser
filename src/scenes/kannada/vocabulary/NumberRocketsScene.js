import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * NumberRocketsScene - Catch falling number rockets in your spaceship
 */
export class NumberRocketsScene extends BaseGameScene {
  constructor() {
    super('NumberRocketsScene', {
      lives: 3,
      timeLimit: 60
    });

    this.spaceship = null;
    this.fallingRockets = [];
    this.targetNumber = null;
    this.numberPool = [];
    this.spawnTimer = null;
    this.correctCaught = 0;
  }

  preload() {
    super.preload();
    this.load.json('numbers', 'src/data/kannada/numbers.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.numbersData = this.cache.json.get('numbers');
    this.audioManager = new AudioManager(this);
    this.registerPronunciations();

    this.createBackground();
    this.createStandardUI();
    this.createSpaceship();
    this.createTargetDisplay();

    this.selectNumberPool();
    this.showInstructions(['Catch the correct number rockets!', 'Use arrow keys or mouse to move']);
  }

  registerPronunciations() {
    if (this.numbersData) {
      this.audioManager.registerPronunciationsFromData(this.numbersData.items);
    }
  }

  createBackground() {
    const { width, height } = this.cameras.main;

    // Space background with gradient
    const bg = this.add.rectangle(0, 0, width, height, 0x0A0E27).setOrigin(0, 0);

    // Add stars
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);
      const star = this.add.circle(x, y, size, 0xFFFFFF, 0.8);

      // Twinkle animation
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      });
    }
  }

  createSpaceship() {
    const { width, height } = this.cameras.main;

    this.spaceship = this.add.container(width / 2, height - 80);

    // Spaceship body (triangle)
    const body = this.add.triangle(0, 0, -30, 20, 30, 20, 0, -25, 0x4CAF50);
    body.setStrokeStyle(2, 0x66BB6A);

    // Spaceship window
    const window = this.add.circle(0, -5, 8, 0x64B5F6);

    // Flames
    const flame1 = this.add.triangle(-15, 22, -5, 0, 5, 0, 0, 12, 0xFF5722, 0.8);
    const flame2 = this.add.triangle(15, 22, -5, 0, 5, 0, 0, 12, 0xFFA726, 0.8);

    // Animate flames
    this.tweens.add({
      targets: [flame1, flame2],
      scaleY: 1.5,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      repeat: -1
    });

    this.spaceship.add([body, window, flame1, flame2]);
    this.spaceship.setData('width', 60);

    // Keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Mouse/touch controls
    this.input.on('pointermove', (pointer) => {
      if (this.isGameActive) {
        this.spaceship.x = Phaser.Math.Clamp(pointer.x, 40, width - 40);
      }
    });
  }

  createTargetDisplay() {
    const { width } = this.cameras.main;

    const container = this.add.container(width / 2, 120);
    const bg = this.add.rectangle(0, 0, 350, 70, 0x1A237E, 0.9);
    bg.setStrokeStyle(3, 0x42A5F5);

    const label = this.add.text(-150, 0, 'Catch Number:', {
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);

    this.targetDigit = this.add.text(-30, 0, '', {
      fontSize: '48px',
      fontFamily: 'Nudi, Arial',
      color: '#FFD54F'
    }).setOrigin(0, 0.5);

    this.targetWord = this.add.text(50, 0, '', {
      fontSize: '24px',
      fontFamily: 'Nudi, Arial',
      color: '#90CAF9'
    }).setOrigin(0, 0.5);

    const audioBtn = this.add.circle(140, 0, 22, 0x4CAF50)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.playTargetAudio());

    const audioIcon = this.add.text(140, 0, '🔊', { fontSize: '24px' }).setOrigin(0.5);

    container.add([bg, label, this.targetDigit, this.targetWord, audioBtn, audioIcon]);
  }

  selectNumberPool() {
    this.numberPool = [...this.numbersData.items];
    if (this.difficulty === 'beginner') {
      this.numberPool = this.numberPool.filter(n => n.value <= 5);
    } else if (this.difficulty === 'intermediate') {
      this.numberPool = this.numberPool.filter(n => n.value <= 7);
    }
  }

  onGameStart() {
    this.selectNewTarget();
    this.startRocketRain();
  }

  selectNewTarget() {
    this.targetNumber = Phaser.Utils.Array.GetRandom(this.numberPool);
    this.targetDigit.setText(this.targetNumber.digit);
    this.targetWord.setText(this.targetNumber.word);
    this.time.delayedCall(500, () => this.playTargetAudio());
  }

  playTargetAudio() {
    this.audioManager.playWord(this.targetNumber.word);
    this.tweens.add({
      targets: [this.targetDigit, this.targetWord],
      scale: 1.2,
      duration: 200,
      yoyo: true
    });
  }

  startRocketRain() {
    this.spawnTimer = this.time.addEvent({
      delay: 1800,
      callback: this.spawnRocket,
      callbackScope: this,
      loop: true
    });
    this.spawnRocket();
  }

  spawnRocket() {
    if (!this.isGameActive) return;

    const { width } = this.cameras.main;
    const x = Phaser.Math.Between(80, width - 80);

    const isTarget = Math.random() < 0.5;
    const numberData = isTarget ? this.targetNumber : Phaser.Utils.Array.GetRandom(this.numberPool);

    const rocket = this.createFallingRocket(x, -60, numberData);
    this.fallingRockets.push(rocket);
  }

  createFallingRocket(x, y, numberData) {
    const container = this.add.container(x, y);

    const isTarget = numberData.id === this.targetNumber.id;
    const rocketColor = isTarget ? 0xFF5722 : 0x607D8B;

    // Rocket body
    const body = this.add.triangle(0, 0, -20, 30, 20, 30, 0, -30, rocketColor);
    body.setStrokeStyle(2, 0xFFFFFF);

    // Rocket window with number
    const windowBg = this.add.circle(0, 0, 18, 0x64B5F6, 0.9);
    const digitText = this.add.text(0, 0, numberData.digit, {
      fontSize: '28px',
      fontFamily: 'Nudi, Arial',
      color: '#000000'
    }).setOrigin(0.5);

    // Rocket flames
    const flame = this.add.triangle(0, 32, -8, 0, 8, 0, 0, 15, 0xFFA726, 0.7);

    this.tweens.add({
      targets: flame,
      scaleY: 1.5,
      alpha: 0.4,
      duration: 150,
      yoyo: true,
      repeat: -1
    });

    container.add([body, windowBg, digitText, flame]);
    container.setData('numberData', numberData);
    container.setData('isTarget', isTarget);

    const fallSpeed = 100 + (this.difficulty === 'advanced' ? 60 : 0);

    this.tweens.add({
      targets: container,
      y: this.cameras.main.height + 60,
      duration: 4500 - fallSpeed * 10,
      onComplete: () => {
        if (container.getData('isTarget')) {
          this.loseLife();
        }
        container.destroy();
        this.fallingRockets = this.fallingRockets.filter(r => r !== container);
      }
    });

    // Slight wobble
    this.tweens.add({
      targets: container,
      x: x + Phaser.Math.Between(-15, 15),
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return container;
  }

  update() {
    if (!this.isGameActive) return;

    // Keyboard spaceship movement
    const speed = 10;
    if (this.cursors.left.isDown) {
      this.spaceship.x = Math.max(40, this.spaceship.x - speed);
    } else if (this.cursors.right.isDown) {
      this.spaceship.x = Math.min(this.cameras.main.width - 40, this.spaceship.x + speed);
    }

    // Check collisions
    this.fallingRockets.forEach(rocket => {
      if (this.checkSpaceshipCollision(rocket)) {
        this.catchRocket(rocket);
      }
    });
  }

  checkSpaceshipCollision(rocket) {
    const spaceshipBounds = {
      left: this.spaceship.x - 30,
      right: this.spaceship.x + 30,
      top: this.spaceship.y - 35,
      bottom: this.spaceship.y + 25
    };

    return rocket.x > spaceshipBounds.left &&
           rocket.x < spaceshipBounds.right &&
           rocket.y > spaceshipBounds.top &&
           rocket.y < spaceshipBounds.bottom;
  }

  catchRocket(rocket) {
    const isTarget = rocket.getData('isTarget');
    const numberData = rocket.getData('numberData');

    if (isTarget) {
      this.correctCaught++;
      this.addScore(25);
      this.playCorrectFeedback();

      // Create success explosion
      this.createExplosion(rocket.x, rocket.y, 0x4CAF50);

      if (this.correctCaught >= 5) {
        this.correctCaught = 0;
        this.selectNewTarget();
      }
    } else {
      this.addScore(-10);
      this.playIncorrectFeedback();
      this.loseLife();

      // Create wrong explosion
      this.createExplosion(rocket.x, rocket.y, 0xF44336);
    }

    this.tweens.killTweensOf(rocket);
    this.tweens.add({
      targets: rocket,
      alpha: 0,
      scale: 0,
      duration: 200,
      onComplete: () => {
        rocket.destroy();
        this.fallingRockets = this.fallingRockets.filter(r => r !== rocket);
      }
    });
  }

  createExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const distance = 50;
      const endX = x + Math.cos(angle) * distance;
      const endY = y + Math.sin(angle) * distance;

      const particle = this.add.circle(x, y, 5, color, 1);

      this.tweens.add({
        targets: particle,
        x: endX,
        y: endY,
        alpha: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  shutdown() {
    if (this.spawnTimer) this.spawnTimer.remove();
    this.fallingRockets.forEach(r => r.destroy());
    this.fallingRockets = [];
    super.shutdown();
  }
}
