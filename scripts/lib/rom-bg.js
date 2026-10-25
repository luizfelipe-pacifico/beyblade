// Fundos (backgrounds) da ROM: blocos LZ77 da BIOS com um contêiner de tiles + mapa dentro.
// Formato em docs/REVERSE_ENGINEERING.md (seção Estádios e fundos).
import { bgr555 } from './gba-gfx.js';

const ROM_BASE = 0x08000000;

// LZ77UnComp da BIOS do GBA: cabeçalho 0x10 + tamanho de 24 bits; flags de 8 blocos, bit 1 = (tamanho-3, distância-1).
export function lz77Decompress(rom, offset) {
  if (rom[offset] !== 0x10) throw new Error(`sem cabeçalho LZ77 em 0x${offset.toString(16)}`);
  const size = rom.readUInt32LE(offset) >>> 8;
  const out = Buffer.alloc(size);
  let o = 0;
  let p = offset + 4;
  while (o < size) {
    const flags = rom[p++];
    for (let bit = 7; bit >= 0 && o < size; bit--) {
      if (flags & (1 << bit)) {
        const hi = rom[p++];
        const lo = rom[p++];
        const length = (hi >> 4) + 3;
        const distance = (((hi & 0xf) << 8) | lo) + 1;
        if (distance > o) throw new Error(`referência LZ77 antes do início em 0x${offset.toString(16)}`);
        for (let k = 0; k < length && o < size; k++, o++) out[o] = out[o - distance];
      } else {
        out[o++] = rom[p++];
      }
    }
  }
  return out;
}

// Cabeçalho de 32 bytes: +4 offset dos tiles, +8 tamanho, +12 offset do mapa, +16 tamanho, +24 flags, +28 largura|altura (tiles).
export function parseBgContainer(data) {
  return {
    tilesOffset: data.readUInt32LE(4),
    tilesLength: data.readUInt32LE(8),
    mapOffset: data.readUInt32LE(12),
    mapLength: data.readUInt32LE(16),
    flags: data.readUInt32LE(24),
    widthTiles: data.readUInt16LE(28),
    heightTiles: data.readUInt16LE(30),
  };
}

// Fundo affine: tiles de 8bpp e mapa de 1 byte por tile (estádios, 64x64 tiles = 512x512 px).
export function renderAffineBg(data, rom, paletteOffset) {
  const c = parseBgContainer(data);
  const width = c.widthTiles * 8;
  const height = c.heightTiles * 8;
  const rgba = Buffer.alloc(width * height * 4);
  for (let ty = 0; ty < c.heightTiles; ty++) {
    for (let tx = 0; tx < c.widthTiles; tx++) {
      const tile = data[c.mapOffset + ty * c.widthTiles + tx];
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const index = data[c.tilesOffset + tile * 64 + y * 8 + x];
          if (index === 0) continue;
          const [r, g, b] = bgr555(rom.readUInt16LE(paletteOffset + index * 2));
          rgba.set([r, g, b, 255], ((ty * 8 + y) * width + tx * 8 + x) * 4);
        }
      }
    }
  }
  return { width, height, rgba };
}

// Tabela de estádios: trios de ponteiros (camada A = chão, camada B = sombreado da tigela, paleta de 256 cores).
export function readStadiums(rom, { offset, count }) {
  const stadiums = [];
  for (let i = 0; i < count; i++) {
    const at = offset + i * 12;
    stadiums.push({
      index: i,
      floor: rom.readUInt32LE(at) - ROM_BASE,
      bowl: rom.readUInt32LE(at + 4) - ROM_BASE,
      palette: rom.readUInt32LE(at + 8) - ROM_BASE,
    });
  }
  return stadiums;
}
