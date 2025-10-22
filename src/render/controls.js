export class Controls {
  constructor() {
    this.handlers = {};
    this.bind();
  }

  bind() {
    document.getElementById("btn-play").addEventListener("click", () => this.emit("play"));
    document.getElementById("btn-pause").addEventListener("click", () => this.emit("pause"));
    document.getElementById("btn-step").addEventListener("click", () => this.emit("step"));
    document.getElementById("btn-start").addEventListener("click", () => this.emit("start"));
    document.getElementById("btn-download-replay").addEventListener("click", () => this.emit("download-replay"));
    document.getElementById("btn-load-replay").addEventListener("click", () => {
      const fileInput = document.getElementById("replay-file");
      if (fileInput.files.length) this.emit("load-replay", fileInput.files[0]);
    });
    document.getElementById("speed-select").addEventListener("change", (e) => this.emit("speed", Number(e.target.value)));
  }

  on(event, handler) {
    this.handlers[event] = handler;
  }

  emit(event, payload) {
    this.handlers[event]?.(payload);
  }
}