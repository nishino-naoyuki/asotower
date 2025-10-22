import { AssetLoader } from "./asset-loader.js";

const TILE = 32;
const OVERLAY_HEIGHT = 32;

const COLORS = {
  fallbackGround: "#0f1624",
  laneOverlay: "rgba(60, 86, 130, 0.35)",
  westZone: "rgba(54, 123, 251, 0.12)",
  eastZone: "rgba(251, 92, 92, 0.12)",
  grid: "rgba(37, 50, 74, 0.6)",
  wallFallback: "#8892a6",
  wallText: "#111827",
  unitWest: "#48a9ff",
  unitEast: "#ff6b6b",
  hpBg: "#111827",
  hpFill: "#4ade80",
  overlayBg: "rgba(15, 22, 36, 0.88)",
  overlayText: "#f8fafc"
};

export class Renderer {
  constructor(canvas, assetLoader = null) {
    console.log("Renderer constructor called params:", canvas, assetLoader);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.assetLoader = assetLoader ?? new AssetLoader();
    this.hoverHandler = null;
    canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
  }

  setAssetLoader(loader) {
    this.assetLoader = loader;
  }

  resizeToMap(map) {
    if (!map) return;
    this.canvas.width = map.width * TILE;
    this.canvas.height = map.height * TILE + OVERLAY_HEIGHT;
  }

  render(state) {
    const { ctx } = this;
    const map = state?.map;
    if (!map) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    if (this.canvas.width !== map.width * TILE || this.canvas.height !== map.height * TILE + OVERLAY_HEIGHT) {
      this.resizeToMap(map);
    }

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.translate(0, OVERLAY_HEIGHT);
    this.drawBackground(ctx, map);
    this.drawZones(ctx, map);
    this.drawWalls(ctx, map.walls);
    this.drawCastles(ctx, map.castles);
    this.drawUnits(ctx, state?.units ?? []);
    ctx.restore();

    this.drawOverlay(ctx, state);
  }

  drawBackground(ctx, map) {
    const ground = this.getImage("map_ground");
    for (let gx = 0; gx < map.width; gx++) {
      for (let gy = 0; gy < map.height; gy++) {
        const px = gx * TILE;
        const py = gy * TILE;
        if (ground) ctx.drawImage(ground, px, py, TILE, TILE);
        else {
          ctx.fillStyle = COLORS.fallbackGround;
          ctx.fillRect(px, py, TILE, TILE);
        }
      }
    }

    const laneRows = 8;
    const laneTop = Math.floor((map.height - laneRows) / 2);
    const path = this.getImage("map_path");
    for (let gx = 0; gx < map.width; gx++) {
      for (let gy = laneTop; gy < laneTop + laneRows; gy++) {
        const px = gx * TILE;
        const py = gy * TILE;
        if (path) ctx.drawImage(path, px, py, TILE, TILE);
        else {
          ctx.fillStyle = COLORS.laneOverlay;
          ctx.fillRect(px, py, TILE, TILE);
        }
      }
    }

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
    const wall = this.getImage("map_wall_intact");
    walls.forEach((cell) => {
      const { x, y } = toTopLeftPixels(cell);
      if (wall) ctx.drawImage(wall, x, y, TILE, TILE);
      else {
        ctx.fillStyle = COLORS.wallFallback;
        ctx.fillRect(x, y, TILE, TILE);
      }
      ctx.fillStyle = COLORS.wallText;
      ctx.font = "10px sans-serif";
      ctx.fillText(`${cell.hp}`, x + 6, y + 16);
    });
  }

  drawCastles(ctx, castles) {
    if (!castles) return;
    const draw = (key, hp, label) => {
      const img = this.getImage(key.image);
      const pos = castles[key.info];
      if (!pos) return;
      const center = toCenterPixels(pos);
      const width = TILE * 2;
      const height = TILE * 3;
      if (img) ctx.drawImage(img, center.x - width / 2, center.y - height / 2, width, height);
      else {
        ctx.fillStyle = key.fallback;
        ctx.fillRect(center.x - width / 2, center.y - height / 2, width, height);
      }
      ctx.fillStyle = COLORS.overlayText;
      ctx.font = "12px sans-serif";
      ctx.fillText(label, center.x - width / 2, center.y - height / 2 - 6);
      ctx.fillText(`HP:${hp}`, center.x - width / 2, center.y + height / 2 + 14);
    };

    draw(
      { image: "castle_west", info: "west", fallback: "#3a78ff" },
      castles.westHp,
      "西軍の城"
    );
    draw(
      { image: "castle_east", info: "east", fallback: "#ff6363" },
      castles.eastHp,
      "東軍の城"
    );
  }

  drawUnits(ctx, units) {
    units.forEach((unit) => {
      if (unit.hp <= 0) return;
      const center = toCenterPixels(unit.position);
      const jobSprite = this.getImage(`job_${unit.job}`);
      if (jobSprite) {
        ctx.drawImage(jobSprite, center.x - TILE * 0.75, center.y - TILE * 0.75, TILE * 1.5, TILE * 1.5);
      } else {
        ctx.fillStyle = unit.side === "west" ? COLORS.unitWest : COLORS.unitEast;
        ctx.beginPath();
        ctx.arc(center.x, center.y, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = COLORS.hpBg;
      ctx.fillRect(center.x - 18, center.y + 18, 36, 5);
      ctx.fillStyle = COLORS.hpFill;
      ctx.fillRect(center.x - 18, center.y + 18, 36 * Math.max(0, unit.hp / unit.stats.hp), 5);

      ctx.fillStyle = COLORS.overlayText;
      ctx.font = "11px sans-serif";
      ctx.fillText(unit.job, center.x - 18, center.y - 18);
    });
  }

  drawOverlay(ctx, state) {
    ctx.fillStyle = COLORS.overlayBg;
    ctx.fillRect(0, 0, this.canvas.width, OVERLAY_HEIGHT);
    ctx.fillStyle = COLORS.overlayText;
    ctx.font = "12px sans-serif";
    ctx.fillText(`ターン: ${state?.turn ?? 0}`, 12, 20);
    const westAlive = state?.units?.filter((u) => u.side === "west" && u.hp > 0).length ?? 0;
    const eastAlive = state?.units?.filter((u) => u.side === "east" && u.hp > 0).length ?? 0;
    ctx.fillText(`西軍: ${westAlive}`, 120, 20);
    ctx.fillText(`東軍: ${eastAlive}`, 200, 20);
  }

  playReplay(frames) {
    console.info("Replay frames:", frames?.length ?? 0);
  }

  focusUnit(_id) {}

  onHover(handler) {
    this.hoverHandler = handler;
  }

  handleMouseMove(evt) {
    if (!this.hoverHandler) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top - OVERLAY_HEIGHT;
    if (y < 0) return this.hoverHandler(null);
    this.hoverHandler({
      x: Math.floor(x / TILE),
      y: Math.floor(y / TILE)
    });
  }

  getImage(key) {
    return this.assetLoader?.get(key) ?? null;
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