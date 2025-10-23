import { movementPerTurn, computeDamage, isInRange, rangePerTurn } from "./rules.js?v=202510230936";

export function resolveTurn(state) {
  const ordered = [...state.units].sort((a, b) => {
    const speedDiff = b.stats.speed - a.stats.speed;
    return speedDiff !== 0 ? speedDiff : a.slot - b.slot;
  });

  state.log = [];

  for (const unit of ordered) {
    if (unit.hp <= 0 || state.status.finished) continue;
    const module = unit.module;
    let command = null;
    try {
      command = module.update?.(createStateView(state, unit), createApi()) ?? null;
    } catch (err) {
      state.log.push({ turn: state.turn, message: `${unit.id} のupdateでエラー: ${err}` });
      continue;
    }
    executeCommand(state, unit, command);
  }

  state.turn += 1;
  checkEndCondition(state);
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