// Gera os retratos e as feras bit do PS1 para o jogo (D-040): node scripts/build-ps1-assets.js [pasta-ps1]
// Lê os arquivos do disco extraído (padrão ../ps1-bbt2, de scripts/extract-ps1.js), descomprime (ECD + TIM),
// amplia 4x com Scale2x duas vezes e grava em public/ps1/ (fora do git) com ps1.json.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { containerEntries, ecdDecompress, isEcd, timToRgba } from './lib/ps1-ecd.js';
import { scale4x } from './lib/pixel-scale.js';
import { encodePng } from './lib/gba-gfx.js';
import { PS1_BEASTS, PS1_POSES, PS1_PORTRAITS, ps1Beast, ps1Portrait } from '../src/content/ps1.js';

const base = resolve(process.argv[2] ?? join(import.meta.dirname, '..', '..', 'ps1-bbt2'));
const dir = join(base, 'files', 'OUTBIN');
if (!existsSync(dir)) {
  console.error(`disco do PS1 não extraído em ${dir}. Rode antes: node scripts/extract-ps1.js "<jogo>.bin"`);
  process.exit(1);
}
const out = join(import.meta.dirname, '..', 'public');

function images(file) {
  const buf = readFileSync(join(dir, `${file}.BIN`));
  const map = new Map();
  for (const { index, offset } of containerEntries(buf)) {
    if (isEcd(buf, offset)) map.set(index, timToRgba(ecdDecompress(buf, offset)));
  }
  return map;
}

function save(publicPath, img) {
  const big = scale4x(img.rgba, img.width, img.height);
  const target = join(out, publicPath);
  mkdirSync(join(target, '..'), { recursive: true });
  writeFileSync(target, encodePng(big.width, big.height, big.rgba));
  return { src: publicPath, width: big.width, height: big.height };
}

const manifest = { personagens: {}, feras: {} };
for (const [slug, file] of Object.entries(PS1_PORTRAITS)) {
  const imgs = images(file);
  manifest.personagens[slug] = {};
  for (const [pose, [a, b]] of Object.entries(PS1_POSES)) {
    manifest.personagens[slug][pose] = { a: save(ps1Portrait(slug, pose, 'a'), imgs.get(a)), b: save(ps1Portrait(slug, pose, 'b'), imgs.get(b)) };
  }
}
const beasts = images('BSJEF00D');
for (const [fera, entry] of Object.entries(PS1_BEASTS)) manifest.feras[fera] = save(ps1Beast(fera), beasts.get(entry));

writeFileSync(join(out, 'ps1', 'ps1.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`public/ps1: ${Object.keys(manifest.personagens).length} personagens × ${Object.keys(PS1_POSES).length} expressões, ${Object.keys(manifest.feras).length} feras (4x)`);
