/**
 * ErrorHandler - Global error handling and reporting system
 * Provides centralized error handling, logging, and user notifications
 */
export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 50; // Keep last 50 errors
    this.isProduction = import.meta.env.PROD;
    this.listeners = [];

    // Setup global error handlers
    this.setupGlobalHandlers();
  }

  /**
   * Setup global error event handlers
   */
  setupGlobalHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'uncaught_error',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error,
        timestamp: new Date().toISOString()
      });

      // Prevent default browser error handling in production
      if (this.isProduction) {
        event.preventDefault();
      }
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'unhandled_rejection',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        error: event.reason,
        timestamp: new Date().toISOString()
      });

      // Prevent default browser handling in production
      if (this.isProduction) {
        event.preventDefault();
      }
    });

    // Handle Phaser-specific errors
    this.setupPhaserErrorHandling();
  }

  /**
   * Setup Phaser-specific error handling
   */
  setupPhaserErrorHandling() {
    // Listen for WebGL context loss
    window.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      this.handleError({
        type: 'webgl_context_lost',
        message: 'WebGL context was lost. The game will attempt to recover.',
        timestamp: new Date().toISOString(),
        recoverable: true
      });
    });

    // Listen for WebGL context restoration
    window.addEventListener('webglcontextrestored', () => {
      this.log({
        type: 'webgl_context_restored',
        message: 'WebGL context restored successfully',
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Handle an error
   */
  handleError(errorData) {
    // Add to error log
    this.errors.push(errorData);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift(); // Remove oldest error
    }

    // Log to console in development
    if (!this.isProduction) {
      console.error('[ErrorHandler]', errorData);
    }

    // Save to localStorage for debugging
    try {
      localStorage.setItem('phaser_last_error', JSON.stringify(errorData));
    } catch (e) {
      // Ignore localStorage errors
    }

    // Notify listeners
    this.notifyListeners(errorData);

    // Show user-friendly error message
    if (this.shouldShowToUser(errorData)) {
      this.showErrorToUser(errorData);
    }

    // Send to analytics/monitoring service (if configured)
    this.reportToMonitoring(errorData);
  }

  /**
   * Log non-error information
   */
  log(logData) {
    if (!this.isProduction) {
      console.log('[ErrorHandler]', logData);
    }
  }

  /**
   * Determine if error should be shown to user
   */
  shouldShowToUser(errorData) {
    // Always show in production for critical errors
    if (this.isProduction && errorData.type === 'uncaught_error') {
      return true;
    }

    // Show WebGL context loss
    if (errorData.type === 'webgl_context_lost') {
      return true;
    }

    // Don't show minor errors to user
    return false;
  }

  /**
   * Show user-friendly error message
   */
  showErrorToUser(errorData) {
    // Create error overlay if it doesn't exist
    if (!document.getElementById('error-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'error-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        font-family: Arial, sans-serif;
      `;

      const errorBox = document.createElement('div');
      errorBox.style.cssText = `
        background: #fff;
        padding: 30px;
        border-radius: 10px;
        max-width: 500px;
        text-align: center;
      `;

      const icon = document.createElement('div');
      icon.style.cssText = 'font-size: 48px; margin-bottom: 20px;';
      icon.textContent = '⚠️';

      const title = document.createElement('h2');
      title.style.cssText = 'color: #d32f2f; margin: 0 0 10px 0;';
      title.textContent = this.getUserFriendlyTitle(errorData);

      const message = document.createElement('p');
      message.style.cssText = 'color: #333; margin: 0 0 20px 0;';
      message.textContent = this.getUserFriendlyMessage(errorData);

      const reloadBtn = document.createElement('button');
      reloadBtn.style.cssText = `
        background: #4CAF50;
        color: white;
        border: none;
        padding: 12px 30px;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
        margin-right: 10px;
      `;
      reloadBtn.textContent = 'Reload Game';
      reloadBtn.onclick = () => window.location.reload();

      const closeBtn = document.createElement('button');
      closeBtn.style.cssText = `
        background: #757575;
        color: white;
        border: none;
        padding: 12px 30px;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
      `;
      closeBtn.textContent = 'Close';
      closeBtn.onclick = () => overlay.remove();

      errorBox.appendChild(icon);
      errorBox.appendChild(title);
      errorBox.appendChild(message);
      errorBox.appendChild(reloadBtn);

      // Only show close button for recoverable errors
      if (errorData.recoverable) {
        errorBox.appendChild(closeBtn);
      }

      overlay.appendChild(errorBox);
      document.body.appendChild(overlay);
    }
  }

  /**
   * Get user-friendly error title
   */
  getUserFriendlyTitle(errorData) {
    switch (errorData.type) {
      case 'webgl_context_lost':
        return 'Graphics Error';
      case 'uncaught_error':
        return 'Something Went Wrong';
      default:
        return 'Error';
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(errorData) {
    switch (errorData.type) {
      case 'webgl_context_lost':
        return 'The game lost connection to the graphics system. This can happen when your device is under heavy load. Please try reloading.';
      case 'uncaught_error':
        return 'An unexpected error occurred. Please reload the game to continue.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  /**
   * Report error to monitoring service (placeholder for future implementation)
   */
  reportToMonitoring(errorData) {
    // TODO: Integrate with error monitoring service (e.g., Sentry)
    // For now, just store in session storage for debugging
    try {
      const errors = JSON.parse(sessionStorage.getItem('phaser_errors') || '[]');
      errors.push(errorData);
      // Keep last 10 errors
      if (errors.length > 10) {
        errors.shift();
      }
      sessionStorage.setItem('phaser_errors', JSON.stringify(errors));
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Add error listener
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove error listener
   */
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners
   */
  notifyListeners(errorData) {
    this.listeners.forEach(callback => {
      try {
        callback(errorData);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  /**
   * Get error history
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Clear error history
   */
  clearErrors() {
    this.errors = [];
    try {
      localStorage.removeItem('phaser_last_error');
      sessionStorage.removeItem('phaser_errors');
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Manually report an error
   */
  reportError(error, context = {}) {
    this.handleError({
      type: 'manual',
      message: error.message || String(error),
      error: error,
      context: context,
      timestamp: new Date().toISOString()
    });
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;
