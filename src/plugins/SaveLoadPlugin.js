/**
 * SaveLoadPlugin.js
 *
 * Plugin for handling game save/load functionality.
 * Uses localStorage with compression and versioning support.
 */

import { BasePlugin } from './BasePlugin';

export class SaveLoadPlugin extends BasePlugin {
  constructor(pluginManager) {
    super(pluginManager);
    this.name = 'SaveLoadPlugin';
    this.storageKey = 'phaser-game-save';
    this.version = '1.0.0';
  }

  /**
   * Save game state
   */
  save(data, slot = 'default') {
    try {
      const saveData = {
        version: this.version,
        timestamp: Date.now(),
        slot: slot,
        data: data
      };

      const serialized = JSON.stringify(saveData);
      const key = `${this.storageKey}-${slot}`;

      localStorage.setItem(key, serialized);

      console.log(`[SaveLoadPlugin] Game saved to slot: ${slot}`);
      return true;
    } catch (error) {
      console.error('[SaveLoadPlugin] Error saving game:', error);
      return false;
    }
  }

  /**
   * Load game state
   */
  load(slot = 'default') {
    try {
      const key = `${this.storageKey}-${slot}`;
      const serialized = localStorage.getItem(key);

      if (!serialized) {
        console.warn(`[SaveLoadPlugin] No save data found for slot: ${slot}`);
        return null;
      }

      const saveData = JSON.parse(serialized);

      // Version check
      if (saveData.version !== this.version) {
        console.warn('[SaveLoadPlugin] Save data version mismatch');
        // Could implement migration logic here
      }

      console.log(`[SaveLoadPlugin] Game loaded from slot: ${slot}`);
      return saveData.data;
    } catch (error) {
      console.error('[SaveLoadPlugin] Error loading game:', error);
      return null;
    }
  }

  /**
   * Delete save data
   */
  deleteSave(slot = 'default') {
    try {
      const key = `${this.storageKey}-${slot}`;
      localStorage.removeItem(key);
      console.log(`[SaveLoadPlugin] Save deleted for slot: ${slot}`);
      return true;
    } catch (error) {
      console.error('[SaveLoadPlugin] Error deleting save:', error);
      return false;
    }
  }

  /**
   * Check if save exists
   */
  hasSave(slot = 'default') {
    const key = `${this.storageKey}-${slot}`;
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all save slots
   */
  getAllSaves() {
    const saves = [];
    const prefix = `${this.storageKey}-`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const slot = key.replace(prefix, '');
        const data = this.load(slot);
        if (data) {
          saves.push({
            slot: slot,
            timestamp: data.timestamp,
            data: data
          });
        }
      }
    }

    return saves;
  }

  /**
   * Auto-save functionality
   */
  enableAutoSave(interval = 60000, slot = 'autosave') {
    this.autoSaveInterval = setInterval(() => {
      // Get current game state
      const gameState = this.getCurrentGameState();
      if (gameState) {
        this.save(gameState, slot);
        console.log('[SaveLoadPlugin] Auto-save complete');
      }
    }, interval);
  }

  /**
   * Disable auto-save
   */
  disableAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Get current game state
   * This should be overridden or configured per game
   */
  getCurrentGameState() {
    // This is a placeholder - should be implemented per game
    const scenes = this.game.scene.getScenes(true);
    const activeScene = scenes.find(s => s.scene.key === 'GameScene');

    if (activeScene && activeScene.gameState) {
      return activeScene.gameState;
    }

    return null;
  }

  /**
   * Destroy the plugin
   */
  destroy() {
    this.disableAutoSave();
    super.destroy();
  }
}

export default SaveLoadPlugin;
