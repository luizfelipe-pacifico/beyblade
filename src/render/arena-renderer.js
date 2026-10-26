'use client';

import { ARENA_RADIUS, BOWL, PHYSICS, POCKETS, POCKET_HALF_WIDTH, bowlHeight } from '@/sim/constants';
import { colors } from '@/design/tokens';
import { desenharCenario } from './cenario-fundo';

// Render 2D da arena vista de cima (D-006). Só lê o estado da simulação; nunca o altera.
// Visual realista no estilo do estádio da Burst (D-029), feito para GPU integrada (ARCHITECTURE.md §8):
// tudo o que tem degradê, brilho ou desfoque é desenhado UMA vez em canvas de cache (arena, sombra,
// halo); por frame só há drawImage, arcos e linhas. devicePixelRatio limitado e faíscas num pool fixo.

const MARGIN_MM = 34;
// Com cenário do anime, sobra mais chão em volta do prato para o lugar aparecer (D-039).
const MARGIN_CENARIO_MM = 80;
const MAX_DPR = 1.5;
const MAX_SPARKS = 160;
const TRAIL = 14;
const PLAYER_COLORS = [colors.p1, colors.p2];
const FLASH_SECONDS = 0.3;
const SUMMON_SECONDS = 0.8;
const IMPACT_SECONDS = 0.14;
const MAX_IMPACTS = 8;
const FLAMES = 11;
const SHARDS = 18;
const SHARD_SECONDS = 0.7;
const MAX_HEIGHT = bowlHeight(ARENA_RADIUS);

// Plástico azul translúcido do estádio da Burst (BEY_BEHAVIOR.md, aparência da arena).
const ESTADIO = {
  fundo: '#9fd6ff',
  meio: '#3d8fe6',
  borda: '#0f4fae',
  parede: '#0a2f6e',
  paredeLuz: '#5aa9ff',
  paredeSombra: '#061a3d',
  ridge: 'rgba(225, 245, 255, 0.85)',
  linhas: 'rgba(255, 255, 255, 0.16)',
  bolso: '#030a18',
};

function makeGlow(color, size = 128, core = 0) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, color);
  if (core) grad.addColorStop(core, color);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

// Volume do metal por cima do sprite (que é chapado): luz em cima à esquerda, sombra embaixo à
// direita e borda escura de contato. Não gira com a bey, porque a luz é da cena.
function makeVolume(size = 128) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  const m = size / 2;
  const grad = g.createRadialGradient(m * 0.62, m * 0.55, 0, m, m, m);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
  grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.06)');
  grad.addColorStop(0.75, 'rgba(0, 0, 0, 0.12)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  g.fillStyle = grad;
  g.beginPath();
  g.arc(m, m, m - 1, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = 'rgba(4, 10, 24, 0.85)';
  g.lineWidth = size * 0.035;
  g.stroke();
  return c;
}

export class ArenaRenderer {
  // cores: cor da fera de cada jogador (aura de fogo e brilho da invocação, D-036).
  // cenario: { slug, tema } de src/content/cenarios.js; sem ele, o estádio padrão da Burst.
  constructor(canvas, spriteUrls, cores = [], cenario = null) {
    this.cenario = cenario;
    this.tema = cenario?.tema ?? {};
    this.margem = cenario && this.tema.cenario !== 'estadio' ? MARGIN_CENARIO_MM : MARGIN_MM;
    // Estádio do GBA: a tigela é a imagem extraída da ROM; redesenha a arena quando ela carregar.
    if (this.tema.tigelaImagem) {
      this.tigelaImg = new Image();
      this.tigelaImg.onload = () => this.buildArena();
      this.tigelaImg.src = this.tema.tigelaImagem;
    }
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
    this.trails = [[], []];
    this.t = 0;
    this.flashes = [0, 0];
    this.invocacoes = [0, 0];
    this.impactos = Array.from({ length: MAX_IMPACTS }, () => ({ life: 0 }));
    // Posição de cada bey em px de CSS do canvas, para a camada da fera (DOM) acompanhar.
    this.posicoes = [null, null];
    // Cacos do escudo quebrando (D-042), num pool fixo.
    this.cacos = Array.from({ length: SHARDS * 2 }, () => ({ life: 0 }));
    this.cores = [0, 1].map((i) => cores[i] ?? colors.ataque);
    this.reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    // Halos e sombra pré-renderizados (nada de shadowBlur por frame na GPU integrada).
    this.glowAtaque = makeGlow(colors.ataque);
    this.glowFaisca = makeGlow('rgba(255, 220, 140, 0.9)', 32);
    this.sombra = makeGlow('rgba(0, 8, 30, 0.6)', 128, 0.45);
    this.volume = makeVolume();
    this.glowFera = this.cores.map((c) => makeGlow(c));
    this.glowBranco = makeGlow('rgba(255, 255, 255, 0.95)', 64);
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
    this.scale = (Math.min(this.cssW, this.cssH) / (2 * (ARENA_RADIUS + this.margem))) * dpr;
    this.buildFundo();
    this.buildArena();
    this.images.forEach((img, i) => img.complete && img.naturalWidth && this.rasterize(i));
  }

  // Chão do lugar em volta do prato, do tamanho do canvas inteiro.
  buildFundo() {
    const c = document.createElement('canvas');
    c.width = this.canvas.width;
    c.height = this.canvas.height;
    const g = c.getContext('2d');
    g.translate(c.width / 2, c.height / 2);
    desenharCenario(g, this.tema, this.cenario?.slug, { w: c.width, h: c.height, R: ARENA_RADIUS * this.scale, s: this.scale });
    this.fundo = c;
  }

  // A arena não muda durante a partida: desenhada uma vez, com todo o volume, e reaproveitada.
  buildArena() {
    if (!this.scale) return;
    const tema = this.tema;
    const size = Math.ceil(2 * (ARENA_RADIUS + this.margem) * this.scale);
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    const s = this.scale;
    const R = ARENA_RADIUS * s;
    const parede = (tema.paredeAlta ? 40 : 26) * s;
    g.translate(size / 2, size / 2);
    // Sombra do prato no chão do cenário (luz de cima à esquerda).
    g.fillStyle = 'rgba(0, 0, 0, 0.35)';
    g.beginPath();
    g.arc(12 * s, 16 * s, R + parede + 6 * s, 0, Math.PI * 2);
    g.fill();

    // Parede: anel grosso com luz vindo de cima à esquerda (mesma luz da arte própria, ART.md).
    const luz = g.createLinearGradient(-R, -R, R, R);
    // A parede acompanha o material do cenário; sem tema, o plástico azul da Burst.
    const [pLuz, pMeio, pSombra] = tema.tigela ? [tema.tigela[1], tema.tigela[2], '#05070f'] : [ESTADIO.paredeLuz, ESTADIO.parede, ESTADIO.paredeSombra];
    luz.addColorStop(0, pLuz);
    luz.addColorStop(0.45, pMeio);
    luz.addColorStop(1, pSombra);
    g.fillStyle = luz;
    g.beginPath();
    g.arc(0, 0, R + parede, 0, Math.PI * 2);
    g.fill();
    if (tema.boia) {
      // Piscina: a parede é uma boia inflável em gomos vermelhos e brancos.
      for (let k = 0; k < 16; k++) {
        g.fillStyle = k % 2 ? '#f5f5f5' : '#e5413b';
        g.beginPath();
        g.arc(0, 0, R + parede, (k / 16) * Math.PI * 2, ((k + 1) / 16) * Math.PI * 2);
        g.arc(0, 0, R, ((k + 1) / 16) * Math.PI * 2, (k / 16) * Math.PI * 2, true);
        g.closePath();
        g.fill();
      }
      g.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      g.lineWidth = 4 * s;
      g.beginPath();
      g.arc(-3 * s, -3 * s, R + parede * 0.55, Math.PI * 0.95, Math.PI * 1.6);
      g.stroke();
    }
    if (tema.grade) {
      // Estádio da BEGA: grades que sobem em volta do prato.
      g.strokeStyle = 'rgba(220, 210, 255, 0.75)';
      g.lineWidth = Math.max(1.5, 3 * s);
      for (let k = 0; k < 48; k++) {
        const a = (k / 48) * Math.PI * 2;
        g.beginPath();
        g.moveTo(Math.cos(a) * R, Math.sin(a) * R);
        g.lineTo(Math.cos(a) * (R + parede), Math.sin(a) * (R + parede));
        g.stroke();
      }
    }

    // Tigela: claro e translúcido no fundo, saturado e escuro na borda, como o plástico do brinquedo.
    const [fundo, meio, borda] = tema.tigela ?? [ESTADIO.fundo, ESTADIO.meio, ESTADIO.borda];
    const tigela = g.createRadialGradient(-0.18 * R, -0.22 * R, 0.05 * R, 0, 0, R);
    tigela.addColorStop(0, fundo);
    tigela.addColorStop(0.45, meio);
    tigela.addColorStop(1, borda);
    g.fillStyle = tigela;
    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.fill();
    if (this.tigelaImg?.complete && this.tigelaImg.naturalWidth) {
      g.save();
      g.beginPath();
      g.arc(0, 0, R, 0, Math.PI * 2);
      g.clip();
      g.imageSmoothingEnabled = false;
      g.drawImage(this.tigelaImg, -R, -R, 2 * R, 2 * R);
      g.restore();
    }

    // Curvas de nível: anéis em alturas iguais ficam mais juntos onde a rampa é mais íngreme.
    g.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    g.lineWidth = Math.max(1, 1.2 * s);
    for (let k = 1; k <= 7; k++) {
      const alvo = (MAX_HEIGHT * k) / 8;
      let lo = 0;
      let hi = ARENA_RADIUS;
      for (let it = 0; it < 30; it++) {
        const mid = (lo + hi) / 2;
        if (bowlHeight(mid) < alvo) lo = mid;
        else hi = mid;
      }
      g.beginPath();
      g.arc(0, 0, lo * s, 0, Math.PI * 2);
      g.stroke();
    }

    // Linhas radiais finas e círculo central, como as marcas moldadas no estádio.
    g.strokeStyle = ESTADIO.linhas;
    g.lineWidth = Math.max(1, 1.5 * s);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      g.beginPath();
      g.moveTo(Math.cos(a) * 0.16 * R, Math.sin(a) * 0.16 * R);
      g.lineTo(Math.cos(a) * 0.78 * R, Math.sin(a) * 0.78 * R);
      g.stroke();
    }
    g.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    g.lineWidth = Math.max(1, 2 * s);
    g.beginPath();
    g.arc(0, 0, 0.12 * R, 0, Math.PI * 2);
    g.stroke();

    // Tornado ridge: anel claro perto da borda, com brilho (o desfoque aqui roda uma vez só).
    g.save();
    g.shadowColor = 'rgba(160, 230, 255, 0.9)';
    g.shadowBlur = 10 * s;
    g.strokeStyle = ESTADIO.ridge;
    g.lineWidth = Math.max(2, 4 * s);
    g.beginPath();
    g.arc(0, 0, 0.86 * R, 0, Math.PI * 2);
    g.stroke();
    g.restore();

    // Sombra da parede caindo para dentro da tigela (oclusão), mais forte em baixo à direita.
    const oclusao = g.createRadialGradient(0.06 * R, 0.08 * R, 0.82 * R, 0, 0, R);
    oclusao.addColorStop(0, 'rgba(0, 10, 40, 0)');
    oclusao.addColorStop(1, 'rgba(0, 10, 40, 0.45)');
    g.fillStyle = oclusao;
    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.fill();

    // Bolsos de saída: aberturas escuras na parede, com borda de chamada marcando o "Fora".
    // Parede alta (sem ring out, D-039): não há bolso.
    for (const p of tema.paredeAlta ? [] : POCKETS) {
      g.fillStyle = ESTADIO.bolso;
      g.beginPath();
      g.arc(0, 0, R + parede, p - POCKET_HALF_WIDTH, p + POCKET_HALF_WIDTH);
      g.arc(0, 0, R - 2 * s, p + POCKET_HALF_WIDTH, p - POCKET_HALF_WIDTH, true);
      g.closePath();
      g.fill();
      g.strokeStyle = colors.chamada;
      g.lineWidth = Math.max(1, 2 * s);
      g.beginPath();
      g.arc(0, 0, R - 2 * s, p - POCKET_HALF_WIDTH, p + POCKET_HALF_WIDTH);
      g.stroke();
    }

    // Reflexo especular do plástico: um brilho largo e suave em cima à esquerda.
    const reflexo = g.createRadialGradient(-0.42 * R, -0.5 * R, 0, -0.42 * R, -0.5 * R, 0.55 * R);
    reflexo.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    reflexo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    g.fillStyle = reflexo;
    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.fill();

    // Borda clara no topo da parede.
    g.strokeStyle = 'rgba(200, 230, 255, 0.55)';
    g.lineWidth = Math.max(1, 2 * s);
    g.beginPath();
    g.arc(0, 0, R + parede - 1 * s, 0, Math.PI * 2);
    g.stroke();
    this.arena = c;
  }

  rasterize(i) {
    const img = this.images[i];
    // O sprite do catálogo tem viewBox de 48 mm; desenhado no tamanho de tela de uma vez.
    const px = Math.max(8, Math.ceil(48 * this.scale * 1.2));
    const c = document.createElement('canvas');
    c.width = px;
    c.height = px;
    c.getContext('2d').drawImage(img, 0, 0, px, px);
    this.sprites[i] = c;
  }

  spawnSparks(x, y, nx, ny, power) {
    const imp = this.impactos.find((p) => p.life <= 0) ?? this.impactos[0];
    Object.assign(imp, { x, y, life: IMPACT_SECONDS, size: Math.min(1, power / 900) });
    const n = Math.min(26, 6 + Math.floor(power / 45));
    for (let k = 0, placed = 0; k < this.sparks.length && placed < n; k++) {
      const p = this.sparks[k];
      if (p.life > 0) continue;
      // Faíscas saem tangentes ao choque; aleatoriedade só visual, fora da simulação.
      const side = Math.random() < 0.5 ? 1 : -1;
      const a = Math.atan2(ny, nx) + side * (Math.PI / 2) + (Math.random() - 0.5) * 1.2;
      // Velocidade limitada: pancada forte solta mais faíscas, não faíscas que saem da arena.
      const speed = 180 + Math.random() * Math.min(power, 800) * 0.6;
      Object.assign(p, { x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 0.15 + Math.random() * 0.2, hot: Math.random() < 0.6 });
      placed++;
    }
  }

  // "Estalo" da carga cheia do ataque: um anel que se expande uma vez em volta da bey.
  flash(slot) {
    this.flashes[slot] = FLASH_SECONDS;
  }

  // A fera saiu: clarão com raios (a coluna de luz vista de cima) na cor da fera.
  invocar(slot) {
    this.invocacoes[slot] = SUMMON_SECONDS;
  }

  posicao(slot) {
    return this.posicoes[slot];
  }

  // Bey "pegando fogo" com a fera fora: línguas de fogo na cor da fera em volta da borda,
  // tremulando e girando com ela, mais o chip brilhando no centro. Tudo com mistura aditiva.
  drawFogo(x, y, r, angle, spin, i) {
    const { ctx } = this;
    const t = this.t;
    const g = r * 4.2;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.55 + 0.15 * Math.sin(t * 17);
    ctx.drawImage(this.glowFera[i], x - g / 2, y - g / 2, g, g);
    const giro = this.reduceMotion ? 0 : angle * 0.35;
    for (let k = 0; k < FLAMES; k++) {
      const a = giro + (k / FLAMES) * Math.PI * 2;
      const treme = this.reduceMotion ? 0.7 : 0.55 + 0.45 * Math.abs(Math.sin(t * (9 + k) + k * 1.7));
      const comp = r * (0.55 + 0.75 * treme) * (0.6 + 0.4 * spin);
      const larg = 0.32;
      ctx.globalAlpha = 0.45 + 0.35 * treme;
      ctx.fillStyle = k % 2 ? this.cores[i] : colors.chamada;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a - larg) * r * 0.9, y + Math.sin(a - larg) * r * 0.9);
      // A ponta da chama vai para trás do giro, como o fogo puxado pelo vento.
      const pa = a - 0.35 * spin;
      ctx.quadraticCurveTo(x + Math.cos(a) * (r + comp * 0.6), y + Math.sin(a) * (r + comp * 0.6), x + Math.cos(pa) * (r + comp), y + Math.sin(pa) * (r + comp));
      ctx.lineTo(x + Math.cos(a + larg) * r * 0.9, y + Math.sin(a + larg) * r * 0.9);
      ctx.closePath();
      ctx.fill();
    }
    const chip = r * (0.9 + 0.2 * Math.sin(t * 10));
    ctx.globalAlpha = 0.9;
    ctx.drawImage(this.glowBranco, x - chip / 2, y - chip / 2, chip, chip);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  drawInvocacao(x, y, r, i) {
    const { ctx, dpr } = this;
    const f = this.invocacoes[i] / SUMMON_SECONDS;
    const p = 1 - f;
    ctx.globalCompositeOperation = 'lighter';
    const g = r * (3 + 9 * p);
    ctx.globalAlpha = f;
    ctx.drawImage(this.glowBranco, x - g / 2, y - g / 2, g, g);
    ctx.drawImage(this.glowFera[i], x - g, y - g, g * 2, g * 2);
    if (!this.reduceMotion) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 3 * dpr;
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2 + p;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * r * (1 + 2 * p), y + Math.sin(a) * r * (1 + 2 * p));
        ctx.lineTo(x + Math.cos(a) * r * (2 + 7 * p), y + Math.sin(a) * r * (2 + 7 * p));
        ctx.stroke();
      }
    }
    ctx.strokeStyle = this.cores[i];
    ctx.lineWidth = 5 * dpr;
    ctx.beginPath();
    ctx.arc(x, y, r * (1.2 + 6 * p), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  // Carga do ataque (✕ segurado): halo laranja que cresce e pulsa mais rápido com a força, e um anel
  // serrilhado girando que fecha quando a carga enche. Forma e movimento diferentes da defesa.
  drawCharge(x, y, r, c) {
    const { ctx, dpr } = this;
    const pulso = this.reduceMotion ? 1 : 0.85 + 0.15 * Math.sin(this.t * (8 + 14 * c));
    const size = r * 2 * (1.6 + 0.9 * c);
    ctx.globalAlpha = (0.25 + 0.55 * c) * pulso;
    ctx.drawImage(this.glowAtaque, x - size / 2, y - size / 2, size, size);
    ctx.globalAlpha = 1;
    const raio = r + (6 + 10 * c) * dpr;
    const giro = this.reduceMotion ? 0 : this.t * (4 + 10 * c);
    ctx.strokeStyle = colors.ataque;
    ctx.lineWidth = (2 + 3 * c) * dpr;
    const dentes = 12;
    const cheio = c >= 1 ? 1 : 0.55;
    for (let k = 0; k < dentes; k++) {
      const a0 = giro + (k / dentes) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(x, y, raio, a0, a0 + ((Math.PI * 2) / dentes) * cheio);
      ctx.stroke();
    }
  }

  // Escudo quebrou: cacos de vidro do hexágono saem girando e caem, com um clarão ciano.
  quebrarEscudo(slot) {
    const p = this.posicoes[slot];
    if (!p) return;
    const x = p.x * this.dpr - this.canvas.width / 2;
    const y = p.y * this.dpr - this.canvas.height / 2;
    const raio = p.r * this.dpr + 9 * this.dpr;
    for (let k = 0, n = 0; k < this.cacos.length && n < SHARDS; k++) {
      const c = this.cacos[k];
      if (c.life > 0) continue;
      const a = (n / SHARDS) * Math.PI * 2 + Math.random() * 0.3;
      const v = (180 + Math.random() * 260) * this.dpr;
      Object.assign(c, {
        x: x + Math.cos(a) * raio,
        y: y + Math.sin(a) * raio,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 18,
        tam: (5 + Math.random() * 9) * this.dpr,
        life: SHARD_SECONDS,
      });
      n++;
    }
    const imp = this.impactos.find((q) => q.life <= 0) ?? this.impactos[0];
    Object.assign(imp, { x: x / this.scale, y: y / this.scale, life: IMPACT_SECONDS * 1.6, size: 1 });
  }

  // Defesa (○ segurado): escudo hexagonal ciano, sólido e parado; fica mais grosso conforme firma.
  // A vida do escudo aparece como transparência e rachaduras (D-042).
  drawGuard(x, y, r, g, vida = 1) {
    const { ctx, dpr } = this;
    const raio = r + 9 * dpr;
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
      const px = x + Math.cos(a) * raio;
      const py = y + Math.sin(a) * raio;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.globalAlpha = (0.12 + 0.22 * g) * (0.5 + 0.5 * vida);
    ctx.fillStyle = colors.defesa;
    ctx.fill();
    ctx.globalAlpha = 0.45 + 0.55 * vida;
    ctx.strokeStyle = colors.defesa;
    ctx.lineWidth = (2 + 4 * g) * dpr;
    ctx.stroke();
    if (vida < 0.75) {
      // Rachaduras em zigue-zague saindo de um ponto de impacto; mais rachado quanto menos vida.
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = Math.max(1, 1.5 * dpr);
      const n = vida < 0.4 ? 5 : 3;
      for (let k = 0; k < n; k++) {
        const a = k * 2.1 + 0.4;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * raio * 0.2, y + Math.sin(a) * raio * 0.2);
        ctx.lineTo(x + Math.cos(a + 0.25) * raio * 0.55, y + Math.sin(a + 0.25) * raio * 0.55);
        ctx.lineTo(x + Math.cos(a - 0.1) * raio * 0.95, y + Math.sin(a - 0.1) * raio * 0.95);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  drawCacos(dt) {
    const { ctx } = this;
    for (const c of this.cacos) {
      if (c.life <= 0) continue;
      c.life -= dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vx *= 0.94;
      c.vy *= 0.94;
      c.rot += c.vr * dt;
      ctx.globalAlpha = Math.max(0, c.life / SHARD_SECONDS);
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = 'rgba(180, 245, 250, 0.85)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -c.tam);
      ctx.lineTo(c.tam * 0.7, c.tam * 0.6);
      ctx.lineTo(-c.tam * 0.5, c.tam * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  draw(prev, curr, alpha, dt) {
    const { ctx, scale, dpr } = this;
    this.t += dt;
    this.flashes = this.flashes.map((f) => Math.max(0, f - dt));
    this.invocacoes = this.invocacoes.map((f) => Math.max(0, f - dt));
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.fundo, 0, 0);
    ctx.drawImage(this.arena, (w - this.arena.width) / 2, (h - this.arena.height) / 2);
    ctx.translate(w / 2, h / 2);

    curr.beys.forEach((b, i) => {
      const p = prev?.beys[i] ?? b;
      const wx = p.x + (b.x - p.x) * alpha;
      const wy = p.y + (b.y - p.y) * alpha;
      const x = wx * scale;
      const y = wy * scale;
      const angle = p.angle + (b.angle - p.angle) * alpha;
      let k = 1;
      if (b.state === 'out') {
        const beyond = Math.hypot(b.x, b.y) - ARENA_RADIUS;
        k = Math.max(0, 1 - beyond / 160);
        if (k <= 0) return;
      }
      // Altura na rampa: mais alta, mais perto da câmera (um pouco maior) e sombra mais afastada.
      const altura = b.state === 'out' ? 1 : bowlHeight(Math.hypot(wx, wy)) / MAX_HEIGHT;
      let pulo = 0;
      if (b.air > 0) pulo = Math.sin(Math.PI * (1 - b.air / PHYSICS.jumpTime));
      k *= 1 + 0.08 * altura + 0.35 * pulo;
      const r = b.r * scale * k;
      const spin = Math.max(0, b.spin);

      // Rastro: pontos espaçados pela velocidade, então fica longo no fundo e curto no alto da rampa.
      const trail = this.trails[i];
      if (b.state === 'active' && !this.reduceMotion) {
        trail.push(x, y);
        if (trail.length > TRAIL * 2) trail.splice(0, 2);
      } else {
        trail.length = 0;
      }
      if (trail.length >= 4) {
        ctx.lineCap = 'round';
        for (let t = 2; t < trail.length; t += 2) {
          const f = t / trail.length;
          ctx.globalAlpha = 0.35 * f * k;
          ctx.strokeStyle = PLAYER_COLORS[i];
          ctx.lineWidth = r * 0.9 * f;
          ctx.beginPath();
          ctx.moveTo(trail[t - 2], trail[t - 1]);
          ctx.lineTo(trail[t], trail[t + 1]);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // Sombra no piso: deslocada para baixo à direita (luz de cima à esquerda) e maior no pulo.
      const desloca = (4 + 10 * altura + 18 * pulo) * dpr;
      const sombra = r * (2.4 + 0.6 * pulo);
      ctx.globalAlpha = (0.8 - 0.35 * pulo) * k;
      ctx.drawImage(this.sombra, x + desloca - sombra / 2, y + desloca - sombra / 2, sombra, sombra);
      ctx.globalAlpha = k;

      // Anel da cor do jogador sob a bey: identifica P1/P2 junto com a etiqueta do painel.
      // Contorno escuro por baixo para o anel não sumir no plástico azul.
      ctx.beginPath();
      ctx.arc(x, y, r + 5 * dpr, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(4, 10, 24, 0.8)';
      ctx.lineWidth = Math.max(4, 6 * dpr);
      ctx.stroke();
      ctx.strokeStyle = PLAYER_COLORS[i];
      ctx.lineWidth = Math.max(2, 3 * dpr);
      ctx.stroke();
      if (b.state === 'active') {
        if (b.guard) this.drawGuard(x, y, r, b.guardCharge, b.shield ?? 1);
        else if (b.attackCharge > 0) this.drawCharge(x, y, r, b.attackCharge);
      }
      const f = this.flashes[i];
      if (f > 0) {
        const pf = 1 - f / FLASH_SECONDS;
        ctx.globalAlpha = f / FLASH_SECONDS;
        ctx.strokeStyle = colors.ataque;
        ctx.lineWidth = 4 * dpr;
        ctx.beginPath();
        ctx.arc(x, y, r + (this.reduceMotion ? 16 : 10 + 40 * pf) * dpr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = k;
      }

      const sprite = this.sprites[i];
      if (sprite) {
        const size = (sprite.width / 1.2) * k;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        // Borrão de giro: uma cópia atrasada e translúcida, mais forte quanto mais gira.
        if (spin > 0.2 && !this.reduceMotion) {
          const atraso = 0.35 * b.dir * spin;
          ctx.globalAlpha = 0.35 * spin * k;
          ctx.rotate(-atraso);
          ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
          ctx.rotate(atraso);
        }
        ctx.globalAlpha = k;
        ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
        ctx.restore();
        const v = r * 2.02;
        ctx.drawImage(this.volume, x - v / 2, y - v / 2, v, v);
        // Faixa de luz girando na borda: o "chiado" do metal em alta rotação.
        if (spin > 0.15 && b.state === 'active') {
          ctx.globalAlpha = 0.5 * spin * k;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = Math.max(1, 2 * dpr);
          const a0 = angle * 1.7;
          ctx.beginPath();
          ctx.arc(x, y, r * 0.96, a0, a0 + 0.9);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y, r * 0.96, a0 + Math.PI, a0 + Math.PI + 0.9);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = colors.papel;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (b.state === 'active' && b.effects?.some((e) => e.fx === 'fera')) this.drawFogo(x, y, r, angle, spin, i);
      if (this.invocacoes[i] > 0) this.drawInvocacao(x, y, r, i);
      this.posicoes[i] = { x: (x + w / 2) / dpr, y: (y + h / 2) / dpr, r: r / dpr };
    });

    this.drawCacos(dt);
    // Faíscas com luz: mistura aditiva (barata) e um ponto de brilho pré-renderizado na ponta.
    ctx.globalCompositeOperation = 'lighter';
    // Clarão no ponto do choque, maior e mais forte quanto mais forte a pancada.
    for (const p of this.impactos) {
      if (p.life <= 0) continue;
      p.life -= dt;
      const f = Math.max(0, p.life / IMPACT_SECONDS);
      const g = (30 + 90 * p.size) * dpr * (1.4 - 0.4 * f);
      ctx.globalAlpha = f;
      ctx.drawImage(this.glowBranco, p.x * scale - g / 2, p.y * scale - g / 2, g, g);
      ctx.drawImage(this.glowFaisca, p.x * scale - g, p.y * scale - g, g * 2, g * 2);
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = Math.max(1.5, 2.5 * dpr);
    for (const s of this.sparks) {
      if (s.life <= 0) continue;
      s.life -= dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const x = s.x * scale;
      const y = s.y * scale;
      ctx.strokeStyle = s.hot ? colors.chamada : colors.papel;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo((s.x - s.vx * 0.045) * scale, (s.y - s.vy * 0.045) * scale);
      ctx.stroke();
      const g = 10 * dpr;
      ctx.drawImage(this.glowFaisca, x - g / 2, y - g / 2, g, g);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}
