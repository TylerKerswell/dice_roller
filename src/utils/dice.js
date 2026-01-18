  // src/dice.js

const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/*
Die shape:
{
  id,
  name,
  description,
  roll(dieContext) => { damage, selfDamage?, selfHeal? }
}
*/

// =====================
// BASE DICE
// =====================
export const baseBag = [
  {
    id: "base",
    name: "Strike",
    description: "Simple attack die",
    roll: () => {
      const roll = randInt(1, 6);
      return { roll, damage: roll };
    },
  },
];

// =====================
// MYSTERY DICE POOL
// =====================

// 1️⃣ Poison Dice — hurts you but hits harder
export const poisonDie = {
  id: "poison",
  name: "Poison Die",
  description: "Deal heavy damage, take 5 damage",
  roll: () => {
    const roll = randInt(3, 6);
    return { roll, damage: roll * 2, selfDamage: 5 };
  },
};

// 2️⃣ Joker Dice — 0 or 10
export const jokerDie = {
  id: "joker",
  name: "Joker Die",
  description: "Does 0 or 10 damage",
  roll: () => {
    const damage = Math.random() < 0.5 ? 0 : 10;
    return { roll: damage === 0 ? 0 : 6, damage };
  },
};

// 3️⃣ Healing Dice — heals instead of attacking
export const healingDie = {
  id: "heal",
  name: "Healing Die",
  description: "Heals you instead of attacking",
  roll: () => {
    const heal = randInt(3, 8);
    return { roll: heal, damage: 0, selfHeal: heal };
  },
};

// 4️⃣ Vampiric Dice — lifesteal
export const vampDie = {
  id: "vamp",
  name: "Vampire Die",
  description: "Heal half the damage dealt",
  roll: () => {
    const roll = randInt(2, 6);
    const dmg = roll + 2;
    return { roll, damage: dmg, selfHeal: Math.floor(dmg / 2) };
  },
};

// 5️⃣ Glass Dice — massive damage, self-damage on low roll
export const glassDie = {
  id: "glass",
  name: "Glass Die",
  description: "Huge damage, hurts you on low rolls",
  roll: () => {
    const roll = randInt(1, 6);
    if (roll <= 2) {
      return { roll, damage: 0, selfDamage: 6 };
    }
    return { roll, damage: roll * 3 };
  },
};

// 6️⃣ Curse Dice — grows stronger as HP drops
export const curseDie = {
  id: "curse",
  name: "Cursed Die",
  description: "More damage at low HP",
  roll: ({ playerHp, playerMaxHp }) => {
    const roll = randInt(1, 6);
    const missing = playerMaxHp - playerHp;
    return { roll, damage: roll + Math.floor(missing / 10) };
  },
};

// 7️⃣ Chaos Dice — completely random
export const chaosDie = {
  id: "chaos",
  name: "Chaos Die",
  description: "Random effect every roll",
  roll: () => {
    const r = randInt(1, 4);
    if (r === 1) return { roll: 0, damage: 0 };
    if (r === 2) return { roll: 6, damage: 12 };
    if (r === 3) return { roll: 3, damage: 3, selfHeal: 5 };
    return { roll: 1, damage: 1, selfDamage: 5 };
  },
};

// =====================
// MYSTERY POOL
// =====================
export const mysteryDicePool = [
  poisonDie,
  jokerDie,
  healingDie,
  vampDie,
  glassDie,
  curseDie,
  chaosDie,
];

// =====================
// DRAW / ROLL SYSTEM
// =====================
export function drawDice(bag, count) {
  const drawn = [];
  for (let i = 0; i < count; i++) {
    drawn.push(bag[randInt(0, bag.length - 1)]);
  }
  return drawn;
}

export function rollAllDice(dice, context) {
  return dice.map((die) => {
    const result = die.roll(context);
    return {
      die,
      type: die.id,
      roll: result.roll ?? 0,
      damage: result.damage ?? 0,
      selfDamage: result.selfDamage ?? 0,
      selfHeal: result.selfHeal ?? 0,
    };
  });
}
