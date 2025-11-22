import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * CompoundWordsScene - Combine two words to create compound words
 */
export class CompoundWordsScene extends BaseGameScene {
  constructor() {
    super('CompoundWordsScene', {
      lives: 5,
      timeLimit: 120
    });

    this.wordPairs = [];
    this.selectedWord1 = null;
    this.selectedWord2 = null;
    this.wordButtons = [];
  }

  preload() {
    super.preload();
    this.load.json('words', 'src/data/kannada/words.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.wordsData = this.cache.json.get('words');
    this.audioManager = new AudioManager(this);

    this.createGameBackground();
    this.createStandardUI();
    this.createCombiningArea();

    this.loadCompoundWords();
    this.presentWords();

    this.showInstructions('Combine two words to make a compound word!');
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;
    const bg = this.add.rectangle(0, 0, width, height, 0xFFF3E0).setOrigin(0, 0);

    // Decorative plus signs
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);

      const plus = this.add.text(x, y, '+', {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#FF9800',
        alpha: 0.2
      });
    }
  }

  createCombiningArea() {
    const { width, height } = this.cameras.main;

    // Area for combining words
    const area = this.add.rectangle(width / 2, height / 2, 600, 120, 0xFFFFFF);
    area.setStrokeStyle(3, 0xFF9800);

    // Word 1 zone
    const zone1 = this.add.rectangle(width / 2 - 150, height / 2, 200, 80, 0xFFF9C4);
    zone1.setStrokeStyle(2, 0xFF9800);
    this.add.text(width / 2 - 150, height / 2 - 60, 'Word 1', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#666666'
    }).setOrigin(0.5);

    // Plus sign
    this.add.text(width / 2, height / 2, '+', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#FF9800'
    }).setOrigin(0.5);

    // Word 2 zone
    const zone2 = this.add.rectangle(width / 2 + 150, height / 2, 200, 80, 0xFFF9C4);
    zone2.setStrokeStyle(2, 0xFF9800);
    this.add.text(width / 2 + 150, height / 2 - 60, 'Word 2', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#666666'
    }).setOrigin(0.5);

    // Result display
    this.resultText = this.add.text(width / 2, height / 2 + 100, '', {
      fontSize: '36px',
      fontFamily: 'Nudi, Arial',
      color: '#FF9800',
      backgroundColor: '#FFFFFF',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    this.zone1 = zone1;
    this.zone2 = zone2;
  }

  loadCompoundWords() {
    // Sample compound word data
    // In a real implementation, this would come from words.json
    this.compoundWords = [
      {
        word1: { kannada: 'ಕರೆ', english: 'call' },
        word2: { kannada: 'ಪತ್ರ', english: 'letter' },
        compound: { kannada: 'ಕರೆಪತ್ರ', english: 'invitation' }
      },
      {
        word1: { kannada: 'ಹಣ್ಣು', english: 'fruit' },
        word2: { kannada: 'ತೋಟ', english: 'garden' },
        compound: { kannada: 'ಹಣ್ಣುತೋಟ', english: 'orchard' }
      },
      {
        word1: { kannada: 'ಬೆಳಕು', english: 'light' },
        word2: { kannada: 'ಮನೆ', english: 'house' },
        compound: { kannada: 'ಬೆಳಕುಮನೆ', english: 'lighthouse' }
      }
    ];

    this.currentPair = Phaser.Utils.Array.GetRandom(this.compoundWords);
  }

  presentWords() {
    const { width, height } = this.cameras.main;

    // Clear previous buttons
    this.wordButtons.forEach(btn => btn.destroy());
    this.wordButtons = [];

    // Create word buttons
    const words = [
      this.currentPair.word1,
      this.currentPair.word2,
      { kannada: 'ಕಾಲು', english: 'leg' }, // Distractor
      { kannada: 'ಮರ', english: 'tree' }    // Distractor
    ];

    Phaser.Utils.Array.Shuffle(words);

    const startY = height - 200;
    const spacing = 150;

    words.forEach((word, index) => {
      const x = (width / 2) - ((words.length - 1) * spacing / 2) + (index * spacing);
      const button = this.createWordButton(x, startY, word);
      this.wordButtons.push(button);
    });
  }

  createWordButton(x, y, wordData) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 130, 70, 0x2196F3);
    bg.setStrokeStyle(3, 0xFFFFFF);

    const kannadaText = this.add.text(0, -10, wordData.kannada, {
      fontSize: '28px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    const englishText = this.add.text(0, 15, wordData.english, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#E3F2FD'
    }).setOrigin(0.5);

    container.add([bg, kannadaText, englishText]);
    container.setSize(130, 70);
    container.setInteractive({ useHandCursor: true });
    container.setData('word', wordData);

    container.on('pointerdown', () => {
      this.selectWord(container, wordData);
    });

    container.on('pointerover', () => {
      bg.setFillStyle(0x1976D2);
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 100
      });
    });

    container.on('pointerout', () => {
      bg.setFillStyle(0x2196F3);
      this.tweens.add({
        targets: container,
        scale: 1.0,
        duration: 100
      });
    });

    return container;
  }

  selectWord(button, wordData) {
    this.audioManager.playClick();

    if (!this.selectedWord1) {
      this.selectedWord1 = wordData;
      this.showWordInZone(wordData, this.zone1);
      button.list[0].setFillStyle(0x4CAF50);
    } else if (!this.selectedWord2) {
      this.selectedWord2 = wordData;
      this.showWordInZone(wordData, this.zone2);
      button.list[0].setFillStyle(0x4CAF50);
      this.checkCombination();
    }
  }

  showWordInZone(wordData, zone) {
    const text = this.add.text(zone.x, zone.y, wordData.kannada, {
      fontSize: '32px',
      fontFamily: 'Nudi, Arial',
      color: '#000000'
    }).setOrigin(0.5);

    if (zone === this.zone1) {
      if (this.zone1Text) this.zone1Text.destroy();
      this.zone1Text = text;
    } else {
      if (this.zone2Text) this.zone2Text.destroy();
      this.zone2Text = text;
    }
  }

  checkCombination() {
    const combined = this.selectedWord1.kannada + this.selectedWord2.kannada;
    const expectedCombined = this.currentPair.compound.kannada;

    // Show result
    this.resultText.setText(`= ${combined}`);

    this.time.delayedCall(500, () => {
      if (
        (this.selectedWord1.kannada === this.currentPair.word1.kannada &&
         this.selectedWord2.kannada === this.currentPair.word2.kannada) ||
        (this.selectedWord1.kannada === this.currentPair.word2.kannada &&
         this.selectedWord2.kannada === this.currentPair.word1.kannada)
      ) {
        this.onCorrect(combined);
      } else {
        this.onIncorrect();
      }
    });
  }

  onCorrect(combined) {
    this.playCorrectFeedback();
    this.addScore(30);

    const { width, height } = this.cameras.main;

    const feedback = this.add.text(width / 2, height / 2 + 150,
      `✓ Correct! ${this.currentPair.compound.english}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#4CAF50',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      feedback.destroy();
      this.resetRound();
    });
  }

  onIncorrect() {
    this.playIncorrectFeedback();
    this.loseLife();

    this.cameras.main.shake(200, 0.01);

    this.time.delayedCall(1000, () => {
      this.resetRound();
    });
  }

  resetRound() {
    this.selectedWord1 = null;
    this.selectedWord2 = null;
    this.resultText.setText('');

    if (this.zone1Text) this.zone1Text.destroy();
    if (this.zone2Text) this.zone2Text.destroy();

    if (this.lives > 0) {
      this.loadCompoundWords();
      this.presentWords();
    }
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
