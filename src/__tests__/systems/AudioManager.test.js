import { AudioManager } from '../../systems/audio/AudioManager.js';

// Mock Phaser scene
const mockScene = {
  sound: {
    get: jest.fn(),
    play: jest.fn(() => ({
      once: jest.fn(),
      setVolume: jest.fn(),
      stop: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      isPlaying: false,
      isPaused: false
    })),
    stopAll: jest.fn(),
    mute: false
  }
};

describe('AudioManager', () => {
  let audioManager;

  beforeEach(() => {
    audioManager = new AudioManager(mockScene);
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Initialization', () => {
    test('should initialize with default volumes', () => {
      expect(audioManager.masterVolume).toBe(1.0);
      expect(audioManager.sfxVolume).toBe(1.0);
      expect(audioManager.musicVolume).toBe(0.5);
      expect(audioManager.voiceVolume).toBe(1.0);
    });

    test('should initialize with unmuted state', () => {
      expect(audioManager.isMuted).toBe(false);
    });

    test('should load settings from localStorage', () => {
      const settings = {
        masterVolume: 0.8,
        sfxVolume: 0.7,
        musicVolume: 0.3,
        voiceVolume: 0.9,
        isMuted: true,
        musicEnabled: false
      };
      localStorage.setItem('audioSettings', JSON.stringify(settings));

      const newManager = new AudioManager(mockScene);

      expect(newManager.masterVolume).toBe(0.8);
      expect(newManager.sfxVolume).toBe(0.7);
      expect(newManager.musicVolume).toBe(0.3);
      expect(newManager.voiceVolume).toBe(0.9);
      expect(newManager.isMuted).toBe(true);
      expect(newManager.musicEnabled).toBe(false);
    });
  });

  describe('Pronunciation Registration', () => {
    test('should register pronunciation', () => {
      audioManager.registerPronunciation('test_id', 'test_key');

      expect(audioManager.pronunciations.get('test_id')).toBe('test_key');
    });

    test('should register multiple pronunciations from data', () => {
      const data = [
        { id: 'id1', letter: 'ಅ', audioPath: 'audio/letters/a.mp3' },
        { id: 'id2', letter: 'ಆ', audioPath: 'audio/letters/aa.mp3' }
      ];

      audioManager.registerPronunciationsFromData(data);

      expect(audioManager.pronunciations.has('id1')).toBe(true);
      expect(audioManager.pronunciations.has('ಅ')).toBe(true);
      expect(audioManager.pronunciations.has('id2')).toBe(true);
      expect(audioManager.pronunciations.has('ಆ')).toBe(true);
    });
  });

  describe('Audio Playback', () => {
    beforeEach(() => {
      mockScene.sound.get.mockReturnValue(true);
      audioManager.registerPronunciation('ಅ', 'letter_a');
    });

    test('should play pronunciation', () => {
      audioManager.playPronunciation('ಅ');

      expect(mockScene.sound.play).toHaveBeenCalledWith('letter_a', {
        volume: audioManager.masterVolume * audioManager.voiceVolume
      });
    });

    test('should not play when muted', () => {
      audioManager.setMute(true);
      audioManager.playPronunciation('ಅ');

      expect(mockScene.sound.play).not.toHaveBeenCalled();
    });

    test('should play correct sound effect', () => {
      audioManager.playCorrect();

      expect(mockScene.sound.play).toHaveBeenCalledWith('sfx_correct', expect.anything());
    });

    test('should play incorrect sound effect', () => {
      audioManager.playIncorrect();

      expect(mockScene.sound.play).toHaveBeenCalledWith('sfx_wrong', expect.anything());
    });
  });

  describe('Volume Control', () => {
    test('should set master volume', () => {
      audioManager.setMasterVolume(0.5);

      expect(audioManager.masterVolume).toBe(0.5);
    });

    test('should clamp master volume to 0-1', () => {
      audioManager.setMasterVolume(1.5);
      expect(audioManager.masterVolume).toBe(1.0);

      audioManager.setMasterVolume(-0.5);
      expect(audioManager.masterVolume).toBe(0.0);
    });

    test('should set SFX volume', () => {
      audioManager.setSFXVolume(0.7);

      expect(audioManager.sfxVolume).toBe(0.7);
    });

    test('should set music volume', () => {
      audioManager.setMusicVolume(0.3);

      expect(audioManager.musicVolume).toBe(0.3);
    });
  });

  describe('Mute Control', () => {
    test('should toggle mute', () => {
      const result = audioManager.toggleMute();

      expect(result).toBe(true);
      expect(audioManager.isMuted).toBe(true);
      expect(mockScene.sound.mute).toBe(true);
    });

    test('should set mute state', () => {
      audioManager.setMute(true);

      expect(audioManager.isMuted).toBe(true);
      expect(mockScene.sound.mute).toBe(true);
    });
  });

  describe('Settings Persistence', () => {
    test('should save settings to localStorage', () => {
      audioManager.setMasterVolume(0.8);
      audioManager.setSFXVolume(0.6);

      const saved = JSON.parse(localStorage.getItem('audioSettings'));

      expect(saved.masterVolume).toBe(0.8);
      expect(saved.sfxVolume).toBe(0.6);
    });

    test('should get current settings', () => {
      audioManager.setMasterVolume(0.7);
      const settings = audioManager.getSettings();

      expect(settings.masterVolume).toBe(0.7);
      expect(settings).toHaveProperty('sfxVolume');
      expect(settings).toHaveProperty('musicVolume');
      expect(settings).toHaveProperty('voiceVolume');
    });
  });

  describe('Cleanup', () => {
    test('should stop all sounds on destroy', () => {
      audioManager.destroy();

      expect(mockScene.sound.stopAll).toHaveBeenCalled();
    });

    test('should clear pronunciations on destroy', () => {
      audioManager.registerPronunciation('test', 'key');
      audioManager.destroy();

      expect(audioManager.pronunciations.size).toBe(0);
    });
  });
});
