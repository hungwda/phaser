/**
 * ContextManager.js
 *
 * Handles WebGL context loss and restoration.
 * This is crucial for robust applications that need to handle context loss gracefully.
 */

export class ContextManager {
  constructor(game) {
    this.game = game;
    this.contextLost = false;
    this.setupContextHandlers();
  }

  /**
   * Set up context loss and restoration handlers
   */
  setupContextHandlers() {
    const canvas = this.game.canvas;

    if (!canvas) {
      console.warn('Canvas not available for context management');
      return;
    }

    // Handle context loss
    canvas.addEventListener('webglcontextlost', (event) => {
      console.warn('WebGL context lost');
      event.preventDefault();
      this.contextLost = true;
      this.onContextLost();
    }, false);

    // Handle context restoration
    canvas.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
      this.contextLost = false;
      this.onContextRestored();
    }, false);
  }

  /**
   * Called when context is lost
   */
  onContextLost() {
    // Pause the game
    if (this.game.scene.isActive('GameScene')) {
      this.game.scene.pause('GameScene');
    }

    // Emit custom event
    this.game.events.emit('context:lost');

    // Show warning to user
    this.showContextLostWarning();
  }

  /**
   * Called when context is restored
   */
  onContextRestored() {
    // Resume the game
    if (this.game.scene.isPaused('GameScene')) {
      this.game.scene.resume('GameScene');
    }

    // Emit custom event
    this.game.events.emit('context:restored');

    // Hide warning
    this.hideContextLostWarning();

    // Reload textures if needed
    this.reloadTextures();
  }

  /**
   * Show context lost warning
   */
  showContextLostWarning() {
    const warning = document.createElement('div');
    warning.id = 'context-lost-warning';
    warning.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 1000;
      text-align: center;
    `;
    warning.innerHTML = `
      <h2>Graphics Context Lost</h2>
      <p>Attempting to restore...</p>
    `;
    document.body.appendChild(warning);
  }

  /**
   * Hide context lost warning
   */
  hideContextLostWarning() {
    const warning = document.getElementById('context-lost-warning');
    if (warning) {
      warning.remove();
    }
  }

  /**
   * Reload textures after context restoration
   */
  reloadTextures() {
    // This would reload any textures that were lost
    // In a real application, you might need to reload specific textures
    console.log('Reloading textures after context restoration');
  }

  /**
   * Check if context is lost
   */
  isContextLost() {
    return this.contextLost;
  }

  /**
   * Force context loss (for testing)
   */
  forceContextLoss() {
    const gl = this.game.renderer.gl;
    if (gl) {
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) {
        ext.loseContext();
      }
    }
  }

  /**
   * Force context restoration (for testing)
   */
  forceContextRestore() {
    const gl = this.game.renderer.gl;
    if (gl) {
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) {
        ext.restoreContext();
      }
    }
  }
}

export default ContextManager;
