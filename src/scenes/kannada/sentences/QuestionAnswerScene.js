import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * QuestionAnswerScene - Match questions with correct answers
 */
export class QuestionAnswerScene extends BaseGameScene {
  constructor() {
    super('QuestionAnswerScene', {
      lives: 3,
      timeLimit: 120
    });

    this.questionAnswerPairs = [];
    this.questions = [];
    this.answers = [];
    this.selectedQuestion = null;
    this.selectedAnswer = null;
    this.matchedPairs = [];
    this.pairsCompleted = 0;
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

    // Select Q&A pairs
    this.selectPairs();

    this.showInstructions(['Match questions with answers!', 'Click a question, then its answer']);
  }

  createBackground() {
    const { width, height } = this.cameras.main;

    // Purple gradient background
    this.add.rectangle(0, 0, width, height, 0x7B1FA2).setOrigin(0, 0);

    // Decorative elements
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(3, 8);

      const dot = this.add.circle(x, y, size, 0xFFFFFF, 0.3);

      this.tweens.add({
        targets: dot,
        alpha: 0.1,
        duration: Phaser.Math.Between(1000, 2000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  selectPairs() {
    const allPairs = this.sentencesData.questionAnswerPairs || [];
    const items = this.sentencesData.items;

    // Get available pairs based on difficulty
    let availablePairs = [];
    if (this.difficulty === 'beginner') {
      availablePairs = allPairs.filter(pair => {
        const q = items.find(i => i.id === pair.questionId);
        return q && q.difficulty === 'beginner';
      });
    } else {
      availablePairs = allPairs;
    }

    // Select 3-4 pairs
    Phaser.Utils.Array.Shuffle(availablePairs);
    this.questionAnswerPairs = availablePairs.slice(0, Math.min(4, availablePairs.length));

    if (this.questionAnswerPairs.length === 0) {
      this.endGame(false, 'No pairs available!');
      return;
    }

    this.loadRound();
  }

  onGameStart() {
    // Game starts automatically after loadRound
  }

  loadRound() {
    if (this.questionAnswerPairs.length === 0) {
      this.endGame(true, `Matched ${this.pairsCompleted} pairs!`);
      return;
    }

    // Clear previous round
    this.clearRound();

    // Take next 3 pairs
    const numPairs = Math.min(3, this.questionAnswerPairs.length);
    const currentPairs = this.questionAnswerPairs.splice(0, numPairs);

    // Get question and answer objects
    const items = this.sentencesData.items;
    this.questions = currentPairs.map(pair => {
      const q = items.find(i => i.id === pair.questionId);
      return { ...q, pairId: pair.questionId };
    });

    this.answers = currentPairs.map(pair => {
      const a = items.find(i => i.id === pair.answerId);
      return { ...a, pairId: pair.questionId };
    });

    // Shuffle answers
    Phaser.Utils.Array.Shuffle(this.answers);

    this.createQuestionCards();
    this.createAnswerCards();
  }

  clearRound() {
    if (this.questionCards) {
      this.questionCards.forEach(card => card.destroy());
    }
    if (this.answerCards) {
      this.answerCards.forEach(card => card.destroy());
    }
    this.questionCards = [];
    this.answerCards = [];
    this.selectedQuestion = null;
    this.selectedAnswer = null;
    this.matchedPairs = [];
  }

  createQuestionCards() {
    const { width, height } = this.cameras.main;
    const cardWidth = 250;
    const cardHeight = 100;
    const startY = 200;
    const spacing = 20;

    this.questionCards = [];

    this.questions.forEach((question, index) => {
      const x = width * 0.25;
      const y = startY + (index * (cardHeight + spacing));

      const card = this.createCard(x, y, cardWidth, cardHeight, question, '❓', 0x2196F3);
      card.isQuestion = true;
      card.pairId = question.pairId;

      card.on('pointerdown', () => this.selectQuestion(card));

      this.questionCards.push(card);
    });
  }

  createAnswerCards() {
    const { width, height } = this.cameras.main;
    const cardWidth = 250;
    const cardHeight = 100;
    const startY = 200;
    const spacing = 20;

    this.answerCards = [];

    this.answers.forEach((answer, index) => {
      const x = width * 0.75;
      const y = startY + (index * (cardHeight + spacing));

      const card = this.createCard(x, y, cardWidth, cardHeight, answer, '💬', 0x4CAF50);
      card.isAnswer = true;
      card.pairId = answer.pairId;

      card.on('pointerdown', () => this.selectAnswer(card));

      this.answerCards.push(card);
    });
  }

  createCard(x, y, width, height, sentenceData, icon, color) {
    const container = this.add.container(x, y);
    container.sentenceData = sentenceData;

    // Background
    const bg = this.add.rectangle(0, 0, width, height, color);
    bg.setStrokeStyle(3, 0xFFFFFF);
    container.bg = bg;

    // Icon
    const iconText = this.add.text(-width / 2 + 20, 0, icon, {
      fontSize: '32px'
    }).setOrigin(0, 0.5);

    // Kannada text
    const kannadaText = this.add.text(0, -15, sentenceData.sentence, {
      fontSize: '22px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFFFF',
      wordWrap: { width: width - 60 },
      align: 'center'
    }).setOrigin(0.5);

    // English text
    const englishText = this.add.text(0, 20, sentenceData.english, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#FFD700',
      wordWrap: { width: width - 60 },
      align: 'center'
    }).setOrigin(0.5);

    container.add([bg, iconText, kannadaText, englishText]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    return container;
  }

  selectQuestion(card) {
    if (this.matchedPairs.includes(card.pairId)) return;

    // Deselect previous
    if (this.selectedQuestion) {
      this.selectedQuestion.bg.setStrokeStyle(3, 0xFFFFFF);
    }

    this.selectedQuestion = card;
    card.bg.setStrokeStyle(5, 0xFFFF00);

    // Try to match if answer is selected
    if (this.selectedAnswer) {
      this.checkMatch();
    }
  }

  selectAnswer(card) {
    if (this.matchedPairs.includes(card.pairId)) return;

    // Deselect previous
    if (this.selectedAnswer) {
      this.selectedAnswer.bg.setStrokeStyle(3, 0xFFFFFF);
    }

    this.selectedAnswer = card;
    card.bg.setStrokeStyle(5, 0xFFFF00);

    // Try to match if question is selected
    if (this.selectedQuestion) {
      this.checkMatch();
    }
  }

  checkMatch() {
    if (!this.selectedQuestion || !this.selectedAnswer) return;

    const match = this.selectedQuestion.pairId === this.selectedAnswer.pairId;

    if (match) {
      this.onCorrectMatch();
    } else {
      this.onIncorrectMatch();
    }
  }

  onCorrectMatch() {
    this.audioManager.playCorrect();
    this.addScore(100);
    this.pairsCompleted++;
    this.updateProgressText();

    this.showFeedback('✅ Perfect Match!', '#4CAF50');

    // Mark as matched
    this.matchedPairs.push(this.selectedQuestion.pairId);

    // Fade out matched cards
    this.tweens.add({
      targets: [this.selectedQuestion, this.selectedAnswer],
      alpha: 0.3,
      scale: 0.95,
      duration: 300
    });

    // Reset selections
    this.selectedQuestion.bg.setStrokeStyle(3, 0x00FF00);
    this.selectedAnswer.bg.setStrokeStyle(3, 0x00FF00);
    this.selectedQuestion.disableInteractive();
    this.selectedAnswer.disableInteractive();

    this.selectedQuestion = null;
    this.selectedAnswer = null;

    // Check if round is complete
    if (this.matchedPairs.length === this.questions.length) {
      this.time.delayedCall(1500, () => {
        this.loadRound();
      });
    }
  }

  onIncorrectMatch() {
    this.audioManager.playWrong();
    this.loseLife();

    this.showFeedback('❌ Not a match!', '#F44336');

    // Shake effect
    this.tweens.add({
      targets: [this.selectedQuestion, this.selectedAnswer],
      x: '+=10',
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.selectedQuestion.x = this.cameras.main.width * 0.25;
        this.selectedAnswer.x = this.cameras.main.width * 0.75;
      }
    });

    // Reset selections after delay
    this.time.delayedCall(1000, () => {
      if (this.selectedQuestion) {
        this.selectedQuestion.bg.setStrokeStyle(3, 0xFFFFFF);
      }
      if (this.selectedAnswer) {
        this.selectedAnswer.bg.setStrokeStyle(3, 0xFFFFFF);
      }
      this.selectedQuestion = null;
      this.selectedAnswer = null;
    });
  }

  updateProgressText() {
    if (this.progressText) {
      this.progressText.setText(`Pairs: ${this.pairsCompleted}`);
    } else {
      this.progressText = this.add.text(20, 140, `Pairs: ${this.pairsCompleted}`, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
    }
  }
}
