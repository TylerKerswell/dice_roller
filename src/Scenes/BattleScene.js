import Phaser from "phaser";
import Player from "../entities/player.js";
import Enemy from "../entities/enemy.js";

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
  }

  init(data) {
    this.returnScene = data?.returnScene ?? "BoardScene";
    this.runState = data?.runState ?? { floor: 1, tier: 0 };
    this.isBoss = !!data?.isBoss;
  }

  create() {
    const { width, height } = this.scale;

    // === ENTITIES ===
    this.player = new Player(100);
    this.enemy = new Enemy(this.isBoss ? 120 : 60);

    // === BACKGROUND ===
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b0b12);

    this.add
      .rectangle(
        width / 2,
        height / 2,
        width * 0.9,
        height * 0.82,
        0xffffff,
        0.06
      )
      .setStrokeStyle(3, 0xffffff, 0.12);

    // === HEADER ===
    this.add
      .text(width * 0.06, height * 0.1, this.isBoss ? "BOSS BATTLE" : "BATTLE", {
        fontSize: "42px",
        color: this.isBoss ? "#ff3b3b" : "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);

    this.add
      .text(
        width * 0.94,
        height * 0.1,
        `Floor ${this.runState.floor}, Tier ${this.runState.tier}`,
        { fontSize: "22px", color: "#cfcfe6" }
      )
      .setOrigin(1, 0.5);

    // === DICE CONTAINER ===
    this.diceContainer = this.add
      .container(width * 0.5, height * 0.42)
      .setDepth(10);

    // === HP TEXT ===
    this.playerHpText = this.add.text(width * 0.15, height * 0.28, "", {
      fontSize: "26px",
      color: "#ffffff",
      fontStyle: "bold",
    });

    this.enemyHpText = this.add.text(width * 0.65, height * 0.28, "", {
      fontSize: "26px",
      color: "#ffffff",
      fontStyle: "bold",
    });

    // === MESSAGE ===
    this.messageText = this.add
      .text(width * 0.5, height * 0.5, "Roll to begin the fight.", {
        fontSize: "18px",
        color: "#a7a7c7",
      })
      .setOrigin(0.5);

    // === BUTTONS ===
    this.rollBtn = this.makeButton(
      width * 0.4,
      height * 0.7,
      "ROLL",
      () => this.roll()
    );

    this.attackBtn = this.makeButton(
      width * 0.6,
      height * 0.7,
      "ATTACK",
      () => this.attack()
    );

    this.updateHp();
  }

  updateHp() {
    this.playerHpText.setText(`Player HP: ${this.player.hp}`);
    this.enemyHpText.setText(
      `${this.isBoss ? "Boss" : "Enemy"} HP: ${this.enemy.hp}`
    );
  }

  roll() {
    this.player.roll();
    this.messageText.setText("Attack when ready.");
  }

  attack() {
    if (this.player.dice.length === 0) {
      this.messageText.setText("You must roll first.");
      return;
    }

    // Clear previous dice
    this.diceContainer.removeAll(true);

    // === PLAYER ATTACK ===
    const { rolls, totalDamage } = this.player.attack(this.enemy);
    this.updateHp();

    // === DRAW DICE ===
    const boxSize = 46;
    const spacing = 10;
    const startX =
      -((rolls.length * (boxSize + spacing)) - spacing) / 2;

    rolls.forEach((r, i) => {
      const x = startX + i * (boxSize + spacing);

      const box = this.add
        .rectangle(x, 0, boxSize, boxSize, 0xffffff)
        .setDepth(10);

      const text = this.add
        .text(x, 0, r.roll, {
          fontSize: "22px",
          color: "#000000",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(11);

      this.diceContainer.add([box, text]);
    });

    this.messageText.setText(`Total damage: ${totalDamage}`);

    if (this.enemy.hp <= 0) {
      this.time.delayedCall(800, () => this.win());
      return;
    }

    // === ENEMY COUNTER ===
    this.time.delayedCall(700, () => {
      const enemyDamage = this.enemy.attack(this.player);
      this.updateHp();

      if (this.player.hp <= 0) {
        this.messageText.setText("You were defeated...");
        this.time.delayedCall(900, () => this.lose());
      } else {
        this.messageText.setText(`Enemy dealt ${enemyDamage} damage.`);
      }
    });
  }

  win() {
    this.scene.start(this.returnScene, {
      runState: this.runState,
      battleOutcome: "win",
      isBoss: this.isBoss,
      lastResult: this.isBoss ? "Boss defeated!" : "Won fight!",
    });
  }

  lose() {
    this.scene.start(this.returnScene, {
      runState: this.runState,
      battleOutcome: "lose",
      isBoss: this.isBoss,
      lastResult: "Defeated...",
    });
  }

  makeButton(x, y, label, onClick) {
    const text = this.add.text(0, 0, label, {
      fontSize: "22px",
      color: "#ffffff",
      fontStyle: "bold",
    });

    const padX = 26;
    const padY = 14;
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
