import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeFrame, readFrameSetHeader } from '../scripts/lib/rom-frames.js';

// Conjunto sintético: 1 quadro, 16x8 (2 tiles 4bpp), cabeçalho de quadro de 4 bytes.
function frameSet({ compressed, mask, tiles }) {
  const asset = Buffer.alloc(0x100);
  asset.writeUInt32LE(1, 0);
  asset.set([16, 8, 0, compressed ? 0x80 : 0], 4);
  asset.set([0x01, 4], 0x0c);
  asset.writeUInt16LE(2, 0x0e);
  asset.writeUInt32LE(0x24, 0x10);
  asset.writeUInt32LE(0x20, 0x1c);
  asset.writeUInt32LE(0, 0x20);
  asset.writeUInt32LE(mask, 0x24);
  Buffer.from(tiles).copy(asset, 0x28);
  return asset;
}

test('readFrameSetHeader reads size, depth and tables', () => {
  const header = readFrameSetHeader(frameSet({ compressed: true, mask: 0, tiles: [] }), 0);
  assert.deepEqual(
    [header.frameCount, header.width, header.height, header.bpp, header.compressed, header.tilesPerFrame],
    [1, 16, 8, 4, true, 2],
  );
});

test('decodeFrame copies raw tiles when the set is not compressed', () => {
  const raw = Array.from({ length: 64 }, (_, i) => i);
  const out = decodeFrame(frameSet({ compressed: false, mask: 0, tiles: raw }), 0, 0);
  assert.deepEqual([...out], raw);
});

test('decodeFrame leaves tiles marked in the mask empty', () => {
  // Bit 0 ligado: o tile 0 é vazio; o tile 1 vem cru logo no início dos dados.
  const raw = Array.from({ length: 32 }, () => 7);
  const out = decodeFrame(frameSet({ compressed: false, mask: 0b01, tiles: raw }), 0, 0);
  assert.ok(out.subarray(0, 32).every((b) => b === 0));
  assert.ok(out.subarray(32).every((b) => b === 7));
});

test('decodeFrame expands dictionary rows and literal bytes of a compressed tile', () => {
  // Tile 0: controle 0b01 → só a 1ª linha do 1º par troca a palavra-base pelo dicionário (nibble 3 → 0x33333333).
  // Flags do 1º par 0x01 → o byte 0 da 1ª linha vira o literal 0xAB. As linhas seguintes repetem a palavra-base.
  const tile0 = [0b01, 0x03, 0x01, 0xab, 0x00, 0x00, 0x00];
  // Tile 1: controle 0 e flags 0 → tudo zero.
  const tile1 = [0x00, 0x00, 0x00, 0x00, 0x00];
  const out = decodeFrame(frameSet({ compressed: true, mask: 0, tiles: [...tile0, ...tile1] }), 0, 0);
  assert.equal(out.readUInt32LE(0), 0x333333ab);
  for (let row = 1; row < 8; row++) assert.equal(out.readUInt32LE(row * 4), 0x33333333);
  assert.ok(out.subarray(32).every((b) => b === 0));
});

test('decodeFrame rejects a frame outside the set', () => {
  assert.throws(() => decodeFrame(frameSet({ compressed: true, mask: 0, tiles: [] }), 0, 1), RangeError);
});

test('bladerPalettes maps map sprites of known bladers to their palette and skips extras', async () => {
  const { bladerPalettes } = await import('../scripts/lib/rom-sprites.js');
  const rom = Buffer.alloc(0x200);
  const record = (at, sprite, blader) => {
    rom.writeUInt32LE(0x0807db20, at);
    rom.writeUInt32LE(0x08000000 + sprite, at + 4);
    rom.writeUInt32LE(blader >>> 0, at + 8);
  };
  record(0x00, 0x150, 1);
  record(0x1c, 0x160, -1);
  rom.writeUInt32LE(0x08000000 + 0x180, 0x100 + 1 * 4);
  const palettes = bladerPalettes(rom, { npcTable: 0, paletteList: 0x100, bladers: 2 });
  assert.deepEqual([...palettes], [[0x150, 0x180]]);
});
