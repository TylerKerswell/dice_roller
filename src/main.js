import Phaser from "phaser";
import MenuScene from "./Scenes/MenuScene.js";
import BattleScene from "./Scenes/BattleScene.js";
import BoardScene from "./Scenes/BoardScene.js";

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
  },
  backgroundColor: "#ffffff",
  scene: [MenuScene, BoardScene, BattleScene]
};

new Phaser.Game(config);
