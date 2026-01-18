import { baseBag, drawDice, rollAllDice } from "../utils/dice.js";

export default class Player {
  constructor(hp = 100) {
    this.maxHp = hp;
    this.hp = hp;

    this.baseDice = [...baseBag];
    this.bag = [...this.baseDice];

    this.dice = [];
    this.money = 0;
    this.attackBonus = 0;
    this.dicePerAttack = 5;

  }

   addDie(die) {
    this.bag.push(die);
  }




  roll() {
    this.dice = drawDice(this.bag, this.dicePerAttack);
    return this.dice;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  increaseHealthCapacity(amount) {
    this.maxHp += amount;
    this.hp = Math.min(this.hp, this.maxHp);
  }

  attack(enemy) {
    if (this.dice.length === 0) {
      this.roll();
    }

    const rolls = rollAllDice(this.dice, {
      playerHp: this.hp,
      playerMaxHp: this.maxHp,
    });

    let totalEnemyDamage = 0;
    let totalSelfDamage = 0;
    let totalHealing = 0;

    for (const r of rolls) {
      totalEnemyDamage += r.damage;
      totalSelfDamage += r.selfDamage;
      totalHealing += r.selfHeal;
    }

    totalEnemyDamage += this.attackBonus;

    if (totalEnemyDamage > 0) {
      enemy.takeDamage(totalEnemyDamage);
    }

    if (totalSelfDamage > 0) {
      this.takeDamage(totalSelfDamage);
    }

    if (totalHealing > 0) {
      this.heal(totalHealing);
    }

    this.dice = [];

    return {
      rolls,
      totalEnemyDamage,
      totalSelfDamage,
      totalHealing,
      playerHp: this.hp,
      enemyHp: enemy.hp,
    };
  }
}

