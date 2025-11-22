/**
 * Button - Reusable button component with hover/click effects
 */
export class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y);

    // Configuration
    this.config = {
      text: config.text || 'Button',
      width: config.width || 200,
      height: config.height || 60,
      bgColor: config.bgColor || 0x4CAF50,
      hoverColor: config.hoverColor || 0x66BB6A,
      pressedColor: config.pressedColor || 0x388E3C,
      borderColor: config.borderColor || 0x2E7D32,
      borderWidth: config.borderWidth || 3,
      textColor: config.textColor || '#FFFFFF',
      fontSize: config.fontSize || '24px',
      fontFamily: config.fontFamily || 'Arial',
      icon: config.icon || null,
      onClick: config.onClick || (() => {}),
      disabled: config.disabled || false
    };

    // Create button elements
    this.createBackground();
    this.createIcon();
    this.createText();

    // Setup interactivity
    this.setupInteractivity();

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Create background rectangle
   */
  createBackground() {
    this.bg = this.scene.add.rectangle(
      0, 0,
      this.config.width,
      this.config.height,
      this.config.bgColor
    );

    this.bg.setStrokeStyle(this.config.borderWidth, this.config.borderColor);

    // Add rounded corners effect
    this.addShadow();

    this.add(this.bg);
  }

  /**
   * Add drop shadow effect
   */
  addShadow() {
    this.shadow = this.scene.add.rectangle(
      2, 2,
      this.config.width,
      this.config.height,
      0x000000,
      0.3
    );

    this.add(this.shadow);
    this.sendToBack(this.shadow);
  }

  /**
   * Create icon
   */
  createIcon() {
    if (this.config.icon) {
      const iconX = this.config.text ? -this.config.width / 4 : 0;

      this.icon = this.scene.add.text(iconX, 0, this.config.icon, {
        fontSize: this.config.fontSize,
        fontFamily: this.config.fontFamily
      }).setOrigin(0.5);

      this.add(this.icon);
    }
  }

  /**
   * Create text
   */
  createText() {
    const textX = this.config.icon ? this.config.width / 6 : 0;

    this.buttonText = this.scene.add.text(textX, 0, this.config.text, {
      fontSize: this.config.fontSize,
      fontFamily: this.config.fontFamily,
      color: this.config.textColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add(this.buttonText);
  }

  /**
   * Setup interactivity
   */
  setupInteractivity() {
    this.setSize(this.config.width, this.config.height);
    this.setInteractive({ useHandCursor: !this.config.disabled });

    if (!this.config.disabled) {
      this.on('pointerover', () => this.onHover());
      this.on('pointerout', () => this.onOut());
      this.on('pointerdown', () => this.onDown());
      this.on('pointerup', () => this.onUp());
    }
  }

  /**
   * Hover effect
   */
  onHover() {
    if (this.config.disabled) return;

    this.bg.setFillStyle(this.config.hoverColor);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Power2'
    });

    // Play hover sound
    if (this.scene.sound) {
      this.scene.sound.play('sfx_click', { volume: 0.2 });
    }
  }

  /**
   * Pointer out effect
   */
  onOut() {
    if (this.config.disabled) return;

    this.bg.setFillStyle(this.config.bgColor);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 100,
      ease: 'Power2'
    });
  }

  /**
   * Pointer down effect
   */
  onDown() {
    if (this.config.disabled) return;

    this.bg.setFillStyle(this.config.pressedColor);

    this.scene.tweens.add({
      targets: this,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 50,
      ease: 'Power2'
    });
  }

  /**
   * Pointer up effect and trigger callback
   */
  onUp() {
    if (this.config.disabled) return;

    this.bg.setFillStyle(this.config.hoverColor);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 50,
      ease: 'Power2'
    });

    // Play click sound
    if (this.scene.sound) {
      this.scene.sound.play('sfx_click', { volume: 0.3 });
    }

    // Trigger callback
    if (this.config.onClick) {
      this.config.onClick();
    }
  }

  /**
   * Set button text
   */
  setText(text) {
    this.config.text = text;
    this.buttonText.setText(text);
  }

  /**
   * Set disabled state
   */
  setDisabled(disabled) {
    this.config.disabled = disabled;

    if (disabled) {
      this.bg.setFillStyle(0x9E9E9E);
      this.disableInteractive();
      this.setAlpha(0.6);
    } else {
      this.bg.setFillStyle(this.config.bgColor);
      this.setInteractive({ useHandCursor: true });
      this.setAlpha(1.0);
    }
  }

  /**
   * Cleanup
   */
  destroy(fromScene) {
    this.removeAllListeners();
    super.destroy(fromScene);
  }
}
