import Phaser from "phaser";
import Player from "../entities/player.js";
import { mysteryDicePool } from "../utils/dice.js";

export default class MysteryScene extends Phaser.Scene {
  constructor() {
    super({ key: "MysteryScene" });
  }

  init(data) {
    this.returnScene = data.returnScene ?? "BoardScene";
    this.runState = data.runState ?? { floor: 1, tier: 0 };
    this.player = data.player ?? new Player(100);

    // Ensure dice bag exists
    if (!this.player.diceBag) {
      this.player.diceBag = [];
    }
  }

  create() {
    const { width, height } = this.scale;

    // === BACKGROUND ===
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b0b12);

    this.add
      .rectangle(width / 2, height / 2, width * 0.85, height * 0.75, 0xffffff, 0.08)
      .setStrokeStyle(3, 0xffffff, 0.2);

    // === HEADER ===
    this.add.text(width / 2, height * 0.18, "MYSTERY", {
      fontSize: "44px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.25, "Choose one die to add to your bag", {
      fontSize: "18px",
      color: "#cfcfe6",
    }).setOrigin(0.5);

    // === PICK 3 RANDOM DICE ===
    const choices = Phaser.Utils.Array.Shuffle([...mysteryDicePool]).slice(0, 3);

    const startY = height * 0.38;
    const spacing = 110;

    choices.forEach((die, index) => {
      const y = startY + index * spacing;
      this.makeDieButton(width / 2, y, die);
    });

    // === BACK (SKIP) ===
    this.makeBackButton(width / 2, height * 0.85, "SKIP", () => {
      this.leaveMystery("Ignored the mystery...");
    });
  }

  makeDieButton(x, y, die) {
    const padX = 30;
    const padY = 18;

    // Title
    const title = this.add.text(x, y - 20, die.name, {
      fontSize: "24px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(10);

    // Description
    const desc = this.add.text(x, y + 12, die.description, {
      fontSize: "16px",
      color: "#cfcfe6",
      align: "center",
      wordWrap: { width: 420 },
    }).setOrigin(0.5).setDepth(10);

    const w = Math.max(title.width, desc.width) + padX * 2;
    const h = 90;

    const bg = this.add
      .rectangle(x, y, w, h, 0x7862ff, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.25)
      .setInteractive({ useHandCursor: true })
      .setDepth(9);

    bg.on("pointerover", () => bg.setFillStyle(0x8b7bff, 1));
    bg.on("pointerout", () => bg.setFillStyle(0x7862ff, 0.9));

    bg.on("pointerdown", () => {
      this.player.addDie(die);
      this.leaveMystery(`Gained ${die.name}`);
    });
  }

  leaveMystery(resultText) {
    this.scene.start(this.returnScene, {
      runState: this.runState,
      player: this.player,
      lastResult: resultText,
    });
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
      .rectangle(x, y, w, h, 0x555555, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.2)
      .setInteractive({ useHandCursor: true })
      .setDepth(9);

    bg.on("pointerover", () => bg.setFillStyle(0x666666, 0.95));
    bg.on("pointerout", () => bg.setFillStyle(0x555555, 0.9));
    bg.on("pointerdown", onClick);
  }
}
