/**
 * LearningEngine - Manages adaptive difficulty and content selection
 */
export class LearningEngine {
  constructor(progressTracker) {
    this.progressTracker = progressTracker;
  }

  /**
   * Get recommended difficulty for a game category
   */
  getRecommendedDifficulty(category) {
    const skill = this.progressTracker.getSkillProgress(category);

    if (!skill) {
      return 'beginner';
    }

    // Based on skill level and accuracy
    if (skill.level >= 3 && skill.accuracy >= 0.85) {
      return 'advanced';
    } else if (skill.level >= 2 && skill.accuracy >= 0.75) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  /**
   * Select content for student based on their progress
   */
  selectContentForStudent(category, contentPool, count) {
    const skill = this.progressTracker.getSkillProgress(category);

    if (!skill) {
      // New student - select easiest content
      return this.selectByDifficulty(contentPool, 'beginner', count);
    }

    // Get mastered items
    const masteredItems = category === 'alphabet'
      ? skill.masteredLetters
      : skill.masteredWords || [];

    // Split into mastered and unmastered
    const unmastered = contentPool.filter(item => {
      const key = item.letter || item.kannada || item.word;
      return !masteredItems.includes(key);
    });

    const mastered = contentPool.filter(item => {
      const key = item.letter || item.kannada || item.word;
      return masteredItems.includes(key);
    });

    // Mix: 70% new content, 30% review
    const newCount = Math.ceil(count * 0.7);
    const reviewCount = count - newCount;

    const selectedNew = this.selectRandom(unmastered, newCount);
    const selectedReview = this.selectRandom(mastered, reviewCount);

    return [...selectedNew, ...selectedReview];
  }

  /**
   * Select items by difficulty
   */
  selectByDifficulty(contentPool, difficulty, count) {
    const filtered = contentPool.filter(item => item.difficulty === difficulty);

    if (filtered.length >= count) {
      return this.selectRandom(filtered, count);
    } else {
      // Not enough items at this difficulty, add from all
      const remaining = count - filtered.length;
      const others = contentPool.filter(item => item.difficulty !== difficulty);
      return [...filtered, ...this.selectRandom(others, remaining)];
    }
  }

  /**
   * Select random items from array
   */
  selectRandom(array, count) {
    if (array.length <= count) {
      return [...array];
    }

    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Calculate mastery level for an item (0-1)
   */
  calculateMastery(item, category) {
    const srsData = this.progressTracker.getSRSData(item);

    if (!srsData) {
      return 0; // Not learned yet
    }

    // Simple mastery calculation based on SRS ease factor
    // Ease factor typically ranges from 1.3 to 2.5
    const mastery = Math.min((srsData.easeFactor - 1.3) / 1.2, 1.0);
    return mastery;
  }

  /**
   * Identify weak areas
   */
  identifyWeakAreas() {
    const skills = this.progressTracker.getAllSkillsProgress();
    const weakAreas = [];

    Object.entries(skills).forEach(([category, skill]) => {
      if (skill.totalAttempts > 5 && skill.accuracy < 0.6) {
        weakAreas.push({
          category,
          accuracy: skill.accuracy,
          attempts: skill.totalAttempts
        });
      }
    });

    // Sort by accuracy (lowest first)
    weakAreas.sort((a, b) => a.accuracy - b.accuracy);

    return weakAreas;
  }

  /**
   * Suggest next game based on progress
   */
  suggestNextGame() {
    const weakAreas = this.identifyWeakAreas();

    // If there are weak areas, suggest games for improvement
    if (weakAreas.length > 0) {
      const weakest = weakAreas[0];
      return this.getGamesForCategory(weakest.category);
    }

    // Otherwise, suggest based on overall progress
    const skills = this.progressTracker.getAllSkillsProgress();
    const categories = Object.keys(skills);

    // Find category with least progress
    const leastProgress = categories.reduce((min, category) => {
      const skill = skills[category];
      if (skill.totalAttempts < skills[min].totalAttempts) {
        return category;
      }
      return min;
    }, categories[0]);

    return this.getGamesForCategory(leastProgress);
  }

  /**
   * Get games for a specific category
   */
  getGamesForCategory(category) {
    const gameMap = {
      'alphabet': [
        'AksharaPopScene',
        'LetterTracingScene',
        'AlphabetRainScene',
        'LetterMatchScene',
        'SpinningWheelScene'
      ],
      'vocabulary': [
        'FruitBasketScene',
        'AnimalSafariScene',
        'ColorSplashScene',
        'NumberRocketsScene'
      ],
      'words': [
        'LetterBridgeScene',
        'WordFactoryScene',
        'SpellPictureScene'
      ],
      'sentences': [
        'SentenceTrainScene',
        'QuestionAnswerScene'
      ],
      'reading': [
        'StoryBookScene',
        'ReadingRaceScene'
      ],
      'listening': [
        'EchoGameScene',
        'SoundSafariScene'
      ]
    };

    return gameMap[category] || [];
  }

  /**
   * Generate personalized learning path
   */
  generateLearningPath() {
    const skills = this.progressTracker.getAllSkillsProgress();
    const path = [];

    // Order categories by difficulty/dependency
    const orderedCategories = [
      'alphabet',
      'vocabulary',
      'words',
      'sentences',
      'reading',
      'listening'
    ];

    orderedCategories.forEach(category => {
      const skill = skills[category];
      const games = this.getGamesForCategory(category);

      // Add to path if not mastered
      if (skill.level < 3) {
        path.push({
          category,
          currentLevel: skill.level,
          accuracy: skill.accuracy,
          recommendedGames: games,
          difficulty: this.getRecommendedDifficulty(category)
        });
      }
    });

    return path;
  }

  /**
   * Calculate optimal review interval (for SRS)
   */
  calculateReviewInterval(item, performance) {
    const srsData = this.progressTracker.getSRSData(item);

    // Initialize SRS data if not exists
    if (!srsData) {
      return this.initializeSRSData(item, performance);
    }

    // SM-2 algorithm (simplified)
    let easeFactor = srsData.easeFactor;
    let interval = srsData.interval;

    // Update ease factor based on performance (0-5 scale)
    easeFactor = easeFactor + (0.1 - (5 - performance) * (0.08 + (5 - performance) * 0.02));

    // Clamp ease factor
    if (easeFactor < 1.3) easeFactor = 1.3;
    if (easeFactor > 2.5) easeFactor = 2.5;

    // Calculate next interval
    if (performance < 3) {
      // Failed - reset to 1 day
      interval = 1;
    } else {
      // Passed - increase interval
      if (interval === 0) {
        interval = 1;
      } else if (interval === 1) {
        interval = 6;
      } else {
        interval = Math.ceil(interval * easeFactor);
      }
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    const newSRSData = {
      easeFactor,
      interval,
      nextReview: nextReview.toISOString(),
      lastReview: new Date().toISOString(),
      reviewCount: (srsData.reviewCount || 0) + 1
    };

    // Save SRS data
    this.progressTracker.updateSRSData(item, newSRSData);

    return newSRSData;
  }

  /**
   * Initialize SRS data for new item
   */
  initializeSRSData(item, performance) {
    const srsData = {
      easeFactor: 2.5,
      interval: performance >= 3 ? 1 : 0,
      nextReview: new Date().toISOString(),
      lastReview: new Date().toISOString(),
      reviewCount: 1
    };

    this.progressTracker.updateSRSData(item, srsData);
    return srsData;
  }

  /**
   * Get items due for review
   */
  getDueItems(category) {
    const allSRSData = this.progressTracker.getAllSRSData();
    const now = new Date();
    const dueItems = [];

    Object.entries(allSRSData).forEach(([item, data]) => {
      const nextReview = new Date(data.nextReview);
      if (nextReview <= now) {
        dueItems.push({
          item,
          data,
          daysDue: Math.floor((now - nextReview) / (1000 * 60 * 60 * 24))
        });
      }
    });

    // Sort by days due (most overdue first)
    dueItems.sort((a, b) => b.daysDue - a.daysDue);

    return dueItems;
  }

  /**
   * Analyze learning velocity
   */
  analyzeLearningVelocity(category, daysBack = 7) {
    const skill = this.progressTracker.getSkillProgress(category);

    if (!skill || skill.totalAttempts === 0) {
      return {
        attemptsPerDay: 0,
        accuracyTrend: 'stable',
        masteryRate: 0
      };
    }

    // Simple analysis (can be enhanced with time-series data)
    const attemptsPerDay = skill.totalAttempts / daysBack;
    const masteryRate = category === 'alphabet'
      ? skill.masteredLetters.length / daysBack
      : (skill.masteredWords?.length || 0) / daysBack;

    return {
      attemptsPerDay,
      accuracyTrend: skill.accuracy >= 0.8 ? 'improving' : 'needs-work',
      masteryRate,
      currentAccuracy: skill.accuracy
    };
  }

  /**
   * Get personalized hints based on performance
   */
  getPersonalizedHint(category, item) {
    const mastery = this.calculateMastery(item, category);

    if (mastery < 0.3) {
      return `This is a new ${category === 'alphabet' ? 'letter' : 'word'}. Listen carefully to the pronunciation.`;
    } else if (mastery < 0.6) {
      return `You've seen this before. Try to remember the pronunciation.`;
    } else {
      return `You're doing great with this one! Keep it up!`;
    }
  }

  /**
   * Predict success probability for next game
   */
  predictSuccessProbability(category, difficulty) {
    const skill = this.progressTracker.getSkillProgress(category);

    if (!skill || skill.totalAttempts < 5) {
      return 0.5; // Neutral prediction for new students
    }

    // Base prediction on accuracy
    let probability = skill.accuracy;

    // Adjust for difficulty
    if (difficulty === 'beginner') {
      probability += 0.1;
    } else if (difficulty === 'advanced') {
      probability -= 0.1;
    }

    // Clamp to 0-1
    return Math.max(0, Math.min(1, probability));
  }
}
