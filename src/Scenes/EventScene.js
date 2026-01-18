import Phaser from "phaser";
import Player from "../entities/player.js";

export default class EventScene extends Phaser.Scene {
  constructor() {
    super({ key: "EventScene" });
  }

  init(data) {
    this.returnScene = data.returnScene ?? "BoardScene";
    this.runState = data.runState ?? { floor: 1, tier: 0 };

    // Use passed player or create a new one
    this.player = data.player ?? new Player(100);
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b0b12);

    this.add
      .rectangle(width / 2, height / 2, width * 0.8, height * 0.7, 0xffffff, 0.12)
      .setStrokeStyle(3, 0xffffff, 0.2);

    // Header
    this.add
      .text(width / 2, height * 0.3, "EVENT", {
        fontSize: "44px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Event message
    const moneyAmount = Phaser.Math.Between(10, 30);
    this.player.money = (this.player.money || 0) + moneyAmount;

    this.add
      .text(width / 2, height * 0.45, `You found some money!`, {
        fontSize: "24px",
        color: "#cfcfe6",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.52, `+$${moneyAmount}`, {
        fontSize: "32px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Current money display
    this.add
      .text(width / 2, height * 0.6, `Total Money: $${this.player.money}`, {
        fontSize: "20px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Close button
    this.makeButton(width / 2, height * 0.75, "Close", () => {
      this.scene.start(this.returnScene, {
        runState: this.runState,
        player: this.player,
        lastResult: `Found $${moneyAmount}!`,
      });
    });
  }

  makeButton(x, y, label, onClick) {
    const text = this.add.text(0, 0, label, {
      fontSize: "22px",
      color: "#ffffff",
      fontStyle: "bold",
    });

    const padX = 30;
    const padY = 16;
    const w = text.width + padX * 2;
    const h = text.height + padY * 2;

    const bg = this.add
      .rectangle(x, y, w, h, 0x7862ff, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.2)
      .setInteractive({ useHandCursor: true });

    text.setPosition(x - text.width / 2, y - text.height / 2);

    bg.on("pointerover", () => bg.setFillStyle(0x8b7bff, 0.95));
    bg.on("pointerout", () => bg.setFillStyle(0x7862ff, 0.9));
    bg.on("pointerdown", onClick);

    return bg;
  }
}
