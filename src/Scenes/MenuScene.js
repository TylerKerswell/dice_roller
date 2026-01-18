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
        fontSize: "56px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.32, "Roll your fate. Survive the floors.", {
        fontSize: "18px",
        color: "#cfcfe6",
      })
      .setOrigin(0.5);

    // Buttons
    const startBtn = this.makeButton(
  width / 2,
  height * 0.5,
  "Start Run",
  () => {
    this.scene.start("BoardScene", {
      floor: 1,
      difficulty: "normal",
      seed: Math.floor(Math.random() * 1000000),
    });
  }
);

// Directly style the label text
if (startBtn.labelText) {
  startBtn.labelText.setStyle({
    fontSize: "22px",
    fontStyle: "bold",
    color: "#ffffff",
  });
}


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

  bg.labelText = text;
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