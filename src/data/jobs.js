export const JOB_DATA = {
  soldier: {
    name: "ソルジャー",
    role: "frontline_striker",
    stats: { hp: 30, attack: 24, defense: 26, speed: 18, range: 18, sight: 24 },
    attributes: { hp: 30, atk: 24, def: 26, spd: 18, range: 18, sight: 24 },
    skill: {
      name: "braveCharge",
      displayName: "ブレイブチャージ",
      description: "一直線に突撃し、最初に命中した敵へ攻撃力200%のダメージを与え1マス吹き飛ばす。",
      type: "active",
      usage: "once",
      effect: {
        pattern: "line",
        tiles: 3,
        damageMultiplier: 2.0,
        knockbackTiles: 1,
        selfBuff: { durationMs: 4000, speedBonus: 6 }
      }
    },
    affinity: {
      attack: "assassin",
      vulnerable: "lancer",
      strongAgainst: ["assassin"],
      weakAgainst: ["lancer"]
    }
  },
  lancer: {
    name: "ランサー",
    role: "midline_piercer",
    stats: { hp: 22, attack: 28, defense: 18, speed: 24, range: 28, sight: 20 },
    attributes: { hp: 22, atk: 28, def: 18, spd: 24, range: 28, sight: 20 },
    skill: {
      name: "reachBreak",
      displayName: "リーチブレイク",
      description: "長槍を振り抜き前方扇形2マスの敵に150%ダメージと防御-20%のデバフを与える。",
      type: "active",
      usage: "cooldown",
      cooldownMs: 12000,
      effect: {
        area: { shape: "cone", radius: 2, angle: 60 },
        damageMultiplier: 1.5,
        debuff: { defenseMultiplier: 0.8, durationMs: 5000 }
      }
    },
    affinity: {
      attack: "guardian",
      vulnerable: "assassin",
      strongAgainst: ["guardian"],
      weakAgainst: ["assassin"]
    }
  },
  archer: {
    name: "アーチャー",
    role: "ranged_dps",
    stats: { hp: 20, attack: 26, defense: 16, speed: 22, range: 32, sight: 24 },
    attributes: { hp: 20, atk: 26, def: 16, spd: 22, range: 32, sight: 24 },
    skill: {
      name: "multiShot",
      displayName: "マルチショット",
      description: "射程内の最大3体へ同時に矢を放ち、それぞれに攻撃力130%のダメージを与える。",
      type: "active",
      usage: "cooldown",
      cooldownMs: 14000,
      effect: {
        targets: 3,
        damageMultiplier: 1.3,
        selection: "closest"
      }
    },
    affinity: {
      attack: "summoner",
      vulnerable: "scout",
      strongAgainst: ["summoner"],
      weakAgainst: ["scout"]
    }
  },
  mage: {
    name: "メイジ",
    role: "burst_caster",
    stats: { hp: 18, attack: 32, defense: 14, speed: 20, range: 28, sight: 28 },
    attributes: { hp: 18, atk: 32, def: 14, spd: 20, range: 28, sight: 28 },
    skill: {
      name: "elementalBurst",
      displayName: "エレメンタルバースト",
      description: "指定地点を中心に半径2マスへ3属性の爆裂を起こし、範囲内の敵へ攻撃力220%のダメージ。",
      type: "active",
      usage: "once",
      effect: {
        area: { shape: "circle", radius: 2 },
        damageMultiplier: 2.2,
        elemental: ["fire", "ice", "lightning"]
      }
    },
    affinity: {
      attack: "guardian",
      vulnerable: "archer",
      strongAgainst: ["guardian"],
      weakAgainst: ["archer"]
    }
  },
  healer: {
    name: "ヒーラー",
    role: "support_healer",
    stats: { hp: 26, attack: 14, defense: 22, speed: 20, range: 22, sight: 36 },
    attributes: { hp: 26, atk: 14, def: 22, spd: 20, range: 22, sight: 36 },
    skill: {
      name: "medica",
      displayName: "メディカ",
      description: "味方単体を即時150回復し、弱体効果をすべて解除。さらに5秒間徐々に回復する。",
      type: "active",
      usage: "cooldown",
      cooldownMs: 10000,
      effect: {
        target: "ally",
        healAmount: 150,
        cleanse: true,
        regen: { amount: 80, durationMs: 5000 }
      }
    },
    affinity: {
      vulnerable: "assassin",
      strongAgainst: [],
      weakAgainst: ["assassin"]
    }
  },
  guardian: {
    name: "ガーディアン",
    role: "tank",
    stats: { hp: 36, attack: 18, defense: 36, speed: 12, range: 14, sight: 24 },
    attributes: { hp: 36, atk: 18, def: 36, spd: 12, range: 14, sight: 24 },
    skill: {
      name: "fortress",
      displayName: "フォートレス",
      description: "8秒間、被ダメージ-40%と挑発状態になり、周囲2マスの敵の攻撃対象を自身に向けさせる。",
      type: "active",
      usage: "once",
      effect: {
        tauntRadius: 2,
        durationMs: 8000,
        damageTakenMultiplier: 0.6
      }
    },
    affinity: {
      attack: "soldier",
      vulnerable: "mage",
      strongAgainst: ["soldier"],
      weakAgainst: ["mage"]
    }
  },
  assassin: {
    name: "アサシン",
    role: "melee_burst",
    stats: { hp: 18, attack: 30, defense: 12, speed: 34, range: 20, sight: 26 },
    attributes: { hp: 18, atk: 30, def: 12, spd: 34, range: 20, sight: 26 },
    skill: {
      name: "shadowStep",
      displayName: "シャドウステップ",
      description: "敵背後へ瞬間移動し、攻撃力220%の背面攻撃を行い、2秒間スタンを与える。",
      type: "active",
      usage: "cooldown",
      cooldownMs: 15000,
      effect: {
        teleport: { range: 4, behindTarget: true },
        damageMultiplier: 2.2,
        debuff: { type: "stun", durationMs: 2000 }
      }
    },
    affinity: {
      attack: "lancer",
      vulnerable: "guardian",
      strongAgainst: ["lancer"],
      weakAgainst: ["guardian"]
    }
  },
  engineer: {
    name: "エンジニア",
    role: "utility_artificer",
    stats: { hp: 24, attack: 20, defense: 20, speed: 18, range: 26, sight: 32 },
    attributes: { hp: 24, atk: 20, def: 20, spd: 18, range: 26, sight: 32 },
    skill: {
      name: "deployTurret",
      displayName: "タレット展開",
      description: "指定地点に砲台を設置。砲台は15秒間、射程20で毎秒攻撃力80%の砲撃を行う。",
      type: "active",
      usage: "cooldown",
      cooldownMs: 18000,
      effect: {
        summon: {
          type: "turret",
          durationMs: 15000,
          attackIntervalMs: 1000,
          damageMultiplier: 0.8,
          range: 20
        }
      }
    },
    affinity: {
      attack: "scout",
      vulnerable: "summoner",
      strongAgainst: ["scout"],
      weakAgainst: ["summoner"]
    }
  },
  summoner: {
    name: "サモナー",
    role: "control_summoner",
    stats: { hp: 22, attack: 18, defense: 16, speed: 18, range: 26, sight: 40 },
    attributes: { hp: 22, atk: 18, def: 16, spd: 18, range: 26, sight: 40 },
    skill: {
      name: "miniOnCall",
      displayName: "ミニオンコール",
      description: "ミニオン2体を召喚し、10秒間敵を攻撃させる。ミニオンは攻撃力90%の遠隔攻撃を行う。",
      type: "active",
      usage: "cooldown",
      cooldownMs: 20000,
      effect: {
        summon: {
          count: 2,
          durationMs: 10000,
          attackIntervalMs: 1200,
          damageMultiplier: 0.9,
          range: 18
        }
      }
    },
    affinity: {
      attack: "engineer",
      vulnerable: "archer",
      strongAgainst: ["engineer"],
      weakAgainst: ["archer"]
    }
  },
  scout: {
    name: "スカウト",
    role: "recon_striker",
    stats: { hp: 16, attack: 18, defense: 14, speed: 36, range: 22, sight: 34 },
    attributes: { hp: 16, atk: 18, def: 14, spd: 36, range: 22, sight: 34 },
    skill: {
      name: "reconPulse",
      displayName: "リコンパルス",
      description: "広域索敵を行い、半径4マスの敵を6秒間可視化し、最も近い敵に攻撃力160%ダメージ。",
      type: "active",
      usage: "cooldown",
      cooldownMs: 12000,
      effect: {
        revealRadius: 4,
        revealDurationMs: 6000,
        damageMultiplier: 1.6
      }
    },
    affinity: {
      attack: "archer",
      vulnerable: "engineer",
      strongAgainst: ["archer"],
      weakAgainst: ["engineer"]
    }
  },
  sumo: {
    name: "相撲レスラー",
    role: "frontline_heavy",
    stats: { hp: 40, attack: 30, defense: 28, speed: 8, range: 14, sight: 20 },
    attributes: { hp: 40, atk: 30, def: 28, spd: 8, range: 14, sight: 20 },
    skill: {
      name: "dohyo_breaker",
      displayName: "土俵轟砕",
      description: "半径1.5マスへ体当たりし命中した敵に攻撃力250%ダメージとノックバック2マス。自身は8秒間被ダメージ-30%。",
      type: "active",
      usage: "once",
      effect: {
        area: { shape: "circle", radius: 1.5 },
        damageMultiplier: 2.5,
        knockbackTiles: 2,
        selfBuff: { durationMs: 8000, damageTakenMultiplier: 0.7 }
      }
    },
    affinity: {
      strongAgainst: ["assassin"],
      weakAgainst: ["mage"]
    }
  }
};