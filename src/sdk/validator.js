import { JOB_DATA } from "../data/jobs.js";

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
    const initResult = unit.module.init?.({ side: unit.side }) ?? {};
    const job = initResult.job ?? unit.job;
    if (!JOB_DATA[job]) {
      errors.push(`${unit.id ?? unit.file} のinitが不正なJOBを返しました。`);
    }
    const pos = initResult.initialPosition ?? unit.initialPosition;
    const validX = unit.side === "west" ? pos.x < 20 : pos.x >= 20;
    if (!validX) {
      errors.push(`${unit.file} の初期位置が陣地範囲外です。`);
    }
  }

  if (errors.length) {
    return { ok: false, message: errors.join("\n") };
  }
  return { ok: true };
}