/**
 * PerformancePlugin.js
 *
 * Plugin for monitoring and displaying performance metrics.
 * Useful for development and optimization.
 */

import { BasePlugin } from './BasePlugin';

export class PerformancePlugin extends BasePlugin {
  constructor(pluginManager) {
    super(pluginManager);
    this.name = 'PerformancePlugin';
    this.enabled = false;
    this.displayText = null;
    this.metrics = {
      fps: 0,
      delta: 0,
      memory: 0,
      drawCalls: 0
    };
  }

  /**
   * Initialize the plugin
   */
  init(data) {
    super.init(data);
    this.enabled = data?.enabled || false;
  }

  /**
   * Start the plugin
   */
  start() {
    super.start();

    if (this.enabled) {
      this.createDisplay();
    }
  }

  /**
   * Create performance display
   */
  createDisplay() {
    const scene = this.game.scene.getScenes(true)[0];

    if (!scene) {
      console.warn('[PerformancePlugin] No active scene found');
      return;
    }

    this.displayText = scene.add.text(10, 10, '', {
      font: '14px monospace',
      fill: '#00ff00',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: { x: 8, y: 8 }
    });

    this.displayText.setScrollFactor(0);
    this.displayText.setDepth(10000);
  }

  /**
   * Update performance metrics
   */
  update() {
    if (!this.enabled || !this.displayText) {
      return;
    }

    // Get FPS
    this.metrics.fps = Math.round(this.game.loop.actualFps);

    // Get delta time
    this.metrics.delta = this.game.loop.delta;

    // Get memory usage (if available)
    if (performance.memory) {
      this.metrics.memory = Math.round(
        performance.memory.usedJSHeapSize / 1048576
      );
    }

    // Get renderer info
    if (this.game.renderer.gl) {
      const gl = this.game.renderer.gl;
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        this.metrics.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }

    // Update display
    this.updateDisplay();
  }

  /**
   * Update performance display
   */
  updateDisplay() {
    const lines = [
      `FPS: ${this.metrics.fps}`,
      `Delta: ${this.metrics.delta.toFixed(2)}ms`,
      `Memory: ${this.metrics.memory}MB`,
      `Objects: ${this.getObjectCount()}`,
      `Renderer: ${this.game.renderer.type === 1 ? 'WebGL' : 'Canvas'}`
    ];

    this.displayText.setText(lines.join('\n'));
  }

  /**
   * Get total object count across all scenes
   */
  getObjectCount() {
    let count = 0;
    this.game.scene.getScenes(true).forEach(scene => {
      if (scene.children) {
        count += scene.children.length;
      }
    });
    return count;
  }

  /**
   * Enable performance monitoring
   */
  enable() {
    this.enabled = true;
    if (!this.displayText) {
      this.createDisplay();
    }
  }

  /**
   * Disable performance monitoring
   */
  disable() {
    this.enabled = false;
    if (this.displayText) {
      this.displayText.destroy();
      this.displayText = null;
    }
  }

  /**
   * Toggle performance monitoring
   */
  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * Destroy the plugin
   */
  destroy() {
    if (this.displayText) {
      this.displayText.destroy();
    }
    super.destroy();
  }
}

export default PerformancePlugin;
