import { EventBus } from '../../utils/EventBus.js';

/**
 * RewardSystem - Handles achievements, badges, and rewards
 */
export class RewardSystem {
  constructor(progressTracker) {
    this.progressTracker = progressTracker;

    // Define achievements
    this.achievementDefinitions = this.defineAchievements();

    // Define badges
    this.badgeDefinitions = this.defineBadges();
  }

  /**
   * Define all achievements
   */
  defineAchievements() {
    return {
      // First time achievements
      first_game: {
        id: 'first_game',
        name: 'First Steps',
        nameKannada: 'ಮೊದಲ ಹೆಜ್ಜೆಗಳು',
        description: 'Complete your first game',
        icon: '🎮',
        condition: (profile) => profile.progress.gamesPlayed >= 1
      },

      first_letter: {
        id: 'first_letter',
        name: 'Letter Learner',
        nameKannada: 'ಅಕ್ಷರ ಕಲಿಯುವವರು',
        description: 'Learn your first Kannada letter',
        icon: '🔤',
        condition: (profile) => profile.skills.alphabet.masteredLetters.length >= 1
      },

      first_word: {
        id: 'first_word',
        name: 'Word Wizard',
        nameKannada: 'ಪದ ವಿಜಾರ್ಡ್',
        description: 'Learn your first Kannada word',
        icon: '📝',
        condition: (profile) => profile.skills.vocabulary.masteredWords.length >= 1
      },

      // Milestone achievements
      five_games: {
        id: 'five_games',
        name: 'Getting Started',
        nameKannada: 'ಪ್ರಾರಂಭಿಸುವುದು',
        description: 'Complete 5 games',
        icon: '🌟',
        condition: (profile) => profile.progress.gamesPlayed >= 5
      },

      ten_games: {
        id: 'ten_games',
        name: 'Dedicated Learner',
        nameKannada: 'ಸಮರ್ಪಿತ ಕಲಿಯುವವರು',
        description: 'Complete 10 games',
        icon: '⭐',
        condition: (profile) => profile.progress.gamesPlayed >= 10
      },

      twenty_five_games: {
        id: 'twenty_five_games',
        name: 'Persistent Player',
        nameKannada: 'ನಿರಂತರ ಆಟಗಾರ',
        description: 'Complete 25 games',
        icon: '🏅',
        condition: (profile) => profile.progress.gamesPlayed >= 25
      },

      // Letter achievements
      five_letters: {
        id: 'five_letters',
        name: 'Vowel Master',
        nameKannada: 'ಸ್ವರ ಮಾಸ್ಟರ್',
        description: 'Master 5 Kannada letters',
        icon: '📚',
        condition: (profile) => profile.skills.alphabet.masteredLetters.length >= 5
      },

      ten_letters: {
        id: 'ten_letters',
        name: 'Alphabet Explorer',
        nameKannada: 'ವರ್ಣಮಾಲೆ ಪರಿಶೋಧಕ',
        description: 'Master 10 Kannada letters',
        icon: '🎓',
        condition: (profile) => profile.skills.alphabet.masteredLetters.length >= 10
      },

      // Word achievements
      ten_words: {
        id: 'ten_words',
        name: 'Vocabulary Builder',
        nameKannada: 'ಶಬ್ದಕೋಶ ನಿರ್ಮಾಪಕ',
        description: 'Master 10 Kannada words',
        icon: '📖',
        condition: (profile) => profile.skills.vocabulary.masteredWords.length >= 10
      },

      twenty_five_words: {
        id: 'twenty_five_words',
        name: 'Word Champion',
        nameKannada: 'ಪದ ಚಾಂಪಿಯನ್',
        description: 'Master 25 Kannada words',
        icon: '🏆',
        condition: (profile) => profile.skills.vocabulary.masteredWords.length >= 25
      },

      // Score achievements
      thousand_points: {
        id: 'thousand_points',
        name: 'Point Collector',
        nameKannada: 'ಪಾಯಿಂಟ್ ಸಂಗ್ರಾಹಕ',
        description: 'Score 1000 total points',
        icon: '💯',
        condition: (profile) => profile.progress.totalScore >= 1000
      },

      five_thousand_points: {
        id: 'five_thousand_points',
        name: 'High Scorer',
        nameKannada: 'ಹೆಚ್ಚಿನ ಸ್ಕೋರರ್',
        description: 'Score 5000 total points',
        icon: '🎯',
        condition: (profile) => profile.progress.totalScore >= 5000
      },

      // Star achievements
      ten_stars: {
        id: 'ten_stars',
        name: 'Rising Star',
        nameKannada: 'ಏರುತ್ತಿರುವ ನಕ್ಷತ್ರ',
        description: 'Earn 10 stars',
        icon: '⭐',
        condition: (profile) => profile.progress.totalStars >= 10
      },

      thirty_stars: {
        id: 'thirty_stars',
        name: 'Star Collector',
        nameKannada: 'ನಕ್ಷತ್ರ ಸಂಗ್ರಾಹಕ',
        description: 'Earn 30 stars',
        icon: '🌟',
        condition: (profile) => profile.progress.totalStars >= 30
      },

      // Accuracy achievements
      perfect_accuracy: {
        id: 'perfect_accuracy',
        name: 'Perfect Performance',
        nameKannada: 'ಪರಿಪೂರ್ಣ ಪ್ರದರ್ಶನ',
        description: 'Achieve 100% accuracy in any category',
        icon: '💎',
        condition: (profile) => {
          return Object.values(profile.skills).some(skill =>
            skill.totalAttempts >= 10 && skill.accuracy === 1.0
          );
        }
      },

      expert_learner: {
        id: 'expert_learner',
        name: 'Expert Learner',
        nameKannada: 'ತಜ್ಞ ಕಲಿಯುವವರು',
        description: 'Achieve 90%+ accuracy in 3 categories',
        icon: '🎖️',
        condition: (profile) => {
          const highAccuracy = Object.values(profile.skills).filter(skill =>
            skill.totalAttempts >= 10 && skill.accuracy >= 0.9
          );
          return highAccuracy.length >= 3;
        }
      }
    };
  }

  /**
   * Define all badges
   */
  defineBadges() {
    return {
      vowel_novice: {
        id: 'vowel_novice',
        name: 'Vowel Novice',
        nameKannada: 'ಸ್ವರ ಹೊಸಬ',
        description: 'Complete vowel learning',
        icon: '🔰',
        color: '#4CAF50'
      },

      consonant_learner: {
        id: 'consonant_learner',
        name: 'Consonant Learner',
        nameKannada: 'ವ್ಯಂಜನ ಕಲಿಯುವವರು',
        description: 'Master consonants',
        icon: '📘',
        color: '#2196F3'
      },

      word_master: {
        id: 'word_master',
        name: 'Word Master',
        nameKannada: 'ಪದ ಮಾಸ್ಟರ್',
        description: 'Excel in vocabulary',
        icon: '📕',
        color: '#F44336'
      },

      sentence_builder: {
        id: 'sentence_builder',
        name: 'Sentence Builder',
        nameKannada: 'ವಾಕ್ಯ ನಿರ್ಮಾಣಕಾರ',
        description: 'Master sentence formation',
        icon: '📗',
        color: '#FF9800'
      },

      reading_champion: {
        id: 'reading_champion',
        name: 'Reading Champion',
        nameKannada: 'ಓದುವ ಚಾಂಪಿಯನ್',
        description: 'Excellent reading skills',
        icon: '📙',
        color: '#9C27B0'
      },

      listening_expert: {
        id: 'listening_expert',
        name: 'Listening Expert',
        nameKannada: 'ಕೇಳುವ ತಜ್ಞ',
        description: 'Master pronunciation recognition',
        icon: '👂',
        color: '#00BCD4'
      }
    };
  }

  /**
   * Calculate stars based on performance
   */
  calculateStars(score, maxScore, accuracy, timeBonus = 0) {
    const scoreRatio = score / maxScore;
    let stars = 0;

    // Base stars on score ratio
    if (scoreRatio >= 0.9 || accuracy >= 0.95) {
      stars = 3;
    } else if (scoreRatio >= 0.7 || accuracy >= 0.8) {
      stars = 2;
    } else if (scoreRatio >= 0.5 || accuracy >= 0.6) {
      stars = 1;
    }

    return stars;
  }

  /**
   * Check all achievements
   */
  checkAchievements() {
    const profile = this.progressTracker.profile;
    const unlockedNow = [];

    Object.values(this.achievementDefinitions).forEach(achievement => {
      // Skip if already unlocked
      if (this.progressTracker.hasAchievement(achievement.id)) {
        return;
      }

      // Check condition
      if (achievement.condition(profile)) {
        this.unlockAchievement(achievement.id);
        unlockedNow.push(achievement);
      }
    });

    return unlockedNow;
  }

  /**
   * Unlock specific achievement
   */
  unlockAchievement(achievementId) {
    const achievement = this.achievementDefinitions[achievementId];

    if (!achievement) {
      console.warn(`RewardSystem: Unknown achievement "${achievementId}"`);
      return false;
    }

    // Check if already unlocked
    if (this.progressTracker.hasAchievement(achievementId)) {
      return false;
    }

    // Unlock through progress tracker
    this.progressTracker.unlockAchievement(achievementId);

    // Emit event for UI notification
    EventBus.emit('achievement:show', achievement);

    return true;
  }

  /**
   * Get achievement by ID
   */
  getAchievement(achievementId) {
    return this.achievementDefinitions[achievementId] || null;
  }

  /**
   * Get all achievements
   */
  getAllAchievements() {
    return this.achievementDefinitions;
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements() {
    const unlockedIds = this.progressTracker.getAchievements();
    return unlockedIds.map(item =>
      this.achievementDefinitions[item.id]
    ).filter(Boolean);
  }

  /**
   * Get locked achievements
   */
  getLockedAchievements() {
    const unlockedIds = this.progressTracker.getAchievements().map(a => a.id);
    return Object.values(this.achievementDefinitions).filter(
      achievement => !unlockedIds.includes(achievement.id)
    );
  }

  /**
   * Get achievement progress
   */
  getAchievementProgress() {
    const total = Object.keys(this.achievementDefinitions).length;
    const unlocked = this.progressTracker.getAchievements().length;
    return {
      total,
      unlocked,
      percentage: (unlocked / total) * 100
    };
  }

  /**
   * Unlock badge
   */
  unlockBadge(badgeId) {
    const badge = this.badgeDefinitions[badgeId];

    if (!badge) {
      console.warn(`RewardSystem: Unknown badge "${badgeId}"`);
      return false;
    }

    // Store as achievement for now (can be separated later)
    this.progressTracker.unlockAchievement(`badge_${badgeId}`);

    EventBus.emit('badge:unlocked', badge);

    return true;
  }

  /**
   * Get badge by ID
   */
  getBadge(badgeId) {
    return this.badgeDefinitions[badgeId] || null;
  }

  /**
   * Show achievement notification in scene
   */
  showAchievementNotification(scene, achievement) {
    const { width, height } = scene.cameras.main;

    // Create notification container
    const notification = scene.add.container(width / 2, -100)
      .setDepth(5000);

    // Background
    const bg = scene.add.rectangle(0, 0, 400, 100, 0x4CAF50, 0.95)
      .setStrokeStyle(4, 0xFFD700);

    // Icon
    const icon = scene.add.text(-150, 0, achievement.icon, {
      fontSize: '48px'
    }).setOrigin(0.5);

    // Title
    const title = scene.add.text(-50, -20, 'Achievement Unlocked!', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Achievement name
    const name = scene.add.text(-50, 10, achievement.name, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFF00'
    }).setOrigin(0, 0.5);

    notification.add([bg, icon, title, name]);

    // Animate in
    scene.tweens.add({
      targets: notification,
      y: 120,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Auto-hide after 3 seconds
        scene.time.delayedCall(3000, () => {
          scene.tweens.add({
            targets: notification,
            y: -100,
            duration: 500,
            ease: 'Back.easeIn',
            onComplete: () => notification.destroy()
          });
        });
      }
    });

    // Play celebration sound
    if (scene.sound) {
      scene.sound.play('sfx_celebration');
    }
  }
}
