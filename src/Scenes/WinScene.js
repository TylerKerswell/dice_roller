import Phaser from "phaser";

export default class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: "WinScene" });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.cameras.main.setBackgroundColor("#0b0b12");
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.25);

    // Panel
    this.add
      .rectangle(width / 2, height / 2, width * 0.72, height * 0.62, 0xffffff, 0.06)
      .setStrokeStyle(3, 0xffffff, 0.12);

    // Title
    this.add
      .text(width / 2, height * 0.33, "YOU WIN!", {
        fontFamily: "Arial, sans-serif",
        fontSize: "72px",
        color: "#00ff88",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setShadow(2, 2, "#000000", 6, true, true);

    // Subtitle
    this.add
      .text(width / 2, height * 0.45, "You defeated the boss on Floor 3.", {
        fontFamily: "Arial, sans-serif",
        fontSize: "20px",
        color: "#cfcfe6",
      })
      .setOrigin(0.5);

    // Button
    this.makeButton(width / 2, height * 0.62, "Back to Menu", () => {
      // Clear run data so a new run starts fresh
      this.registry.remove("runState");
      // If you store player in registry, clear it too
      this.registry.remove("player");

      this.scene.start("MenuScene");
    });

    // Keyboard shortcut
    this.input.keyboard.on("keydown-ENTER", () => {
      this.registry.remove("runState");
      this.registry.remove("player");
      this.scene.start("MenuScene");
    });

    this.add
      .text(width / 2, height * 0.78, "Press ENTER to return to menu", {
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        color: "#94a3b8",
      })
      .setOrigin(0.5);
  }

  makeButton(x, y, label, onClick) {
    const text = this.add
      .text(x, y, label, {
        fontFamily: "Arial, sans-serif",
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10);

    const padX = 30;
    const padY = 16;
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