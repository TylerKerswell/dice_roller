import { drawDice, rollAllAttackDice } from "../utils/dice.js";

export default class Player {
  constructor(hp = 100) {
    this.maxHp = hp; 
    this.hp = hp;    
    this.dice = [];  
  }

  roll() {
    this.dice = drawDice([{ basePower: 1 }], 5); 
    return this.dice;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp < 0) this.hp = 0;
  }

  attack(enemy) {
    if (this.dice.length === 0) this.roll();

    const rolls = rollAllAttackDice(this.dice);
    const totalDamage = rolls.reduce((sum, r) => sum + r.damage, 0);

    enemy.takeDamage(totalDamage); 
    this.dice = []; 
    return totalDamage; 
  }

  heal(amount) {
    this.hp += amount;
    if (this.hp > this.maxHp) this.hp = this.maxHp;
  }

  increaseHealthCapacity(amount) {
    this.maxHp += amount;
    if (this.hp > this.maxHp) this.hp = this.maxHp;
  }
}
