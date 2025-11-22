import EventBus from '../../utils/EventBus.js';
import DataValidator from '../../utils/DataValidator.js';
import ErrorHandler from '../../utils/ErrorHandler.js';

/**
 * ProgressTracker - Tracks and persists student learning progress
 */
export class ProgressTracker {
  constructor() {
    this.storageKey = 'kannada_learning_progress';
    this.profile = this.loadProfile();

    // Listen to game events
    this.setupEventListeners();
  }

  /**
   * Load profile from localStorage
   */
  loadProfile() {
    try {
      const data = localStorage.getItem(this.storageKey);

      if (data) {
        // Validate JSON structure
        if (!DataValidator.isValidJSON(data)) {
          ErrorHandler.reportError(new Error('Invalid JSON in localStorage'), {
            key: this.storageKey
          });
          return this.createDefaultProfile();
        }

        const profile = JSON.parse(data);

        // Validate profile structure
        const validation = DataValidator.validateProfile(profile);
        if (!validation.valid) {
          ErrorHandler.reportError(new Error(`Invalid profile data: ${validation.error}`), {
            key: this.storageKey
          });
          return this.createDefaultProfile();
        }

        // Sanitize and migrate
        const sanitized = DataValidator.sanitizeObject(profile);
        return this.migrateProfile(sanitized);
      }
    } catch (error) {
      console.error('ProgressTracker: Error loading profile', error);
      ErrorHandler.reportError(error, { context: 'ProgressTracker.loadProfile' });
    }

    // Return default profile
    return this.createDefaultProfile();
  }

  /**
   * Create default profile
   */
  createDefaultProfile() {
    return {
      version: '1.0.0',
      profileId: this.generateProfileId(),
      playerName: 'Student',
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),

      progress: {
        level: 1,
        totalScore: 0,
        totalStars: 0,
        gamesPlayed: 0,
        totalPlayTime: 0 // in seconds
      },

      skills: {
        alphabet: {
          level: 0,
          masteredLetters: [],
          accuracy: 0,
          totalAttempts: 0,
          correctAttempts: 0
        },
        vocabulary: {
          level: 0,
          masteredWords: [],
          accuracy: 0,
          totalAttempts: 0,
          correctAttempts: 0
        },
        words: {
          level: 0,
          accuracy: 0,
          totalAttempts: 0,
          correctAttempts: 0
        },
        sentences: {
          level: 0,
          accuracy: 0,
          totalAttempts: 0,
          correctAttempts: 0
        },
        reading: {
          level: 0,
          accuracy: 0,
          totalAttempts: 0,
          correctAttempts: 0
        },
        listening: {
          level: 0,
          accuracy: 0,
          totalAttempts: 0,
          correctAttempts: 0
        }
      },

      gameHistory: {},

      achievements: [],

      srsData: {}, // Spaced Repetition System data

      settings: {
        difficulty: 'beginner',
        showHints: true,
        language: 'english'
      }
    };
  }

  /**
   * Generate unique profile ID
   */
  generateProfileId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Migrate profile to latest version
   */
  migrateProfile(profile) {
    // Handle version migrations here
    if (profile.version !== '1.0.0') {
      // Add migration logic for future versions
    }

    return profile;
  }

  /**
   * Save profile to localStorage
   */
  saveProfile() {
    try {
      this.profile.lastPlayed = new Date().toISOString();

      // Validate profile before saving
      const validation = DataValidator.validateProfile(this.profile);
      if (!validation.valid) {
        ErrorHandler.reportError(new Error(`Cannot save invalid profile: ${validation.error}`));
        return;
      }

      // Sanitize profile data
      const sanitized = DataValidator.sanitizeObject(this.profile);
      const jsonData = JSON.stringify(sanitized);

      // Check storage quota
      const quotaCheck = DataValidator.checkStorageQuota(this.storageKey, jsonData);
      if (!quotaCheck.valid) {
        ErrorHandler.reportError(new Error(`Storage error: ${quotaCheck.error}`));
        return;
      }

      // Save to localStorage
      localStorage.setItem(this.storageKey, jsonData);
      EventBus.emit('progress:saved', { profile: this.profile });
    } catch (error) {
      console.error('ProgressTracker: Error saving profile', error);
      ErrorHandler.reportError(error, { context: 'ProgressTracker.saveProfile' });
    }
  }

  /**
   * Reset profile
   */
  resetProfile() {
    this.profile = this.createDefaultProfile();
    this.saveProfile();
    EventBus.emit('progress:reset');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    EventBus.on('game:end', (data) => this.onGameEnd(data));
    EventBus.on('letter:learned', (data) => this.onLetterLearned(data));
    EventBus.on('word:learned', (data) => this.onWordLearned(data));
    EventBus.on('achievement:unlocked', (data) => this.onAchievementUnlocked(data));
  }

  /**
   * Handle game end event
   */
  onGameEnd(data) {
    const { scene, success, score, stats } = data;

    this.addGameCompletion(scene, score, stats);
    this.saveProfile();
  }

  /**
   * Add game completion record
   */
  addGameCompletion(gameType, score, stats = {}) {
    // Initialize game history if not exists
    if (!this.profile.gameHistory[gameType]) {
      this.profile.gameHistory[gameType] = {
        plays: 0,
        bestScore: 0,
        averageScore: 0,
        totalScore: 0,
        stars: 0,
        lastPlayed: null
      };
    }

    const history = this.profile.gameHistory[gameType];

    // Update stats
    history.plays++;
    history.totalScore += score;
    history.averageScore = Math.floor(history.totalScore / history.plays);
    history.bestScore = Math.max(history.bestScore, score);
    history.lastPlayed = new Date().toISOString();

    // Update global progress
    this.profile.progress.gamesPlayed++;
    this.profile.progress.totalScore += score;

    // Calculate stars (based on score thresholds)
    const stars = this.calculateStars(score, stats);
    history.stars = Math.max(history.stars, stars);
    this.profile.progress.totalStars += stars;

    // Update skill category
    this.updateSkillCategory(gameType, stats);

    this.saveProfile();

    EventBus.emit('game:recorded', {
      gameType,
      score,
      stars,
      history
    });
  }

  /**
   * Calculate stars based on score
   */
  calculateStars(score, stats) {
    // Simple star calculation - can be customized per game
    if (score >= 150) return 3;
    if (score >= 100) return 2;
    if (score >= 50) return 1;
    return 0;
  }

  /**
   * Update skill category based on game type
   */
  updateSkillCategory(gameType, stats) {
    // Map game scenes to skill categories
    const categoryMap = {
      'AksharaPopScene': 'alphabet',
      'LetterTracingScene': 'alphabet',
      'AlphabetRainScene': 'alphabet',
      'FruitBasketScene': 'vocabulary',
      'AnimalSafariScene': 'vocabulary',
      'ColorSplashScene': 'vocabulary'
      // Add more mappings as needed
    };

    const category = categoryMap[gameType];

    if (category && this.profile.skills[category]) {
      const skill = this.profile.skills[category];

      // Update attempts if stats available
      if (stats.totalAttempts) {
        skill.totalAttempts += stats.totalAttempts;
      }
      if (stats.correctAttempts) {
        skill.correctAttempts += stats.correctAttempts;
      }

      // Recalculate accuracy
      if (skill.totalAttempts > 0) {
        skill.accuracy = skill.correctAttempts / skill.totalAttempts;
      }

      // Level up based on accuracy and attempts
      this.updateSkillLevel(skill);
    }
  }

  /**
   * Update skill level
   */
  updateSkillLevel(skill) {
    // Simple leveling system
    if (skill.accuracy >= 0.9 && skill.totalAttempts >= 50) {
      skill.level = Math.max(skill.level, 3);
    } else if (skill.accuracy >= 0.8 && skill.totalAttempts >= 30) {
      skill.level = Math.max(skill.level, 2);
    } else if (skill.accuracy >= 0.7 && skill.totalAttempts >= 10) {
      skill.level = Math.max(skill.level, 1);
    }
  }

  /**
   * Mark letter as learned
   */
  markLetterLearned(letter) {
    const skill = this.profile.skills.alphabet;

    if (!skill.masteredLetters.includes(letter)) {
      skill.masteredLetters.push(letter);
      this.saveProfile();

      EventBus.emit('letter:mastered', {
        letter,
        totalMastered: skill.masteredLetters.length
      });
    }
  }

  /**
   * Handle letter learned event
   */
  onLetterLearned(data) {
    this.markLetterLearned(data.letter);
  }

  /**
   * Mark word as learned
   */
  markWordLearned(word) {
    const skill = this.profile.skills.vocabulary;

    if (!skill.masteredWords.includes(word)) {
      skill.masteredWords.push(word);
      this.saveProfile();

      EventBus.emit('word:mastered', {
        word,
        totalMastered: skill.masteredWords.length
      });
    }
  }

  /**
   * Handle word learned event
   */
  onWordLearned(data) {
    this.markWordLearned(data.word);
  }

  /**
   * Record learning attempt
   */
  recordAttempt(category, item, correct) {
    const skill = this.profile.skills[category];

    if (skill) {
      skill.totalAttempts++;
      if (correct) {
        skill.correctAttempts++;
      }

      // Recalculate accuracy
      skill.accuracy = skill.correctAttempts / skill.totalAttempts;

      this.updateSkillLevel(skill);
      this.saveProfile();
    }
  }

  /**
   * Get game statistics
   */
  getGameStats(gameType) {
    return this.profile.gameHistory[gameType] || null;
  }

  /**
   * Get overall progress
   */
  getOverallProgress() {
    return this.profile.progress;
  }

  /**
   * Get skill progress
   */
  getSkillProgress(category) {
    return this.profile.skills[category] || null;
  }

  /**
   * Get all skills progress
   */
  getAllSkillsProgress() {
    return this.profile.skills;
  }

  /**
   * Get strengths and weaknesses
   */
  getStrengthsWeaknesses() {
    const skills = this.profile.skills;
    const categories = Object.keys(skills);

    const strengths = [];
    const weaknesses = [];

    categories.forEach(category => {
      const skill = skills[category];

      if (skill.totalAttempts > 10) {
        if (skill.accuracy >= 0.8) {
          strengths.push({
            category,
            accuracy: skill.accuracy,
            level: skill.level
          });
        } else if (skill.accuracy < 0.6) {
          weaknesses.push({
            category,
            accuracy: skill.accuracy,
            level: skill.level
          });
        }
      }
    });

    return { strengths, weaknesses };
  }

  /**
   * Unlock achievement
   */
  unlockAchievement(achievementId) {
    const existing = this.profile.achievements.find(a => a.id === achievementId);

    if (!existing) {
      this.profile.achievements.push({
        id: achievementId,
        unlockedAt: new Date().toISOString()
      });

      this.saveProfile();

      EventBus.emit('achievement:unlocked', { achievementId });
    }
  }

  /**
   * Handle achievement unlocked event
   */
  onAchievementUnlocked(data) {
    this.unlockAchievement(data.achievementId);
  }

  /**
   * Check if achievement is unlocked
   */
  hasAchievement(achievementId) {
    return this.profile.achievements.some(a => a.id === achievementId);
  }

  /**
   * Get all achievements
   */
  getAchievements() {
    return this.profile.achievements;
  }

  /**
   * Update SRS data for item
   */
  updateSRSData(item, srsData) {
    this.profile.srsData[item] = srsData;
    this.saveProfile();
  }

  /**
   * Get SRS data for item
   */
  getSRSData(item) {
    return this.profile.srsData[item] || null;
  }

  /**
   * Get all SRS data
   */
  getAllSRSData() {
    return this.profile.srsData;
  }

  /**
   * Update player name
   */
  setPlayerName(name) {
    this.profile.playerName = name;
    this.saveProfile();
  }

  /**
   * Get player name
   */
  getPlayerName() {
    return this.profile.playerName;
  }

  /**
   * Update difficulty setting
   */
  setDifficulty(difficulty) {
    this.profile.settings.difficulty = difficulty;
    this.saveProfile();
  }

  /**
   * Get difficulty setting
   */
  getDifficulty() {
    return this.profile.settings.difficulty;
  }

  /**
   * Export profile data
   */
  exportProfile() {
    return JSON.stringify(this.profile, null, 2);
  }

  /**
   * Import profile data
   */
  importProfile(jsonData) {
    try {
      const profile = JSON.parse(jsonData);
      this.profile = this.migrateProfile(profile);
      this.saveProfile();
      EventBus.emit('progress:imported');
      return true;
    } catch (error) {
      console.error('ProgressTracker: Error importing profile', error);
      return false;
    }
  }

  /**
   * Get profile summary
   */
  getProfileSummary() {
    const skills = this.profile.skills;
    const totalLetters = skills.alphabet.masteredLetters.length;
    const totalWords = skills.vocabulary.masteredWords.length;

    return {
      playerName: this.profile.playerName,
      level: this.profile.progress.level,
      totalScore: this.profile.progress.totalScore,
      totalStars: this.profile.progress.totalStars,
      gamesPlayed: this.profile.progress.gamesPlayed,
      lettersLearned: totalLetters,
      wordsLearned: totalWords,
      createdAt: this.profile.createdAt,
      lastPlayed: this.profile.lastPlayed
    };
  }
}
