import { Button } from '../../components/ui/Button.js';
import { AudioManager } from '../../systems/audio/AudioManager.js';
import { ProgressTracker } from '../../systems/learning/ProgressTracker.js';

/**
 * SettingsScene - Game settings and preferences
 */
export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');

    this.audioManager = null;
    this.progressTracker = new ProgressTracker();
  }

  create() {
    // Initialize audio manager
    this.audioManager = new AudioManager(this);

    const { width, height } = this.cameras.main;

    // Create background
    this.createBackground();

    // Create header
    this.createHeader();

    // Create settings panels
    this.createAudioSettings();
    this.createGameSettings();
    this.createProfileSettings();

    // Create action buttons
    this.createActionButtons();

    // Create back button
    this.createBackButton();
  }

  /**
   * Create background
   */
  createBackground() {
    const { width, height } = this.cameras.main;

    const bg = this.add.rectangle(0, 0, width, height, 0x37474F)
      .setOrigin(0, 0);
  }

  /**
   * Create header
   */
  createHeader() {
    const { width } = this.cameras.main;

    this.add.text(width / 2, 60, '⚙️ Settings', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  /**
   * Create audio settings panel
   */
  createAudioSettings() {
    const { width } = this.cameras.main;
    const settings = this.audioManager.getSettings();

    const panel = this.createPanel(width / 2 - 200, 140, 'Audio Settings', '🔊');

    // Master volume
    this.createSlider(panel, 50, 'Master Volume', settings.masterVolume, (value) => {
      this.audioManager.setMasterVolume(value);
    });

    // SFX volume
    this.createSlider(panel, 110, 'Sound Effects', settings.sfxVolume, (value) => {
      this.audioManager.setSFXVolume(value);
    });

    // Music volume
    this.createSlider(panel, 170, 'Music', settings.musicVolume, (value) => {
      this.audioManager.setMusicVolume(value);
    });

    // Voice volume
    this.createSlider(panel, 230, 'Pronunciations', settings.voiceVolume, (value) => {
      this.audioManager.setVoiceVolume(value);
    });

    // Mute toggle
    this.createToggle(panel, 290, 'Mute All', settings.isMuted, (value) => {
      this.audioManager.setMute(value);
    });
  }

  /**
   * Create game settings panel
   */
  createGameSettings() {
    const { width } = this.cameras.main;
    const difficulty = this.progressTracker.getDifficulty();

    const panel = this.createPanel(width / 2 + 200, 140, 'Game Settings', '🎮');

    // Difficulty selector
    this.createDifficultySelector(panel, 50, difficulty);

    // Show hints toggle
    this.createToggle(panel, 130, 'Show Hints', true, (value) => {
      // Save hint preference
      console.log('Show hints:', value);
    });

    // Auto-pronounce toggle
    this.createToggle(panel, 190, 'Auto Pronunciation', true, (value) => {
      // Save auto-pronounce preference
      console.log('Auto pronunciation:', value);
    });
  }

  /**
   * Create profile settings panel
   */
  createProfileSettings() {
    const { width, height } = this.cameras.main;
    const summary = this.progressTracker.getProfileSummary();

    const panel = this.createPanel(width / 2, height - 120, 'Profile', '👤', 600);

    // Player name display
    const nameLabel = this.add.text(-250, 50, 'Name:', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);

    const nameValue = this.add.text(-150, 50, summary.playerName, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Edit name button
    const editBtn = this.add.text(50, 50, '✏️ Edit', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#2196F3',
      padding: { x: 10, y: 5 }
    }).setOrigin(0, 0.5);

    editBtn.setInteractive({ useHandCursor: true });
    editBtn.on('pointerdown', () => {
      this.showNameEditDialog();
    });

    // Created date
    const createdLabel = this.add.text(150, 50, 'Joined:', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#AAAAAA'
    }).setOrigin(0, 0.5);

    const createdDate = new Date(summary.createdAt).toLocaleDateString();
    const createdValue = this.add.text(220, 50, createdDate, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#AAAAAA'
    }).setOrigin(0, 0.5);

    panel.add([nameLabel, nameValue, editBtn, createdLabel, createdValue]);
  }

  /**
   * Create panel
   */
  createPanel(x, y, title, icon, width = 350) {
    const container = this.add.container(x, y);

    // Background
    const bg = this.add.rectangle(0, 0, width, 350, 0x263238, 1);
    bg.setStrokeStyle(3, 0x546E7A);

    // Title bar
    const titleBg = this.add.rectangle(0, -150, width, 50, 0x455A64);

    const titleIcon = this.add.text(-width / 2 + 30, -150, icon, {
      fontSize: '24px'
    }).setOrigin(0, 0.5);

    const titleText = this.add.text(-width / 2 + 70, -150, title, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    container.add([bg, titleBg, titleIcon, titleText]);

    return container;
  }

  /**
   * Create slider control
   */
  createSlider(panel, y, label, initialValue, onChange) {
    // Label
    const labelText = this.add.text(-150, y, label, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);

    // Slider track
    const track = this.add.rectangle(50, y, 150, 4, 0x607D8B);

    // Slider fill
    const fill = this.add.rectangle(50 - 75, y, 150 * initialValue, 4, 0x4CAF50)
      .setOrigin(0, 0.5);

    // Slider handle
    const handle = this.add.circle(50 - 75 + 150 * initialValue, y, 10, 0xFFFFFF);
    handle.setStrokeStyle(2, 0x4CAF50);
    handle.setInteractive({ useHandCursor: true, draggable: true });

    // Value text
    const valueText = this.add.text(130, y, Math.round(initialValue * 100) + '%', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#4CAF50'
    }).setOrigin(0, 0.5);

    // Drag handler
    this.input.setDraggable(handle);

    handle.on('drag', (pointer, dragX) => {
      // Constrain to track
      const minX = 50 - 75;
      const maxX = 50 + 75;
      const newX = Phaser.Math.Clamp(dragX, minX, maxX);

      handle.x = newX;

      // Update fill
      const fillWidth = newX - minX;
      fill.width = fillWidth;

      // Calculate value
      const value = (newX - minX) / 150;

      // Update value text
      valueText.setText(Math.round(value * 100) + '%');

      // Call onChange
      onChange(value);
    });

    panel.add([labelText, track, fill, handle, valueText]);
  }

  /**
   * Create toggle control
   */
  createToggle(panel, y, label, initialValue, onChange) {
    // Label
    const labelText = this.add.text(-150, y, label, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);

    // Toggle background
    const toggleBg = this.add.rectangle(100, y, 60, 30, initialValue ? 0x4CAF50 : 0x757575);
    toggleBg.setStrokeStyle(2, 0xFFFFFF);

    // Toggle handle
    const handleX = initialValue ? 115 : 85;
    const toggleHandle = this.add.circle(handleX, y, 12, 0xFFFFFF);

    // Make interactive
    toggleBg.setInteractive({ useHandCursor: true });
    toggleHandle.setInteractive({ useHandCursor: true });

    let value = initialValue;

    const toggle = () => {
      value = !value;

      // Animate
      this.tweens.add({
        targets: toggleHandle,
        x: value ? 115 : 85,
        duration: 200,
        ease: 'Power2'
      });

      toggleBg.setFillStyle(value ? 0x4CAF50 : 0x757575);

      // Call onChange
      onChange(value);
    };

    toggleBg.on('pointerdown', toggle);
    toggleHandle.on('pointerdown', toggle);

    panel.add([labelText, toggleBg, toggleHandle]);
  }

  /**
   * Create difficulty selector
   */
  createDifficultySelector(panel, y, currentDifficulty) {
    const label = this.add.text(-150, y, 'Difficulty', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);

    const difficulties = ['beginner', 'intermediate', 'advanced'];
    const buttonWidth = 90;
    const startX = 20;

    difficulties.forEach((diff, index) => {
      const x = startX + index * (buttonWidth + 5);
      const isActive = diff === currentDifficulty;

      const btn = this.add.rectangle(x, y, buttonWidth, 35, isActive ? 0x4CAF50 : 0x455A64);
      btn.setStrokeStyle(2, isActive ? 0xFFD700 : 0x607D8B);

      const text = this.add.text(x, y, diff.charAt(0).toUpperCase() + diff.slice(1, 3), {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
        this.progressTracker.setDifficulty(diff);
        this.scene.restart();
      });

      panel.add([btn, text]);
    });

    panel.add(label);
  }

  /**
   * Create action buttons
   */
  createActionButtons() {
    const { width, height } = this.cameras.main;

    // Reset progress button
    const resetBtn = new Button(this, width / 2 - 120, height - 60, {
      text: 'Reset Progress',
      width: 200,
      height: 50,
      bgColor: 0xF44336,
      onClick: () => {
        this.showResetConfirmDialog();
      }
    });

    // Export data button
    const exportBtn = new Button(this, width / 2 + 120, height - 60, {
      text: 'Export Data',
      width: 200,
      height: 50,
      bgColor: 0x2196F3,
      onClick: () => {
        this.exportProfileData();
      }
    });
  }

  /**
   * Create back button
   */
  createBackButton() {
    const backBtn = new Button(this, 60, 40, {
      text: 'Back',
      icon: '←',
      width: 100,
      height: 40,
      bgColor: 0x607D8B,
      onClick: () => {
        this.scene.start('GameHubScene');
      }
    });
  }

  /**
   * Show name edit dialog
   */
  showNameEditDialog() {
    // Simple prompt (in production, use custom dialog)
    const newName = prompt('Enter your name:');
    if (newName && newName.trim()) {
      this.progressTracker.setPlayerName(newName.trim());
      this.scene.restart();
    }
  }

  /**
   * Show reset confirm dialog
   */
  showResetConfirmDialog() {
    const confirmed = confirm('Are you sure you want to reset all progress? This cannot be undone!');
    if (confirmed) {
      this.progressTracker.resetProfile();
      alert('Progress has been reset');
      this.scene.start('GameHubScene');
    }
  }

  /**
   * Export profile data
   */
  exportProfileData() {
    const data = this.progressTracker.exportProfile();

    // Create download link
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kannada-learning-progress.json';
    a.click();
    URL.revokeObjectURL(url);

    alert('Profile data exported successfully!');
  }
}
