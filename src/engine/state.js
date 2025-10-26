import { JOB_DATA } from "../data/jobs.js?v=202510261709";
import { MAP_DATA } from "../data/map.js?v=202510261144";
import {
  buildInitContext,
  resolveUnitPosition
} from "../shared/unit-position.js?v=202510252114";

export function createInitialState({ west, east, config, sandbox }) {
  const units = [];
  const allTeams = [
    { side: "west", team: west },
    { side: "east", team: east }
  ];

  for (const { side, team } of allTeams) {
    for (const info of team) {
      const module = info.module;
      const initContext = buildInitContext(side);
      const initResult = module.init?.(initContext) || {};
      const jobKey = initResult.job ?? info.job;
      const job = JOB_DATA[jobKey];
      //console.log("module, initResult, jobKey, job:", module, initResult, jobKey, job);
      const pos = resolveUnitPosition(initResult.initialPosition, info.initialPosition, side);
      const rawName = typeof initResult.name === "string" ? initResult.name.trim() : "";
      const fallbackName = typeof jobKey === "string" && jobKey.length ? jobKey : `${side}-${info.slot}`;
      const unitName = rawName || fallbackName;
      units.push({
        id: `${side}-${info.slot}`,
        side,
        slot: info.slot,
        job: jobKey,
        name: unitName,
        stats: { ...job.stats },
        skill: { ...job.skill, used: false },
        position: { ...pos },
        hp: job.stats.hp,
        memory: initResult.memory ?? {},
        module,
        sandbox
      });
    }
  }

  return {
    turn: 0,
    map: JSON.parse(JSON.stringify(MAP_DATA)),
    units,
    log: [],
    effects: [],
    effectSeq: 0,
    status: { finished: false, winner: null }
  };
}

export function cloneState(state) {
  return structuredClone(state);
}