import Phaser from "phaser";

const MAX_FLOORS = 3;
// Set this so "Tier 37, Boss in 5" can happen naturally (boss tier 42)
const TIERS_PER_FLOOR = 42;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

// Decide what happens on each tier.
// You can tweak this pattern anytime.
function tileTypeForTier(tier, bossTier) {
  if (tier <= 0) return "start";
  if (tier >= bossTier) return "boss";

  // pattern for normal tiers
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

    if (data && data.runState) {
      this.runState = data.runState;
    } else if (saved) {
      this.runState = saved;
    } else {
      this.runState = {
        floor: 1,
        tier: 0, // start square
      };
    }

    // Optional: when coming back from battles/shops/events you can pass results
    this.lastResult = data?.lastResult || null;

    // Handle returning from BattleScene
    const outcome = data?.battleOutcome;
    const isBoss = !!data?.isBoss;

    if (outcome === "win" && isBoss) {
      // Boss defeated: advance floor or win the game
      if (this.runState.floor >= 3) {
        // If you don't have WinScene yet, send them to MenuScene instead
        this.registry.remove("runState");
        this._shouldGoToWin = true;
      } else {
        this.runState.floor += 1;
        this.runState.tier = 0; // reset to start on next floor
        this.lastResult = "Boss defeated! Next floor!";
      }
    }

    // Save updated run state
    this.registry.set("runState", this.runState);
  }

  create() {
    if (this._shouldGoToWin) {
      // If you have WinScene:
      // this.scene.start("WinScene");

      // If you don't have WinScene yet:
      this.scene.start("MenuScene", { lastResult: "You win!" });
      return;
    }
    const { width, height } = this.scale;

    this.registry.set("runState", this.runState);

    // Background panel
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b0b12);

    const panel = this.add
      .rectangle(
        width / 2,
        height / 2,
        width * 0.92,
        height * 0.86,
        0xffffff,
        0.06,
      )
      .setStrokeStyle(3, 0xffffff, 0.12);

    // Header text
    this.floorTierText = this.add
      .text(width * 0.06, height * 0.1, "", {
        fontFamily: "Arial, sans-serif",
        fontSize: "40px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);

    this.bossInText = this.add
      .text(width * 0.94, height * 0.1, "", {
        fontFamily: "Arial, sans-serif",
        fontSize: "42px",
        color: "#ff3b3b",
        fontStyle: "bold",
      })
      .setOrigin(1, 0.5);

    // Board layout coords
    this.pathY = height * 0.42;
    this.tileStartX = width * 0.12;
    this.tileGap = width * 0.11;
    this.tileW = width * 0.095;
    this.tileH = height * 0.18;

    // Create tiles (7 like your sketch)
    this.tileSlots = [];
    for (let i = 0; i < 7; i++) {
      const x = this.tileStartX + i * this.tileGap;

      // slight curve like the sketch
      const curveOffset = Math.sin((i / 6) * Math.PI) * height * 0.035;
      const y = this.pathY + curveOffset;

      const tile = this.add
        .rectangle(x, y, this.tileW, this.tileH, 0xffffff, 0.05)
        .setStrokeStyle(3, 0xffffff, 0.18);

      const icon = this.add
        .text(x, y, "", {
          fontFamily: "Arial, sans-serif",
          fontSize: "40px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      const label = this.add
        .text(x, y + this.tileH * 0.32, "", {
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          color: "#cfcfe6",
        })
        .setOrigin(0.5);

      this.tileSlots.push({ tile, icon, label, x, y });
    }

    // Player marker (a small circle above the current tile)
    this.playerMarker = this.add.circle(0, 0, 14, 0xffffff, 1);

    // Roll UI
    this.rollValueText = this.add
      .text(width * 0.5, height * 0.75, "Roll: -", {
        fontFamily: "Arial, sans-serif",
        fontSize: "26px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.rollBtn = this.makeButton(
      width * 0.5,
      height * 0.84,
      "ROLL (1-6)",
      () => {
        this.handleRoll();
      },
    );

    this.infoText = this.add
      .text(width * 0.5, height * 0.92, "", {
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        color: "#a7a7c7",
      })
      .setOrigin(0.5);

    // Keyboard
    this.input.keyboard.on("keydown-SPACE", () => this.handleRoll());

    // Render initial board
    this.renderBoard();

    // If we came back with a result, show it briefly
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
    this.bossInText.setText(`BOSS IN ${Math.max(0, bossTier - tier)}`);

    // We show a window of 7 tiers: current tier maps to slot 1-ish.
    // Slot 0 is always "start icon" vibe, slot 6 will become boss when close.
    const windowStartTier = Math.max(0, tier - 1); // keeps player near left-center
    const tiersShown = [];
    for (let i = 0; i < 7; i++) tiersShown.push(windowStartTier + i);

    // Fill tiles
    for (let i = 0; i < 7; i++) {
      const shownTier = tiersShown[i];
      const tType = tileTypeForTier(shownTier, bossTier);

      const slot = this.tileSlots[i];
      const { tile, icon, label } = slot;

      // Basic icons matching your sketch
      let iconChar = "";
      let labelText = "";
      let fill = 0xffffff;
      let alpha = 0.06;

      if (tType === "start") {
        iconChar = "↑";
        labelText = "START";
        fill = 0xffffff;
        alpha = 0.08;
      } else if (tType === "fight") {
        iconChar = "⚔";
        labelText = "FIGHT";
        fill = 0xffffff;
        alpha = 0.06;
      } else if (tType === "shop") {
        iconChar = "$";
        labelText = "SHOP";
        fill = 0xffffff;
        alpha = 0.06;
      } else if (tType === "mystery") {
        iconChar = "?";
        labelText = "MYSTERY";
        fill = 0xffffff;
        alpha = 0.06;
      } else if (tType === "event") {
        iconChar = "✦";
        labelText = "EVENT";
        fill = 0xffffff;
        alpha = 0.06;
      } else if (tType === "boss") {
        iconChar = "☠";
        labelText = "BOSS";
        fill = 0xff3b3b;
        alpha = 0.08;
      }

      tile.setFillStyle(fill, alpha);
      tile.setStrokeStyle(3, 0xffffff, 0.18);

      icon.setText(iconChar);
      label.setText(labelText);

      // Show which tier number the tile represents (optional small text)
      // label.setText(`${labelText}\nT${shownTier}`);
    }

    // Place player marker on whichever slot matches current tier
    // Find closest tier shown equal to current tier
    const idx = tiersShown.indexOf(tier);
    const markerSlotIndex = idx >= 0 ? idx : 1;
    const target = this.tileSlots[markerSlotIndex];

    this.playerMarker.setPosition(target.x, target.y - this.tileH * 0.42);
  }

  handleRoll() {
    // Prevent rolling if currently transitioning
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
    // Step through tiers so it feels like movement
    const steps = endTier - startTier;
    if (steps <= 0) {
      done();
      return;
    }

    let current = startTier;

    const stepOnce = () => {
      current += 1;
      this.runState.tier = current;
      this.registry.set("runState", this.runState);
      this.renderBoard();

      if (current >= endTier) {
        done();
        return;
      }

      this.time.delayedCall(180, stepOnce);
    };

    stepOnce();
  }

  resolveLanding() {
    const { floor, tier } = this.runState;
    const bossTier = this.bossTier();
    const tType = tileTypeForTier(tier, bossTier);

    if (tType === "fight") {
      this.infoText.setText("Fight!");
      this.time.delayedCall(350, () => {
        // Hook into your real BattleScene
        // Pass returnScene so battle can come back here
        this.scene.start("BattleScene", {
          returnScene: "BoardScene",
          runState: this.runState,
          isBoss: false,
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
        });
      });
      return;
    }

    if (tType === "event" || tType === "mystery") {
      const msg = tType === "mystery" ? "Mystery event!" : "Event!";
      this.infoText.setText(msg);
      this.time.delayedCall(350, () => {
        this.scene.start("EventScene", {
          returnScene: "BoardScene",
          runState: this.runState,
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
        });
      });
      return;
    }

    // Start tile or anything else
    this.infoText.setText("Move forward!");
    this.time.delayedCall(900, () => this.infoText.setText(""));
  }

  // Call this from BattleScene when player wins a fight
  // You can do it by passing { battleOutcome: "win", runState } back into BoardScene.
  // For now, here is a helper if you want to call it manually.
  handleBattleWin(isBoss) {
    if (!isBoss) {
      this.scene.restart({ runState: this.runState, lastResult: "Won fight!" });
      return;
    }

    // Boss win: advance floor or win game
    if (this.runState.floor >= MAX_FLOORS) {
      this.registry.remove("runState");
      this.scene.start("WinScene");
      return;
    }

    this.runState.floor += 1;
    this.runState.tier = 0;
    this.registry.set("runState", this.runState);

    this.scene.restart({
      runState: this.runState,
      lastResult: "Boss defeated! Next floor!",
    });
  }

  makeButton(x, y, label, onClick) {
    const text = this.add.text(0, 0, label, {
      fontFamily: "Arial, sans-serif",
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

    // return bg so you can trigger it with keyboard if you want
    bg.labelText = text;
    return bg;
  }
}
