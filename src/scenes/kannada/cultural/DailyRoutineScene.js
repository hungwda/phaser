import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * DailyRoutineScene - Learn daily routine activities in Kannada
 */
export class DailyRoutineScene extends BaseGameScene {
  constructor() {
    super('DailyRoutineScene', {
      lives: 5,
      timeLimit: 120
    });

    this.routineActivities = [];
    this.currentActivity = null;
  }

  preload() {
    super.preload();
    this.load.json('verbs', 'src/data/kannada/verbs.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.verbsData = this.cache.json.get('verbs');
    this.audioManager = new AudioManager(this);

    this.loadRoutineData();

    this.createGameBackground();
    this.createStandardUI();
    this.createTimeDisplay();

    this.presentActivity();
    this.showInstructions('Match the daily activities with the correct time! ದಿನಚರಿ ಕಲಿಯೋಣ!');
  }

  loadRoutineData() {
    // Daily routine activities
    this.routineActivities = [
      {
        time: '6:00 AM',
        kannada: 'ಎದ್ದೇಳು',
        english: 'wake up',
        emoji: '⏰',
        period: 'morning'
      },
      {
        time: '7:00 AM',
        kannada: 'ಸ್ನಾನ ಮಾಡು',
        english: 'take a bath',
        emoji: '🚿',
        period: 'morning'
      },
      {
        time: '8:00 AM',
        kannada: 'ಉಪಹಾರ ತಿನ್ನು',
        english: 'eat breakfast',
        emoji: '🍳',
        period: 'morning'
      },
      {
        time: '9:00 AM',
        kannada: 'ಶಾಲೆಗೆ ಹೋಗು',
        english: 'go to school',
        emoji: '🎒',
        period: 'morning'
      },
      {
        time: '1:00 PM',
        kannada: 'ಊಟ ಮಾಡು',
        english: 'have lunch',
        emoji: '🍛',
        period: 'afternoon'
      },
      {
        time: '4:00 PM',
        kannada: 'ಆಟ ಆಡು',
        english: 'play',
        emoji: '⚽',
        period: 'afternoon'
      },
      {
        time: '7:00 PM',
        kannada: 'ಅಧ್ಯಯನ ಮಾಡು',
        english: 'study',
        emoji: '📖',
        period: 'evening'
      },
      {
        time: '9:00 PM',
        kannada: 'ರಾತ್ರಿ ಊಟ ಮಾಡು',
        english: 'have dinner',
        emoji: '🍽️',
        period: 'night'
      },
      {
        time: '10:00 PM',
        kannada: 'ಮಲಗು',
        english: 'sleep',
        emoji: '😴',
        period: 'night'
      }
    ];
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;

    // Sky that changes color based on time of day
    this.skyColors = {
      morning: 0x87CEEB,
      afternoon: 0xFFD700,
      evening: 0xFF8C00,
      night: 0x191970
    };

    this.sky = this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0, 0);

    // Sun/Moon
    this.celestialBody = this.add.circle(width - 100, 100, 40, 0xFFFF00);

    // Ground
    const ground = this.add.rectangle(0, height - 100, width, 100, 0x90EE90).setOrigin(0, 0);

    // House
    this.createHouse(150, height - 300);
  }

  createHouse(x, y) {
    // House body
    const body = this.add.rectangle(x, y, 200, 150, 0xDEB887);
    body.setStrokeStyle(3, 0x8B4513);

    // Roof
    const roof = this.add.triangle(x, y - 75, 0, 75, -120, 0, 120, 0, 0xDC143C);
    roof.setStrokeStyle(3, 0x8B0000);

    // Door
    const door = this.add.rectangle(x, y + 40, 50, 80, 0x8B4513);
    door.setStrokeStyle(2, 0x654321);

    // Windows
    const window1 = this.add.rectangle(x - 60, y - 20, 50, 50, 0x87CEEB);
    window1.setStrokeStyle(2, 0x000000);

    const window2 = this.add.rectangle(x + 60, y - 20, 50, 50, 0x87CEEB);
    window2.setStrokeStyle(2, 0x000000);
  }

  createTimeDisplay() {
    const { width } = this.cameras.main;

    // Clock display
    this.clockContainer = this.add.container(width - 150, 250);

    const clockBg = this.add.circle(0, 0, 60, 0xFFFFFF);
    clockBg.setStrokeStyle(4, 0x000000);

    this.timeText = this.add.text(0, 0, '12:00', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.clockContainer.add([clockBg, this.timeText]);
  }

  presentActivity() {
    const { width, height } = this.cameras.main;

    // Clear previous
    if (this.activityCard) this.activityCard.destroy();
    if (this.timeOptions) this.timeOptions.destroy();

    this.currentActivity = Phaser.Utils.Array.GetRandom(this.routineActivities);

    // Update sky color based on period
    this.sky.setFillStyle(this.skyColors[this.currentActivity.period]);

    // Update celestial body (sun/moon)
    if (this.currentActivity.period === 'night') {
      this.celestialBody.setFillStyle(0xF0F0F0); // Moon
    } else {
      this.celestialBody.setFillStyle(0xFFFF00); // Sun
    }

    // Display activity card
    this.activityCard = this.add.container(width / 2, height / 2 - 50);

    const cardBg = this.add.rectangle(0, 0, 400, 250, 0xFFFFFF, 0.95);
    cardBg.setStrokeStyle(4, 0x4682B4);

    const emoji = this.add.text(0, -80, this.currentActivity.emoji, {
      fontSize: '64px'
    }).setOrigin(0.5);

    const kannadaText = this.add.text(0, -10, this.currentActivity.kannada, {
      fontSize: '32px',
      fontFamily: 'Nudi, Arial',
      color: '#000000'
    }).setOrigin(0.5);

    const englishText = this.add.text(0, 30, `(${this.currentActivity.english})`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#666666'
    }).setOrigin(0.5);

    const question = this.add.text(0, 80, 'What time?', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#4682B4',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.activityCard.add([cardBg, emoji, kannadaText, englishText, question]);

    // Show time options
    this.time.delayedCall(1000, () => {
      this.showTimeOptions();
    });
  }

  showTimeOptions() {
    const { width, height } = this.cameras.main;

    this.timeOptions = this.add.container(width / 2, height - 100);

    // Get time options
    const distractors = this.routineActivities.filter(
      activity => activity.time !== this.currentActivity.time
    );

    const options = [
      this.currentActivity.time,
      ...Phaser.Utils.Array.Shuffle(distractors.map(a => a.time)).slice(0, 2)
    ];

    Phaser.Utils.Array.Shuffle(options);

    const spacing = 200;
    const startX = -spacing;

    options.forEach((time, index) => {
      const x = startX + (index * spacing);

      const btn = this.createTimeButton(x, 0, time);
      this.timeOptions.add(btn);
    });
  }

  createTimeButton(x, y, time) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 160, 60, 0x4682B4);
    bg.setStrokeStyle(3, 0xFFFFFF);

    const timeText = this.add.text(0, 0, time, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, timeText]);
    container.setSize(160, 60);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      this.checkAnswer(time, container);
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

  checkAnswer(selectedTime, button) {
    // Disable all options
    if (this.timeOptions) {
      this.timeOptions.iterate((child) => {
        if (child.disableInteractive) child.disableInteractive();
      });
    }

    if (selectedTime === this.currentActivity.time) {
      this.onCorrect(button);
    } else {
      this.onIncorrect(button);
    }
  }

  onCorrect(button) {
    this.playCorrectFeedback();
    this.addScore(30);

    button.list[0].setFillStyle(0x4CAF50);

    // Update clock
    this.timeText.setText(this.currentActivity.time);

    const { width, height } = this.cameras.main;
    const feedback = this.add.text(width / 2, 100, '✓ ಸರಿ! Correct!', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#4CAF50',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      feedback.destroy();
      this.presentActivity();
    });
  }

  onIncorrect(button) {
    this.playIncorrectFeedback();
    this.loseLife();

    button.list[0].setFillStyle(0xF44336);

    this.cameras.main.shake(200, 0.01);

    this.time.delayedCall(1500, () => {
      if (this.lives > 0) {
        this.presentActivity();
      }
    });
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
