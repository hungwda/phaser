/**
 * Card - Interactive card component for matching games, flashcards, etc.
 */
export class Card extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y);

    // Configuration
    this.config = {
      width: config.width || 120,
      height: config.height || 150,
      frontColor: config.frontColor || 0xFFFFFF,
      backColor: config.backColor || 0x2196F3,
      borderColor: config.borderColor || 0x1976D2,
      frontContent: config.frontContent || '',
      backContent: config.backContent || '?',
      contentType: config.contentType || 'text', // 'text' or 'image'
      isFlipped: config.isFlipped || false,
      flipDuration: config.flipDuration || 300,
      onClick: config.onClick || null,
      data: config.data || null
    };

    this.isFlipped = this.config.isFlipped;
    this.isFlipping = false;
    this.isMatched = false;

    // Create card
    this.createCard();

    // Setup interactivity
    this.setupInteractivity();

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Create card elements
   */
  createCard() {
    // Front side
    this.frontSide = this.scene.add.container(0, 0);

    const frontBg = this.scene.add.rectangle(
      0, 0,
      this.config.width,
      this.config.height,
      this.config.frontColor
    );
    frontBg.setStrokeStyle(3, this.config.borderColor);

    const frontContent = this.createContent(this.config.frontContent, this.config.frontColor);

    this.frontSide.add([frontBg, frontContent]);

    // Back side
    this.backSide = this.scene.add.container(0, 0);

    const backBg = this.scene.add.rectangle(
      0, 0,
      this.config.width,
      this.config.height,
      this.config.backColor
    );
    backBg.setStrokeStyle(3, this.config.borderColor);

    const backContent = this.scene.add.text(0, 0, this.config.backContent, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    this.backSide.add([backBg, backContent]);

    // Add sides to container
    this.add([this.backSide, this.frontSide]);

    // Set initial visibility
    this.updateVisibility();
  }

  /**
   * Create content (text or image)
   */
  createContent(content, bgColor) {
    if (this.config.contentType === 'text') {
      return this.scene.add.text(0, 0, content, {
        fontSize: '32px',
        fontFamily: 'Nudi, Arial',
        color: bgColor === 0xFFFFFF ? '#000000' : '#FFFFFF',
        align: 'center',
        wordWrap: { width: this.config.width - 20 }
      }).setOrigin(0.5);
    } else if (this.config.contentType === 'image') {
      // For images (to be implemented with actual image loading)
      return this.scene.add.rectangle(0, 0, 80, 80, 0xCCCCCC);
    }
  }

  /**
   * Setup interactivity
   */
  setupInteractivity() {
    this.setSize(this.config.width, this.config.height);
    this.setInteractive({ useHandCursor: true });

    this.on('pointerdown', () => this.onClick());
    this.on('pointerover', () => this.onHover());
    this.on('pointerout', () => this.onOut());
  }

  /**
   * Handle click
   */
  onClick() {
    if (this.isFlipping || this.isMatched) return;

    // Flip card
    this.flip();

    // Call custom onClick if provided
    if (this.config.onClick) {
      this.config.onClick(this);
    }
  }

  /**
   * Handle hover
   */
  onHover() {
    if (this.isFlipping || this.isMatched) return;

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Power2'
    });
  }

  /**
   * Handle pointer out
   */
  onOut() {
    if (this.isFlipping || this.isMatched) return;

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 100,
      ease: 'Power2'
    });
  }

  /**
   * Flip card
   */
  flip() {
    if (this.isFlipping) return;

    this.isFlipping = true;

    // Flip animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: this.config.flipDuration / 2,
      ease: 'Power2',
      onComplete: () => {
        // Toggle visibility
        this.isFlipped = !this.isFlipped;
        this.updateVisibility();

        // Flip back
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          duration: this.config.flipDuration / 2,
          ease: 'Power2',
          onComplete: () => {
            this.isFlipping = false;
          }
        });
      }
    });

    // Play flip sound
    if (this.scene.sound) {
      this.scene.sound.play('sfx_click', { volume: 0.3 });
    }
  }

  /**
   * Update visibility based on flip state
   */
  updateVisibility() {
    this.frontSide.setVisible(this.isFlipped);
    this.backSide.setVisible(!this.isFlipped);
  }

  /**
   * Mark as matched
   */
  setMatched(matched = true) {
    this.isMatched = matched;

    if (matched) {
      // Disable interaction
      this.disableInteractive();

      // Visual feedback
      this.scene.tweens.add({
        targets: this,
        alpha: 0.5,
        duration: 300,
        ease: 'Power2'
      });
    }
  }

  /**
   * Reset card
   */
  reset() {
    this.isFlipped = this.config.isFlipped;
    this.isMatched = false;
    this.isFlipping = false;

    this.updateVisibility();
    this.setAlpha(1.0);
    this.setScale(1.0);
    this.setInteractive({ useHandCursor: true });
  }

  /**
   * Get card data
   */
  getData() {
    return this.config.data;
  }

  /**
   * Set card data
   */
  setData(data) {
    this.config.data = data;
  }
}
