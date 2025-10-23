export class Overlay {
  constructor(renderer) {
    this.renderer = renderer;
    this.logElem = document.getElementById("log-list");
    this.unitDetails = document.getElementById("unit-details");
    this.message = document.createElement("div");
    this.logElem.appendChild(this.message);
    this.selectHandler = null;
  }

  update(state) {
    this.renderLog(state.log.slice(-20));
    this.renderUnits(state.units);
  }

  renderLog(entries) {
    this.logElem.innerHTML = entries
      .map((entry) => `<div>[${entry.turn}] ${entry.message}</div>`)
      .join("");
  }

  renderUnits(units) {
    this.unitDetails.innerHTML = units
      .map((u) => `<div class="unit-row" data-id="${u.id}">
        <strong>${u.id}</strong> (${u.job}) HP: ${u.hp}
      </div>`)
      .join("");

    this.unitDetails.querySelectorAll(".unit-row").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id");
        this.selectHandler?.(id);
      });
    });
  }

  clearLog() {
    this.logElem.innerHTML = "";
  }

  showMessage(text) {
    this.logElem.innerHTML = `<div class="info">${text}</div>`;
  }

  showError(text) {
    this.logElem.innerHTML = `<div class="error">${text}</div>`;
  }

  bindSelection(handler) {
    this.selectHandler = handler;
  }

  updateSelection(id, state) {
    const unit = state.units.find((u) => u.id === id);
    if (!unit) return;
    this.unitDetails.innerHTML = `<h3>${unit.id}</h3>
      <p>JOB: ${unit.job}</p>
      <p>HP: ${unit.hp}</p>
      <p>位置: (${unit.position.x.toFixed(1)}, ${unit.position.y.toFixed(1)})</p>
      <p>速度: ${unit.stats.speed} (移動${unit.stats.speed / 10}マス/ターン)</p>
    <p>射程: ${(unit.stats.range / 10).toFixed(1)}マス</p>
      <p>スキル: ${unit.skill.used ? "使用済み" : "未使用"}</p>`;
  }

  highlightUnit(id) {
    // optional highlight
  }
}