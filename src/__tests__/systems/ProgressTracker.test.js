import { ProgressTracker } from '../../systems/learning/ProgressTracker.js';
import { EventBus } from '../../utils/EventBus.js';

describe('ProgressTracker', () => {
  let tracker;

  beforeEach(() => {
    localStorage.clear();
    tracker = new ProgressTracker();
    EventBus.removeAllListeners();
  });

  afterEach(() => {
    EventBus.removeAllListeners();
  });

  describe('Initialization', () => {
    test('should create default profile', () => {
      expect(tracker.profile).toBeDefined();
      expect(tracker.profile.version).toBe('1.0.0');
      expect(tracker.profile.progress.totalScore).toBe(0);
    });

    test('should have all skill categories', () => {
      expect(tracker.profile.skills).toHaveProperty('alphabet');
      expect(tracker.profile.skills).toHaveProperty('vocabulary');
      expect(tracker.profile.skills).toHaveProperty('words');
      expect(tracker.profile.skills).toHaveProperty('sentences');
      expect(tracker.profile.skills).toHaveProperty('reading');
      expect(tracker.profile.skills).toHaveProperty('listening');
    });

    test('should generate unique profile ID', () => {
      const id1 = tracker.generateProfileId();
      const id2 = tracker.generateProfileId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^player_/);
    });
  });

  describe('Profile Persistence', () => {
    test('should save profile to localStorage', () => {
      tracker.saveProfile();

      const saved = localStorage.getItem('kannada_learning_progress');
      expect(saved).toBeDefined();

      const profile = JSON.parse(saved);
      expect(profile.version).toBe('1.0.0');
    });

    test('should load profile from localStorage', () => {
      const testProfile = tracker.createDefaultProfile();
      testProfile.playerName = 'Test Player';
      testProfile.progress.totalScore = 100;

      localStorage.setItem('kannada_learning_progress', JSON.stringify(testProfile));

      const newTracker = new ProgressTracker();

      expect(newTracker.profile.playerName).toBe('Test Player');
      expect(newTracker.profile.progress.totalScore).toBe(100);
    });

    test('should emit save event', () => {
      const callback = jest.fn();
      EventBus.on('progress:saved', callback);

      tracker.saveProfile();

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Game Completion', () => {
    test('should record game completion', () => {
      tracker.addGameCompletion('TestGame', 100);

      expect(tracker.profile.gameHistory.TestGame).toBeDefined();
      expect(tracker.profile.gameHistory.TestGame.plays).toBe(1);
      expect(tracker.profile.gameHistory.TestGame.bestScore).toBe(100);
    });

    test('should update best score', () => {
      tracker.addGameCompletion('TestGame', 100);
      tracker.addGameCompletion('TestGame', 150);

      expect(tracker.profile.gameHistory.TestGame.bestScore).toBe(150);
    });

    test('should calculate average score', () => {
      tracker.addGameCompletion('TestGame', 100);
      tracker.addGameCompletion('TestGame', 200);

      expect(tracker.profile.gameHistory.TestGame.averageScore).toBe(150);
    });

    test('should update global progress', () => {
      tracker.addGameCompletion('TestGame', 100);

      expect(tracker.profile.progress.gamesPlayed).toBe(1);
      expect(tracker.profile.progress.totalScore).toBe(100);
    });

    test('should emit game recorded event', () => {
      const callback = jest.fn();
      EventBus.on('game:recorded', callback);

      tracker.addGameCompletion('TestGame', 100);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Letter Learning', () => {
    test('should mark letter as learned', () => {
      tracker.markLetterLearned('ಅ');

      expect(tracker.profile.skills.alphabet.masteredLetters).toContain('ಅ');
    });

    test('should not duplicate learned letters', () => {
      tracker.markLetterLearned('ಅ');
      tracker.markLetterLearned('ಅ');

      expect(tracker.profile.skills.alphabet.masteredLetters.length).toBe(1);
    });

    test('should emit letter mastered event', () => {
      const callback = jest.fn();
      EventBus.on('letter:mastered', callback);

      tracker.markLetterLearned('ಅ');

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        letter: 'ಅ',
        totalMastered: 1
      }));
    });
  });

  describe('Word Learning', () => {
    test('should mark word as learned', () => {
      tracker.markWordLearned('ನಾಯಿ');

      expect(tracker.profile.skills.vocabulary.masteredWords).toContain('ನಾಯಿ');
    });

    test('should not duplicate learned words', () => {
      tracker.markWordLearned('ನಾಯಿ');
      tracker.markWordLearned('ನಾಯಿ');

      expect(tracker.profile.skills.vocabulary.masteredWords.length).toBe(1);
    });
  });

  describe('Attempt Recording', () => {
    test('should record correct attempt', () => {
      tracker.recordAttempt('alphabet', 'ಅ', true);

      const skill = tracker.profile.skills.alphabet;
      expect(skill.totalAttempts).toBe(1);
      expect(skill.correctAttempts).toBe(1);
      expect(skill.accuracy).toBe(1.0);
    });

    test('should record incorrect attempt', () => {
      tracker.recordAttempt('alphabet', 'ಅ', false);

      const skill = tracker.profile.skills.alphabet;
      expect(skill.totalAttempts).toBe(1);
      expect(skill.correctAttempts).toBe(0);
      expect(skill.accuracy).toBe(0);
    });

    test('should calculate accuracy correctly', () => {
      tracker.recordAttempt('alphabet', 'ಅ', true);
      tracker.recordAttempt('alphabet', 'ಆ', true);
      tracker.recordAttempt('alphabet', 'ಇ', false);

      const skill = tracker.profile.skills.alphabet;
      expect(skill.accuracy).toBeCloseTo(0.667, 2);
    });
  });

  describe('Achievements', () => {
    test('should unlock achievement', () => {
      tracker.unlockAchievement('first_game');

      expect(tracker.profile.achievements).toHaveLength(1);
      expect(tracker.profile.achievements[0].id).toBe('first_game');
    });

    test('should not duplicate achievements', () => {
      tracker.unlockAchievement('first_game');
      tracker.unlockAchievement('first_game');

      expect(tracker.profile.achievements).toHaveLength(1);
    });

    test('should check if achievement is unlocked', () => {
      tracker.unlockAchievement('first_game');

      expect(tracker.hasAchievement('first_game')).toBe(true);
      expect(tracker.hasAchievement('other_achievement')).toBe(false);
    });
  });

  describe('SRS Data', () => {
    test('should update SRS data', () => {
      const srsData = {
        easeFactor: 2.5,
        interval: 1,
        nextReview: new Date().toISOString()
      };

      tracker.updateSRSData('ಅ', srsData);

      expect(tracker.profile.srsData['ಅ']).toEqual(srsData);
    });

    test('should get SRS data', () => {
      const srsData = { easeFactor: 2.5, interval: 1 };
      tracker.updateSRSData('ಅ', srsData);

      const retrieved = tracker.getSRSData('ಅ');

      expect(retrieved).toEqual(srsData);
    });
  });

  describe('Profile Summary', () => {
    test('should return profile summary', () => {
      tracker.markLetterLearned('ಅ');
      tracker.markWordLearned('ನಾಯಿ');
      tracker.addGameCompletion('TestGame', 100);

      const summary = tracker.getProfileSummary();

      expect(summary.lettersLearned).toBe(1);
      expect(summary.wordsLearned).toBe(1);
      expect(summary.gamesPlayed).toBe(1);
      expect(summary.totalScore).toBe(100);
    });
  });

  describe('Strengths and Weaknesses', () => {
    test('should identify strengths', () => {
      const skill = tracker.profile.skills.alphabet;
      skill.totalAttempts = 20;
      skill.correctAttempts = 18;
      skill.accuracy = 0.9;

      const { strengths, weaknesses } = tracker.getStrengthsWeaknesses();

      expect(strengths.length).toBeGreaterThan(0);
      expect(strengths[0].category).toBe('alphabet');
    });

    test('should identify weaknesses', () => {
      const skill = tracker.profile.skills.alphabet;
      skill.totalAttempts = 20;
      skill.correctAttempts = 10;
      skill.accuracy = 0.5;

      const { strengths, weaknesses } = tracker.getStrengthsWeaknesses();

      expect(weaknesses.length).toBeGreaterThan(0);
      expect(weaknesses[0].category).toBe('alphabet');
    });
  });

  describe('Settings', () => {
    test('should set player name', () => {
      tracker.setPlayerName('New Name');

      expect(tracker.profile.playerName).toBe('New Name');
    });

    test('should set difficulty', () => {
      tracker.setDifficulty('advanced');

      expect(tracker.profile.settings.difficulty).toBe('advanced');
    });
  });

  describe('Profile Reset', () => {
    test('should reset profile', () => {
      tracker.addGameCompletion('TestGame', 100);
      tracker.markLetterLearned('ಅ');

      tracker.resetProfile();

      expect(tracker.profile.progress.gamesPlayed).toBe(0);
      expect(tracker.profile.skills.alphabet.masteredLetters).toHaveLength(0);
    });

    test('should emit reset event', () => {
      const callback = jest.fn();
      EventBus.on('progress:reset', callback);

      tracker.resetProfile();

      expect(callback).toHaveBeenCalled();
    });
  });
});
