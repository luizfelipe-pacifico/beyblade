import { test } from 'node:test';
import assert from 'node:assert/strict';
import { containerEntries, ecdDecompress, isEcd, timToRgba } from '../scripts/lib/ps1-ecd.js';

function ecd({ prefix, body, size }) {
  const head = Buffer.alloc(16);
  head.write('ECD\u0001', 0, 'latin1');
  head.writeUInt32BE(prefix.length, 4);
  head.writeUInt32BE(prefix.length + body.length, 8);
  head.writeUInt32BE(size, 12);
  return Buffer.concat([head, prefix, body]);
}

test('ecdDecompress copies the prefix, then literals and ring copies starting at 0x3be', () => {
  // Flags 0b01: literal "C" (vai para o anel em 0x3BE) e uma cópia de 3 bytes da posição 0x3BE.
  // Cópia: a = 0xBE, c = 0xC0 → posição 0xBE | 0x300 = 0x3BE, comprimento 0 + 3.
  const buf = ecd({ prefix: Buffer.from('AB'), body: Buffer.from([0x01, 0x43, 0xbe, 0xc0]), size: 6 });
  assert.equal(ecdDecompress(buf).toString('latin1'), 'ABCCCC');
});

test('the prefix does not enter the ring buffer', () => {
  // Uma cópia logo no início lê o anel ainda zerado, mesmo com prefixo na saída.
  const buf = ecd({ prefix: Buffer.from('XY'), body: Buffer.from([0x00, 0xbe, 0xc0]), size: 5 });
  assert.deepEqual([...ecdDecompress(buf)], [0x58, 0x59, 0, 0, 0]);
});

test('isEcd and ecdDecompress reject other data', () => {
  assert.equal(isEcd(Buffer.from('nada aqui ainda....')), false);
  assert.throws(() => ecdDecompress(Buffer.alloc(32)), /ECD/);
});

test('containerEntries reads the offset table and skips empty slots', () => {
  const buf = Buffer.alloc(32);
  buf.writeUInt32LE(12, 0);
  buf.writeUInt32LE(20, 4);
  buf.writeUInt32LE(0, 8);
  assert.deepEqual(containerEntries(buf), [{ index: 0, offset: 12 }, { index: 1, offset: 20 }]);
});

test('timToRgba decodes a 4bpp TIM through its palette with color 0 transparent', () => {
  const clut = Buffer.alloc(12 + 32);
  clut.writeUInt32LE(12 + 32, 0);
  clut.writeUInt16LE(16, 8);
  clut.writeUInt16LE(1, 10);
  clut.writeUInt16LE(0x001f, 12 + 2); // índice 1 = vermelho
  const image = Buffer.alloc(12 + 2);
  image.writeUInt32LE(14, 0);
  image.writeUInt16LE(1, 8); // 1 palavra de 16 bits = 4 pixels em 4bpp
  image.writeUInt16LE(1, 10);
  image[12] = 0x10; // pixel 0 → índice 0, pixel 1 → índice 1
  const tim = Buffer.concat([Buffer.from([0x10, 0, 0, 0, 0x08, 0, 0, 0]), clut, image]);
  const { width, height, rgba } = timToRgba(tim);
  assert.deepEqual([width, height], [4, 1]);
  assert.equal(rgba[3], 0);
  assert.deepEqual([...rgba.subarray(4, 8)], [255, 0, 0, 255]);
});
