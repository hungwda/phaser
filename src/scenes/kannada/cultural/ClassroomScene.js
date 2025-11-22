import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * ClassroomScene - Learn classroom vocabulary and phrases in Kannada
 */
export class ClassroomScene extends BaseGameScene {
  constructor() {
    super('ClassroomScene', {
      lives: 5,
      timeLimit: 120
    });

    this.classroomItems = [];
    this.currentItem = null;
  }

  preload() {
    super.preload();
    this.load.json('sentences', 'src/data/kannada/sentences.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.sentencesData = this.cache.json.get('sentences');
    this.audioManager = new AudioManager(this);

    this.loadClassroomData();

    this.createGameBackground();
    this.createStandardUI();
    this.createClassroom();

    this.presentClassroomItem();
    this.showInstructions('Learn classroom words and phrases! ತರಗತಿಯಲ್ಲಿ ಕಲಿಯೋಣ!');
  }

  loadClassroomData() {
    // Classroom vocabulary
    this.classroomItems = [
      { kannada: 'ಶಿಕ್ಷಕರು', english: 'teacher', emoji: '👨‍🏫', x: 400, y: 250 },
      { kannada: 'ವಿದ್ಯಾರ್ಥಿ', english: 'student', emoji: '👨‍🎓', x: 600, y: 350 },
      { kannada: 'ಕಪ್ಪು ಹಲಗೆ', english: 'blackboard', emoji: '📋', x: 200, y: 200 },
      { kannada: 'ಪುಸ್ತಕ', english: 'book', emoji: '📚', x: 650, y: 420 },
      { kannada: 'ಪೆನ್ನು', english: 'pen', emoji: '✒️', x: 500, y: 450 },
      { kannada: 'ಮೇಜು', english: 'desk', emoji: '🪑', x: 700, y: 400 },
      { kannada: 'ಗಡಿಯಾರ', english: 'clock', emoji: '🕐', x: 250, y: 150 }
    ];

    this.classroomPhrases = [
      { kannada: 'ನಮಸ್ಕಾರ ಗುರುಗಳೇ', english: 'Good morning teacher' },
      { kannada: 'ನಾನು ಪ್ರಶ್ನೆ ಕೇಳಬಹುದೇ?', english: 'May I ask a question?' },
      { kannada: 'ದಯವಿಟ್ಟು ಪುನರಾವರ್ತಿಸಿ', english: 'Please repeat' }
    ];
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;

    // Classroom wall
    const wall = this.add.rectangle(0, 0, width, height, 0xF5DEB3).setOrigin(0, 0);

    // Floor
    const floor = this.add.rectangle(0, height - 150, width, 150, 0xCD853F).setOrigin(0, 0);

    // Window
    const window1 = this.add.rectangle(width - 150, 150, 120, 100, 0x87CEEB);
    window1.setStrokeStyle(4, 0x8B4513);

    // Door
    const door = this.add.rectangle(50, height - 250, 80, 150, 0x8B4513);
    door.setStrokeStyle(2, 0x654321);

    const doorKnob = this.add.circle(110, height - 175, 8, 0xFFD700);
  }

  createClassroom() {
    const { width, height } = this.cameras.main;

    // Blackboard
    const board = this.add.rectangle(width / 2, 180, 400, 200, 0x2F4F4F);
    board.setStrokeStyle(4, 0x8B4513);

    // Board text
    this.boardText = this.add.text(width / 2, 180, 'ತರಗತಿ\nClassroom', {
      fontSize: '36px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFFFF',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);

    // Student desks
    for (let i = 0; i < 3; i++) {
      const x = 500 + (i * 100);
      const y = 400;

      const desk = this.add.rectangle(x, y, 60, 40, 0xDEB887);
      desk.setStrokeStyle(2, 0x8B4513);
    }

    // Teacher's desk
    const teacherDesk = this.add.rectangle(300, 350, 100, 60, 0xD2691E);
    teacherDesk.setStrokeStyle(2, 0x8B4513);
  }

  presentClassroomItem() {
    const { width, height } = this.cameras.main;

    // Clear previous
    if (this.itemDisplay) this.itemDisplay.destroy();
    if (this.optionsContainer) this.optionsContainer.destroy();

    this.currentItem = Phaser.Utils.Array.GetRandom(this.classroomItems);

    // Update blackboard
    this.boardText.setText(`${this.currentItem.emoji}\n?`);

    // Show item in classroom
    const itemIcon = this.add.text(
      this.currentItem.x,
      this.currentItem.y,
      this.currentItem.emoji,
      { fontSize: '64px' }
    ).setOrigin(0.5);

    // Pulsing effect
    this.tweens.add({
      targets: itemIcon,
      scale: 1.2,
      duration: 800,
      yoyo: true,
      repeat: 2
    });

    this.itemDisplay = itemIcon;

    // Show options after a delay
    this.time.delayedCall(2000, () => {
      this.showNameOptions();
    });
  }

  showNameOptions() {
    const { width, height } = this.cameras.main;

    this.optionsContainer = this.add.container(width / 2, height - 80);

    // Get options
    const distractors = this.classroomItems.filter(
      item => item.kannada !== this.currentItem.kannada
    );

    const options = [
      this.currentItem,
      ...Phaser.Utils.Array.Shuffle(distractors).slice(0, 2)
    ];

    Phaser.Utils.Array.Shuffle(options);

    const spacing = 250;
    const startX = -spacing;

    options.forEach((item, index) => {
      const x = startX + (index * spacing);

      const btn = this.createOptionButton(x, 0, item);
      this.optionsContainer.add(btn);
    });
  }

  createOptionButton(x, y, itemData) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 220, 60, 0x4682B4);
    bg.setStrokeStyle(3, 0xFFFFFF);

    const kannadaText = this.add.text(0, -8, itemData.kannada, {
      fontSize: '22px',
      fontFamily: 'Nudi, Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    const englishText = this.add.text(0, 18, itemData.english, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#E0FFFF'
    }).setOrigin(0.5);

    container.add([bg, kannadaText, englishText]);
    container.setSize(220, 60);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      this.checkAnswer(itemData, container);
    });

    container.on('pointerover', () => {
      bg.setFillStyle(0x5F9EA0);
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 100
      });
    });

    container.on('pointerout', () => {
      bg.setFillStyle(0x4682B4);
      this.tweens.add({
        targets: container,
        scale: 1.0,
        duration: 100
      });
    });

    return container;
  }

  checkAnswer(selectedItem, button) {
    // Disable all options
    if (this.optionsContainer) {
      this.optionsContainer.iterate((child) => {
        if (child.disableInteractive) child.disableInteractive();
      });
    }

    if (selectedItem.kannada === this.currentItem.kannada) {
      this.onCorrect(button);
    } else {
      this.onIncorrect(button);
    }
  }

  onCorrect(button) {
    this.playCorrectFeedback();
    this.addScore(25);

    button.list[0].setFillStyle(0x4CAF50);

    // Update blackboard with correct answer
    this.boardText.setText(
      `${this.currentItem.emoji}\n${this.currentItem.kannada}\n(${this.currentItem.english})`
    );

    this.time.delayedCall(2000, () => {
      this.presentClassroomItem();
    });
  }

  onIncorrect(button) {
    this.playIncorrectFeedback();
    this.loseLife();

    button.list[0].setFillStyle(0xF44336);

    this.tweens.add({
      targets: button,
      x: button.x + 10,
      duration: 50,
      yoyo: true,
      repeat: 3
    });

    this.time.delayedCall(1500, () => {
      if (this.lives > 0) {
        this.presentClassroomItem();
      }
    });
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
