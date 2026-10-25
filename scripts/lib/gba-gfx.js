// Decodificação de gráficos do GBA a partir de dumps de memória (VRAM, paleta, OAM).
// Referência do hardware: GBATEK (seções LCD OBJ, LCD VRAM Character Data, LCD Color Palettes).
import { deflateSync } from 'node:zlib';

const OBJ_VRAM = 0x10000;
// Tamanho em pixels por [shape][size] (OAM atributos 0 e 1).
const OBJ_SIZES = [
  [[8, 8], [16, 16], [32, 32], [64, 64]],
  [[16, 8], [32, 8], [32, 16], [64, 32]],
  [[8, 16], [8, 32], [16, 32], [32, 64]],
];

// Cor BGR555 do GBA para [r, g, b] de 8 bits.
export function bgr555(value) {
  const expand = (c) => (c << 3) | (c >> 2);
  return [expand(value & 0x1f), expand((value >> 5) & 0x1f), expand((value >> 10) & 0x1f)];
}

export function parseOam(oam) {
  const sprites = [];
  for (let i = 0; i < 128; i++) {
    const a0 = oam.readUInt16LE(i * 8);
    const a1 = oam.readUInt16LE(i * 8 + 2);
    const a2 = oam.readUInt16LE(i * 8 + 4);
    const affine = (a0 & 0x100) !== 0;
    // Sem affine, o bit 9 esconde o sprite.
    if (!affine && (a0 & 0x200)) continue;
    const shape = (a0 >> 14) & 3;
    if (shape === 3) continue;
    const [width, height] = OBJ_SIZES[shape][(a1 >> 14) & 3];
    sprites.push({
      index: i,
      x: a1 & 0x1ff,
      y: a0 & 0xff,
      width,
      height,
      bpp8: (a0 & 0x2000) !== 0,
      tile: a2 & 0x3ff,
      paletteBank: (a2 >> 12) & 0xf,
      hflip: !affine && (a1 & 0x1000) !== 0,
      vflip: !affine && (a1 & 0x2000) !== 0,
    });
  }
  return sprites;
}

// Pixels RGBA de um sprite. `oneDimensional` vem do bit 6 do DISPCNT.
export function renderSprite(sprite, { vram, pal, oneDimensional }) {
  const { width, height, bpp8, tile, paletteBank } = sprite;
  const rgba = Buffer.alloc(width * height * 4);
  const tilesX = width / 8;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const tx = px >> 3;
      const ty = py >> 3;
      // No modo 2D a VRAM de objetos é uma grade de 32 tiles de 4bpp por linha.
      const tileIndex = oneDimensional
        ? tile + (ty * tilesX + tx) * (bpp8 ? 2 : 1)
        : tile + ty * 32 + tx * (bpp8 ? 2 : 1);
      const base = OBJ_VRAM + (tileIndex & 0x3ff) * 32;
      const inX = px & 7;
      const inY = py & 7;
      let color;
      if (bpp8) {
        color = vram[base + inY * 8 + inX];
      } else {
        const byte = vram[base + inY * 4 + (inX >> 1)];
        const nibble = inX & 1 ? byte >> 4 : byte & 0xf;
        color = nibble === 0 ? 0 : paletteBank * 16 + nibble;
      }
      if (color === 0) continue;
      const [r, g, b] = bgr555(pal.readUInt16LE(0x200 + color * 2));
      const dx = sprite.hflip ? width - 1 - px : px;
      const dy = sprite.vflip ? height - 1 - py : py;
      rgba.set([r, g, b, 255], (dy * width + dx) * 4);
    }
  }
  return { width, height, rgba };
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])));
  return Buffer.concat([head, data, crc]);
}

// PNG RGBA mínimo (sem dependência externa).
export function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.set([8, 6, 0, 0, 0], 8);
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
