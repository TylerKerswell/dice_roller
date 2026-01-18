import Phaser from "phaser";

export function createButton(scene, x, y, label, onClick, options = {}) {
  const {
    width = null,
    height = null,
    bgColor = 0x7862ff,
    hoverColor = 0x8b7bff,
    textColor = "#100f0f",
    fontSize = 20,
  } = options;

  const text = scene.add.text(0, 0, label, {
    fontFamily: "Arial, sans-serif",
    fontSize: `${fontSize}px`,
    color: textColor,
    fontStyle: "bold",
    align: "center",
    resolution: 2,
  });

  // 🔥 FIX: proper visual centering
  text.setOrigin(0.5, 0.55);

  const paddingX = 28;
  const paddingY = 14;

  const w = width ?? text.width + paddingX * 2;
  const h = height ?? text.height + paddingY * 2;

  const bg = scene.add
    .rectangle(0, 0, w, h, bgColor, 0.95)
    .setStrokeStyle(2, 0xffffff, 0.2)
    .setInteractive({ useHandCursor: true });

  const container = scene.add.container(x, y, [bg, text]);
  container.setSize(w, h);
  container.setInteractive(
    new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
    Phaser.Geom.Rectangle.Contains
  );

  container.on("pointerover", () => {
    bg.setFillStyle(hoverColor, 1);
    scene.input.setDefaultCursor("pointer");
  });

  container.on("pointerout", () => {
    bg.setFillStyle(bgColor, 0.95);
    scene.input.setDefaultCursor("default");
  });

  container.on("pointerdown", () => {
    scene.tweens.add({
      targets: container,
      scale: 0.97,
      duration: 60,
      yoyo: true,
    });
    onClick();
  });

  return container;
}
