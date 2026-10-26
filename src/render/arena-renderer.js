'use client';

import { ARENA_RADIUS, PHYSICS, POCKETS, POCKET_HALF_WIDTH } from '@/sim/constants';
import { colors } from '@/design/tokens';

// Render 2D da arena vista de cima (D-006). Só lê o estado da simulação; nunca o altera.
// Feito para GPU integrada (ARCHITECTURE.md §8): arena num canvas em cache, sprites rasterizados
// uma vez por tamanho, sem shadowBlur/filter, devicePixelRatio limitado e faíscas num pool fixo.

const MARGIN_MM = 24;
const MAX_DPR = 1.5;
const MAX_SPARKS = 160;
const PLAYER_COLORS = [colors.p1, colors.p2];

export class ArenaRenderer {
  constructor(canvas, spriteUrls) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.sprites = spriteUrls.map(() => null);
    this.images = spriteUrls.map((url, i) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => this.rasterize(i);
      img.src = url;
      return img;
    });
    this.sparks = Array.from({ length: MAX_SPARKS }, () => ({ life: 0 }));
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    this.cssW = Math.max(1, rect.width);
    this.cssH = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.cssW * dpr);
    this.canvas.height = Math.round(this.cssH * dpr);
    this.dpr = dpr;
    this.scale = (Math.min(this.cssW, this.cssH) / (2 * (ARENA_RADIUS + MARGIN_MM))) * dpr;
    this.buildArena();
    this.images.forEach((img, i) => img.complete && img.naturalWidth && this.rasterize(i));
  }

  // A arena não muda durante a partida: desenhada uma vez e reaproveitada a cada frame.
  buildArena() {
    const size = Math.ceil(2 * (ARENA_RADIUS + MARGIN_MM) * this.scale);
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    const s = this.scale;
    const mid = size / 2;
    g.translate(mid, mid);
    g.fillStyle = colors.tinta3;
    g.beginPath();
    g.arc(0, 0, (ARENA_RADIUS + 14) * s, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = colors.tinta2;
    g.beginPath();
    g.arc(0, 0, ARENA_RADIUS * s, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = colors.tinta3;
    g.lineWidth = Math.max(1, 2 * s);
    for (const f of [0.3, 0.6]) {
      g.beginPath();
      g.arc(0, 0, ARENA_RADIUS * f * s, 0, Math.PI * 2);
      g.stroke();
    }
    // Bolsos de saída: recortes na borda, marcados no amarelo de chamada (é onde sai o "Fora").
    for (const p of POCKETS) {
      g.fillStyle = colors.tinta;
      g.beginPath();
      g.arc(0, 0, (ARENA_RADIUS + 14) * s, p - POCKET_HALF_WIDTH, p + POCKET_HALF_WIDTH);
      g.arc(0, 0, (ARENA_RADIUS - 2) * s, p + POCKET_HALF_WIDTH, p - POCKET_HALF_WIDTH, true);
      g.closePath();
      g.fill();
      g.strokeStyle = colors.chamada;
      g.lineWidth = Math.max(1, 1.5 * s);
      g.beginPath();
      g.arc(0, 0, (ARENA_RADIUS - 2) * s, p - POCKET_HALF_WIDTH, p + POCKET_HALF_WIDTH);
      g.stroke();
    }
    g.fillStyle = colors.tinta3;
    g.beginPath();
    g.arc(0, 0, 10 * s, 0, Math.PI * 2);
    g.fill();
    this.arena = c;
  }

  rasterize(i) {
    const img = this.images[i];
    // O sprite do catálogo tem viewBox de 48 mm; desenhado no tamanho de tela de uma vez.
    const px = Math.max(8, Math.ceil(48 * this.scale));
    const c = document.createElement('canvas');
    c.width = px;
    c.height = px;
    c.getContext('2d').drawImage(img, 0, 0, px, px);
    this.sprites[i] = c;
  }

  spawnSparks(x, y, nx, ny, power) {
    const n = Math.min(18, 4 + Math.floor(power / 40));
    for (let k = 0, placed = 0; k < this.sparks.length && placed < n; k++) {
      const p = this.sparks[k];
      if (p.life > 0) continue;
      // Faíscas saem tangentes ao choque; aleatoriedade só visual, fora da simulação.
      const side = Math.random() < 0.5 ? 1 : -1;
      const a = Math.atan2(ny, nx) + side * (Math.PI / 2) + (Math.random() - 0.5) * 1.2;
      const speed = 120 + Math.random() * power * 0.8;
      Object.assign(p, { x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 0.18 + Math.random() * 0.22, hot: Math.random() < 0.5 });
      placed++;
    }
  }

  draw(prev, curr, alpha, dt) {
    const { ctx, scale } = this;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = colors.tinta;
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(this.arena, (w - this.arena.width) / 2, (h - this.arena.height) / 2);
    ctx.translate(w / 2, h / 2);

    curr.beys.forEach((b, i) => {
      if (b.state === 'burst') return;
      const p = prev?.beys[i] ?? b;
      const x = (p.x + (b.x - p.x) * alpha) * scale;
      const y = (p.y + (b.y - p.y) * alpha) * scale;
      const angle = p.angle + (b.angle - p.angle) * alpha;
      let k = 1;
      if (b.state === 'out') {
        const beyond = Math.hypot(b.x, b.y) - ARENA_RADIUS;
        k = Math.max(0, 1 - beyond / 120);
        if (k <= 0) return;
      }
      // No pulo a bey cresce e volta, como se subisse em direção à câmera.
      if (b.air > 0) k *= 1 + 0.35 * Math.sin(Math.PI * (1 - b.air / PHYSICS.jumpTime));
      const r = b.r * scale * k;
      ctx.globalAlpha = k;
      // Anel da cor do jogador sob a bey: identifica P1/P2 junto com a etiqueta do HUD.
      ctx.strokeStyle = PLAYER_COLORS[i];
      ctx.lineWidth = Math.max(2, 3 * this.dpr);
      ctx.beginPath();
      ctx.arc(x, y, r + 4 * this.dpr, 0, Math.PI * 2);
      ctx.stroke();
      const sprite = this.sprites[i];
      if (sprite) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        const size = sprite.width * k;
        ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
        ctx.restore();
      } else {
        ctx.fillStyle = colors.papel;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });

    ctx.lineWidth = Math.max(1, 1.5 * this.dpr);
    for (const s of this.sparks) {
      if (s.life <= 0) continue;
      s.life -= dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      ctx.strokeStyle = s.hot ? colors.chamada : colors.papel;
      ctx.beginPath();
      ctx.moveTo(s.x * scale, s.y * scale);
      ctx.lineTo((s.x - s.vx * 0.03) * scale, (s.y - s.vy * 0.03) * scale);
      ctx.stroke();
    }
  }
}
