import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * StorySequencerScene - Arrange sentences in correct order to tell a story
 */
export class StorySequencerScene extends BaseGameScene {
  constructor() {
    super('StorySequencerScene', {
      lives: 3,
      timeLimit: 150
    });

    this.stories = [];
    this.currentStory = null;
    this.sentenceCards = [];
    this.dropZones = [];
    this.placedSentences = [];
    this.storiesCompleted = 0;
  }

  preload() {
    super.preload();
    this.load.json('stories', 'src/data/kannada/stories.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.storiesData = this.cache.json.get('stories');
    this.audioManager = new AudioManager(this);

    // Background
    this.createBackground();

    this.createStandardUI();
    this.updateProgressText();

    // Select story pool
    this.selectStoryPool();

    this.showInstructions(['Arrange sentences in order!', 'Tell the story correctly']);
  }

  createBackground() {
    const { width, height } = this.cameras.main;

    // Book/library theme
    this.add.rectangle(0, 0, width, height, 0x8B4513).setOrigin(0, 0);

    // Book page
    this.add.rectangle(width / 2, height / 2, width - 100, height - 100, 0xFFF8DC, 0.9).setOrigin(0.5);

    // Page lines
    for (let i = 0; i < 10; i++) {
      const y = 200 + (i * 40);
      this.add.line(0, y, 100, 0, width - 100, 0, 0xCCCCCC, 0.3).setOrigin(0);
    }

    // Book spine decoration
    this.add.rectangle(50, height / 2, 20, height - 100, 0x654321).setOrigin(0.5);
    this.add.rectangle(width - 50, height / 2, 20, height - 100, 0x654321).setOrigin(0.5);
  }

  selectStoryPool() {
    const allStories = this.storiesData.items;
    if (this.difficulty === 'beginner') {
      this.stories = allStories.filter(s => s.difficulty === 'beginner');
    } else if (this.difficulty === 'intermediate') {
      this.stories = allStories.filter(s => s.difficulty === 'beginner' || s.difficulty === 'intermediate');
    } else {
      this.stories = allStories;
    }

    Phaser.Utils.Array.Shuffle(this.stories);
  }

  onGameStart() {
    this.loadNextStory();
  }

  loadNextStory() {
    if (this.stories.length === 0) {
      this.endGame(true, `Completed ${this.storiesCompleted} stories!`);
      return;
    }

    // Clear previous story
    this.clearCurrentStory();

    this.currentStory = this.stories.shift();
    this.placedSentences = new Array(this.currentStory.sentences.length).fill(null);

    this.createStoryTitle();
    this.createDropZones();
    this.createSentenceCards();
  }

  clearCurrentStory() {
    this.sentenceCards.forEach(card => card.destroy());
    this.dropZones.forEach(zone => {
      if (zone.text) zone.text.destroy();
      if (zone.rect) zone.rect.destroy();
      zone.destroy();
    });
    this.sentenceCards = [];
    this.dropZones = [];

    if (this.titleText) this.titleText.destroy();
    if (this.titleKannada) this.titleKannada.destroy();
  }

  createStoryTitle() {
    const { width } = this.cameras.main;

    // Story title
    this.titleKannada = this.add.text(width / 2, 170, this.currentStory.title, {
      fontSize: '32px',
      fontFamily: 'Nudi, Arial',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.titleText = this.add.text(width / 2, 210, this.currentStory.titleEnglish, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#666666'
    }).setOrigin(0.5);
  }

  createDropZones() {
    const { width, height } = this.cameras.main;
    const numSentences = this.currentStory.sentences.length;
    const zoneHeight = 70;
    const spacing = 10;
    const startY = 260;

    for (let i = 0; i < numSentences; i++) {
      const y = startY + (i * (zoneHeight + spacing));

      // Drop zone
      const zone = this.add.zone(width / 2, y, 600, zoneHeight).setRectangleDropZone(600, zoneHeight);
      zone.index = i;

      // Visual rectangle
      const rect = this.add.rectangle(width / 2, y, 600, zoneHeight, 0xFFFFFF, 0.3);
      rect.setStrokeStyle(2, 0x000000, 0.3);
      zone.rect = rect;

      // Order number
      this.add.text(width / 2 - 320, y, `${i + 1}.`, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      this.dropZones.push(zone);
    }
  }

  createSentenceCards() {
    const { width, height } = this.cameras.main;

    // Shuffle sentences
    const shuffledSentences = [...this.currentStory.sentences];
    Phaser.Utils.Array.Shuffle(shuffledSentences);

    const cardWidth = 550;
    const cardHeight = 60;
    const spacing = 10;
    const startY = height - 200;

    shuffledSentences.forEach((sentence, index) => {
      const x = width / 2;
      const y = startY + (index * (cardHeight + spacing));

      const card = this.createSentenceCard(x, y, cardWidth, cardHeight, sentence);
      this.sentenceCards.push(card);
    });

    // Setup drop event
    this.input.on('drop', (pointer, gameObject, dropZone) => {
      this.handleDrop(gameObject, dropZone);
    });
  }

  createSentenceCard(x, y, width, height, sentence) {
    const container = this.add.container(x, y);
    container.sentence = sentence;
    container.originalX = x;
    container.originalY = y;

    // Background
    const bg = this.add.rectangle(0, 0, width, height, 0x4CAF50);
    bg.setStrokeStyle(3, 0x2E7D32);

    // Kannada text
    const kannadaText = this.add.text(-width / 2 + 10, -10, sentence.text, {
      fontSize: '20px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFFFF',
      wordWrap: { width: width - 20 }
    }).setOrigin(0, 0.5);

    // English text
    const englishText = this.add.text(-width / 2 + 10, 15, sentence.english, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#FFD700',
      wordWrap: { width: width - 20 }
    }).setOrigin(0, 0.5);

    container.add([bg, kannadaText, englishText]);
    container.setSize(width, height);
    container.setInteractive({ draggable: true, useHandCursor: true });

    // Drag events
    container.on('dragstart', () => {
      container.setScale(1.05);
      container.setDepth(100);
    });

    container.on('drag', (pointer, dragX, dragY) => {
      container.x = dragX;
      container.y = dragY;
    });

    container.on('dragend', (pointer, dragX, dragY, dropped) => {
      container.setScale(1.0);
      container.setDepth(1);

      if (!dropped) {
        // Return to original position
        this.tweens.add({
          targets: container,
          x: container.originalX,
          y: container.originalY,
          duration: 200
        });
      }
    });

    return container;
  }

  handleDrop(card, dropZone) {
    const zoneIndex = dropZone.index;

    // Remove card from previous position if exists
    const prevIndex = this.placedSentences.indexOf(card);
    if (prevIndex !== -1) {
      this.placedSentences[prevIndex] = null;
      if (this.dropZones[prevIndex].text) {
        this.dropZones[prevIndex].text.destroy();
        this.dropZones[prevIndex].text = null;
      }
    }

    // If zone already has a card, swap them
    if (this.placedSentences[zoneIndex]) {
      const existingCard = this.placedSentences[zoneIndex];
      this.returnCardToPool(existingCard);
    }

    // Place card in zone
    this.placedSentences[zoneIndex] = card;
    card.x = dropZone.x;
    card.y = dropZone.y;

    // Hide the original card
    card.setVisible(false);

    // Add text in zone
    if (dropZone.text) dropZone.text.destroy();

    const textContainer = this.add.container(dropZone.x, dropZone.y);
    const kannadaText = this.add.text(-280, -10, card.sentence.text, {
      fontSize: '18px',
      fontFamily: 'Nudi, Arial',
      color: '#000000',
      wordWrap: { width: 550 }
    }).setOrigin(0, 0.5);

    const englishText = this.add.text(-280, 15, card.sentence.english, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#666666',
      wordWrap: { width: 550 }
    }).setOrigin(0, 0.5);

    textContainer.add([kannadaText, englishText]);
    dropZone.text = textContainer;

    // Check if story is complete
    if (this.placedSentences.every(s => s !== null)) {
      this.checkStory();
    }
  }

  returnCardToPool(card) {
    card.setVisible(true);
    this.tweens.add({
      targets: card,
      x: card.originalX,
      y: card.originalY,
      duration: 200
    });
  }

  checkStory() {
    const placedOrder = this.placedSentences.map(card => card.sentence.order);
    const correctOrder = this.currentStory.sentences.map(s => s.order).sort((a, b) => a - b);

    const isCorrect = placedOrder.every((order, index) => order === correctOrder[index]);

    this.time.delayedCall(300, () => {
      if (isCorrect) {
        this.onCorrectStory();
      } else {
        this.onIncorrectStory();
      }
    });
  }

  onCorrectStory() {
    this.audioManager.playCorrect();
    this.addScore(150);
    this.storiesCompleted++;
    this.updateProgressText();

    this.showFeedback('✅ Perfect Story!', '#4CAF50');

    // Highlight zones in green
    this.dropZones.forEach(zone => {
      zone.rect.setFillStyle(0x4CAF50, 0.3);
    });

    this.time.delayedCall(2000, () => {
      this.loadNextStory();
    });
  }

  onIncorrectStory() {
    this.audioManager.playWrong();
    this.loseLife();

    this.showFeedback('❌ Wrong order! Try again!', '#F44336');

    // Shake effect
    this.dropZones.forEach(zone => {
      this.tweens.add({
        targets: [zone.rect, zone.text],
        x: zone.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          if (zone.rect) zone.rect.x = zone.x;
          if (zone.text) zone.text.x = zone.x;
        }
      });
    });

    // Clear after delay
    this.time.delayedCall(1500, () => {
      this.clearPlacedSentences();
    });
  }

  clearPlacedSentences() {
    this.dropZones.forEach(zone => {
      if (zone.text) {
        zone.text.destroy();
        zone.text = null;
      }
      zone.rect.setFillStyle(0xFFFFFF, 0.3);
    });

    this.placedSentences.forEach(card => {
      if (card) {
        this.returnCardToPool(card);
      }
    });

    this.placedSentences = new Array(this.currentStory.sentences.length).fill(null);
  }

  updateProgressText() {
    if (this.progressText) {
      this.progressText.setText(`Stories: ${this.storiesCompleted}`);
    } else {
      this.progressText = this.add.text(20, 140, `Stories: ${this.storiesCompleted}`, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#000000',
        backgroundColor: '#FFFFFF',
        padding: { x: 10, y: 5 }
      });
    }
  }
}
