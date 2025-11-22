/**
 * EventBus.js
 *
 * Central event bus for cross-scene and cross-system communication.
 * Extends Phaser's event system for application-wide events.
 */

import Phaser from 'phaser';

class EventBus extends Phaser.Events.EventEmitter {
  constructor() {
    super();
    this.debugMode = false;
  }

  /**
   * Enable debug mode to log all events
   */
  enableDebug() {
    this.debugMode = true;
  }

  /**
   * Disable debug mode
   */
  disableDebug() {
    this.debugMode = false;
  }

  /**
   * Emit event with optional debug logging
   */
  emit(event, ...args) {
    if (this.debugMode) {
      console.log(`[EventBus] Emitting: ${event}`, args);
    }
    return super.emit(event, ...args);
  }

  /**
   * Listen to event with optional debug logging
   */
  on(event, fn, context) {
    if (this.debugMode) {
      console.log(`[EventBus] Listening to: ${event}`);
    }
    return super.on(event, fn, context);
  }

  /**
   * Remove all listeners for specific event
   */
  removeAllListenersFor(event) {
    this.removeAllListeners(event);
    if (this.debugMode) {
      console.log(`[EventBus] Removed all listeners for: ${event}`);
    }
  }
}

// Export singleton instance
export const eventBus = new EventBus();
export default eventBus;
