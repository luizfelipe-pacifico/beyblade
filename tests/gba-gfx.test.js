import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import { bgr555, encodePng, parseOam, renderSprite } from '../scripts/lib/gba-gfx.js';

function oamWith(entries) {
  const oam = Buffer.alloc(0x400);
  // Esconde todos os sprites (bit 9 do atributo 0) antes de preencher os do teste.
  for (let i = 0; i < 128; i++) oam.writeUInt16LE(0x200, i * 8);
  entries.forEach(([a0, a1, a2], i) => {
    oam.writeUInt16LE(a0, i * 8);
    oam.writeUInt16LE(a1, i * 8 + 2);
    oam.writeUInt16LE(a2, i * 8 + 4);
  });
  return oam;
}

test('bgr555 expands 5-bit channels to 8 bits', () => {
  assert.deepEqual(bgr555(0x7fff), [255, 255, 255]);
  assert.deepEqual(bgr555(0x001f), [255, 0, 0]);
  assert.deepEqual(bgr555(0x7c00), [0, 0, 255]);
});

test('parseOam skips hidden sprites and reads size, tile and palette', () => {
  // shape 0, size 2 → 32x32; tile 5, banco de paleta 3; posição (10, 20).
  const [sprite, ...rest] = parseOam(oamWith([[20, (2 << 14) | 10, (3 << 12) | 5]]));
  assert.equal(rest.length, 0);
  assert.deepEqual(
    [sprite.x, sprite.y, sprite.width, sprite.height, sprite.tile, sprite.paletteBank, sprite.bpp8],
    [10, 20, 32, 32, 5, 3, false],
  );
});

test('renderSprite maps a 4bpp pixel through the sprite palette bank', () => {
  const vram = Buffer.alloc(0x18000);
  const pal = Buffer.alloc(0x400);
  // Pixel (1, 0) do tile 0 usa a cor 2 (nibble alto do primeiro byte).
  vram[0x10000] = 0x20;
  pal.writeUInt16LE(0x001f, 0x200 + (1 * 16 + 2) * 2);
  const [sprite] = parseOam(oamWith([[0, 0, 1 << 12]]));
  const { rgba } = renderSprite(sprite, { vram, pal, oneDimensional: true });
  assert.deepEqual([...rgba.subarray(4, 8)], [255, 0, 0, 255]);
  // Cor 0 é transparente.
  assert.equal(rgba[3], 0);
});

test('renderSprite walks tiles in 1D mapping order', () => {
  const vram = Buffer.alloc(0x18000);
  const pal = Buffer.alloc(0x400);
  pal.writeUInt16LE(0x7fff, 0x200 + 1 * 2);
  // Sprite 16x16 em 1D: o tile da direita (tile 1) começa em 0x10020.
  vram[0x10020] = 0x01;
  const [sprite] = parseOam(oamWith([[0, 1 << 14, 0]]));
  const { rgba, width } = renderSprite(sprite, { vram, pal, oneDimensional: true });
  assert.equal(rgba[(0 * width + 8) * 4 + 3], 255);
});

test('encodePng writes a valid header and recoverable pixels', () => {
  const rgba = Buffer.from([255, 0, 0, 255, 0, 255, 0, 128]);
  const png = encodePng(2, 1, rgba);
  assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const idatAt = png.indexOf('IDAT');
  const length = png.readUInt32BE(idatAt - 4);
  const raw = inflateSync(png.subarray(idatAt + 4, idatAt + 4 + length));
  assert.deepEqual([...raw], [0, ...rgba]);
});
