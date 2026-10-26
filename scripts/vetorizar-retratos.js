// Vetoriza os retratos dos personagens a partir de imagens que o próprio usuário escolheu (D-033).
// Entrada: assets-usuario/personagens/<slug>.png|jpg|jpeg|webp (de preferência com fundo transparente).
// Saída:   assets-usuario/personagens/vetor/<slug>.svg, 512×640 como o retrato próprio; o sync-art
// troca o retrato próprio por este. Tudo em assets-usuario/ fica fora do git: imagem do anime tem
// direitos autorais e é só para uso pessoal, como a ROM (D-007).
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import ImageTracer from 'imagetracerjs';
import { roster } from '../src/content/roster.js';

const root = path.join(import.meta.dirname, '..');
const entrada = path.join(root, 'assets-usuario', 'personagens');
const saida = path.join(entrada, 'vetor');
const W = 512;
const H = 640;
const EXT = /\.(png|jpe?g|webp)$/i;

// Traço de anime: poucas cores chapadas, contorno escuro. 28 cores (CORES=… muda) seguram pele,
// cabelo e sombra sem virar ruído; pathomit tira manchinhas da compressão do vídeo.
const CORES = Number(process.env.CORES) || 28;
// Traçado em 2× para o contorno fino do anime não quebrar; o viewBox volta para 512×640.
const ESCALA = 2;
const OPCOES = {
  ltres: 0.5,
  qtres: 0.5,
  pathomit: 16,
  rightangleenhance: false,
  strokewidth: 0,
  roundcoords: 1,
  scale: 1 / ESCALA,
  viewbox: false,
};

// A quantização do imagetracer desbota cor pequena (a pintura no rosto do Kai virava preta). A do
// sharp (libimagequant) é boa: reduz antes e passa a paleta exata, então o traçado só segue regiões.
async function quantizar(arquivo) {
  const png = await sharp(arquivo)
    .resize(W * ESCALA, H * ESCALA, { fit: 'cover', position: 'top' })
    .ensureAlpha()
    .png({ palette: true, colors: CORES, dither: 0 })
    .toBuffer();
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cores = new Map();
  for (let i = 0; i < data.length; i += 4) {
    // Alfa binário: borda semitransparente vira camada translúcida e o retrato parece lavado.
    data[i + 3] = data[i + 3] < 128 ? 0 : 255;
    if (data[i + 3] === 0) data[i] = data[i + 1] = data[i + 2] = 0;
    const k = (data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3];
    if (!cores.has(k)) cores.set(k, { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] });
  }
  return { data, info, pal: [...cores.values()] };
}

const slugs = new Map(roster.map((p) => [p.slug, p]));
if (!existsSync(entrada)) {
  mkdirSync(entrada, { recursive: true });
  console.log(`Coloque as imagens em ${path.relative(root, entrada)}/<slug>.png (slugs: ${[...slugs.keys()].join(', ')}).`);
  process.exit(0);
}
mkdirSync(saida, { recursive: true });

let feitos = 0;
for (const nome of readdirSync(entrada)) {
  if (!EXT.test(nome)) continue;
  const slug = nome.replace(EXT, '');
  const p = slugs.get(slug);
  if (!p) {
    console.warn(`ignorado: ${nome} (slug fora do elenco)`);
    continue;
  }
  // Enquadra como o retrato próprio: cobre 512×640 ancorado no topo (o rosto fica em cima).
  const { data, info, pal } = await quantizar(path.join(entrada, nome));
  const opcoes = { ...OPCOES, pal, numberofcolors: pal.length, colorquantcycles: 1 };
  const svg = ImageTracer.imagedataToSVG({ width: info.width, height: info.height, data: new Uint8ClampedArray(data) }, opcoes)
    // Camadas totalmente transparentes (o fundo removido) não precisam ir para o arquivo.
    .replace(/<path[^>]*opacity="0"[^>]*\/>/g, '')
    .replace(/<svg ([^>]*)>/, `<svg $1 viewBox="0 0 ${W} ${H}"><title>${p.nome}</title><desc>Retrato vetorizado de imagem fornecida pelo usuário, só para uso pessoal (fora do git).</desc>`);
  writeFileSync(path.join(saida, `${slug}.svg`), svg);
  console.log(`${slug}: ${(svg.length / 1024).toFixed(0)} KB`);
  feitos++;
}
console.log(`${feitos} retrato(s) vetorizado(s) em ${path.relative(root, saida)}. Rode "npm run art:sync" para usar no jogo.`);
