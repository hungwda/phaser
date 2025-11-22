/**
 * StateStore - Redux-like state management
 * Provides predictable state updates with immutability
 */
export class StateStore {
  constructor(initialState = {}, rootReducer) {
    this.state = initialState;
    this.rootReducer = rootReducer;
    this.listeners = [];
    this.middleware = [];
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 50;
  }

  /**
   * Get current state
   */
  getState() {
    return this.state;
  }

  /**
   * Dispatch an action
   */
  dispatch(action) {
    if (!action || typeof action.type !== 'string') {
      throw new Error('Action must have a type property');
    }

    // Apply middleware chain
    const middlewareChain = this.middleware.map(mw => mw(this));
    const dispatch = action => {
      return this.applyReducer(action);
    };

    const chain = middlewareChain.reduceRight(
      (next, middleware) => middleware(next),
      dispatch
    );

    return chain(action);
  }

  /**
   * Apply reducer to get next state
   */
  applyReducer(action) {
    const prevState = this.state;
    const nextState = this.rootReducer(prevState, action);

    if (nextState !== prevState) {
      this.state = nextState;

      // Add to history for time-travel debugging
      this.addToHistory(action, nextState);

      // Notify all listeners
      this.notifyListeners();
    }

    return action;
  }

  /**
   * Add state to history
   */
  addToHistory(action, state) {
    // Remove future history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Add to history
    this.history.push({
      action,
      state: JSON.parse(JSON.stringify(state)), // Deep clone
      timestamp: Date.now()
    });

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }

    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('[StateStore] Error in listener:', error);
      }
    });
  }

  /**
   * Add middleware
   */
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function');
    }

    this.middleware.push(middleware);
  }

  /**
   * Time-travel: Go to previous state
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = this.history[this.historyIndex].state;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Time-travel: Go to next state
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = this.history[this.historyIndex].state;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Get history
   */
  getHistory() {
    return this.history.map(h => ({
      action: h.action.type,
      timestamp: h.timestamp
    }));
  }

  /**
   * Reset state to initial
   */
  reset(initialState) {
    this.state = initialState;
    this.history = [];
    this.historyIndex = -1;
    this.notifyListeners();
  }

  /**
   * Replace reducer (for hot module replacement)
   */
  replaceReducer(nextReducer) {
    this.rootReducer = nextReducer;
  }
}

/**
 * Create initial state
 */
export function createInitialState() {
  return {
    app: {
      initialized: false,
      loading: false,
      error: null,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        breakpoint: 'mobile',
        orientation: 'portrait',
        isMobile: true,
        isTablet: false,
        isDesktop: false
      }
    },

    user: {
      profile: {
        id: null,
        name: 'Student',
        avatar: null,
        createdAt: new Date().toISOString()
      },
      preferences: {
        locale: 'en',
        theme: 'light',
        soundEnabled: true,
        musicEnabled: true,
        sfxVolume: 0.8,
        musicVolume: 0.5,
        accessibility: {
          highContrast: false,
          screenReader: false,
          keyboardNav: true
        }
      },
      progress: {
        level: 1,
        totalScore: 0,
        gamesPlayed: 0,
        achievements: []
      }
    },

    game: {
      currentScene: null,
      previousScene: null,
      sceneData: {},
      isPaused: false,
      isGameActive: false
    },

    ui: {
      modal: null,
      notification: null,
      loading: false
    }
  };
}

/**
 * Root reducer
 */
export function rootReducer(state, action) {
  switch (action.type) {
    // App actions
    case 'APP_INITIALIZE':
      return {
        ...state,
        app: {
          ...state.app,
          initialized: true
        }
      };

    case 'APP_SET_VIEWPORT':
      return {
        ...state,
        app: {
          ...state.app,
          viewport: {
            ...state.app.viewport,
            ...action.payload
          }
        }
      };

    case 'APP_SET_ERROR':
      return {
        ...state,
        app: {
          ...state.app,
          error: action.payload
        }
      };

    case 'APP_SET_LOADING':
      return {
        ...state,
        app: {
          ...state.app,
          loading: action.payload
        }
      };

    // User actions
    case 'USER_UPDATE_PROFILE':
      return {
        ...state,
        user: {
          ...state.user,
          profile: {
            ...state.user.profile,
            ...action.payload
          }
        }
      };

    case 'USER_UPDATE_PREFERENCES':
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            ...action.payload
          }
        }
      };

    case 'USER_UPDATE_PROGRESS':
      return {
        ...state,
        user: {
          ...state.user,
          progress: {
            ...state.user.progress,
            ...action.payload
          }
        }
      };

    // Game actions
    case 'GAME_CHANGE_SCENE':
      return {
        ...state,
        game: {
          ...state.game,
          previousScene: state.game.currentScene,
          currentScene: action.payload.scene,
          sceneData: action.payload.data || {}
        }
      };

    case 'GAME_PAUSE':
      return {
        ...state,
        game: {
          ...state.game,
          isPaused: true
        }
      };

    case 'GAME_RESUME':
      return {
        ...state,
        game: {
          ...state.game,
          isPaused: false
        }
      };

    case 'GAME_START':
      return {
        ...state,
        game: {
          ...state.game,
          isGameActive: true,
          isPaused: false
        }
      };

    case 'GAME_END':
      return {
        ...state,
        game: {
          ...state.game,
          isGameActive: false
        }
      };

    // UI actions
    case 'UI_SHOW_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          modal: action.payload
        }
      };

    case 'UI_HIDE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          modal: null
        }
      };

    case 'UI_SHOW_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notification: action.payload
        }
      };

    case 'UI_HIDE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notification: null
        }
      };

    default:
      return state;
  }
}

/**
 * Middleware: Logger
 */
export const loggerMiddleware = store => next => action => {
  console.group(`[Action] ${action.type}`);
  console.log('Payload:', action.payload);
  console.log('Previous State:', store.getState());

  const result = next(action);

  console.log('Next State:', store.getState());
  console.groupEnd();

  return result;
};

/**
 * Middleware: Persistence
 */
export const persistenceMiddleware = store => next => action => {
  const result = next(action);

  // Save user preferences to localStorage
  const state = store.getState();
  try {
    localStorage.setItem('user_preferences', JSON.stringify(state.user.preferences));
    localStorage.setItem('user_progress', JSON.stringify(state.user.progress));
  } catch (error) {
    console.error('[Persistence] Failed to save state:', error);
  }

  return result;
};

/**
 * Middleware: Analytics
 */
export const analyticsMiddleware = store => next => action => {
  // Track important actions
  const trackedActions = [
    'GAME_START',
    'GAME_END',
    'GAME_CHANGE_SCENE',
    'USER_UPDATE_PROGRESS'
  ];

  if (trackedActions.includes(action.type)) {
    // Send to analytics service
    if (window.analytics) {
      window.analytics.track(action.type, action.payload);
    }
  }

  return next(action);
};

export default StateStore;
