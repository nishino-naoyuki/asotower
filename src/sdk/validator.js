import { JOB_DATA } from "../data/jobs.js";
import {
  buildInitContext,
  resolveUnitPosition
} from "../shared/unit-position.js?v=202510241905";

export function validateTeams(west, east, config) {
  const errors = [];
  const allUnits = [...west, ...east];

  if (west.length !== config.maxUnits || east.length !== config.maxUnits) {
    errors.push(`各軍は ${config.maxUnits} 人である必要があります。`);
  }

  for (const unit of allUnits) {
    if (!JOB_DATA[unit.job]) {
      errors.push(`${unit.file} のJOB ${unit.job} は未定義です。`);
    }
    const initContext = buildInitContext(unit.side);
    const initResult = unit.module.init?.(initContext) ?? {};
    const job = initResult.job ?? unit.job;
    if (!JOB_DATA[job]) {
      errors.push(`${unit.id ?? unit.file} のinitが不正なJOBを返しました。`);
    }
    const resolvedPosition = resolveUnitPosition(initResult.initialPosition, unit.initialPosition, unit.side);
    const validX = unit.side === "west" ? resolvedPosition.x < 20 : resolvedPosition.x >= 20;
    if (!validX) {
      errors.push(`${unit.file} の初期位置が陣地範囲外です。`);
    }
  }

  if (errors.length) {
    return { ok: false, message: errors.join("\n") };
  }
  return { ok: true };
}