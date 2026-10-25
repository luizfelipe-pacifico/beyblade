// Extrai o catálogo (beys, peças, feras bit) da ROM: node scripts/extract-rom.js <rom.gba> [pasta-saida]
// A saída padrão é assets-rom/ (fora do git, D-007).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { BB2E, extractCatalog, gameCode } from './lib/rom.js';

const [romPath, outDir = 'assets-rom'] = process.argv.slice(2);
if (!romPath) {
  console.error('uso: node scripts/extract-rom.js <rom.gba> [pasta-saida]');
  process.exit(1);
}

const rom = readFileSync(romPath);
const sha1 = createHash('sha1').update(rom).digest('hex');
if (gameCode(rom) !== BB2E.gameCode || sha1 !== BB2E.sha1) {
  console.error(`ROM não reconhecida (código ${gameCode(rom)}, SHA-1 ${sha1}). Esperado: ${BB2E.gameCode} / ${BB2E.sha1}.`);
  process.exit(1);
}

const catalog = extractCatalog(rom);
mkdirSync(join(outDir, 'data'), { recursive: true });
const outFile = join(outDir, 'data', 'catalog.json');
writeFileSync(outFile, `${JSON.stringify({ sha1, ...catalog }, null, 2)}\n`);
console.log(`${outFile}: ${catalog.beyblades.length} beys, ${catalog.bitBeasts.length} feras bit, ` +
  Object.entries(catalog.parts).map(([k, v]) => `${v.length} ${k}`).join(', '));
