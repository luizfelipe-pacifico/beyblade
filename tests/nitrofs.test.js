import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decompressBlz, decompressLz, fileData, isNarc, listFiles, lzSize, readHeader, readNarc } from '../scripts/lib/nitrofs.js';

// ROM sintética: cabeçalho, 1 overlay (arquivo 0), "a.bin" (arquivo 1) na raiz e "sub/b.txt" (arquivo 2).
function fakeRom() {
  const rom = Buffer.alloc(0x400);
  rom.write('TESTE GAME', 0x00, 'latin1');
  rom.write('ABCE', 0x0c, 'latin1');
  rom.write('01', 0x10, 'latin1');
  rom[0x14] = 0; // 128 KB

  // FNT em 0x200: 2 diretórios (8 bytes cada) + subtabelas.
  const fnt = 0x200;
  const root = Buffer.concat([
    Buffer.from([0x05]), Buffer.from('a.bin'),
    Buffer.from([0x83]), Buffer.from('sub'), Buffer.from([0x01, 0xf0]),
    Buffer.from([0x00]),
  ]);
  const sub = Buffer.concat([Buffer.from([0x05]), Buffer.from('b.txt'), Buffer.from([0x00])]);
  rom.writeUInt32LE(16, fnt); rom.writeUInt16LE(1, fnt + 4); rom.writeUInt16LE(2, fnt + 6);
  rom.writeUInt32LE(16 + root.length, fnt + 8); rom.writeUInt16LE(2, fnt + 12); rom.writeUInt16LE(0xf000, fnt + 14);
  root.copy(rom, fnt + 16);
  sub.copy(rom, fnt + 16 + root.length);
  rom.writeUInt32LE(fnt, 0x40);
  rom.writeUInt32LE(16 + root.length + sub.length, 0x44);

  // FAT em 0x280: 3 arquivos.
  const fat = 0x280;
  const files = [[0x300, 0x310], [0x310, 0x314], [0x320, 0x325]];
  files.forEach(([s, e], i) => { rom.writeUInt32LE(s, fat + i * 8); rom.writeUInt32LE(e, fat + i * 8 + 4); });
  rom.writeUInt32LE(fat, 0x48);
  rom.writeUInt32LE(files.length * 8, 0x4c);

  // Tabela de overlays ARM9 em 0x2c0: overlay 0 -> arquivo 0, comprimido.
  rom.writeUInt32LE(0, 0x2c0);
  rom.writeUInt32LE(0x021d12c0, 0x2c4);
  rom.writeUInt32LE(0, 0x2c0 + 24);
  rom.writeUInt32LE(0x01000010, 0x2c0 + 28);
  rom.writeUInt32LE(0x2c0, 0x50);
  rom.writeUInt32LE(32, 0x54);

  rom.write('DATA', 0x310, 'latin1');
  rom.write('hello', 0x320, 'latin1');
  return rom;
}

test('readHeader reads title, game code, maker and table offsets', () => {
  const h = readHeader(fakeRom());
  assert.equal(h.title, 'TESTE GAME');
  assert.equal(h.gameCode, 'ABCE');
  assert.equal(h.makerCode, '01');
  assert.equal(h.capacity, 128 * 1024);
  assert.deepEqual(h.fnt, { offset: 0x200, size: h.fnt.size });
  assert.equal(h.fat.offset, 0x280);
});

test('listFiles walks the FNT, maps FAT ids and names overlays', () => {
  const rom = fakeRom();
  const { dirs, files } = listFiles(rom);
  assert.deepEqual(dirs, ['sub']);
  assert.deepEqual(files.map((f) => [f.id, f.path]), [[0, 'overlay/overlay9_0000.bin'], [1, 'a.bin'], [2, 'sub/b.txt']]);
  assert.equal(files[0].overlay.ramAddress, 0x021d12c0);
  assert.equal(files[0].overlay.compressed, true);
  assert.equal(fileData(rom, files[1]).toString('latin1'), 'DATA');
  assert.equal(fileData(rom, files[2]).toString('latin1'), 'hello');
});

test('readHeader rejects a buffer smaller than the header', () => {
  assert.throws(() => readHeader(Buffer.alloc(16)), /cabeçalho/);
});

test('decompressLz handles LZ10 and LZ11 back-references', () => {
  const lz10 = Buffer.from([0x10, 9, 0, 0, 0x10, 0x41, 0x42, 0x43, 0x30, 0x02]);
  assert.equal(lzSize(lz10), 9);
  assert.equal(decompressLz(lz10).toString('latin1'), 'ABCABCABC');
  const lz11 = Buffer.from([0x11, 9, 0, 0, 0x10, 0x41, 0x42, 0x43, 0x50, 0x02]);
  assert.equal(decompressLz(lz11).toString('latin1'), 'ABCABCABC');
  // LZ11 de 3 bytes (comprimento 0x11–0x110): "A" + cópia de 19 com distância 1.
  const lz11Long = Buffer.from([0x11, 20, 0, 0, 0x40, 0x41, 0x00, 0x20, 0x00]);
  assert.equal(decompressLz(lz11Long).toString('latin1'), 'A'.repeat(20));
  assert.equal(lzSize(Buffer.from('NARC')), 0);
});

test('decompressBlz decodes the backwards LZ used by DS overlays', () => {
  // Lido de trás para frente: flags 0x18, literais C B A, cópia 18 (dist. 3), cópia 9 (dist. 3); rodapé de 8 bytes.
  const body = Buffer.from([0x00, 0x60, 0x00, 0xf0, 0x41, 0x42, 0x43, 0x18]);
  const footer = Buffer.alloc(8);
  footer.writeUInt32LE((8 << 24) | 16, 0);
  footer.writeUInt32LE(30 - 16, 4);
  assert.equal(decompressBlz(Buffer.concat([body, footer])).toString('latin1'), 'ABC'.repeat(10));
});

test('readNarc splits the files of a NARC archive', () => {
  const data = Buffer.from('onetwo3');
  const btaf = Buffer.alloc(12 + 16);
  btaf.write('BTAF', 0, 'latin1');
  btaf.writeUInt32LE(btaf.length, 4);
  btaf.writeUInt16LE(2, 8);
  btaf.writeUInt32LE(0, 12); btaf.writeUInt32LE(3, 16);
  btaf.writeUInt32LE(3, 20); btaf.writeUInt32LE(7, 24);
  const btnf = Buffer.alloc(16);
  btnf.write('BTNF', 0, 'latin1');
  btnf.writeUInt32LE(16, 4);
  const gmif = Buffer.concat([Buffer.alloc(8), data, Buffer.alloc(1)]);
  gmif.write('GMIF', 0, 'latin1');
  gmif.writeUInt32LE(gmif.length, 4);
  const head = Buffer.alloc(16);
  head.write('NARC', 0, 'latin1');
  head.writeUInt16LE(0xfffe, 4);
  head.writeUInt16LE(16, 12);
  head.writeUInt16LE(3, 14);
  const narc = Buffer.concat([head, btaf, btnf, gmif]);
  assert.ok(isNarc(narc));
  assert.deepEqual(readNarc(narc).map((b) => b.toString('latin1')), ['one', 'two3']);
  assert.throws(() => readNarc(Buffer.from('nope')), /NARC/);
});
