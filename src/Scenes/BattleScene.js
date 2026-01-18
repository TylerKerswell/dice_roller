import Phaser from "phaser";

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
  }

  init(data) {
    // Comes from BoardScene
    this.returnScene = data?.returnScene ?? "BoardScene";
    this.runState = data?.runState ?? { floor: 1, tier: 0 };
    this.isBoss = !!data?.isBoss;

    // Optional extras
    this.seed = data?.seed ?? null;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#0b1220");

    this.add
      .text(width / 2, height / 2 - 80, "BATTLE SCENE (placeholder)", {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height / 2 - 35,
        `Floor: ${this.runState.floor} | Tier: ${this.runState.tier} | ${this.isBoss ? "BOSS FIGHT" : "Normal Fight"}`,
        {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#cbd5e1",
        }
      )
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 20, "W: Win  |  L: Lose  |  B: Back to board", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#94a3b8",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height - 40, "M: Menu", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#94a3b8",
      })
      .setOrigin(0.5);

    // Win
    this.input.keyboard.on("keydown-W", () => {
      this.scene.start(this.returnScene, {
        runState: this.runState,
        battleOutcome: "win",
        isBoss: this.isBoss,
        lastResult: this.isBoss ? "Boss defeated!" : "Won fight!",
      });
    });

    // Lose
    this.input.keyboard.on("keydown-L", () => {
      this.scene.start(this.returnScene, {
        runState: this.runState,
        battleOutcome: "lose",
        isBoss: this.isBoss,
        lastResult: "Defeated... try again!",
      });
    });

    // Back without outcome
    this.input.keyboard.on("keydown-B", () => {
      this.scene.start(this.returnScene, {
        runState: this.runState,
        battleOutcome: "back",
        isBoss: this.isBoss,
        lastResult: "Returned to board.",
      });
    });

    // Menu
    this.input.keyboard.on("keydown-M", () => {
      this.scene.start("MenuScene", { version: "v0.1" });
    });
  }
}