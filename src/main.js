import Phaser from "phaser";
import BattleScene from "./Scenes/BattleScene.js";
import BoardScene from "./Scenes/BoardScene.js";
import ShopScene from "./Scenes/ShopScene.js";
import EventScene from "./Scenes/EventScene.js";

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

const config = {
  type: Phaser.AUTO,

  // Crisp on HiDPI / Retina
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  autoRound: true,

  scale: {
    mode: Phaser.Scale.FIT,            // FIT is safer for UI than ENVELOP
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
  },

  render: {
    antialias: true,                   // smoother shapes/text
    pixelArt: false,                   // keep text crisp (pixelArt=true makes text ugly)
    roundPixels: true,                 // reduces sub-pixel blur
    transparent: false,
    // powerPreference: "high-performance", // optional
  },

  backgroundColor: "#ffffff",

  fps: {
    target: 60,
    forceSetTimeOut: true,             // helps some browsers
  },

  scene: [MenuScene, BoardScene, BattleScene, ShopScene],
};

new Phaser.Game(config);

