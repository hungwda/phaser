# Kannada Learning Games

An interactive educational game platform for learning the Kannada language, built with Phaser 3.

## 🎮 Features

### Implemented
- ✅ **Akshara Pop** - Pop bubbles with the correct Kannada letters
- ✅ **Game Hub** - Central navigation for all learning games
- ✅ **Progress Tracking** - Persistent learning progress with localStorage
- ✅ **Achievement System** - Unlock badges and rewards
- ✅ **Adaptive Difficulty** - Dynamic difficulty based on performance
- ✅ **Audio Pronunciations** - Native Kannada letter and word pronunciations
- ✅ **Spaced Repetition** - Optimized learning retention with SRS algorithm
- ✅ **Comprehensive Testing** - Jest test suite for core systems

### Coming Soon
- 🔜 25+ additional learning games across all categories
- 🔜 Full audio library with native pronunciations
- 🔜 Profile and settings screens
- 🔜 Multiplayer competitive modes
- 🔜 Parent/teacher dashboard

## 🏗️ Architecture

### Core Systems

**Learning Engine**
- Adaptive difficulty recommendation
- Content selection based on student progress
- Weak area identification
- Personalized learning paths

**Progress Tracker**
- Persistent progress in localStorage
- Skill tracking by category (alphabet, vocabulary, words, etc.)
- Game completion history
- Achievement unlocks

**Reward System**
- Achievement definitions with unlock conditions
- Badge system
- Star-based performance rating
- Visual achievement notifications

**Audio Manager**
- Pronunciation playback
- Sound effects
- Background music
- Volume controls with persistence

### UI Components

**Reusable Components**
- `Button` - Interactive button with hover/click effects
- `ProgressBar` - Visual progress indicator
- `Card` - Flip card for matching games
- `LetterSprite` - Interactive Kannada letter display
- `WordCard` - Vocabulary card with image and translations

### Game Structure

All educational games extend `BaseGameScene` which provides:
- Standard UI (score, lives, timer)
- Game lifecycle management (start, pause, end)
- Scoring and feedback systems
- Result screens with retry/menu options

## 📁 Project Structure

```
src/
├── data/
│   ├── kannada/           # Kannada content (alphabet, animals, fruits, etc.)
│   └── games/             # Game configurations
├── scenes/
│   ├── base/              # BaseGameScene
│   └── kannada/           # Kannada learning game scenes
│       ├── GameHubScene.js
│       └── alphabet/
│           └── AksharaPopScene.js
├── components/
│   ├── ui/                # UI components (Button, Card, ProgressBar)
│   └── educational/       # Educational components (LetterSprite, WordCard)
├── systems/
│   ├── audio/             # AudioManager
│   └── learning/          # LearningEngine, ProgressTracker, RewardSystem
└── __tests__/             # Jest test suites
```

## 🎯 Game Categories

### Alphabet Games (ಅಕ್ಷರ ಆಟಗಳು)
1. **Akshara Pop** ✅ - Pop bubbles with correct letters
2. Letter Tracing - Trace Kannada letters
3. Alphabet Rain - Catch falling letters
4. Letter Match - Memory matching game
5. Spinning Wheel - Spin and identify letters

### Vocabulary Games (ಶಬ್ದಭಂಡಾರ ಆಟಗಳು)
- Fruit Basket - Learn fruit names
- Animal Safari - Identify animals
- Color Splash - Learn colors
- Number Rockets - Count in Kannada
- Body Parts Robot - Build robot learning body parts
- Vegetable Garden - Harvest and learn vegetable names
- Family Tree - Learn relationship words

### Word Formation Games (ಪದ ರಚನೆ ಆಟಗಳು)
- Letter Bridge - Build bridges spelling words
- Word Factory - Create words from letters
- Spell Picture - Spell words from images
- Missing Letter - Fill missing letters
- Compound Words - Match compound words

### Sentence Games (ವಾಕ್ಯ ಆಟಗಳು)
- Sentence Train - Arrange words to form sentences
- Question-Answer Match - Match questions and answers
- Action Verbs - Learn verbs through actions
- Story Sequencer - Arrange sentences in order

### Reading & Listening Games
- Story Book - Interactive reading
- Reading Race - Read and comprehend quickly
- Rhyme Time - Match rhyming words
- Echo Game - Pronunciation practice
- Sound Safari - Identify words by sound
- Which Word - Listen and choose correct word

### Cultural Games (ಸಂಸ್ಕೃತಿ ಆಟಗಳು)
- Festival Fun - Learn about Kannada festivals
- Market Shopping - Practice marketplace phrases
- Classroom - Learn school-related vocabulary
- Daily Routine - Time and daily activities

## 📊 Learning Data

### Alphabet Data
- **Vowels**: ಅ, ಆ, ಇ, ಈ, ಉ, ಊ (6 vowels included)
- **Consonants**: ಕ, ಖ, ಗ, ನ, ಮ (5 consonants included)
- Each letter includes:
  - Transliteration
  - Pronunciation guide
  - Audio path
  - Example words
  - Difficulty level

### Vocabulary Data
- **Animals** (10 items): ನಾಯಿ, ಬೆಕ್ಕು, ಆನೆ, etc.
- **Fruits** (8 items): ಸೇಬು, ಬಾಳೆಹಣ್ಣು, ಮಾವಿನ ಹಣ್ಣು, etc.
- **Colors** (10 items): ಕೆಂಪು, ನೀಲಿ, ಹಸಿರು, etc.
- **Numbers** (0-10): ಸೊನ್ನೆ, ಒಂದು, ಎರಡು, etc.

Each vocabulary item includes:
- Kannada text
- English translation
- Transliteration
- Audio path
- Image path
- Difficulty level

## 🎓 Learning Features

### Spaced Repetition System (SRS)
- SM-2 algorithm implementation
- Automatic review scheduling
- Ease factor adjustment based on performance
- Tracks mastery level for each item

### Adaptive Difficulty
- Three levels: beginner, intermediate, advanced
- Automatic difficulty recommendation based on:
  - Skill level (0-3)
  - Accuracy (percentage correct)
  - Total attempts

### Progress Tracking
- Letters mastered
- Words learned
- Games played
- Total score and stars
- Accuracy by category
- Strengths and weaknesses analysis

### Achievement System
- First-time achievements (first game, first letter, first word)
- Milestone achievements (5, 10, 25 games)
- Mastery achievements (perfect accuracy, expert learner)
- Score and star achievements
- Visual notifications with sound effects

## 🧪 Testing

Run the test suite:

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

Test coverage includes:
- AudioManager (pronunciation, volume, mute, persistence)
- ProgressTracker (profile, games, learning, achievements)
- LearningEngine (difficulty, content selection, SRS, weak areas)

## 🚀 Getting Started

1. **Run the application**
   ```bash
   npm run dev
   ```

2. **Access the game**
   - Open http://localhost:3000
   - Click "LEARN KANNADA" from main menu
   - Select "Alphabet Games" category
   - Play "Akshara Pop"

3. **Game Controls**
   - Click/tap bubbles with the correct letter
   - Listen to pronunciation with 🔊 button
   - Build combos for bonus points
   - Complete before time runs out

## 📈 Future Development

### Phase 1: Core Games (Weeks 5-8)
- Implement remaining alphabet games
- Add vocabulary games for all categories
- Create word formation games

### Phase 2: Advanced Features (Weeks 9-12)
- Sentence and reading games
- Listening and pronunciation games
- Cultural context games

### Phase 3: Polish & Enhancement (Weeks 13-16)
- Multiplayer modes
- Parent/teacher dashboard
- Advanced analytics
- Mobile app version

## 🎨 Asset Requirements

### Audio Assets Needed
- Letter pronunciations (50+ letters)
- Word pronunciations (100+ words)
- Sound effects (correct, wrong, celebration, pop)
- Background music tracks

### Image Assets Needed
- Vocabulary images (animals, fruits, vegetables)
- UI elements (buttons, badges, icons)
- Background images
- Character sprites

## 📖 Documentation

- [Full Architecture Document](./KANNADA_GAMES_ARCHITECTURE.md)
- [Testing Guide](./TESTING.md)
- [Main README](./README.md)

## 🤝 Contributing

Contributions are welcome! Areas where help is needed:
- Additional game implementations
- Kannada content and translations
- Audio recordings (native speakers)
- Visual assets and animations
- Testing and bug reports

## 📝 License

See [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Phaser 3 game framework
- Kannada language community
- Open source contributors
