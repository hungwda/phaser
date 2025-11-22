/**
 * EventBus.test.js
 * Test suite for the EventBus utility
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { EventBus } from '../../utils/EventBus.js';

describe('EventBus', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('Constructor', () => {
    test('should create an EventBus instance', () => {
      expect(eventBus).toBeDefined();
      expect(eventBus.debugMode).toBe(false);
    });
  });

  describe('Debug Mode', () => {
    test('should enable debug mode', () => {
      eventBus.enableDebug();
      expect(eventBus.debugMode).toBe(true);
    });

    test('should disable debug mode', () => {
      eventBus.enableDebug();
      eventBus.disableDebug();
      expect(eventBus.debugMode).toBe(false);
    });

    test('should log events when debug mode is enabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      eventBus.enableDebug();

      eventBus.emit('test:event', 'data');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[EventBus] Emitting: test:event',
        ['data']
      );

      consoleSpy.mockRestore();
    });

    test('should not log events when debug mode is disabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      eventBus.emit('test:event', 'data');

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Event Emission', () => {
    test('should emit events', () => {
      const callback = jest.fn();
      eventBus.on('test:event', callback);

      eventBus.emit('test:event', 'data');

      expect(callback).toHaveBeenCalledWith('data');
    });

    test('should emit events with multiple arguments', () => {
      const callback = jest.fn();
      eventBus.on('test:event', callback);

      eventBus.emit('test:event', 'arg1', 'arg2', 'arg3');

      expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    test('should emit events to multiple listeners', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventBus.on('test:event', callback1);
      eventBus.on('test:event', callback2);

      eventBus.emit('test:event', 'data');

      expect(callback1).toHaveBeenCalledWith('data');
      expect(callback2).toHaveBeenCalledWith('data');
    });
  });

  describe('Event Listening', () => {
    test('should add event listeners', () => {
      const callback = jest.fn();

      eventBus.on('test:event', callback);
      eventBus.emit('test:event');

      expect(callback).toHaveBeenCalled();
    });

    test('should log listener addition in debug mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      eventBus.enableDebug();

      eventBus.on('test:event', jest.fn());

      expect(consoleSpy).toHaveBeenCalledWith(
        '[EventBus] Listening to: test:event'
      );

      consoleSpy.mockRestore();
    });

    test('should respect listener context', () => {
      const context = { value: 'test' };
      let capturedContext;

      function callback() {
        capturedContext = this;
      }

      eventBus.on('test:event', callback, context);
      eventBus.emit('test:event');

      expect(capturedContext).toBe(context);
    });
  });

  describe('Remove Listeners', () => {
    test('should remove all listeners for specific event', () => {
      const callback = jest.fn();

      eventBus.on('test:event', callback);
      eventBus.removeAllListenersFor('test:event');
      eventBus.emit('test:event');

      expect(callback).not.toHaveBeenCalled();
    });

    test('should log listener removal in debug mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      eventBus.enableDebug();

      eventBus.on('test:event', jest.fn());
      eventBus.removeAllListenersFor('test:event');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[EventBus] Removed all listeners for: test:event'
      );

      consoleSpy.mockRestore();
    });

    test('should only remove listeners for specified event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventBus.on('test:event1', callback1);
      eventBus.on('test:event2', callback2);

      eventBus.removeAllListenersFor('test:event1');

      eventBus.emit('test:event1');
      eventBus.emit('test:event2');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('Multiple Events', () => {
    test('should handle multiple different events', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventBus.on('event1', callback1);
      eventBus.on('event2', callback2);

      eventBus.emit('event1', 'data1');
      eventBus.emit('event2', 'data2');

      expect(callback1).toHaveBeenCalledWith('data1');
      expect(callback2).toHaveBeenCalledWith('data2');
    });

    test('should not trigger wrong event listeners', () => {
      const callback = jest.fn();

      eventBus.on('test:event1', callback);
      eventBus.emit('test:event2');

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle emitting events with no listeners', () => {
      expect(() => {
        eventBus.emit('nonexistent:event');
      }).not.toThrow();
    });

    test('should handle removing listeners for events that have none', () => {
      expect(() => {
        eventBus.removeAllListenersFor('nonexistent:event');
      }).not.toThrow();
    });

    test('should handle null or undefined event data', () => {
      const callback = jest.fn();
      eventBus.on('test:event', callback);

      eventBus.emit('test:event', null);
      expect(callback).toHaveBeenCalledWith(null);

      eventBus.emit('test:event', undefined);
      expect(callback).toHaveBeenCalledWith(undefined);
    });
  });
});
