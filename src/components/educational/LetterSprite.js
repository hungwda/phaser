/**
 * LetterSprite - Interactive Kannada letter component
 */
export class LetterSprite extends Phaser.GameObjects.Container {
  constructor(scene, x, y, letterData, config = {}) {
    super(scene, x, y);

    // Configuration
    this.letterData = letterData; // Letter object from JSON
    this.config = {
      size: config.size || 100,
      bgColor: config.bgColor || 0xFFFFFF,
      borderColor: config.borderColor || 0x2196F3,
      textColor: config.textColor || '#000000',
      fontSize: config.fontSize || '48px',
      showAudioButton: config.showAudioButton !== false,
      interactive: config.interactive !== false,
      onClick: config.onClick || null
    };

    // Create components
    this.createBackground();
    this.createLetter();
    if (this.config.showAudioButton) {
      this.createAudioButton();
    }

    // Setup interactivity
    if (this.config.interactive) {
      this.setupInteractivity();
    }

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Create background circle
   */
  createBackground() {
    this.bg = this.scene.add.circle(0, 0, this.config.size / 2, this.config.bgColor);
    this.bg.setStrokeStyle(3, this.config.borderColor);
    this.add(this.bg);
  }

  /**
   * Create Kannada letter text
   */
  createLetter() {
    this.letterText = this.scene.add.text(0, 0, this.letterData.letter, {
      fontSize: this.config.fontSize,
      fontFamily: 'Nudi, Arial',
      color: this.config.textColor
    }).setOrigin(0.5);

    this.add(this.letterText);
  }

  /**
   * Create audio play button
   */
  createAudioButton() {
    const buttonSize = this.config.size / 4;
    const buttonX = this.config.size / 3;
    const buttonY = -this.config.size / 3;

    this.audioButton = this.scene.add.circle(buttonX, buttonY, buttonSize / 2, 0x4CAF50);
    this.audioButton.setStrokeStyle(2, 0x388E3C);

    this.audioIcon = this.scene.add.text(buttonX, buttonY, '🔊', {
      fontSize: `${buttonSize}px`
    }).setOrigin(0.5);

    this.audioButton.setInteractive({ useHandCursor: true });
    this.audioButton.on('pointerdown', () => this.playAudio());

    this.add([this.audioButton, this.audioIcon]);
  }

  /**
   * Setup interactivity
   */
  setupInteractivity() {
    this.setSize(this.config.size, this.config.size);
    this.setInteractive({ useHandCursor: true });

    this.on('pointerdown', () => {
      if (this.config.onClick) {
        this.config.onClick(this);
      } else {
        this.playAudio();
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
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 100,
      ease: 'Power2'
    });

    this.highlight();
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

    this.unhighlight();
  }

  /**
   * Highlight letter
   */
  highlight(color = 0xFFEB3B) {
    this.scene.tweens.add({
      targets: this.bg,
      fillColor: color,
      duration: 300,
      ease: 'Power2'
    });
  }

  /**
   * Remove highlight
   */
  unhighlight() {
    this.scene.tweens.add({
      targets: this.bg,
      fillColor: this.config.bgColor,
      duration: 300,
      ease: 'Power2'
    });
  }

  /**
   * Play letter audio
   */
  playAudio() {
    if (this.scene.audioManager) {
      this.scene.audioManager.playLetter(this.letterData.letter);
    }

    // Pulse animation
    this.scene.tweens.add({
      targets: this.letterText,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
  }

  /**
   * Show correct feedback
   */
  showCorrect() {
    this.highlight(0x00FF00);

    // Play celebration animation
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 500,
      ease: 'Back.easeOut'
    });

    if (this.scene.sound) {
      this.scene.sound.play('sfx_correct');
    }
  }

  /**
   * Show incorrect feedback
   */
  showIncorrect() {
    // Shake animation
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
   * Get letter data
   */
  getLetterData() {
    return this.letterData;
  }

  /**
   * Get letter text
   */
  getLetter() {
    return this.letterData.letter;
  }

  /**
   * Update letter
   */
  setLetter(letterData) {
    this.letterData = letterData;
    this.letterText.setText(letterData.letter);
  }
}
