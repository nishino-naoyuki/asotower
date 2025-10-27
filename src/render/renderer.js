import { AssetLoader } from "./asset-loader.js?v=202510231119";

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
  unitWest: "#ff6b6b",
  unitEast: "#4c9dff",
  hpBg: "#111827",
  hpFillWest: "#f87171",
  hpFillEast: "#60a5fa",
  overlayBg: "rgba(15, 22, 36, 0.88)",
  overlayText: "#f8fafc",
  victoryFill: "#fcd34d",
  victoryStroke: "rgba(10, 15, 25, 0.8)",
  attackTraceMelee: "rgba(252, 211, 77, 0.9)",
  attackTraceRanged: "rgba(147, 197, 253, 0.9)",
  attackTraceSiege: "rgba(248, 113, 113, 0.9)",
  attackTraceOutline: "rgba(15, 23, 42, 0.9)",
  impactRing: "rgba(239, 68, 68, 0.8)"
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
    this.drawEffects(ctx, state?.effects ?? []);
    if (state?.status?.finished) {
      this.drawVictory(ctx, state.status.winner);
    }
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
    const zoneTiles = Math.floor(map.width / 2);
    const zoneWidth = zoneTiles * TILE;
    ctx.fillStyle = COLORS.westZone;
    ctx.fillRect(0, 0, zoneWidth, map.height * TILE);
    ctx.fillStyle = COLORS.eastZone;
    ctx.fillRect(map.width * TILE - zoneWidth, 0, zoneWidth, map.height * TILE);
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
      const unitColor = unit.side === "west" ? COLORS.unitWest : COLORS.unitEast;
      ctx.fillStyle = unitColor;
      ctx.beginPath();
      ctx.arc(center.x, center.y, 16, 0, Math.PI * 2);
      ctx.fill();

      if (jobSprite) {
        ctx.drawImage(jobSprite, center.x - TILE * 0.75, center.y - TILE * 0.75, TILE * 1.5, TILE * 1.5);
      } else {
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(center.x, center.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(unit.job.slice(0, 2).toUpperCase(), center.x, center.y);
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
      }

      ctx.fillStyle = COLORS.hpBg;
      ctx.fillRect(center.x - 18, center.y + 18, 36, 5);
      const hpColor = unit.side === "west" ? COLORS.hpFillWest : COLORS.hpFillEast;
      ctx.fillStyle = hpColor;
      ctx.fillRect(center.x - 18, center.y + 18, 36 * Math.max(0, unit.hp / unit.stats.hp), 5);

      const label = unit.name ?? unit.job;
      ctx.fillStyle = COLORS.overlayText;
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(label, center.x, center.y - 22);
      ctx.textAlign = "start";
      ctx.textBaseline = "alphabetic";
    });
  }

  drawEffects(ctx, effects = []) {
    if (!effects.length) return;
    const now = Date.now();

    effects.forEach((effect) => {
      const lifespan = effect.durationMs ?? 600;
      const elapsed = now - effect.createdAt;
      if (elapsed < 0 || elapsed >= lifespan) return;

      const progress = Math.min(1, Math.max(0, elapsed / lifespan));
      const alpha = 1 - progress;
      if (alpha <= 0) return;

      ctx.save();
      ctx.globalAlpha = alpha;

      switch (effect.kind) {
        case "attack":
          this.drawAttackTrace(ctx, effect, progress);
          this.drawAttackImpact(ctx, effect, progress);
          break;
        case "impactRing":
          this.drawImpactRing(ctx, effect, progress);
          break;
        case "skill":
        case "effect":
        default:
          this.drawStockEffect(ctx, effect, progress);
          break;
      }

      ctx.restore();
    });
  }

  drawStockEffect(ctx, effect, progress) {
    //console.log("drawStockEffect called with params:", ctx, effect, progress);
    const center = toCenterPixels(effect.position);
    //const imageKey = effect.kind === "skill" ? "effect_skill_flash" : "effect_impact";
    const imageKey = "effect_skill_flash";
    const sprite = this.getImage(imageKey);
    const baseSize = effect.kind === "skill" ? TILE * 3 : TILE * 2;
    const scale = effect.kind === "skill" ? 1 + 0.25 * Math.sin(progress * Math.PI) : 1 + 0.2 * progress;
    const size = baseSize * scale;

    if (sprite) {
      ctx.drawImage(sprite, center.x - size / 2, center.y - size / 2, size, size);
    } else {
      const radius = (baseSize / 2) * scale;
      ctx.fillStyle = effect.kind === "skill" ? "rgba(212, 233, 255, 0.9)" : "rgba(255, 199, 141, 0.9)";
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawAttackTrace(ctx, effect, progress) {
    const start = effect.source ? toCenterPixels(effect.source) : toCenterPixels(effect.position);
    const end = effect.target ? toCenterPixels(effect.target) : toCenterPixels(effect.position);
    const variant = effect.variant ?? "ranged";
    const colors = {
      melee: COLORS.attackTraceMelee,
      ranged: COLORS.attackTraceRanged,
      siege: COLORS.attackTraceSiege
    };
    const color = colors[variant] ?? COLORS.attackTraceRanged;
    const width = variant === "melee" ? 12 : variant === "siege" ? 10 : 6;
    const wobble = variant === "ranged" ? Math.sin(progress * Math.PI * 2) * 6 : 0;

    ctx.strokeStyle = COLORS.attackTraceOutline;
    ctx.lineWidth = width + 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y + wobble);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y + wobble);
    ctx.stroke();

    const headSize = width * 1.6;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headSize * Math.cos(angle - Math.PI / 6), end.y - headSize * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(end.x - headSize * Math.cos(angle + Math.PI / 6), end.y - headSize * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  drawImpactRing(ctx, effect, progress) {
    const center = toCenterPixels(effect.position);
    const maxRadius = TILE * 1.2;
    const radius = maxRadius * (0.4 + 0.6 * progress);
    const lineWidth = Math.max(3, 10 * (1 - progress));

    ctx.strokeStyle = COLORS.impactRing;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawAttackImpact(ctx, effect, progress) {
    const target = effect.target ? toCenterPixels(effect.target) : toCenterPixels(effect.position);
    const sprite = this.getImage("effect_impact");
    const baseSize = TILE * 2.2;
    const scale = 1 + 0.4 * (1 - Math.abs(Math.cos(progress * Math.PI)));
    const size = baseSize * scale;
    const alpha = 1 - progress;

    ctx.save();
    ctx.globalAlpha *= alpha;
    if (sprite) {
      ctx.drawImage(sprite, target.x - size / 2, target.y - size / 2, size, size);
    } else {
      const radius = size / 2;
      const gradient = ctx.createRadialGradient(target.x, target.y, radius * 0.2, target.x, target.y, radius);
      gradient.addColorStop(0, "rgba(252, 211, 77, 0.95)");
      gradient.addColorStop(0.65, "rgba(248, 113, 113, 0.6)");
      gradient.addColorStop(1, "rgba(15, 23, 42, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(target.x, target.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawVictory(ctx, winner) {
    if (!winner) return;
      const message = winner === "引き分け" ? "引き分け!!" : `${winner}勝利!!`;
    const mapWidth = this.canvas.width;
    const mapHeight = this.canvas.height - OVERLAY_HEIGHT;
    const centerX = mapWidth / 2;
    const centerY = mapHeight / 2;
    const fontSize = Math.floor(Math.min(mapWidth, mapHeight) / 5.5);
    const fontFamily = '"Yuji Syuku", "Yuji Mai", "Hiragino Mincho ProN", serif';

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(15, 22, 36, 0.4)";
    const bannerWidth = mapWidth * 0.72;
    const bannerHeight = fontSize * 1.4;
    ctx.fillRect(centerX - bannerWidth / 2, centerY - bannerHeight / 2, bannerWidth, bannerHeight);

    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = COLORS.victoryStroke;
    ctx.lineWidth = Math.max(6, fontSize / 8);
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.strokeText(message, centerX, centerY);
    ctx.fillStyle = COLORS.victoryFill;
    ctx.fillText(message, centerX, centerY);
    ctx.restore();
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