/**
 * ServiceRegistry - Service container with dependency injection
 * Manages service lifecycle and dependencies
 */
export class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.factories = new Map();
    this.singletons = new Map();
    this.initializing = new Map();
  }

  /**
   * Register a service instance
   */
  register(name, service) {
    if (this.services.has(name)) {
      console.warn(`[ServiceRegistry] Service ${name} already registered, replacing...`);
    }

    this.services.set(name, service);
    console.log(`[ServiceRegistry] Registered service: ${name}`);

    return this;
  }

  /**
   * Register a service factory (lazy initialization)
   */
  registerFactory(name, factory) {
    if (typeof factory !== 'function') {
      throw new Error(`[ServiceRegistry] Factory for ${name} must be a function`);
    }

    this.factories.set(name, factory);
    console.log(`[ServiceRegistry] Registered factory: ${name}`);

    return this;
  }

  /**
   * Register a singleton factory
   */
  registerSingleton(name, factory) {
    this.registerFactory(name, factory);
    this.singletons.set(name, null);

    return this;
  }

  /**
   * Get a service
   */
  get(name) {
    // Check if already instantiated
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    // Check if singleton already created
    if (this.singletons.has(name) && this.singletons.get(name)) {
      return this.singletons.get(name);
    }

    // Check if factory exists
    if (this.factories.has(name)) {
      return this.createFromFactory(name);
    }

    console.warn(`[ServiceRegistry] Service not found: ${name}`);
    return null;
  }

  /**
   * Create service from factory
   */
  createFromFactory(name) {
    // Prevent circular dependencies
    if (this.initializing.has(name)) {
      throw new Error(`[ServiceRegistry] Circular dependency detected for ${name}`);
    }

    try {
      this.initializing.set(name, true);

      const factory = this.factories.get(name);
      const service = factory(this);

      // If singleton, cache it
      if (this.singletons.has(name)) {
        this.singletons.set(name, service);
        this.services.set(name, service);
      }

      this.initializing.delete(name);

      console.log(`[ServiceRegistry] Created service from factory: ${name}`);
      return service;
    } catch (error) {
      this.initializing.delete(name);
      throw new Error(`[ServiceRegistry] Failed to create service ${name}: ${error.message}`);
    }
  }

  /**
   * Check if service exists
   */
  has(name) {
    return this.services.has(name) || this.factories.has(name);
  }

  /**
   * Initialize all registered services
   */
  async initializeAll() {
    console.log('[ServiceRegistry] Initializing all services...');

    const promises = [];

    for (const [name, service] of this.services) {
      if (service && typeof service.initialize === 'function') {
        promises.push(
          service.initialize().then(() => {
            console.log(`[ServiceRegistry] Initialized: ${name}`);
          }).catch(error => {
            console.error(`[ServiceRegistry] Failed to initialize ${name}:`, error);
          })
        );
      }
    }

    await Promise.all(promises);
    console.log('[ServiceRegistry] All services initialized');
  }

  /**
   * Destroy all services
   */
  async destroyAll() {
    console.log('[ServiceRegistry] Destroying all services...');

    const promises = [];

    for (const [name, service] of this.services) {
      if (service && typeof service.destroy === 'function') {
        promises.push(
          service.destroy().then(() => {
            console.log(`[ServiceRegistry] Destroyed: ${name}`);
          }).catch(error => {
            console.error(`[ServiceRegistry] Failed to destroy ${name}:`, error);
          })
        );
      }
    }

    await Promise.all(promises);

    this.services.clear();
    this.factories.clear();
    this.singletons.clear();

    console.log('[ServiceRegistry] All services destroyed');
  }

  /**
   * Get all service names
   */
  getServiceNames() {
    const names = new Set();

    for (const name of this.services.keys()) {
      names.add(name);
    }

    for (const name of this.factories.keys()) {
      names.add(name);
    }

    return Array.from(names);
  }

  /**
   * Get service info for debugging
   */
  getServiceInfo() {
    const info = {};

    for (const name of this.getServiceNames()) {
      info[name] = {
        instantiated: this.services.has(name),
        hasFactory: this.factories.has(name),
        isSingleton: this.singletons.has(name)
      };
    }

    return info;
  }
}

export default ServiceRegistry;
