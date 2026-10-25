import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lz77Decompress, parseBgContainer, readStadiums, renderAffineBg } from '../scripts/lib/rom-bg.js';

test('lz77Decompress expands literals and back-references', () => {
  // 6 bytes: "AB" literal e depois referência (tamanho 4, distância 2) → "ABABAB".
  const rom = Buffer.from([0x10, 6, 0, 0, 0b00100000, 0x41, 0x42, 0x10, 0x01]);
  assert.equal(lz77Decompress(rom, 0).toString('latin1'), 'ABABAB');
});

test('lz77Decompress rejects data without the lz77 header', () => {
  assert.throws(() => lz77Decompress(Buffer.from([0x30, 4, 0, 0]), 0), /LZ77/);
});

test('lz77Decompress rejects a reference before the start of the output', () => {
  const rom = Buffer.from([0x10, 4, 0, 0, 0b10000000, 0x10, 0x05]);
  assert.throws(() => lz77Decompress(rom, 0), /antes do início/);
});

function affineContainer() {
  // 2x1 tiles 8bpp: tile 0 vazio, tile 1 com a cor 3 no pixel (0,0). Mapa: [1, 0].
  const data = Buffer.alloc(0x20 + 128 + 2);
  data.writeUInt32LE(0x20, 4);
  data.writeUInt32LE(128, 8);
  data.writeUInt32LE(0x20 + 128, 12);
  data.writeUInt32LE(2, 16);
  data.writeUInt32LE(1, 24);
  data.writeUInt16LE(2, 28);
  data.writeUInt16LE(1, 30);
  data[0x20 + 64] = 3;
  data[0x20 + 128] = 1;
  return data;
}

test('parseBgContainer reads offsets and size in tiles', () => {
  const c = parseBgContainer(affineContainer());
  assert.deepEqual([c.tilesOffset, c.tilesLength, c.mapOffset, c.mapLength, c.widthTiles, c.heightTiles], [0x20, 128, 0xa0, 2, 2, 1]);
});

test('renderAffineBg maps one byte per tile through the 256-color palette', () => {
  const rom = Buffer.alloc(0x200);
  rom.writeUInt16LE(0x03e0, 3 * 2);
  const { width, height, rgba } = renderAffineBg(affineContainer(), rom, 0);
  assert.deepEqual([width, height], [16, 8]);
  assert.deepEqual([...rgba.subarray(0, 4)], [0, 255, 0, 255]);
  assert.equal(rgba[8 * 4 + 3], 0);
});

test('readStadiums reads floor, bowl and palette pointers', () => {
  const rom = Buffer.alloc(24);
  [0x08000100, 0x08000200, 0x08000300].forEach((p, i) => rom.writeUInt32LE(p, 12 + i * 4));
  const [, second] = readStadiums(rom, { offset: 0, count: 2 });
  assert.deepEqual(second, { index: 1, floor: 0x100, bowl: 0x200, palette: 0x300 });
});
