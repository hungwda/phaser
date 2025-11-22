/**
 * SaveLoadPlugin.test.js
 * Test suite for the SaveLoadPlugin
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { SaveLoadPlugin } from '../../plugins/SaveLoadPlugin.js';

describe('SaveLoadPlugin', () => {
  let plugin;
  let mockPluginManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Create mock plugin manager
    mockPluginManager = {
      game: {
        scene: {
          getScenes: jest.fn(() => []),
        },
      },
    };

    plugin = new SaveLoadPlugin(mockPluginManager);
  });

  afterEach(() => {
    // Clean up intervals
    if (plugin.autoSaveInterval) {
      clearInterval(plugin.autoSaveInterval);
    }
  });

  describe('Constructor', () => {
    test('should create a SaveLoadPlugin instance', () => {
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('SaveLoadPlugin');
      expect(plugin.storageKey).toBe('phaser-game-save');
      expect(plugin.version).toBe('1.0.0');
    });
  });

  describe('Save', () => {
    test('should save game data to localStorage', () => {
      const gameData = { score: 100, level: 5 };
      const result = plugin.save(gameData, 'test-slot');

      expect(result).toBe(true);
      expect(localStorage.getItem('phaser-game-save-test-slot')).not.toBeNull();
    });

    test('should save data with timestamp and version', () => {
      const gameData = { score: 100, level: 5 };
      plugin.save(gameData, 'test-slot');

      const saved = JSON.parse(localStorage.getItem('phaser-game-save-test-slot'));

      expect(saved.version).toBe('1.0.0');
      expect(saved.timestamp).toBeDefined();
      expect(saved.slot).toBe('test-slot');
      expect(saved.data).toEqual(gameData);
    });

    test('should use default slot when not specified', () => {
      const gameData = { score: 100 };
      plugin.save(gameData);

      expect(localStorage.getItem('phaser-game-save-default')).not.toBeNull();
    });

    test('should log save success', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const gameData = { score: 100 };

      plugin.save(gameData, 'test-slot');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SaveLoadPlugin] Game saved to slot: test-slot'
      );

      consoleSpy.mockRestore();
    });

    test('should handle save errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock setItem to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage full');
      });

      const result = plugin.save({ data: 'test' }, 'test-slot');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      localStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });

    test('should overwrite existing save in same slot', () => {
      plugin.save({ score: 100 }, 'test-slot');
      plugin.save({ score: 200 }, 'test-slot');

      const loaded = plugin.load('test-slot');
      expect(loaded.score).toBe(200);
    });
  });

  describe('Load', () => {
    test('should load saved game data', () => {
      const gameData = { score: 100, level: 5 };
      plugin.save(gameData, 'test-slot');

      const loaded = plugin.load('test-slot');

      expect(loaded).toEqual(gameData);
    });

    test('should use default slot when not specified', () => {
      const gameData = { score: 100 };
      plugin.save(gameData);

      const loaded = plugin.load();

      expect(loaded).toEqual(gameData);
    });

    test('should return null when no save exists', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const loaded = plugin.load('nonexistent-slot');

      expect(loaded).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[SaveLoadPlugin] No save data found for slot: nonexistent-slot'
      );

      consoleSpy.mockRestore();
    });

    test('should warn on version mismatch', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Manually create save with different version
      const saveData = {
        version: '2.0.0',
        timestamp: Date.now(),
        slot: 'test-slot',
        data: { score: 100 },
      };
      localStorage.setItem('phaser-game-save-test-slot', JSON.stringify(saveData));

      const loaded = plugin.load('test-slot');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SaveLoadPlugin] Save data version mismatch'
      );
      expect(loaded).toEqual({ score: 100 });

      consoleSpy.mockRestore();
    });

    test('should handle corrupted save data', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      localStorage.setItem('phaser-game-save-test-slot', 'invalid json');

      const loaded = plugin.load('test-slot');

      expect(loaded).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should log successful load', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      plugin.save({ score: 100 }, 'test-slot');
      plugin.load('test-slot');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SaveLoadPlugin] Game loaded from slot: test-slot'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Delete Save', () => {
    test('should delete save data', () => {
      plugin.save({ score: 100 }, 'test-slot');
      expect(localStorage.getItem('phaser-game-save-test-slot')).not.toBeNull();

      const result = plugin.deleteSave('test-slot');

      expect(result).toBe(true);
      expect(localStorage.getItem('phaser-game-save-test-slot')).toBeNull();
    });

    test('should use default slot when not specified', () => {
      plugin.save({ score: 100 });
      plugin.deleteSave();

      expect(localStorage.getItem('phaser-game-save-default')).toBeNull();
    });

    test('should log deletion success', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      plugin.save({ score: 100 }, 'test-slot');
      plugin.deleteSave('test-slot');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SaveLoadPlugin] Save deleted for slot: test-slot'
      );

      consoleSpy.mockRestore();
    });

    test('should handle deletion errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock removeItem to throw an error
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = jest.fn(() => {
        throw new Error('Deletion failed');
      });

      const result = plugin.deleteSave('test-slot');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      localStorage.removeItem = originalRemoveItem;
      consoleSpy.mockRestore();
    });
  });

  describe('Has Save', () => {
    test('should return true when save exists', () => {
      plugin.save({ score: 100 }, 'test-slot');

      expect(plugin.hasSave('test-slot')).toBe(true);
    });

    test('should return false when save does not exist', () => {
      expect(plugin.hasSave('nonexistent-slot')).toBe(false);
    });

    test('should use default slot when not specified', () => {
      plugin.save({ score: 100 });

      expect(plugin.hasSave()).toBe(true);
    });
  });

  describe('Get All Saves', () => {
    test('should return empty array when no saves exist', () => {
      const saves = plugin.getAllSaves();

      expect(saves).toEqual([]);
    });

    test('should return all saves', () => {
      plugin.save({ score: 100 }, 'slot1');
      plugin.save({ score: 200 }, 'slot2');
      plugin.save({ score: 300 }, 'slot3');

      const saves = plugin.getAllSaves();

      expect(saves.length).toBe(3);
    });

    test('should include save metadata', () => {
      plugin.save({ score: 100 }, 'test-slot');

      const saves = plugin.getAllSaves();

      expect(saves[0].slot).toBe('test-slot');
      expect(saves[0].data).toEqual({ score: 100 });
      expect(saves[0].timestamp).toBeDefined();
    });

    test('should not include saves from other applications', () => {
      plugin.save({ score: 100 }, 'game-slot');
      localStorage.setItem('other-app-save', 'data');

      const saves = plugin.getAllSaves();

      expect(saves.length).toBe(1);
      expect(saves[0].slot).toBe('game-slot');
    });
  });

  describe('Auto-Save', () => {
    test('should enable auto-save with default interval', () => {
      jest.useFakeTimers();

      const mockGameState = { score: 100 };
      plugin.getCurrentGameState = jest.fn(() => mockGameState);

      plugin.enableAutoSave();

      expect(plugin.autoSaveInterval).toBeDefined();

      jest.advanceTimersByTime(60000);
      expect(plugin.hasSave('autosave')).toBe(true);

      jest.useRealTimers();
    });

    test('should enable auto-save with custom interval and slot', () => {
      jest.useFakeTimers();

      const mockGameState = { score: 200 };
      plugin.getCurrentGameState = jest.fn(() => mockGameState);

      plugin.enableAutoSave(30000, 'custom-autosave');

      jest.advanceTimersByTime(30000);
      expect(plugin.hasSave('custom-autosave')).toBe(true);

      jest.useRealTimers();
    });

    test('should not save if no game state available', () => {
      jest.useFakeTimers();

      plugin.getCurrentGameState = jest.fn(() => null);
      plugin.enableAutoSave(1000);

      jest.advanceTimersByTime(1000);
      expect(plugin.hasSave('autosave')).toBe(false);

      jest.useRealTimers();
    });

    test('should log auto-save completion', () => {
      jest.useFakeTimers();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const mockGameState = { score: 100 };
      plugin.getCurrentGameState = jest.fn(() => mockGameState);

      plugin.enableAutoSave(1000);
      jest.advanceTimersByTime(1000);

      expect(consoleSpy).toHaveBeenCalledWith('[SaveLoadPlugin] Auto-save complete');

      consoleSpy.mockRestore();
      jest.useRealTimers();
    });
  });

  describe('Disable Auto-Save', () => {
    test('should disable auto-save', () => {
      jest.useFakeTimers();

      plugin.getCurrentGameState = jest.fn(() => ({ score: 100 }));
      plugin.enableAutoSave(1000);

      expect(plugin.autoSaveInterval).toBeDefined();

      plugin.disableAutoSave();

      expect(plugin.autoSaveInterval).toBeNull();

      jest.useRealTimers();
    });

    test('should not throw when disabling already disabled auto-save', () => {
      expect(() => {
        plugin.disableAutoSave();
      }).not.toThrow();
    });
  });

  describe('Get Current Game State', () => {
    test('should return null when no active GameScene', () => {
      const state = plugin.getCurrentGameState();

      expect(state).toBeNull();
    });

    test('should return game state from active GameScene', () => {
      const mockGameState = { score: 100, level: 5 };
      const mockScene = {
        scene: { key: 'GameScene' },
        gameState: mockGameState,
      };

      mockPluginManager.game.scene.getScenes = jest.fn(() => [mockScene]);

      const state = plugin.getCurrentGameState();

      expect(state).toEqual(mockGameState);
    });

    test('should return null when GameScene has no gameState', () => {
      const mockScene = {
        scene: { key: 'GameScene' },
      };

      mockPluginManager.game.scene.getScenes = jest.fn(() => [mockScene]);

      const state = plugin.getCurrentGameState();

      expect(state).toBeNull();
    });
  });

  describe('Destroy', () => {
    test('should disable auto-save on destroy', () => {
      jest.useFakeTimers();

      plugin.getCurrentGameState = jest.fn(() => ({ score: 100 }));
      plugin.enableAutoSave();

      expect(plugin.autoSaveInterval).toBeDefined();

      plugin.destroy();

      expect(plugin.autoSaveInterval).toBeNull();

      jest.useRealTimers();
    });
  });
});
