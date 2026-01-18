import Phaser from "phaser";
import GameScene from "./Scenes/GameScene.js";
import MenuScene from "./Scenes/MenuScene.js";

const config = {
  type: Phaser.AUTO,
  width: 1080,
  height: 720,
  backgroundColor: "#ffffff",
  scene: [MenuScene, GameScene]
};

new Phaser.Game(config);
