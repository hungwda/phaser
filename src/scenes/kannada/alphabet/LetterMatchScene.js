import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';
import { Card } from '../../../components/ui/Card.js';

/**
 * LetterMatchScene - Memory matching game with Kannada letters
 */
export class LetterMatchScene extends BaseGameScene {
  constructor() {
    super('LetterMatchScene', {
      lives: 0,
      timeLimit: 120
    });

    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.totalPairs = 0;
    this.canFlip = true;
  }

  preload() {
    super.preload();
    this.load.json('alphabet', 'src/data/kannada/alphabet.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.alphabetData = this.cache.json.get('alphabet');
    this.audioManager = new AudioManager(this);
    this.registerPronunciations();

    // Background
    this.add.rectangle(0, 0, width, height, 0x37474F).setOrigin(0, 0);

    this.createStandardUI();
    this.updateMatchCounter();

    this.createCardGrid();
    this.showInstructions(['Match pairs of letters!', 'Click cards to flip them']);
  }

  registerPronunciations() {
    if (this.alphabetData) {
      this.audioManager.registerPronunciationsFromData(this.alphabetData.vowels);
      this.audioManager.registerPronunciationsFromData(this.alphabetData.consonants);
    }
  }

  createCardGrid() {
    const { width, height } = this.cameras.main;

    // Select letters based on difficulty
    let letterCount = 6; // 6 pairs = 12 cards
    if (this.difficulty === 'intermediate') letterCount = 8;
    if (this.difficulty === 'advanced') letterCount = 10;

    const allLetters = [...this.alphabetData.vowels];
    if (this.difficulty !== 'beginner') {
      allLetters.push(...this.alphabetData.consonants.slice(0, 3));
    }

    const selectedLetters = Phaser.Utils.Array.Shuffle(allLetters).slice(0, letterCount);
    this.totalPairs = selectedLetters.length;

    // Create pairs (duplicate each letter)
    const cardData = [];
    selectedLetters.forEach(letter => {
      cardData.push({ ...letter, pairId: letter.id });
      cardData.push({ ...letter, pairId: letter.id });
    });

    // Shuffle cards
    Phaser.Utils.Array.Shuffle(cardData);

    // Calculate grid layout
    const cols = 4;
    const rows = Math.ceil(cardData.length / cols);
    const cardWidth = 100;
    const cardHeight = 130;
    const spacing = 20;
    const gridWidth = cols * cardWidth + (cols - 1) * spacing;
    const gridHeight = rows * cardHeight + (rows - 1) * spacing;
    const startX = (width - gridWidth) / 2 + cardWidth / 2;
    const startY = 200;

    // Create cards
    cardData.forEach((letter, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + spacing);
      const y = startY + row * (cardHeight + spacing);

      const card = new Card(this, x, y, {
        width: cardWidth,
        height: cardHeight,
        frontContent: letter.letter,
        backContent: '?',
        frontColor: 0xFFFFFF,
        backColor: 0x2196F3,
        borderColor: 0x1565C0,
        contentType: 'text',
        data: letter,
        onClick: (card) => this.onCardClick(card)
      });

      this.cards.push(card);
    });
  }

  onCardClick(card) {
    if (!this.isGameActive || !this.canFlip || card.isFlipped || card.isMatched) {
      return;
    }

    // Add to flipped cards
    this.flippedCards.push(card);

    // Play audio
    const letterData = card.getData();
    this.audioManager.playLetter(letterData.letter);

    // Check if we have 2 cards flipped
    if (this.flippedCards.length === 2) {
      this.canFlip = false;
      this.time.delayedCall(800, () => this.checkMatch());
    }
  }

  checkMatch() {
    const [card1, card2] = this.flippedCards;
    const data1 = card1.getData();
    const data2 = card2.getData();

    if (data1.pairId === data2.pairId && card1 !== card2) {
      // Match found!
      this.handleMatch(card1, card2);
    } else {
      // No match
      this.handleMismatch(card1, card2);
    }

    this.flippedCards = [];
    this.canFlip = true;
  }

  handleMatch(card1, card2) {
    this.matchedPairs++;
    this.addScore(50);
    this.playCorrectFeedback();

    // Mark cards as matched
    card1.setMatched(true);
    card2.setMatched(true);

    // Celebration animation
    this.tweens.add({
      targets: [card1, card2],
      scale: 1.1,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.tweens.add({
          targets: [card1, card2],
          alpha: 0.4,
          duration: 300
        });
      }
    });

    // Create sparkle effect
    this.createSparkles(card1.x, card1.y);
    this.createSparkles(card2.x, card2.y);

    this.updateMatchCounter();

    // Check win condition
    if (this.matchedPairs >= this.totalPairs) {
      this.time.delayedCall(1000, () => {
        this.endGame(true, `All ${this.totalPairs} pairs matched!`);
      });
    }
  }

  handleMismatch(card1, card2) {
    this.addScore(-5);
    this.playIncorrectFeedback();

    // Shake animation
    this.tweens.add({
      targets: [card1, card2],
      x: '+=10',
      duration: 50,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        // Flip back
        card1.flip();
        card2.flip();
      }
    });
  }

  createSparkles(x, y) {
    const colors = [0xFFD700, 0xFFA500, 0xFF69B4, 0x00CED1];

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const distance = 40;
      const endX = x + Math.cos(angle) * distance;
      const endY = y + Math.sin(angle) * distance;

      const sparkle = this.add.star(x, y, 4, 3, 6, Phaser.Utils.Array.GetRandom(colors));

      this.tweens.add({
        targets: sparkle,
        x: endX,
        y: endY,
        alpha: 0,
        scale: 0.5,
        duration: 500,
        ease: 'Power2',
        onComplete: () => sparkle.destroy()
      });
    }
  }

  updateMatchCounter() {
    this.scoreText.setText(`Matches: ${this.matchedPairs}/${this.totalPairs}`);
  }

  onGameStart() {
    // Game starts immediately when instructions are dismissed
  }

  shutdown() {
    this.cards.forEach(card => card.destroy());
    this.cards = [];
    this.flippedCards = [];
    super.shutdown();
  }
}
