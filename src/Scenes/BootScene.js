export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // load assets here
  }

  create() {
    this.scene.start("MenuScene");
  }
}
