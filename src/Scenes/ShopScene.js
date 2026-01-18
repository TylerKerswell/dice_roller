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

    // === BUTTONS ===
    this.makeButton(
      width / 2,
      height * 0.4,
      "Heal +20 HP",
      () => {
        this.player.heal(20);
        this.leaveShop("Healed 20 HP");
      }
    );

    this.makeButton(
      width / 2,
      height * 0.52,
      "Max HP +10",
      () => {
        this.player.increaseHealthCapacity(10);
        this.leaveShop("Max HP increased");
      }
    );

    this.makeButton(
      width / 2,
      height * 0.64,
      "+10 Attack",
      () => {
        this.player.attackBonus = (this.player.attackBonus || 0) + 10;
        this.leaveShop("+10 Attack");
      }
    );
  }

  leaveShop(resultText) {
    this.scene.start(this.returnScene, {
      runState: this.runState,
      player: this.player,
      lastResult: resultText,
    });
  }

  makeButton(x, y, label, onClick) {
  // Create container
  const container = this.add.container(x, y);

  // Background rectangle
  const text = this.add.text(0, 0, label, {
    fontFamily: "Arial",
    fontSize: "22px",
    color: "#ffffff",
    fontStyle: "bold",
  }).setOrigin(0.5);

  const padX = 26;
  const padY = 14;
  const w = text.width + padX * 2;
  const h = text.height + padY * 2;

  const bg = this.add.rectangle(0, 0, w, h, 0x7862ff, 0.9)
    .setStrokeStyle(2, 0xffffff, 0.2)
    .setInteractive({ useHandCursor: true });

  container.add([bg, text]);

  bg.on("pointerover", () => bg.setFillStyle(0x8b7bff, 0.95));
  bg.on("pointerout", () => bg.setFillStyle(0x7862ff, 0.9));
  bg.on("pointerdown", onClick);

  return container; // return the whole container
}

}
