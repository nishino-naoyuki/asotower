import { JOB_DATA } from "../data/jobs.js?v=202510231119";

export function computeDamage(attacker, defender) {
  const attack = attacker.stats.attack;
  const defense = defender.stats.defense;
  let dmg = Math.max(1, attack - defense * 0.5);

  const attJob = JOB_DATA[attacker.job];
  const defJob = JOB_DATA[defender.job];
  if (attJob?.affinity?.attack === defender.job) {
    dmg *= 1.2;
  }
  if (attJob?.affinity?.vulnerable === defender.job) {
    dmg *= 1.0;
  }
  if (defJob?.affinity?.vulnerable === attacker.job) {
    dmg *= 1.5;
  }

  const jitter = 0.95 + Math.random() * 0.1;
  dmg *= jitter;

  const critChance = 0.05;
  if (Math.random() < critChance) {
    dmg *= 1.5;
  }

  return Math.floor(dmg);
}

export function movementPerTurn(unit) {
  return unit.stats.speed / 10;
}

export function isInRange(attacker, target) {
  const range = rangePerTurn(attacker);
  const dx = target.position.x - attacker.position.x;
  const dy = target.position.y - attacker.position.y;
  const dist = Math.hypot(dx, dy);
  return dist <= range;
}

export function rangePerTurn(unit) {
  return unit.stats.range / 10;
}