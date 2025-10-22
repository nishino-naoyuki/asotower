import { loadTeams, createBattle } from "./engine/game-engine.js";
import { Renderer } from "./render/renderer.js";
import { Overlay } from "./render/ui-overlay.js";
import { Controls } from "./render/controls.js";
import { audioManager } from "./render/audio-manager.js";
import { validateTeams } from "./sdk/validator.js";

const canvas = document.getElementById("battle-canvas");
const renderer = new Renderer(canvas);
const overlay = new Overlay(renderer);
const controls = new Controls();

let battle = null;

async function startBattle() {
  overlay.clearLog();
  overlay.showMessage("チーム読込中…");

  const { west, east, config } = await loadTeams();
  const validation = validateTeams(west, east, config);
  if (!validation.ok) {
    overlay.showError(validation.message);
    return;
  }

  battle = createBattle({ west, east, config, renderer, overlay });
  audioManager.playBgm("assets/audio/bgm/main_theme.mp3");
  battle.start();
  overlay.showMessage("試合開始！");
}

controls.on("play", () => battle?.play());
controls.on("pause", () => battle?.pause());
controls.on("step", () => battle?.step());
controls.on("speed", (speed) => battle?.setSpeed(speed));
controls.on("start", startBattle);
controls.on("download-replay", () => battle?.exportReplay());
controls.on("load-replay", (file) => battle?.loadReplay(file));

overlay.bindSelection((unitId) => battle?.selectUnit(unitId));
renderer.onHover((unitId) => overlay.highlightUnit(unitId));

window.addEventListener("DOMContentLoaded", () => {
  overlay.showMessage("準備完了。戦闘開始を押してください。");
});