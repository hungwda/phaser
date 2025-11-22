/**
 * PerformancePlugin.test.js
 * Test suite for the PerformancePlugin
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { PerformancePlugin } from '../../plugins/PerformancePlugin.js';

describe('PerformancePlugin', () => {
  let plugin;
  let mockPluginManager;
  let mockGame;
  let mockScene;
  let mockText;

  beforeEach(() => {
    // Create mock text object
    mockText = {
      setText: jest.fn(),
      setScrollFactor: jest.fn(),
      setDepth: jest.fn(),
      destroy: jest.fn(),
    };

    // Create mock scene
    mockScene = {
      add: {
        text: jest.fn(() => mockText),
      },
      children: {
        length: 10,
      },
    };

    // Create mock game
    mockGame = {
      loop: {
        actualFps: 60,
        delta: 16.67,
      },
      renderer: {
        type: 1, // WebGL
        gl: {
          getExtension: jest.fn(() => null),
        },
      },
      scene: {
        getScenes: jest.fn(() => [mockScene]),
      },
    };

    // Create mock plugin manager
    mockPluginManager = {
      game: mockGame,
    };

    plugin = new PerformancePlugin(mockPluginManager);
  });

  describe('Constructor', () => {
    test('should create a PerformancePlugin instance', () => {
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('PerformancePlugin');
      expect(plugin.enabled).toBe(false);
      expect(plugin.displayText).toBeNull();
    });

    test('should initialize metrics', () => {
      expect(plugin.metrics).toBeDefined();
      expect(plugin.metrics.fps).toBe(0);
      expect(plugin.metrics.delta).toBe(0);
      expect(plugin.metrics.memory).toBe(0);
      expect(plugin.metrics.drawCalls).toBe(0);
    });
  });

  describe('Init', () => {
    test('should initialize with enabled state', () => {
      plugin.init({ enabled: true });

      expect(plugin.enabled).toBe(true);
    });

    test('should initialize with disabled state', () => {
      plugin.init({ enabled: false });

      expect(plugin.enabled).toBe(false);
    });

    test('should default to disabled when no data provided', () => {
      plugin.init({});

      expect(plugin.enabled).toBe(false);
    });
  });

  describe('Start', () => {
    test('should create display when enabled', () => {
      plugin.init({ enabled: true });
      plugin.start();

      expect(mockScene.add.text).toHaveBeenCalled();
      expect(plugin.displayText).toBe(mockText);
    });

    test('should not create display when disabled', () => {
      plugin.init({ enabled: false });
      plugin.start();

      expect(mockScene.add.text).not.toHaveBeenCalled();
      expect(plugin.displayText).toBeNull();
    });
  });

  describe('Create Display', () => {
    test('should create text display with correct styling', () => {
      plugin.createDisplay();

      expect(mockScene.add.text).toHaveBeenCalledWith(10, 10, '', {
        font: '14px monospace',
        fill: '#00ff00',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: { x: 8, y: 8 },
      });
    });

    test('should set text properties', () => {
      plugin.createDisplay();

      expect(mockText.setScrollFactor).toHaveBeenCalledWith(0);
      expect(mockText.setDepth).toHaveBeenCalledWith(10000);
    });

    test('should handle no active scene', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockGame.scene.getScenes = jest.fn(() => []);

      plugin.createDisplay();

      expect(consoleSpy).toHaveBeenCalledWith('[PerformancePlugin] No active scene found');
      expect(plugin.displayText).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('Update', () => {
    beforeEach(() => {
      plugin.enabled = true;
      plugin.displayText = mockText;
    });

    test('should update FPS metric', () => {
      plugin.update();

      expect(plugin.metrics.fps).toBe(60);
    });

    test('should update delta metric', () => {
      plugin.update();

      expect(plugin.metrics.delta).toBe(16.67);
    });

    test('should update memory metric when available', () => {
      plugin.update();

      expect(plugin.metrics.memory).toBe(10); // usedJSHeapSize / 1048576
    });

    test('should update display text', () => {
      plugin.update();

      expect(mockText.setText).toHaveBeenCalled();
      const textContent = mockText.setText.mock.calls[0][0];
      expect(textContent).toContain('FPS: 60');
      expect(textContent).toContain('Delta: 16.67ms');
    });

    test('should not update when disabled', () => {
      plugin.enabled = false;

      plugin.update();

      expect(mockText.setText).not.toHaveBeenCalled();
    });

    test('should not update when display text is null', () => {
      plugin.displayText = null;

      expect(() => {
        plugin.update();
      }).not.toThrow();
    });

    test('should get renderer info from WebGL', () => {
      const mockDebugInfo = {};
      const mockGLParam = 'Test Renderer';

      mockGame.renderer.gl.getExtension = jest.fn((ext) => {
        if (ext === 'WEBGL_debug_renderer_info') {
          return mockDebugInfo;
        }
        return null;
      });

      mockGame.renderer.gl.getParameter = jest.fn(() => mockGLParam);
      mockDebugInfo.UNMASKED_RENDERER_WEBGL = 'RENDERER_INFO';

      plugin.update();

      expect(plugin.metrics.renderer).toBe(mockGLParam);
    });
  });

  describe('Update Display', () => {
    beforeEach(() => {
      plugin.displayText = mockText;
      plugin.metrics = {
        fps: 60,
        delta: 16.67,
        memory: 100,
      };
    });

    test('should display FPS', () => {
      plugin.updateDisplay();

      const text = mockText.setText.mock.calls[0][0];
      expect(text).toContain('FPS: 60');
    });

    test('should display delta time', () => {
      plugin.updateDisplay();

      const text = mockText.setText.mock.calls[0][0];
      expect(text).toContain('Delta: 16.67ms');
    });

    test('should display memory usage', () => {
      plugin.updateDisplay();

      const text = mockText.setText.mock.calls[0][0];
      expect(text).toContain('Memory: 100MB');
    });

    test('should display object count', () => {
      plugin.updateDisplay();

      const text = mockText.setText.mock.calls[0][0];
      expect(text).toContain('Objects: 10');
    });

    test('should display renderer type for WebGL', () => {
      mockGame.renderer.type = 1;

      plugin.updateDisplay();

      const text = mockText.setText.mock.calls[0][0];
      expect(text).toContain('Renderer: WebGL');
    });

    test('should display renderer type for Canvas', () => {
      mockGame.renderer.type = 0;

      plugin.updateDisplay();

      const text = mockText.setText.mock.calls[0][0];
      expect(text).toContain('Renderer: Canvas');
    });
  });

  describe('Get Object Count', () => {
    test('should count objects in single scene', () => {
      const count = plugin.getObjectCount();

      expect(count).toBe(10);
    });

    test('should count objects across multiple scenes', () => {
      const mockScene2 = { children: { length: 5 } };
      mockGame.scene.getScenes = jest.fn(() => [mockScene, mockScene2]);

      const count = plugin.getObjectCount();

      expect(count).toBe(15);
    });

    test('should handle scenes without children', () => {
      const sceneWithoutChildren = {};
      mockGame.scene.getScenes = jest.fn(() => [sceneWithoutChildren]);

      const count = plugin.getObjectCount();

      expect(count).toBe(0);
    });
  });

  describe('Enable', () => {
    test('should enable performance monitoring', () => {
      plugin.enable();

      expect(plugin.enabled).toBe(true);
    });

    test('should create display if not exists', () => {
      plugin.enable();

      expect(plugin.displayText).toBeDefined();
    });

    test('should not recreate display if already exists', () => {
      plugin.displayText = mockText;
      const originalText = plugin.displayText;

      plugin.enable();

      expect(plugin.displayText).toBe(originalText);
    });
  });

  describe('Disable', () => {
    beforeEach(() => {
      plugin.enabled = true;
      plugin.displayText = mockText;
    });

    test('should disable performance monitoring', () => {
      plugin.disable();

      expect(plugin.enabled).toBe(false);
    });

    test('should destroy display text', () => {
      plugin.disable();

      expect(mockText.destroy).toHaveBeenCalled();
      expect(plugin.displayText).toBeNull();
    });

    test('should handle disabling when display is null', () => {
      plugin.displayText = null;

      expect(() => {
        plugin.disable();
      }).not.toThrow();
    });
  });

  describe('Toggle', () => {
    test('should enable when currently disabled', () => {
      plugin.enabled = false;

      plugin.toggle();

      expect(plugin.enabled).toBe(true);
    });

    test('should disable when currently enabled', () => {
      plugin.enabled = true;
      plugin.displayText = mockText;

      plugin.toggle();

      expect(plugin.enabled).toBe(false);
    });

    test('should toggle multiple times', () => {
      expect(plugin.enabled).toBe(false);

      plugin.toggle();
      expect(plugin.enabled).toBe(true);

      plugin.displayText = mockText; // Set display for disable to work
      plugin.toggle();
      expect(plugin.enabled).toBe(false);
    });
  });

  describe('Destroy', () => {
    test('should destroy display text', () => {
      plugin.displayText = mockText;

      plugin.destroy();

      expect(mockText.destroy).toHaveBeenCalled();
    });

    test('should handle destroy with null display', () => {
      plugin.displayText = null;

      expect(() => {
        plugin.destroy();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle very high FPS', () => {
      mockGame.loop.actualFps = 144;
      plugin.enabled = true;
      plugin.displayText = mockText;

      plugin.update();

      expect(plugin.metrics.fps).toBe(144);
    });

    test('should handle low FPS', () => {
      mockGame.loop.actualFps = 15.5;
      plugin.enabled = true;
      plugin.displayText = mockText;

      plugin.update();

      expect(plugin.metrics.fps).toBe(16); // Rounded
    });

    test('should handle missing performance.memory gracefully', () => {
      const originalMemory = performance.memory;
      delete performance.memory;

      plugin.enabled = true;
      plugin.displayText = mockText;

      expect(() => {
        plugin.update();
      }).not.toThrow();

      performance.memory = originalMemory;
    });
  });
});
