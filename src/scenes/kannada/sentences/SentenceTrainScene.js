import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * SentenceTrainScene - Arrange word cards to form correct sentences
 */
export class SentenceTrainScene extends BaseGameScene {
  constructor() {
    super('SentenceTrainScene', {
      lives: 3,
      timeLimit: 120
    });

    this.sentences = [];
    this.currentSentence = null;
    this.wordTiles = [];
    this.dropZones = [];
    this.placedWords = [];
    this.sentencesCompleted = 0;
  }

  preload() {
    super.preload();
    this.load.json('sentences', 'src/data/kannada/sentences.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.sentencesData = this.cache.json.get('sentences');
    this.audioManager = new AudioManager(this);

    // Background
    this.createBackground();

    this.createStandardUI();
    this.updateProgressText();

    // Select sentence pool based on difficulty
    this.selectSentencePool();

    this.showInstructions(['Drag words to form the sentence!', 'Follow the English translation']);
  }

  createBackground() {
    const { width, height } = this.cameras.main;

    // Sky blue gradient background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0, 0);

    // Train tracks
    const trackY = height - 150;
    this.add.rectangle(0, trackY, width, 100, 0x8B4513, 0.6).setOrigin(0, 0);

    // Railway ties
    for (let i = 0; i < 20; i++) {
      this.add.rectangle(i * 60, trackY + 30, 40, 10, 0x654321, 0.8);
    }

    // Rails
    this.add.rectangle(0, trackY + 20, width, 8, 0x696969);
    this.add.rectangle(0, trackY + 60, width, 8, 0x696969);
  }

  selectSentencePool() {
    const allSentences = this.sentencesData.items.filter(s => s.type === 'statement');
    if (this.difficulty === 'beginner') {
      this.sentences = allSentences.filter(s => s.difficulty === 'beginner');
    } else if (this.difficulty === 'intermediate') {
      this.sentences = allSentences.filter(s => s.difficulty === 'beginner' || s.difficulty === 'intermediate');
    } else {
      this.sentences = allSentences;
    }

    Phaser.Utils.Array.Shuffle(this.sentences);
  }

  onGameStart() {
    this.loadNextSentence();
  }

  loadNextSentence() {
    if (this.sentences.length === 0) {
      this.endGame(true, `Completed ${this.sentencesCompleted} sentences!`);
      return;
    }

    // Clear previous sentence
    this.clearCurrentSentence();

    this.currentSentence = this.sentences.shift();
    this.placedWords = new Array(this.currentSentence.words.length).fill(null);

    this.createSentenceDisplay();
    this.createDropZones();
    this.createWordTiles();
  }

  clearCurrentSentence() {
    this.wordTiles.forEach(tile => tile.destroy());
    this.dropZones.forEach(zone => {
      if (zone.text) zone.text.destroy();
      zone.destroy();
    });
    this.wordTiles = [];
    this.dropZones = [];

    if (this.hintText) this.hintText.destroy();
    if (this.trainEngine) this.trainEngine.destroy();
  }

  createSentenceDisplay() {
    const { width } = this.cameras.main;

    // Show English translation as hint
    this.hintText = this.add.text(width / 2, 180, `Form: "${this.currentSentence.english}"`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#000000',
      backgroundColor: '#FFD700',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    // Train engine emoji
    this.trainEngine = this.add.text(100, this.cameras.main.height - 140, '🚂', {
      fontSize: '64px'
    }).setOrigin(0.5);
  }

  createDropZones() {
    const { width, height } = this.cameras.main;
    const zoneY = height - 250;
    const numWords = this.currentSentence.words.length;
    const zoneWidth = 150;
    const spacing = 20;
    const totalWidth = (numWords * zoneWidth) + ((numWords - 1) * spacing);
    const startX = (width - totalWidth) / 2;

    for (let i = 0; i < numWords; i++) {
      const x = startX + (i * (zoneWidth + spacing)) + zoneWidth / 2;

      // Drop zone
      const zone = this.add.zone(x, zoneY, zoneWidth, 80).setRectangleDropZone(zoneWidth, 80);
      zone.index = i;

      // Visual rectangle
      const rect = this.add.rectangle(x, zoneY, zoneWidth, 80, 0xFFFFFF, 0.3);
      rect.setStrokeStyle(3, 0x000000, 0.5);
      zone.rect = rect;

      // Number label
      this.add.text(x, zoneY + 50, `${i + 1}`, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#000000'
      }).setOrigin(0.5);

      this.dropZones.push(zone);
    }
  }

  createWordTiles() {
    const { width } = this.cameras.main;

    // Shuffle the words for challenge
    const shuffledWords = [...this.currentSentence.words];
    Phaser.Utils.Array.Shuffle(shuffledWords);

    const tileWidth = 140;
    const spacing = 15;
    const totalWidth = (shuffledWords.length * tileWidth) + ((shuffledWords.length - 1) * spacing);
    const startX = (width - totalWidth) / 2;
    const startY = 350;

    shuffledWords.forEach((word, index) => {
      const x = startX + (index * (tileWidth + spacing)) + tileWidth / 2;

      // Word tile container
      const tile = this.add.container(x, startY);
      tile.wordText = word;
      tile.originalIndex = this.currentSentence.words.indexOf(word);

      // Background
      const bg = this.add.rectangle(0, 0, tileWidth, 70, 0x4CAF50);
      bg.setStrokeStyle(3, 0x2E7D32);

      // Word text
      const text = this.add.text(0, 0, word, {
        fontSize: '24px',
        fontFamily: 'Nudi, Arial',
        color: '#FFFFFF',
        wordWrap: { width: tileWidth - 10 },
        align: 'center'
      }).setOrigin(0.5);

      tile.add([bg, text]);
      tile.setSize(tileWidth, 70);
      tile.setInteractive({ draggable: true, useHandCursor: true });

      // Drag events
      tile.on('dragstart', () => {
        tile.setScale(1.1);
        tile.setDepth(100);
      });

      tile.on('drag', (pointer, dragX, dragY) => {
        tile.x = dragX;
        tile.y = dragY;
      });

      tile.on('dragend', (pointer, dragX, dragY, dropped) => {
        tile.setScale(1.0);
        tile.setDepth(1);

        if (!dropped) {
          // Return to original position
          this.tweens.add({
            targets: tile,
            x: x,
            y: startY,
            duration: 200
          });
        }
      });

      tile.on('drop', (pointer, dropZone) => {
        this.handleDrop(tile, dropZone);
      });

      this.wordTiles.push(tile);
    });

    // Setup drop zones
    this.input.on('drop', (pointer, gameObject, dropZone) => {
      this.handleDrop(gameObject, dropZone);
    });
  }

  handleDrop(tile, dropZone) {
    const zoneIndex = dropZone.index;

    // Remove word from previous position if exists
    const prevIndex = this.placedWords.indexOf(tile);
    if (prevIndex !== -1) {
      this.placedWords[prevIndex] = null;
      if (this.dropZones[prevIndex].text) {
        this.dropZones[prevIndex].text.destroy();
        this.dropZones[prevIndex].text = null;
      }
    }

    // If zone already has a word, swap them
    if (this.placedWords[zoneIndex]) {
      const existingTile = this.placedWords[zoneIndex];
      this.returnTileToPool(existingTile);
    }

    // Place word in zone
    this.placedWords[zoneIndex] = tile;
    tile.x = dropZone.x;
    tile.y = dropZone.y - 100;

    // Add word text in zone
    if (dropZone.text) dropZone.text.destroy();
    dropZone.text = this.add.text(dropZone.x, dropZone.y, tile.wordText, {
      fontSize: '24px',
      fontFamily: 'Nudi, Arial',
      color: '#000000',
      wordWrap: { width: 140 },
      align: 'center'
    }).setOrigin(0.5);

    // Hide the tile
    tile.setVisible(false);

    // Check if sentence is complete
    if (this.placedWords.every(w => w !== null)) {
      this.checkSentence();
    }
  }

  returnTileToPool(tile) {
    // Find original position
    const index = this.wordTiles.indexOf(tile);
    const { width } = this.cameras.main;
    const tileWidth = 140;
    const spacing = 15;
    const totalWidth = (this.wordTiles.length * tileWidth) + ((this.wordTiles.length - 1) * spacing);
    const startX = (width - totalWidth) / 2;
    const x = startX + (index * (tileWidth + spacing)) + tileWidth / 2;

    tile.setVisible(true);
    this.tweens.add({
      targets: tile,
      x: x,
      y: 350,
      duration: 200
    });
  }

  checkSentence() {
    const formedSentence = this.placedWords.map(tile => tile.wordText).join(' ');
    const correctSentence = this.currentSentence.words.join(' ');

    this.time.delayedCall(300, () => {
      if (formedSentence === correctSentence) {
        this.onCorrectSentence();
      } else {
        this.onIncorrectSentence();
      }
    });
  }

  onCorrectSentence() {
    this.audioManager.playCorrect();
    this.addScore(100);
    this.sentencesCompleted++;
    this.updateProgressText();

    this.showFeedback('✅ Perfect!', '#4CAF50');

    // Animate train moving
    this.tweens.add({
      targets: this.trainEngine,
      x: this.cameras.main.width + 100,
      duration: 1000,
      ease: 'Linear',
      onComplete: () => {
        this.time.delayedCall(500, () => {
          this.loadNextSentence();
        });
      }
    });
  }

  onIncorrectSentence() {
    this.audioManager.playWrong();
    this.loseLife();

    this.showFeedback('❌ Try again!', '#F44336');

    // Shake effect
    this.dropZones.forEach(zone => {
      this.tweens.add({
        targets: zone.rect,
        x: zone.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 3
      });

      if (zone.text) {
        this.tweens.add({
          targets: zone.text,
          x: zone.x + 10,
          duration: 50,
          yoyo: true,
          repeat: 3
        });
      }
    });

    // Clear after delay
    this.time.delayedCall(1500, () => {
      this.clearPlacedWords();
    });
  }

  clearPlacedWords() {
    this.dropZones.forEach(zone => {
      if (zone.text) {
        zone.text.destroy();
        zone.text = null;
      }
    });

    this.placedWords.forEach(tile => {
      if (tile) {
        this.returnTileToPool(tile);
      }
    });

    this.placedWords = new Array(this.currentSentence.words.length).fill(null);
  }

  updateProgressText() {
    if (this.progressText) {
      this.progressText.setText(`Sentences: ${this.sentencesCompleted}`);
    } else {
      this.progressText = this.add.text(20, 140, `Sentences: ${this.sentencesCompleted}`, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#000000',
        backgroundColor: '#FFFFFF',
        padding: { x: 10, y: 5 }
      });
    }
  }
}
