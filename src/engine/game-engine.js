import { createInitialState, cloneState } from "./state.js";
import { resolveTurn } from "./actions.js";
import { Renderer } from "../render/renderer.js";
import { ReplayRecorder } from "../render/replay-recorder.js";
import { Sandbox } from "../sdk/sandbox.js";
import { loadConfig } from "../sdk/api.js";

export async function loadTeams() {
  const config = await loadConfig();
  const [west, east] = await Promise.all([
    loadSide("west", config),
    loadSide("east", config)
  ]);
  return { west, east, config };
}

async function loadSide(side, config) {
  const team = [];
  for (const slot of config[side]) {
    const moduleUrl = new URL(`../teams/${side}/${slot.file}`, import.meta.url);
    moduleUrl.searchParams.set("v", Date.now().toString());
    const mod = await Sandbox.importModule(moduleUrl.href);
    team.push({
      slot: slot.slot,
      file: slot.file,
      job: slot.job,
      initialPosition: slot.initialPosition,
      module: mod,
      side
    });
  }
  return team;
}

export function createBattle({ west, east, config, renderer, overlay }) {
  const sandbox = new Sandbox();
  const recorder = new ReplayRecorder();

  const state = createInitialState({ west, east, config, sandbox });
  const turnIntervalMs = config.turnIntervalMs ?? 5000;
  let timerId = null;

  const loop = {
    running: false,
    speed: 1,
    interval: turnIntervalMs,
    selectUnit(id) {
      renderer.focusUnit(id);
      overlay.updateSelection(id, state);
    },
    play() {
      if (this.running) return;
      this.running = true;
      scheduleNextTurn();
    },
    pause() {
      if (!this.running) return;
      this.running = false;
      clearTimer();
    },
    step() {
      this.pause();
      runTurn();
    },
    setSpeed(speed) {
      this.speed = Math.max(0.1, speed);
      if (this.running) {
        scheduleNextTurn();
      }
    },
    start() {
      this.play();
    },
    exportReplay() {
      recorder.download();
    },
    loadReplay(file) {
      recorder.load(file, (frames) => renderer.playReplay(frames));
    }
  };

  function runTurn() {
    console.log("runTurn state:", state);
    resolveTurn(state);
    renderer.render(state);
    overlay.update(state);
    if (state.status.finished) {
      loop.running = false;
      clearTimer();
      overlay.showMessage(`試合終了: ${state.status.winner} 勝利`);
    }
  }

  function clearTimer() {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  function scheduleNextTurn() {
    clearTimer();
    if (!loop.running || state.status.finished) return;
    const baseDelay = Math.max(16, loop.interval / loop.speed);
    timerId = setTimeout(() => {
      timerId = null;
      if (!loop.running) return;
      runTurn();
      if (loop.running && !state.status.finished) {
        scheduleNextTurn();
      }
    }, baseDelay);
  }

  renderer.render(state);
  overlay.update(state);

  return loop;
}