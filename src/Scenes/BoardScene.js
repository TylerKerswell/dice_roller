import Phaser from "phaser";
import Player from "../entities/player.js";

const MAX_FLOORS = 3;
const TIERS_PER_FLOOR = 42;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function tileTypeForTier(tier, bossTier) {
  if (tier <= 0) return "start";
  if (tier >= bossTier) return "boss";

  const mod = tier % 6;
  if (mod === 1 || mod === 2) return "fight";
  if (mod === 3) return "shop";
  if (mod === 4) return "mystery";
  return "event";
}

export default class BoardScene extends Phaser.Scene {
  constructor() {
    super("BoardScene");
  }

  init(data) {
    // Load run state from registry or start fresh
    const saved = this.registry.get("runState");

    if (data?.runState) {
      this.runState = data.runState;
    } else if (saved) {
      this.runState = saved;
    } else {
      this.runState = { floor: 1, tier: 0 };
    }

    this.lastResult = data?.lastResult || null;

    // Handle returning from BattleScene or ShopScene
    const outcome = data?.battleOutcome;
    const isBoss = !!data?.isBoss;

    if (outcome === "win" && isBoss) {
      if (this.runState.floor >= MAX_FLOORS) {
        this.registry.remove("runState");
        this._shouldGoToWin = true;
      } else {
        this.runState.floor += 1;
        this.runState.tier = 0;
        this.lastResult = "Boss defeated! Next floor!";
      }
    }

    // Create player if not provided
    this.player = data?.player ?? new Player(100);

    // Save updated run state
    this.registry.set("runState", this.runState);
    this.registry.set("player", this.player);
  }

  create() {
    const { width, height } = this.scale;
    
    this.infoText = this.add.text(width * 0.5, height * 0.92, "", {
    fontFamily: "Arial",
    fontSize: "16px",
    color: "#a7a7c7",
  }).setOrigin(0.5);

    if (this._shouldGoToWin) {
      // Show win message and restart
      this.infoText.setText("You win! Restarting...");
      this.time.delayedCall(2000, () => {
        this.registry.remove("runState");
        this.registry.remove("player");
        window.location.reload();
      });
      return;
    }

   

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b0b12);
    this.add
      .rectangle(width / 2, height / 2, width * 0.92, height * 0.86, 0xffffff, 0.06)
      .setStrokeStyle(3, 0xffffff, 0.12);

    // Header
    this.floorTierText = this.add
      .text(width * 0.06, height * 0.1, "", { fontFamily: "Arial", fontSize: "40px", color: "#fff", fontStyle: "bold" })
      .setOrigin(0, 0.5);

    // Money display
    this.moneyText = this.add
      .text(width * 0.5, height * 0.1, "", { fontFamily: "Arial", fontSize: "24px", color: "#ffd700", fontStyle: "bold" })
      .setOrigin(0.5, 0.5);

    this.bossInText = this.add
      .text(width * 0.94, height * 0.1, "", { fontFamily: "Arial", fontSize: "42px", color: "#ff3b3b", fontStyle: "bold" })
      .setOrigin(1, 0.5);

    // Board layout
    this.pathY = height * 0.42;
    this.tileStartX = width * 0.12;
    this.tileGap = width * 0.11;
    this.tileW = width * 0.095;
    this.tileH = height * 0.18;

    // Tiles
    this.tileSlots = [];
    for (let i = 0; i < 7; i++) {
      const x = this.tileStartX + i * this.tileGap;
      const curveOffset = Math.sin((i / 6) * Math.PI) * height * 0.035;
      const y = this.pathY + curveOffset;

      const tile = this.add.rectangle(x, y, this.tileW, this.tileH, 0xffffff, 0.05).setStrokeStyle(3, 0xffffff, 0.18);
      const icon = this.add.text(x, y, "", { fontFamily: "Arial", fontSize: "40px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5);
      const label = this.add.text(x, y + this.tileH * 0.32, "", { fontFamily: "Arial", fontSize: "14px", color: "#cfcfe6" }).setOrigin(0.5);

      this.tileSlots.push({ tile, icon, label, x, y });
    }

    // Player marker
    this.playerMarker = this.add.circle(0, 0, 14, 0xffffff, 1);

    // Roll UI
    this.rollValueText = this.add.text(width * 0.5, height * 0.75, "Roll: -", { fontFamily: "Arial", fontSize: "26px", color: "#fff" }).setOrigin(0.5);
    this.rollBtn = this.makeButton(width * 0.5, height * 0.84, "ROLL (1-6)", () => this.handleRoll());

    this.infoText = this.add.text(width * 0.5, height * 0.92, "", { fontFamily: "Arial", fontSize: "16px", color: "#a7a7c7" }).setOrigin(0.5);

    // Inventory button (lower left)
    this.makeButton(width * 0.10, height * 0.87, "Inventory", () => {
      this.scene.start("InventoryScene", {
        returnScene: "BoardScene",
        runState: this.runState,
        player: this.player,
      });
    });

    // Quit button in lower right (within board borders)
    this.makeButton(width * 0.90, height * 0.87, "Quit", () => {
      this.registry.remove("runState");
      this.registry.remove("player");
      window.location.reload();
    });

    // Keyboard
    this.input.keyboard.on("keydown-SPACE", () => this.handleRoll());

    this.renderBoard();

    if (this.lastResult) {
      this.infoText.setText(this.lastResult);
      this.time.delayedCall(1200, () => this.infoText.setText(""));
    }
  }

  bossTier() {
    return TIERS_PER_FLOOR;
  }

  renderBoard() {
    const { floor, tier } = this.runState;
    const bossTier = this.bossTier();

    this.floorTierText.setText(`Floor ${floor}, Tier ${tier}`);
    this.moneyText.setText(`Money: $${this.player.money || 0}`);
    this.bossInText.setText(`BOSS IN ${Math.max(0, bossTier - tier)}`);

    const windowStartTier = Math.max(0, tier - 1);
    const tiersShown = Array.from({ length: 7 }, (_, i) => windowStartTier + i);

    for (let i = 0; i < 7; i++) {
      const shownTier = tiersShown[i];
      const tType = tileTypeForTier(shownTier, bossTier);
      const slot = this.tileSlots[i];
      const { tile, icon, label } = slot;

      let iconChar = "", labelText = "", fill = 0xffffff, alpha = 0.06;

      if (tType === "start") { iconChar = "↑"; labelText = "START"; alpha = 0.08; }
      else if (tType === "fight") { iconChar = "⚔"; labelText = "FIGHT"; }
      else if (tType === "shop") { iconChar = "$"; labelText = "SHOP"; }
      else if (tType === "mystery") { iconChar = "?"; labelText = "MYSTERY"; }
      else if (tType === "event") { iconChar = "✦"; labelText = "EVENT"; }
      else if (tType === "boss") { iconChar = "☠"; labelText = "BOSS"; fill = 0xff3b3b; alpha = 0.08; }

      tile.setFillStyle(fill, alpha);
      tile.setStrokeStyle(3, 0xffffff, 0.18);
      icon.setText(iconChar);
      label.setText(labelText);
    }

    const idx = tiersShown.indexOf(this.runState.tier);
    const target = this.tileSlots[idx >= 0 ? idx : 1];
    this.playerMarker.setPosition(target.x, target.y - this.tileH * 0.42);
  }

  handleRoll() {
    if (this.isBusy) return;

    const roll = Phaser.Math.Between(1, 6);
    this.rollValueText.setText(`Roll: ${roll}`);

    const bossTier = this.bossTier();
    const startTier = this.runState.tier;
    const endTier = clamp(startTier + roll, 0, bossTier);

    this.isBusy = true;
    this.animateMove(startTier, endTier, () => {
      this.isBusy = false;
      this.resolveLanding();
    });
  }

  animateMove(startTier, endTier, done) {
    const steps = endTier - startTier;
    if (steps <= 0) { done(); return; }

    let current = startTier;
    const stepOnce = () => {
      current += 1;
      this.runState.tier = current;
      this.registry.set("runState", this.runState);
      this.renderBoard();

      if (current >= endTier) { done(); return; }
      this.time.delayedCall(180, stepOnce);
    };
    stepOnce();
  }

  resolveLanding() {
    const { tier } = this.runState;
    const tType = tileTypeForTier(tier, this.bossTier());

    if (tType === "fight") {
      this.infoText.setText("Fight!");
      this.time.delayedCall(350, () => {
        this.scene.start("BattleScene", {
          returnScene: "BoardScene",
          runState: this.runState,
          isBoss: false,
          player: this.player,
        });
      });
      return;
    }

    if (tType === "shop") {
      this.infoText.setText("Shop!");
      this.time.delayedCall(350, () => {
        this.scene.start("ShopScene", {
          returnScene: "BoardScene",
          runState: this.runState,
          player: this.player,
        });
      });
      return;
    }

    if (tType === "mystery") {
      this.infoText.setText("Mystery event!");
      this.time.delayedCall(350, () => {
        this.scene.start("MysteryScene", {
          returnScene: "BoardScene",
          runState: this.runState,
          player: this.player,
        });
      });
      return;
    }
    if (tType === "event") {
      this.infoText.setText("Event!");
      this.time.delayedCall(350, () => {
        this.scene.start("EventScene", {
          returnScene: "BoardScene",
          runState: this.runState,
          player: this.player,
        });
      });
      return;
    }
  

    if (tType === "boss") {
      this.infoText.setText("BOSS!");
      this.time.delayedCall(350, () => {
        this.scene.start("BattleScene", {
          returnScene: "BoardScene",
          runState: this.runState,
          isBoss: true,
          player: this.player,
        });
      });
      return;
    }

    this.infoText.setText("Move forward!");
    this.time.delayedCall(900, () => this.infoText.setText(""));
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
}
