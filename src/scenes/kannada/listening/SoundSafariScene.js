import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * SoundSafariScene - Listen to sounds and identify animals/objects
 */
export class SoundSafariScene extends BaseGameScene {
  constructor() {
    super('SoundSafariScene', {
      lives: 5,
      timeLimit: 120
    });

    this.currentItem = null;
    this.safari = [];
  }

  preload() {
    super.preload();
    this.load.json('animals', 'src/data/kannada/animals.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.animalsData = this.cache.json.get('animals');
    this.audioManager = new AudioManager(this);

    this.createGameBackground();
    this.createStandardUI();
    this.createSafariScene();

    this.presentAnimal();
    this.showInstructions('Listen to the sound and find the correct animal!');
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;

    // Jungle background
    const bg = this.add.rectangle(0, 0, width, height, 0x228B22).setOrigin(0, 0);

    // Grass
    const grass = this.add.rectangle(0, height - 100, width, 100, 0x32CD32).setOrigin(0, 0);

    // Trees
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(100, 300);

      this.createTree(x, y);
    }

    // Sun
    this.add.circle(width - 80, 80, 50, 0xFFFF00);

    // Birds flying
    this.createFlyingBirds();
  }

  createTree(x, y) {
    // Trunk
    const trunk = this.add.rectangle(x, y, 20, 60, 0x8B4513);

    // Leaves
    const leaves = this.add.circle(x, y - 40, 35, 0x228B22);
  }

  createFlyingBirds() {
    const { width } = this.cameras.main;

    for (let i = 0; i < 3; i++) {
      const bird = this.add.text(
        Phaser.Math.Between(100, width - 100),
        Phaser.Math.Between(50, 150),
        '🦅',
        { fontSize: '24px' }
      );

      this.tweens.add({
        targets: bird,
        x: bird.x + Phaser.Math.Between(-100, 100),
        y: bird.y + Phaser.Math.Between(-30, 30),
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  createSafariScene() {
    const { width, height } = this.cameras.main;

    // Sound play button
    this.soundBtn = this.add.text(width / 2, height / 2 - 50, '🔊', {
      fontSize: '100px'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.soundBtn.on('pointerdown', () => {
      this.playAnimalSound();
    });

    const listenText = this.add.text(width / 2, height / 2 + 50,
      'Listen to the sound', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);
  }

  presentAnimal() {
    const { width, height } = this.cameras.main;

    if (!this.animalsData || !this.animalsData.basic) return;

    // Clear previous
    if (this.animalOptions) this.animalOptions.destroy();

    this.currentItem = Phaser.Utils.Array.GetRandom(this.animalsData.basic);

    // Auto-play sound once
    this.time.delayedCall(500, () => {
      this.playAnimalSound();
    });

    // Show animal options
    this.time.delayedCall(2000, () => {
      this.showAnimalOptions();
    });
  }

  playAnimalSound() {
    this.audioManager.playClick();

    // Simulate animal sound
    // Visual feedback
    this.tweens.add({
      targets: this.soundBtn,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      repeat: 2
    });

    // Show animal name briefly in Kannada
    this.showAnimalNameBriefly();
  }

  showAnimalNameBriefly() {
    const { width, height } = this.cameras.main;

    const nameDisplay = this.add.text(width / 2, height / 2 - 150,
      this.currentItem.kannada, {
      fontSize: '40px',
      fontFamily: 'Nudi, Arial',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4,
      alpha: 0
    }).setOrigin(0.5);

    this.tweens.add({
      targets: nameDisplay,
      alpha: 1,
      duration: 300,
      onComplete: () => {
        this.tweens.add({
          targets: nameDisplay,
          alpha: 0,
          duration: 300,
          delay: 800,
          onComplete: () => nameDisplay.destroy()
        });
      }
    });
  }

  showAnimalOptions() {
    const { width, height } = this.cameras.main;

    this.animalOptions = this.add.container(width / 2, height - 150);

    // Get options
    const allAnimals = this.animalsData.basic;
    const distractors = allAnimals.filter(a => a.kannada !== this.currentItem.kannada);

    const options = [
      this.currentItem,
      ...Phaser.Utils.Array.Shuffle(distractors).slice(0, 3)
    ];

    Phaser.Utils.Array.Shuffle(options);

    const startX = -300;
    const spacing = 200;

    options.forEach((animal, index) => {
      const x = startX + (index * spacing);

      const card = this.createAnimalCard(x, 0, animal);
      this.animalOptions.add(card);
    });
  }

  createAnimalCard(x, y, animalData) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 150, 120, 0xFFFFFF);
    bg.setStrokeStyle(3, 0x4CAF50);

    // Animal emoji or icon
    const emoji = this.getAnimalEmoji(animalData.english);
    const icon = this.add.text(0, -20, emoji, {
      fontSize: '48px'
    }).setOrigin(0.5);

    const nameText = this.add.text(0, 30, animalData.kannada, {
      fontSize: '20px',
      fontFamily: 'Nudi, Arial',
      color: '#000000'
    }).setOrigin(0.5);

    container.add([bg, icon, nameText]);
    container.setSize(150, 120);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      this.checkAnswer(animalData, container);
    });

    container.on('pointerover', () => {
      bg.setFillStyle(0xE8F5E9);
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

  getAnimalEmoji(englishName) {
    const emojiMap = {
      'dog': '🐕',
      'cat': '🐈',
      'cow': '🐄',
      'elephant': '🐘',
      'lion': '🦁',
      'tiger': '🐅',
      'bird': '🐦',
      'monkey': '🐒',
      'rabbit': '🐰',
      'horse': '🐎'
    };

    return emojiMap[englishName.toLowerCase()] || '🦁';
  }

  checkAnswer(selectedAnimal, card) {
    // Disable all options
    if (this.animalOptions) {
      this.animalOptions.iterate((child) => {
        if (child.disableInteractive) child.disableInteractive();
      });
    }

    if (selectedAnimal.kannada === this.currentItem.kannada) {
      this.onCorrect(card);
    } else {
      this.onIncorrect(card);
    }
  }

  onCorrect(card) {
    this.playCorrectFeedback();
    this.addScore(30);

    card.list[0].setFillStyle(0x4CAF50);

    // Celebration
    const { width, height } = this.cameras.main;
    const celebrate = this.add.text(width / 2, 200, '🎉 Correct!', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#4CAF50'
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      celebrate.destroy();
      this.presentAnimal();
    });
  }

  onIncorrect(card) {
    this.playIncorrectFeedback();
    this.loseLife();

    card.list[0].setFillStyle(0xF44336);

    this.cameras.main.shake(200, 0.01);

    this.time.delayedCall(1000, () => {
      if (this.lives > 0) {
        this.presentAnimal();
      }
    });
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
