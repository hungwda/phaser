/**
 * BasePlugin.js
 *
 * Base class for creating custom Phaser plugins.
 * Provides a template for extensible plugin architecture.
 */

import Phaser from 'phaser';

export class BasePlugin extends Phaser.Plugins.BasePlugin {
  constructor(pluginManager) {
    super(pluginManager);
    this.name = 'BasePlugin';
    this.version = '1.0.0';
  }

  /**
   * Initialize the plugin
   */
  init(data) {
    console.log(`[${this.name}] Initializing...`, data);
  }

  /**
   * Start the plugin
   */
  start() {
    console.log(`[${this.name}] Starting...`);
    this.setupEventListeners();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Override in child classes
  }

  /**
   * Stop the plugin
   */
  stop() {
    console.log(`[${this.name}] Stopping...`);
    this.removeEventListeners();
  }

  /**
   * Remove event listeners
   */
  removeEventListeners() {
    // Override in child classes
  }

  /**
   * Destroy the plugin
   */
  destroy() {
    console.log(`[${this.name}] Destroying...`);
    this.stop();
    super.destroy();
  }
}

export default BasePlugin;
