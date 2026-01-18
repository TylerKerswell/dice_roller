import { drawDice, rollAllAttackDice } from "../utils/dice.js";

export default class Enemy {
  constructor(hp = 50) {
    this.maxHp = hp; 
    this.hp = hp;
    this.dice = [];
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  attack(player) {
    this.dice = drawDice([{ basePower: 1 }], 5); 
    const rolls = rollAllAttackDice(this.dice);
    const totalDamage = rolls.reduce((sum, r) => sum + r.damage, 0);

    player.takeDamage(totalDamage); 
    this.dice = []; 
    return totalDamage; 
  }

  die() {
    console.log("Enemy defeated! Spawning new stronger enemy...");
    this.maxHp *= 2;       
    this.hp = this.maxHp;   
    this.dice = [];         
  }
}
