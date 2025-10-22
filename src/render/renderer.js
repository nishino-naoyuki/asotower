const TILE = 32;

const COLORS = {
  battlefield: "#0f1624",
  lane: "#1d2942",
  westZone: "rgba(54, 123, 251, 0.12)",
  eastZone: "rgba(251, 92, 92, 0.12)",
  grid: "#25324a",
  westCastle: "#3a78ff",
  eastCastle: "#ff6363",
  wall: "#8892a6",
  wallText: "#111827",
  unitWest: "#48a9ff",
  unitEast: "#ff6b6b",
  hpBg: "#111827",
  hpFill: "#4ade80",
  label: "#f8fafc"
};

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.hoverHandler = null;
    canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
  }

  render(state) {
    const ctx = this.ctx;
    const { map, units } = state;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackground(ctx, map);
    this.drawZones(ctx, map);
    this.drawWalls(ctx, map.walls);
    this.drawCastles(ctx, map.castles);
    this.drawUnits(ctx, units);
    this.drawOverlay(ctx, state);
  }

  drawBackground(ctx, map) {
    ctx.fillStyle = COLORS.battlefield;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = COLORS.lane;
    const laneHeight = 8 * TILE;
    const laneTop = ((map.height * TILE) - laneHeight) / 2;
    ctx.fillRect(0, laneTop, map.width * TILE, laneHeight);

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let x = 0; x <= map.width; x++) {
      const px = Math.floor(x * TILE) + 0.5;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, map.height * TILE);
      ctx.stroke();
    }
    for (let y = 0; y <= map.height; y++) {
      const py = Math.floor(y * TILE) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(map.width * TILE, py);
      ctx.stroke();
    }
  }

  drawZones(ctx, map) {
    ctx.fillStyle = COLORS.westZone;
    ctx.fillRect(0, 0, 20 * TILE, map.height * TILE);
    ctx.fillStyle = COLORS.eastZone;
    ctx.fillRect((map.width - 20) * TILE, 0, 20 * TILE, map.height * TILE);
  }

  drawWalls(ctx, walls = []) {
    ctx.fillStyle = COLORS.wall;
    ctx.strokeStyle = "#1f2737";
    ctx.lineWidth = 2;
    ctx.font = "12px 'Noto Sans JP', sans-serif";
    ctx.fillStyle = COLORS.wall;
    walls.forEach((wall) => {
      const { x, y } = toTopLeftPixels(wall);
      ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeRect(x, y, TILE, TILE);
      ctx.fillStyle = COLORS.wallText;
      ctx.fillText(`${wall.hp}`, x + 6, y + 20);
      ctx.fillStyle = COLORS.wall;
    });
  }

  drawCastles(ctx, castles) {
    if (!castles) return;

    const draw = (castle, hp, color, label) => {
      if (!castle) return;
      const { x, y } = toTopLeftPixels(castle);
      const width = TILE * 2;
      const height = TILE * 3;

      ctx.fillStyle = color;
      ctx.fillRect(x - TILE * 0.5, y - TILE, width, height);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - TILE * 0.5, y - TILE, width, height);

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillRect(x - TILE * 0.25, y - TILE + 8, TILE * 0.5, TILE * 0.8);
      ctx.fillRect(x + TILE * 0.75, y - TILE + 8, TILE * 0.5, TILE * 0.8);

      ctx.fillStyle = COLORS.label;
      ctx.font = "14px 'Noto Sans JP', sans-serif";
      ctx.fillText(`${label}`, x - TILE * 0.2, y - TILE - 8);
      ctx.fillText(`HP: ${hp}`, x - TILE * 0.2, y + height - TILE * 0.2);
    };

    draw(castles.west, castles.westHp, COLORS.westCastle, "西軍の城");
    draw(castles.east, castles.eastHp, COLORS.eastCastle, "東軍の城");
  }

  drawUnits(ctx, units) {
    ctx.font = "11px 'Noto Sans JP', sans-serif";
    units.forEach((unit) => {
      if (unit.hp <= 0) return;
      const { x, y } = toCenterPixels(unit.position);
      ctx.fillStyle = unit.side === "west" ? COLORS.unitWest : COLORS.unitEast;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = COLORS.hpBg;
      ctx.fillRect(x - 18, y + 18, 36, 5);
      ctx.fillStyle = COLORS.hpFill;
      const ratio = Math.max(0, unit.hp / unit.stats.hp);
      ctx.fillRect(x - 18, y + 18, 36 * ratio, 5);

      ctx.fillStyle = COLORS.label;
      ctx.fillText(unit.job, x - 18, y - 18);
    });
  }

  drawOverlay(ctx, state) {
    ctx.fillStyle = "rgba(15, 22, 36, 0.7)";
    ctx.fillRect(0, 0, this.canvas.width, 26);
    ctx.fillStyle = COLORS.label;
    ctx.font = "12px 'Noto Sans JP', sans-serif";
    ctx.fillText(`ターン: ${state.turn}`, 12, 18);
    ctx.fillText(`西軍ユニット: ${state.units.filter((u) => u.side === "west" && u.hp > 0).length}`, 110, 18);
    ctx.fillText(`東軍ユニット: ${state.units.filter((u) => u.side === "east" && u.hp > 0).length}`, 260, 18);
  }

  focusUnit(_id) {
    // TODO: optional camera focus implementation
  }

  playReplay(frames) {
    console.info("Replay loaded:", frames.length, "frames");
  }

  onHover(handler) {
    this.hoverHandler = handler;
  }

  handleMouseMove(evt) {
    if (!this.hoverHandler) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    const gridX = Math.floor(x / TILE);
    const gridY = Math.floor(y / TILE);
    this.hoverHandler({ x: gridX, y: gridY });
  }
}

function toCenterPixels(position) {
  return {
    x: position.x * TILE + TILE / 2,
    y: position.y * TILE + TILE / 2
  };
}

function toTopLeftPixels(position) {
  return {
    x: position.x * TILE,
    y: position.y * TILE
  };
}