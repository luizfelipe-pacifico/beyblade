import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameCode, readBeyblades, readBitBeasts, readPartNames, readCString } from '../scripts/lib/rom.js';

// ROM sintética: os testes nunca dependem da ROM real (que fica fora do git, D-007).
const ROM_BASE = 0x08000000;

function fakeRom() {
  const rom = Buffer.alloc(0x400);
  rom.write('BB2E', 0xac, 'latin1');
  let cursor = 0x300;
  const string = (text) => {
    const at = cursor;
    rom.write(`${text}\0`, at, 'latin1');
    cursor += text.length + 1;
    return ROM_BASE + at;
  };
  return { rom, string };
}

test('reads the game code from the header', () => {
  assert.equal(gameCode(fakeRom().rom), 'BB2E');
});

test('readCString rejects a pointer outside the rom', () => {
  assert.throws(() => readCString(Buffer.alloc(16), 0x02000000), RangeError);
});

test('readPartNames resolves each language array by index', () => {
  const { rom, string } = fakeRom();
  // Tabela de idiomas em 0x100 apontando para 5 arrays de 2 nomes cada (em 0x120 + i*8).
  const langs = ['Flat', 'Sharp'];
  for (let i = 0; i < 5; i++) {
    rom.writeUInt32LE(ROM_BASE + 0x120 + i * 8, 0x100 + i * 4);
    langs.forEach((name, k) => rom.writeUInt32LE(string(`${name}${i}`), 0x120 + i * 8 + k * 4));
  }
  const parts = readPartNames(rom, { offset: 0x100, count: 2 });
  assert.deepEqual(parts[1], { index: 1, names: { en: 'Sharp0', fr: 'Sharp1', es: 'Sharp2', it: 'Sharp3', de: 'Sharp4' } });
});

test('readPartNames reads attack, defense and endurance when the table has stats', () => {
  const { rom, string } = fakeRom();
  for (let i = 0; i < 5; i++) {
    rom.writeUInt32LE(ROM_BASE + 0x120 + i * 4, 0x100 + i * 4);
    rom.writeUInt32LE(string('Flat'), 0x120 + i * 4);
  }
  rom.set([3, 2, 2, 0], 0x200);
  const [part] = readPartNames(rom, { offset: 0x100, count: 1, statsOffset: 0x200 });
  assert.deepEqual(part.stats, { attack: 3, defense: 2, endurance: 2 });
});

test('readBeyblades decodes parts, type, spin direction and season', () => {
  const { rom, string } = fakeRom();
  const base = 0x40;
  for (let i = 0; i < 5; i++) rom.writeUInt32LE(string('Dragoon V2'), base + i * 4);
  rom.writeUInt32LE(0x08291 * 0x1000, base + 0x14);
  rom.set([0x00, 0x2c, 0x0f, 0x41, 0x1f, 0x0b, 0x00, 0xff, 0x00, 0x02], base + 0x1c);
  const [bey] = readBeyblades(rom, { offset: base, count: 1, size: 0x28 });
  assert.equal(bey.names.en, 'Dragoon V2');
  assert.equal(bey.type, 'attack');
  assert.equal(bey.spin, 'left');
  assert.deepEqual(
    [bey.attackRing, bey.weightDisk, bey.spinGear, bey.spinGearFlags, bey.bladeBase, bey.bitBeast, bey.season],
    [0x2c, 0x0f, 0x01, 0x40, 0x1f, 0x0b, 2],
  );
});

test('readBitBeasts reads the beast name and the special move name', () => {
  const { rom, string } = fakeRom();
  for (let i = 0; i < 5; i++) {
    rom.writeUInt32LE(string('Driger'), 0x40 + i * 4);
    rom.writeUInt32LE(string('Driger Slash'), 0x40 + 20 + i * 4);
  }
  const [beast] = readBitBeasts(rom, { offset: 0x40, count: 1, size: 0x28 });
  assert.equal(beast.names.de, 'Driger');
  assert.equal(beast.specialNames.en, 'Driger Slash');
});
