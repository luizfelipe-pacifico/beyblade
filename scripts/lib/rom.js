// Leitura das tabelas de dados da ROM do Beyblade G-Revolution (GBA, código BB2E).
// Endereços e formato dos registros documentados em docs/REVERSE_ENGINEERING.md.

const ROM_BASE = 0x08000000;
const LANGS = ['en', 'fr', 'es', 'it', 'de'];
const TYPES = ['attack', 'defense', 'endurance', 'combination'];

export const BB2E = {
  gameCode: 'BB2E',
  sha1: 'a89f7b4eb77dc986022201db51a676451ba7c5e4',
  // Feras bit (0x00..0x26) e pares fera + especial (0x27..0x46): 5 nomes + 5 nomes de especial.
  bitBeasts: { offset: 0x796dc, count: 0x47, size: 0x28 },
  beyblades: { offset: 0x7a1f4, count: 83, size: 0x28 },
  // Tabelas de idioma: 5 ponteiros (um por idioma) para arrays de ponteiros de nome.
  parts: {
    spinGears: { offset: 0x7b0c4, count: 22 },
    attackRings: { offset: 0x7b6dc, count: 77 },
    bladeBases: { offset: 0x7bb6c, count: 42 },
    weightDisks: { offset: 0x7bda4, count: 19 },
  },
};

export function gameCode(rom) {
  return rom.toString('latin1', 0xac, 0xb0);
}

function toOffset(rom, pointer) {
  const offset = pointer - ROM_BASE;
  if (offset < 0 || offset >= rom.length) throw new RangeError(`ponteiro fora da ROM: 0x${pointer.toString(16)}`);
  return offset;
}

export function readCString(rom, pointer) {
  const start = toOffset(rom, pointer);
  let end = start;
  while (end < rom.length && rom[end] !== 0) end++;
  return rom.toString('latin1', start, end);
}

function readNames(rom, offset) {
  const names = {};
  LANGS.forEach((lang, i) => {
    names[lang] = readCString(rom, rom.readUInt32LE(offset + i * 4));
  });
  return names;
}

export function readPartNames(rom, { offset, count }) {
  const arrays = LANGS.map((_, i) => toOffset(rom, rom.readUInt32LE(offset + i * 4)));
  const parts = [];
  for (let index = 0; index < count; index++) {
    const names = {};
    LANGS.forEach((lang, i) => {
      names[lang] = readCString(rom, rom.readUInt32LE(arrays[i] + index * 4));
    });
    parts.push({ index, names });
  }
  return parts;
}

export function readBitBeasts(rom, { offset, count, size }) {
  const beasts = [];
  for (let index = 0; index < count; index++) {
    const base = offset + index * size;
    beasts.push({ index, names: readNames(rom, base), specialNames: readNames(rom, base + 20) });
  }
  return beasts;
}

export function readBeyblades(rom, { offset, count, size }) {
  const beys = [];
  for (let index = 0; index < count; index++) {
    const base = offset + index * size;
    const core = rom[base + 0x1f];
    beys.push({
      index,
      names: readNames(rom, base),
      graphics: rom.readUInt32LE(base + 0x14),
      palette: rom.readUInt32LE(base + 0x18),
      type: TYPES[rom[base + 0x1c]] ?? null,
      attackRing: rom[base + 0x1d],
      weightDisk: rom[base + 0x1e],
      spinGear: core & 0x1f,
      // Bits altos do byte do núcleo: significado ainda desconhecido (não é o sentido de rotação).
      spinGearFlags: core & 0xe0,
      bladeBase: rom[base + 0x20],
      bitBeast: rom[base + 0x21],
      unknown22: rom[base + 0x22],
      unknown24: rom[base + 0x24],
      season: rom[base + 0x25],
    });
  }
  return beys;
}

export function extractCatalog(rom, layout = BB2E) {
  const parts = {};
  for (const [kind, table] of Object.entries(layout.parts)) parts[kind] = readPartNames(rom, table);
  return {
    gameCode: gameCode(rom),
    bitBeasts: readBitBeasts(rom, layout.bitBeasts),
    beyblades: readBeyblades(rom, layout.beyblades),
    parts,
  };
}
