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
    this.player = data?.player ?? new Player(100);
  }

  create() {
    const { width, height } = this.scale;

    // === ENTITIES ===
    this.enemy = new Enemy(this.isBoss ? 120 : 60);

    // === STATE ===
    this.phase = "need_roll"; // "need_roll" | "choose" | "enemy_turn"
    this.rerollsUsed = 0;

    // === BACKGROUND ===
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b0b12);

    this.add
      .rectangle(width / 2, height / 2, width * 0.9, height * 0.82, 0xffffff, 0.06)
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
    this.diceContainer = this.add.container(width * 0.5, height * 0.42).setDepth(10);

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

    // === ENEMY INTENT (NUANCE #3) ===
    this.enemyIntentText = this.add
      .text(width * 0.65, height * 0.33, "", {
        fontSize: "16px",
        color: "#a7a7c7",
      })
      .setOrigin(0, 0.5);

    // === MESSAGE ===
    this.messageText = this.add
      .text(width * 0.5, height * 0.5, "Roll to begin the fight.", {
        fontSize: "18px",
        color: "#a7a7c7",
      })
      .setOrigin(0.5);

    // === BUTTONS ===
    this.rollBtn = this.makeButton(width * 0.33, height * 0.7, "ROLL", () => this.roll());
    this.rerollBtn = this.makeButton(width * 0.50, height * 0.7, "REROLL", () => this.reroll());
    this.attackBtn = this.makeButton(width * 0.67, height * 0.7, "ATTACK", () => this.attack());

    this.updateHp();
    this.updateEnemyIntent();
    this.updateButtonStates();
  }

  updateHp() {
    this.playerHpText.setText(`Player HP: ${this.player.hp}`);
    this.enemyHpText.setText(`${this.isBoss ? "Boss" : "Enemy"} HP: ${this.enemy.hp}`);
  }

  // NUANCE #3: show intent so choices matter
  updateEnemyIntent() {
    // If your Enemy class already has a pattern, call it here.
    // Simple version: show predicted attack value based on tier.
    const base = this.isBoss ? 10 : 6;
    const bonus = (this.runState?.tier ?? 0) * 2;
    const predicted = base + bonus;

    this.enemyIntentText.setText(`Intent: Attack ~${predicted}`);
  }

  updateButtonStates() {
    const setEnabled = (btn, enabled) => {
      btn.disableInteractive();
      btn.setAlpha(enabled ? 1 : 0.4);
      if (enabled) btn.setInteractive({ useHandCursor: true });
    };

    setEnabled(this.rollBtn, this.phase === "need_roll");
    setEnabled(this.rerollBtn, this.phase === "choose"); // reroll only after first roll
    setEnabled(this.attackBtn, this.phase === "choose");
  }

  // NUANCE #1: roll shows dice immediately; click to select
  roll() {
    if (this.phase !== "need_roll") return;

    this.player.roll(); // you already have this
    this.rerollsUsed = 0;

    this.renderClickableDiceFromPlayer();

    this.phase = "choose";
    this.messageText.setText("Select dice to spend, then ATTACK.");
    this.updateEnemyIntent();
    this.updateButtonStates();
  }

  // NUANCE #2: reroll is push-your-luck with a cost
  reroll() {
    if (this.phase !== "choose") return;

    // Cost model (simple): each reroll costs HP
    const cost = 2 + this.rerollsUsed; // 2, then 3, then 4...
    this.player.hp -= cost;
    this.updateHp();

    if (this.player.hp <= 0) {
      this.messageText.setText("You rerolled yourself to death...");
      this.time.delayedCall(700, () => this.lose());
      return;
    }

    this.rerollsUsed += 1;
    this.player.roll();
    this.renderClickableDiceFromPlayer();
    this.messageText.setText(`Rerolled (-${cost} HP). Select dice and ATTACK.`);
  }

  renderClickableDiceFromPlayer() {
    // Clear previous dice visuals
    this.diceContainer.removeAll(true);

    const dice = this.player.dice ?? [];
    // Ensure each die has selected property
    dice.forEach((d) => (d.selected = d.selected ?? true)); // default selected

    const boxSize = 46;
    const spacing = 10;
    const startX = -((dice.length * (boxSize + spacing)) - spacing) / 2;

    dice.forEach((die, i) => {
      const x = startX + i * (boxSize + spacing);

      const box = this.add.rectangle(x, 0, boxSize, boxSize, 0xffffff).setDepth(10);
      const text = this.add
        .text(x, 0, String(die.roll ?? die.value ?? die), {
          fontSize: "22px",
          color: "#000000",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(11);

      // Selection tint via alpha
      const applySelectedStyle = () => {
        const isSelected = !!die.selected;
        box.setAlpha(isSelected ? 1 : 0.35);
        text.setAlpha(isSelected ? 1 : 0.35);
      };
      applySelectedStyle();

      // Click to toggle selection
      box.setInteractive({ useHandCursor: true });
      box.on("pointerdown", () => {
        die.selected = !die.selected;
        applySelectedStyle();
      });

      this.diceContainer.add([box, text]);
    });
  }

  // Uses selected dice only
  attack() {
    if (this.phase !== "choose") return;

    const dice = this.player.dice ?? [];
    if (dice.length === 0) {
      this.messageText.setText("You must roll first.");
      return;
    }

    const selected = dice.filter((d) => d.selected);
    if (selected.length === 0) {
      this.messageText.setText("Select at least 1 die to attack.");
      return;
    }

    // Prevent spam while animating/processing
    this.phase = "enemy_turn";
    this.updateButtonStates();

    // Compute damage from selected dice
    const rolls = selected.map((d) => ({ roll: d.roll ?? d.value ?? d }));
    let totalDamage = rolls.reduce((sum, r) => sum + Number(r.roll), 0);

    // Small synergy (free nuance): all dice same number => bonus
    const values = rolls.map((r) => r.roll);
    if (new Set(values).size === 1 && values.length >= 2) {
      totalDamage += 3;
      this.messageText.setText("Combo! Same faces bonus +3.");
    }

    // Apply damage
    this.enemy.hp -= totalDamage;
    this.updateHp();

    // Show dice animation (reuse your existing animation style)
    this.animateDiceReveal(rolls, totalDamage, () => this.afterPlayerAttack(totalDamage));
  }

  animateDiceReveal(rolls, totalDamage, onDone) {
    // Clear and draw animated dice like your original code
    this.diceContainer.removeAll(true);

    const boxSize = 46;
    const spacing = 10;
    const startX = -((rolls.length * (boxSize + spacing)) - spacing) / 2;

    const diceTexts = [];
    rolls.forEach((r, i) => {
      const x = startX + i * (boxSize + spacing);

      const box = this.add.rectangle(x, 0, boxSize, boxSize, 0xffffff).setDepth(10);
      const text = this.add
        .text(x, 0, "?", { fontSize: "22px", color: "#000000", fontStyle: "bold" })
        .setOrigin(0.5)
        .setDepth(11);

      this.diceContainer.add([box, text]);
      diceTexts.push(text);
    });

    this.messageText.setText("Rolling dice...");
    const rollDuration = 650;
    const rollInterval = 90;
    const numRolls = Math.floor(rollDuration / rollInterval);
    let current = 0;

    this.time.addEvent({
      delay: rollInterval,
      repeat: numRolls - 1,
      callback: () => {
        diceTexts.forEach((t) => t.setText(Phaser.Math.Between(1, 6)));
        current++;

        if (current >= numRolls) {
          rolls.forEach((r, i) => diceTexts[i].setText(r.roll));
          this.messageText.setText(`Total damage: ${totalDamage}`);
          this.time.delayedCall(250, onDone);
        }
      },
    });
  }

  afterPlayerAttack(totalDamage) {
    // Enemy dead?
    if (this.enemy.hp <= 0) {
      const moneyReward = this.isBoss ? 50 : 25;
      this.player.money = (this.player.money || 0) + moneyReward;

      this.time.delayedCall(250, () => {
        this.messageText.setText(`Enemy defeated! +$${moneyReward}`);
        this.time.delayedCall(600, () => this.win());
      });
      return;
    }

    // Enemy counter
    this.time.delayedCall(550, () => {
      const enemyDamage = this.enemy.attack(this.player);
      this.updateHp();

      if (this.player.hp <= 0) {
        this.messageText.setText("You were defeated...");
        this.time.delayedCall(700, () => this.lose());
        return;
      }

      this.messageText.setText(`Enemy dealt ${enemyDamage} damage. Roll again.`);
      // Reset for next turn
      this.player.dice = []; // so roll is required (optional)
      this.phase = "need_roll";
      this.updateEnemyIntent();
      this.updateButtonStates();
    });
  }

  win() {
    this.scene.start(this.returnScene, {
      runState: this.runState,
      battleOutcome: "win",
      isBoss: this.isBoss,
      player: this.player,
      lastResult: this.isBoss ? "Boss defeated!" : "Won fight!",
    });
  }

  lose() {
    this.scene.start(this.returnScene, {
      runState: this.runState,
      battleOutcome: "lose",
      isBoss: this.isBoss,
      player: this.player,
      lastResult: "Defeated...",
    });
  }

  makeButton(x, y, label, onClick) {
    const text = this.add
      .text(x, y, label, {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0.55) // slightly nicer vertical centering
      .setDepth(10);

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

    return bg;
  }
}
