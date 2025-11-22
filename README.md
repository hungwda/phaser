# Robust Phaser Game Application

A comprehensive, production-ready Phaser 3 game application built with modern development practices, emphasizing performance, stability, and extensibility.

## Features

### Core Architecture
- **Modern Build System**: Vite-powered development with fast HMR and optimized production builds
- **Modular Scene Structure**: Organized into Boot, Preload, Menu, and Game scenes
- **Scene-Based Architecture**: Clean separation of concerns with dedicated scenes
- **Event Bus System**: Centralized event management for cross-scene communication

### Performance & Stability
- **WebGL Context Loss Handling**: Automatic detection and recovery from WebGL context loss
- **Performance Monitoring**: Built-in FPS and performance metrics tracking
- **Optimized Rendering**: Configured for high-performance WebGL rendering with Canvas fallback
- **Responsive Scaling**: Automatic scaling and centering across different screen sizes
- **Memory Management**: Efficient asset loading and cleanup

### Asset Management
- **Centralized Asset System**: Modular asset manager with manifest support
- **Multiple Loading Methods**: Support for file paths, Base64 (for Playable Ads), and Blob loading
- **Progress Tracking**: Visual loading progress with percentage and file information
- **Error Handling**: Robust error handling with retry logic

### Game Features
- **Physics System**: Arcade physics with gravity and collision detection
- **Input Handling**: Keyboard controls with configurable key bindings
- **Camera System**: Following camera with smooth interpolation
- **UI System**: Score tracking, lives display, and in-game messages
- **State Management**: Comprehensive game state tracking

### Extensibility
- **Plugin Architecture**: Base plugin class for creating custom plugins
- **Save/Load System**: LocalStorage-based save system with versioning
- **Performance Plugin**: Real-time performance monitoring
- **Event System**: Custom event bus for game-wide communication

## Project Structure

```
phaser-robust-game/
├── index.html              # Main HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite build configuration
├── .gitignore              # Git ignore rules
└── src/
    ├── main.js             # Application entry point
    ├── config/
    │   └── GameConfig.js   # Central game configuration
    ├── scenes/
    │   ├── BootScene.js    # Initial boot and setup
    │   ├── PreloadScene.js # Asset loading with progress
    │   ├── MenuScene.js    # Main menu with navigation
    │   └── GameScene.js    # Main gameplay scene
    ├── utils/
    │   ├── AssetManager.js # Asset loading and management
    │   ├── ContextManager.js # WebGL context loss handling
    │   └── EventBus.js     # Global event bus
    └── plugins/
        ├── BasePlugin.js       # Base plugin class
        ├── PerformancePlugin.js # Performance monitoring
        └── SaveLoadPlugin.js    # Save/load functionality
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd phaser-robust-game
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Configuration

### Game Configuration
Edit `src/config/GameConfig.js` to customize:
- Canvas dimensions and scaling
- Physics settings
- Rendering options
- Input configuration
- Performance settings

### Environment-Specific Settings
The application automatically detects development vs. production and adjusts:
- Debug logging
- Performance monitoring
- Error verbosity

## Development

### Available Scripts
- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Debug Features (Development Mode)
- **F1**: Toggle performance stats overlay
- **F2**: Force WebGL context loss (for testing)
- **F3**: Force WebGL context restore (for testing)
- **F4**: Quick save game state
- **F5**: Quick load game state

### Creating New Scenes

1. Create a new scene file in `src/scenes/`:
```javascript
import Phaser from 'phaser';

export class MyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MyScene' });
  }

  create() {
    // Scene setup
  }

  update() {
    // Game loop
  }
}
```

2. Import and add to game configuration in `src/main.js`:
```javascript
import { MyScene } from '@scenes/MyScene';

const config = {
  ...gameConfig,
  scene: [BootScene, PreloadScene, MenuScene, GameScene, MyScene]
};
```

### Creating Custom Plugins

1. Extend the BasePlugin class:
```javascript
import { BasePlugin } from './BasePlugin';

export class MyPlugin extends BasePlugin {
  constructor(pluginManager) {
    super(pluginManager);
    this.name = 'MyPlugin';
  }

  start() {
    super.start();
    // Plugin initialization
  }
}
```

2. Initialize in `src/main.js`:
```javascript
this.myPlugin = new MyPlugin(this.plugins);
this.myPlugin.init(config);
this.myPlugin.start();
```

## Asset Management

### Adding Assets

1. Define assets in `src/utils/AssetManager.js`:
```javascript
getAssetManifest() {
  return {
    images: {
      player: { path: 'assets/images/player.png', type: 'image' }
    },
    sprites: {
      enemy: {
        path: 'assets/sprites/enemy.png',
        frameConfig: { frameWidth: 32, frameHeight: 32 },
        type: 'spritesheet'
      }
    }
  };
}
```

2. Load in PreloadScene:
```javascript
this.assetManager.loadAllAssets();
```

### Loading Methods
- Standard file loading
- Base64 embedded assets (for Playable Ads)
- Blob/URL objects

## Physics

The game uses Arcade Physics with configurable settings:

```javascript
physics: {
  default: 'arcade',
  arcade: {
    gravity: { y: 300 },
    debug: false
  }
}
```

For more complex physics, you can switch to Matter.js:

```javascript
physics: {
  default: 'matter',
  matter: {
    debug: true,
    gravity: { y: 1 }
  }
}
```

## Save/Load System

### Saving Game State
```javascript
const gameState = {
  score: 1000,
  level: 5,
  playerData: { /* ... */ }
};

game.saveLoadPlugin.save(gameState, 'slot1');
```

### Loading Game State
```javascript
const gameState = game.saveLoadPlugin.load('slot1');
if (gameState) {
  // Restore game state
}
```

### Auto-Save
```javascript
// Enable auto-save every 60 seconds
game.saveLoadPlugin.enableAutoSave(60000, 'autosave');
```

## Event System

### Emitting Events
```javascript
import eventBus from '@utils/EventBus';

eventBus.emit('custom:event', data);
```

### Listening to Events
```javascript
eventBus.on('custom:event', (data) => {
  console.log('Event received:', data);
});
```

### Built-in Events
- `game:ready` - Game initialization complete
- `level:complete` - Level completed
- `score:update` - Score changed
- `context:lost` - WebGL context lost
- `context:restored` - WebGL context restored

## Performance Optimization

### Best Practices
1. **Object Pooling**: Reuse game objects instead of creating/destroying
2. **Texture Atlases**: Combine sprites into atlases for efficient rendering
3. **Limit Draw Calls**: Batch similar objects together
4. **Efficient Collisions**: Use spatial hashing for collision detection
5. **Asset Preloading**: Load all assets during PreloadScene
6. **Memory Management**: Clean up unused assets and event listeners

### Monitoring Performance
Enable the performance plugin to monitor:
- FPS (Frames Per Second)
- Delta time
- Memory usage
- Object count
- Renderer type

## Browser Support

- Modern browsers with ES6+ support
- WebGL-capable browsers (with Canvas fallback)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Production Build
```bash
npm run build
```

This creates an optimized build in the `dist/` directory with:
- Minified code
- Tree-shaking
- Code splitting
- Optimized assets

### Hosting
Deploy the `dist/` directory to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Firebase Hosting

## Integration with Other Frameworks

This Phaser application can be integrated with:
- **React**: Embed in React components
- **Vue**: Use in Vue applications
- **Remix**: Server-side rendering support
- **Electron**: Desktop applications
- **Capacitor/Cordova**: Mobile apps

## Troubleshooting

### WebGL Context Lost
The application automatically handles WebGL context loss. If you encounter issues:
1. Check console for context loss events
2. Test recovery with F2/F3 debug keys
3. Verify ContextManager is initialized

### Performance Issues
1. Enable performance stats (F1 in dev mode)
2. Check object count and draw calls
3. Profile with browser DevTools
4. Reduce physics calculations
5. Optimize asset sizes

### Asset Loading Failures
1. Check browser console for errors
2. Verify asset paths in AssetManager
3. Check network tab for failed requests
4. Ensure CORS is properly configured

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Follow existing code style
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Resources

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Phaser Examples](https://phaser.io/examples)
- [Phaser Community](https://phaser.discourse.group/)
- [Game Dev Resources](https://github.com/ellisonleao/magictools)

## Credits

Built with:
- [Phaser 3](https://phaser.io/) - HTML5 Game Framework
- [Vite](https://vitejs.dev/) - Build Tool
- Modern JavaScript (ES6+)

---

**Happy Game Development!**