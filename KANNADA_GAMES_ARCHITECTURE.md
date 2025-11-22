# Kannada Learning Games Architecture

## Overview

This document outlines the architecture for building 25+ Kannada language learning games on top of the existing Phaser 3 framework. The architecture emphasizes **reusability, modularity, data-driven design, and scalability**.

---

## 1. Core Architecture Principles

### 1.1 Design Goals

- **Reusability**: Shared components across all 25+ games
- **Data-Driven**: Game logic driven by JSON/configuration files
- **Modularity**: Plug-and-play game mechanics
- **Scalability**: Easy to add new games without refactoring
- **Maintainability**: Centralized language content and assets
- **Accessibility**: Audio, visual feedback, and difficulty levels
- **Performance**: Optimized for mobile and web browsers

### 1.2 Architectural Layers

```
┌─────────────────────────────────────────────────────────┐
│              USER INTERFACE LAYER                        │
│  (Scenes, UI Components, Visual Feedback)               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│           GAME LOGIC LAYER                               │
│  (Game Mechanics, Rules, State Management)              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│        EDUCATIONAL FRAMEWORK LAYER                       │
│  (Learning Engine, Progress Tracking, Rewards)          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│          CONTENT MANAGEMENT LAYER                        │
│  (Kannada Data, Audio, Images, Translations)            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│            PHASER ENGINE LAYER                           │
│  (Rendering, Physics, Input, Audio, Events)             │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
src/
├── main.js                          # Entry point
├── config/
│   ├── GameConfig.js                # Existing Phaser config
│   ├── KannadaGamesConfig.js        # Educational games configuration
│   └── DifficultyLevels.js          # Difficulty settings per game
│
├── scenes/
│   ├── BootScene.js                 # Existing
│   ├── PreloadScene.js              # Enhanced with Kannada assets
│   ├── MenuScene.js                 # Main menu
│   │
│   ├── kannada/                     # Kannada learning scenes
│   │   ├── GameHubScene.js          # Game selection hub
│   │   ├── ProfileScene.js          # User profile & progress
│   │   ├── RewardsScene.js          # Achievements & badges
│   │   │
│   │   ├── alphabet/                # Alphabet learning games
│   │   │   ├── AksharaPopScene.js
│   │   │   ├── LetterTracingScene.js
│   │   │   ├── AlphabetRainScene.js
│   │   │   ├── LetterMatchScene.js
│   │   │   └── SpinningWheelScene.js
│   │   │
│   │   ├── vocabulary/              # Vocabulary games
│   │   │   ├── FruitBasketScene.js
│   │   │   ├── AnimalSafariScene.js
│   │   │   ├── ColorSplashScene.js
│   │   │   ├── NumberRocketsScene.js
│   │   │   ├── BodyPartsRobotScene.js
│   │   │   ├── VegetableGardenScene.js
│   │   │   └── FamilyTreeScene.js
│   │   │
│   │   ├── words/                   # Word formation games
│   │   │   ├── LetterBridgeScene.js
│   │   │   ├── WordFactoryScene.js
│   │   │   ├── SpellPictureScene.js
│   │   │   ├── MissingLetterScene.js
│   │   │   └── CompoundWordScene.js
│   │   │
│   │   ├── sentences/               # Sentence building games
│   │   │   ├── SentenceTrainScene.js
│   │   │   ├── QuestionAnswerScene.js
│   │   │   ├── ActionVerbScene.js
│   │   │   └── StorySequencerScene.js
│   │   │
│   │   ├── reading/                 # Reading comprehension games
│   │   │   ├── StoryBookScene.js
│   │   │   ├── ReadingRaceScene.js
│   │   │   ├── RhymeTimeScene.js
│   │   │   └── DialogueDramaScene.js
│   │   │
│   │   ├── listening/               # Pronunciation games
│   │   │   ├── EchoGameScene.js
│   │   │   ├── SoundSafariScene.js
│   │   │   ├── WhichWordScene.js
│   │   │   └── TongueTwisterScene.js
│   │   │
│   │   └── cultural/                # Cultural context games
│   │       ├── FestivalFunScene.js
│   │       ├── MarketShoppingScene.js
│   │       ├── ClassroomScene.js
│   │       └── DailyRoutineScene.js
│   │
│   └── base/
│       └── BaseGameScene.js         # Base class for all educational games
│
├── components/                      # Reusable game components
│   ├── ui/
│   │   ├── Button.js                # Custom button component
│   │   ├── ProgressBar.js           # Progress indicator
│   │   ├── ScoreDisplay.js          # Score counter
│   │   ├── LivesDisplay.js          # Lives/hearts display
│   │   ├── Timer.js                 # Countdown timer
│   │   ├── StarRating.js            # Performance rating
│   │   ├── Modal.js                 # Dialog/modal windows
│   │   ├── Card.js                  # Interactive card component
│   │   ├── Tooltip.js               # Hover tooltips
│   │   └── ParticleEffects.js       # Celebration effects
│   │
│   ├── educational/
│   │   ├── LetterSprite.js          # Animated Kannada letter
│   │   ├── WordCard.js              # Word display card
│   │   ├── AudioButton.js           # Play pronunciation button
│   │   ├── TracingPath.js           # Letter tracing path
│   │   ├── DraggableItem.js         # Drag-and-drop item
│   │   ├── DropZone.js              # Drop target zone
│   │   ├── MatchingPair.js          # Matching game pair
│   │   ├── FlashCard.js             # Flip card component
│   │   └── StoryPage.js             # Story book page
│   │
│   └── game-objects/
│       ├── Bubble.js                # Floating bubble
│       ├── FallingObject.js         # Falling item physics
│       ├── CollectibleItem.js       # Collectible star/coin
│       ├── Character.js             # Animated character
│       └── AnimatedBackground.js    # Dynamic backgrounds
│
├── systems/                         # Core game systems
│   ├── learning/
│   │   ├── LearningEngine.js        # Tracks learning progress
│   │   ├── DifficultyAdapter.js     # Adaptive difficulty
│   │   ├── SpacedRepetition.js      # SRS algorithm
│   │   ├── ProgressTracker.js       # Skill progress tracking
│   │   └── RewardSystem.js          # Points, badges, achievements
│   │
│   ├── audio/
│   │   ├── AudioManager.js          # Audio playback manager
│   │   ├── PronunciationEngine.js   # Play Kannada pronunciations
│   │   ├── VoiceRecorder.js         # Record user voice (optional)
│   │   └── SoundFeedback.js         # Correct/incorrect sounds
│   │
│   ├── input/
│   │   ├── TouchHandler.js          # Touch/click management
│   │   ├── DragDropManager.js       # Drag and drop system
│   │   ├── GestureRecognizer.js     # Swipe/gesture detection
│   │   └── KeyboardManager.js       # Keyboard input
│   │
│   └── analytics/
│       ├── GameAnalytics.js         # Track game events
│       ├── LearningAnalytics.js     # Track learning metrics
│       └── SessionManager.js        # Session tracking
│
├── data/                            # Content data
│   ├── kannada/
│   │   ├── alphabet.json            # Letters (ಅ-ಹ) with metadata
│   │   ├── vowels.json              # Vowels (ಅ, ಆ, ಇ, ಈ, etc.)
│   │   ├── consonants.json          # Consonants (ಕ, ಖ, ಗ, ಘ, etc.)
│   │   ├── numbers.json             # Numbers (೧-೧೦, ಒಂದು-ಹತ್ತು)
│   │   ├── colors.json              # Colors vocabulary
│   │   ├── animals.json             # Animals vocabulary
│   │   ├── fruits.json              # Fruits vocabulary
│   │   ├── vegetables.json          # Vegetables vocabulary
│   │   ├── bodyparts.json           # Body parts vocabulary
│   │   ├── family.json              # Family relationships
│   │   ├── verbs.json               # Common verbs
│   │   ├── adjectives.json          # Common adjectives
│   │   ├── phrases.json             # Common phrases
│   │   ├── stories.json             # Short stories
│   │   ├── rhymes.json              # Rhymes and songs
│   │   └── festivals.json           # Cultural content
│   │
│   ├── games/
│   │   ├── akshara-pop.json         # Game-specific config
│   │   ├── letter-tracing.json
│   │   ├── fruit-basket.json
│   │   └── [game-name].json         # Config for each game
│   │
│   ├── levels/
│   │   ├── alphabet-levels.json     # Level progression
│   │   ├── vocabulary-levels.json
│   │   └── [category]-levels.json
│   │
│   └── rewards/
│       ├── achievements.json        # Achievement definitions
│       ├── badges.json              # Badge definitions
│       └── milestones.json          # Milestone rewards
│
├── assets/                          # Game assets
│   ├── audio/
│   │   ├── pronunciations/
│   │   │   ├── letters/             # Individual letter sounds
│   │   │   ├── words/               # Word pronunciations
│   │   │   └── phrases/             # Phrase pronunciations
│   │   ├── music/                   # Background music
│   │   ├── sfx/                     # Sound effects
│   │   └── feedback/                # Correct/incorrect sounds
│   │
│   ├── images/
│   │   ├── ui/                      # UI elements
│   │   ├── backgrounds/             # Background images
│   │   ├── characters/              # Character sprites
│   │   ├── objects/                 # Game objects
│   │   ├── vocabulary/              # Vocabulary images
│   │   │   ├── animals/
│   │   │   ├── fruits/
│   │   │   ├── vegetables/
│   │   │   └── [category]/
│   │   └── icons/                   # Icons and badges
│   │
│   ├── fonts/
│   │   ├── Nudi.ttf                 # Kannada font
│   │   └── Tunga.ttf                # Alternative Kannada font
│   │
│   └── spritesheets/
│       ├── letters.png              # Kannada letter sprites
│       ├── characters.png           # Animated characters
│       └── effects.png              # Particle effects
│
├── utils/                           # Existing + new utilities
│   ├── EventBus.js                  # Existing
│   ├── AssetManager.js              # Enhanced for Kannada assets
│   ├── ContextManager.js            # Existing
│   ├── KannadaUtils.js              # Kannada text utilities
│   ├── TextRenderer.js              # Kannada text rendering
│   ├── DataLoader.js                # Load JSON data
│   └── LocaleManager.js             # Multi-language support
│
└── plugins/                         # Existing + new plugins
    ├── PerformancePlugin.js         # Existing
    ├── SaveLoadPlugin.js            # Enhanced for learning data
    ├── ProgressPlugin.js            # Learning progress tracking
    └── AccessibilityPlugin.js       # Accessibility features
```

---

## 3. Core Systems Design

### 3.1 Base Game Scene

All educational games extend from `BaseGameScene.js`:

```javascript
// src/scenes/base/BaseGameScene.js
class BaseGameScene extends Phaser.Scene {
  constructor(key, config) {
    super(key);
    this.gameConfig = config;
    this.difficulty = 'beginner';
    this.score = 0;
    this.lives = 3;
    this.timer = null;
  }

  // Lifecycle hooks
  init(data) { /* Setup */ }
  preload() { /* Load game-specific assets */ }
  create() { /* Initialize game */ }
  update(time, delta) { /* Game loop */ }

  // Common game methods
  startGame() { /* Begin gameplay */ }
  pauseGame() { /* Pause */ }
  resumeGame() { /* Resume */ }
  endGame(success) { /* End and show results */ }

  // Scoring & feedback
  addScore(points) { /* Update score */ }
  playCorrectFeedback() { /* Correct answer */ }
  playIncorrectFeedback() { /* Wrong answer */ }
  showHint() { /* Display hint */ }

  // UI methods
  createStandardUI() { /* Score, lives, timer */ }
  showInstructions() { /* Game instructions */ }
  showResults() { /* End screen */ }
}
```

### 3.2 Learning Engine

Tracks student progress and adapts difficulty:

```javascript
// src/systems/learning/LearningEngine.js
class LearningEngine {
  constructor() {
    this.studentProfile = {
      level: 1,
      totalScore: 0,
      gamesPlayed: 0,
      skillLevels: {
        alphabet: 0,
        vocabulary: 0,
        words: 0,
        sentences: 0,
        reading: 0,
        listening: 0
      },
      masteredLetters: [],
      masteredWords: [],
      weakAreas: []
    };
  }

  // Track learning events
  recordAttempt(gameType, item, success, timeMs) {}
  recordGameComplete(gameType, score, accuracy) {}

  // Analyze performance
  calculateMastery(item) {} // Returns 0-1
  identifyWeakAreas() {}
  suggestNextGame() {}

  // Adaptive difficulty
  getRecommendedDifficulty(gameType) {}
  selectContentForStudent(category, count) {}
}
```

### 3.3 Spaced Repetition System

Optimize learning retention:

```javascript
// src/systems/learning/SpacedRepetition.js
class SpacedRepetitionSystem {
  constructor() {
    this.items = new Map(); // item -> SRS data
  }

  // SRS algorithm (simplified SM-2)
  calculateNextReview(item, performance) {
    // performance: 0-5 (0=forgot, 5=perfect)
    // Returns next review timestamp
  }

  getDueItems(category) {
    // Returns items due for review
  }

  recordReview(item, performance) {
    // Updates item's SRS data
  }
}
```

### 3.4 Audio Manager

Handles all Kannada pronunciation playback:

```javascript
// src/systems/audio/AudioManager.js
class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.pronunciations = new Map();
    this.music = null;
    this.sfxVolume = 1.0;
    this.musicVolume = 0.5;
  }

  // Load audio
  loadPronunciation(letter, audioPath) {}
  loadWordAudio(word, audioPath) {}

  // Playback
  playLetter(letter) {}
  playWord(word) {}
  playPhrase(phrase) {}

  // Feedback sounds
  playCorrect() {}
  playIncorrect() {}
  playCelebration() {}

  // Music
  playBackgroundMusic(track) {}
  stopMusic() {}

  // Volume control
  setMasterVolume(volume) {}
  setSFXVolume(volume) {}
  setMusicVolume(volume) {}
}
```

### 3.5 Progress Tracker

Persists learning progress:

```javascript
// src/systems/learning/ProgressTracker.js
class ProgressTracker {
  constructor() {
    this.profile = this.loadProfile();
  }

  // Profile management
  loadProfile() { /* Load from localStorage */ }
  saveProfile() { /* Save to localStorage */ }
  resetProfile() { /* Clear progress */ }

  // Progress tracking
  markLetterLearned(letter) {}
  markWordLearned(word) {}
  addGameCompletion(gameType, score, stars) {}

  // Analytics
  getGameStats(gameType) {}
  getOverallProgress() {}
  getStrengthsWeaknesses() {}

  // Achievements
  checkAchievements() {}
  unlockBadge(badgeId) {}
}
```

### 3.6 Reward System

Gamification and motivation:

```javascript
// src/systems/learning/RewardSystem.js
class RewardSystem {
  constructor() {
    this.achievements = [];
    this.badges = [];
    this.totalStars = 0;
  }

  // Reward calculation
  calculateStars(score, maxScore, time, maxTime) {
    // Returns 1-3 stars based on performance
  }

  // Achievement system
  checkAchievements(event) {
    // Check if any achievements unlocked
  }

  // Badge system
  unlockBadge(badgeId) {}

  // Events
  onAchievementUnlocked(achievement) {
    // Show celebration animation
  }
}
```

---

## 4. Data-Driven Game Design

### 4.1 Content Data Structure

All Kannada content in JSON format:

```json
// src/data/kannada/alphabet.json
{
  "vowels": [
    {
      "id": "ka_vowel_a",
      "letter": "ಅ",
      "transliteration": "a",
      "pronunciation": "ah",
      "audioPath": "audio/pronunciations/letters/a.mp3",
      "category": "vowel",
      "order": 1,
      "difficulty": "beginner",
      "examples": [
        {
          "word": "ಅಮ್ಮ",
          "meaning": "mother",
          "audioPath": "audio/pronunciations/words/amma.mp3",
          "imagePath": "images/vocabulary/family/mother.png"
        }
      ]
    }
  ],
  "consonants": [
    {
      "id": "ka_consonant_ka",
      "letter": "ಕ",
      "transliteration": "ka",
      "pronunciation": "kah",
      "audioPath": "audio/pronunciations/letters/ka.mp3",
      "category": "consonant",
      "order": 1,
      "difficulty": "beginner",
      "combinations": ["ಕಾ", "ಕಿ", "ಕೀ", "ಕು", "ಕೂ"]
    }
  ]
}
```

```json
// src/data/kannada/animals.json
{
  "category": "animals",
  "items": [
    {
      "id": "animal_dog",
      "kannada": "ನಾಯಿ",
      "english": "dog",
      "transliteration": "naayi",
      "audioPath": "audio/pronunciations/words/naayi.mp3",
      "imagePath": "images/vocabulary/animals/dog.png",
      "difficulty": "beginner",
      "tags": ["pet", "mammal"]
    }
  ]
}
```

### 4.2 Game Configuration

Each game has a JSON config:

```json
// src/data/games/akshara-pop.json
{
  "gameId": "akshara_pop",
  "name": "Akshara Pop",
  "description": "Pop the bubbles with the correct letter!",
  "category": "alphabet",
  "difficulty": {
    "beginner": {
      "bubbleSpeed": 50,
      "spawnInterval": 2000,
      "letters": ["vowels"],
      "timeLimit": 60,
      "targetScore": 10
    },
    "intermediate": {
      "bubbleSpeed": 80,
      "spawnInterval": 1500,
      "letters": ["vowels", "consonants:basic"],
      "timeLimit": 45,
      "targetScore": 20
    },
    "advanced": {
      "bubbleSpeed": 120,
      "spawnInterval": 1000,
      "letters": ["all"],
      "timeLimit": 30,
      "targetScore": 30
    }
  },
  "scoring": {
    "correctPop": 10,
    "wrongPop": -5,
    "timeBonus": 2,
    "comboMultiplier": 1.5
  },
  "assets": {
    "background": "images/backgrounds/sky.png",
    "bubble": "images/objects/bubble.png",
    "popSound": "audio/sfx/pop.mp3"
  }
}
```

### 4.3 Level Progression

Define learning paths:

```json
// src/data/levels/alphabet-levels.json
{
  "levels": [
    {
      "levelId": 1,
      "name": "Vowels Introduction",
      "description": "Learn the Kannada vowels",
      "unlockCondition": "none",
      "content": {
        "letters": ["ಅ", "ಆ", "ಇ", "ಈ", "ಉ"],
        "games": ["akshara_pop", "letter_tracing"],
        "minGamesComplete": 2
      },
      "completionCriteria": {
        "minScore": 100,
        "minAccuracy": 0.7,
        "mustMasterLetters": ["ಅ", "ಆ", "ಇ"]
      },
      "rewards": {
        "stars": 3,
        "badge": "vowel_novice",
        "unlocks": ["level_2"]
      }
    }
  ]
}
```

---

## 5. UI Component Library

### 5.1 Reusable Components

```javascript
// src/components/ui/Button.js
class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text, onClick, style = {}) {
    super(scene, x, y);

    // Background
    this.bg = scene.add.rectangle(0, 0, 200, 60, style.bgColor || 0x4CAF50);
    this.bg.setStrokeStyle(2, style.borderColor || 0x388E3C);

    // Text
    this.text = scene.add.text(0, 0, text, {
      fontSize: style.fontSize || '24px',
      fontFamily: style.fontFamily || 'Arial',
      color: style.textColor || '#FFFFFF'
    }).setOrigin(0.5);

    // Add to container
    this.add([this.bg, this.text]);

    // Interactivity
    this.setSize(200, 60);
    this.setInteractive({ useHandCursor: true });

    // Events
    this.on('pointerdown', onClick);
    this.on('pointerover', () => this.onHover());
    this.on('pointerout', () => this.onOut());
  }

  onHover() {
    this.bg.setFillStyle(0x66BB6A);
    this.setScale(1.05);
  }

  onOut() {
    this.bg.setFillStyle(0x4CAF50);
    this.setScale(1.0);
  }
}
```

```javascript
// src/components/educational/LetterSprite.js
class LetterSprite extends Phaser.GameObjects.Container {
  constructor(scene, x, y, letterData) {
    super(scene, x, y);

    this.letterData = letterData;

    // Background circle
    this.bg = scene.add.circle(0, 0, 50, 0xFFFFFF);
    this.bg.setStrokeStyle(3, 0x2196F3);

    // Kannada letter text
    this.letterText = scene.add.text(0, 0, letterData.letter, {
      fontSize: '48px',
      fontFamily: 'Nudi',
      color: '#000000'
    }).setOrigin(0.5);

    // Audio button
    this.audioBtn = scene.add.circle(35, -35, 15, 0x4CAF50);
    this.audioBtn.setInteractive({ useHandCursor: true });
    this.audioBtn.on('pointerdown', () => this.playAudio());

    this.add([this.bg, this.letterText, this.audioBtn]);
  }

  playAudio() {
    this.scene.audioManager.playLetter(this.letterData.letter);
  }

  highlight() {
    this.scene.tweens.add({
      targets: this.bg,
      fillColor: 0xFFEB3B,
      duration: 300,
      yoyo: true
    });
  }
}
```

---

## 6. Game Templates & Patterns

### 6.1 Matching Game Template

```javascript
// Template for: Letter Match, Question-Answer Match, etc.
class MatchingGameScene extends BaseGameScene {
  constructor() {
    super('MatchingGame', {
      pairsCount: 6,
      timeLimit: 120,
      category: 'alphabet'
    });
  }

  create() {
    this.createStandardUI();
    this.loadContent(); // Load pairs from data
    this.createCards();
    this.setupMatching();
  }

  createCards() {
    // Create grid of cards
    // Shuffle and place
  }

  onCardClick(card) {
    // Matching logic
    // Check if pair matches
  }

  checkMatch(card1, card2) {
    // Validate match
    // Provide feedback
  }
}
```

### 6.2 Falling Objects Template

```javascript
// Template for: Alphabet Rain, Number Rockets, etc.
class FallingObjectsScene extends BaseGameScene {
  constructor() {
    super('FallingObjects', {
      fallSpeed: 100,
      spawnInterval: 1500,
      targetType: 'letter'
    });
  }

  create() {
    this.createBasket();
    this.startSpawning();
  }

  spawnObject() {
    // Create falling object with random content
    // Add physics
  }

  checkCatch(basket, object) {
    // Collision detection
    // Validate if correct item
  }
}
```

### 6.3 Drag-and-Drop Template

```javascript
// Template for: Letter Bridge, Word Factory, Sentence Train, etc.
class DragDropScene extends BaseGameScene {
  constructor() {
    super('DragDrop', {
      items: [],
      dropZones: []
    });
  }

  create() {
    this.createDraggableItems();
    this.createDropZones();
    this.setupDragDrop();
  }

  onDragStart(pointer, gameObject) {}
  onDrag(pointer, gameObject, dragX, dragY) {}
  onDragEnd(pointer, gameObject) {}
  onDrop(pointer, gameObject, dropZone) {
    // Validate drop
    // Check correctness
  }
}
```

---

## 7. Asset Management Strategy

### 7.1 Asset Loading

```javascript
// src/scenes/PreloadScene.js (Enhanced)
class PreloadScene extends Phaser.Scene {
  preload() {
    // Load all Kannada assets
    this.loadKannadaFonts();
    this.loadAudioPronunciations();
    this.loadVocabularyImages();
    this.loadUIAssets();
    this.loadGameAssets();
  }

  loadKannadaFonts() {
    // Load custom Kannada fonts
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  loadAudioPronunciations() {
    // Load all letter and word pronunciations
    const letters = this.cache.json.get('alphabet');
    letters.vowels.forEach(letter => {
      this.load.audio(`letter_${letter.id}`, letter.audioPath);
    });
  }

  loadVocabularyImages() {
    // Load category images
    const animals = this.cache.json.get('animals');
    animals.items.forEach(animal => {
      this.load.image(`vocab_${animal.id}`, animal.imagePath);
    });
  }
}
```

### 7.2 Asset Generation Script

For placeholder development:

```javascript
// scripts/generatePlaceholderAssets.js
// Generates placeholder images and audio for development
// Can be replaced with real assets later
```

---

## 8. State Management & Persistence

### 8.1 Save Data Structure

```json
{
  "version": "1.0.0",
  "profileId": "player_123",
  "playerName": "Ravi",
  "createdAt": "2025-01-15T10:00:00Z",
  "lastPlayed": "2025-01-22T14:30:00Z",

  "progress": {
    "level": 5,
    "totalScore": 1250,
    "totalStars": 45,
    "gamesPlayed": 23,
    "totalPlayTime": 7200
  },

  "skills": {
    "alphabet": {
      "level": 3,
      "masteredLetters": ["ಅ", "ಆ", "ಇ", "ಈ", "ಕ", "ಖ"],
      "accuracy": 0.85
    },
    "vocabulary": {
      "level": 2,
      "masteredWords": ["ನಾಯಿ", "ಬೆಕ್ಕು", "ಹಣ್ಣು"],
      "accuracy": 0.78
    }
  },

  "gameHistory": {
    "akshara_pop": {
      "plays": 5,
      "bestScore": 250,
      "averageScore": 180,
      "stars": 3,
      "lastPlayed": "2025-01-22T14:00:00Z"
    }
  },

  "achievements": [
    {
      "id": "first_game",
      "unlockedAt": "2025-01-15T10:30:00Z"
    }
  ],

  "srsData": {
    "ಅ": {
      "easeFactor": 2.5,
      "interval": 3,
      "nextReview": "2025-01-25T00:00:00Z"
    }
  },

  "settings": {
    "sfxVolume": 0.8,
    "musicVolume": 0.5,
    "difficulty": "intermediate",
    "showHints": true
  }
}
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- ✅ Existing Phaser setup (DONE)
- Set up Kannada fonts and text rendering
- Create BaseGameScene
- Build UI component library
- Set up data structures (JSON files)
- Create AudioManager
- Build ProgressTracker

### Phase 2: Core Systems (Week 3-4)
- LearningEngine implementation
- SpacedRepetitionSystem
- RewardSystem
- Enhanced SaveLoadPlugin
- Game templates (Matching, Falling, DragDrop)

### Phase 3: First Game Set (Week 5-6)
**Alphabet Games (5 games)**
- Akshara Pop
- Letter Tracing
- Alphabet Rain
- Letter Match
- Spinning Wheel

### Phase 4: Vocabulary Games (Week 7-8)
**Vocabulary Games (7 games)**
- Fruit Basket
- Animal Safari
- Color Splash
- Number Rockets
- Body Parts Robot
- Vegetable Garden
- Family Tree

### Phase 5: Word & Sentence Games (Week 9-10)
**Word Formation (5 games)**
- Letter Bridge
- Word Factory
- Spell Picture
- Missing Letter
- Compound Words

**Sentence Games (4 games)**
- Sentence Train
- Question-Answer
- Action Verbs
- Story Sequencer

### Phase 6: Reading & Cultural Games (Week 11-12)
**Reading Games (4 games)**
- Story Book
- Reading Race
- Rhyme Time
- Dialogue Drama

**Listening Games (4 games)**
- Echo Game
- Sound Safari
- Which Word
- Tongue Twister

**Cultural Games (4 games)**
- Festival Fun
- Market Shopping
- Classroom
- Daily Routine

### Phase 7: Polish & Enhancement (Week 13-14)
- Animation polish
- Sound effects
- Achievement system
- Progress dashboard
- Parent/teacher dashboard
- Analytics integration

### Phase 8: Testing & Optimization (Week 15-16)
- User testing with kids
- Performance optimization
- Mobile responsiveness
- Accessibility testing
- Bug fixes
- Documentation

---

## 10. Technical Considerations

### 10.1 Kannada Font Rendering

```javascript
// Ensure Kannada fonts load correctly
WebFont.load({
  google: {
    families: ['Noto Sans Kannada']
  },
  custom: {
    families: ['Nudi', 'Tunga'],
    urls: ['assets/fonts/fonts.css']
  },
  active: () => {
    this.scene.start('PreloadScene');
  }
});
```

### 10.2 Audio Optimization

- Use MP3 for broad compatibility
- Compress audio files (target: <50KB per pronunciation)
- Implement audio sprite sheets for SFX
- Lazy load audio (load on-demand for specific games)

### 10.3 Mobile Optimization

- Touch-friendly UI (minimum 44x44px buttons)
- Responsive layouts (support 320px to 1920px width)
- Performance budget: 60 FPS on mid-range mobile
- Texture atlases for reduced draw calls
- Object pooling for frequently created objects

### 10.4 Accessibility

- High contrast mode option
- Adjustable text size
- Audio cues for all interactions
- Keyboard navigation support
- Screen reader compatible (where possible)
- Colorblind-friendly palettes

---

## 11. Data-Driven Content Pipeline

### 11.1 Content Creation Workflow

```
1. Define learning objectives
     ↓
2. Create content JSON (letters, words, etc.)
     ↓
3. Record audio pronunciations
     ↓
4. Create/source images
     ↓
5. Define game configuration
     ↓
6. Implement game scene (using template)
     ↓
7. Test and iterate
```

### 11.2 Content Management Tools

Consider building:
- **Content Editor**: Web-based tool to edit JSON data
- **Audio Recorder**: Record and tag pronunciations
- **Game Configurator**: Visual tool to configure game parameters

---

## 12. Analytics & Learning Insights

### 12.1 Metrics to Track

**Game Metrics:**
- Play count per game
- Average score
- Completion rate
- Time spent per game
- Retry rate

**Learning Metrics:**
- Letters mastered
- Words mastered
- Accuracy trends
- Learning velocity
- Weak areas identification
- Spaced repetition effectiveness

**Engagement Metrics:**
- Daily active time
- Session length
- Return rate
- Achievement unlock rate
- Progression path

### 12.2 Learning Dashboard

Create a dashboard showing:
- Overall progress (%)
- Skill levels by category
- Recent achievements
- Recommended next games
- Strengths and weaknesses
- Learning streaks

---

## 13. Extensibility & Future Features

### 13.1 Plugin Architecture

Easy to add new features:
- **MultiplayerPlugin**: Competitive/cooperative games
- **SpeechRecognitionPlugin**: Pronunciation validation
- **AITutorPlugin**: Personalized hints and guidance
- **ParentalControlPlugin**: Time limits, progress reports

### 13.2 Content Expansion

Easy to add:
- New vocabulary categories
- Additional dialects
- Advanced grammar lessons
- Real-world conversation scenarios
- Integration with curriculum standards

### 13.3 Localization

Support for:
- UI in multiple languages (English, Kannada, Hindi)
- Regional Kannada variations
- Audio in different voices/accents

---

## 14. Quality Assurance

### 14.1 Testing Strategy

- **Unit Tests**: All systems and utilities
- **Integration Tests**: Game scenes with mocked data
- **Content Tests**: Validate JSON data integrity
- **Audio Tests**: Verify all audio files load correctly
- **Visual Tests**: Screenshot comparison
- **Accessibility Tests**: WCAG compliance
- **Performance Tests**: FPS, memory, load times
- **User Tests**: Kids testing with observation

### 14.2 CI/CD Pipeline

```
Code Push
   ↓
Linting (ESLint)
   ↓
Unit Tests (Jest)
   ↓
Build (Vite)
   ↓
Deploy to Staging
   ↓
Manual QA
   ↓
Deploy to Production
```

---

## 15. Development Tools & Scripts

```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "format": "prettier --write src/",
    "serve": "vite preview",
    "data:validate": "node scripts/validateData.js",
    "assets:generate": "node scripts/generatePlaceholders.js",
    "content:export": "node scripts/exportContent.js",
    "analyze": "vite build --mode analyze"
  }
}
```

---

## Conclusion

This architecture provides:

✅ **Scalability**: Easy to add 25+ games with templates
✅ **Reusability**: Shared components across all games
✅ **Data-Driven**: Content separated from code
✅ **Maintainability**: Clear structure and separation of concerns
✅ **Extensibility**: Plugin architecture for new features
✅ **Performance**: Optimized for web and mobile
✅ **Educational Effectiveness**: Learning engine with SRS
✅ **Engagement**: Rewards, achievements, progress tracking

The architecture balances **engineering best practices** with **educational pedagogy** to create an effective Kannada language learning platform.
