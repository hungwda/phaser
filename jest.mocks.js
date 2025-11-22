/**
 * Jest mocks for external dependencies
 */

// Mock for phaser3spectorjs - optional Phaser debugging tool
const phaser3spectorjs = {};

// Mock for Phaser
const mockEventEmitter = class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, fn, context) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push({ fn, context });
    return this;
  }

  emit(event, ...args) {
    if (!this.events[event]) return false;
    this.events[event].forEach(({ fn, context }) => {
      fn.apply(context, args);
    });
    return true;
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }
};

const mockBasePlugin = class BasePlugin {
  constructor(pluginManager) {
    this.pluginManager = pluginManager;
    this.game = pluginManager ? pluginManager.game : null;
  }

  init() {}
  start() {}
  stop() {}
  destroy() {}
};

const Phaser = {
  Events: {
    EventEmitter: mockEventEmitter,
  },
  Plugins: {
    BasePlugin: mockBasePlugin,
  },
  AUTO: 'AUTO',
  Scale: {
    FIT: 'FIT',
    CENTER_BOTH: 'CENTER_BOTH',
  },
};

export { phaser3spectorjs, Phaser };
export default Phaser;
