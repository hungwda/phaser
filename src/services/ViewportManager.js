/**
 * ViewportManager - Manages viewport dimensions and responsive breakpoints
 * Core service for responsive design
 */
import { BaseService } from './BaseService.js';

export const BREAKPOINTS = {
  mobile: 320,          // Phones (portrait)
  mobileLandscape: 568, // Phones (landscape)
  tablet: 768,          // Tablets (portrait)
  tabletLandscape: 1024,// Tablets (landscape)
  desktop: 1280,        // Desktop
  desktopWide: 1920     // Wide screens
};

export class ViewportManager extends BaseService {
  constructor() {
    super();

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.breakpoint = this.calculateBreakpoint();
    this.orientation = this.calculateOrientation();
    this.resizeListeners = [];
    this.orientationListeners = [];
    this.lastResize = 0;
    this.resizeDebounce = 150;

    this.setupListeners();
  }

  /**
   * Initialize service
   */
  async initialize() {
    await super.initialize();
    console.log('[ViewportManager] Initialized', this.getState());
  }

  /**
   * Setup window event listeners
   */
  setupListeners() {
    // Resize listener with debounce
    window.addEventListener('resize', () => {
      const now = Date.now();
      if (now - this.lastResize < this.resizeDebounce) {
        return;
      }

      this.lastResize = now;
      this.onResize();
    });

    // Orientation change listener
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.onOrientationChange(), 200);
    });

    // Visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      this.onVisibilityChange();
    });
  }

  /**
   * Handle window resize
   */
  onResize() {
    const prevBreakpoint = this.breakpoint;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.breakpoint = this.calculateBreakpoint();
    this.orientation = this.calculateOrientation();

    // Notify listeners
    this.notifyResizeListeners();

    // Breakpoint changed
    if (prevBreakpoint !== this.breakpoint) {
      console.log(`[ViewportManager] Breakpoint changed: ${prevBreakpoint} → ${this.breakpoint}`);
      this.onBreakpointChange();
    }
  }

  /**
   * Handle orientation change
   */
  onOrientationChange() {
    const prevOrientation = this.orientation;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.orientation = this.calculateOrientation();
    this.breakpoint = this.calculateBreakpoint();

    if (prevOrientation !== this.orientation) {
      console.log(`[ViewportManager] Orientation changed: ${prevOrientation} → ${this.orientation}`);
      this.notifyOrientationListeners();
    }

    this.notifyResizeListeners();
  }

  /**
   * Handle visibility change
   */
  onVisibilityChange() {
    if (!document.hidden) {
      // Tab became visible, refresh dimensions
      this.onResize();
    }
  }

  /**
   * Calculate current breakpoint
   */
  calculateBreakpoint() {
    const w = this.width;

    if (w < BREAKPOINTS.mobileLandscape) return 'mobile';
    if (w < BREAKPOINTS.tablet) return 'mobileLandscape';
    if (w < BREAKPOINTS.tabletLandscape) return 'tablet';
    if (w < BREAKPOINTS.desktop) return 'tabletLandscape';
    if (w < BREAKPOINTS.desktopWide) return 'desktop';
    return 'desktopWide';
  }

  /**
   * Calculate orientation
   */
  calculateOrientation() {
    return this.width > this.height ? 'landscape' : 'portrait';
  }

  /**
   * Handle breakpoint change
   */
  onBreakpointChange() {
    // Can be overridden or listened to
  }

  /**
   * Get current breakpoint
   */
  getCurrentBreakpoint() {
    return this.breakpoint;
  }

  /**
   * Get optimal game dimensions for current viewport
   */
  getOptimalGameDimensions() {
    const dimensions = {
      mobile: { width: Math.min(this.width - 20, 320), height: 480 },
      mobileLandscape: { width: Math.min(this.width - 20, 568), height: 320 },
      tablet: { width: Math.min(this.width - 40, 600), height: 450 },
      tabletLandscape: { width: Math.min(this.width - 40, 800), height: 500 },
      desktop: { width: Math.min(this.width - 100, 800), height: 600 },
      desktopWide: { width: Math.min(this.width - 200, 1200), height: 800 }
    };

    return dimensions[this.breakpoint] || dimensions.mobile;
  }

  /**
   * Get scale factor for responsive elements
   */
  getScaleFactor() {
    const baseWidth = 800; // Base design width
    const currentWidth = this.width;

    // Scale between 0.4x and 1.5x
    const scale = currentWidth / baseWidth;
    return Math.max(0.4, Math.min(scale, 1.5));
  }

  /**
   * Check device type
   */
  isMobile() {
    return ['mobile', 'mobileLandscape'].includes(this.breakpoint);
  }

  isTablet() {
    return ['tablet', 'tabletLandscape'].includes(this.breakpoint);
  }

  isDesktop() {
    return ['desktop', 'desktopWide'].includes(this.breakpoint);
  }

  isPortrait() {
    return this.orientation === 'portrait';
  }

  isLandscape() {
    return this.orientation === 'landscape';
  }

  /**
   * Get responsive value
   */
  getResponsiveValue(values) {
    if (typeof values !== 'object') {
      return values;
    }

    // Check for exact breakpoint match
    if (values[this.breakpoint] !== undefined) {
      return values[this.breakpoint];
    }

    // Fallback to device type
    if (this.isMobile() && values.mobile !== undefined) {
      return values.mobile;
    }

    if (this.isTablet() && values.tablet !== undefined) {
      return values.tablet;
    }

    if (this.isDesktop() && values.desktop !== undefined) {
      return values.desktop;
    }

    // Final fallback
    return values.mobile || values.default || Object.values(values)[0];
  }

  /**
   * Get responsive spacing
   */
  getResponsiveSpacing(base = 1) {
    const spacing = {
      mobile: 8,
      mobileLandscape: 8,
      tablet: 12,
      tabletLandscape: 16,
      desktop: 16,
      desktopWide: 20
    };

    return (spacing[this.breakpoint] || 8) * base;
  }

  /**
   * Get responsive font size
   */
  getResponsiveFontSize(variant = 'body') {
    const sizes = {
      mobile: {
        h1: 28, h2: 24, h3: 20, h4: 18, body: 16, small: 14, tiny: 12
      },
      mobileLandscape: {
        h1: 28, h2: 24, h3: 20, h4: 18, body: 16, small: 14, tiny: 12
      },
      tablet: {
        h1: 36, h2: 28, h3: 24, h4: 20, body: 18, small: 16, tiny: 14
      },
      tabletLandscape: {
        h1: 40, h2: 32, h3: 28, h4: 24, body: 18, small: 16, tiny: 14
      },
      desktop: {
        h1: 48, h2: 36, h3: 28, h4: 24, body: 16, small: 14, tiny: 12
      },
      desktopWide: {
        h1: 56, h2: 42, h3: 32, h4: 28, body: 18, small: 16, tiny: 14
      }
    };

    const breakpointSizes = sizes[this.breakpoint] || sizes.mobile;
    return breakpointSizes[variant] || breakpointSizes.body;
  }

  /**
   * Get minimum touch target size
   */
  getTouchTargetSize() {
    // Apple HIG: 44x44pt
    // Material Design: 48x48dp
    // Use 44px as minimum
    return this.isMobile() ? 44 : 32;
  }

  /**
   * Subscribe to resize events
   */
  onResize(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    this.resizeListeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.resizeListeners.indexOf(callback);
      if (index > -1) {
        this.resizeListeners.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to orientation change events
   */
  onOrientationChange(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    this.orientationListeners.push(callback);

    return () => {
      const index = this.orientationListeners.indexOf(callback);
      if (index > -1) {
        this.orientationListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify resize listeners
   */
  notifyResizeListeners() {
    const state = this.getState();

    this.resizeListeners.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('[ViewportManager] Error in resize listener:', error);
      }
    });
  }

  /**
   * Notify orientation listeners
   */
  notifyOrientationListeners() {
    const state = this.getState();

    this.orientationListeners.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('[ViewportManager] Error in orientation listener:', error);
      }
    });
  }

  /**
   * Get viewport state
   */
  getState() {
    return {
      width: this.width,
      height: this.height,
      breakpoint: this.breakpoint,
      orientation: this.orientation,
      isMobile: this.isMobile(),
      isTablet: this.isTablet(),
      isDesktop: this.isDesktop(),
      isPortrait: this.isPortrait(),
      isLandscape: this.isLandscape(),
      scaleFactor: this.getScaleFactor(),
      gameDimensions: this.getOptimalGameDimensions()
    };
  }

  /**
   * Cleanup
   */
  async destroy() {
    this.resizeListeners = [];
    this.orientationListeners = [];
    await super.destroy();
  }
}

export default ViewportManager;
