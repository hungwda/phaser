import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';
import { WordCard } from '../../../components/educational/WordCard.js';

/**
 * FamilyTreeScene - Explore family members on a family tree
 */
export class FamilyTreeScene extends BaseGameScene {
  constructor() {
    super('FamilyTreeScene', { lives: 0, timeLimit: 0 });
    this.familyMembers = [];
    this.memberSprites = [];
    this.discovered = new Set();
    this.currentCard = null;
  }

  preload() {
    super.preload();
    this.load.json('family', 'src/data/kannada/family.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.familyData = this.cache.json.get('family');
    this.familyMembers = this.familyData.items;

    this.audioManager = new AudioManager(this);
    this.audioManager.registerPronunciationsFromData(this.familyMembers);

    // Create background
    this.createTreeBackground();

    this.createStandardUI();
    this.scoreText.setText(`Discovered: 0/${this.familyMembers.length}`);

    // Create family tree
    this.createFamilyTree();

    this.showInstructions(['Click family members to learn their names!', 'Explore the whole family tree']);
  }

  createTreeBackground() {
    const { width, height } = this.cameras.main;

    // Sky gradient background
    this.add.rectangle(0, 0, width, height, 0xE3F2FD).setOrigin(0, 0);

    // Ground
    this.add.rectangle(0, height - 100, width, 100, 0x8BC34A).setOrigin(0, 0);

    // Draw a large tree
    this.drawTree(width / 2, height - 100);
  }

  drawTree(x, y) {
    // Tree trunk
    const trunk = this.add.rectangle(x, y - 150, 60, 300, 0x795548);

    // Tree foliage (large green area)
    const foliage1 = this.add.circle(x, y - 280, 120, 0x4CAF50, 0.8);
    const foliage2 = this.add.circle(x - 80, y - 220, 100, 0x4CAF50, 0.8);
    const foliage3 = this.add.circle(x + 80, y - 220, 100, 0x4CAF50, 0.8);
    const foliage4 = this.add.circle(x, y - 180, 110, 0x66BB6A, 0.8);

    // Gentle sway animation
    this.tweens.add({
      targets: [foliage1, foliage2, foliage3, foliage4],
      x: '+=5',
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createFamilyTree() {
    const { width, height } = this.cameras.main;

    // Arrange family members in tree structure
    // Top level: Grandparents
    // Middle level: Parents, Uncle, Aunt
    // Bottom level: Siblings

    const treeLayout = {
      grandparents: [
        { member: this.getFamilyMember('family_grandfather'), x: width / 2 - 120, y: 180 },
        { member: this.getFamilyMember('family_grandmother'), x: width / 2 + 120, y: 180 }
      ],
      parents: [
        { member: this.getFamilyMember('family_father'), x: width / 2 - 150, y: 320 },
        { member: this.getFamilyMember('family_mother'), x: width / 2 + 150, y: 320 },
        { member: this.getFamilyMember('family_uncle'), x: 150, y: 320 },
        { member: this.getFamilyMember('family_aunt'), x: 650, y: 320 }
      ],
      siblings: [
        { member: this.getFamilyMember('family_brother'), x: width / 2 - 100, y: 480 },
        { member: this.getFamilyMember('family_sister'), x: width / 2 + 100, y: 480 }
      ]
    };

    // Draw connecting lines
    this.drawFamilyConnections();

    // Create member sprites
    Object.values(treeLayout).forEach(level => {
      level.forEach(({ member, x, y }) => {
        if (member) {
          const sprite = this.createFamilyMemberSprite(member, x, y);
          this.memberSprites.push(sprite);
        }
      });
    });
  }

  drawFamilyConnections() {
    const { width, height } = this.cameras.main;

    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0x8D6E63, 0.6);

    // Grandparents to parents
    graphics.lineBetween(width / 2 - 120, 220, width / 2 - 150, 280);
    graphics.lineBetween(width / 2 + 120, 220, width / 2 + 150, 280);

    // Parents to children
    graphics.lineBetween(width / 2 - 150, 360, width / 2 - 100, 440);
    graphics.lineBetween(width / 2 + 150, 360, width / 2 + 100, 440);

    // Horizontal lines
    graphics.lineBetween(width / 2 - 120, 220, width / 2 + 120, 220);
    graphics.lineBetween(width / 2 - 150, 320, width / 2 + 150, 320);
  }

  getFamilyMember(id) {
    return this.familyMembers.find(m => m.id === id);
  }

  createFamilyMemberSprite(member, x, y) {
    const container = this.add.container(x, y);
    const emoji = this.getFamilyEmoji(member.id);

    // Circle background
    const bg = this.add.circle(0, 0, 45, 0xFFFFFF, 0.9);
    bg.setStrokeStyle(4, 0x795548);

    // Emoji
    const emojiText = this.add.text(0, 0, emoji, { fontSize: '52px' }).setOrigin(0.5);

    // Question mark overlay (hidden when discovered)
    const questionMark = this.add.circle(0, 0, 45, 0x000000, 0.7);
    const questionText = this.add.text(0, 0, '?', {
      fontSize: '48px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    container.add([bg, emojiText, questionMark, questionText]);
    container.setData('member', member);
    container.setData('discovered', false);
    container.setData('questionMark', questionMark);
    container.setData('questionText', questionText);

    container.setSize(90, 90).setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.discoverMember(container));

    return container;
  }

  getFamilyEmoji(id) {
    const emojis = {
      family_mother: '👩',
      family_father: '👨',
      family_brother: '👦',
      family_sister: '👧',
      family_grandmother: '👵',
      family_grandfather: '👴',
      family_uncle: '👨‍🦱',
      family_aunt: '👩‍🦰'
    };
    return emojis[id] || '👤';
  }

  discoverMember(sprite) {
    const member = sprite.getData('member');
    const wasDiscovered = sprite.getData('discovered');

    if (!wasDiscovered) {
      sprite.setData('discovered', true);
      this.discovered.add(member.id);

      // Hide question mark
      const questionMark = sprite.getData('questionMark');
      const questionText = sprite.getData('questionText');

      this.tweens.add({
        targets: [questionMark, questionText],
        alpha: 0,
        duration: 300
      });

      this.addScore(15);
      this.playCorrectFeedback();

      this.scoreText.setText(`Discovered: ${this.discovered.size}/${this.familyMembers.length}`);

      // Check completion
      if (this.discovered.size >= this.familyMembers.length) {
        this.time.delayedCall(1000, () => this.endGame(true, 'Family tree complete!'));
      }
    }

    // Show word card
    this.showMemberCard(member);
  }

  showMemberCard(member) {
    // Remove previous card if exists
    if (this.currentCard) {
      this.currentCard.destroy();
    }

    const { width, height } = this.cameras.main;

    this.currentCard = new WordCard(this, width / 2, height - 120, {
      word: member,
      showKannada: true,
      showEnglish: true,
      showTransliteration: true,
      showAudio: true,
      width: 400,
      height: 100,
      onAudioClick: () => {
        this.audioManager.playWord(member.kannada);
      }
    });

    // Play audio automatically
    this.audioManager.playWord(member.kannada);
  }

  onGameStart() {}

  shutdown() {
    if (this.currentCard) {
      this.currentCard.destroy();
    }
    super.shutdown();
  }
}
