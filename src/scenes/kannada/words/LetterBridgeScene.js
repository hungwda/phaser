import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * LetterBridgeScene - Drag letters to spell words
 */
export class LetterBridgeScene extends BaseGameScene {
  constructor() {
    super('LetterBridgeScene', {
      lives: 3,
      timeLimit: 120
    });

    this.words = [];
    this.currentWord = null;
    this.letterTiles = [];
    this.dropZones = [];
    this.placedLetters = [];
    this.wordsCompleted = 0;
  }

  preload() {
    super.preload();
    this.load.json('words', 'src/data/kannada/words.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.wordsData = this.cache.json.get('words');
    this.audioManager = new AudioManager(this);
    this.registerPronunciations();

    // Background
    this.createBackground();

    this.createStandardUI();
    this.updateProgressText();

    // Select word pool based on difficulty
    this.selectWordPool();

    this.showInstructions(['Drag letters to spell the word!', 'Use the hint and picture']);
  }

  registerPronunciations() {
    if (this.wordsData) {
      this.audioManager.registerPronunciationsFromData(this.wordsData.items);
    }
  }

  createBackground() {
    const { width, height } = this.cameras.main;

    // Blue gradient background
    this.add.rectangle(0, 0, width, height, 0x1976D2).setOrigin(0, 0);

    // River/bridge theme
    const river = this.add.rectangle(0, height / 2 - 50, width, 200, 0x42A5F5, 0.6);

    // Add some waves
    for (let i = 0; i < 10; i++) {
      const wave = this.add.text(i * 80, height / 2 + Phaser.Math.Between(-50, 50), '〰️', {
        fontSize: '24px',
        alpha: 0.4
      });

      this.tweens.add({
        targets: wave,
        x: wave.x + 20,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  selectWordPool() {
    const allWords = this.wordsData.items;
    if (this.difficulty === 'beginner') {
      this.words = allWords.filter(w => w.difficulty === 'beginner');
    } else if (this.difficulty === 'intermediate') {
      this.words = allWords.filter(w => w.difficulty === 'beginner' || w.difficulty === 'intermediate');
    } else {
      this.words = allWords;
    }

    Phaser.Utils.Array.Shuffle(this.words);
  }

  onGameStart() {
    this.loadNextWord();
  }

  loadNextWord() {
    if (this.words.length === 0) {
      this.endGame(true, `Completed ${this.wordsCompleted} words!`);
      return;
    }

    // Clear previous word
    this.clearCurrentWord();

    this.currentWord = this.words.shift();
    this.placedLetters = new Array(this.currentWord.letters.length).fill(null);

    this.createWordDisplay();
    this.createDropZones();
    this.createLetterTiles();
  }

  clearCurrentWord() {
    this.letterTiles.forEach(tile => tile.destroy());
    this.dropZones.forEach(zone => zone.destroy());
    this.letterTiles = [];
    this.dropZones = [];

    if (this.hintText) this.hintText.destroy();
    if (this.imageDisplay) this.imageDisplay.destroy();
    if (this.wordDisplay) this.wordDisplay.destroy();
  }

  createWordDisplay() {
    const { width } = this.cameras.main;

    // Show hint
    this.hintText = this.add.text(width / 2, 180, `Spell: ${this.currentWord.english}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    // Hint description
    this.add.text(width / 2, 220, this.currentWord.hint, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#FFD700',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Show image placeholder (emoji or icon)
    const emoji = this.getWordEmoji(this.currentWord.id);
    this.imageDisplay = this.add.text(width / 2, 280, emoji, {
      fontSize: '64px'
    }).setOrigin(0.5);
  }

  getWordEmoji(id) {
    const emojis = {
      word_amma: '👩',
      word_appa: '👨',
      word_mara: '🌳',
      word_neer: '💧',
      word_huli: '🐅',
      word_hoo: '🌸',
      word_mane: '🏠',
      word_ball: '⚽',
      word_pustaka: '📚',
      word_school: '🏫'
    };
    return emojis[id] || '❓';
  }

  createDropZones() {
    const { width, height } = this.cameras.main;
    const letterCount = this.currentWord.letters.length;
    const zoneWidth = 80;
    const spacing = 10;
    const totalWidth = letterCount * zoneWidth + (letterCount - 1) * spacing;
    const startX = (width - totalWidth) / 2 + zoneWidth / 2;
    const y = height / 2;

    this.currentWord.letters.forEach((letter, index) => {
      const x = startX + index * (zoneWidth + spacing);
      const zone = this.createDropZone(x, y, index);
      this.dropZones.push(zone);
    });
  }

  createDropZone(x, y, index) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 75, 90, 0xFFFFFF, 0.3);
    bg.setStrokeStyle(3, 0xFFD700, 0.8);

    const indexLabel = this.add.text(0, -55, (index + 1).toString(), {
      fontSize: '16px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    container.add([bg, indexLabel]);
    container.setData('index', index);
    container.setData('filled', false);
    container.setSize(75, 90);

    return container;
  }

  createLetterTiles() {
    const { width, height } = this.cameras.main;

    // Create shuffled letters
    const letters = [...this.currentWord.letters];
    Phaser.Utils.Array.Shuffle(letters);

    const tileWidth = 75;
    const spacing = 15;
    const totalWidth = letters.length * tileWidth + (letters.length - 1) * spacing;
    const startX = (width - totalWidth) / 2 + tileWidth / 2;
    const y = height - 150;

    letters.forEach((letter, i) => {
      const x = startX + i * (tileWidth + spacing);
      const tile = this.createLetterTile(letter, x, y);
      this.letterTiles.push(tile);
    });
  }

  createLetterTile(letter, x, y) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 70, 85, 0x4CAF50, 1);
    bg.setStrokeStyle(3, 0xFFFFFF);

    const text = this.add.text(0, 0, letter, {
      fontSize: '48px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setData('letter', letter);
    container.setData('originalX', x);
    container.setData('originalY', y);
    container.setData('placed', false);

    container.setSize(70, 85);
    container.setInteractive({ useHandCursor: true, draggable: true });

    this.input.setDraggable(container);

    container.on('drag', (pointer, dragX, dragY) => {
      container.x = dragX;
      container.y = dragY;
    });

    container.on('dragend', (pointer) => {
      this.handleDrop(container);
    });

    return container;
  }

  handleDrop(tile) {
    const letter = tile.getData('letter');
    let dropped = false;

    // Check if dropped on any drop zone
    this.dropZones.forEach((zone, index) => {
      const bounds = zone.getBounds();
      const tileBounds = tile.getBounds();

      if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, tileBounds)) {
        // Check if zone already filled
        if (this.placedLetters[index]) {
          // Return existing tile to pool
          const existingTile = this.placedLetters[index];
          this.returnTileToPool(existingTile);
        }

        // Place new tile
        tile.x = zone.x;
        tile.y = zone.y;
        tile.setData('placed', true);
        tile.setData('zoneIndex', index);
        this.placedLetters[index] = tile;
        dropped = true;

        // Check if word is complete
        this.checkWord();
      }
    });

    if (!dropped) {
      // Return to original position
      this.returnTileToPool(tile);
    }
  }

  returnTileToPool(tile) {
    const originalX = tile.getData('originalX');
    const originalY = tile.getData('originalY');
    const zoneIndex = tile.getData('zoneIndex');

    if (zoneIndex !== undefined) {
      this.placedLetters[zoneIndex] = null;
    }

    this.tweens.add({
      targets: tile,
      x: originalX,
      y: originalY,
      duration: 200,
      ease: 'Power2'
    });

    tile.setData('placed', false);
    tile.setData('zoneIndex', undefined);
  }

  checkWord() {
    // Check if all positions filled
    if (this.placedLetters.some(tile => tile === null)) {
      return;
    }

    // Check if correct
    const spelledWord = this.placedLetters.map(tile => tile.getData('letter')).join('');
    const correctWord = this.currentWord.word;

    if (spelledWord === correctWord) {
      this.handleCorrectWord();
    } else {
      this.handleIncorrectWord();
    }
  }

  handleCorrectWord() {
    this.wordsCompleted++;
    this.addScore(50);
    this.playCorrectFeedback();

    // Play word audio
    this.audioManager.playWord(this.currentWord.kannada);

    // Celebration
    this.letterTiles.forEach(tile => {
      this.tweens.add({
        targets: tile,
        scale: 1.2,
        duration: 200,
        yoyo: true
      });
    });

    // Show complete word
    this.showCompleteWord();

    this.updateProgressText();

    // Load next word
    this.time.delayedCall(2000, () => this.loadNextWord());
  }

  handleIncorrectWord() {
    this.playIncorrectFeedback();
    this.loseLife();

    // Shake tiles
    this.placedLetters.forEach(tile => {
      if (tile) {
        this.tweens.add({
          targets: tile,
          x: tile.x + 5,
          duration: 50,
          yoyo: true,
          repeat: 3
        });
      }
    });

    // Return all tiles to pool
    this.time.delayedCall(500, () => {
      this.placedLetters.forEach(tile => {
        if (tile) {
          this.returnTileToPool(tile);
        }
      });
    });
  }

  showCompleteWord() {
    const { width, height } = this.cameras.main;

    const wordText = this.add.text(width / 2, height / 2 - 80, this.currentWord.word, {
      fontSize: '72px',
      fontFamily: 'Nudi, Arial',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: wordText,
      alpha: 1,
      scale: 1.2,
      duration: 500,
      ease: 'Back.easeOut'
    });

    this.tweens.add({
      targets: wordText,
      alpha: 0,
      delay: 1500,
      duration: 500,
      onComplete: () => wordText.destroy()
    });
  }

  updateProgressText() {
    this.scoreText.setText(`Words: ${this.wordsCompleted}`);
  }

  shutdown() {
    this.clearCurrentWord();
    super.shutdown();
  }
}
