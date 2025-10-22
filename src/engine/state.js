import { JOB_DATA } from "../data/jobs.js";
import { MAP_DATA } from "../data/map.js";

export function createInitialState({ west, east, config, sandbox }) {
  const units = [];
  const allTeams = [
    { side: "west", team: west },
    { side: "east", team: east }
  ];

  for (const { side, team } of allTeams) {
    for (const info of team) {
      const module = info.module;
      const initResult = module.init?.({ side }) || {};
      const jobKey = initResult.job ?? info.job;
      const job = JOB_DATA[jobKey];
      const pos = initResult.initialPosition ?? info.initialPosition;
      units.push({
        id: `${side}-${info.slot}`,
        side,
        slot: info.slot,
        job: jobKey,
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
    status: { finished: false, winner: null }
  };
}

export function cloneState(state) {
  return structuredClone(state);
}