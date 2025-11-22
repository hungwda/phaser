import { BaseGameScene } from '../../base/BaseGameScene.js';
import { AudioManager } from '../../../systems/audio/AudioManager.js';

/**
 * MarketShoppingScene - Learn shopping vocabulary in Kannada
 */
export class MarketShoppingScene extends BaseGameScene {
  constructor() {
    super('MarketShoppingScene', {
      lives: 5,
      timeLimit: 120
    });

    this.shoppingList = [];
    this.cart = [];
    this.items = [];
  }

  preload() {
    super.preload();
    this.load.json('fruits', 'src/data/kannada/fruits.json');
    this.load.json('vegetables', 'src/data/kannada/vegetables.json');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.fruitsData = this.cache.json.get('fruits');
    this.vegetablesData = this.cache.json.get('vegetables');
    this.audioManager = new AudioManager(this);

    this.loadShoppingItems();

    this.createGameBackground();
    this.createStandardUI();
    this.createMarket();
    this.createShoppingList();

    this.showInstructions('Buy the items on your shopping list! ಖರೀದಿಸಿ!');
  }

  loadShoppingItems() {
    // Combine fruits and vegetables
    const fruits = this.fruitsData?.basic || [];
    const vegetables = this.vegetablesData?.basic || [];

    this.items = [...fruits, ...vegetables];

    // Create shopping list
    this.shoppingList = Phaser.Utils.Array.Shuffle(this.items).slice(0, 5);
  }

  createGameBackground() {
    const { width, height } = this.cameras.main;

    // Market background
    const bg = this.add.rectangle(0, 0, width, height, 0xFFF8DC).setOrigin(0, 0);

    // Market stalls
    for (let i = 0; i < 3; i++) {
      const x = 150 + (i * 300);
      const y = height - 250;

      // Stall roof
      const roof = this.add.triangle(x, y - 60, 0, 60, -80, 0, 80, 0, 0xFF6347);
      roof.setStrokeStyle(2, 0xD2691E);

      // Stall counter
      const counter = this.add.rectangle(x, y, 160, 80, 0xDEB887);
      counter.setStrokeStyle(2, 0x8B4513);
    }

    // Sky and clouds
    const sky = this.add.rectangle(0, 0, width, 200, 0x87CEEB, 0.3).setOrigin(0, 0);

    for (let i = 0; i < 3; i++) {
      const cloudX = Phaser.Math.Between(100, width - 100);
      const cloud = this.add.ellipse(cloudX, Phaser.Math.Between(50, 150), 100, 50, 0xFFFFFF, 0.8);
    }
  }

  createMarket() {
    const { width, height } = this.cameras.main;

    // Display available items in market
    this.marketItems = this.add.container(width / 2, height - 200);

    const availableItems = Phaser.Utils.Array.Shuffle([...this.items]).slice(0, 8);

    const cols = 4;
    const spacing = 130;

    availableItems.forEach((item, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      const x = (col - 1.5) * spacing;
      const y = (row - 0.5) * 100;

      const itemCard = this.createItemCard(x, y, item);
      this.marketItems.add(itemCard);
    });
  }

  createItemCard(x, y, itemData) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 110, 90, 0xFFFFFF);
    bg.setStrokeStyle(2, 0xFF6347);

    // Item emoji/icon
    const emoji = this.getItemEmoji(itemData.english);
    const icon = this.add.text(0, -20, emoji, {
      fontSize: '36px'
    }).setOrigin(0.5);

    const nameText = this.add.text(0, 20, itemData.kannada, {
      fontSize: '16px',
      fontFamily: 'Nudi, Arial',
      color: '#000000'
    }).setOrigin(0.5);

    container.add([bg, icon, nameText]);
    container.setSize(110, 90);
    container.setInteractive({ useHandCursor: true });
    container.setData('item', itemData);

    container.on('pointerdown', () => {
      this.buyItem(itemData, container);
    });

    container.on('pointerover', () => {
      bg.setFillStyle(0xFFE4B5);
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 100
      });
    });

    container.on('pointerout', () => {
      bg.setFillStyle(0xFFFFFF);
      this.tweens.add({
        targets: container,
        scale: 1.0,
        duration: 100
      });
    });

    return container;
  }

  createShoppingList() {
    const { width, height } = this.cameras.main;

    const listContainer = this.add.container(100, 150);

    const listBg = this.add.rectangle(0, 0, 200, 300, 0xFFFACD);
    listBg.setStrokeStyle(3, 0xFF6347);

    const title = this.add.text(0, -130, 'Shopping List', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#D2691E',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    listContainer.add([listBg, title]);

    this.listItems = [];
    this.shoppingList.forEach((item, index) => {
      const y = -90 + (index * 45);

      const checkbox = this.add.text(-70, y, '☐', {
        fontSize: '24px',
        color: '#666666'
      });

      const itemText = this.add.text(-40, y, item.kannada, {
        fontSize: '18px',
        fontFamily: 'Nudi, Arial',
        color: '#000000'
      }).setOrigin(0, 0.5);

      listContainer.add([checkbox, itemText]);

      this.listItems.push({
        item: item,
        checkbox: checkbox,
        text: itemText,
        checked: false
      });
    });

    this.shoppingListContainer = listContainer;
  }

  getItemEmoji(englishName) {
    const emojiMap = {
      'mango': '🥭',
      'banana': '🍌',
      'apple': '🍎',
      'grapes': '🍇',
      'orange': '🍊',
      'tomato': '🍅',
      'potato': '🥔',
      'carrot': '🥕',
      'onion': '🧅',
      'brinjal': '🍆'
    };

    return emojiMap[englishName.toLowerCase()] || '🍎';
  }

  buyItem(itemData, card) {
    // Check if item is on shopping list
    const listItem = this.listItems.find(li =>
      li.item.kannada === itemData.kannada && !li.checked
    );

    if (listItem) {
      this.onCorrectPurchase(listItem, card);
    } else {
      this.onIncorrectPurchase(card);
    }
  }

  onCorrectPurchase(listItem, card) {
    this.playCorrectFeedback();
    this.addScore(20);

    // Check off the item
    listItem.checked = true;
    listItem.checkbox.setText('☑');
    listItem.checkbox.setColor('#4CAF50');
    listItem.text.setColor('#999999');

    // Animate card
    this.tweens.add({
      targets: card,
      scale: 0.8,
      alpha: 0.5,
      duration: 300
    });

    card.disableInteractive();

    // Check if all items purchased
    const allChecked = this.listItems.every(li => li.checked);
    if (allChecked) {
      this.onShoppingComplete();
    }
  }

  onIncorrectPurchase(card) {
    this.audioManager.playClick();

    // Shake the card
    this.tweens.add({
      targets: card,
      x: card.x + 10,
      duration: 50,
      yoyo: true,
      repeat: 3
    });

    const { width, height } = this.cameras.main;
    const feedback = this.add.text(width / 2, 100,
      'Not on your list! ಪಟ್ಟಿಯಲ್ಲಿ ಇಲ್ಲ!', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#FF6347',
      backgroundColor: '#FFFFFF',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    this.time.delayedCall(1000, () => feedback.destroy());
  }

  onShoppingComplete() {
    const { width, height } = this.cameras.main;

    const celebration = this.add.text(width / 2, height / 2,
      '🎉 Shopping Complete! 🎉\nಖರೀದಿ ಪೂರ್ಣ!', {
      fontSize: '40px',
      fontFamily: 'Arial',
      color: '#4CAF50',
      align: 'center',
      stroke: '#FFFFFF',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.addScore(50); // Bonus for completing list

    this.time.delayedCall(2000, () => {
      celebration.destroy();
      this.resetShopping();
    });
  }

  resetShopping() {
    if (this.marketItems) this.marketItems.destroy();
    if (this.shoppingListContainer) this.shoppingListContainer.destroy();

    this.loadShoppingItems();
    this.createMarket();
    this.createShoppingList();
  }

  onGameComplete() {
    super.onGameComplete();
    this.showResults();
  }
}
