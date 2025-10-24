import { movementPerTurn, computeDamage, isInRange, rangePerTurn } from "./rules.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createTurnProcessor(state, config = {}) {
  pruneExpiredEffects(state);
  const turnOrder = [...state.units].sort((a, b) => {
    const speedDiff = b.stats.speed - a.stats.speed;
    return speedDiff !== 0 ? speedDiff : a.slot - b.slot;
  });

  state.log = [];

  let index = 0;

  return {
    async next() {
      while (index < turnOrder.length) {
        const unit = turnOrder[index++];
        if (unit.hp <= 0 || state.status.finished) continue;

        const module = unit.module;
        let command = null;
        try {
          command =
            module.update?.(createStateView(state, unit), createApi()) ?? null;
        } catch (err) {
          state.log.push({
            turn: state.turn,
            message: `${unit.id} のupdateでエラー: ${err}`
          });
          continue;
        }

        executeCommand(state, unit, command);
        return { unit };
      }
      return null;
    },
    finalize() {
      state.turn += 1;
      checkEndCondition(state);
    }
  };
}

export async function resolveTurn(state, config = {}, hooks = {}) {
  const { onUnitProcessed } = hooks;
  const processor = createTurnProcessor(state, config);

  try {
    while (true) {
      const step = await processor.next();
      if (!step) break;
      if (typeof onUnitProcessed === "function") {
        await onUnitProcessed(step.unit, state);
      }
    }
  } finally {
    processor.finalize();
  }
}

function createStateView(state, unit) {
  const enemySide = unit.side === "west" ? "east" : "west";
  const castles = state.map.castles ?? {};
  return {
    self: unit,
    allies: state.units.filter((u) => u.side === unit.side && u.id !== unit.id && u.hp > 0),
    enemies: state.units.filter((u) => u.side !== unit.side && u.hp > 0),
    map: state.map,
    turn: state.turn,
    log: state.log,
    memory: unit.memory,
    allyCastle: {
      side: unit.side,
      hp: castles[`${unit.side}Hp`] ?? 0,
      position: castles[unit.side] ? { ...castles[unit.side] } : null
    },
    enemyCastle: {
      side: enemySide,
      hp: castles[`${enemySide}Hp`] ?? 0,
      position: castles[enemySide] ? { ...castles[enemySide] } : null
    }
  };
}

function createApi() {
  return {
    actions: {
      moveToward: (x, y) => ({ type: "move", x, y }),
      attack: (target) => ({ type: "attack", targetId: target.id }),
      attackCastle: () => ({ type: "attackCastle" }),
      useSkill: (target) => ({ type: "skill", targetId: target?.id ?? null })
    },
    utils: {
      findClosest(list, origin) {
        let best = null;
        let bestDist = Infinity;
        for (const item of list) {
          const dx = item.position.x - origin.x;
          const dy = item.position.y - origin.y;
          const dist = dx * dx + dy * dy;
          if (dist < bestDist) {
            best = item;
            bestDist = dist;
          }
        }
        return best;
      },
      distance(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
      },
      inRange(self, enemy) {
        return isInRange(self, enemy);
      },
      stepToward(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.hypot(dx, dy) || 1;
        const step = { x: from.x + dx / length, y: from.y + dy / length };
        return step;
      },
      closestEnemy(view) {
        return this.findClosest(view.enemies ?? [], view.self.position);
      },
      closestAlly(view) {
        return this.findClosest(view.allies ?? [], view.self.position);
      },
      distanceToEnemyCastle(view) {
        const castlePos = view.enemyCastle?.position;
        if (!castlePos) return Infinity;
        return this.distance(view.self.position, castlePos);
      },
      distanceToAllyCastle(view) {
        const castlePos = view.allyCastle?.position;
        if (!castlePos) return Infinity;
        return this.distance(view.self.position, castlePos);
      },
      distanceToClosestEnemy(view) {
        const target = this.closestEnemy(view);
        return target ? this.distance(view.self.position, target.position) : Infinity;
      },
      distanceToClosestAlly(view) {
        const target = this.closestAlly(view);
        return target ? this.distance(view.self.position, target.position) : Infinity;
      },
      remainingEnemies(view) {
        return view.enemies?.length ?? 0;
      },
      remainingAllies(view) {
        const allies = view.allies?.length ?? 0;
        return allies + (view.self?.hp > 0 ? 1 : 0);
      }
    }
  };
}

function executeCommand(state, unit, command) {
  if (!command) return;
  switch (command.type) {
    case "move":
      handleMove(state, unit, command);
      break;
    case "attack":
      handleAttack(state, unit, command);
      break;
    case "attackCastle":
      handleAttackCastle(state, unit);
      break;
    case "skill":
      handleSkill(state, unit, command);
      break;
    default:
      state.log.push({ turn: state.turn, message: `${unit.id} のコマンド不明` });
  }
}

function handleMove(state, unit, command) {
  const speed = movementPerTurn(unit);
  const dx = command.x - unit.position.x;
  const dy = command.y - unit.position.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return;

  const scale = Math.min(1, speed / distance);
  const target = {
    x: unit.position.x + dx * scale,
    y: unit.position.y + dy * scale
  };

  const adjusted = adjustForWalls(state.map, unit.position, target);
  const currentCell = {
    x: Math.floor(unit.position.x),
    y: Math.floor(unit.position.y)
  };
  const targetCell = {
    x: Math.floor(adjusted.x),
    y: Math.floor(adjusted.y)
  };
  const enteringNewCell = currentCell.x !== targetCell.x || currentCell.y !== targetCell.y;

  if (enteringNewCell && isOccupiedCell(state, adjusted, unit)) {
    state.log.push({ turn: state.turn, message: `${unit.id} は混雑して進めなかった` });
    return;
  }
  unit.position.x = adjusted.x;
  unit.position.y = adjusted.y;

  state.log.push({ turn: state.turn, message: `${unit.id} が移動` });
}

function adjustForWalls(map, from, to) {
  const walls = map?.walls ?? [];
  if (!walls.length) return { ...to };

  const maxDelta = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
  const steps = Math.max(1, Math.ceil(maxDelta * 5));
  let safe = { ...from };

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const point = {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t
    };
    if (isWallCell(walls, point)) {
      return safe;
    }
    safe = point;
  }

  return to;
}

function isWallCell(walls, point) {
  const cellX = Math.floor(point.x);
  const cellY = Math.floor(point.y);
  return walls.some((wall) => wall.x === cellX && wall.y === cellY);
}

function isOccupiedCell(state, position, self) {
  const cellX = Math.floor(position.x);
  const cellY = Math.floor(position.y);
  return state.units.some((unit) => {
    if (unit === self || unit.hp <= 0) return false;
    return Math.floor(unit.position.x) === cellX && Math.floor(unit.position.y) === cellY;
  });
}

function handleAttack(state, unit, command) {
  const target = state.units.find((u) => u.id === command.targetId);
  if (!target || target.hp <= 0) return;

  if (!isInRange(unit, target)) {
    state.log.push({ turn: state.turn, message: `${unit.id} の攻撃は届かなかった` });
    return;
  }

  const damage = computeDamage(unit, target);
  target.hp = Math.max(0, target.hp - damage);
  state.log.push({ turn: state.turn, message: `${unit.id} が ${target.id} に ${damage} ダメージ` });
  const jobSounds = [];
  if (damage > 0 && target.job) {
    jobSounds.push({ job: target.job, kind: "hit" });
    if (target.hp <= 0) {
      jobSounds.push({ job: target.job, kind: "down" });
    }
  }
  queueEffect(state, {
    kind: "attack",
    position: target.position,
    sound: "attack",
    jobSounds,
    source: unit.position,
    target: target.position,
    variant: distanceBetween(unit.position, target.position) <= 1.5 ? "melee" : "ranged"
  });

  queueEffect(state, {
    kind: "impactRing",
    position: target.position,
    durationMs: 500
  });
}

function handleAttackCastle(state, unit) {
  const enemySide = unit.side === "west" ? "east" : "west";
  const castles = state.map.castles ?? {};
  const castlePos = castles[enemySide];
  const hpKey = enemySide === "west" ? "westHp" : "eastHp";
  if (!castlePos || castles[hpKey] <= 0) return;

  const distance = Math.hypot(castlePos.x - unit.position.x, castlePos.y - unit.position.y);
  if (distance > rangePerTurn(unit)) {
    state.log.push({ turn: state.turn, message: `${unit.id} の攻撃は城に届かなかった` });
    return;
  }

  const castleDefense = 30;
  const dummyCastle = { stats: { defense: castleDefense }, job: "castle" };
  const damage = Math.max(1, computeDamage(unit, dummyCastle));
  castles[hpKey] = Math.max(0, (castles[hpKey] ?? 0) - damage);
  state.log.push({ turn: state.turn, message: `${unit.id} が敵城に ${damage} ダメージ` });
  queueEffect(state, {
    kind: "attack",
    position: castlePos,
    sound: "attack",
    source: unit.position,
    target: castlePos,
    variant: "siege"
  });

  if (castles[hpKey] <= 0) {
    state.log.push({ turn: state.turn, message: `${enemySide === "west" ? "西軍" : "東軍"}の城が陥落した` });
  }
}

function handleSkill(state, unit) {
  if (unit.skill.used) {
    state.log.push({ turn: state.turn, message: `${unit.id} のスキルは既に使用済み` });
    return;
  }
  unit.skill.used = true;
  state.log.push({ turn: state.turn, message: `${unit.id} がスキルを使用` });
  queueEffect(state, {
    kind: "skill",
    position: unit.position,
    durationMs: 900,
    sound: "skill"
  });
}

function checkEndCondition(state) {
  const westCastle = state.map.castles.westHp;
  const eastCastle = state.map.castles.eastHp;
  if (westCastle <= 0 || eastCastle <= 0) {
    state.status.finished = true;
    if (westCastle <= 0 && eastCastle <= 0) {
      state.status.winner = "引き分け";
    } else {
      state.status.winner = westCastle <= 0 ? "東軍" : "西軍";
    }
  }
}

function pruneExpiredEffects(state) {
  const now = Date.now();
  state.effects = (state.effects ?? []).filter((effect) => now - effect.createdAt < effect.durationMs);
}

function queueEffect(state, { kind, position, durationMs = 600, sound = null, jobSounds = [], source = null, target = null, variant = null }) {
  const now = Date.now();
  const id = (state.effectSeq = (state.effectSeq ?? 0) + 1);
  if (!state.effects) state.effects = [];
  const normalizedJobSounds = normalizeJobSounds(jobSounds);
  state.effects.push({
    id,
    kind,
    position: { x: position.x, y: position.y },
    createdAt: now,
    durationMs,
    sound,
    ...(normalizedJobSounds.length ? { jobSounds: normalizedJobSounds } : {}),
    ...(source ? { source: { x: source.x, y: source.y } } : {}),
    ...(target ? { target: { x: target.x, y: target.y } } : {}),
    ...(variant ? { variant } : {}),
    played: false
  });
}

function normalizeJobSounds(list) {
  if (!Array.isArray(list) || list.length === 0) return [];
  return list
    .map((entry) => {
      if (!entry || !entry.job || !entry.kind) return null;
      return { job: entry.job, kind: entry.kind };
    })
    .filter(Boolean);
}

function distanceBetween(a, b) {
  const dx = (a?.x ?? 0) - (b?.x ?? 0);
  const dy = (a?.y ?? 0) - (b?.y ?? 0);
  return Math.hypot(dx, dy);
}