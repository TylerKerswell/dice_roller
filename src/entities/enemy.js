

import { drawDice, rollAllDice, baseBag } from "../utils/dice.js";

export default class Enemy {
  constructor(hp = 50) {
    this.maxHp = hp;
    this.hp = hp;

    this.bag = [...baseBag];
    this.dice = [];
    this.dicePerAttack = 5;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  attack(player) {
    this.dice = drawDice(this.bag, this.dicePerAttack);

    const rolls = rollAllDice(this.dice, {});

    const totalDamage = rolls.reduce(
      (sum, r) => sum + r.damage,
      0
    );

    if (totalDamage > 0) {
      player.takeDamage(totalDamage);
    }

    this.dice = [];

    return {
      rolls,
      totalDamage,
      playerHp: player.hp,
    };
  }
}

