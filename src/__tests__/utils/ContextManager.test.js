/**
 * ContextManager.test.js
 * Test suite for the ContextManager utility
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { ContextManager } from '../../utils/ContextManager.js';

describe('ContextManager', () => {
  let contextManager;
  let mockGame;
  let mockCanvas;
  let mockGL;
  let mockExtension;

  beforeEach(() => {
    // Reset document.body
    document.body.innerHTML = '';

    // Create mock WebGL extension
    mockExtension = {
      loseContext: jest.fn(),
      restoreContext: jest.fn(),
    };

    // Create mock WebGL context
    mockGL = {
      getExtension: jest.fn((name) => {
        if (name === 'WEBGL_lose_context' || name === 'WEBGL_debug_renderer_info') {
          return mockExtension;
        }
        return null;
      }),
    };

    // Create mock canvas
    mockCanvas = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    // Create mock game
    mockGame = {
      canvas: mockCanvas,
      scene: {
        isActive: jest.fn(() => false),
        isPaused: jest.fn(() => false),
        pause: jest.fn(),
        resume: jest.fn(),
      },
      events: {
        emit: jest.fn(),
      },
      renderer: {
        gl: mockGL,
      },
    };

    contextManager = new ContextManager(mockGame);
  });

  describe('Constructor', () => {
    test('should create a ContextManager instance', () => {
      expect(contextManager).toBeDefined();
      expect(contextManager.game).toBe(mockGame);
      expect(contextManager.contextLost).toBe(false);
    });

    test('should set up context handlers', () => {
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith(
        'webglcontextlost',
        expect.any(Function),
        false
      );
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith(
        'webglcontextrestored',
        expect.any(Function),
        false
      );
    });

    test('should handle missing canvas gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const gameWithoutCanvas = { ...mockGame, canvas: null };

      const manager = new ContextManager(gameWithoutCanvas);

      expect(consoleSpy).toHaveBeenCalledWith('Canvas not available for context management');
      expect(manager).toBeDefined();

      consoleSpy.mockRestore();
    });
  });

  describe('Context Loss', () => {
    test('should handle context loss event', () => {
      const event = { preventDefault: jest.fn() };

      // Get the context lost handler
      const contextLostHandler = mockCanvas.addEventListener.mock.calls.find(
        call => call[0] === 'webglcontextlost'
      )[1];

      contextLostHandler(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(contextManager.contextLost).toBe(true);
    });

    test('should pause game when context is lost', () => {
      mockGame.scene.isActive = jest.fn(() => true);
      const event = { preventDefault: jest.fn() };

      const contextLostHandler = mockCanvas.addEventListener.mock.calls.find(
        call => call[0] === 'webglcontextlost'
      )[1];

      contextLostHandler(event);

      expect(mockGame.scene.pause).toHaveBeenCalledWith('GameScene');
    });

    test('should emit context lost event', () => {
      const event = { preventDefault: jest.fn() };

      const contextLostHandler = mockCanvas.addEventListener.mock.calls.find(
        call => call[0] === 'webglcontextlost'
      )[1];

      contextLostHandler(event);

      expect(mockGame.events.emit).toHaveBeenCalledWith('context:lost');
    });

    test('should show context lost warning', () => {
      const event = { preventDefault: jest.fn() };

      const contextLostHandler = mockCanvas.addEventListener.mock.calls.find(
        call => call[0] === 'webglcontextlost'
      )[1];

      contextLostHandler(event);

      const warning = document.getElementById('context-lost-warning');
      expect(warning).toBeDefined();
      expect(warning).not.toBeNull();
    });
  });

  describe('Context Restoration', () => {
    test('should handle context restoration event', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // First lose context
      const lostEvent = { preventDefault: jest.fn() };
      const contextLostHandler = mockCanvas.addEventListener.mock.calls.find(
        call => call[0] === 'webglcontextlost'
      )[1];
      contextLostHandler(lostEvent);

      // Then restore it
      const contextRestoredHandler = mockCanvas.addEventListener.mock.calls.find(
        call => call[0] === 'webglcontextrestored'
      )[1];
      contextRestoredHandler();

      expect(contextManager.contextLost).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('WebGL context restored');

      consoleSpy.mockRestore();
    });

    test('should resume game when context is restored', () => {
      mockGame.scene.isPaused = jest.fn(() => true);

      const contextRestoredHandler = mockCanvas.addEventListener.mock.calls.find(
        call => call[0] === 'webglcontextrestored'
      )[1];

      contextRestoredHandler();

      expect(mockGame.scene.resume).toHaveBeenCalledWith('GameScene');
    });

    test('should emit context restored event', () => {
      const contextRestoredHandler = mockCanvas.addEventListener.mock.calls.find(
        call => call[0] === 'webglcontextrestored'
      )[1];

      contextRestoredHandler();

      expect(mockGame.events.emit).toHaveBeenCalledWith('context:restored');
    });

    test('should hide context lost warning', () => {
      // First show the warning
      const lostEvent = { preventDefault: jest.fn() };
      const contextLostHandler = mockCanvas.addEventListener.mock.calls.find(
        call => call[0] === 'webglcontextlost'
      )[1];
      contextLostHandler(lostEvent);

      // Verify warning exists
      let warning = document.getElementById('context-lost-warning');
      expect(warning).not.toBeNull();

      // Then restore context
      const contextRestoredHandler = mockCanvas.addEventListener.mock.calls.find(
        call => call[0] === 'webglcontextrestored'
      )[1];
      contextRestoredHandler();

      // Verify warning is removed
      warning = document.getElementById('context-lost-warning');
      expect(warning).toBeNull();
    });
  });

  describe('Context Status', () => {
    test('should return false when context is not lost', () => {
      expect(contextManager.isContextLost()).toBe(false);
    });

    test('should return true when context is lost', () => {
      const event = { preventDefault: jest.fn() };
      const contextLostHandler = mockCanvas.addEventListener.mock.calls.find(
        call => call[0] === 'webglcontextlost'
      )[1];

      contextLostHandler(event);

      expect(contextManager.isContextLost()).toBe(true);
    });
  });

  describe('Force Context Loss', () => {
    test('should force context loss when extension is available', () => {
      contextManager.forceContextLoss();

      expect(mockGL.getExtension).toHaveBeenCalledWith('WEBGL_lose_context');
      expect(mockExtension.loseContext).toHaveBeenCalled();
    });

    test('should handle missing WebGL context', () => {
      const gameWithoutGL = {
        ...mockGame,
        renderer: { gl: null },
      };
      const manager = new ContextManager(gameWithoutGL);

      expect(() => {
        manager.forceContextLoss();
      }).not.toThrow();
    });

    test('should handle missing extension', () => {
      mockGL.getExtension = jest.fn(() => null);

      expect(() => {
        contextManager.forceContextLoss();
      }).not.toThrow();
    });
  });

  describe('Force Context Restore', () => {
    test('should force context restore when extension is available', () => {
      contextManager.forceContextRestore();

      expect(mockGL.getExtension).toHaveBeenCalledWith('WEBGL_lose_context');
      expect(mockExtension.restoreContext).toHaveBeenCalled();
    });

    test('should handle missing WebGL context', () => {
      const gameWithoutGL = {
        ...mockGame,
        renderer: { gl: null },
      };
      const manager = new ContextManager(gameWithoutGL);

      expect(() => {
        manager.forceContextRestore();
      }).not.toThrow();
    });

    test('should handle missing extension', () => {
      mockGL.getExtension = jest.fn(() => null);

      expect(() => {
        contextManager.forceContextRestore();
      }).not.toThrow();
    });
  });

  describe('Warning Display', () => {
    test('should create warning element with correct styling', () => {
      contextManager.showContextLostWarning();

      const warning = document.getElementById('context-lost-warning');
      expect(warning).not.toBeNull();
      expect(warning.style.position).toBe('absolute');
      expect(warning.innerHTML).toContain('Graphics Context Lost');
    });

    test('should remove warning element when hidden', () => {
      contextManager.showContextLostWarning();
      let warning = document.getElementById('context-lost-warning');
      expect(warning).not.toBeNull();

      contextManager.hideContextLostWarning();
      warning = document.getElementById('context-lost-warning');
      expect(warning).toBeNull();
    });

    test('should handle hiding warning when it does not exist', () => {
      expect(() => {
        contextManager.hideContextLostWarning();
      }).not.toThrow();
    });
  });

  describe('Texture Reloading', () => {
    test('should log texture reload message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      contextManager.reloadTextures();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Reloading textures after context restoration'
      );

      consoleSpy.mockRestore();
    });
  });
});
