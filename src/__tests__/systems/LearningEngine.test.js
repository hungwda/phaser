import { LearningEngine } from '../../systems/learning/LearningEngine.js';
import { ProgressTracker } from '../../systems/learning/ProgressTracker.js';

describe('LearningEngine', () => {
  let engine;
  let tracker;

  beforeEach(() => {
    localStorage.clear();
    tracker = new ProgressTracker();
    engine = new LearningEngine(tracker);
  });

  describe('Difficulty Recommendation', () => {
    test('should recommend beginner for new students', () => {
      const difficulty = engine.getRecommendedDifficulty('alphabet');

      expect(difficulty).toBe('beginner');
    });

    test('should recommend intermediate for progressing students', () => {
      const skill = tracker.profile.skills.alphabet;
      skill.level = 2;
      skill.accuracy = 0.75;

      const difficulty = engine.getRecommendedDifficulty('alphabet');

      expect(difficulty).toBe('intermediate');
    });

    test('should recommend advanced for skilled students', () => {
      const skill = tracker.profile.skills.alphabet;
      skill.level = 3;
      skill.accuracy = 0.85;

      const difficulty = engine.getRecommendedDifficulty('alphabet');

      expect(difficulty).toBe('advanced');
    });
  });

  describe('Content Selection', () => {
    const sampleContent = [
      { letter: 'ಅ', difficulty: 'beginner' },
      { letter: 'ಆ', difficulty: 'beginner' },
      { letter: 'ಇ', difficulty: 'beginner' },
      { letter: 'ಈ', difficulty: 'intermediate' },
      { letter: 'ಉ', difficulty: 'intermediate' }
    ];

    test('should select by difficulty', () => {
      const selected = engine.selectByDifficulty(sampleContent, 'beginner', 2);

      expect(selected.length).toBe(2);
      selected.forEach(item => {
        expect(item.difficulty).toBe('beginner');
      });
    });

    test('should handle insufficient content at difficulty', () => {
      const selected = engine.selectByDifficulty(sampleContent, 'beginner', 5);

      expect(selected.length).toBe(5);
    });

    test('should select content for student with mixed new and review', () => {
      const skill = tracker.profile.skills.alphabet;
      skill.masteredLetters = ['ಅ', 'ಆ'];

      const selected = engine.selectContentForStudent('alphabet', sampleContent, 4);

      expect(selected.length).toBe(4);
    });
  });

  describe('Random Selection', () => {
    test('should select random items', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const selected = engine.selectRandom(items, 5);

      expect(selected.length).toBe(5);
      selected.forEach(item => {
        expect(items).toContain(item);
      });
    });

    test('should return all items if count exceeds array length', () => {
      const items = [1, 2, 3];
      const selected = engine.selectRandom(items, 10);

      expect(selected.length).toBe(3);
    });
  });

  describe('Mastery Calculation', () => {
    test('should return 0 for unlearned items', () => {
      const mastery = engine.calculateMastery('ಅ', 'alphabet');

      expect(mastery).toBe(0);
    });

    test('should calculate mastery based on SRS data', () => {
      tracker.updateSRSData('ಅ', {
        easeFactor: 2.0,
        interval: 5
      });

      const mastery = engine.calculateMastery('ಅ', 'alphabet');

      expect(mastery).toBeGreaterThan(0);
      expect(mastery).toBeLessThanOrEqual(1);
    });
  });

  describe('Weak Area Identification', () => {
    test('should identify weak areas', () => {
      const skill = tracker.profile.skills.alphabet;
      skill.totalAttempts = 10;
      skill.correctAttempts = 4;
      skill.accuracy = 0.4;

      const weakAreas = engine.identifyWeakAreas();

      expect(weakAreas.length).toBeGreaterThan(0);
      expect(weakAreas[0].category).toBe('alphabet');
    });

    test('should sort weak areas by accuracy', () => {
      tracker.profile.skills.alphabet.totalAttempts = 10;
      tracker.profile.skills.alphabet.accuracy = 0.3;

      tracker.profile.skills.vocabulary.totalAttempts = 10;
      tracker.profile.skills.vocabulary.accuracy = 0.5;

      const weakAreas = engine.identifyWeakAreas();

      expect(weakAreas[0].category).toBe('alphabet');
      expect(weakAreas[0].accuracy).toBeLessThan(weakAreas[1]?.accuracy || 1);
    });

    test('should not include categories with few attempts', () => {
      const skill = tracker.profile.skills.alphabet;
      skill.totalAttempts = 3;
      skill.accuracy = 0.2;

      const weakAreas = engine.identifyWeakAreas();

      expect(weakAreas).toHaveLength(0);
    });
  });

  describe('Game Suggestion', () => {
    test('should suggest games for weak areas', () => {
      const skill = tracker.profile.skills.alphabet;
      skill.totalAttempts = 10;
      skill.accuracy = 0.4;

      const games = engine.suggestNextGame();

      expect(games.length).toBeGreaterThan(0);
      expect(games).toContain('AksharaPopScene');
    });

    test('should suggest games for least practiced category', () => {
      tracker.profile.skills.alphabet.totalAttempts = 20;
      tracker.profile.skills.vocabulary.totalAttempts = 5;

      const games = engine.suggestNextGame();

      expect(games.length).toBeGreaterThan(0);
    });
  });

  describe('Learning Path Generation', () => {
    test('should generate learning path', () => {
      const path = engine.generateLearningPath();

      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toHaveProperty('category');
      expect(path[0]).toHaveProperty('recommendedGames');
      expect(path[0]).toHaveProperty('difficulty');
    });

    test('should exclude mastered categories', () => {
      tracker.profile.skills.alphabet.level = 3;

      const path = engine.generateLearningPath();

      const alphabetInPath = path.some(p => p.category === 'alphabet');
      expect(alphabetInPath).toBe(false);
    });
  });

  describe('SRS Interval Calculation', () => {
    test('should initialize SRS data for new item', () => {
      const srsData = engine.initializeSRSData('ಅ', 4);

      expect(srsData.easeFactor).toBe(2.5);
      expect(srsData.interval).toBeGreaterThan(0);
      expect(tracker.getSRSData('ಅ')).toBeDefined();
    });

    test('should calculate review interval for existing item', () => {
      tracker.updateSRSData('ಅ', {
        easeFactor: 2.5,
        interval: 1,
        reviewCount: 1
      });

      const newData = engine.calculateReviewInterval('ಅ', 4);

      expect(newData.interval).toBeGreaterThan(1);
      expect(newData.reviewCount).toBe(2);
    });

    test('should reset interval on poor performance', () => {
      tracker.updateSRSData('ಅ', {
        easeFactor: 2.5,
        interval: 10,
        reviewCount: 5
      });

      const newData = engine.calculateReviewInterval('ಅ', 1);

      expect(newData.interval).toBe(1);
    });

    test('should increase interval on good performance', () => {
      tracker.updateSRSData('ಅ', {
        easeFactor: 2.5,
        interval: 1,
        reviewCount: 1
      });

      const newData = engine.calculateReviewInterval('ಅ', 5);

      expect(newData.interval).toBeGreaterThan(1);
    });
  });

  describe('Due Items', () => {
    test('should return items due for review', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      tracker.updateSRSData('ಅ', {
        easeFactor: 2.5,
        interval: 1,
        nextReview: pastDate.toISOString()
      });

      const dueItems = engine.getDueItems('alphabet');

      expect(dueItems.length).toBeGreaterThan(0);
      expect(dueItems[0].item).toBe('ಅ');
      expect(dueItems[0].daysDue).toBeGreaterThan(0);
    });

    test('should not return items not yet due', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      tracker.updateSRSData('ಅ', {
        easeFactor: 2.5,
        interval: 1,
        nextReview: futureDate.toISOString()
      });

      const dueItems = engine.getDueItems('alphabet');

      expect(dueItems.length).toBe(0);
    });
  });

  describe('Learning Velocity Analysis', () => {
    test('should analyze learning velocity', () => {
      const skill = tracker.profile.skills.alphabet;
      skill.totalAttempts = 35;
      skill.accuracy = 0.8;
      skill.masteredLetters = ['ಅ', 'ಆ', 'ಇ'];

      const velocity = engine.analyzeLearningVelocity('alphabet', 7);

      expect(velocity.attemptsPerDay).toBe(5);
      expect(velocity.currentAccuracy).toBe(0.8);
      expect(velocity.masteryRate).toBeCloseTo(0.428, 2);
    });

    test('should handle no attempts', () => {
      const velocity = engine.analyzeLearningVelocity('alphabet', 7);

      expect(velocity.attemptsPerDay).toBe(0);
      expect(velocity.masteryRate).toBe(0);
    });
  });

  describe('Personalized Hints', () => {
    test('should give hints for new items', () => {
      const hint = engine.getPersonalizedHint('alphabet', 'ಅ');

      expect(hint).toContain('new');
    });

    test('should give hints for familiar items', () => {
      tracker.updateSRSData('ಅ', {
        easeFactor: 2.0,
        interval: 3
      });

      const hint = engine.getPersonalizedHint('alphabet', 'ಅ');

      expect(hint).toBeTruthy();
    });
  });

  describe('Success Prediction', () => {
    test('should predict neutral for new students', () => {
      const probability = engine.predictSuccessProbability('alphabet', 'beginner');

      expect(probability).toBe(0.5);
    });

    test('should predict based on accuracy', () => {
      const skill = tracker.profile.skills.alphabet;
      skill.totalAttempts = 20;
      skill.correctAttempts = 16;
      skill.accuracy = 0.8;

      const probability = engine.predictSuccessProbability('alphabet', 'intermediate');

      expect(probability).toBeGreaterThan(0.5);
      expect(probability).toBeLessThanOrEqual(1);
    });

    test('should adjust prediction based on difficulty', () => {
      const skill = tracker.profile.skills.alphabet;
      skill.totalAttempts = 20;
      skill.accuracy = 0.7;

      const beginnerProb = engine.predictSuccessProbability('alphabet', 'beginner');
      const advancedProb = engine.predictSuccessProbability('alphabet', 'advanced');

      expect(beginnerProb).toBeGreaterThan(advancedProb);
    });
  });
});
