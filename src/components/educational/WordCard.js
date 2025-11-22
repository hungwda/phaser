/**
 * WordCard - Interactive vocabulary card component
 */
export class WordCard extends Phaser.GameObjects.Container {
  constructor(scene, x, y, wordData, config = {}) {
    super(scene, x, y);

    // Configuration
    this.wordData = wordData; // Word object from JSON
    this.config = {
      width: config.width || 150,
      height: config.height || 200,
      showImage: config.showImage !== false,
      showKannada: config.showKannada !== false,
      showEnglish: config.showEnglish !== false,
      showTransliteration: config.showTransliteration || false,
      bgColor: config.bgColor || 0xFFFFFF,
      borderColor: config.borderColor || 0x2196F3,
      interactive: config.interactive !== false,
      onClick: config.onClick || null
    };

    // Create components
    this.createBackground();
    this.createContent();
    this.createAudioButton();

    // Setup interactivity
    if (this.config.interactive) {
      this.setupInteractivity();
    }

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Create background
   */
  createBackground() {
    this.bg = this.scene.add.rectangle(
      0, 0,
      this.config.width,
      this.config.height,
      this.config.bgColor
    );
    this.bg.setStrokeStyle(3, this.config.borderColor);

    this.add(this.bg);
  }

  /**
   * Create content
   */
  createContent() {
    let yOffset = -this.config.height / 2 + 20;

    // Image placeholder (or actual image if available)
    if (this.config.showImage) {
      this.imageBox = this.scene.add.rectangle(
        0, yOffset + 40,
        this.config.width - 20,
        80,
        0xE0E0E0
      );
      this.add(this.imageBox);
      yOffset += 90;
    }

    // Kannada word
    if (this.config.showKannada) {
      this.kannadaText = this.scene.add.text(0, yOffset, this.wordData.kannada, {
        fontSize: '32px',
        fontFamily: 'Nudi, Arial',
        color: '#000000'
      }).setOrigin(0.5);
      this.add(this.kannadaText);
      yOffset += 40;
    }

    // English translation
    if (this.config.showEnglish) {
      this.englishText = this.scene.add.text(0, yOffset, this.wordData.english, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#666666'
      }).setOrigin(0.5);
      this.add(this.englishText);
      yOffset += 25;
    }

    // Transliteration
    if (this.config.showTransliteration) {
      this.translitText = this.scene.add.text(0, yOffset, `(${this.wordData.transliteration})`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#999999',
        fontStyle: 'italic'
      }).setOrigin(0.5);
      this.add(this.translitText);
    }
  }

  /**
   * Create audio button
   */
  createAudioButton() {
    const buttonSize = 30;
    const buttonX = this.config.width / 2 - buttonSize;
    const buttonY = -this.config.height / 2 + buttonSize;

    this.audioButton = this.scene.add.circle(buttonX, buttonY, buttonSize / 2, 0x4CAF50);
    this.audioButton.setStrokeStyle(2, 0x388E3C);

    this.audioIcon = this.scene.add.text(buttonX, buttonY, '🔊', {
      fontSize: '20px'
    }).setOrigin(0.5);

    this.audioButton.setInteractive({ useHandCursor: true });
    this.audioButton.on('pointerdown', (e) => {
      e.stopPropagation();
      this.playAudio();
    });

    this.add([this.audioButton, this.audioIcon]);
  }

  /**
   * Setup interactivity
   */
  setupInteractivity() {
    this.setSize(this.config.width, this.config.height);
    this.setInteractive({ useHandCursor: true });

    this.on('pointerdown', () => {
      if (this.config.onClick) {
        this.config.onClick(this);
      }
    });

    this.on('pointerover', () => this.onHover());
    this.on('pointerout', () => this.onOut());
  }

  /**
   * Hover effect
   */
  onHover() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Power2'
    });

    this.bg.setStrokeStyle(3, 0xFFEB3B);
  }

  /**
   * Pointer out effect
   */
  onOut() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 100,
      ease: 'Power2'
    });

    this.bg.setStrokeStyle(3, this.config.borderColor);
  }

  /**
   * Play word audio
   */
  playAudio() {
    if (this.scene.audioManager) {
      this.scene.audioManager.playWord(this.wordData.kannada);
    }

    // Pulse animation
    if (this.kannadaText) {
      this.scene.tweens.add({
        targets: this.kannadaText,
        scale: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      });
    }
  }

  /**
   * Show correct feedback
   */
  showCorrect() {
    this.bg.setStrokeStyle(5, 0x00FF00);

    this.scene.tweens.add({
      targets: this,
      angle: 5,
      duration: 100,
      yoyo: true,
      repeat: 3,
      ease: 'Power2'
    });

    if (this.scene.sound) {
      this.scene.sound.play('sfx_correct');
    }
  }

  /**
   * Show incorrect feedback
   */
  showIncorrect() {
    this.bg.setStrokeStyle(5, 0xFF0000);

    this.scene.tweens.add({
      targets: this,
      x: this.x - 10,
      duration: 50,
      yoyo: true,
      repeat: 3,
      ease: 'Power2'
    });

    if (this.scene.sound) {
      this.scene.sound.play('sfx_wrong');
    }
  }

  /**
   * Get word data
   */
  getWordData() {
    return this.wordData;
  }

  /**
   * Get Kannada word
   */
  getKannadaWord() {
    return this.wordData.kannada;
  }

  /**
   * Update word
   */
  setWord(wordData) {
    this.wordData = wordData;

    if (this.kannadaText) {
      this.kannadaText.setText(wordData.kannada);
    }
    if (this.englishText) {
      this.englishText.setText(wordData.english);
    }
    if (this.translitText) {
      this.translitText.setText(`(${wordData.transliteration})`);
    }
  }
}
