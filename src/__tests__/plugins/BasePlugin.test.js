/**
 * BasePlugin.test.js
 * Test suite for the BasePlugin
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { BasePlugin } from '../../plugins/BasePlugin.js';

describe('BasePlugin', () => {
  let plugin;
  let mockPluginManager;

  beforeEach(() => {
    mockPluginManager = {
      game: {},
    };

    plugin = new BasePlugin(mockPluginManager);
  });

  describe('Constructor', () => {
    test('should create a BasePlugin instance', () => {
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('BasePlugin');
      expect(plugin.version).toBe('1.0.0');
    });

    test('should extend Phaser BasePlugin', () => {
      expect(plugin.pluginManager).toBe(mockPluginManager);
    });
  });

  describe('Init', () => {
    test('should initialize plugin with data', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const initData = { enabled: true };

      plugin.init(initData);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[BasePlugin] Initializing...',
        initData
      );

      consoleSpy.mockRestore();
    });

    test('should initialize plugin without data', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      plugin.init();

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Start', () => {
    test('should start plugin', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const setupSpy = jest.spyOn(plugin, 'setupEventListeners');

      plugin.start();

      expect(consoleSpy).toHaveBeenCalledWith('[BasePlugin] Starting...');
      expect(setupSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      setupSpy.mockRestore();
    });

    test('should call setupEventListeners', () => {
      const setupSpy = jest.spyOn(plugin, 'setupEventListeners');

      plugin.start();

      expect(setupSpy).toHaveBeenCalled();

      setupSpy.mockRestore();
    });
  });

  describe('Setup Event Listeners', () => {
    test('should have setupEventListeners method', () => {
      expect(plugin.setupEventListeners).toBeDefined();
      expect(typeof plugin.setupEventListeners).toBe('function');
    });

    test('should be called during start', () => {
      jest.spyOn(console, 'log').mockImplementation();
      const setupSpy = jest.spyOn(plugin, 'setupEventListeners');

      plugin.start();

      expect(setupSpy).toHaveBeenCalled();

      setupSpy.mockRestore();
      jest.spyOn(console, 'log').mockRestore();
    });

    test('should not throw when called directly', () => {
      expect(() => {
        plugin.setupEventListeners();
      }).not.toThrow();
    });
  });

  describe('Stop', () => {
    test('should stop plugin', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const removeSpy = jest.spyOn(plugin, 'removeEventListeners');

      plugin.stop();

      expect(consoleSpy).toHaveBeenCalledWith('[BasePlugin] Stopping...');
      expect(removeSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      removeSpy.mockRestore();
    });

    test('should call removeEventListeners', () => {
      jest.spyOn(console, 'log').mockImplementation();
      const removeSpy = jest.spyOn(plugin, 'removeEventListeners');

      plugin.stop();

      expect(removeSpy).toHaveBeenCalled();

      removeSpy.mockRestore();
      jest.spyOn(console, 'log').mockRestore();
    });
  });

  describe('Remove Event Listeners', () => {
    test('should have removeEventListeners method', () => {
      expect(plugin.removeEventListeners).toBeDefined();
      expect(typeof plugin.removeEventListeners).toBe('function');
    });

    test('should be called during stop', () => {
      jest.spyOn(console, 'log').mockImplementation();
      const removeSpy = jest.spyOn(plugin, 'removeEventListeners');

      plugin.stop();

      expect(removeSpy).toHaveBeenCalled();

      removeSpy.mockRestore();
      jest.spyOn(console, 'log').mockRestore();
    });

    test('should not throw when called directly', () => {
      expect(() => {
        plugin.removeEventListeners();
      }).not.toThrow();
    });
  });

  describe('Destroy', () => {
    test('should destroy plugin', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const stopSpy = jest.spyOn(plugin, 'stop');

      plugin.destroy();

      expect(consoleSpy).toHaveBeenCalledWith('[BasePlugin] Destroying...');
      expect(stopSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      stopSpy.mockRestore();
    });

    test('should call stop before destroying', () => {
      jest.spyOn(console, 'log').mockImplementation();
      const stopSpy = jest.spyOn(plugin, 'stop');

      plugin.destroy();

      expect(stopSpy).toHaveBeenCalled();

      stopSpy.mockRestore();
      jest.spyOn(console, 'log').mockRestore();
    });
  });

  describe('Plugin Lifecycle', () => {
    test('should follow correct lifecycle: init -> start -> stop -> destroy', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const logs = [];

      consoleSpy.mockImplementation((message) => {
        logs.push(message);
      });

      plugin.init({});
      plugin.start();
      plugin.stop();
      plugin.destroy();

      expect(logs).toContain('[BasePlugin] Initializing...');
      expect(logs).toContain('[BasePlugin] Starting...');
      expect(logs).toContain('[BasePlugin] Stopping...');
      expect(logs).toContain('[BasePlugin] Destroying...');

      consoleSpy.mockRestore();
    });
  });

  describe('Inheritance', () => {
    test('should allow extending BasePlugin', () => {
      class CustomPlugin extends BasePlugin {
        constructor(pluginManager) {
          super(pluginManager);
          this.name = 'CustomPlugin';
          this.customProperty = 'test';
        }

        setupEventListeners() {
          this.listenersSetup = true;
        }

        removeEventListeners() {
          this.listenersRemoved = true;
        }
      }

      const customPlugin = new CustomPlugin(mockPluginManager);

      expect(customPlugin.name).toBe('CustomPlugin');
      expect(customPlugin.customProperty).toBe('test');
      expect(customPlugin.version).toBe('1.0.0');
    });

    test('should call overridden methods in child class', () => {
      class CustomPlugin extends BasePlugin {
        constructor(pluginManager) {
          super(pluginManager);
          this.name = 'CustomPlugin';
          this.setupCalled = false;
          this.removeCalled = false;
        }

        setupEventListeners() {
          this.setupCalled = true;
        }

        removeEventListeners() {
          this.removeCalled = true;
        }
      }

      jest.spyOn(console, 'log').mockImplementation();

      const customPlugin = new CustomPlugin(mockPluginManager);

      customPlugin.start();
      expect(customPlugin.setupCalled).toBe(true);

      customPlugin.stop();
      expect(customPlugin.removeCalled).toBe(true);

      jest.spyOn(console, 'log').mockRestore();
    });
  });

  describe('Plugin Properties', () => {
    test('should have name property', () => {
      expect(plugin.name).toBeDefined();
      expect(typeof plugin.name).toBe('string');
    });

    test('should have version property', () => {
      expect(plugin.version).toBeDefined();
      expect(typeof plugin.version).toBe('string');
      expect(plugin.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('should have pluginManager property', () => {
      expect(plugin.pluginManager).toBeDefined();
      expect(plugin.pluginManager).toBe(mockPluginManager);
    });
  });
});
