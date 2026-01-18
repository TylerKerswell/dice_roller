import Phaser from "phaser";
import Player from "../entities/player.js";

export default class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: "ShopScene" });
  }

  init(data) {
    this.returnScene = data.returnScene ?? "BoardScene";
    this.runState = data.runState ?? { floor: 1, tier: 0 };

    // === PLAYER ===
    // Use passed player or create a new one (like BattleScene)
    this.player = data.player ?? new Player(100);
  }

  create() {
    const { width, height } = this.scale;

    // === BACKGROUND ===
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b0b12);

    this.add
      .rectangle(width / 2, height / 2, width * 0.8, height * 0.7, 0xffffff, 0.12)
      .setStrokeStyle(3, 0xffffff, 0.2);

    // === HEADER ===
    this.add
      .text(width / 2, height * 0.2, "SHOP", {
        fontSize: "44px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.27, "Choose one upgrade", {
        fontSize: "18px",
        color: "#cfcfe6",
      })
      .setOrigin(0.5);

    // === MONEY DISPLAY ===
    const moneyText = this.add
      .text(width / 2, height * 0.34, `Money: $${this.player.money || 0}`, {
        fontSize: "20px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // === BUTTONS ===
    this.makeButton(
      width / 2,
      height * 0.43,
      "Heal +20 HP ($15)",
      15,
      () => {
        if (this.purchase(15)) {
          this.player.heal(20);
          this.leaveShop("Healed 20 HP");
        }
      }
    );

    this.makeButton(
      width / 2,
      height * 0.55,
      "Max HP +10 ($20)",
      20,
      () => {
        if (this.purchase(20)) {
          this.player.increaseHealthCapacity(10);
          this.leaveShop("Max HP increased");
        }
      }
    );

    this.makeButton(
      width / 2,
      height * 0.67,
      "+10 Attack ($25)",
      25,
      () => {
        if (this.purchase(25)) {
          this.player.attackBonus = (this.player.attackBonus || 0) + 10;
          this.leaveShop("+10 Attack");
        }
      }
    );

    // Store reference to money text for updates
    this.moneyText = moneyText;

    // === BACK BUTTON ===
    this.makeBackButton(
      width / 2,
      height * 0.85,
      "BACK",
      () => {
        this.leaveShop("");
      }
    );
  }

  purchase(cost) {
    const playerMoney = this.player.money || 0;
    if (playerMoney >= cost) {
      // Deduct money
      this.player.money = playerMoney - cost;
      this.moneyText.setText(`Money: $${this.player.money}`);
      
      // Show purchase confirmation
      const msg = this.add
        .text(this.scale.width / 2, this.scale.height * 0.8, `Purchased! -$${cost}`, {
          fontSize: "18px",
          color: "#4ade80",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      this.time.delayedCall(1000, () => {
        msg.destroy();
      });
      return true;
    } else {
      // Show insufficient funds message
      const msg = this.add
        .text(this.scale.width / 2, this.scale.height * 0.8, `Not enough money! Need $${cost}, have $${playerMoney}`, {
          fontSize: "18px",
          color: "#ff3b3b",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      this.time.delayedCall(2000, () => {
        msg.destroy();
      });
      return false;
    }
  }

  leaveShop(resultText) {
    this.scene.start(this.returnScene, {
      runState: this.runState,
      player: this.player,
      lastResult: resultText,
    });
  }

  makeButton(x, y, label, cost, onClick) {
    const playerMoney = this.player.money || 0;
    const canAfford = playerMoney >= cost;
    const buttonColor = canAfford ? 0x7862ff : 0x555555;
    const textColor = canAfford ? "#ffffff" : "#888888";

    const padX = 26;
    const padY = 14;

    const text = this.add.text(x, y, label, {
      fontSize: "22px",
      color: textColor,
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(10);

    const w = text.width + padX * 2;
    const h = text.height + padY * 2;

    const bg = this.add
      .rectangle(x, y, w, h, buttonColor, 1)
      .setStrokeStyle(2, 0xffffff, canAfford ? 0.3 : 0.1)
      .setInteractive({ useHandCursor: canAfford })
      .setDepth(9);

    if (canAfford) {
      bg.on("pointerover", () => bg.setFillStyle(0x8b7bff, 1));
      bg.on("pointerout", () => bg.setFillStyle(0x7862ff, 1));
      bg.on("pointerdown", onClick);
    }
  }

  makeBackButton(x, y, label, onClick) {
    const text = this.add.text(x, y, label, {
      fontSize: "22px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(10);

    const padX = 26;
    const padY = 14;
    const w = text.width + padX * 2;
    const h = text.height + padY * 2;

    const bg = this.add
      .rectangle(x, y, w, h, 0x7862ff, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.2)
      .setInteractive({ useHandCursor: true })
      .setDepth(9);

    bg.on("pointerover", () => bg.setFillStyle(0x8b7bff, 0.95));
    bg.on("pointerout", () => bg.setFillStyle(0x7862ff, 0.9));
    bg.on("pointerdown", onClick);

    return bg;
  }
}
