import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * StoryBookScene - Interactive story reading with comprehension
 */
export class StoryBookScene extends BaseGameScene {
  constructor() {
    super('StoryBookScene', {
      lives: 3,
      timeLimit: 180
    });

    this.currentStory = null;
    this.currentPage = 0;
    this.pages = [];
  }

  preload() {
    super.preload();
    this.load.json('stories', 'src/data/kannada/stories.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.storiesData = this.cache.json.get('stories');
    this.audioManager = new AudioManager(this);

    this.createGameBackground();
    this.createStandardUI();
    this.createStoryBook();

    this.loadStory();
    this.showInstructions('Read the story and answer the questions!');
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;
    const bg = this.add.rectangle(0, 0, width, height, 0x8B4513).setOrigin(0, 0);

    // Bookshelf background
    for (let i = 0; i < 3; i++) {
      const shelf = this.add.rectangle(0, 150 + (i * 200), width, 20, 0x654321).setOrigin(0, 0);
    }
  }

  createStoryBook() {
    const { width, height } = this.cameras.main;

    // Book container
    this.bookContainer = this.add.container(width / 2, height / 2);

    // Left page
    const leftPage = this.add.rectangle(-200, 0, 350, 450, 0xFFFFF0);
    leftPage.setStrokeStyle(2, 0x8B4513);

    // Right page
    const rightPage = this.add.rectangle(200, 0, 350, 450, 0xFFFFF0);
    rightPage.setStrokeStyle(2, 0x8B4513);

    // Spine
    const spine = this.add.rectangle(0, 0, 10, 450, 0x654321);

    this.bookContainer.add([leftPage, spine, rightPage]);

    // Page content containers
    this.leftPageContent = this.add.container(-200, 0);
    this.rightPageContent = this.add.container(200, 0);

    this.bookContainer.add([this.leftPageContent, this.rightPageContent]);

    this.createNavigationButtons();
  }

  createNavigationButtons() {
    const { width, height } = this.cameras.main;

    // Previous button
    this.prevBtn = this.add.text(width / 2 - 400, height / 2, '◀', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#654321'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.prevBtn.on('pointerdown', () => this.previousPage());

    // Next button
    this.nextBtn = this.add.text(width / 2 + 400, height / 2, '▶', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#654321'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.nextBtn.on('pointerdown', () => this.nextPage());
  }

  loadStory() {
    if (!this.storiesData || !this.storiesData.basic) return;

    this.currentStory = Phaser.Utils.Array.GetRandom(this.storiesData.basic);
    this.currentPage = 0;

    this.displayPage();
  }

  displayPage() {
    // Clear previous content
    this.leftPageContent.removeAll(true);
    this.rightPageContent.removeAll(true);

    if (!this.currentStory) return;

    const story = this.currentStory;

    // Display title on first page
    if (this.currentPage === 0) {
      const title = this.add.text(0, -180, story.title, {
        fontSize: '28px',
        fontFamily: 'Nudi, Arial',
        color: '#000000',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 300 }
      }).setOrigin(0.5);

      const englishTitle = this.add.text(0, -130, story.englishTitle || '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#666666',
        align: 'center',
        wordWrap: { width: 300 }
      }).setOrigin(0.5);

      this.leftPageContent.add([title, englishTitle]);
    }

    // Display story content
    const content = this.add.text(0, -100, story.content || '', {
      fontSize: '20px',
      fontFamily: 'Nudi, Arial',
      color: '#000000',
      align: 'left',
      wordWrap: { width: 300 },
      lineSpacing: 8
    }).setOrigin(0.5, 0);

    const translation = this.add.text(0, -100, story.translation || '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#666666',
      align: 'left',
      wordWrap: { width: 300 },
      lineSpacing: 6
    }).setOrigin(0.5, 0);

    if (this.currentPage === 0) {
      this.rightPageContent.add([content]);
    } else {
      this.leftPageContent.add([translation]);
    }

    // Page number
    const pageNum = this.add.text(0, 200, `Page ${this.currentPage + 1}`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#999999'
    }).setOrigin(0.5);

    this.rightPageContent.add(pageNum);

    // Update button visibility
    this.prevBtn.setVisible(this.currentPage > 0);
    this.nextBtn.setVisible(this.currentPage < 1);

    // Show comprehension quiz after story
    if (this.currentPage === 1) {
      this.time.delayedCall(1000, () => this.showComprehensionQuiz());
    }
  }

  nextPage() {
    if (this.currentPage < 1) {
      this.currentPage++;
      this.audioManager.playClick();
      this.displayPage();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.audioManager.playClick();
      this.displayPage();
    }
  }

  showComprehensionQuiz() {
    if (!this.currentStory || !this.currentStory.questions) return;

    const { width, height } = this.cameras.main;

    const question = Phaser.Utils.Array.GetRandom(this.currentStory.questions);

    // Create quiz overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0, 0);
    overlay.setInteractive();

    const quizContainer = this.add.container(width / 2, height / 2);

    const quizBg = this.add.rectangle(0, 0, 600, 300, 0xFFFFFF);
    quizBg.setStrokeStyle(3, 0xFF9800);

    const questionText = this.add.text(0, -100, question.question || 'ಈ ಕಥೆ ಬಗ್ಗೆ ಏನು?', {
      fontSize: '24px',
      fontFamily: 'Nudi, Arial',
      color: '#000000',
      align: 'center',
      wordWrap: { width: 550 }
    }).setOrigin(0.5);

    quizContainer.add([quizBg, questionText]);

    // Answer options
    const options = question.options || ['ಆಯ್ಕೆ 1', 'ಆಯ್ಕೆ 2', 'ಆಯ್ಕೆ 3'];
    const correctAnswer = question.correct || 0;

    options.forEach((option, index) => {
      const y = -20 + (index * 60);

      const optBtn = this.add.rectangle(0, y, 500, 50, 0x2196F3);
      optBtn.setStrokeStyle(2, 0xFFFFFF);
      optBtn.setInteractive({ useHandCursor: true });

      const optText = this.add.text(0, y, option, {
        fontSize: '20px',
        fontFamily: 'Nudi, Arial',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      optBtn.on('pointerdown', () => {
        if (index === correctAnswer) {
          this.onQuizCorrect(overlay, quizContainer);
        } else {
          this.onQuizIncorrect(overlay, quizContainer);
        }
      });

      quizContainer.add([optBtn, optText]);
    });
  }

  onQuizCorrect(overlay, quizContainer) {
    this.playCorrectFeedback();
    this.addScore(50);

    overlay.destroy();
    quizContainer.destroy();

    this.time.delayedCall(1000, () => {
      this.loadStory();
    });
  }

  onQuizIncorrect(overlay, quizContainer) {
    this.playIncorrectFeedback();
    this.loseLife();

    this.cameras.main.shake(200, 0.01);

    this.time.delayedCall(1000, () => {
      overlay.destroy();
      quizContainer.destroy();

      if (this.lives > 0) {
        this.loadStory();
      }
    });
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
