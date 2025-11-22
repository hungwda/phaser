/**
 * AccessibilityManager - Manages accessibility features
 * Provides keyboard navigation, ARIA labels, and screen reader support
 */
export class AccessibilityManager {
  constructor(game) {
    this.game = game;
    this.keyboardEnabled = true;
    this.screenReaderEnabled = false;
    this.highContrastMode = false;
    this.focusedElement = null;
    this.announcements = [];

    this.setupKeyboardNavigation();
    this.createLiveRegion();
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (!this.keyboardEnabled) return;

      switch (e.key) {
        case 'Tab':
          e.preventDefault();
          this.navigateFocus(e.shiftKey ? 'backward' : 'forward');
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.activateFocusedElement();
          break;
        case 'Escape':
          e.preventDefault();
          this.handleEscape();
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          this.handleArrowKey(e.key);
          break;
      }
    });
  }

  /**
   * Create ARIA live region for screen reader announcements
   */
  createLiveRegion() {
    // Remove existing if present
    const existing = document.getElementById('game-announcer');
    if (existing) {
      existing.remove();
    }

    const liveRegion = document.createElement('div');
    liveRegion.id = 'game-announcer';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(liveRegion);
    this.liveRegion = liveRegion;
  }

  /**
   * Announce message to screen readers
   */
  announce(message, priority = 'polite') {
    if (!this.liveRegion) {
      this.createLiveRegion();
    }

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Log announcement
    this.announcements.push({
      message,
      priority,
      timestamp: new Date().toISOString()
    });

    // Keep last 20 announcements
    if (this.announcements.length > 20) {
      this.announcements.shift();
    }
  }

  /**
   * Add ARIA label to game element
   */
  addAriaLabel(element, label, role = 'button') {
    if (!element || !element.setDataEnabled) return;

    element.setDataEnabled();
    element.setData('aria-label', label);
    element.setData('aria-role', role);
    element.setData('focusable', true);
  }

  /**
   * Set focusable elements in scene
   */
  setFocusableElements(elements) {
    this.focusableElements = elements;
    this.focusIndex = 0;

    if (elements.length > 0) {
      this.setFocus(elements[0]);
    }
  }

  /**
   * Navigate focus
   */
  navigateFocus(direction = 'forward') {
    if (!this.focusableElements || this.focusableElements.length === 0) {
      return;
    }

    // Remove focus from current element
    if (this.focusedElement) {
      this.clearFocus(this.focusedElement);
    }

    // Update focus index
    if (direction === 'forward') {
      this.focusIndex = (this.focusIndex + 1) % this.focusableElements.length;
    } else {
      this.focusIndex = this.focusIndex - 1;
      if (this.focusIndex < 0) {
        this.focusIndex = this.focusableElements.length - 1;
      }
    }

    // Set focus to new element
    const newElement = this.focusableElements[this.focusIndex];
    this.setFocus(newElement);
  }

  /**
   * Set focus on element
   */
  setFocus(element) {
    if (!element) return;

    this.focusedElement = element;

    // Visual focus indicator
    if (element.setStrokeStyle) {
      element.setStrokeStyle(4, 0xFFFF00);
    } else if (element.setTint) {
      element.originalTint = element.tintTopLeft;
      element.setTint(0xFFFF99);
    }

    // Announce to screen reader
    const label = element.getData ? element.getData('aria-label') : null;
    if (label) {
      this.announce(`Focused on ${label}`);
    }
  }

  /**
   * Clear focus from element
   */
  clearFocus(element) {
    if (!element) return;

    // Remove visual focus indicator
    if (element.setStrokeStyle) {
      element.setStrokeStyle(0);
    } else if (element.setTint) {
      element.clearTint();
      if (element.originalTint !== undefined) {
        element.setTint(element.originalTint);
      }
    }
  }

  /**
   * Activate focused element
   */
  activateFocusedElement() {
    if (!this.focusedElement) return;

    // Emit pointerdown event
    this.focusedElement.emit('pointerdown', {
      x: this.focusedElement.x,
      y: this.focusedElement.y
    });

    const label = this.focusedElement.getData ? this.focusedElement.getData('aria-label') : null;
    if (label) {
      this.announce(`Activated ${label}`);
    }
  }

  /**
   * Handle arrow key navigation
   */
  handleArrowKey(key) {
    // Can be customized per scene
    // For now, just announce
    this.announce(`Arrow ${key.replace('Arrow', '')} pressed`);
  }

  /**
   * Handle Escape key
   */
  handleEscape() {
    // Emit escape event that scenes can listen to
    if (this.game.scene.scenes.length > 0) {
      const activeScene = this.game.scene.scenes.find(s => s.scene.isActive());
      if (activeScene && activeScene.events) {
        activeScene.events.emit('escape-pressed');
      }
    }
  }

  /**
   * Enable high contrast mode
   */
  enableHighContrast() {
    this.highContrastMode = true;
    document.body.classList.add('high-contrast');

    // Add high contrast stylesheet
    if (!document.getElementById('high-contrast-styles')) {
      const style = document.createElement('style');
      style.id = 'high-contrast-styles';
      style.textContent = `
        .high-contrast {
          filter: contrast(1.5);
        }
        .high-contrast #game-container {
          border: 3px solid #FFFFFF;
        }
      `;
      document.head.appendChild(style);
    }

    this.announce('High contrast mode enabled');
  }

  /**
   * Disable high contrast mode
   */
  disableHighContrast() {
    this.highContrastMode = false;
    document.body.classList.remove('high-contrast');
    this.announce('High contrast mode disabled');
  }

  /**
   * Toggle high contrast
   */
  toggleHighContrast() {
    if (this.highContrastMode) {
      this.disableHighContrast();
    } else {
      this.enableHighContrast();
    }
  }

  /**
   * Enable screen reader mode
   */
  enableScreenReader() {
    this.screenReaderEnabled = true;
    this.announce('Screen reader support enabled. Use Tab to navigate, Enter to activate.');
  }

  /**
   * Disable screen reader mode
   */
  disableScreenReader() {
    this.screenReaderEnabled = false;
  }

  /**
   * Get accessibility settings
   */
  getSettings() {
    return {
      keyboardEnabled: this.keyboardEnabled,
      screenReaderEnabled: this.screenReaderEnabled,
      highContrastMode: this.highContrastMode
    };
  }

  /**
   * Apply accessibility settings
   */
  applySettings(settings) {
    if (settings.keyboardEnabled !== undefined) {
      this.keyboardEnabled = settings.keyboardEnabled;
    }

    if (settings.screenReaderEnabled !== undefined) {
      if (settings.screenReaderEnabled) {
        this.enableScreenReader();
      } else {
        this.disableScreenReader();
      }
    }

    if (settings.highContrastMode !== undefined) {
      if (settings.highContrastMode) {
        this.enableHighContrast();
      } else {
        this.disableHighContrast();
      }
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.liveRegion && this.liveRegion.parentNode) {
      this.liveRegion.parentNode.removeChild(this.liveRegion);
    }

    document.body.classList.remove('high-contrast');
  }
}

export default AccessibilityManager;
