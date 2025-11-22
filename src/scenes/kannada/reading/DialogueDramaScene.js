import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * DialogueDramaScene - Interactive dialogue practice
 */
export class DialogueDramaScene extends BaseGameScene {
  constructor() {
    super('DialogueDramaScene', {
      lives: 5,
      timeLimit: 120
    });

    this.currentDialogue = null;
    this.dialogueIndex = 0;
    this.characters = [];
  }

  preload() {
    super.preload();
    this.load.json('sentences', 'src/data/kannada/sentences.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.sentencesData = this.cache.json.get('sentences');
    this.audioManager = new AudioManager(this);

    this.createGameBackground();
    this.createStandardUI();
    this.createStage();

    this.loadDialogue();
    this.showInstructions('Practice dialogues! Choose the correct response.');
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;

    // Stage background
    const bg = this.add.rectangle(0, 0, width, height, 0x2C1810).setOrigin(0, 0);

    // Stage floor
    const stage = this.add.rectangle(0, height - 150, width, 150, 0x8B4513).setOrigin(0, 0);

    // Curtains
    const leftCurtain = this.add.rectangle(0, 0, 100, height, 0x8B0000).setOrigin(0, 0);
    const rightCurtain = this.add.rectangle(width - 100, 0, 100, height, 0x8B0000).setOrigin(0, 0);

    // Spotlights
    for (let i = 0; i < 3; i++) {
      const x = (width / 4) * (i + 1);
      const light = this.add.circle(x, 50, 30, 0xFFFF00, 0.3);
    }
  }

  createStage() {
    const { width, height } = this.cameras.main;

    // Character positions
    this.char1Pos = { x: width / 3, y: height - 250 };
    this.char2Pos = { x: (width / 3) * 2, y: height - 250 };

    // Speech bubble container
    this.speechContainer = this.add.container(width / 2, 200);
  }

  loadDialogue() {
    // Sample dialogue data
    this.dialogues = [
      {
        scenario: 'Meeting',
        exchanges: [
          { speaker: 1, text: 'ನಮಸ್ಕಾರ, ನೀನು ಹೇಗಿದ್ದೀಯ?', english: 'Hello, how are you?' },
          { speaker: 2, text: 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಧನ್ಯವಾದ!', english: 'I am fine, thank you!' }
        ]
      },
      {
        scenario: 'Shopping',
        exchanges: [
          { speaker: 1, text: 'ಇದರ ಬೆಲೆ ಎಷ್ಟು?', english: 'How much is this?' },
          { speaker: 2, text: 'ಇದು ನೂರು ರೂಪಾಯಿ', english: 'This is hundred rupees' }
        ]
      }
    ];

    this.currentDialogue = Phaser.Utils.Array.GetRandom(this.dialogues);
    this.dialogueIndex = 0;

    this.createCharacters();
    this.playDialogue();
  }

  createCharacters() {
    const { width, height } = this.cameras.main;

    // Clear previous characters
    if (this.char1) this.char1.destroy();
    if (this.char2) this.char2.destroy();

    // Character 1 (represented by emoji)
    this.char1 = this.add.text(this.char1Pos.x, this.char1Pos.y, '👦', {
      fontSize: '80px'
    }).setOrigin(0.5);

    this.char1Name = this.add.text(this.char1Pos.x, this.char1Pos.y + 60, 'Ravi', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Character 2
    this.char2 = this.add.text(this.char2Pos.x, this.char2Pos.y, '👧', {
      fontSize: '80px'
    }).setOrigin(0.5);

    this.char2Name = this.add.text(this.char2Pos.x, this.char2Pos.y + 60, 'Priya', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);
  }

  playDialogue() {
    if (this.dialogueIndex >= this.currentDialogue.exchanges.length - 1) {
      // Show quiz for last response
      this.showResponseQuiz();
      return;
    }

    const exchange = this.currentDialogue.exchanges[this.dialogueIndex];

    this.showSpeechBubble(exchange);

    // Auto-advance after reading
    this.time.delayedCall(3000, () => {
      this.dialogueIndex++;
      if (this.dialogueIndex < this.currentDialogue.exchanges.length - 1) {
        this.playDialogue();
      } else {
        this.showResponseQuiz();
      }
    });
  }

  showSpeechBubble(exchange) {
    const { width } = this.cameras.main;

    // Clear previous bubble
    this.speechContainer.removeAll(true);

    const speaker = exchange.speaker === 1 ? this.char1Pos : this.char2Pos;

    // Highlight speaking character
    if (exchange.speaker === 1) {
      this.tweens.add({
        targets: this.char1,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        yoyo: true
      });
    } else {
      this.tweens.add({
        targets: this.char2,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        yoyo: true
      });
    }

    // Speech bubble
    const bubble = this.add.container(speaker.x, speaker.y - 120);

    const bubbleBg = this.add.ellipse(0, 0, 350, 120, 0xFFFFFF);
    bubbleBg.setStrokeStyle(3, 0x000000);

    const kannadaText = this.add.text(0, -20, exchange.text, {
      fontSize: '22px',
      fontFamily: 'Nudi, Arial',
      color: '#000000',
      align: 'center',
      wordWrap: { width: 320 }
    }).setOrigin(0.5);

    const englishText = this.add.text(0, 20, `(${exchange.english})`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#666666',
      align: 'center',
      wordWrap: { width: 320 }
    }).setOrigin(0.5);

    bubble.add([bubbleBg, kannadaText, englishText]);

    // Store for cleanup
    this.currentBubble = bubble;
  }

  showResponseQuiz() {
    const { width, height } = this.cameras.main;

    if (this.currentBubble) this.currentBubble.destroy();

    // Get the correct response
    const lastExchange = this.currentDialogue.exchanges[this.currentDialogue.exchanges.length - 1];
    const previousExchange = this.currentDialogue.exchanges[this.currentDialogue.exchanges.length - 2];

    // Show previous statement
    this.showSpeechBubble(previousExchange);

    // Create response options
    const quizContainer = this.add.container(width / 2, height / 2 + 100);

    const questionText = this.add.text(0, -80, 'What should the response be?', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFD700',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    quizContainer.add(questionText);

    // Options
    const options = [
      lastExchange.text,
      'ನಾನು ಊಟ ಮಾಡಿದೆ',  // Distractor 1
      'ಇದು ಕೆಂಪು ಬಣ್ಣ'    // Distractor 2
    ];

    Phaser.Utils.Array.Shuffle(options);
    const correctIndex = options.indexOf(lastExchange.text);

    options.forEach((option, index) => {
      const y = -10 + (index * 60);

      const btn = this.add.rectangle(0, y, 450, 50, 0x2196F3);
      btn.setStrokeStyle(2, 0xFFFFFF);
      btn.setInteractive({ useHandCursor: true });

      const text = this.add.text(0, y, option, {
        fontSize: '20px',
        fontFamily: 'Nudi, Arial',
        color: '#FFFFFF',
        align: 'center',
        wordWrap: { width: 420 }
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        if (index === correctIndex) {
          this.onCorrectResponse(quizContainer);
        } else {
          this.onIncorrectResponse(quizContainer);
        }
      });

      quizContainer.add([btn, text]);
    });

    this.quizContainer = quizContainer;
  }

  onCorrectResponse(quizContainer) {
    this.playCorrectFeedback();
    this.addScore(40);

    quizContainer.destroy();
    if (this.currentBubble) this.currentBubble.destroy();

    this.time.delayedCall(1000, () => {
      this.loadDialogue();
    });
  }

  onIncorrectResponse(quizContainer) {
    this.playIncorrectFeedback();
    this.loseLife();

    this.cameras.main.shake(200, 0.01);

    quizContainer.destroy();
    if (this.currentBubble) this.currentBubble.destroy();

    if (this.lives > 0) {
      this.time.delayedCall(1000, () => {
        this.loadDialogue();
      });
    }
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
