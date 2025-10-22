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

  const loop = {
    running: false,
    speed: 1,
    selectUnit(id) {
      renderer.focusUnit(id);
      overlay.updateSelection(id, state);
    },
    play() {
      this.running = true;
    },
    pause() {
      this.running = false;
    },
    step() {
      this.running = false;
      runTurn();
    },
    setSpeed(speed) {
      this.speed = speed;
    },
    start() {
      this.running = true;
      frame();
    },
    exportReplay() {
      recorder.download();
    },
    loadReplay(file) {
      recorder.load(file, (frames) => renderer.playReplay(frames));
    }
  };

  function runTurn() {
    resolveTurn(state);
    renderer.render(state);
    overlay.update(state);
    if (state.status.finished) {
      loop.running = false;
      overlay.showMessage(`試合終了: ${state.status.winner} 勝利`);
    }
  }

  function frame() {
    if (loop.running) {
      const stepCount = loop.speed >= 2 ? 2 : 1;
      for (let i = 0; i < stepCount; i++) {
        if (!loop.running) break;
        runTurn();
      }
    }
    requestAnimationFrame(frame);
  }

  renderer.render(state);
  overlay.update(state);

  return loop;
}