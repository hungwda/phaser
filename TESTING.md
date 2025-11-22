# Testing Guide

This document provides information about the test suite for the Phaser Robust Game application.

## Overview

The project uses [Jest](https://jestjs.io/) as the testing framework with jsdom environment for browser API simulation.

## Test Structure

```
src/
├── __tests__/
│   ├── config/
│   │   └── GameConfig.test.js
│   ├── plugins/
│   │   ├── BasePlugin.test.js
│   │   ├── PerformancePlugin.test.js
│   │   └── SaveLoadPlugin.test.js
│   └── utils/
│       ├── AssetManager.test.js
│       ├── ContextManager.test.js
│       └── EventBus.test.js
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Coverage

The test suite covers the following modules:

### Utilities (`src/utils/`)
- **EventBus** - Event system for cross-scene communication
  - Event emission and listening
  - Debug mode functionality
  - Listener management
  - Edge cases (null/undefined data, multiple listeners, etc.)

- **AssetManager** - Asset loading and management
  - Image, sprite sheet, and audio loading
  - Asset manifest management
  - Base64 and Blob loading
  - Asset tracking and cleanup
  - Progress monitoring

- **ContextManager** - WebGL context loss/restoration handling
  - Context loss detection
  - Context restoration
  - Warning display
  - Game pause/resume on context events
  - Force context loss/restore for testing

### Plugins (`src/plugins/`)
- **BasePlugin** - Base class for all plugins
  - Plugin lifecycle (init, start, stop, destroy)
  - Event listener setup/teardown
  - Plugin inheritance

- **SaveLoadPlugin** - Save/load functionality
  - Save/load game state to localStorage
  - Multiple save slots
  - Auto-save functionality
  - Version management
  - Error handling

- **PerformancePlugin** - Performance monitoring
  - FPS tracking
  - Memory usage monitoring
  - Object count tracking
  - Display toggle functionality
  - Renderer information

### Configuration (`src/config/`)
- **GameConfig** - Game configuration and constants
  - Game configuration validation
  - Environment-specific settings
  - Scene, asset, and event constants
  - Type checking

## Test Configuration

### jest.config.js
The Jest configuration includes:
- **Test environment**: jsdom (for browser APIs)
- **Module name mapping**: Path aliases (@config, @scenes, @utils, @plugins)
- **Coverage collection**: All source files except main.js and config files
- **Setup file**: jest.setup.js for test environment setup

### jest.setup.js
The setup file configures:
- localStorage mock
- performance.memory mock
- document methods mock
- Image mock
- URL.createObjectURL mock

## Writing Tests

### Test File Structure
```javascript
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { ModuleToTest } from '../../path/to/module.js';

describe('ModuleToTest', () => {
  let instance;

  beforeEach(() => {
    // Setup code
    instance = new ModuleToTest();
  });

  describe('Feature', () => {
    test('should do something', () => {
      // Test code
      expect(instance.someMethod()).toBe(expectedValue);
    });
  });
});
```

### Best Practices
1. **Organize tests by feature** - Group related tests in describe blocks
2. **Use descriptive test names** - Test names should clearly state what is being tested
3. **Clean up after tests** - Use beforeEach/afterEach for setup and teardown
4. **Mock external dependencies** - Mock Phaser objects, DOM APIs, etc.
5. **Test edge cases** - Include tests for error conditions and boundary cases
6. **Aim for high coverage** - Strive for at least 80% code coverage

### Mocking Phaser Objects

Example of mocking a Phaser scene:
```javascript
const mockScene = {
  add: {
    text: jest.fn(() => mockText),
    sprite: jest.fn(() => mockSprite),
  },
  load: {
    image: jest.fn(),
    spritesheet: jest.fn(),
  },
  textures: {
    exists: jest.fn(() => false),
  },
};
```

### Testing Async Code

Example of testing with timers:
```javascript
test('should auto-save after interval', () => {
  jest.useFakeTimers();

  plugin.enableAutoSave(1000);

  jest.advanceTimersByTime(1000);

  expect(plugin.hasSave('autosave')).toBe(true);

  jest.useRealTimers();
});
```

## Coverage Goals

Target coverage metrics:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Continuous Integration

Tests should be run as part of the CI/CD pipeline:
```bash
# Run linter
npm run lint

# Run tests with coverage
npm run test:coverage

# Build project
npm run build
```

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Check that path aliases are correctly configured in jest.config.js
   - Ensure import paths use the correct aliases (@config, @utils, etc.)

2. **Phaser-related errors**
   - Mock Phaser objects and APIs in your tests
   - Use jest.setup.js for global mocks

3. **Timeout errors**
   - Use `jest.useFakeTimers()` for testing time-based code
   - Increase Jest timeout if needed: `jest.setTimeout(10000)`

4. **Coverage not collecting**
   - Check that files are in the `collectCoverageFrom` pattern
   - Ensure test files match the `testMatch` pattern

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Jest DOM Testing](https://testing-library.com/docs/dom-testing-library/intro)
- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)

## Contributing

When adding new features:
1. Write tests for new functionality
2. Ensure existing tests still pass
3. Maintain or improve code coverage
4. Update this document if needed
