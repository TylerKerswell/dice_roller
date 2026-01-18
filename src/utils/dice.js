// src/dice.js

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Simple bag: every die is an "attack die"
export const baseBag = [
  { id: "a1", name: "Strike", type: "attack", basePower: 1 },
  { id: "a2", name: "Strike", type: "attack", basePower: 1 },
  { id: "a3", name: "Strike", type: "attack", basePower: 1 },
  { id: "a4", name: "Strike", type: "attack", basePower: 1 },
  { id: "a5", name: "Strike", type: "attack", basePower: 1 },
];

// Draw N dice randomly (with replacement)
export function drawDice(bag, count) {
  const drawn = [];
  for (let i = 0; i < count; i++) {
    const idx = randInt(0, bag.length - 1);
    drawn.push(bag[idx]);
  }
  return drawn;
}

// Roll a single attack die: damage = roll (1-6) + basePower
export function rollAttackDie(die) {
  const roll = randInt(1, 6);
  const basePower = die.basePower ?? 0;
  const damage = roll + basePower;

  return {
    die,
    roll,
    damage,
  };
}

// Roll all drawn dice
export function rollAllAttackDice(dice) {
  return dice.map(rollAttackDie);
}

// Apply all damage rolls to enemy HP
export function applyDamageRolls(state, rolls) {
  const totalDamage = rolls.reduce((sum, r) => sum + r.damage, 0);
  return {
    ...state,
    enemyHp: Math.max(0, state.enemyHp - totalDamage),
    lastTurnDamage: totalDamage, // optional, for UI
  };
}