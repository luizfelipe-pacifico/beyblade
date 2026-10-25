// Extrai todos os sprites (conjuntos de quadros) da ROM para PNG: node scripts/extract-sprites.js <rom.gba> [pasta-saida]
// Paleta, em ordem: a do registro da bey; a do blader (bonecos do mapa); a que aparece logo depois do ponteiro
// do sprite nos scripts do jogo (heurística, ver docs/REVERSE_ENGINEERING.md); senão, tons de cinza.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { BB2E, extractCatalog, gameCode } from './lib/rom.js';
import { bladerPalettes, findFrameSets, guessPalettes, renderSheet } from './lib/rom-sprites.js';
import { encodePng } from './lib/gba-gfx.js';

const [romPath, outDir = 'assets-rom/sprites'] = process.argv.slice(2);
if (!romPath) {
  console.error('uso: node scripts/extract-sprites.js <rom.gba> [pasta-saida]');
  process.exit(1);
}

const rom = readFileSync(romPath);
const sha1 = createHash('sha1').update(rom).digest('hex');
if (gameCode(rom) !== BB2E.gameCode || sha1 !== BB2E.sha1) {
  console.error(`ROM não reconhecida (código ${gameCode(rom)}, SHA-1 ${sha1}).`);
  process.exit(1);
}

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const catalog = extractCatalog(rom);
const sets = findFrameSets(rom);
const palettes = guessPalettes(rom, sets);
const bladers = bladerPalettes(rom);
const beyBySet = new Map(catalog.beyblades.map((b) => [b.graphics - 0x08000000, b]));

mkdirSync(join(outDir, 'beys'), { recursive: true });
mkdirSync(join(outDir, 'other'), { recursive: true });
const index = [];
for (const { offset, header } of sets) {
  const bey = beyBySet.get(offset);
  const source = bey ? 'bey' : bladers.has(offset) ? 'blader' : palettes.has(offset) ? 'guessed' : 'none';
  const palette = { bey: bey && bey.palette - 0x08000000, blader: bladers.get(offset), guessed: palettes.get(offset), none: null }[source];
  const file = bey
    ? join('beys', `${String(bey.index).padStart(2, '0')}-${slug(bey.names.en)}.png`)
    : join('other', `${offset.toString(16)}-${header.width}x${header.height}.png`);
  const { width, height, rgba } = renderSheet(rom, offset, header, palette);
  writeFileSync(join(outDir, file), encodePng(width, height, rgba));
  index.push({
    file: file.replaceAll('\\', '/'),
    rom: `0x${(offset + 0x08000000).toString(16)}`,
    bey: bey?.names.en ?? null,
    frames: header.frameCount,
    size: `${header.width}x${header.height}`,
    bpp: header.bpp,
    compressed: header.compressed,
    palette: palette === null ? null : `0x${(palette + 0x08000000).toString(16)}`,
    paletteSource: source,
  });
}
writeFileSync(join(outDir, 'sprites.json'), `${JSON.stringify(index, null, 2)}\n`);
const count = (src) => index.filter((s) => s.paletteSource === src).length;
console.log(`${index.length} conjuntos em ${outDir}: ${count('bey')} beys, ${count('blader')} bladers, ${count('guessed')} com paleta deduzida, ${count('none')} em cinza`);
