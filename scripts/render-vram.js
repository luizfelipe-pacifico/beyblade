// Converte os snapshots do mGBA (scripts/mgba/dump-vram.lua) em PNGs dos sprites.
// Uso: node scripts/render-vram.js [pasta-snapshots] [pasta-saida]
// Cada sprite distinto vira um PNG (deduplicado por conteúdo) e sprites.json diz em quais snapshots apareceu.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { encodePng, parseOam, renderSprite } from './lib/gba-gfx.js';

const [snapDir = 'assets-rom/mgba', outDir = 'assets-rom/sprites-vram'] = process.argv.slice(2);

const prefixes = [...new Set(readdirSync(snapDir).filter((f) => f.endsWith('-oam.bin')).map((f) => f.slice(0, -'oam.bin'.length)))].sort();
if (prefixes.length === 0) {
  console.error(`nenhum snapshot em ${snapDir}. Rode scripts/mgba/dump-vram.lua no mGBA primeiro.`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const index = new Map();
for (const prefix of prefixes) {
  const read = (name) => readFileSync(join(snapDir, `${prefix}${name}.bin`));
  const io = read('io');
  const ctx = { vram: read('vram'), pal: read('pal'), oneDimensional: (io.readUInt16LE(0) & 0x40) !== 0 };
  for (const sprite of parseOam(read('oam'))) {
    const { width, height, rgba } = renderSprite(sprite, ctx);
    if (!rgba.some((v, i) => i % 4 === 3 && v)) continue;
    const id = createHash('sha1').update(rgba).digest('hex').slice(0, 12);
    if (!index.has(id)) {
      writeFileSync(join(outDir, `${width}x${height}-${id}.png`), encodePng(width, height, rgba));
      index.set(id, { file: `${width}x${height}-${id}.png`, width, height, snapshots: [] });
    }
    index.get(id).snapshots.push(prefix.replace(/-$/, ''));
  }
}
writeFileSync(join(outDir, 'sprites.json'), `${JSON.stringify([...index.values()], null, 2)}\n`);
console.log(`${prefixes.length} snapshots → ${index.size} sprites em ${outDir}`);
