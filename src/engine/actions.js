import * as utils from "../../shared/unit-utils.js";

// 2点間の直線上セルリスト（整数座標）を返す（Bresenhamアルゴリズム簡易版）
function getLinePositions(from, to) {
  const positions = [];
  const x0 = Math.floor(from.x), y0 = Math.floor(from.y);
  const x1 = Math.floor(to.x), y1 = Math.floor(to.y);
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0, y = y0;
  while (true) {
    positions.push({ x, y });
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
  return positions;
}

// 直線上で最初に出会う敵セルを返す（味方は無視）
function findFirstEnemyOnLine(lineCells, enemies) {
  for (const cell of lineCells) {
    if (enemies.some(e => Math.floor(e.position.x) === cell.x && Math.floor(e.position.y) === cell.y)) {
      return cell;
    }
  }
  return null;
}

// 指定座標が埋まっている場合、ずらし候補を順に返す
function findAvailablePosition(state, basePos, self) {
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 }
  ];
  let offset = 1;
  while (offset <= 5) { // 最大5マスまで探索
    for (const dir of directions) {
      const pos = { x: basePos.x + dir.dx * offset, y: basePos.y + dir.dy * offset };
      if (!isOccupiedCell(state, pos, self)) return pos;
    }
    offset++;
  }
  return basePos; // どこも空いてなければ元の位置
}
// getAttackableEnemiesはrules.jsからimport
import { movementPerTurn, computeDamage, isInRange, rangePerTurn, getAttackableEnemies } from "./rules.js";
import { jobsMap } from './jobs/index.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createTurnProcessor(state, config = {}) {
  pruneExpiredEffects(state);
  // 各ユニットのprocessSkillを毎ターン呼び出し
  for (const unit of state.units) {
    const jobHandler = jobsMap[unit.job];
    if (jobHandler && typeof jobHandler.processSkill === 'function') {
      jobHandler.processSkill(state, unit);
    }
  }
  const turnOrder = [...state.units].sort((a, b) => {
    const speedDiff = b.stats.speed - a.stats.speed;
    return speedDiff !== 0 ? speedDiff : a.slot - b.slot;
  });

  //state.log = [];

  let index = 0;

  return {
    async next() {
      while (index < turnOrder.length) {
        const unit = turnOrder[index++];
        if (unit.hp <= 0 || state.status.finished) continue;
        const module = unit.module;
        try {
          // --- 移動処理 ---
          moveTo(module, state, unit);
          // --- 攻撃処理 ---
          attack(module, state, unit);
        } catch (err) {
          state.log.push({
            turn: state.turn,
            message: `${unit.id} のユニットでエラー: ${err}`
          });
          continue;
        }

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

function moveTo(module, state, unit) {
    if (typeof module.moveTo === 'function') {
      const moveTarget = module.moveTo(
        state.turn,
        state.units.filter(u => u.side !== unit.side && u.hp > 0 && !utils.isScoutInSkillMode(u)), // 敵
        state.units.filter(u => u.side === unit.side && u.id !== unit.id && u.hp > 0), // 味方
        state.map.castles[unit.side === 'west' ? 'east' : 'west'], // 敵城
        state.map.castles[unit.side], // 味方城
        unit // 自分
      );
      console.log(`Moving unit: ${unit.name} to x=${moveTarget.x}, y=${moveTarget.y}`);
      executeCommand(state, unit, { type: 'move', x: moveTarget.x, y: moveTarget.y });
      
    }
}

function attack(module, state, unit) {
    if (typeof module.attack === 'function') {
      const attackable = getAttackableEnemies(state, unit);
      const attackResult = module.attack(state.turn, attackable, unit);
      if (attackResult && attackResult.target) {
        if (attackResult.method === 'skill') {
          //console.log(`Using skill for unit: ${unit.id} targetId=${attackResult.target.id}`);
          queueEffect(state, {
            kind: "skill",
            position: unit.position,
            jobSounds: [{ job: unit.job, kind: "skill" }],
            durationMs: 1200 // 音声長に合わせて調整
          });
          executeCommand(state, unit, { type: 'skill', targetId: attackResult.target.id });
          // 城攻撃AI分岐
        } else if (attackResult && attackResult.method === 'castleattack') {
          executeCommand(state, unit, { type: 'attackCastle' });
        } else {
          executeCommand(state, unit, { type: 'attack', targetId: attackResult.target.id });
        }
      } else if (utils.isEnemyCastleInRange(unit)) {
        //攻撃指定が無くて城が攻撃範囲にあれば城を攻撃する
        executeCommand(state, unit, { type: 'attackCastle' });
      }
    }
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
  enemies: getAttackableEnemies(state, unit),
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
  // view.enemiesは既にgetAttackableEnemies経由だが、念のため直接取得も可能
  return this.findClosest(getAttackableEnemies(view.state, view.self), view.self.position);
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
      state.log.push({ turn: state.turn, message: `${unit.name} のコマンド不明` });
  }
}

function handleMove(state, unit, command) {
  const speed = movementPerTurn(unit);
  const dx = command.x - unit.position.x;
  const dy = command.y - unit.position.y;
  const distance = Math.hypot(dx, dy);
  //console.log(`handleMove: unit=${unit.name} from (${unit.position.x},${unit.position.y}) to (${command.x},${command.y}), distance=${distance}, speed=${speed}`);
  if (distance === 0) return;

  const scale = Math.min(1, speed / distance);
  const target = {
    x: unit.position.x + dx * scale,
    y: unit.position.y + dy * scale
  };
  //console.log(`Initial target before wall adjustment: x=${target.x}, y=${target.y}`);
  const adjusted = adjustForWalls(state.map, unit.position, target);
  const currentCell = {
    x: Math.floor(unit.position.x),
    y: Math.floor(unit.position.y)
  };
  let targetCell = {
    x: Math.floor(adjusted.x),
    y: Math.floor(adjusted.y)
  };
  const enteringNewCell = currentCell.x !== targetCell.x || currentCell.y !== targetCell.y;
  //console.log(`Adjusted target after wall check: x=${adjusted.x}, y=${adjusted.y}, targetCell=(${targetCell.x},${targetCell.y}), enteringNewCell=${enteringNewCell}`);
  let finalTarget = { x: targetCell.x, y: targetCell.y };
  if (!utils.isScoutInSkillMode(self)) {
    // 直線上のセルリスト取得
    const lineCells = getLinePositions(unit.position, finalTarget);
    // 直線上の敵を判定
    const enemies = state.units.filter(u => u.side !== unit.side && u.hp > 0);
    const firstEnemyCell = findFirstEnemyOnLine(lineCells, enemies);
    if (firstEnemyCell) {
      // 敵の1マス手前で止まる
      const idx = lineCells.findIndex(cell => cell.x === firstEnemyCell.x && cell.y === firstEnemyCell.y);
      if (idx > 0) {
        finalTarget = { x: lineCells[idx - 1].x, y: lineCells[idx - 1].y };
      } else {
        finalTarget = { x: unit.position.x, y: unit.position.y };
      }
    }
    // 目標座標が埋まっている場合はずらし処理
    if (isOccupiedCell(state, finalTarget, unit)) {
      finalTarget = findAvailablePosition(state, finalTarget, unit);
    }
    targetCell = finalTarget;
  }
  //console.log(`Final target cell after enemy check and occupation check: x=${targetCell.x}, y=${targetCell.y}`);
  // ずらし処理: 移動先が埋まっている場合はY-1→Y+1→X+1→X-1の順で空きセルを探す
  if (enteringNewCell && isOccupiedCell(state, targetCell, unit)) {
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 }
    ];
    let found = false;
    for (let offset = 1; offset <= 5 && !found; offset++) {
      for (const dir of directions) {
        const pos = { x: targetCell.x + dir.dx * offset, y: targetCell.y + dir.dy * offset };
        if (!isOccupiedCell(state, pos, unit)) {
          targetCell = pos;
          found = true;
          break;
        }
      }
    }
    if (!found) {
      state.log.push({ turn: state.turn, message: `${unit.name} は混雑して進めなかった` });
      return;
    }
  }
  const orgpositon = { x: unit.position.x, y: unit.position.y };
  unit.position.x = targetCell.x;
  unit.position.y = targetCell.y;

  state.log.push({ turn: state.turn, message: `${unit.name} が${orgpositon.x}, ${orgpositon.y}から${targetCell.x}, ${targetCell.y}へ移動` });
  queueEffect(state, {
    kind: "move",
    position: unit.position,
    sound: "move", // ←追加
    source: unit.position,
    durationMs: 800 // 任意
  });
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

  // scoutがスキル中なら敵ユニットは無視
  if (utils.isScoutInSkillMode(self)) {
    console.log("スカウトがスキル中のため、敵ユニットを無視");
    return false;
  }

  return state.units.some((unit) => {
    if (unit === self || unit.hp <= 0) return false;
    return Math.floor(unit.position.x) === cellX && Math.floor(unit.position.y) === cellY;
  });
}

function handleAttack(state, unit, command) {
  const target = state.units.find((u) => u.id === command.targetId);
  if (!target || target.hp <= 0) return;

  if (!isInRange(unit, target)) {
    state.log.push({ turn: state.turn, message: `${unit.name} の攻撃は届かなかった` });
    return;
  }

  const damage = computeDamage(unit, target);
  target.hp = Math.max(0, target.hp - damage);
  state.log.push({ turn: state.turn, message: `${unit.name} が ${target.name} に ${damage} ダメージ` });
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
    variant: distanceBetween(unit.position, target.position) <= 1.5 ? "melee" : "ranged",
    impactLabel: `${damage}`,
    job: unit.job, // 攻撃者のジョブ名を追加
    durationMs: 3000
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
    state.log.push({ turn: state.turn, message: `${unit.name} の攻撃は城に届かなかった` });
    return;
  }

  const castleDefense = 30;
  const dummyCastle = { stats: { defense: castleDefense }, job: "castle" };
  const damage = Math.max(1, computeDamage(unit, dummyCastle));
  castles[hpKey] = Math.max(0, (castles[hpKey] ?? 0) - damage);
  state.log.push({ turn: state.turn, message: `${unit.name} が敵城に ${damage} ダメージ` });
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

function handleSkill(state, unit, command) {
  if (!unit.skill) {
    state.log.push({ turn: state.turn, message: `${unit.name} には使用可能なスキルがない` });
    return;
  }
  if (unit.skill.used) {
    state.log.push({ turn: state.turn, message: `${unit.name} のスキルは既に使用済み` });
    return;
  }

  // 対象ユニット取得
  const target =
    command?.targetId !== undefined
      ? state.units.find((u) => u.id === command.targetId)
      : null;

  // ジョブごとのdoSkill呼び出し
  const skillHandler = jobsMap[unit.job];
  if (skillHandler && typeof skillHandler.doSkill === 'function') {
    skillHandler.doSkill(state, unit, target);
    unit.skill.used = true;
  } else {
    state.log.push({ turn: state.turn, message: `${unit.name}のスキルは未実装です` });
  }
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

export function queueEffect(
  state,
  {
    kind,
    position,
    durationMs = 600,
    sound = null,
    jobSounds = [],
    source = null,
    target = null,
    variant = null,
    label = null,
    traceLabel = null,
    impactLabel = null,
    job = null
  }
) {
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
    ...(label ? { label } : {}),
    ...(traceLabel ? { traceLabel } : {}),
    ...(impactLabel ? { impactLabel } : {}),
    ...(job ? { job } : {}),
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