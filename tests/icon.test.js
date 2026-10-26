import { test } from 'node:test';
import assert from 'node:assert/strict';
import { circleFromRays, encodeIco, fitCircle, isBackground } from '../scripts/lib/icon.js';

test('isBackground accepts light grays of the fake checkerboard and rejects colors and dark tones', () => {
  assert.equal(isBackground([255, 255, 255]), true);
  assert.equal(isBackground([204, 204, 204]), true);
  assert.equal(isBackground([30, 60, 160]), false);
  assert.equal(isBackground([90, 90, 90]), false);
});

test('fitCircle recovers center and radius from points on a circle', () => {
  const pts = Array.from({ length: 36 }, (_, i) => {
    const t = (i / 36) * Math.PI * 2;
    return [300 + 120 * Math.cos(t), 250 + 120 * Math.sin(t)];
  });
  const c = fitCircle(pts);
  assert.ok(Math.abs(c.cx - 300) < 1e-6 && Math.abs(c.cy - 250) < 1e-6 && Math.abs(c.r - 120) < 1e-6);
});

test('circleFromRays finds a colored disc on a checkerboard', () => {
  const size = 200;
  const pixel = (x, y) => {
    if (Math.hypot(x - 104, y - 98) <= 70) return [20, 40, 160];
    return (Math.floor(x / 10) + Math.floor(y / 10)) % 2 ? [255, 255, 255] : [204, 204, 204];
  };
  const c = circleFromRays(pixel, size, size);
  assert.ok(Math.abs(c.cx - 104) < 1.5, `cx ${c.cx}`);
  assert.ok(Math.abs(c.cy - 98) < 1.5, `cy ${c.cy}`);
  assert.ok(Math.abs(c.r - 70) < 1.5, `r ${c.r}`);
});

test('encodeIco writes the directory with sizes, offsets and the embedded PNGs', () => {
  const a = Buffer.from([1, 2, 3]);
  const b = Buffer.from([4, 5]);
  const ico = encodeIco([{ size: 16, png: a }, { size: 256, png: b }]);
  assert.deepEqual([ico.readUInt16LE(0), ico.readUInt16LE(2), ico.readUInt16LE(4)], [0, 1, 2]);
  assert.equal(ico[6], 16);
  assert.equal(ico[6 + 16], 0, '256 px vira 0 no diretório');
  assert.equal(ico.readUInt32LE(6 + 12), 6 + 32);
  assert.equal(ico.readUInt32LE(6 + 16 + 12), 6 + 32 + 3);
  assert.deepEqual([...ico.subarray(38)], [1, 2, 3, 4, 5]);
});
