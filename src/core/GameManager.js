/**
 * GameManager - Main application manager (Singleton)
 * Coordinates all services and manages application lifecycle
 */
export class GameManager {
  static instance = null;

  constructor() {
    if (GameManager.instance) {
      return GameManager.instance;
    }

    this.services = new Map();
    this.initialized = false;
    this.game = null;
    this.stateStore = null;
    this.listeners = new Map();

    GameManager.instance = this;
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  /**
   * Initialize the game manager
   */
  async initialize(config = {}) {
    if (this.initialized) {
      console.warn('[GameManager] Already initialized');
      return;
    }

    console.log('[GameManager] Initializing...');

    // Store config
    this.config = {
      debug: false,
      locale: 'en',
      ...config
    };

    try {
      // Initialize services
      await this.initializeServices();

      // Setup global error handling
      this.setupErrorHandling();

      // Initialize state
      this.initializeState();

      // Setup viewport listeners
      this.setupViewportListeners();

      this.initialized = true;
      console.log('[GameManager] Initialized successfully');

      this.emit('initialized');
    } catch (error) {
      console.error('[GameManager] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize all services
   */
  async initializeServices() {
    // Services will be registered by ServiceRegistry
    console.log('[GameManager] Services initialized');
  }

  /**
   * Initialize state store
   */
  initializeState() {
    // StateStore is set externally
    if (!this.stateStore) {
      throw new Error('StateStore not set');
    }

    // Subscribe to state changes
    this.stateStore.subscribe((state) => {
      this.onStateChange(state);
    });
  }

  /**
   * Setup global error handling
   */
  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message));
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason);
    });
  }

  /**
   * Setup viewport change listeners
   */
  setupViewportListeners() {
    const viewport = this.getService('viewport');
    if (viewport) {
      viewport.onResize(() => {
        this.emit('viewport:resize', viewport.getState());
      });
    }
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error('[GameManager] Error:', error);

    const errorService = this.getService('error');
    if (errorService) {
      errorService.handleError(error);
    }

    this.emit('error', error);
  }

  /**
   * Register a service
   */
  registerService(name, service) {
    if (this.services.has(name)) {
      console.warn(`[GameManager] Service ${name} already registered`);
    }

    this.services.set(name, service);
    console.log(`[GameManager] Registered service: ${name}`);
  }

  /**
   * Get a service
   */
  getService(name) {
    if (!this.services.has(name)) {
      console.warn(`[GameManager] Service not found: ${name}`);
      return null;
    }

    return this.services.get(name);
  }

  /**
   * Set the Phaser game instance
   */
  setGame(game) {
    this.game = game;
  }

  /**
   * Set the state store
   */
  setStateStore(store) {
    this.stateStore = store;
  }

  /**
   * Get current state
   */
  getState() {
    return this.stateStore ? this.stateStore.getState() : null;
  }

  /**
   * Dispatch action to state store
   */
  dispatch(action) {
    if (!this.stateStore) {
      console.warn('[GameManager] StateStore not available');
      return;
    }

    this.stateStore.dispatch(action);
  }

  /**
   * Handle state changes
   */
  onStateChange(state) {
    if (this.config.debug) {
      console.log('[GameManager] State changed:', state);
    }

    this.emit('state:change', state);
  }

  /**
   * Emit event
   */
  emit(event, data) {
    if (!this.listeners.has(event)) {
      return;
    }

    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[GameManager] Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Listen to event
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this.listeners.has(event)) {
      return;
    }

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);

    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Pause the game
   */
  pause() {
    if (this.game && this.game.isPaused === false) {
      this.game.pause();
      this.dispatch({ type: 'GAME_PAUSE' });
      this.emit('paused');
    }
  }

  /**
   * Resume the game
   */
  resume() {
    if (this.game && this.game.isPaused === true) {
      this.game.resume();
      this.dispatch({ type: 'GAME_RESUME' });
      this.emit('resumed');
    }
  }

  /**
   * Destroy and cleanup
   */
  async destroy() {
    console.log('[GameManager] Destroying...');

    // Destroy all services
    for (const [name, service] of this.services) {
      if (service && typeof service.destroy === 'function') {
        try {
          await service.destroy();
          console.log(`[GameManager] Destroyed service: ${name}`);
        } catch (error) {
          console.error(`[GameManager] Error destroying service ${name}:`, error);
        }
      }
    }

    this.services.clear();
    this.listeners.clear();
    this.initialized = false;

    this.emit('destroyed');
  }
}

export default GameManager.getInstance();
