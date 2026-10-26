// Ícone do jogo a partir de assets/icon/fonte.jpg (arte enviada pelo usuário, com fundo quadriculado falso):
// detecta o círculo do emblema, tira o fundo, vetoriza e gera os formatos. node scripts/build-icon.mjs
// Saídas: app/icon.svg e app/favicon.ico (convenção do Next para a aba do navegador), build/icon.ico e
// public/icon-512.png (janela e barra de tarefas do Electron/Windows) e assets/icon/icone.png (raster mestre).
// Usa o sharp e o VTracer já instalados em site/ (scripts/vectorize-beyblades.mjs), sem dependência nova.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { circleFromRays, encodeIco } from './lib/icon.js';

const root = join(import.meta.dirname, '..');
const require = createRequire(join(root, 'site', 'package.json'));
const sharp = require('sharp');
const vtracer = require('@visioncortex/vtracer');

const SIZE = 1024;
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];

const { data, info } = await sharp(join(root, 'assets/icon/fonte.jpg')).resize(SIZE, SIZE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const pixel = (x, y) => {
  const i = (Math.round(y) * info.width + Math.round(x)) * 4;
  return [data[i], data[i + 1], data[i + 2]];
};
const circle = circleFromRays(pixel, info.width, info.height);
console.log(`círculo: centro (${circle.cx.toFixed(1)}, ${circle.cy.toFixed(1)}), raio ${circle.r.toFixed(1)}`);

// Máscara circular com 1,5 px de transição (borda lisa) e recorte quadrado justo no círculo.
const r = circle.r - 1;
const rgba = Buffer.from(data);
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const d = Math.hypot(x + 0.5 - circle.cx, y + 0.5 - circle.cy);
    const a = Math.max(0, Math.min(1, (r - d) / 1.5 + 0.5));
    rgba[(y * info.width + x) * 4 + 3] = Math.round(a * 255);
  }
}
const side = Math.ceil(r * 2) + 2;
const left = Math.round(circle.cx - side / 2);
const top = Math.round(circle.cy - side / 2);
const master = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .extract({ left, top, width: side, height: side })
  .resize(SIZE, SIZE, { kernel: 'lanczos3' })
  .png()
  .toBuffer();
mkdirSync(join(root, 'assets/icon'), { recursive: true });
writeFileSync(join(root, 'assets/icon/icone.png'), master);

// Vetor: VTracer nas cores do raster mestre e recorte por um círculo vetorial exato (sem serrilhado).
// Traçado em 512 px com menos níveis de cor: o ícone fica leve (é baixado em toda aba) sem perder a leitura.
const TRACE = 512;
const flat = await sharp(master).resize(TRACE, TRACE).flatten({ background: '#0d1226' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const traced = vtracer.convertPixels(flat.data, flat.info.width, flat.info.height, {
  mode: 'spline', colorPrecision: 6, layerDifference: 12, filterSpeckle: 6,
  cornerThreshold: 60, lengthThreshold: 4, spliceThreshold: 45, pathPrecision: 1,
});
const inner = traced.match(/<svg\b[^>]*>([\s\S]*)<\/svg>/)[1];
const half = TRACE / 2;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TRACE} ${TRACE}" width="${SIZE}" height="${SIZE}">
<title>Beyblade Arena</title>
<defs><clipPath id="emblema"><circle cx="${half}" cy="${half}" r="${half - 4}"/></clipPath></defs>
<g clip-path="url(#emblema)">${inner}</g>
</svg>
`;
if (/<image\b|data:image/i.test(svg)) throw new Error('o SVG não pode ter raster embutido');
mkdirSync(join(root, 'app'), { recursive: true });
writeFileSync(join(root, 'app/icon.svg'), svg);

// .ico com PNGs de cada tamanho, reduzidos do raster (fica mais nítido que rasterizar o vetor em 16 px).
const pngs = await Promise.all(ICO_SIZES.map((s) => sharp(master).resize(s, s, { kernel: 'lanczos3' }).png().toBuffer()));
const ico = encodeIco(ICO_SIZES.map((s, i) => ({ size: s, png: pngs[i] })));
writeFileSync(join(root, 'app/favicon.ico'), ico);
mkdirSync(join(root, 'build'), { recursive: true });
writeFileSync(join(root, 'build/icon.ico'), ico);
await sharp(master).resize(512, 512).png().toFile(join(root, 'public/icon-512.png'));
console.log(`app/icon.svg (${(svg.length / 1024).toFixed(0)} KiB), app/favicon.ico e build/icon.ico (${ICO_SIZES.join(', ')} px), public/icon-512.png`);
