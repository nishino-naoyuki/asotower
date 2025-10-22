export const JOB_DATA = {
  soldier: {
    stats: { hp: 30, attack: 24, defense: 26, speed: 18, range: 18, sight: 24 },
    skill: { name: "braveCharge" },
    affinity: { attack: "assassin", vulnerable: "lancer" }
  },
  lancer: {
    stats: { hp: 22, attack: 28, defense: 18, speed: 24, range: 28, sight: 20 },
    skill: { name: "reachBreak" },
    affinity: { attack: "guardian", vulnerable: "assassin" }
  },
  archer: {
    stats: { hp: 20, attack: 26, defense: 16, speed: 22, range: 32, sight: 24 },
    skill: { name: "multiShot" },
    affinity: { attack: "summoner", vulnerable: "scout" }
  },
  mage: {
    stats: { hp: 18, attack: 32, defense: 14, speed: 20, range: 28, sight: 28 },
    skill: { name: "elementalBurst" },
    affinity: { attack: "guardian", vulnerable: "archer" }
  },
  healer: {
    stats: { hp: 26, attack: 14, defense: 22, speed: 20, range: 22, sight: 36 },
    skill: { name: "medica" },
    affinity: { vulnerable: "assassin" }
  },
  guardian: {
    stats: { hp: 36, attack: 18, defense: 36, speed: 12, range: 14, sight: 24 },
    skill: { name: "fortress" },
    affinity: { attack: "soldier", vulnerable: "mage" }
  },
  assassin: {
    stats: { hp: 18, attack: 30, defense: 12, speed: 34, range: 20, sight: 26 },
    skill: { name: "shadowStep" },
    affinity: { attack: "lancer", vulnerable: "guardian" }
  },
  engineer: {
    stats: { hp: 24, attack: 20, defense: 20, speed: 18, range: 26, sight: 32 },
    skill: { name: "deployTurret" },
    affinity: { attack: "scout", vulnerable: "summoner" }
  },
  summoner: {
    stats: { hp: 22, attack: 18, defense: 16, speed: 18, range: 26, sight: 40 },
    skill: { name: "miniOnCall" },
    affinity: { attack: "engineer", vulnerable: "archer" }
  },
  scout: {
    stats: { hp: 16, attack: 18, defense: 14, speed: 36, range: 22, sight: 34 },
    skill: { name: "reconPulse" },
    affinity: { attack: "archer", vulnerable: "engineer" }
  }
};