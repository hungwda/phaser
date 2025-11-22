import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * FruitBasketScene - Click and collect fruits while learning names
 */
export class FruitBasketScene extends BaseGameScene {
  constructor() {
    super('FruitBasketScene', { lives: 0, timeLimit: 90 });
    this.fruits = [];
    this.fruitSprites = [];
    this.collected = 0;
    this.targetCount = 0;
  }

  preload() {
    super.preload();
    this.load.json('fruits', 'src/data/kannada/fruits.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.fruitsData = this.cache.json.get('fruits');
    this.fruits = this.fruitsData.items;
    this.targetCount = this.fruits.length;

    this.audioManager = new AudioManager(this);
    this.audioManager.registerPronunciationsFromData(this.fruits);

    this.add.rectangle(0, 0, width, height, 0x8FBC8F).setOrigin(0, 0);

    this.createStandardUI();
    this.scoreText.setText(`Collected: 0/${this.targetCount}`);

    this.createFruitSprites();
    this.showInstructions(['Click on fruits to collect them!', 'Learn the Kannada names']);
  }

  createFruitSprites() {
    const { width, height } = this.cameras.main;
    const positions = [
      { x: 150, y: 200 }, { x: 350, y: 180 }, { x: 550, y: 220 },
      { x: 200, y: 350 }, { x: 400, y: 320 }, { x: 600, y: 360 },
      { x: 250, y: 480 }, { x: 450, y: 460 }
    ];

    this.fruits.forEach((fruit, i) => {
      if (i >= positions.length) return;
      const pos = positions[i];
      const sprite = this.createFruitSprite(fruit, pos.x, pos.y);
      this.fruitSprites.push(sprite);
    });
  }

  createFruitSprite(fruit, x, y) {
    const container = this.add.container(x, y);
    const emoji = this.getFruitEmoji(fruit.id);

    const circle = this.add.circle(0, 0, 40, 0xFFFFFF, 0.9);
    circle.setStrokeStyle(3, 0xFF6B6B);

    const emojiText = this.add.text(0, 0, emoji, { fontSize: '48px' }).setOrigin(0.5);

    container.add([circle, emojiText]);
    container.setData('fruit', fruit);
    container.setData('collected', false);

    container.setSize(80, 80).setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.collectFruit(container));

    this.tweens.add({
      targets: container,
      y: y - 10,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return container;
  }

  getFruitEmoji(id) {
    const emojis = {
      fruit_apple: '🍎', fruit_banana: '🍌', fruit_mango: '🥭',
      fruit_orange: '🍊', fruit_grapes: '🍇', fruit_watermelon: '🍉',
      fruit_papaya: '🍈', fruit_pineapple: '🍍'
    };
    return emojis[id] || '🍎';
  }

  collectFruit(sprite) {
    if (sprite.getData('collected')) return;

    sprite.setData('collected', true);
    const fruit = sprite.getData('fruit');

    this.collected++;
    this.addScore(15);
    this.playCorrectFeedback();

    this.audioManager.playWord(fruit.kannada);

    const nameLabel = this.add.text(sprite.x, sprite.y + 60, fruit.kannada, {
      fontSize: '20px',
      fontFamily: 'Nudi, Arial',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: sprite,
      scale: 0,
      angle: 360,
      duration: 500,
      onComplete: () => sprite.setAlpha(0.3)
    });

    this.scoreText.setText(`Collected: ${this.collected}/${this.targetCount}`);

    if (this.collected >= this.targetCount) {
      this.time.delayedCall(1000, () => this.endGame(true, 'All fruits collected!'));
    }
  }

  onGameStart() {}
}
