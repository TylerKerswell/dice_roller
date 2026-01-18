import Phaser from "phaser";
import BattleScene from "./Scenes/BattleScene.js";
import BoardScene from "./Scenes/BoardScene.js";
import ShopScene from "./Scenes/ShopScene.js";
import EventScene from "./Scenes/EventScene.js";

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
  },
  backgroundColor: "#ffffff",
  scene: [BoardScene, BattleScene, ShopScene, EventScene]
};

new Phaser.Game(config);
