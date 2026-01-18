import Phaser from "phaser";
import Player from "../entities/player.js";
import Enemy from "../entities/enemy.js";
import { rollAllAttackDice } from "../utils/dice.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    this.player = new Player(100);
    this.enemy = new Enemy(50);

    this.playerHpText = this.add.text(100, 20, `Player HP: ${this.player.hp}`, { fontSize: "20px", color: "#000" });
    this.enemyHpText = this.add.text(600, 20, `Enemy HP: ${this.enemy.hp}`, { fontSize: "20px", color: "#000" });

    this.diceText = this.add.text(100, 100, "Dice: ", { fontSize: "20px", color: "#000" });

    this.messageText = this.add.text(100, 150, "Roll dice to attack!", { fontSize: "20px", color: "#000" });

    this.rollButton = this.add.text(100, 200, "ROLL DICE", { fontSize: "24px", color: "#fff", backgroundColor: "#0077ff", padding: {x:10, y:5} })
      .setInteractive()
      .on("pointerdown", () => this.playerRoll());

    this.attackButton = this.add.text(300, 200, "ATTACK", { fontSize: "24px", color: "#fff", backgroundColor: "#ff0000", padding: {x:10, y:5} })
      .setInteractive()
      .on("pointerdown", () => this.playerAttack());
  }

  updateHpTexts() {
    this.playerHpText.setText(`Player HP: ${this.player.hp}`);
    this.enemyHpText.setText(`Enemy HP: ${this.enemy.hp}`);
  }

  playerRoll() {
    const dice = this.player.roll();
    // Show dice IDs and base power
    this.diceText.setText("Dice: " + dice.map((d,i)=>`D${i+1}(${d.basePower})`).join(", "));
    this.messageText.setText("You rolled the dice! Now attack!");
  }

  playerAttack() {
    if (!this.player.dice.length) {
      this.messageText.setText("Roll dice first!");
      return;
    }

    const rolls = rollAllAttackDice(this.player.dice);
    const totalDamage = rolls.reduce((sum,r)=>sum+r.damage,0);

    this.player.attack(this.enemy);
    this.updateHpTexts();
    this.messageText.setText(`You dealt ${totalDamage} damage!`);

    // Enemy turn after short delay
    if (this.enemy.hp > 0) {
      this.time.delayedCall(1000, () => this.enemyTurn(), [], this);
    } else {
      this.messageText.setText("Enemy defeated! A stronger enemy appears!");
      this.updateHpTexts();
    }
  }

  enemyTurn() {
    const totalDamage = this.enemy.attack(this.player);
    this.updateHpTexts();

    if (this.player.hp <= 0) {
      this.messageText.setText(`Enemy dealt ${totalDamage} damage! You were defeated! Game Over!`);
    } else {
      this.messageText.setText(`Enemy dealt ${totalDamage} damage! Your turn!`);
    }
  }
}
