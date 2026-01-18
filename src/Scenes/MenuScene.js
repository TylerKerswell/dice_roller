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
      .text(width / 2, height * 0.28, "Roll your fate. Survive the floors.", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#cfcfe6",
        align :"center",
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    // Buttons
    const startBtn = this.makeButton(width / 2, height * 0.50, "Start Run", () => {
      // Pass run data to the next scene (optional)
      this.scene.start("BoardScene", {
      runState: { floor: 1, tier: 0 }});
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
    this.input.keyboard.on("keydown-ESCAPE", () => quitBtn.emit("pointerdown"));

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
      color: "#100f0f",
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

  const cx = Math.round(width / 2);
  const cy = Math.round(height / 2);

  const panelW = Math.round(width * 0.78);
  const panelH = Math.round(height * 0.55);

  const overlay = this.add.rectangle(cx, cy, width, height, 0x000000, 0.55).setInteractive();
  const panel = this.add
    .rectangle(cx, cy, panelW, panelH, 0x111123, 0.95)
    .setStrokeStyle(2, 0xffffff, 0.15);

  // Top padding inside the panel
  const topY = cy - panelH / 2;
  const titleY = topY + 60;
  const bodyY = topY + 110;
  const closeY = cy + panelH / 2 - 70;

  const title = this.add
    .text(cx, titleY, "How To Play", {
      fontFamily: "Arial, sans-serif",
      fontSize: "34px",
      color: "#ffffff",
      fontStyle: "bold",
      align: "center",
      resolution: 2,
    })
    .setOrigin(0.5);

  const body = this.add
    .text(
      cx,
      bodyY,
      [
        "Each turn you roll 3 dice.",
        "",
        "For now, every die is an Attack die.",
        "Total damage is the sum of all rolls.",
        "",
        "Goal: reduce the enemy to 0 HP.",
        "Later: add shields, heals, poison, and upgrades.",
      ].join("\n"),
      {
        fontFamily: "Arial, sans-serif",
        fontSize: "20px",
        color: "#d7d7f0",
        align: "center",
        lineSpacing: 10,
        wordWrap: { width: panelW - 80, useAdvancedWrap: true },
        resolution: 2,
      }
    )
    .setOrigin(0.5, 0); // top-aligned so it grows downward

  const close = this.makeButton(cx, closeY, "Close", () => {
    overlay.destroy();
    panel.destroy();
    title.destroy();
    body.destroy();
    close.destroy();
  });

  // Optional: Esc closes modal
  const destroyModal = () => {
  if (!overlay.active) return;
  overlay.destroy();
  panel.destroy();
  title.destroy();
  body.destroy();
  close.destroy();
};

  // click outside closes too
  overlay.on("pointerdown", destroyModal);

  // one-time ESC closes modal
  this.input.keyboard.once("keydown-ESCAPE", destroyModal);

}

}

