/**
 * BaseService - Base class for all services
 * Provides common lifecycle methods
 */
export class BaseService {
  constructor(config = {}) {
    this.config = config;
    this.initialized = false;
    this.destroyed = false;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (this.initialized) {
      console.warn(`[${this.constructor.name}] Already initialized`);
      return;
    }

    this.initialized = true;
    console.log(`[${this.constructor.name}] Initialized`);
  }

  /**
   * Destroy and cleanup
   */
  async destroy() {
    if (this.destroyed) {
      console.warn(`[${this.constructor.name}] Already destroyed`);
      return;
    }

    this.destroyed = true;
    this.initialized = false;
    console.log(`[${this.constructor.name}] Destroyed`);
  }

  /**
   * Check if initialized
   */
  isInitialized() {
    return this.initialized && !this.destroyed;
  }
}

export default BaseService;
