import Phaser from "phaser";
import MenuScene from "./Scenes/MenuScene.js";
import BattleScene from "./Scenes/BattleScene.js";
import BoardScene from "./Scenes/BoardScene.js";

const config = {
  type: Phaser.AUTO,
  width: 1080,
  height: 720,
  backgroundColor: "#ffffff",
  scene: [MenuScene, BoardScene, BattleScene]
};

new Phaser.Game(config);
