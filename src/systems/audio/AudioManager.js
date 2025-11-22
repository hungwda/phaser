/**
 * AudioManager - Manages all audio playback for Kannada learning games
 * Handles pronunciations, sound effects, and background music
 */
export class AudioManager {
  constructor(scene) {
    this.scene = scene;

    // Audio storage
    this.pronunciations = new Map(); // letter/word -> audio key
    this.currentMusic = null;

    // Volume settings
    this.masterVolume = 1.0;
    this.sfxVolume = 1.0;
    this.musicVolume = 0.5;
    this.voiceVolume = 1.0;

    // State
    this.isMuted = false;
    this.musicEnabled = true;

    // Load volume settings from localStorage
    this.loadSettings();
  }

  /**
   * Register a pronunciation audio
   */
  registerPronunciation(id, audioKey) {
    this.pronunciations.set(id, audioKey);
  }

  /**
   * Register multiple pronunciations from data
   */
  registerPronunciationsFromData(dataArray) {
    dataArray.forEach(item => {
      if (item.id && item.audioPath) {
        // Extract audio key from path (remove extension)
        const audioKey = this.getAudioKeyFromPath(item.audioPath);
        this.pronunciations.set(item.id, audioKey);

        // Also register by the actual letter/word for easy lookup
        if (item.letter) {
          this.pronunciations.set(item.letter, audioKey);
        }
        if (item.kannada) {
          this.pronunciations.set(item.kannada, audioKey);
        }
      }
    });
  }

  /**
   * Extract audio key from file path
   */
  getAudioKeyFromPath(path) {
    // Convert "audio/pronunciations/letters/a.mp3" to "pronunciation_a"
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    const name = filename.replace(/\.[^/.]+$/, ''); // Remove extension
    return `pronunciation_${name}`;
  }

  /**
   * Play letter pronunciation
   */
  playLetter(letter) {
    return this.playPronunciation(letter);
  }

  /**
   * Play word pronunciation
   */
  playWord(word) {
    return this.playPronunciation(word);
  }

  /**
   * Play phrase pronunciation
   */
  playPhrase(phrase) {
    return this.playPronunciation(phrase);
  }

  /**
   * Play pronunciation by ID or text
   */
  playPronunciation(id) {
    if (this.isMuted) return null;

    const audioKey = this.pronunciations.get(id);

    if (audioKey && this.scene.sound.get(audioKey)) {
      const sound = this.scene.sound.play(audioKey, {
        volume: this.masterVolume * this.voiceVolume
      });
      return sound;
    } else {
      console.warn(`AudioManager: Pronunciation not found for "${id}"`);
      return null;
    }
  }

  /**
   * Play sound effect
   */
  playSFX(key, config = {}) {
    if (this.isMuted) return null;

    const volume = config.volume !== undefined
      ? config.volume
      : this.masterVolume * this.sfxVolume;

    if (this.scene.sound.get(key)) {
      return this.scene.sound.play(key, {
        ...config,
        volume
      });
    } else {
      console.warn(`AudioManager: SFX not found: "${key}"`);
      return null;
    }
  }

  /**
   * Play correct answer sound
   */
  playCorrect() {
    return this.playSFX('sfx_correct');
  }

  /**
   * Play incorrect answer sound
   */
  playIncorrect() {
    return this.playSFX('sfx_wrong');
  }

  /**
   * Play click sound
   */
  playClick() {
    return this.playSFX('sfx_click', { volume: 0.3 });
  }

  /**
   * Play celebration sound
   */
  playCelebration() {
    return this.playSFX('sfx_celebration');
  }

  /**
   * Play game over sound
   */
  playGameOver() {
    return this.playSFX('sfx_gameover');
  }

  /**
   * Play background music
   */
  playBackgroundMusic(key, loop = true) {
    if (this.isMuted || !this.musicEnabled) return null;

    // Stop current music if playing
    if (this.currentMusic) {
      this.currentMusic.stop();
    }

    if (this.scene.sound.get(key)) {
      this.currentMusic = this.scene.sound.play(key, {
        volume: this.masterVolume * this.musicVolume,
        loop
      });
      return this.currentMusic;
    } else {
      console.warn(`AudioManager: Music not found: "${key}"`);
      return null;
    }
  }

  /**
   * Stop background music
   */
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  /**
   * Pause background music
   */
  pauseMusic() {
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.currentMusic.pause();
    }
  }

  /**
   * Resume background music
   */
  resumeMusic() {
    if (this.currentMusic && this.currentMusic.isPaused) {
      this.currentMusic.resume();
    }
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume) {
    this.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.updateAllVolumes();
    this.saveSettings();
  }

  /**
   * Set SFX volume
   */
  setSFXVolume(volume) {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.saveSettings();
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume) {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);

    if (this.currentMusic) {
      this.currentMusic.setVolume(this.masterVolume * this.musicVolume);
    }

    this.saveSettings();
  }

  /**
   * Set voice (pronunciation) volume
   */
  setVoiceVolume(volume) {
    this.voiceVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.saveSettings();
  }

  /**
   * Update all playing sounds' volumes
   */
  updateAllVolumes() {
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.masterVolume * this.musicVolume);
    }
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.scene.sound.mute = true;
    } else {
      this.scene.sound.mute = false;
    }

    this.saveSettings();
    return this.isMuted;
  }

  /**
   * Set mute state
   */
  setMute(muted) {
    this.isMuted = muted;
    this.scene.sound.mute = muted;
    this.saveSettings();
  }

  /**
   * Toggle music
   */
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;

    if (!this.musicEnabled) {
      this.stopMusic();
    }

    this.saveSettings();
    return this.musicEnabled;
  }

  /**
   * Play sequence of pronunciations
   */
  playSequence(items, delay = 500) {
    return new Promise((resolve) => {
      let index = 0;

      const playNext = () => {
        if (index >= items.length) {
          resolve();
          return;
        }

        const sound = this.playPronunciation(items[index]);

        if (sound) {
          sound.once('complete', () => {
            this.scene.time.delayedCall(delay, playNext);
          });
        } else {
          // If sound doesn't exist, just delay and continue
          this.scene.time.delayedCall(delay, playNext);
        }

        index++;
      };

      playNext();
    });
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const settings = localStorage.getItem('audioSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.masterVolume = parsed.masterVolume ?? 1.0;
        this.sfxVolume = parsed.sfxVolume ?? 1.0;
        this.musicVolume = parsed.musicVolume ?? 0.5;
        this.voiceVolume = parsed.voiceVolume ?? 1.0;
        this.isMuted = parsed.isMuted ?? false;
        this.musicEnabled = parsed.musicEnabled ?? true;

        // Apply mute state
        if (this.scene.sound) {
          this.scene.sound.mute = this.isMuted;
        }
      }
    } catch (error) {
      console.error('AudioManager: Error loading settings', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      const settings = {
        masterVolume: this.masterVolume,
        sfxVolume: this.sfxVolume,
        musicVolume: this.musicVolume,
        voiceVolume: this.voiceVolume,
        isMuted: this.isMuted,
        musicEnabled: this.musicEnabled
      };
      localStorage.setItem('audioSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('AudioManager: Error saving settings', error);
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
      voiceVolume: this.voiceVolume,
      isMuted: this.isMuted,
      musicEnabled: this.musicEnabled
    };
  }

  /**
   * Stop all sounds
   */
  stopAll() {
    this.scene.sound.stopAll();
    this.currentMusic = null;
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopAll();
    this.pronunciations.clear();
  }
}
