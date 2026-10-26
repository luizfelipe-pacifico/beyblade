// Baixa da Beyblade Wiki a arte do G-Revolution dos personagens sem retrato do PS1 (D-046), recorta o
// busto em 4:5, tira o fundo e amplia para 512×640 (Lanczos + nitidez leve). Grava o PNG em
// assets-usuario/personagens/wiki/ e um retrato.svg que embute esse PNG em assets-usuario/personagens/vetor/,
// de onde o sync-art o põe no lugar do retrato próprio (D-033). Tudo fora do git.
// Vetorizar estas imagens pequenas dava 2–4 MB de ruído; o raster embutido fica nítido e leve.
// Uso: node scripts/retratos-wiki.js [slug...]  e depois  npm run art:sync
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.join(import.meta.dirname, '..');
const entrada = path.join(root, 'assets-usuario', 'personagens');
const fonte = path.join(entrada, 'fonte');
const wiki = path.join(entrada, 'wiki');
const vetor = path.join(entrada, 'vetor');
const W = 512;
const H = 640;
const API = 'https://beyblade.fandom.com/api.php';
// O CDN da wiki só entrega a imagem para um pedido com cabeçalhos de navegador comum.
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  Accept: 'image/png,image/jpeg,image/*;q=0.8',
  Referer: 'https://beyblade.fandom.com/',
};

// arquivo: nome na wiki; busto: [x, y, largura] em px da imagem original (a altura sai de 4:5);
// fundo: passadas de removerFundo. Sem `cor`, entra o vizinho parecido (fundo liso ou degradê); com `cor`,
// entra o pixel que é cor de fundo (fundo estampado). `ateY` limita as sementes das laterais ao alto.
// A segunda passada come a franja clara (antisserrilhado do JPEG) que sobra colada no fundo branco.
const LISO = [{}, { cor: ([r, g, b]) => Math.min(r, g, b) > 185 }];
export const RETRATOS_WIKI = {
  lee: { arquivo: 'Lee Wong.png', busto: [20, 18, 310], fundo: LISO, origem: 'arte oficial do G-Revolution' },
  tala: { arquivo: 'TalaGRev.jpg', busto: [80, 0, 260], fundo: LISO, origem: 'arte oficial do G-Revolution' },
  'bryan-kuznetsov': { arquivo: 'Bryan1.jpg', busto: [25, 0, 160], fundo: LISO, origem: 'arte oficial do G-Revolution' },
  'brooklyn-masefield': {
    arquivo: 'Beyblade-postac-napisy.jpg',
    busto: [50, 80, 340],
    fundo: [{ cor: ([r, g, b]) => b - r >= 25 && b - g >= 25 }],
    origem: 'wallpaper oficial do G-Revolution',
  },
  'robert-jurgen': {
    arquivo: 'Robert Jurgens.png',
    busto: [95, 0, 285],
    // Parede verde e, embaixo à direita, a luz amarelada; a pele (vermelho bem acima do verde) fica.
    fundo: [
      { cor: ([r, g, b]) => g - r >= 12 && g - b >= 12, ateY: 0.55 },
      { cor: ([r, g, b]) => g - b >= 30 && r - g <= 12, ateY: 0.55 },
    ],
    origem: 'quadro do G-Revolution',
  },
};

async function urlDe(arquivo) {
  const q = new URLSearchParams({ action: 'query', titles: `File:${arquivo}`, prop: 'imageinfo', iiprop: 'url', format: 'json', formatversion: '2' });
  const res = await fetch(`${API}?${q}`, { headers: { 'User-Agent': HEADERS['User-Agent'] } });
  const url = (await res.json()).query?.pages?.[0]?.imageinfo?.[0]?.url;
  if (!url) throw new Error(`arquivo não encontrado na wiki: ${arquivo}`);
  return `${url.split('?')[0]}?format=original`;
}

async function baixar(arquivo) {
  const destino = path.join(fonte, arquivo.replace(/[^\w.-]+/g, '_'));
  if (existsSync(destino)) return destino;
  const res = await fetch(await urlDe(arquivo), { headers: HEADERS });
  const tipo = res.headers.get('content-type') ?? '';
  if (!res.ok || !tipo.startsWith('image/')) throw new Error(`download recusado (${res.status} ${tipo}): ${arquivo}`);
  writeFileSync(destino, Buffer.from(await res.arrayBuffer()));
  return destino;
}

// Tira o fundo crescendo uma região a partir da borda e do que já é transparente: entra o vizinho de cor
// parecida com a do pixel atual (aguenta degradê e textura suave) e o contorno escuro do anime segura a
// região; com `cor`, entra o vizinho que passa no teste de cor de fundo.
export function removerFundo(data, width, height, { tolerancia = 30, contorno = 70, cor, ateY = 1 } = {}) {
  const fundo = new Uint8Array(width * height);
  const fila = new Int32Array(width * height);
  let ini = 0;
  let fim = 0;
  const px = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
  const luz = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;
  const aceita = (i) => (cor ? cor(px(i)) : luz(px(i)) >= contorno);
  const marcar = (i) => {
    if (fundo[i] || !aceita(i)) return;
    fundo[i] = 1;
    fila[fim++] = i;
  };
  for (let i = 0; i < width * height; i++) {
    if (data[i * 4 + 3] === 0) {
      fundo[i] = 1;
      fila[fim++] = i;
    }
  }
  for (let x = 0; x < width; x++) {
    marcar(x);
    if (ateY === 1) marcar((height - 1) * width + x);
  }
  for (let y = 0; y < height * ateY; y++) {
    marcar(y * width);
    marcar(y * width + width - 1);
  }
  while (ini < fim) {
    const i = fila[ini++];
    const x = i % width;
    const y = (i - x) / width;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const j = ny * width + nx;
      if (fundo[j]) continue;
      // O transparente de partida não tem cor confiável: dele só sai para quem passa no teste.
      const semelhante = data[i * 4 + 3] === 0 || px(i).reduce((t, v, k) => t + Math.abs(v - data[j * 4 + k]), 0) <= tolerancia;
      if (cor || semelhante) marcar(j);
    }
  }
  for (let i = 0; i < width * height; i++) if (fundo[i]) data[i * 4 + 3] = 0;
  return data;
}

async function preparar(slug, cfg) {
  const arquivo = await baixar(cfg.arquivo);
  const img = sharp(arquivo).ensureAlpha();
  const meta = await img.metadata();
  const [x, y, w] = cfg.busto;
  const h = Math.min(Math.round(w * 1.25), meta.height - y);
  const { data, info } = await img.extract({ left: x, top: y, width: Math.min(w, meta.width - x), height: h }).raw().toBuffer({ resolveWithObject: true });
  for (const passada of cfg.fundo) removerFundo(data, info.width, info.height, passada);
  const png = await sharp(data, { raw: info })
    .resize(W, H, { fit: 'cover', position: 'top', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.8 })
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(path.join(wiki, `${slug}.png`), png);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><title>${slug}</title><desc>${cfg.origem} (Beyblade Wiki: ${cfg.arquivo}), só para uso pessoal, fora do git.</desc><image width="${W}" height="${H}" href="data:image/png;base64,${png.toString('base64')}"/></svg>`;
  writeFileSync(path.join(vetor, `${slug}.svg`), svg);
  console.log(`${slug}: ${cfg.arquivo} (${cfg.origem}), busto ${info.width}×${info.height} → ${W}×${H}, ${(svg.length / 1024).toFixed(0)} KB`);
}

if (import.meta.main ?? process.argv[1] === import.meta.filename) {
  for (const d of [fonte, wiki, vetor]) mkdirSync(d, { recursive: true });
  const pedidos = process.argv.slice(2);
  for (const [slug, cfg] of Object.entries(RETRATOS_WIKI)) {
    if (pedidos.length && !pedidos.includes(slug)) continue;
    await preparar(slug, cfg);
  }
  console.log('Agora: npm run art:sync');
}
