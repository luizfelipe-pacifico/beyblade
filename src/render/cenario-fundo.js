'use client';

// Cenário em volta do prato (D-039): chão e objetos de cada lugar do anime, vistos de cima e desenhados
// em código (arte própria). Tudo vai para um canvas de cache uma vez por resize; nada roda por frame.
// O sorteio é por semente do slug, então o mesmo cenário sai sempre igual.

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (s) => [...s].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);

// Cada pintor recebe o contexto já transladado para o centro do prato, o tamanho do canvas (w, h),
// o raio do prato em px (R), px por mm (s) e o sorteio.
const PINTORES = {
  piscina(g, { w, h, R, s, r }) {
    g.fillStyle = '#2f9bd6';
    g.fillRect(-w / 2, -h / 2, w, h);
    // Azulejos do fundo da piscina.
    g.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    g.lineWidth = Math.max(1, 1.2 * s);
    const lado = 60 * s;
    for (let x = -w / 2 - ((w / 2) % lado); x < w / 2; x += lado) {
      g.beginPath();
      g.moveTo(x, -h / 2);
      g.lineTo(x, h / 2);
      g.stroke();
    }
    for (let y = -h / 2 - ((h / 2) % lado); y < h / 2; y += lado) {
      g.beginPath();
      g.moveTo(-w / 2, y);
      g.lineTo(w / 2, y);
      g.stroke();
    }
    // Reflexos da luz na água (cáusticas).
    g.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    g.lineWidth = Math.max(1, 2 * s);
    for (let k = 0; k < 70; k++) {
      const x = (r() - 0.5) * w;
      const y = (r() - 0.5) * h;
      const l = (20 + 50 * r()) * s;
      g.beginPath();
      g.moveTo(x, y);
      g.bezierCurveTo(x + l * 0.3, y - l * 0.3, x + l * 0.7, y + l * 0.3, x + l, y);
      g.stroke();
    }
    // Raias com boias vermelhas e brancas.
    for (const y of [-R - 140 * s, R + 140 * s]) {
      for (let x = -w / 2, i = 0; x < w / 2; x += 18 * s, i++) {
        g.fillStyle = i % 4 < 2 ? '#e5413b' : '#f5f5f5';
        g.beginPath();
        g.arc(x, y, 7 * s, 0, Math.PI * 2);
        g.fill();
      }
    }
    // Borda de pedra nas laterais.
    g.fillStyle = '#d9cdb4';
    g.fillRect(-w / 2, -h / 2, 40 * s, h);
    g.fillRect(w / 2 - 40 * s, -h / 2, 40 * s, h);
  },

  parque(g, { w, h, R, s, r }) {
    g.fillStyle = '#4f8f3a';
    g.fillRect(-w / 2, -h / 2, w, h);
    // Grama: tufos curtos em dois tons.
    g.lineWidth = Math.max(1, 1.4 * s);
    for (let k = 0; k < 2200; k++) {
      const x = (r() - 0.5) * w;
      const y = (r() - 0.5) * h;
      g.strokeStyle = r() < 0.5 ? '#3f7a2e' : '#6aab4d';
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (r() - 0.5) * 6 * s, y - (6 + 6 * r()) * s);
      g.stroke();
    }
    // Trilha de terra e o lago num canto.
    g.strokeStyle = '#c4a067';
    g.lineWidth = 70 * s;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-w / 2, h / 2 - 80 * s);
    g.quadraticCurveTo(0, R * 0.6, w / 2, R + 200 * s);
    g.stroke();
    g.fillStyle = '#3b8fcf';
    g.beginPath();
    g.ellipse(w / 2 - 60 * s, -h / 2 + 40 * s, 260 * s, 180 * s, 0.3, 0, Math.PI * 2);
    g.fill();
    // Árvores vistas de cima: copa com luz em cima à esquerda e sombra no chão.
    for (let k = 0; k < 7; k++) {
      const a = r() * Math.PI * 2;
      const d = R + (90 + 140 * r()) * s;
      const x = Math.cos(a) * d;
      const y = Math.sin(a) * d;
      const raio = (60 + 40 * r()) * s;
      g.fillStyle = 'rgba(10, 30, 10, 0.35)';
      g.beginPath();
      g.arc(x + 18 * s, y + 18 * s, raio, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#2d5e24';
      g.beginPath();
      g.arc(x, y, raio, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#4c8a38';
      g.beginPath();
      g.arc(x - raio * 0.25, y - raio * 0.25, raio * 0.6, 0, Math.PI * 2);
      g.fill();
    }
  },

  terraco(g, { w, h, R, s, r }) {
    g.fillStyle = '#8b9199';
    g.fillRect(-w / 2, -h / 2, w, h);
    // Placas de concreto e manchas.
    g.strokeStyle = 'rgba(40, 45, 52, 0.45)';
    g.lineWidth = Math.max(1, 1.5 * s);
    const placa = 240 * s;
    for (let x = -w / 2 - ((w / 2) % placa); x < w / 2; x += placa) {
      g.beginPath();
      g.moveTo(x, -h / 2);
      g.lineTo(x, h / 2);
      g.stroke();
    }
    for (let y = -h / 2 - ((h / 2) % placa); y < h / 2; y += placa) {
      g.beginPath();
      g.moveTo(-w / 2, y);
      g.lineTo(w / 2, y);
      g.stroke();
    }
    for (let k = 0; k < 40; k++) {
      g.fillStyle = `rgba(50, 55, 60, ${0.05 + 0.1 * r()})`;
      g.beginPath();
      g.arc((r() - 0.5) * w, (r() - 0.5) * h, (10 + 50 * r()) * s, 0, Math.PI * 2);
      g.fill();
    }
    // Saídas de ar e caixa d'água.
    for (const [x, y] of [[-R - 160 * s, -R * 0.6], [R + 150 * s, R * 0.5]]) {
      g.fillStyle = '#5d636b';
      g.fillRect(x - 60 * s, y - 40 * s, 120 * s, 80 * s);
      g.strokeStyle = '#3c4148';
      for (let k = -30; k <= 30; k += 12) {
        g.beginPath();
        g.moveTo(x - 50 * s, y + k * s);
        g.lineTo(x + 50 * s, y + k * s);
        g.stroke();
      }
    }
    // Rastros do vento, no sentido em que ele empurra (+x).
    g.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    g.lineWidth = Math.max(1, 2 * s);
    for (let k = 0; k < 26; k++) {
      const x = (r() - 0.5) * w;
      const y = (r() - 0.5) * h;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (60 + 80 * r()) * s, y);
      g.stroke();
    }
    // Grade de proteção nas bordas do terraço.
    g.strokeStyle = '#2b2f35';
    g.lineWidth = 6 * s;
    g.strokeRect(-w / 2 + 14 * s, -h / 2 + 14 * s, w - 28 * s, h - 28 * s);
  },

  loja(g, { w, h, R, s, r }) {
    // Piso de tábuas com veios.
    const tabua = 70 * s;
    for (let y = -h / 2, i = 0; y < h / 2; y += tabua, i++) {
      g.fillStyle = ['#9a6537', '#a8703f', '#8f5c31'][i % 3];
      g.fillRect(-w / 2, y, w, tabua);
      g.strokeStyle = 'rgba(60, 30, 10, 0.4)';
      g.lineWidth = Math.max(1, 1.2 * s);
      g.beginPath();
      g.moveTo(-w / 2, y);
      g.lineTo(w / 2, y);
      g.stroke();
      for (let k = 0; k < 6; k++) {
        const x = (r() - 0.5) * w;
        g.beginPath();
        g.moveTo(x, y + tabua * 0.3);
        g.quadraticCurveTo(x + 80 * s, y + tabua * (0.2 + 0.6 * r()), x + 160 * s, y + tabua * 0.5);
        g.stroke();
      }
    }
    // Prateleiras com caixas de peças.
    const cores = ['#d7262e', '#2a6fd1', '#ffd400', '#1f8a4c', '#f5f5f5'];
    for (const x of [-w / 2 + 10 * s, w / 2 - 110 * s]) {
      g.fillStyle = '#4a2f1b';
      g.fillRect(x, -h / 2, 100 * s, h);
      for (let y = -h / 2 + 10 * s; y < h / 2 - 50 * s; y += 60 * s) {
        g.fillStyle = cores[Math.floor(r() * cores.length)];
        g.fillRect(x + 10 * s, y, 80 * s, 45 * s);
      }
    }
  },

  beco(g, { w, h, s, r }) {
    g.fillStyle = '#2a2c32';
    g.fillRect(-w / 2, -h / 2, w, h);
    for (let k = 0; k < 900; k++) {
      g.fillStyle = `rgba(255, 255, 255, ${0.02 + 0.05 * r()})`;
      g.fillRect((r() - 0.5) * w, (r() - 0.5) * h, 2 * s, 2 * s);
    }
    // Poças refletindo o neon.
    for (let k = 0; k < 6; k++) {
      g.fillStyle = r() < 0.5 ? 'rgba(255, 70, 170, 0.18)' : 'rgba(60, 220, 255, 0.18)';
      g.beginPath();
      g.ellipse((r() - 0.5) * w, (r() - 0.5) * h, (60 + 80 * r()) * s, (25 + 30 * r()) * s, r(), 0, Math.PI * 2);
      g.fill();
    }
    // Paredes de tijolo nas laterais, com placas de neon.
    for (const x of [-w / 2, w / 2 - 70 * s]) {
      g.fillStyle = '#4a2622';
      g.fillRect(x, -h / 2, 70 * s, h);
      for (let y = -h / 2; y < h / 2; y += 24 * s) {
        g.strokeStyle = 'rgba(20, 8, 8, 0.6)';
        g.lineWidth = Math.max(1, s);
        g.strokeRect(x, y, 70 * s, 24 * s);
      }
      const neon = ['#ff46aa', '#3cdcff', '#ffd400'][Math.floor(r() * 3)];
      g.strokeStyle = neon;
      g.lineWidth = 5 * s;
      g.strokeRect(x + 12 * s, -60 * s, 46 * s, 120 * s);
    }
  },

  telhado(g, { w, h, s }) {
    g.fillStyle = '#7d1f1a';
    g.fillRect(-w / 2, -h / 2, w, h);
    // Telhas em fileiras de arcos, como os telhados tradicionais.
    const passo = 36 * s;
    for (let y = -h / 2, linha = 0; y < h / 2 + passo; y += passo * 0.7, linha++) {
      for (let x = -w / 2 - (linha % 2) * passo * 0.5; x < w / 2 + passo; x += passo) {
        g.fillStyle = linha % 2 ? '#b8362b' : '#a83028';
        g.beginPath();
        g.arc(x, y, passo * 0.55, 0, Math.PI);
        g.fill();
        g.strokeStyle = 'rgba(40, 5, 5, 0.6)';
        g.lineWidth = Math.max(1, 1.5 * s);
        g.stroke();
      }
    }
    // Cumeeira dourada cruzando o telhado.
    g.fillStyle = '#d9a52b';
    g.fillRect(-w / 2, -14 * s, w, 28 * s);
  },

  gelo(g, { w, h, s, r }) {
    g.fillStyle = '#cfe6f4';
    g.fillRect(-w / 2, -h / 2, w, h);
    // Partes mais fundas do lago, azul escuro sob o gelo.
    for (let k = 0; k < 8; k++) {
      g.fillStyle = 'rgba(70, 130, 180, 0.18)';
      g.beginPath();
      g.ellipse((r() - 0.5) * w, (r() - 0.5) * h, (120 + 160 * r()) * s, (60 + 90 * r()) * s, r() * 3, 0, Math.PI * 2);
      g.fill();
    }
    // Rachaduras.
    g.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    g.lineWidth = Math.max(1, 1.5 * s);
    for (let k = 0; k < 14; k++) {
      let x = (r() - 0.5) * w;
      let y = (r() - 0.5) * h;
      g.beginPath();
      g.moveTo(x, y);
      for (let j = 0; j < 6; j++) {
        x += (r() - 0.5) * 90 * s;
        y += (r() - 0.5) * 90 * s;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    // Neve em pontinhos.
    g.fillStyle = 'rgba(255, 255, 255, 0.9)';
    for (let k = 0; k < 500; k++) g.fillRect((r() - 0.5) * w, (r() - 0.5) * h, 2.5 * s, 2.5 * s);
  },

  rinque(g, { w, h, R, s, r }) {
    g.fillStyle = '#eef6fb';
    g.fillRect(-w / 2, -h / 2, w, h);
    // Marcas do rinque e riscos de patins.
    g.strokeStyle = 'rgba(42, 111, 209, 0.45)';
    g.lineWidth = 8 * s;
    for (const y of [-R - 90 * s, R + 90 * s]) {
      g.beginPath();
      g.moveTo(-w / 2, y);
      g.lineTo(w / 2, y);
      g.stroke();
    }
    g.strokeStyle = 'rgba(215, 38, 46, 0.5)';
    g.beginPath();
    g.moveTo(-w / 2, 0);
    g.lineTo(w / 2, 0);
    g.stroke();
    g.strokeStyle = 'rgba(120, 150, 175, 0.35)';
    g.lineWidth = Math.max(1, s);
    for (let k = 0; k < 60; k++) {
      const x = (r() - 0.5) * w;
      const y = (r() - 0.5) * h;
      g.beginPath();
      g.arc(x, y, (80 + 200 * r()) * s, r() * 6, r() * 6 + 0.6);
      g.stroke();
    }
  },

  praia(g, { w, h, s, r }) {
    g.fillStyle = '#e6c98d';
    g.fillRect(-w / 2, -h / 2, w, h);
    // Ondulações da areia.
    g.strokeStyle = 'rgba(160, 120, 60, 0.35)';
    g.lineWidth = Math.max(1, 1.5 * s);
    for (let y = -h / 2; y < h / 2; y += 22 * s) {
      g.beginPath();
      for (let x = -w / 2; x <= w / 2; x += 20 * s) g.lineTo(x, y + Math.sin(x / (40 * s) + y) * 5 * s);
      g.stroke();
    }
    // Mar no topo, com espuma.
    g.fillStyle = '#2f86c9';
    g.fillRect(-w / 2, -h / 2, w, 150 * s);
    g.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    g.lineWidth = 6 * s;
    g.beginPath();
    for (let x = -w / 2; x <= w / 2; x += 16 * s) g.lineTo(x, -h / 2 + 150 * s + Math.sin(x / (30 * s)) * 8 * s);
    g.stroke();
    // Conchas.
    for (let k = 0; k < 18; k++) {
      g.fillStyle = r() < 0.5 ? '#f7e8e0' : '#e9b8a8';
      g.beginPath();
      g.arc((r() - 0.5) * w, (r() - 0.3) * h * 0.8, (4 + 4 * r()) * s, 0, Math.PI * 2);
      g.fill();
    }
  },

  bega(g, { w, h, R, s, r }) {
    g.fillStyle = '#120e24';
    g.fillRect(-w / 2, -h / 2, w, h);
    // Feixes dos refletores convergindo no prato.
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.3;
      const x = Math.cos(a) * w;
      const y = Math.sin(a) * h;
      const grad = g.createLinearGradient(x, y, 0, 0);
      grad.addColorStop(0, 'rgba(170, 140, 255, 0)');
      grad.addColorStop(1, 'rgba(170, 140, 255, 0.22)');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(Math.cos(a + 0.5) * R, Math.sin(a + 0.5) * R);
      g.lineTo(Math.cos(a - 0.5) * R, Math.sin(a - 0.5) * R);
      g.closePath();
      g.fill();
    }
    // Plateia: pontinhos coloridos em anel, longe do prato.
    for (let k = 0; k < 900; k++) {
      const a = r() * Math.PI * 2;
      const d = R + (180 + 400 * r()) * s;
      g.fillStyle = ['#ffd400', '#d7262e', '#4fd8e0', '#ffffff'][k % 4];
      g.globalAlpha = 0.25 + 0.4 * r();
      g.fillRect(Math.cos(a) * d, Math.sin(a) * d, 3 * s, 3 * s);
    }
    g.globalAlpha = 1;
  },

  estadio(g, { w, h }) {
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, Math.max(w, h) / 1.4);
    grad.addColorStop(0, '#1a2346');
    grad.addColorStop(1, '#0d1226');
    g.fillStyle = grad;
    g.fillRect(-w / 2, -h / 2, w, h);
  },
};

export function desenharCenario(g, tema, slug, medidas) {
  const pintor = PINTORES[tema?.cenario] ?? PINTORES.estadio;
  g.save();
  pintor(g, { ...medidas, r: rng(hash(slug ?? 'estadio')) });
  g.restore();
}
