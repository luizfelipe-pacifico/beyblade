// Gera os dados e imagens da ROM que o jogo usa: node scripts/build-rom-assets.js <rom.gba> [pasta-saida]
// Saída padrão em public/rom/ (fora do git, D-007): gba.json, beys/<slug>.png, walk/<personagem>.png, stadiums/<n>-*.png.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { BB2E, extractCatalog, gameCode } from './lib/rom.js';
import { readFrameSetHeader } from './lib/rom-frames.js';
import { renderSheet } from './lib/rom-sprites.js';
import { lz77Decompress, readStadiums, renderAffineBg } from './lib/rom-bg.js';
import { encodePng } from './lib/gba-gfx.js';
import { GBA_BEYS, GBA_WALK, WALK_FRAMES, WALK_FRAME_COUNT, WALK_FRAME_SIZE, gbaPartTotals } from '../src/content/gba.js';

const ROM_BASE = 0x08000000;
const BLADER_PALETTES = 0x910e8;

const [romPath, outDir = 'public/rom'] = process.argv.slice(2);
if (!romPath) {
  console.error('uso: node scripts/build-rom-assets.js <rom.gba> [pasta-saida]');
  process.exit(1);
}

const rom = readFileSync(romPath);
const sha1 = createHash('sha1').update(rom).digest('hex');
if (gameCode(rom) !== BB2E.gameCode || sha1 !== BB2E.sha1) {
  console.error(`ROM não reconhecida (código ${gameCode(rom)}, SHA-1 ${sha1}).`);
  process.exit(1);
}

const catalog = extractCatalog(rom);
const png = (dir, name, { width, height, rgba }) => {
  mkdirSync(join(outDir, dir), { recursive: true });
  writeFileSync(join(outDir, dir, name), encodePng(width, height, rgba));
  return `/rom/${dir}/${name}`;
};
const partName = (kind, index) => catalog.parts[kind][index]?.names.en ?? null;

const beys = {};
for (const [slug, index] of Object.entries(GBA_BEYS)) {
  const bey = catalog.beyblades[index];
  const graphics = bey.graphics - ROM_BASE;
  const header = readFrameSetHeader(rom, graphics);
  beys[slug] = {
    rom: index,
    nome: bey.names.en,
    tipo: bey.type,
    spin: bey.spin,
    season: bey.season,
    special: catalog.bitBeasts[bey.bitBeast]?.specialNames.en ?? null,
    parts: {
      attackRing: partName('attackRings', bey.attackRing),
      weightDisk: partName('weightDisks', bey.weightDisk),
      spinGear: partName('spinGears', bey.spinGear),
      bladeBase: partName('bladeBases', bey.bladeBase),
    },
    totals: gbaPartTotals(bey, catalog.parts),
    sprite: png('beys', `${slug}.png`, renderSheet(rom, graphics, header, bey.palette - ROM_BASE)),
    frames: header.frameCount,
    frameSize: { width: header.width, height: header.height },
  };
}

const walk = {};
for (const [slug, info] of Object.entries(GBA_WALK)) {
  const header = readFrameSetHeader(rom, info.sprite);
  if (header.frameCount !== WALK_FRAME_COUNT) throw new Error(`${slug}: esperado ${WALK_FRAME_COUNT} quadros, veio ${header.frameCount}`);
  const palette = info.palette ?? rom.readUInt32LE(BLADER_PALETTES + info.bladerPalette * 4) - ROM_BASE;
  walk[slug] = {
    sprite: png('walk', `${slug}.png`, renderSheet(rom, info.sprite, header, palette)),
    confianca: info.confianca,
  };
}

const stadiums = readStadiums(rom, BB2E.stadiums).map((s) => ({
  index: s.index,
  floor: png('stadiums', `${s.index}-floor.png`, renderAffineBg(lz77Decompress(rom, s.floor), rom, s.palette)),
  bowl: png('stadiums', `${s.index}-bowl.png`, renderAffineBg(lz77Decompress(rom, s.bowl), rom, s.palette)),
}));

const item = ({ id, names }) => ({ id, nome: names.en, desgastePorBatalha: id });
const data = {
  rom: { gameCode: BB2E.gameCode, sha1 },
  beys,
  walk: { frames: WALK_FRAMES, frameSize: WALK_FRAME_SIZE, frameCount: WALK_FRAME_COUNT, characters: walk },
  stadiums,
  launchers: catalog.launchers.map(item),
  ripcords: catalog.ripcords.map(item),
};
writeFileSync(join(outDir, 'gba.json'), `${JSON.stringify(data, null, 2)}\n`);
console.log(`${outDir}: ${Object.keys(beys).length} beys, ${Object.keys(walk).length} personagens com caminhada, ${stadiums.length} estádios`);
