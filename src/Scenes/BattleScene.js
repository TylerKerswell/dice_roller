import Phaser from "phaser";
import Player from "../entities/player.js";
import Enemy from "../entities/enemy.js";

const ENTITY_IMAGES = {
  player: "assets/player.png",
  enemy: "assets/enemy.png",
  boss: "assets/enemy2.png",
  heart: "assets/heart.png"
};

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
  }

  preload() {
    // Load entity PNGs
    Object.entries(ENTITY_IMAGES).forEach(([key, path]) => this.load.image(key, path));
  }

  init(data) {
    this.returnScene = data?.returnScene ?? "BoardScene";
    this.runState = data?.runState ?? { floor: 1, tier: 0 };
    this.isBoss = !!data?.isBoss;
    this.player = data?.player ?? new Player(100);
    this.enemy = null;
  }

  create() {
    const { width, height } = this.scale;

    // === BACKGROUND ===
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b0b12);
    this.add.rectangle(width / 2, height / 2, width * 0.9, height * 0.82, 0xffffff, 0.06)
      .setStrokeStyle(3, 0xffffff, 0.12);

    // === HEADER ===
    this.add.text(width * 0.06, height * 0.1, this.isBoss ? "BOSS BATTLE" : "BATTLE", {
      fontSize: "42px",
      color: this.isBoss ? "#ff3b3b" : "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0, 0.5);

    this.add.text(width * 0.94, height * 0.1, `Floor ${this.runState.floor}, Tier ${this.runState.tier}`, {
      fontSize: "22px",
      color: "#cfcfe6"
    }).setOrigin(1, 0.5);

    // === DICE CONTAINER ===
    this.diceContainer = this.add.container(width * 0.5, height * 0.42).setDepth(10);

    // === PLAYER AND ENEMY IMAGES ===
    this.addEntities(width, height);

    // === HP TEXT AND BARS ===
    this.setupHpBars(width, height);

    

    // === MESSAGE ===
    this.messageText = this.add.text(width * 0.5, height * 0.5, "Roll to begin the fight.", {
      fontSize: "18px",
      color: "#a7a7c7",
    }).setOrigin(0.5);

    // === ATTACK BUTTON ===
    this.attackBtn = this.makeButton(width * 0.5, height * 0.7, "ATTACK", () => this.roll());

    this.updateHp();
  }

  // =====================
  // ENTITIES (PLAYER + ENEMY/BOSS)
  // =====================
  addEntities(width, height) {
    // PLAYER near bottom, leaning left
    this.playerSprite = this.add.image(width * 0.25, height * 0.75, "player")
      .setDisplaySize(180, 180)
      .setOrigin(0.5, 0.5)
      .setRotation(-0.15);

    // ENEMY/BOSS in middle, leaning right
    const enemyKey = this.isBoss ? "boss" : "enemy";
    this.enemySprite = this.add.image(width * 0.65, height * 0.4, enemyKey)
      .setDisplaySize(300, 300)
      .setOrigin(0.5, 0.5)
      .setRotation(0.15);

    // Initialize enemy object (game logic)
    this.enemy = new Enemy(this.isBoss ? 120 : 60);
  }

  // =====================
  // HP BARS
  // =====================
  setupHpBars(width, height) {
    // PLAYER HP
    this.playerBarWidth = width * 0.2;
    const playerBarHeight = 24;
    const playerBarX = (width - this.playerBarWidth) / 2;
    const playerBarY = height * 0.2;

    this.playerHpBarBg = this.add.rectangle(playerBarX, playerBarY, this.playerBarWidth, playerBarHeight, 0x222222)
      .setOrigin(0, 0.5);
    this.playerHpBar = this.add.rectangle(playerBarX, playerBarY, this.playerBarWidth, playerBarHeight, 0x00ff00)
      .setOrigin(0, 0.5);

      const heartOffset = 30; // distance to the left of the bar
    this.playerHeart = this.add.image(playerBarX - heartOffset, playerBarY, "heart")
      .setDisplaySize(playerBarHeight + 8, playerBarHeight + 8) // match height of bar
      .setOrigin(0.5);

    this.playerHpText = this.add.text(width * 0.15, height * 0.28, "", {
      fontSize: "26px",
      color: "#ffffff",
      fontStyle: "bold",
    });

    // ENEMY HP
    this.enemyBarWidth = width * 0.6;
    const barHeight = 24;
    const barX = (width - this.enemyBarWidth) / 2;
    const barY = height * 0.6;

    this.enemyHpBarBg = this.add.rectangle(barX, barY, this.enemyBarWidth, barHeight, 0x222222)
      .setOrigin(0, 0.5);
    this.enemyHpBar = this.add.rectangle(barX, barY, this.enemyBarWidth, barHeight, 0xff0000)
      .setOrigin(0, 0.5);
  }

  getDieColor(type) {
    switch (type) {
      case "poison": return 0x40FD14;
      case "joker": return 0xab5dee;
      case "heal": return 0xADD8E6;
      case "curse": return 0x360f5a;
      case "vamp": return 0xFF0000;
      case "glass": return 0xdbe1e3;
      case "chaos": return 0xFFAC1C;
      default: return 0xffffff;
    }
  }

  updateHp() {
    const playerRatio = Phaser.Math.Clamp(this.player.hp / this.player.maxHp, 0, 1);
    this.playerHpBar.width = this.playerBarWidth * playerRatio;

    const enemyRatio = Phaser.Math.Clamp(this.enemy.hp / this.enemy.maxHp, 0, 1);
    this.enemyHpBar.width = this.enemyBarWidth * enemyRatio;

    this.playerHpText.setText(`Player HP: ${this.player.hp}`);
  }

  roll() {
    this.player.roll();
    this.messageText.setText("Attack when ready.");
    this.attack();
  }

  // =====================
  // PLAYER ATTACK with ANIMATION
  // =====================
  attack() {
    if (!this.player.dice.length) {
      this.messageText.setText("You must roll first.");
      return;
    }

    this.diceContainer.removeAll(true);

    const { rolls } = this.player.attack(this.enemy);

    const boxSize = 46;
    const spacing = 10;
    const startX = -((rolls.length * (boxSize + spacing)) - spacing) / 2;

    const diceVisuals = [];
    rolls.forEach((die, i) => {
      const x = startX + i * (boxSize + spacing);
      const color = this.getDieColor(die.type);

      const box = this.add.rectangle(x, 0, boxSize, boxSize, color)
        .setStrokeStyle(2, 0x000000, 0.4)
        .setDepth(10);

      const text = this.add.text(x, 0, "?", { fontSize: "22px", color: "#000000", fontStyle: "bold" })
        .setOrigin(0.5)
        .setDepth(11);

      this.diceContainer.add([box, text]);
      diceVisuals.push({ text, die });
    });

    this.messageText.setText("Rolling dice...");
    let currentRoll = 0;
    const rollDuration = 800;
    const rollInterval = 100;
    const numRolls = Math.floor(rollDuration / rollInterval);

    this.time.addEvent({
      delay: rollInterval,
      repeat: numRolls - 1,
      callback: () => {
        diceVisuals.forEach(({ text }) => text.setText(Phaser.Math.Between(1, 6)));
        currentRoll++;

        if (currentRoll >= numRolls) {
          diceVisuals.forEach(({ text, die }) => text.setText(die.roll));

          const lines = [];
          let totalEnemyDamage = 0;
          let totalSelfDamage = 0;
          let totalHealing = 0;

          rolls.forEach((d) => {
            if (d.damage) {
              totalEnemyDamage += d.damage;
              lines.push(`Hit enemy for ${d.damage} damage.`);
            }
            if (d.selfDamage) {
              totalSelfDamage += d.selfDamage;
              lines.push(`Took ${d.selfDamage} self-damage!`);
            }
            if (d.selfHeal) {
              totalHealing += d.selfHeal;
              lines.push(`Healed ${d.selfHeal} HP.`);
            }
          });

          this.messageText.setText(lines.join(" "));
          this.updateHp();

          if (this.enemy.hp <= 0) {
            this.enemyDie();
          } else {
            // Animate player attack
            this.tweens.add({
              targets: this.playerSprite,
              x: this.playerSprite.x + 20,
              y: this.playerSprite.y - 10,
              rotation: -0.05,
              yoyo: true,
              duration: 150,
            });

            // Animate enemy hit
            this.tweens.add({
              targets: this.enemySprite,
              x: this.enemySprite.x - 15,
              yoyo: true,
              repeat: 1,
              duration: 150,
            });

            this.time.delayedCall(700, () => {
              const enemyDamage = this.enemy.attack(this.player);
              this.updateHp();

              if (this.player.hp <= 0) {
                this.messageText.setText("You were defeated...");
                this.time.delayedCall(900, () => this.die());
              } else {
                this.messageText.setText(`Enemy dealt ${enemyDamage.totalDamage} damage.`);
              }
            });
          }
        }
      },
    });
  }

  enemyDie() {
  const { width, height } = this.scale;

  const bg = this.add
    .rectangle(width / 2, height / 2, 500, 100, 0x000000, 0.6)
    .setOrigin(0.5)
    .setDepth(5)
    .setStrokeStyle(3, 0x00ff00);

  const text = this.add
    .text(width / 2, height / 2, this.isBoss ? "BOSS DEFEATED!" : "ENEMY DEFEATED!", {
      fontSize: "48px",
      color: "#00ff00",
      fontStyle: "bold",
      fontFamily: "Arial",
    })
    .setOrigin(0.5)
    .setDepth(6)
    .setShadow(2, 2, "#000000", 3, true, true);

  // Reward
  this.player.money += this.enemy.reward || 10;

  this.time.delayedCall(1200, () => {
    this.diceContainer.removeAll(true);

    // If boss, advance floor and reset tier
    if (this.isBoss) {

      // If you want to win after beating boss on floor 3:
      // That means you were on floor 3 when you killed the boss.
      // So after incrementing, floor becomes 4.
      if (this.runState.floor > 3) {
        // If you have a WinScene, go there. Otherwise go to menu with a message.
        this.registry.remove("runState");
        this.registry.set("player", this.player); // optional, keep player for win screen
        this.scene.start("MenuScene", { lastResult: "YOU WIN!", reset: true });
        return;
      }
    }

    // Go back to board (or whatever returnScene is)
    this.scene.start(this.returnScene, {
      runState: this.runState,
      battleOutcome: "win",
      isBoss: this.isBoss,
      player: this.player,
      lastResult: this.isBoss ? "Boss defeated! Next floor." : "Won fight!",
    });
  });
}

  die() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, 400, 100, 0x000000, 0.7)
      .setOrigin(0.5)
      .setDepth(5)
      .setStrokeStyle(4, 0xff0000);

    this.add.text(width / 2, height / 2, "YOU DIED!", {
      fontSize: "64px",
      color: "#ff0000",
      fontStyle: "bold",
      fontFamily: "Arial"
    }).setOrigin(0.5).setDepth(6)
      .setShadow(2, 2, "#000000", 4, true, true);

    this.time.delayedCall(1500, () => {
      this.registry.remove("runState");
      this.registry.remove("player");
      this.scene.stop("BattleScene");
      this.scene.stop("ShopScene");
      this.scene.stop("EventScene");
      this.scene.start("MenuScene", { lastResult: "You were defeated...", reset: true });
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

    const bg = this.add.rectangle(x, y, w, h, 0x7862ff, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.2)
      .setInteractive({ useHandCursor: true })
      .setDepth(9);

    bg.on("pointerover", () => bg.setFillStyle(0x8b7bff, 0.95));
    bg.on("pointerout", () => bg.setFillStyle(0x7862ff, 0.9));
    bg.on("pointerdown", onClick);

    return bg;
  }
}
