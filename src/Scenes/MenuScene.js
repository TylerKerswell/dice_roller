// src/scenes/MenuScene.js
import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b0b12);
    this.add
      .rectangle(width / 2, height / 2, width * 0.9, height * 0.85, 0x1c1c2b, 0.25)
      .setStrokeStyle(2, 0xffffff, 0.12);

    this.add
      .text(width / 2, height * 0.22, "Dice Dungeon", {
        fontFamily: "Arial, sans-serif",
        fontSize: "56px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.32, "Roll your fate. Survive the floors.", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#cfcfe6",
      })
      .setOrigin(0.5);

    // Buttons
    const startBtn = this.makeButton(width / 2, height * 0.50, "Start Run", () => {
      // Pass run data to the next scene (optional)
      this.scene.start("GameScene", {
        floor: 1,
        difficulty: "normal",
        seed: Math.floor(Math.random() * 1000000),
      });
    });

    const howBtn = this.makeButton(width / 2, height * 0.62, "How To Play", () => {
      this.showHowToPlay();
    });

    const quitBtn = this.makeButton(width / 2, height * 0.74, "Quit", () => {
      // In browser games you usually can’t truly “quit”
      // This just reloads (safe default for hackathon demo)
      window.location.reload();
    });

    // Keyboard shortcuts
    this.input.keyboard.on("keydown-ENTER", () => startBtn.emit("pointerdown"));
    this.input.keyboard.on("keydown-H", () => howBtn.emit("pointerdown"));
    this.input.keyboard.on("keydown-ESC", () => quitBtn.emit("pointerdown"));

    // Footer tip
    this.add
      .text(width / 2, height * 0.90, "ENTER: Start   H: How to play   ESC: Quit", {
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        color: "#a7a7c7",
      })
      .setOrigin(0.5);
  }

  makeButton(x, y, label, onClick) {
    const paddingX = 26;
    const paddingY = 14;

    const text = this.add.text(0, 0, label, {
      fontFamily: "Arial, sans-serif",
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold",
    });

    const w = text.width + paddingX * 2;
    const h = text.height + paddingY * 2;

    const bg = this.add
      .rectangle(x, y, w, h, 0x7862ff, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.2)
      .setInteractive({ useHandCursor: true });

    text.setPosition(x - text.width / 2, y - text.height / 2);

    bg.on("pointerover", () => {
      bg.setFillStyle(0x8b7bff, 0.95);
    });

    bg.on("pointerout", () => {
      bg.setFillStyle(0x7862ff, 0.9);
    });

    bg.on("pointerdown", onClick);

    return bg;
  }

  showHowToPlay() {
    const { width, height } = this.scale;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);
    const panel = this.add
      .rectangle(width / 2, height / 2, width * 0.78, height * 0.55, 0x111123, 0.95)
      .setStrokeStyle(2, 0xffffff, 0.15);

    const title = this.add
      .text(width / 2, height / 2 - 140, "How To Play", {
        fontFamily: "Arial, sans-serif",
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const body = this.add
      .text(
        width / 2,
        height / 2 - 60,
        [
          "Each turn you roll 3 dice.",
          "For now, every die is an Attack die.",
          "Total damage is the sum of all rolls.",
          "",
          "Goal: reduce the enemy to 0 HP.",
          "Later: add shields, heals, poison, and upgrades.",
        ].join("\n"),
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "18px",
          color: "#d7d7f0",
          align: "center",
          lineSpacing: 8,
        }
      )
      .setOrigin(0.5);

    const close = this.makeButton(width / 2, height / 2 + 140, "Close", () => {
      overlay.destroy();
      panel.destroy();
      title.destroy();
      body.destroy();
      close.destroy();
    });
  }
}
