const DEFAULT_BASE = "./assets/images";

const DEFAULT_MANIFEST = {
  castle_west: "castle/fort_west.png",
  castle_west_damaged: "castle/fort_west_damaged.png",
  castle_east: "castle/fort_east.png",
  castle_east_damaged: "castle/fort_east_damaged.png",
  job_soldier: "jobs/soldier.png",
  job_lancer: "jobs/lancer.png",
  job_archer: "jobs/archer.png",
  job_mage: "jobs/mage.png",
  job_healer: "jobs/healer.png",
  job_guardian: "jobs/guardian.png",
  job_assassin: "jobs/assassin.png",
  job_engineer: "jobs/engineer.png",
  job_summoner: "jobs/summoner.png",
  job_scout: "jobs/scout.png",
  map_ground: "map/ground.png",
  map_path: "map/path.png",
  map_wall_intact: "map/wall_intact.png",
  map_wall_damaged: "map/wall_damaged.png",
  effect_skill_flash: "sfx/skill_flash.png",
  effect_impact: "sfx/impact.png",
  ui_button_play: "ui/button_play.png",
  ui_button_pause: "ui/button_pause.png",
  ui_button_step: "ui/button_step.png",
  ui_hp_bar_bg: "ui/hp_bar_bg.png",
  ui_hp_bar_fill: "ui/hp_bar_fill.png",
  ui_skill_icon: "ui/skill_icon.png"
};

export class AssetLoader {
  constructor(basePath = DEFAULT_BASE, manifest = DEFAULT_MANIFEST) {
    this.basePath = basePath.replace(/\/$/, "");
    this.images = new Map();
    this.manifest = manifest;
    this.ready = this.preloadDefault();
  }

  async preloadDefault() {
    await this.preload(this.manifest);
  }

  async preload(manifest = {}) {
    await Promise.all(
      Object.entries(manifest).map(([key, path]) => this.loadImage(key, path))
    );
  }

  loadImage(key, relativePath) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        resolve({ key, ok: true });
      };
      img.onerror = () => {
        console.warn(`画像読み込み失敗: ${relativePath}`);
        this.images.set(key, this.createFallback(key));
        resolve({ key, ok: false });
      };
      img.src = this.resolvePath(relativePath);
    });
  }

  get(key) {
    return this.images.get(key) ?? null;
  }

  resolvePath(relativePath) {
    if (/^https?:\/\//.test(relativePath)) return relativePath;
    return `${this.basePath}/${relativePath}`.replace(/([^:]\/)\/+/g, "$1");
  }

  createFallback(key) {
    const canvas = document.createElement("canvas");
    const width =
      key.startsWith("castle_") ? 128 :
      key.startsWith("ui_button") ? 96 :
      key.startsWith("ui_hp_bar") ? 128 :
      64;
    const height =
      key.startsWith("castle_") ? 128 :
      key.startsWith("ui_button") ? 32 :
      key.startsWith("ui_hp_bar") ? 16 :
      64;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#475569";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = `${Math.floor(height / 3)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N/A", width / 2, height / 2);

    return canvas;
  }
}