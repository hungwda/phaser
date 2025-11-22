/**
 * PWAInstaller - Manages PWA installation and service worker registration
 */
export class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.swRegistration = null;
    this.updateAvailable = false;

    this.checkIfInstalled();
    this.setupInstallPrompt();
    this.registerServiceWorker();
  }

  /**
   * Check if app is already installed
   */
  checkIfInstalled() {
    // Check if running as standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('[PWA] Running as installed app');
    }

    // Check if running as PWA on iOS
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('[PWA] Running as iOS PWA');
    }
  }

  /**
   * Setup install prompt listener
   */
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing
      e.preventDefault();

      // Store the event for later use
      this.deferredPrompt = e;

      console.log('[PWA] Install prompt available');

      // Notify app that install is available
      this.dispatchEvent('pwa-install-available');
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;

      console.log('[PWA] App installed successfully');

      // Notify app
      this.dispatchEvent('pwa-installed');
    });
  }

  /**
   * Register service worker
   */
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service workers not supported');
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[PWA] Service worker registered:', this.swRegistration.scope);

      // Check for updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration.installing;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            this.updateAvailable = true;
            console.log('[PWA] Update available');

            this.dispatchEvent('pwa-update-available');
          }
        });
      });

      // Listen for controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] New service worker activated');
        this.dispatchEvent('pwa-updated');
      });

      return true;
    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error);
      return false;
    }
  }

  /**
   * Show install prompt
   */
  async showInstallPrompt() {
    if (!this.deferredPrompt) {
      console.log('[PWA] No install prompt available');
      return false;
    }

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await this.deferredPrompt.userChoice;

    console.log('[PWA] User install choice:', outcome);

    if (outcome === 'accepted') {
      this.deferredPrompt = null;
      return true;
    }

    return false;
  }

  /**
   * Check if install is available
   */
  canInstall() {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  /**
   * Get install status
   */
  getInstallStatus() {
    return {
      isInstalled: this.isInstalled,
      canInstall: this.canInstall(),
      updateAvailable: this.updateAvailable
    };
  }

  /**
   * Apply service worker update
   */
  applyUpdate() {
    if (!this.swRegistration || !this.swRegistration.waiting) {
      return;
    }

    // Tell the waiting service worker to activate
    this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  /**
   * Unregister service worker and clear cache
   */
  async uninstall() {
    if (!this.swRegistration) {
      return false;
    }

    try {
      // Tell service worker to clear cache
      this.swRegistration.active.postMessage({ type: 'CLEAR_CACHE' });

      // Unregister
      await this.swRegistration.unregister();

      console.log('[PWA] Service worker unregistered');
      return true;
    } catch (error) {
      console.error('[PWA] Failed to uninstall:', error);
      return false;
    }
  }

  /**
   * Dispatch custom event
   */
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  /**
   * Add event listener
   */
  addEventListener(eventName, callback) {
    window.addEventListener(eventName, callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventName, callback) {
    window.removeEventListener(eventName, callback);
  }
}

// Create singleton instance
const pwaInstaller = new PWAInstaller();

export default pwaInstaller;
