import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * FestivalFunScene - Learn about Kannada festivals and culture
 */
export class FestivalFunScene extends BaseGameScene {
  constructor() {
    super('FestivalFunScene', {
      lives: 5,
      timeLimit: 120
    });

    this.currentFestival = null;
    this.festivals = [];
  }

  preload() {
    super.preload();
    this.load.json('sentences', 'src/data/kannada/sentences.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.sentencesData = this.cache.json.get('sentences');
    this.audioManager = new AudioManager(this);

    this.loadFestivalData();

    this.createGameBackground();
    this.createStandardUI();

    this.presentFestival();
    this.showInstructions('Learn about Kannada festivals and traditions!');
  }

  loadFestivalData() {
    // Sample festival data
    this.festivals = [
      {
        name: 'ದಸರಾ',
        nameEnglish: 'Dasara',
        description: 'ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಹಬ್ಬ',
        descriptionEnglish: 'Major festival of Karnataka',
        symbols: ['🎊', '🎉', '🏰'],
        facts: [
          { kannada: 'ಮೈಸೂರು ದಸರಾ ಪ್ರಸಿದ್ಧ', english: 'Mysore Dasara is famous' },
          { kannada: 'ಹತ್ತು ದಿನಗಳ ಆಚರಣೆ', english: 'Ten days celebration' }
        ]
      },
      {
        name: 'ಉಗಾದಿ',
        nameEnglish: 'Ugadi',
        description: 'ಹೊಸ ವರ್ಷದ ಹಬ್ಬ',
        descriptionEnglish: 'New Year festival',
        symbols: ['🌺', '🥭', '🍃'],
        facts: [
          { kannada: 'ಬೇವು ಬೆಲ್ಲ ತಿನ್ನುತ್ತಾರೆ', english: 'People eat neem and jaggery' },
          { kannada: 'ಚೈತ್ರ ಮಾಸದ ಆರಂಭ', english: 'Beginning of Chaitra month' }
        ]
      },
      {
        name: 'ದೀಪಾವಳಿ',
        nameEnglish: 'Deepavali',
        description: 'ದೀಪಗಳ ಹಬ್ಬ',
        descriptionEnglish: 'Festival of lights',
        symbols: ['🪔', '✨', '🎆'],
        facts: [
          { kannada: 'ದೀಪಗಳನ್ನು ಬೆಳಗಿಸುತ್ತಾರೆ', english: 'Light lamps' },
          { kannada: 'ಪಟಾಕಿ ಸಿಡಿಸುತ್ತಾರೆ', english: 'Burst firecrackers' }
        ]
      }
    ];
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;

    // Festive gradient background
    const colors = [0xFF6F61, 0xFFD700, 0xFF1493, 0x9370DB];

    colors.forEach((color, index) => {
      const segment = this.add.rectangle(
        (width / colors.length) * index,
        0,
        width / colors.length,
        height,
        color,
        0.3
      ).setOrigin(0, 0);
    });

    // Decorative elements (fireworks, flowers)
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);

      const decoration = this.add.text(x, y,
        Phaser.Utils.Array.GetRandom(['✨', '🎊', '🌺', '💐', '🎆']), {
        fontSize: '32px',
        alpha: 0.5
      });

      // Floating animation
      this.tweens.add({
        targets: decoration,
        y: y - 20,
        alpha: 0.2,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  presentFestival() {
    const { width, height } = this.cameras.main;

    // Clear previous
    if (this.festivalCard) this.festivalCard.destroy();

    this.currentFestival = Phaser.Utils.Array.GetRandom(this.festivals);

    // Create festival card
    this.festivalCard = this.add.container(width / 2, height / 2 - 50);

    const cardBg = this.add.rectangle(0, 0, 700, 400, 0xFFFFFF, 0.95);
    cardBg.setStrokeStyle(4, 0xFF6F61);

    // Festival name
    const nameText = this.add.text(0, -160, this.currentFestival.name, {
      fontSize: '48px',
      fontFamily: 'Nudi, Arial',
      color: '#FF6F61',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const nameEngText = this.add.text(0, -110, this.currentFestival.nameEnglish, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#666666'
    }).setOrigin(0.5);

    // Symbols
    const symbolsText = this.currentFestival.symbols.join(' ');
    const symbols = this.add.text(0, -60, symbolsText, {
      fontSize: '48px'
    }).setOrigin(0.5);

    // Description
    const descText = this.add.text(0, -10, this.currentFestival.description, {
      fontSize: '24px',
      fontFamily: 'Nudi, Arial',
      color: '#000000',
      align: 'center'
    }).setOrigin(0.5);

    const descEngText = this.add.text(0, 25, `(${this.currentFestival.descriptionEnglish})`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#666666',
      align: 'center'
    }).setOrigin(0.5);

    // Facts
    const fact = Phaser.Utils.Array.GetRandom(this.currentFestival.facts);
    const factText = this.add.text(0, 80, `💡 ${fact.kannada}`, {
      fontSize: '20px',
      fontFamily: 'Nudi, Arial',
      color: '#333333',
      align: 'center',
      wordWrap: { width: 650 }
    }).setOrigin(0.5);

    const factEngText = this.add.text(0, 115, `(${fact.english})`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#999999',
      align: 'center'
    }).setOrigin(0.5);

    this.festivalCard.add([cardBg, nameText, nameEngText, symbols, descText, descEngText, factText, factEngText]);

    // Quiz button
    const quizBtn = this.add.text(0, 170, '📝 Quiz Me!', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#FF6F61',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    quizBtn.on('pointerdown', () => {
      this.showQuiz();
    });

    this.festivalCard.add(quizBtn);
  }

  showQuiz() {
    const { width, height } = this.cameras.main;

    // Quiz overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0, 0);
    overlay.setInteractive();

    const quizContainer = this.add.container(width / 2, height / 2);

    const quizBg = this.add.rectangle(0, 0, 650, 350, 0xFFFFFF);
    quizBg.setStrokeStyle(3, 0xFF6F61);

    // Quiz question
    const question = this.add.text(0, -130,
      `What is ${this.currentFestival.nameEnglish}?`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#000000',
      align: 'center'
    }).setOrigin(0.5);

    quizContainer.add([quizBg, question]);

    // Answer options
    const options = [
      this.currentFestival.descriptionEnglish,
      'A harvest festival',
      'A rain festival',
      'A dance festival'
    ];

    const uniqueOptions = [...new Set(options)].slice(0, 3);
    Phaser.Utils.Array.Shuffle(uniqueOptions);

    const correctIndex = uniqueOptions.indexOf(this.currentFestival.descriptionEnglish);

    uniqueOptions.forEach((option, index) => {
      const y = -40 + (index * 80);

      const btn = this.add.rectangle(0, y, 580, 65, 0xFF6F61);
      btn.setStrokeStyle(2, 0xFFFFFF);
      btn.setInteractive({ useHandCursor: true });

      const text = this.add.text(0, y, option, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        align: 'center',
        wordWrap: { width: 550 }
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        if (index === correctIndex) {
          this.onQuizCorrect(overlay, quizContainer);
        } else {
          this.onQuizIncorrect(overlay, quizContainer);
        }
      });

      quizContainer.add([btn, text]);
    });
  }

  onQuizCorrect(overlay, quizContainer) {
    this.playCorrectFeedback();
    this.addScore(40);

    overlay.destroy();
    quizContainer.destroy();

    this.time.delayedCall(1000, () => {
      this.presentFestival();
    });
  }

  onQuizIncorrect(overlay, quizContainer) {
    this.playIncorrectFeedback();
    this.loseLife();

    this.cameras.main.shake(200, 0.01);

    overlay.destroy();
    quizContainer.destroy();

    if (this.lives > 0) {
      this.time.delayedCall(1000, () => {
        this.presentFestival();
      });
    }
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
