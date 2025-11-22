import { Button } from '../../components/ui/Button.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';
import { ProgressTracker } from '../../systems/learning/ProgressTracker.js';
import { RewardSystem } from '../../systems/learning/RewardSystem.js';

/**
 * ProfileScene - Display user profile, progress, and achievements
 */
export class ProfileScene extends Phaser.Scene {
  constructor() {
    super('ProfileScene');

    this.progressTracker = new ProgressTracker();
    this.rewardSystem = new RewardSystem(this.progressTracker);
  }

  create() {
    const { width, height } = this.cameras.main;

    // Create background
    this.createBackground();

    // Create header
    this.createHeader();

    // Create tabs
    this.createTabs();

    // Show initial tab content (Stats)
    this.currentTab = 'stats';
    this.showTabContent('stats');

    // Create back button
    this.createBackButton();
  }

  /**
   * Create background
   */
  createBackground() {
    const { width, height } = this.cameras.main;

    // Gradient background
    const bg = this.add.rectangle(0, 0, width, height, 0x1565C0)
      .setOrigin(0, 0);

    // Decorative stars
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(2, 4);

      const star = this.add.circle(x, y, size, 0xFFFFFF, 0.6);

      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 2000),
        yoyo: true,
        repeat: -1
      });
    }
  }

  /**
   * Create header
   */
  createHeader() {
    const { width } = this.cameras.main;
    const summary = this.progressTracker.getProfileSummary();

    // Profile header container
    const headerContainer = this.add.container(width / 2, 80);

    // Avatar (placeholder circle)
    const avatar = this.add.circle(0, 0, 40, 0xFFD700);
    avatar.setStrokeStyle(4, 0xFFFFFF);

    // Player name
    const nameText = this.add.text(60, -15, summary.playerName, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Level badge
    const levelBadge = this.add.container(60, 15);
    const levelBg = this.add.rectangle(0, 0, 100, 30, 0xFF9800);
    levelBg.setStrokeStyle(2, 0xFFFFFF);
    const levelText = this.add.text(0, 0, `Level ${summary.level}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    levelBadge.add([levelBg, levelText]);

    headerContainer.add([avatar, nameText, levelBadge]);
  }

  /**
   * Create tabs
   */
  createTabs() {
    const { width } = this.cameras.main;

    this.tabsContainer = this.add.container(width / 2, 150);

    const tabs = [
      { key: 'stats', label: 'Stats', icon: '📊' },
      { key: 'achievements', label: 'Achievements', icon: '🏆' },
      { key: 'skills', label: 'Skills', icon: '📚' }
    ];

    const tabWidth = 150;
    const tabSpacing = 10;
    const startX = -(tabs.length * (tabWidth + tabSpacing)) / 2 + tabWidth / 2;

    tabs.forEach((tab, index) => {
      const x = startX + index * (tabWidth + tabSpacing);

      const tabBtn = this.createTabButton(x, 0, tab.label, tab.icon, tab.key);
      this.tabsContainer.add(tabBtn);
    });

    // Highlight first tab
    this.highlightTab('stats');
  }

  /**
   * Create tab button
   */
  createTabButton(x, y, label, icon, key) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 140, 50, 0x1E88E5, 0.8);
    bg.setStrokeStyle(2, 0xFFFFFF);

    const iconText = this.add.text(-40, 0, icon, {
      fontSize: '24px'
    }).setOrigin(0, 0.5);

    const labelText = this.add.text(0, 0, label, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);

    container.add([bg, iconText, labelText]);

    // Store for highlighting
    container.setData('bg', bg);
    container.setData('key', key);

    // Make interactive
    container.setSize(140, 50);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      this.switchTab(key);
    });

    return container;
  }

  /**
   * Switch tab
   */
  switchTab(tabKey) {
    if (this.currentTab === tabKey) return;

    this.currentTab = tabKey;
    this.highlightTab(tabKey);
    this.showTabContent(tabKey);
  }

  /**
   * Highlight active tab
   */
  highlightTab(tabKey) {
    this.tabsContainer.each((child) => {
      if (child.getData) {
        const bg = child.getData('bg');
        const key = child.getData('key');

        if (bg) {
          if (key === tabKey) {
            bg.setFillStyle(0x0D47A1, 1.0);
            bg.setStrokeStyle(3, 0xFFD700);
          } else {
            bg.setFillStyle(0x1E88E5, 0.8);
            bg.setStrokeStyle(2, 0xFFFFFF);
          }
        }
      }
    });
  }

  /**
   * Show tab content
   */
  showTabContent(tabKey) {
    // Clear previous content
    if (this.contentContainer) {
      this.contentContainer.destroy();
    }

    const { width, height } = this.cameras.main;
    this.contentContainer = this.add.container(width / 2, height / 2 + 50);

    switch (tabKey) {
      case 'stats':
        this.showStatsContent();
        break;
      case 'achievements':
        this.showAchievementsContent();
        break;
      case 'skills':
        this.showSkillsContent();
        break;
    }
  }

  /**
   * Show stats content
   */
  showStatsContent() {
    const summary = this.progressTracker.getProfileSummary();

    // Stats panel background
    const panelBg = this.add.rectangle(0, 0, 600, 300, 0x000000, 0.5);
    panelBg.setStrokeStyle(3, 0xFFD700);

    // Stats grid
    const stats = [
      { label: 'Total Score', value: summary.totalScore, icon: '💯' },
      { label: 'Total Stars', value: summary.totalStars, icon: '⭐' },
      { label: 'Games Played', value: summary.gamesPlayed, icon: '🎮' },
      { label: 'Letters Learned', value: summary.lettersLearned, icon: '🔤' },
      { label: 'Words Learned', value: summary.wordsLearned, icon: '📝' }
    ];

    const gridStartY = -120;
    const rowHeight = 60;

    stats.forEach((stat, index) => {
      const y = gridStartY + index * rowHeight;

      // Icon
      const icon = this.add.text(-250, y, stat.icon, {
        fontSize: '32px'
      }).setOrigin(0, 0.5);

      // Label
      const label = this.add.text(-200, y, stat.label, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#FFFFFF'
      }).setOrigin(0, 0.5);

      // Value
      const value = this.add.text(200, y, stat.value.toString(), {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#FFD700',
        fontStyle: 'bold'
      }).setOrigin(1, 0.5);

      this.contentContainer.add([icon, label, value]);
    });

    this.contentContainer.add(panelBg);
    this.contentContainer.sendToBack(panelBg);
  }

  /**
   * Show achievements content
   */
  showAchievementsContent() {
    const unlocked = this.rewardSystem.getUnlockedAchievements();
    const locked = this.rewardSystem.getLockedAchievements();

    // Panel background
    const panelBg = this.add.rectangle(0, 0, 650, 350, 0x000000, 0.5);
    panelBg.setStrokeStyle(3, 0xFFD700);

    // Progress
    const progress = this.rewardSystem.getAchievementProgress();
    const progressText = this.add.text(0, -150, `${progress.unlocked} / ${progress.total} Achievements`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFD700'
    }).setOrigin(0.5);

    // Achievement list (scrollable grid)
    const achievementStartY = -100;
    const achievementSpacing = 80;
    const maxVisible = 4;

    const displayAchievements = [...unlocked, ...locked.slice(0, maxVisible - unlocked.length)];

    displayAchievements.forEach((achievement, index) => {
      if (index >= maxVisible) return;

      const y = achievementStartY + index * achievementSpacing;
      const isUnlocked = unlocked.includes(achievement);

      // Background
      const achBg = this.add.rectangle(-250, y, 550, 70, isUnlocked ? 0x4CAF50 : 0x424242, 0.8);
      achBg.setStrokeStyle(2, isUnlocked ? 0xFFD700 : 0x666666);

      // Icon
      const icon = this.add.text(-300, y, achievement.icon, {
        fontSize: '32px'
      }).setOrigin(0, 0.5);
      if (!isUnlocked) icon.setAlpha(0.5);

      // Name
      const name = this.add.text(-250, y - 10, achievement.name, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: isUnlocked ? '#FFFFFF' : '#888888',
        fontStyle: isUnlocked ? 'bold' : 'normal'
      }).setOrigin(0, 0.5);

      // Description
      const desc = this.add.text(-250, y + 15, achievement.description, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: isUnlocked ? '#E0E0E0' : '#666666'
      }).setOrigin(0, 0.5);

      // Lock icon for locked achievements
      if (!isUnlocked) {
        const lock = this.add.text(250, y, '🔒', {
          fontSize: '24px'
        }).setOrigin(0.5);
        this.contentContainer.add(lock);
      }

      this.contentContainer.add([achBg, icon, name, desc]);
    });

    this.contentContainer.add([panelBg, progressText]);
    this.contentContainer.sendToBack(panelBg);
  }

  /**
   * Show skills content
   */
  showSkillsContent() {
    const skills = this.progressTracker.getAllSkillsProgress();
    const { strengths, weaknesses } = this.progressTracker.getStrengthsWeaknesses();

    // Panel background
    const panelBg = this.add.rectangle(0, 0, 650, 350, 0x000000, 0.5);
    panelBg.setStrokeStyle(3, 0xFFD700);

    // Title
    const title = this.add.text(0, -150, 'Skill Progress', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FFD700'
    }).setOrigin(0.5);

    // Skill categories
    const categories = ['alphabet', 'vocabulary', 'words', 'sentences', 'reading', 'listening'];
    const startY = -100;
    const rowHeight = 60;

    categories.forEach((category, index) => {
      const skill = skills[category];
      const y = startY + index * rowHeight;

      // Category name
      const name = this.add.text(-280, y - 15, this.getCategoryDisplayName(category), {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#FFFFFF'
      }).setOrigin(0, 0);

      // Progress bar
      const progressBar = new ProgressBar(this, -280, y + 15, {
        width: 200,
        height: 15,
        showPercentage: false
      });
      progressBar.setProgress(skill.accuracy);

      // Accuracy percentage
      const accuracy = this.add.text(-70, y, `${Math.round(skill.accuracy * 100)}%`, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#FFD700'
      }).setOrigin(0, 0.5);

      // Attempts
      const attempts = this.add.text(30, y, `${skill.totalAttempts} attempts`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#AAAAAA'
      }).setOrigin(0, 0.5);

      // Level badge
      const level = this.add.text(200, y, `Lv.${skill.level}`, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        backgroundColor: '#2196F3',
        padding: { x: 8, y: 4 }
      }).setOrigin(0, 0.5);

      this.contentContainer.add([name, progressBar, accuracy, attempts, level]);
    });

    this.contentContainer.add([panelBg, title]);
    this.contentContainer.sendToBack(panelBg);
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(category) {
    const names = {
      alphabet: 'Alphabet (ಅಕ್ಷರ)',
      vocabulary: 'Vocabulary (ಶಬ್ದ)',
      words: 'Words (ಪದಗಳು)',
      sentences: 'Sentences (ವಾಕ್ಯಗಳು)',
      reading: 'Reading (ಓದು)',
      listening: 'Listening (ಕೇಳು)'
    };
    return names[category] || category;
  }

  /**
   * Create back button
   */
  createBackButton() {
    const backBtn = new Button(this, 60, 40, {
      text: 'Back',
      icon: '←',
      width: 100,
      height: 40,
      bgColor: 0x607D8B,
      onClick: () => {
        this.scene.start('GameHubScene');
      }
    });
  }
}
