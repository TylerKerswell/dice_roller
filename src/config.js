import BootScene from "./Scenes/BootScene";
import MenuScene from "./Scenes/MenuScene";
import GameScene from "./Scenes/GameScene";

export const gameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#1d1d1d",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: [BootScene, MenuScene, GameScene]
};
