import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RAW_SECTOR, USER_DATA, bootExecutable, isForm2, listFiles, readFile, toIso } from '../scripts/lib/iso9660.js';

// Imagem MODE2/2352 sintética: PVD no setor 16, raiz no 18, um arquivo Form 1 no 20 e um Form 2 no 22.
function record(name, lba, size, isDir = false) {
  const nameBytes = Buffer.from(name, 'latin1');
  const len = 33 + nameBytes.length + (nameBytes.length % 2 === 0 ? 1 : 0);
  const r = Buffer.alloc(len);
  r[0] = len;
  r.writeUInt32LE(lba, 2);
  r.writeUInt32LE(size, 10);
  r[25] = isDir ? 0x02 : 0;
  r[32] = nameBytes.length;
  nameBytes.copy(r, 33);
  return r;
}

function fakeDisc() {
  const bin = Buffer.alloc(RAW_SECTOR * 24);
  const user = (lba) => bin.subarray(lba * RAW_SECTOR + 24, lba * RAW_SECTOR + 24 + USER_DATA);
  const pvd = user(16);
  pvd[0] = 1;
  pvd.write('CD001', 1, 'latin1');
  pvd.write('TESTE'.padEnd(32), 40, 'latin1');
  record('\u0000', 18, USER_DATA, true).copy(pvd, 156);
  const root = Buffer.concat([
    record('\u0000', 18, USER_DATA, true),
    record('\u0001', 18, USER_DATA, true),
    record('SYSTEM.CNF;1', 20, 40),
    record('MUSIC.XA;1', 22, USER_DATA),
  ]);
  root.copy(user(18));
  user(20).write('BOOT = cdrom:\\SLPM_871.30;1\r\nTCB = 4', 0, 'latin1');
  bin[22 * RAW_SECTOR + 18] = 0x20; // submode Form 2
  return bin;
}

test('listFiles walks the ISO 9660 tree from the primary volume descriptor', () => {
  const { volumeId, files } = listFiles(fakeDisc());
  assert.equal(volumeId, 'TESTE');
  assert.deepEqual(files.map((f) => [f.path, f.lba, f.size]), [['SYSTEM.CNF', 20, 40], ['MUSIC.XA', 22, USER_DATA]]);
});

test('readFile returns user data for Form 1 and raw sectors for Form 2', () => {
  const bin = fakeDisc();
  const [cnf, xa] = listFiles(bin).files;
  const a = readFile(bin, cnf);
  assert.equal(a.raw, false);
  assert.equal(bootExecutable(a.data.toString('latin1')), 'SLPM_871.30');
  assert.ok(isForm2(bin, 22));
  const b = readFile(bin, xa);
  assert.equal(b.raw, true);
  assert.equal(b.data.length, RAW_SECTOR);
});

test('toIso keeps 2048 bytes of user data per sector', () => {
  const bin = fakeDisc();
  const iso = toIso(bin);
  assert.equal(iso.length, 24 * USER_DATA);
  assert.equal(iso.toString('latin1', 16 * USER_DATA + 1, 16 * USER_DATA + 6), 'CD001');
});

test('listFiles rejects an image without a volume descriptor', () => {
  assert.throws(() => listFiles(Buffer.alloc(RAW_SECTOR * 20)), /Primary Volume Descriptor/);
});
