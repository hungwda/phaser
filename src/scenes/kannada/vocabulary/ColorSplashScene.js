import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * ColorSplashScene - Click and collect colors while learning names
 */
export class ColorSplashScene extends BaseGameScene {
  constructor() {
    super('ColorSplashScene', { lives: 0, timeLimit: 90 });
    this.colors = [];
    this.colorSprites = [];
    this.collected = 0;
    this.targetCount = 0;
  }

  preload() {
    super.preload();
    this.load.json('colors', 'src/data/kannada/colors.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.colorsData = this.cache.json.get('colors');
    this.colors = this.colorsData.items;
    this.targetCount = this.colors.length;

    this.audioManager = new AudioManager(this);
    this.audioManager.registerPronunciationsFromData(this.colors);

    // Create colorful gradient background
    this.add.rectangle(0, 0, width, height, 0xE8F5E9).setOrigin(0, 0);

    this.createStandardUI();
    this.scoreText.setText(`Collected: 0/${this.targetCount}`);

    this.createColorSprites();
    this.showInstructions(['Click on colors to collect them!', 'Learn the Kannada names']);
  }

  createColorSprites() {
    const { width, height } = this.cameras.main;
    const positions = [
      { x: 150, y: 200 }, { x: 350, y: 180 }, { x: 550, y: 220 },
      { x: 200, y: 350 }, { x: 400, y: 320 }, { x: 600, y: 360 },
      { x: 250, y: 480 }, { x: 450, y: 460 }, { x: 650, y: 440 },
      { x: 300, y: 550 }
    ];

    this.colors.forEach((color, i) => {
      if (i >= positions.length) return;
      const pos = positions[i];
      const sprite = this.createColorSprite(color, pos.x, pos.y);
      this.colorSprites.push(sprite);
    });
  }

  createColorSprite(color, x, y) {
    const container = this.add.container(x, y);

    // Create color circle with actual hex color
    const colorValue = parseInt(color.hexColor.replace('#', ''), 16);
    const circle = this.add.circle(0, 0, 45, colorValue, 1);

    // Add white border for visibility
    circle.setStrokeStyle(4, 0xFFFFFF);

    // Add shadow effect
    const shadow = this.add.circle(2, 2, 45, 0x000000, 0.3);

    container.add([shadow, circle]);
    container.setData('color', color);
    container.setData('collected', false);

    container.setSize(90, 90).setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.collectColor(container));

    // Gentle floating animation
    this.tweens.add({
      targets: container,
      y: y - 15,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtle rotation
    this.tweens.add({
      targets: container,
      angle: 10,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return container;
  }

  collectColor(sprite) {
    if (sprite.getData('collected')) return;

    sprite.setData('collected', true);
    const color = sprite.getData('color');

    this.collected++;
    this.addScore(15);
    this.playCorrectFeedback();

    this.audioManager.playWord(color.kannada);

    // Show color name in Kannada
    const nameLabel = this.add.text(sprite.x, sprite.y + 70, color.kannada, {
      fontSize: '22px',
      fontFamily: 'Nudi, Arial',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Show English name below
    const englishLabel = this.add.text(sprite.x, sprite.y + 95, color.english, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#666666',
      backgroundColor: '#FFFFFF',
      padding: { x: 8, y: 3 }
    }).setOrigin(0.5);

    // Splash effect - expand and fade
    this.tweens.add({
      targets: sprite,
      scale: 1.8,
      alpha: 0,
      duration: 600,
      ease: 'Power2'
    });

    // Create splash particles
    this.createSplashEffect(sprite.x, sprite.y, color.hexColor);

    this.scoreText.setText(`Collected: ${this.collected}/${this.targetCount}`);

    if (this.collected >= this.targetCount) {
      this.time.delayedCall(1000, () => this.endGame(true, 'All colors collected!'));
    }
  }

  createSplashEffect(x, y, hexColor) {
    const colorValue = parseInt(hexColor.replace('#', ''), 16);

    // Create multiple splash particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const distance = 60;
      const endX = x + Math.cos(angle) * distance;
      const endY = y + Math.sin(angle) * distance;

      const particle = this.add.circle(x, y, 8, colorValue, 0.8);

      this.tweens.add({
        targets: particle,
        x: endX,
        y: endY,
        alpha: 0,
        scale: 0.3,
        duration: 500,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  onGameStart() {}
}
