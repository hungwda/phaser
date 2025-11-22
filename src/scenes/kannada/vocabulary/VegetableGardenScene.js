import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * VegetableGardenScene - Harvest vegetables while learning names
 */
export class VegetableGardenScene extends BaseGameScene {
  constructor() {
    super('VegetableGardenScene', { lives: 0, timeLimit: 90 });
    this.vegetables = [];
    this.vegetableSprites = [];
    this.harvested = 0;
    this.targetCount = 0;
  }

  preload() {
    super.preload();
    this.load.json('vegetables', 'src/data/kannada/vegetables.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.vegetablesData = this.cache.json.get('vegetables');
    this.vegetables = this.vegetablesData.items;
    this.targetCount = this.vegetables.length;

    this.audioManager = new AudioManager(this);
    this.audioManager.registerPronunciationsFromData(this.vegetables);

    // Garden background with soil and grass
    this.createGardenBackground();

    this.createStandardUI();
    this.scoreText.setText(`Harvested: 0/${this.targetCount}`);

    this.createVegetableSprites();
    this.showInstructions(['Harvest vegetables from the garden!', 'Learn the Kannada names']);
  }

  createGardenBackground() {
    const { width, height } = this.cameras.main;

    // Sky
    this.add.rectangle(0, 0, width, height / 2, 0x87CEEB).setOrigin(0, 0);

    // Grass/soil
    this.add.rectangle(0, height / 2, width, height / 2, 0x8B7355).setOrigin(0, 0);

    // Add grass texture at top of soil
    for (let i = 0; i < width; i += 30) {
      const grass = this.add.text(i, height / 2 - 10, '🌱', { fontSize: '20px' });
    }

    // Add some clouds
    this.createCloud(150, 100, 60);
    this.createCloud(450, 80, 70);
    this.createCloud(650, 120, 55);

    // Add a sun
    const sun = this.add.circle(700, 80, 35, 0xFFD700);
    this.tweens.add({
      targets: sun,
      scale: 1.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createCloud(x, y, width) {
    const cloud = this.add.container(x, y);
    const circles = [
      this.add.circle(-15, 0, 15, 0xFFFFFF, 0.8),
      this.add.circle(0, -5, 18, 0xFFFFFF, 0.8),
      this.add.circle(15, 0, 15, 0xFFFFFF, 0.8)
    ];
    cloud.add(circles);

    // Slow drift animation
    this.tweens.add({
      targets: cloud,
      x: x + 50,
      duration: 30000,
      yoyo: true,
      repeat: -1,
      ease: 'Linear'
    });
  }

  createVegetableSprites() {
    const { width, height } = this.cameras.main;

    // Create garden rows
    const positions = [
      { x: 150, y: 320 }, { x: 320, y: 300 }, { x: 490, y: 310 }, { x: 660, y: 290 },
      { x: 200, y: 420 }, { x: 370, y: 400 }, { x: 540, y: 410 },
      { x: 250, y: 520 }, { x: 420, y: 500 }, { x: 590, y: 510 }
    ];

    this.vegetables.forEach((vegetable, i) => {
      if (i >= positions.length) return;
      const pos = positions[i];
      const sprite = this.createVegetableSprite(vegetable, pos.x, pos.y);
      this.vegetableSprites.push(sprite);
    });
  }

  createVegetableSprite(vegetable, x, y) {
    const container = this.add.container(x, y);
    const emoji = this.getVegetableEmoji(vegetable.id);

    // Soil mound
    const soilMound = this.add.ellipse(0, 20, 70, 30, 0x6B4423, 0.7);

    // Vegetable with slight buried effect
    const vegText = this.add.text(0, 0, emoji, { fontSize: '52px' }).setOrigin(0.5);

    // Add some leaves/stems coming out
    const stem1 = this.add.text(-15, -20, '🌿', { fontSize: '20px' }).setAngle(-30);
    const stem2 = this.add.text(15, -20, '🌿', { fontSize: '20px' }).setAngle(30);

    container.add([soilMound, vegText, stem1, stem2]);
    container.setData('vegetable', vegetable);
    container.setData('harvested', false);

    container.setSize(80, 80).setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.harvestVegetable(container));

    // Subtle sway animation
    this.tweens.add({
      targets: [vegText, stem1, stem2],
      angle: vegText.angle + 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return container;
  }

  getVegetableEmoji(id) {
    const emojis = {
      veg_tomato: '🍅',
      veg_potato: '🥔',
      veg_onion: '🧅',
      veg_carrot: '🥕',
      veg_cauliflower: '🥦',
      veg_cabbage: '🥬',
      veg_brinjal: '🍆',
      veg_peas: '🫛',
      veg_spinach: '🥬',
      veg_radish: '🌰'
    };
    return emojis[id] || '🥕';
  }

  harvestVegetable(sprite) {
    if (sprite.getData('harvested')) return;

    sprite.setData('harvested', true);
    const vegetable = sprite.getData('vegetable');

    this.harvested++;
    this.addScore(15);
    this.playCorrectFeedback();

    this.audioManager.playWord(vegetable.kannada);

    // Show vegetable name in Kannada
    const nameLabel = this.add.text(sprite.x, sprite.y + 70, vegetable.kannada, {
      fontSize: '22px',
      fontFamily: 'Nudi, Arial',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Show English name below
    const englishLabel = this.add.text(sprite.x, sprite.y + 95, vegetable.english, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#666666',
      backgroundColor: '#FFFFCC',
      padding: { x: 8, y: 3 }
    }).setOrigin(0.5);

    // Harvest animation - pull up from ground
    this.tweens.add({
      targets: sprite,
      y: sprite.y - 100,
      angle: Phaser.Math.Between(-20, 20),
      duration: 400,
      ease: 'Back.easeOut'
    });

    this.tweens.add({
      targets: sprite,
      alpha: 0,
      delay: 400,
      duration: 300
    });

    // Create dirt particles
    this.createDirtParticles(sprite.x, sprite.y);

    this.scoreText.setText(`Harvested: ${this.harvested}/${this.targetCount}`);

    if (this.harvested >= this.targetCount) {
      this.time.delayedCall(1000, () => this.endGame(true, 'All vegetables harvested!'));
    }
  }

  createDirtParticles(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Phaser.Math.Between(20, 50);
      const endX = x + Math.cos(angle) * distance;
      const endY = y + Math.sin(angle) * distance;

      const particle = this.add.circle(x, y, Phaser.Math.Between(3, 6), 0x6B4423, 0.8);

      this.tweens.add({
        targets: particle,
        x: endX,
        y: endY,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  onGameStart() {}
}
