import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * BodyPartsRobotScene - Build a robot while learning body part names
 */
export class BodyPartsRobotScene extends BaseGameScene {
  constructor() {
    super('BodyPartsRobotScene', { lives: 0, timeLimit: 120 });
    this.bodyParts = [];
    this.partSprites = [];
    this.assembled = 0;
    this.targetCount = 0;
    this.robotContainer = null;
  }

  preload() {
    super.preload();
    this.load.json('body_parts', 'src/data/kannada/body_parts.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.bodyPartsData = this.cache.json.get('body_parts');
    this.bodyParts = this.bodyPartsData.items;
    this.targetCount = this.bodyParts.length;

    this.audioManager = new AudioManager(this);
    this.audioManager.registerPronunciationsFromData(this.bodyParts);

    // Workshop background
    this.createWorkshopBackground();

    this.createStandardUI();
    this.scoreText.setText(`Assembled: 0/${this.targetCount}`);

    // Create robot build area
    this.createRobotArea();

    // Create body part items
    this.createBodyPartSprites();

    this.showInstructions(['Click body parts to build the robot!', 'Learn Kannada names']);
  }

  createWorkshopBackground() {
    const { width, height } = this.cameras.main;

    // Dark blue workshop background
    this.add.rectangle(0, 0, width, height, 0x263238).setOrigin(0, 0);

    // Workshop floor
    this.add.rectangle(0, height - 100, width, 100, 0x37474F).setOrigin(0, 0);

    // Add some gears decoration
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, 150);
      const gear = this.add.text(x, y, '⚙️', { fontSize: '24px', alpha: 0.3 });

      this.tweens.add({
        targets: gear,
        angle: 360,
        duration: 5000,
        repeat: -1,
        ease: 'Linear'
      });
    }
  }

  createRobotArea() {
    const { width, height } = this.cameras.main;

    // Robot assembly platform
    const platformX = width / 2;
    const platformY = height / 2;

    this.robotContainer = this.add.container(platformX, platformY);

    // Platform base
    const platform = this.add.rectangle(0, 100, 200, 20, 0x455A64);
    platform.setStrokeStyle(2, 0x607D8B);

    // Initial robot frame (will fill as parts are added)
    const frameOutline = this.add.rectangle(0, 0, 150, 200, 0x000000, 0);
    frameOutline.setStrokeStyle(2, 0x78909C, 0.3);

    this.robotContainer.add([platform, frameOutline]);
  }

  createBodyPartSprites() {
    const { width, height } = this.cameras.main;

    // Arrange parts around the edges
    const positions = [
      { x: 150, y: 250 }, { x: 650, y: 250 },
      { x: 100, y: 380 }, { x: 700, y: 380 },
      { x: 150, y: 510 }, { x: 650, y: 510 },
      { x: 100, y: 200 }, { x: 700, y: 200 },
      { x: 400, y: 550 }, { x: 400, y: 150 }
    ];

    this.bodyParts.forEach((part, i) => {
      if (i >= positions.length) return;
      const pos = positions[i];
      const sprite = this.createBodyPartSprite(part, pos.x, pos.y);
      this.partSprites.push(sprite);
    });
  }

  createBodyPartSprite(part, x, y) {
    const container = this.add.container(x, y);
    const emoji = this.getBodyPartEmoji(part.id);

    // Part background
    const bg = this.add.circle(0, 0, 40, 0x546E7A, 0.8);
    bg.setStrokeStyle(3, 0x90CAF9);

    // Emoji representation
    const emojiText = this.add.text(0, 0, emoji, { fontSize: '48px' }).setOrigin(0.5);

    // Label
    const label = this.add.text(0, 55, part.english, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5);

    container.add([bg, emojiText, label]);
    container.setData('part', part);
    container.setData('assembled', false);

    container.setSize(80, 80).setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.assemblePart(container));

    // Gentle pulsing
    this.tweens.add({
      targets: bg,
      scale: 1.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return container;
  }

  getBodyPartEmoji(id) {
    const emojis = {
      body_head: '😊',
      body_eye: '👁️',
      body_nose: '👃',
      body_mouth: '👄',
      body_ear: '👂',
      body_hand: '✋',
      body_leg: '🦵',
      body_finger: '☝️',
      body_shoulder: '💪',
      body_stomach: '🫃'
    };
    return emojis[id] || '🤖';
  }

  assemblePart(sprite) {
    if (sprite.getData('assembled')) return;

    sprite.setData('assembled', true);
    const part = sprite.getData('part');

    this.assembled++;
    this.addScore(20);
    this.playCorrectFeedback();

    this.audioManager.playWord(part.kannada);

    // Show Kannada name
    const nameLabel = this.add.text(sprite.x, sprite.y + 85, part.kannada, {
      fontSize: '20px',
      fontFamily: 'Nudi, Arial',
      color: '#FFD700',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    // Animate part to robot
    const targetPos = this.getRobotPartPosition(part.id);

    this.tweens.add({
      targets: sprite,
      x: this.robotContainer.x + targetPos.x,
      y: this.robotContainer.y + targetPos.y,
      scale: 0.7,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        // Add to robot container
        this.addPartToRobot(part, targetPos);
      }
    });

    // Fade out label
    this.tweens.add({
      targets: nameLabel,
      alpha: 0,
      delay: 2000,
      duration: 500,
      onComplete: () => nameLabel.destroy()
    });

    this.scoreText.setText(`Assembled: ${this.assembled}/${this.targetCount}`);

    if (this.assembled >= this.targetCount) {
      this.time.delayedCall(1500, () => {
        this.animateCompleteRobot();
        this.endGame(true, 'Robot completed!');
      });
    }
  }

  getRobotPartPosition(partId) {
    const positions = {
      body_head: { x: 0, y: -80 },
      body_eye: { x: -15, y: -75 },
      body_nose: { x: 0, y: -65 },
      body_mouth: { x: 0, y: -55 },
      body_ear: { x: 25, y: -75 },
      body_hand: { x: -60, y: -20 },
      body_leg: { x: -30, y: 60 },
      body_finger: { x: -75, y: -10 },
      body_shoulder: { x: -45, y: -40 },
      body_stomach: { x: 0, y: 0 }
    };
    return positions[partId] || { x: 0, y: 0 };
  }

  addPartToRobot(part, position) {
    const emoji = this.getBodyPartEmoji(part.id);
    const robotPart = this.add.text(position.x, position.y, emoji, {
      fontSize: '36px'
    }).setOrigin(0.5);

    this.robotContainer.add(robotPart);

    // Sparkle effect
    this.createSparkles(this.robotContainer.x + position.x, this.robotContainer.y + position.y);
  }

  createSparkles(x, y) {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const distance = 30;
      const endX = x + Math.cos(angle) * distance;
      const endY = y + Math.sin(angle) * distance;

      const sparkle = this.add.star(x, y, 5, 3, 6, 0xFFD700);

      this.tweens.add({
        targets: sparkle,
        x: endX,
        y: endY,
        alpha: 0,
        scale: 0.3,
        duration: 400,
        ease: 'Power2',
        onComplete: () => sparkle.destroy()
      });
    }
  }

  animateCompleteRobot() {
    // Celebrate the completed robot
    this.tweens.add({
      targets: this.robotContainer,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    // Spin slightly
    this.tweens.add({
      targets: this.robotContainer,
      angle: 10,
      duration: 300,
      yoyo: true,
      repeat: 2
    });
  }

  onGameStart() {}
}
