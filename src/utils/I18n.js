/**
 * I18n - Internationalization system
 * Provides multi-language support with dynamic locale switching
 */
export class I18n {
  constructor() {
    this.currentLocale = 'en';
    this.fallbackLocale = 'en';
    this.translations = new Map();
    this.listeners = [];

    // Load default locale
    this.loadLocale('en');
  }

  /**
   * Load translations for a locale
   */
  async loadLocale(locale) {
    try {
      // Dynamic import of locale files
      const module = await import(`../i18n/locales/${locale}.js`);
      this.translations.set(locale, module.default);
      return true;
    } catch (error) {
      console.warn(`Failed to load locale ${locale}:`, error);

      // Use inline fallback translations
      if (locale === 'en') {
        this.translations.set('en', this.getDefaultEnglishTranslations());
        return true;
      }

      return false;
    }
  }

  /**
   * Get default English translations (fallback)
   */
  getDefaultEnglishTranslations() {
    return {
      common: {
        play: 'Play',
        pause: 'Pause',
        resume: 'Resume',
        exit: 'Exit',
        close: 'Close',
        cancel: 'Cancel',
        confirm: 'Confirm',
        settings: 'Settings',
        back: 'Back',
        next: 'Next',
        retry: 'Retry',
        menu: 'Menu',
        loading: 'Loading...',
        score: 'Score',
        lives: 'Lives',
        time: 'Time',
        level: 'Level'
      },
      menu: {
        title: 'Kannada Learning Games',
        start: 'Start Learning',
        continue: 'Continue',
        profile: 'Profile',
        settings: 'Settings',
        about: 'About'
      },
      categories: {
        alphabet: 'Alphabet',
        vocabulary: 'Vocabulary',
        words: 'Words',
        sentences: 'Sentences',
        reading: 'Reading',
        listening: 'Listening',
        cultural: 'Cultural'
      },
      game: {
        instructions: 'Instructions',
        clickToStart: 'Click anywhere to start!',
        paused: 'PAUSED',
        clickToResume: 'Click to resume',
        gameOver: 'Game Over',
        greatJob: 'Great Job!',
        finalScore: 'Final Score',
        exitGame: 'Exit Game?',
        progressWillBeLost: 'Your progress will be lost!',
        yesExit: 'Yes, Exit',
        timeUp: "Time's up!",
        noLivesRemaining: 'No lives remaining!',
        combo: 'Combo'
      },
      settings: {
        language: 'Language',
        difficulty: 'Difficulty',
        soundEffects: 'Sound Effects',
        music: 'Music',
        showHints: 'Show Hints',
        accessibility: 'Accessibility',
        highContrast: 'High Contrast',
        screenReader: 'Screen Reader Support',
        keyboardNav: 'Keyboard Navigation'
      },
      difficulty: {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
      },
      achievements: {
        firstSteps: 'First Steps',
        firstStepsDesc: 'Complete your first game',
        letterCollector: 'Letter Collector',
        letterCollectorDesc: 'Master 5 letters',
        dedicatedLearner: 'Dedicated Learner',
        dedicatedLearnerDesc: 'Play 10 games'
      },
      errors: {
        loadFailed: 'Failed to load game data',
        saveFailed: 'Failed to save progress',
        networkError: 'Network connection error',
        tryAgain: 'Please try again'
      }
    };
  }

  /**
   * Set current locale
   */
  async setLocale(locale) {
    // Load locale if not already loaded
    if (!this.translations.has(locale)) {
      const loaded = await this.loadLocale(locale);
      if (!loaded) {
        console.warn(`Could not load locale ${locale}, using ${this.fallbackLocale}`);
        return false;
      }
    }

    this.currentLocale = locale;

    // Notify listeners
    this.notifyListeners(locale);

    return true;
  }

  /**
   * Get translated string
   */
  t(key, params = {}) {
    const translation = this.getTranslation(key, this.currentLocale);

    if (!translation) {
      // Try fallback locale
      const fallback = this.getTranslation(key, this.fallbackLocale);
      if (!fallback) {
        console.warn(`Missing translation for key: ${key}`);
        return key;
      }
      return this.interpolate(fallback, params);
    }

    return this.interpolate(translation, params);
  }

  /**
   * Get translation from locale
   */
  getTranslation(key, locale) {
    const translations = this.translations.get(locale);
    if (!translations) {
      return null;
    }

    // Support nested keys like 'menu.title'
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }

    return value;
  }

  /**
   * Interpolate parameters into translation
   */
  interpolate(translation, params) {
    if (typeof translation !== 'string') {
      return translation;
    }

    let result = translation;

    // Replace {key} with params.key
    Object.keys(params).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, params[key]);
    });

    return result;
  }

  /**
   * Get current locale
   */
  getLocale() {
    return this.currentLocale;
  }

  /**
   * Get available locales
   */
  getAvailableLocales() {
    return Array.from(this.translations.keys());
  }

  /**
   * Add locale change listener
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove locale change listener
   */
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify listeners of locale change
   */
  notifyListeners(locale) {
    this.listeners.forEach(callback => {
      try {
        callback(locale);
      } catch (e) {
        console.error('Error in i18n listener:', e);
      }
    });
  }

  /**
   * Check if locale exists
   */
  hasLocale(locale) {
    return this.translations.has(locale);
  }

  /**
   * Get all translations for current locale
   */
  getAllTranslations() {
    return this.translations.get(this.currentLocale) || {};
  }
}

// Create singleton instance
const i18n = new I18n();

// Export both class and instance
export default i18n;
