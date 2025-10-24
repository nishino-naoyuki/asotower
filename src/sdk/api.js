import { JOB_DATA } from "../data/jobs.js";
import { MAP_DATA } from "../data/map.js";

export async function loadConfig() {
  const response = await fetch("./config/team-map.json?v=202510250019");
  const baseConfig = await response.json();

  return structuredClone({
    west: baseConfig.west,
    east: baseConfig.east,
    maxUnits: baseConfig.maxUnits,
    turnIntervalMs: baseConfig.turnIntervalMs ?? 5000,
    unitActionIntervalMs: baseConfig.unitActionIntervalMs ?? 500,
    jobs: JOB_DATA,
    map: MAP_DATA
  });
}