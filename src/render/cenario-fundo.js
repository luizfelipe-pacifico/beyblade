'use client';

// Cenário em volta do prato (D-039, D-056): chão e marcos de cada lugar do anime, vistos de cima e
// desenhados em código (arte própria). Cada lugar tem objetos que o identificam de relance (a escada e o
// trampolim da piscina, os bancos e postes do parque, a caixa d'água do terraço...), grandes o bastante
// para aparecer nas bordas da tela. Tudo vai para um canvas de cache uma vez por resize.
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

// Luz de cima à esquerda (mesma da arena): sombra de objeto cai para baixo e à direita.
function sombra(g, s, desenho, dist = 10) {
  g.save();
  g.translate(dist * s, dist * s);
  g.fillStyle = 'rgba(0, 0, 0, 0.3)';
  desenho(true);
  g.restore();
  desenho(false);
}

function retangulo(g, x, y, w, h, cor, borda) {
  g.fillStyle = cor;
  g.fillRect(x, y, w, h);
  if (borda) {
    g.strokeStyle = borda;
    g.strokeRect(x, y, w, h);
  }
}

// Cantos visíveis fora do prato, em px, para pôr os marcos onde dá para ver.
const cantos = (w, h, folga) => [
  [-w / 2 + folga, -h / 2 + folga],
  [w / 2 - folga, -h / 2 + folga],
  [-w / 2 + folga, h / 2 - folga],
  [w / 2 - folga, h / 2 - folga],
];

function arvore(g, s, x, y, raio, cores = ['#2d5e24', '#4c8a38']) {
  sombra(g, s, (sh) => {
    g.fillStyle = sh ? 'rgba(10, 30, 10, 0.35)' : cores[0];
    g.beginPath();
    g.arc(x, y, raio, 0, Math.PI * 2);
    g.fill();
  }, 18);
  g.fillStyle = cores[1];
  g.beginPath();
  g.arc(x - raio * 0.25, y - raio * 0.25, raio * 0.6, 0, Math.PI * 2);
  g.fill();
}

const PINTORES = {
  // Piscina pública (G-Revolution, ep. 3): água azul com azulejos, raias, escada, trampolim, deck com
  // espreguiçadeiras e boias.
  piscina(g, { w, h, R, s, r }) {
    g.fillStyle = '#2f9bd6';
    g.fillRect(-w / 2, -h / 2, w, h);
    g.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    g.lineWidth = Math.max(1, 1.2 * s);
    const lado = 50 * s;
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
    // Faixas escuras no fundo marcando as raias.
    g.fillStyle = 'rgba(10, 40, 90, 0.35)';
    for (const x of [-R - 150 * s, R + 150 * s]) g.fillRect(x - 8 * s, -h / 2, 16 * s, h);
    // Reflexos da luz na água.
    g.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    g.lineWidth = Math.max(1, 2.2 * s);
    for (let k = 0; k < 90; k++) {
      const x = (r() - 0.5) * w;
      const y = (r() - 0.5) * h;
      const l = (20 + 50 * r()) * s;
      g.beginPath();
      g.moveTo(x, y);
      g.bezierCurveTo(x + l * 0.3, y - l * 0.3, x + l * 0.7, y + l * 0.3, x + l, y);
      g.stroke();
    }
    // Cordas das raias com flutuadores vermelhos e brancos.
    for (const y of [-R - 70 * s, R + 70 * s]) {
      for (let x = -w / 2, i = 0; x < w / 2; x += 16 * s, i++) {
        g.fillStyle = i % 4 < 2 ? '#e5413b' : '#f5f5f5';
        g.beginPath();
        g.arc(x, y, 7 * s, 0, Math.PI * 2);
        g.fill();
      }
    }
    // Deck de pedra nas laterais, com espreguiçadeiras e toalhas.
    const deck = Math.max(70 * s, (w - 2 * (R + 30 * s)) / 2 - 10 * s);
    for (const lado of [-1, 1]) {
      const x0 = lado < 0 ? -w / 2 : w / 2 - deck;
      retangulo(g, x0, -h / 2, deck, h, '#e3d6bb');
      g.strokeStyle = 'rgba(120, 100, 70, 0.35)';
      for (let y = -h / 2; y < h / 2; y += 40 * s) {
        g.beginPath();
        g.moveTo(x0, y);
        g.lineTo(x0 + deck, y);
        g.stroke();
      }
      // Borda azulejada da piscina.
      retangulo(g, lado < 0 ? x0 + deck - 10 * s : x0, -h / 2, 10 * s, h, '#f4f1ea');
      for (let k = 0; k < 3; k++) {
        const y = -h / 2 + (0.2 + 0.3 * k) * h;
        const cx = x0 + deck / 2;
        sombra(g, s, (sh) => {
          g.fillStyle = sh ? 'rgba(0,0,0,0.25)' : ['#ffd400', '#4fd8e0', '#ff8a3d'][k];
          g.fillRect(cx - 22 * s, y - 50 * s, 44 * s, 100 * s);
        }, 6);
        g.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        g.lineWidth = 2 * s;
        for (let j = -40; j <= 40; j += 14) {
          g.beginPath();
          g.moveTo(cx - 22 * s, y + j * s);
          g.lineTo(cx + 22 * s, y + j * s);
          g.stroke();
        }
      }
    }
    // Escada de inox saindo da água e o trampolim.
    const ex = -w / 2 + deck + 26 * s;
    g.strokeStyle = '#d8dee6';
    g.lineWidth = 6 * s;
    for (const dy of [-22, 22]) {
      g.beginPath();
      g.moveTo(ex - 30 * s, -h * 0.15 + dy * s);
      g.lineTo(ex + 20 * s, -h * 0.15 + dy * s);
      g.stroke();
    }
    for (let k = 0; k < 3; k++) {
      g.beginPath();
      g.moveTo(ex + (-10 + 12 * k) * s, -h * 0.15 - 22 * s);
      g.lineTo(ex + (-10 + 12 * k) * s, -h * 0.15 + 22 * s);
      g.stroke();
    }
    const tx = w / 2 - deck - 10 * s;
    sombra(g, s, (sh) => {
      g.fillStyle = sh ? 'rgba(0,0,0,0.3)' : '#2a6fd1';
      g.fillRect(tx - 130 * s, h * 0.28 - 16 * s, 140 * s, 32 * s);
    }, 14);
    g.fillStyle = '#ffffff';
    g.fillRect(tx - 128 * s, h * 0.28 - 4 * s, 136 * s, 8 * s);
    // Boias soltas na água.
    for (let k = 0; k < 3; k++) {
      const x = (r() < 0.5 ? -1 : 1) * (R + (40 + 40 * r()) * s);
      const y = (r() - 0.5) * h * 0.8;
      g.lineWidth = 12 * s;
      g.strokeStyle = ['#ff46aa', '#ffd400', '#7fe9ff'][k];
      g.beginPath();
      g.arc(x, y, 22 * s, 0, Math.PI * 2);
      g.stroke();
    }
  },

  // Parque do lago (temporada 1, ep. 3): grama, caminho, lago com patos e cachoeira, bancos, postes, árvores.
  parque(g, { w, h, R, s, r }) {
    g.fillStyle = '#4f8f3a';
    g.fillRect(-w / 2, -h / 2, w, h);
    g.lineWidth = Math.max(1, 1.4 * s);
    for (let k = 0; k < 2600; k++) {
      const x = (r() - 0.5) * w;
      const y = (r() - 0.5) * h;
      g.strokeStyle = r() < 0.5 ? '#3f7a2e' : '#6aab4d';
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (r() - 0.5) * 6 * s, y - (6 + 6 * r()) * s);
      g.stroke();
    }
    // Caminho de terra em volta do prato.
    g.strokeStyle = '#c9a46a';
    g.lineWidth = 60 * s;
    g.beginPath();
    g.arc(0, 0, R + 120 * s, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = 'rgba(120, 90, 50, 0.4)';
    g.lineWidth = 2 * s;
    g.beginPath();
    g.arc(0, 0, R + 92 * s, 0, Math.PI * 2);
    g.stroke();
    // Lago no canto de cima à direita, com a cachoeira caindo nele e patos.
    const [lx, ly] = [w / 2 - 40 * s, -h / 2 + 30 * s];
    g.fillStyle = '#2f7fc1';
    g.beginPath();
    g.ellipse(lx, ly, 300 * s, 210 * s, 0.3, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let k = 0; k < 7; k++) g.fillRect(lx - 60 * s + k * 14 * s, -h / 2, 8 * s, 120 * s + r() * 40 * s);
    g.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    g.lineWidth = 3 * s;
    for (let k = 0; k < 4; k++) {
      g.beginPath();
      g.arc(lx - 20 * s, -h / 2 + 140 * s, (20 + 18 * k) * s, 0.2, Math.PI - 0.2);
      g.stroke();
    }
    for (let k = 0; k < 3; k++) {
      const x = lx - 160 * s + k * 50 * s;
      const y = ly + 90 * s - k * 20 * s;
      g.fillStyle = '#f5f5f5';
      g.beginPath();
      g.ellipse(x, y, 14 * s, 9 * s, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#ffb020';
      g.fillRect(x + 10 * s, y - 2 * s, 7 * s, 4 * s);
    }
    // Bancos de madeira e postes de luz no caminho.
    for (const [x, y] of [[-R - 110 * s, -R * 0.55], [-R - 110 * s, R * 0.55]]) {
      sombra(g, s, (sh) => {
        g.fillStyle = sh ? 'rgba(0,0,0,0.3)' : '#8a5a2b';
        g.fillRect(x - 22 * s, y - 70 * s, 44 * s, 140 * s);
      }, 10);
      g.strokeStyle = '#5e3b1a';
      g.lineWidth = 2 * s;
      for (let j = -60; j <= 60; j += 20) {
        g.beginPath();
        g.moveTo(x - 22 * s, y + j * s);
        g.lineTo(x + 22 * s, y + j * s);
        g.stroke();
      }
    }
    for (const [x, y] of [[R + 125 * s, R * 0.75], [-R - 125 * s, 0]]) {
      g.fillStyle = 'rgba(255, 240, 180, 0.35)';
      g.beginPath();
      g.arc(x, y, 45 * s, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#2b2f35';
      g.beginPath();
      g.arc(x, y, 12 * s, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#fff3c4';
      g.beginPath();
      g.arc(x, y, 7 * s, 0, Math.PI * 2);
      g.fill();
    }
    for (const [x, y] of cantos(w, h, 50 * s).filter((_, i) => i !== 1)) arvore(g, s, x, y, (80 + 30 * r()) * s);
    arvore(g, s, R + 210 * s, -R * 0.1, 70 * s);
  },

  // Terraço dos Blade Sharks (temporada 1, ep. 1): concreto, caixa d'água, saídas de ar, antena,
  // grade, a cidade lá embaixo numa borda e o vento.
  terraco(g, { w, h, R, s, r }) {
    g.fillStyle = '#8b9199';
    g.fillRect(-w / 2, -h / 2, w, h);
    g.strokeStyle = 'rgba(40, 45, 52, 0.45)';
    g.lineWidth = Math.max(1, 1.5 * s);
    const placa = 200 * s;
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
    for (let k = 0; k < 50; k++) {
      g.fillStyle = `rgba(50, 55, 60, ${0.05 + 0.1 * r()})`;
      g.beginPath();
      g.arc((r() - 0.5) * w, (r() - 0.5) * h, (10 + 50 * r()) * s, 0, Math.PI * 2);
      g.fill();
    }
    // A cidade vista da beira do prédio, à esquerda: telhados pequenos lá embaixo.
    const borda = -w / 2 + 70 * s;
    g.fillStyle = '#3a4452';
    g.fillRect(-w / 2, -h / 2, borda + w / 2, h);
    for (let k = 0; k < 40; k++) {
      g.fillStyle = ['#59677a', '#4a5566', '#6b7a8e', '#c9a46a'][k % 4];
      g.fillRect(-w / 2 + r() * 60 * s, -h / 2 + r() * h, (8 + 14 * r()) * s, (8 + 14 * r()) * s);
    }
    g.fillStyle = '#d8dde3';
    g.fillRect(borda, -h / 2, 10 * s, h);
    // Caixa d'água redonda num canto e saídas de ar.
    const [cx, cy] = [w / 2 - 110 * s, -h / 2 + 110 * s];
    sombra(g, s, (sh) => {
      g.fillStyle = sh ? 'rgba(0,0,0,0.3)' : '#5d7ea8';
      g.beginPath();
      g.arc(cx, cy, 85 * s, 0, Math.PI * 2);
      g.fill();
    }, 22);
    g.strokeStyle = '#3e5c84';
    g.lineWidth = 4 * s;
    for (const k of [0.4, 0.75]) {
      g.beginPath();
      g.arc(cx, cy, 85 * s * k, 0, Math.PI * 2);
      g.stroke();
    }
    for (const [x, y] of [[-R - 130 * s, R * 0.6], [R + 140 * s, R * 0.55]]) {
      sombra(g, s, (sh) => {
        g.fillStyle = sh ? 'rgba(0,0,0,0.3)' : '#5d636b';
        g.fillRect(x - 55 * s, y - 40 * s, 110 * s, 80 * s);
      }, 12);
      g.strokeStyle = '#3c4148';
      g.lineWidth = 3 * s;
      g.beginPath();
      g.arc(x, y, 28 * s, 0, Math.PI * 2);
      g.stroke();
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + 0.4;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(a) * 26 * s, y + Math.sin(a) * 26 * s);
        g.stroke();
      }
    }
    // Antena com o cabo de aço.
    g.strokeStyle = '#2b2f35';
    g.lineWidth = 3 * s;
    g.beginPath();
    g.moveTo(w / 2 - 60 * s, h / 2 - 60 * s);
    g.lineTo(w / 2 - 180 * s, h / 2 - 150 * s);
    g.stroke();
    // Rastros do vento no sentido em que ele empurra (+x).
    g.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    g.lineWidth = Math.max(1, 2.5 * s);
    for (let k = 0; k < 34; k++) {
      const x = (r() - 0.5) * w;
      const y = (r() - 0.5) * h;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (70 + 90 * r()) * s, y);
      g.stroke();
    }
    g.strokeStyle = '#2b2f35';
    g.lineWidth = 6 * s;
    g.strokeRect(borda + 14 * s, -h / 2 + 14 * s, w / 2 - borda - 28 * s, h - 28 * s);
  },

  // BB Shop (temporada 1, ep. 3): piso de tábuas, balcão com caixa registradora, prateleiras com caixas
  // de beys coloridas e uma placa redonda no chão.
  loja(g, { w, h, R, s, r }) {
    const tabua = 60 * s;
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
    const cores = ['#d7262e', '#2a6fd1', '#ffd400', '#1f8a4c', '#f5f5f5', '#ff8a3d'];
    // Prateleiras nas duas laterais, cheias de caixas de beys (com o "círculo" da bey na frente).
    for (const x of [-w / 2 + 8 * s, w / 2 - 118 * s]) {
      g.fillStyle = '#4a2f1b';
      g.fillRect(x, -h / 2, 110 * s, h);
      for (let y = -h / 2 + 10 * s; y < h / 2 - 50 * s; y += 58 * s) {
        for (let k = 0; k < 2; k++) {
          const bx = x + 8 * s + k * 50 * s;
          g.fillStyle = cores[Math.floor(r() * cores.length)];
          g.fillRect(bx, y, 44 * s, 48 * s);
          g.fillStyle = 'rgba(255, 255, 255, 0.75)';
          g.beginPath();
          g.arc(bx + 22 * s, y + 24 * s, 13 * s, 0, Math.PI * 2);
          g.fill();
        }
      }
    }
    // Balcão em L embaixo com a caixa registradora.
    sombra(g, s, (sh) => {
      g.fillStyle = sh ? 'rgba(0,0,0,0.35)' : '#5e3b1a';
      g.fillRect(-R * 0.7, h / 2 - 70 * s, R * 1.4, 70 * s);
    }, 12);
    retangulo(g, -R * 0.7 + 8 * s, h / 2 - 62 * s, R * 1.4 - 16 * s, 54 * s, '#7a4d24');
    retangulo(g, R * 0.25, h / 2 - 58 * s, 70 * s, 46 * s, '#2b2f35');
    retangulo(g, R * 0.25 + 8 * s, h / 2 - 50 * s, 30 * s, 16 * s, '#4fd8e0');
    // Tapete redondo de loja de brinquedo no topo.
    g.fillStyle = '#d7262e';
    g.beginPath();
    g.arc(0, -h / 2, 120 * s, 0, Math.PI);
    g.fill();
    g.fillStyle = '#ffd400';
    g.beginPath();
    g.arc(0, -h / 2, 80 * s, 0, Math.PI);
    g.fill();
  },

  // Becos de Hong Kong (temporada 1, ep. 8): asfalto molhado, poças com neon, paredes de tijolo com
  // letreiros, lanternas vermelhas e caixotes.
  beco(g, { w, h, R, s, r }) {
    g.fillStyle = '#2a2c32';
    g.fillRect(-w / 2, -h / 2, w, h);
    for (let k = 0; k < 1200; k++) {
      g.fillStyle = `rgba(255, 255, 255, ${0.02 + 0.05 * r()})`;
      g.fillRect((r() - 0.5) * w, (r() - 0.5) * h, 2 * s, 2 * s);
    }
    for (let k = 0; k < 8; k++) {
      g.fillStyle = r() < 0.5 ? 'rgba(255, 70, 170, 0.22)' : 'rgba(60, 220, 255, 0.22)';
      g.beginPath();
      g.ellipse((r() - 0.5) * w, (r() - 0.5) * h, (60 + 80 * r()) * s, (25 + 30 * r()) * s, r(), 0, Math.PI * 2);
      g.fill();
    }
    const parede = Math.max(80 * s, (w - 2 * (R + 30 * s)) / 2 - 20 * s);
    for (const lado of [-1, 1]) {
      const x0 = lado < 0 ? -w / 2 : w / 2 - parede;
      g.fillStyle = '#4a2622';
      g.fillRect(x0, -h / 2, parede, h);
      g.strokeStyle = 'rgba(20, 8, 8, 0.6)';
      g.lineWidth = Math.max(1, s);
      for (let y = -h / 2, l = 0; y < h / 2; y += 22 * s, l++) {
        for (let x = x0 - (l % 2) * 20 * s; x < x0 + parede; x += 40 * s) g.strokeRect(x, y, 40 * s, 22 * s);
      }
      // Letreiros de neon (molduras e barras de luz, sem texto).
      for (let k = 0; k < 3; k++) {
        const neon = ['#ff46aa', '#3cdcff', '#ffd400'][(k + (lado > 0 ? 1 : 0)) % 3];
        const y = -h / 2 + (0.15 + 0.32 * k) * h;
        g.fillStyle = 'rgba(0, 0, 0, 0.5)';
        g.fillRect(x0 + parede * 0.2, y, parede * 0.6, 120 * s);
        g.strokeStyle = neon;
        g.lineWidth = 5 * s;
        g.strokeRect(x0 + parede * 0.2, y, parede * 0.6, 120 * s);
        g.fillStyle = neon;
        for (let j = 0; j < 3; j++) g.fillRect(x0 + parede * 0.32, y + (20 + 32 * j) * s, parede * 0.36, 10 * s);
      }
    }
    // Lanternas vermelhas penduradas atravessando o beco (vistas de cima: círculos com brilho).
    for (let k = 0; k < 6; k++) {
      const x = -w / 2 + parede + ((k + 0.5) / 6) * (w - 2 * parede);
      for (const y of [-h / 2 + 40 * s, h / 2 - 40 * s]) {
        g.fillStyle = 'rgba(255, 80, 40, 0.3)';
        g.beginPath();
        g.arc(x, y, 34 * s, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#d7262e';
        g.beginPath();
        g.arc(x, y, 18 * s, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#ffd400';
        g.fillRect(x - 3 * s, y - 18 * s, 6 * s, 36 * s);
      }
    }
    // Caixotes de feira num canto.
    for (let k = 0; k < 3; k++) {
      const x = w / 2 - parede - 70 * s - k * 52 * s;
      const y = h / 2 - 130 * s;
      sombra(g, s, (sh) => {
        g.fillStyle = sh ? 'rgba(0,0,0,0.4)' : '#a8703f';
        g.fillRect(x, y, 48 * s, 48 * s);
      }, 8);
      g.strokeStyle = '#5e3b1a';
      g.lineWidth = 2 * s;
      g.strokeRect(x, y, 48 * s, 48 * s);
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + 48 * s, y + 48 * s);
      g.stroke();
    }
  },

  // Topo das torres da China (temporada 1, ep. 10): telhado de telhas vermelhas com beirais dourados,
  // lanternas, e o vazio lá embaixo nos cantos.
  telhado(g, { w, h, R, s }) {
    g.fillStyle = '#7d1f1a';
    g.fillRect(-w / 2, -h / 2, w, h);
    const passo = 32 * s;
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
    // Cumeeiras douradas em cruz e beirais curvos nas pontas, como num pagode.
    g.fillStyle = '#d9a52b';
    g.fillRect(-w / 2, -12 * s, w, 24 * s);
    g.fillRect(-12 * s, -h / 2, 24 * s, h);
    g.strokeStyle = '#d9a52b';
    g.lineWidth = 10 * s;
    for (const [x, y] of cantos(w, h, 10 * s)) {
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x * 0.85, y * 0.95, x * 0.75, y * 0.75);
      g.stroke();
    }
    // O vazio da altura nos cantos (céu e nuvens lá embaixo).
    for (const [x, y] of cantos(w, h, 0)) {
      const grad = g.createRadialGradient(x, y, 0, x, y, 150 * s);
      grad.addColorStop(0, 'rgba(140, 190, 235, 0.95)');
      grad.addColorStop(1, 'rgba(140, 190, 235, 0)');
      g.fillStyle = grad;
      g.fillRect(x - 150 * s, y - 150 * s, 300 * s, 300 * s);
    }
    // Lanternas penduradas nos beirais.
    for (const [x, y] of [[-R - 110 * s, -R * 0.5], [R + 110 * s, -R * 0.5], [-R - 110 * s, R * 0.5], [R + 110 * s, R * 0.5]]) {
      g.fillStyle = 'rgba(255, 120, 40, 0.35)';
      g.beginPath();
      g.arc(x, y, 38 * s, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#e0401f';
      g.beginPath();
      g.arc(x, y, 20 * s, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#ffd400';
      g.fillRect(x - 4 * s, y - 22 * s, 8 * s, 44 * s);
    }
  },

  // Lago Baikal congelado (temporada 1, ep. 45): gelo com rachaduras e partes fundas, margem com neve
  // e pinheiros.
  gelo(g, { w, h, R, s, r }) {
    g.fillStyle = '#cfe6f4';
    g.fillRect(-w / 2, -h / 2, w, h);
    for (let k = 0; k < 10; k++) {
      g.fillStyle = 'rgba(40, 100, 160, 0.22)';
      g.beginPath();
      g.ellipse((r() - 0.5) * w, (r() - 0.5) * h, (120 + 160 * r()) * s, (60 + 90 * r()) * s, r() * 3, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    g.lineWidth = Math.max(1, 2 * s);
    for (let k = 0; k < 18; k++) {
      let x = (r() - 0.5) * w;
      let y = (r() - 0.5) * h;
      g.beginPath();
      g.moveTo(x, y);
      for (let j = 0; j < 7; j++) {
        x += (r() - 0.5) * 90 * s;
        y += (r() - 0.5) * 90 * s;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    // Margem coberta de neve embaixo, com pinheiros (estrelas verdes escuras vistas de cima).
    g.fillStyle = '#f7fbff';
    g.beginPath();
    g.moveTo(-w / 2, h / 2);
    for (let x = -w / 2; x <= w / 2; x += 30 * s) g.lineTo(x, h / 2 - (90 + 30 * Math.sin(x / (60 * s))) * s);
    g.lineTo(w / 2, h / 2);
    g.closePath();
    g.fill();
    const pinheiro = (x, y, raio) => {
      sombra(g, s, (sh) => {
        g.fillStyle = sh ? 'rgba(20, 40, 60, 0.3)' : '#1f4d38';
        g.beginPath();
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * Math.PI * 2;
          const rr = k % 2 ? raio * 0.55 : raio;
          g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
        }
        g.closePath();
        g.fill();
      }, 14);
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(x - raio * 0.2, y - raio * 0.2, raio * 0.25, 0, Math.PI * 2);
      g.fill();
    };
    for (let k = 0; k < 6; k++) pinheiro(-w / 2 + (k + 0.5) * (w / 6), h / 2 - (40 + 30 * r()) * s, (40 + 20 * r()) * s);
    pinheiro(-w / 2 + 60 * s, -h / 2 + 60 * s, 55 * s);
    pinheiro(w / 2 - 60 * s, -h / 2 + 80 * s, 50 * s);
    g.fillStyle = 'rgba(255, 255, 255, 0.95)';
    for (let k = 0; k < 600; k++) g.fillRect((r() - 0.5) * w, (r() - 0.5) * h, 2.5 * s, 2.5 * s);
  },

  // Prato de gelo da final (temporada 1, ep. 50 e 51): rinque com marcas, arquibancada com plateia e
  // refletores frios.
  rinque(g, { w, h, R, s, r }) {
    g.fillStyle = '#eef6fb';
    g.fillRect(-w / 2, -h / 2, w, h);
    g.strokeStyle = 'rgba(42, 111, 209, 0.5)';
    g.lineWidth = 8 * s;
    for (const y of [-R - 60 * s, R + 60 * s]) {
      g.beginPath();
      g.moveTo(-w / 2, y);
      g.lineTo(w / 2, y);
      g.stroke();
    }
    g.strokeStyle = 'rgba(215, 38, 46, 0.55)';
    g.beginPath();
    g.moveTo(-w / 2, 0);
    g.lineTo(w / 2, 0);
    g.stroke();
    g.strokeStyle = 'rgba(120, 150, 175, 0.35)';
    g.lineWidth = Math.max(1, s);
    for (let k = 0; k < 70; k++) {
      g.beginPath();
      g.arc((r() - 0.5) * w, (r() - 0.5) * h, (80 + 200 * r()) * s, r() * 6, r() * 6 + 0.6);
      g.stroke();
    }
    // Arquibancada nas laterais: degraus escuros com a plateia em pontinhos coloridos.
    const arq = Math.max(70 * s, (w - 2 * (R + 30 * s)) / 2 - 10 * s);
    for (const lado of [-1, 1]) {
      const x0 = lado < 0 ? -w / 2 : w / 2 - arq;
      g.fillStyle = '#1b2340';
      g.fillRect(x0, -h / 2, arq, h);
      for (let k = 0; k < 6; k++) {
        g.fillStyle = k % 2 ? '#222c50' : '#18203a';
        g.fillRect(x0 + (lado < 0 ? k : 5 - k) * (arq / 6), -h / 2, arq / 6, h);
      }
      for (let k = 0; k < 500; k++) {
        g.fillStyle = ['#ffd400', '#d7262e', '#4fd8e0', '#ffffff', '#ff8a3d'][k % 5];
        g.fillRect(x0 + r() * arq, -h / 2 + r() * h, 4 * s, 4 * s);
      }
      // Muro do rinque.
      g.fillStyle = '#ffffff';
      g.fillRect(lado < 0 ? x0 + arq - 8 * s : x0, -h / 2, 8 * s, h);
    }
    // Neve fina caindo.
    g.fillStyle = 'rgba(255, 255, 255, 0.9)';
    for (let k = 0; k < 300; k++) g.fillRect((r() - 0.5) * w, (r() - 0.5) * h, 3 * s, 3 * s);
  },

  // Praia de treino (V-Force, ep. 15 e 40): areia, mar com ondas e espuma, guarda-sol, toalha, conchas,
  // pegadas e um coqueiro.
  praia(g, { w, h, R, s, r }) {
    g.fillStyle = '#e6c98d';
    g.fillRect(-w / 2, -h / 2, w, h);
    g.strokeStyle = 'rgba(160, 120, 60, 0.35)';
    g.lineWidth = Math.max(1, 1.5 * s);
    for (let y = -h / 2; y < h / 2; y += 22 * s) {
      g.beginPath();
      for (let x = -w / 2; x <= w / 2; x += 20 * s) g.lineTo(x, y + Math.sin(x / (40 * s) + y) * 5 * s);
      g.stroke();
    }
    // Mar no topo, com duas linhas de espuma.
    const mar = 170 * s;
    const grad = g.createLinearGradient(0, -h / 2, 0, -h / 2 + mar);
    grad.addColorStop(0, '#1c5f9e');
    grad.addColorStop(1, '#3fa3d8');
    g.fillStyle = grad;
    g.fillRect(-w / 2, -h / 2, w, mar);
    for (const [y, a] of [[mar, 0.95], [mar - 50 * s, 0.5]]) {
      g.strokeStyle = `rgba(255, 255, 255, ${a})`;
      g.lineWidth = 7 * s;
      g.beginPath();
      for (let x = -w / 2; x <= w / 2; x += 14 * s) g.lineTo(x, -h / 2 + y + Math.sin(x / (28 * s)) * 9 * s);
      g.stroke();
    }
    // Guarda-sol listrado com a toalha ao lado.
    const [gx, gy] = [-w / 2 + 110 * s, h / 2 - 120 * s];
    g.fillStyle = 'rgba(80, 50, 10, 0.25)';
    g.beginPath();
    g.arc(gx + 25 * s, gy + 25 * s, 95 * s, 0, Math.PI * 2);
    g.fill();
    for (let k = 0; k < 8; k++) {
      g.fillStyle = k % 2 ? '#ffffff' : '#d7262e';
      g.beginPath();
      g.moveTo(gx, gy);
      g.arc(gx, gy, 90 * s, (k / 8) * Math.PI * 2, ((k + 1) / 8) * Math.PI * 2);
      g.closePath();
      g.fill();
    }
    retangulo(g, w / 2 - 150 * s, h / 2 - 220 * s, 80 * s, 160 * s, '#2a6fd1');
    g.fillStyle = '#ffd400';
    for (let y = h / 2 - 210 * s; y < h / 2 - 70 * s; y += 30 * s) g.fillRect(w / 2 - 150 * s, y, 80 * s, 10 * s);
    // Coqueiro: folhas em estrela.
    const [px, py] = [w / 2 - 90 * s, -h / 2 + mar + 120 * s];
    g.strokeStyle = '#2f7a33';
    g.lineWidth = 16 * s;
    g.lineCap = 'round';
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      g.beginPath();
      g.moveTo(px, py);
      g.quadraticCurveTo(px + Math.cos(a) * 60 * s, py + Math.sin(a) * 40 * s, px + Math.cos(a) * 110 * s, py + Math.sin(a) * 110 * s);
      g.stroke();
    }
    g.fillStyle = '#6b4a24';
    g.beginPath();
    g.arc(px, py, 16 * s, 0, Math.PI * 2);
    g.fill();
    // Conchas e pegadas.
    for (let k = 0; k < 20; k++) {
      g.fillStyle = r() < 0.5 ? '#f7e8e0' : '#e9b8a8';
      g.beginPath();
      g.arc((r() - 0.5) * w, (r() - 0.2) * h * 0.8, (4 + 4 * r()) * s, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = 'rgba(150, 110, 60, 0.4)';
    for (let k = 0; k < 10; k++) {
      g.beginPath();
      g.ellipse(-R - 90 * s + (k % 2) * 20 * s, -h / 2 + mar + 40 * s + k * 50 * s, 7 * s, 12 * s, 0.2, 0, Math.PI * 2);
      g.fill();
    }
  },

  // Estádio da BEGA (G-Revolution, ep. 36): palco escuro, refletores, telões nas laterais e a plateia.
  bega(g, { w, h, R, s, r }) {
    g.fillStyle = '#120e24';
    g.fillRect(-w / 2, -h / 2, w, h);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + 0.3;
      const x = Math.cos(a) * w;
      const y = Math.sin(a) * h;
      const grad = g.createLinearGradient(x, y, 0, 0);
      grad.addColorStop(0, 'rgba(170, 140, 255, 0)');
      grad.addColorStop(1, 'rgba(170, 140, 255, 0.26)');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(Math.cos(a + 0.45) * R, Math.sin(a + 0.45) * R);
      g.lineTo(Math.cos(a - 0.45) * R, Math.sin(a - 0.45) * R);
      g.closePath();
      g.fill();
    }
    // Piso do palco com o anel de LED em volta do prato.
    g.strokeStyle = '#7b5cff';
    g.lineWidth = 6 * s;
    g.beginPath();
    g.arc(0, 0, R + 70 * s, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = 'rgba(123, 92, 255, 0.35)';
    g.lineWidth = 18 * s;
    g.beginPath();
    g.arc(0, 0, R + 70 * s, 0, Math.PI * 2);
    g.stroke();
    // Telões nas laterais, com o brilho da transmissão.
    for (const lado of [-1, 1]) {
      const x0 = lado < 0 ? -w / 2 + 20 * s : w / 2 - 120 * s;
      g.fillStyle = '#05040c';
      g.fillRect(x0, -h * 0.3, 100 * s, h * 0.6);
      const tela = g.createLinearGradient(0, -h * 0.28, 0, h * 0.28);
      tela.addColorStop(0, '#3b2a8a');
      tela.addColorStop(1, '#a14fd1');
      g.fillStyle = tela;
      g.fillRect(x0 + 8 * s, -h * 0.28, 84 * s, h * 0.56);
      g.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      g.lineWidth = 3 * s;
      g.beginPath();
      g.arc(x0 + 50 * s, 0, 28 * s, 0, Math.PI * 2);
      g.stroke();
    }
    // Plateia em anel, longe do prato.
    for (let k = 0; k < 1300; k++) {
      const a = r() * Math.PI * 2;
      const d = R + (150 + 450 * r()) * s;
      g.fillStyle = ['#ffd400', '#d7262e', '#4fd8e0', '#ffffff'][k % 4];
      g.globalAlpha = 0.25 + 0.45 * r();
      g.fillRect(Math.cos(a) * d, Math.sin(a) * d, 3.5 * s, 3.5 * s);
    }
    g.globalAlpha = 1;
    // Refletores nos cantos.
    for (const [x, y] of cantos(w, h, 40 * s)) {
      g.fillStyle = 'rgba(220, 210, 255, 0.35)';
      g.beginPath();
      g.arc(x, y, 40 * s, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#f2eeff';
      g.beginPath();
      g.arc(x, y, 16 * s, 0, Math.PI * 2);
      g.fill();
    }
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
