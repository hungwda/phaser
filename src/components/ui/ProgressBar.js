/**
 * ProgressBar - Visual progress indicator
 */
export class ProgressBar extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y);

    // Configuration
    this.config = {
      width: config.width || 300,
      height: config.height || 30,
      bgColor: config.bgColor || 0x333333,
      fillColor: config.fillColor || 0x4CAF50,
      borderColor: config.borderColor || 0x000000,
      borderWidth: config.borderWidth || 2,
      showPercentage: config.showPercentage !== false,
      animated: config.animated !== false
    };

    this.progress = 0; // 0 to 1

    // Create components
    this.createBar();

    // Add to scene
    scene.add.existing(this);
  }

  /**
   * Create progress bar elements
   */
  createBar() {
    // Background
    this.bgBar = this.scene.add.rectangle(
      0, 0,
      this.config.width,
      this.config.height,
      this.config.bgColor
    );
    this.bgBar.setStrokeStyle(this.config.borderWidth, this.config.borderColor);
    this.bgBar.setOrigin(0, 0.5);

    // Fill bar
    this.fillBar = this.scene.add.rectangle(
      0, 0,
      0, // Start at 0 width
      this.config.height - 4,
      this.config.fillColor
    );
    this.fillBar.setOrigin(0, 0.5);

    // Percentage text
    if (this.config.showPercentage) {
      this.percentText = this.scene.add.text(
        this.config.width / 2, 0,
        '0%',
        {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 3
        }
      ).setOrigin(0.5);

      this.add([this.bgBar, this.fillBar, this.percentText]);
    } else {
      this.add([this.bgBar, this.fillBar]);
    }
  }

  /**
   * Set progress value (0 to 1)
   */
  setProgress(value, animated = true) {
    this.progress = Phaser.Math.Clamp(value, 0, 1);

    const targetWidth = (this.config.width - 4) * this.progress;
    const percentage = Math.floor(this.progress * 100);

    if (animated && this.config.animated) {
      // Animate fill bar
      this.scene.tweens.add({
        targets: this.fillBar,
        width: targetWidth,
        duration: 300,
        ease: 'Power2'
      });

      // Animate percentage text
      if (this.config.showPercentage) {
        const currentPercent = parseInt(this.percentText.text);
        const delta = percentage - currentPercent;

        if (delta !== 0) {
          this.scene.tweens.addCounter({
            from: currentPercent,
            to: percentage,
            duration: 300,
            onUpdate: (tween) => {
              const value = Math.floor(tween.getValue());
              this.percentText.setText(`${value}%`);
            }
          });
        }
      }
    } else {
      // Set immediately
      this.fillBar.width = targetWidth;
      if (this.config.showPercentage) {
        this.percentText.setText(`${percentage}%`);
      }
    }

    // Change color based on progress
    this.updateColor();
  }

  /**
   * Update bar color based on progress
   */
  updateColor() {
    if (this.progress < 0.33) {
      this.fillBar.setFillStyle(0xF44336); // Red
    } else if (this.progress < 0.66) {
      this.fillBar.setFillStyle(0xFF9800); // Orange
    } else {
      this.fillBar.setFillStyle(0x4CAF50); // Green
    }
  }

  /**
   * Increment progress
   */
  increment(amount) {
    this.setProgress(this.progress + amount);
  }

  /**
   * Decrement progress
   */
  decrement(amount) {
    this.setProgress(this.progress - amount);
  }

  /**
   * Reset to 0
   */
  reset() {
    this.setProgress(0, false);
  }

  /**
   * Fill to 100%
   */
  fill() {
    this.setProgress(1);
  }

  /**
   * Get current progress
   */
  getProgress() {
    return this.progress;
  }
}
