# Architecture Documentation

## Overview

This document describes the architectural decisions and patterns used in this robust Phaser application.

## Architecture Principles

### 1. Separation of Concerns
- **Scenes**: Each scene handles a specific phase of the game (boot, preload, menu, game)
- **Utilities**: Helper classes for asset management, context handling, events
- **Plugins**: Extensible plugin system for additional functionality
- **Configuration**: Centralized configuration management

### 2. Modularity
- Code is organized into logical modules
- Each module has a single responsibility
- Modules communicate through well-defined interfaces
- Easy to add, remove, or modify modules

### 3. Extensibility
- Plugin architecture allows adding features without modifying core
- Event bus enables loose coupling between components
- Configuration-driven behavior
- Template classes for creating new components

### 4. Performance
- Optimized rendering pipeline
- Efficient asset loading
- Memory management
- Object pooling where appropriate

### 5. Robustness
- Error handling throughout
- WebGL context loss recovery
- Save/load functionality
- Graceful degradation

## Core Components

### Game Entry Point (`src/main.js`)

The main entry point that:
1. Initializes the Phaser game instance
2. Configures all scenes
3. Sets up global managers (Context, Performance, Save/Load)
4. Establishes error handling
5. Provides debug features in development mode

**Key Features:**
- Extended `Phaser.Game` class for custom functionality
- Environment-aware configuration
- Global event listeners
- Debug keyboard shortcuts

### Configuration System (`src/config/GameConfig.js`)

Centralized configuration that defines:
- Game dimensions and scaling
- Physics settings
- Renderer configuration
- Input settings
- Environment-specific options

**Benefits:**
- Single source of truth
- Easy to modify game behavior
- Environment-specific configurations
- Type-safe constants

### Scene Architecture

#### Boot Scene (`src/scenes/BootScene.js`)
**Purpose**: Initial setup and verification

**Responsibilities:**
- Initialize global configuration
- Check WebGL support
- Set up event listeners
- Initialize plugins
- Transition to Preload scene

**Why needed**: Ensures the game environment is properly configured before loading assets.

#### Preload Scene (`src/scenes/PreloadScene.js`)
**Purpose**: Asset loading with progress indication

**Responsibilities:**
- Load all game assets
- Display loading progress
- Handle loading errors
- Retry failed loads
- Transition to Menu scene

**Features:**
- Visual progress bar
- File-by-file progress tracking
- Error recovery
- Placeholder asset generation for demo

#### Menu Scene (`src/scenes/MenuScene.js`)
**Purpose**: Main menu and navigation

**Responsibilities:**
- Display game title and options
- Handle menu navigation
- Start game
- Show options/credits
- Keyboard shortcuts

**Features:**
- Animated UI elements
- Interactive buttons
- Background effects
- Smooth transitions

#### Game Scene (`src/scenes/GameScene.js`)
**Purpose**: Main gameplay

**Responsibilities:**
- Game logic and mechanics
- Player controls
- Physics simulation
- Collision detection
- Score tracking
- Level management
- UI updates

**Features:**
- Physics-based gameplay
- Collectible system
- Lives and scoring
- Camera following
- Level progression

### Utility Systems

#### Event Bus (`src/utils/EventBus.js`)
**Purpose**: Global event communication

**Pattern**: Singleton pattern extending Phaser.Events.EventEmitter

**Benefits:**
- Decoupled communication
- Cross-scene event handling
- Debug mode for tracking events
- Type-safe event constants

**Usage:**
```javascript
import eventBus from '@utils/EventBus';

// Emit
eventBus.emit('score:update', 100);

// Listen
eventBus.on('score:update', (score) => {
  console.log('Score:', score);
});
```

#### Context Manager (`src/utils/ContextManager.js`)
**Purpose**: WebGL context loss handling

**Problem Solved**: WebGL context can be lost due to:
- GPU driver issues
- Browser memory pressure
- Tab switching on mobile
- Hardware limitations

**Solution:**
- Detects context loss events
- Pauses game automatically
- Shows user warning
- Restores context when available
- Reloads necessary textures

**Why Critical**: Without this, the game would crash when context is lost.

#### Asset Manager (`src/utils/AssetManager.js`)
**Purpose**: Centralized asset management

**Features:**
- Manifest-based asset loading
- Multiple loading methods (file, Base64, Blob)
- Asset tracking
- Progress monitoring
- Unloading and cleanup

**Benefits:**
- Single source for all assets
- Easy to add/remove assets
- Support for Playable Ads (Base64)
- Memory efficient

### Plugin System

#### Base Plugin (`src/plugins/BasePlugin.js`)
**Purpose**: Template for creating custom plugins

**Pattern**: Template Method pattern

**Lifecycle:**
1. Constructor
2. init() - Configuration
3. start() - Activation
4. update() - Per-frame (if needed)
5. stop() - Deactivation
6. destroy() - Cleanup

**Benefits:**
- Consistent plugin interface
- Easy to create new plugins
- Proper lifecycle management
- Clean initialization and cleanup

#### Performance Plugin (`src/plugins/PerformancePlugin.js`)
**Purpose**: Real-time performance monitoring

**Metrics Tracked:**
- FPS (Frames Per Second)
- Delta time
- Memory usage
- Object count
- Renderer type

**Usage:**
- Enabled in development mode
- Toggle with F1 key
- Displayed as overlay
- Minimal performance impact

#### Save/Load Plugin (`src/plugins/SaveLoadPlugin.js`)
**Purpose**: Game state persistence

**Features:**
- Multiple save slots
- Version management
- Auto-save functionality
- LocalStorage backend
- Data validation

**Architecture:**
```
Save Data Structure:
{
  version: "1.0.0",
  timestamp: 1234567890,
  slot: "default",
  data: { ...gameState }
}
```

## Data Flow

### Initialization Flow
```
Browser Load
    ↓
index.html
    ↓
main.js
    ↓
RobustPhaserGame (extends Phaser.Game)
    ↓
Initialize Managers (Context, Performance, Save/Load)
    ↓
BootScene
    ↓
PreloadScene
    ↓
MenuScene
    ↓
GameScene
```

### Game Loop Flow
```
Phaser.Game.step()
    ↓
Update Performance Plugin
    ↓
Scene.update()
    ↓
Physics.update()
    ↓
Render
```

### Event Flow
```
Component A
    ↓
eventBus.emit('event')
    ↓
Event Bus
    ↓
Component B (listener)
```

## Design Patterns

### 1. Singleton Pattern
- **Where**: EventBus
- **Why**: Single global event system
- **Implementation**: Export single instance

### 2. Template Method Pattern
- **Where**: BasePlugin
- **Why**: Consistent plugin lifecycle
- **Implementation**: Abstract base class with hooks

### 3. Observer Pattern
- **Where**: Event system
- **Why**: Decoupled communication
- **Implementation**: Phaser.Events.EventEmitter

### 4. Strategy Pattern
- **Where**: Asset loading methods
- **Why**: Multiple loading strategies
- **Implementation**: Different load methods in AssetManager

### 5. Factory Pattern
- **Where**: Scene creation
- **Why**: Consistent scene instantiation
- **Implementation**: Scene constructors

## State Management

### Game State
Located in `GameScene.gameState`:
```javascript
{
  score: 0,
  lives: 3,
  level: 1,
  isGameOver: false,
  isPaused: false
}
```

### Scene State
Each scene manages its own state:
- Boot: Configuration state
- Preload: Loading progress
- Menu: UI state
- Game: Gameplay state

### Persistence
Save/Load plugin handles:
- Serialization to JSON
- LocalStorage persistence
- Version migration
- Slot management

## Error Handling

### Levels of Error Handling

1. **Asset Loading Errors**
   - Caught in PreloadScene
   - Retry logic available
   - Fallback assets used

2. **WebGL Context Loss**
   - Handled by ContextManager
   - Automatic pause/resume
   - User notification
   - Texture reload

3. **Runtime Errors**
   - Global error handlers
   - Console logging
   - Graceful degradation

4. **Storage Errors**
   - Try-catch in Save/Load
   - Quota exceeded handling
   - Validation errors

## Performance Considerations

### Rendering Optimization
- WebGL preferred over Canvas
- Sprite batching enabled
- Texture atlases recommended
- Object pooling for frequently created objects

### Memory Management
- Asset unloading when not needed
- Event listener cleanup
- Object destruction
- Texture management

### Physics Optimization
- Spatial hashing for collisions
- Limited physics calculations
- Static vs dynamic bodies
- Optimized collision shapes

### Asset Optimization
- Compressed textures
- Appropriate asset sizes
- Lazy loading where possible
- Asset preloading in chunks

## Scalability

### Adding New Scenes
1. Create scene file in `src/scenes/`
2. Export scene class
3. Add to scene array in `main.js`
4. Add scene key to CONSTANTS

### Adding New Plugins
1. Extend BasePlugin
2. Implement lifecycle methods
3. Initialize in main.js
4. Configure if needed

### Adding New Assets
1. Add to AssetManager manifest
2. Load in PreloadScene
3. Use in appropriate scene

### Adding New Events
1. Define in CONSTANTS.EVENTS
2. Emit from source
3. Listen in destination

## Testing Strategy

### Manual Testing
- Boot sequence
- Asset loading
- Scene transitions
- Input handling
- Physics behavior
- Save/load functionality

### Debug Features
- Performance overlay (F1)
- Context loss testing (F2/F3)
- Quick save/load (F4/F5)
- Console logging
- Visual debugging

### Browser Testing
- Chrome/Edge (WebGL)
- Firefox (WebGL)
- Safari (WebGL/Canvas)
- Mobile browsers
- Different screen sizes

## Deployment Architecture

### Development
```
Source Files (src/)
    ↓
Vite Dev Server
    ↓
Hot Module Replacement
    ↓
Browser
```

### Production
```
Source Files (src/)
    ↓
Vite Build
    ↓
Optimized Bundle (dist/)
    ↓
Static Hosting
    ↓
CDN (optional)
    ↓
Browser
```

## Security Considerations

### Client-Side Security
- No sensitive data in code
- Input validation
- XSS prevention
- CORS configuration

### Save Data Security
- Client-side only
- No server communication
- Validation on load
- Version checking

## Future Enhancements

### Possible Additions
1. **Multiplayer Support**
   - WebSocket communication
   - State synchronization
   - Lag compensation

2. **Advanced Physics**
   - Matter.js integration
   - Complex collisions
   - Ragdoll physics

3. **Audio System**
   - Background music
   - Sound effects
   - Audio sprite sheets

4. **Tilemap Support**
   - Level editor integration
   - Procedural generation
   - Collision layers

5. **Particle Effects**
   - Particle emitters
   - Visual effects
   - Performance optimization

6. **Mobile Optimization**
   - Touch controls
   - Accelerometer input
   - Battery optimization

## Conclusion

This architecture provides:
- ✅ Robust foundation
- ✅ Modular structure
- ✅ Extensible design
- ✅ Performance optimized
- ✅ Well documented
- ✅ Production ready

The architecture follows modern best practices and can scale from simple games to complex applications.
