import { baseBag, drawDice, rollAllAttackDice, upgradedBag1, upgradedBag2, upgradedBag3 } from "../utils/dice.js";

export default class Player {
  constructor(hp = 100) {
    this.maxHp = hp; 
    this.hp = hp;    
    this.dice = [];  
    this.bag = baseBag;
    this.attackBonus = 0;
    this.money = 0;

  }

  roll() {
    this.dice = drawDice(this.bag, 5); 
    return this.dice;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  attack(enemy) {
  if (this.dice.length === 0) this.roll();

  const rolls = rollAllAttackDice(this.dice);
  const totalDamage =
  rolls.reduce((sum, r) => sum + r.damage, 0) + this.attackBonus;

  enemy.takeDamage(totalDamage);
  this.dice = [];

  return { rolls, totalDamage };
}


  heal(amount) {
    this.hp += amount;
    if (this.hp > this.maxHp) this.hp = this.maxHp;
  }

  increaseHealthCapacity(amount) {
    this.maxHp += amount;
    if (this.hp > this.maxHp) this.hp = this.maxHp;
  }

  die() {
    console.log("Game over");
    this.upgradeBag()
    // send back to menu screen?    
  }
upgradeBag() {
    const bags = [baseBag, upgradedBag1, upgradedBag2, upgradedBag3];
    const currentIndex = bags.indexOf(this.bag);
    if (currentIndex >= 0 && currentIndex < bags.length - 1) {
        this.bag = bags[currentIndex + 1];
    }
}


  }

