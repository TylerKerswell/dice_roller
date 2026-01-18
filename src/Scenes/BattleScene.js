export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
  }

  init(data) {
    this.seed = data?.seed ?? null;
    this.floor = data?.floor ?? 1;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#0b1220");

    this.add.text(width / 2, height / 2 - 30, "BATTLE SCENE (placeholder)", {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10, `Seed: ${this.seed ?? "none"} | Floor: ${this.floor}`, {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#cbd5e1",
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 40, "Press M to return to menu", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#94a3b8",
    }).setOrigin(0.5);

    this.input.keyboard.on("keydown-M", () => {
      this.scene.start("MenuScene", { version: "v0.1" });
    });
  }
}
