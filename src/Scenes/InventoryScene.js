import Phaser from "phaser";

export default class InventoryScene extends Phaser.Scene {
  constructor() {
    super({ key: "InventoryScene" });
  }

  init(data) {
    this.returnScene = data?.returnScene ?? "BoardScene";
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
      .text(width / 2, height * 0.15, "INVENTORY", {
        fontSize: "44px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // === INVENTORY GRID ===
    const cellSize = 80;
    const cellSpacing = 10;
    const cols = 8;
    const rows = 6;
    
    const gridWidth = cols * cellSize + (cols - 1) * cellSpacing;
    const gridHeight = rows * cellSize + (rows - 1) * cellSpacing;
    const startX = width / 2 - gridWidth / 2;
    const startY = height * 0.3;

    // Create inventory cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (cellSize + cellSpacing) + cellSize / 2;
        const y = startY + row * (cellSize + cellSpacing) + cellSize / 2;

        // Cell background
        this.add
          .rectangle(x, y, cellSize, cellSize, 0x1c1c2b, 0.5)
          .setStrokeStyle(2, 0xffffff, 0.2);
      }
    }

    // === BACK BUTTON ===
    this.makeButton(
      width / 2,
      height * 0.85,
      "BACK",
      () => {
        this.scene.start(this.returnScene);
      }
    );
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

    return bg;
  }
}
