import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scale2x, scale4x } from '../scripts/lib/pixel-scale.js';

const px = (colors, width) => {
  const buf = Buffer.alloc(colors.length * 4);
  colors.forEach((c, i) => buf.writeUInt32LE(c, i * 4));
  return { rgba: buf, width, height: colors.length / width };
};
const at = (img, x, y) => img.rgba.readUInt32LE((y * img.width + x) * 4);

test('scale2x keeps flat areas and doubles the size', () => {
  const src = px([1, 1, 1, 1], 2);
  const out = scale2x(src.rgba, src.width, src.height);
  assert.deepEqual([out.width, out.height], [4, 4]);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) assert.equal(at(out, x, y), 1);
});

test('scale2x smooths a diagonal instead of making 2x2 blocks', () => {
  // Diagonal de 2 (cor B) num fundo 1: o centro ganha o canto suavizado do EPX.
  const B = 2;
  const src = px([1, B, 1, B, 1, 1, 1, 1, 1], 3);
  const out = scale2x(src.rgba, src.width, src.height);
  // Pixel central (1) tem cima = B e esquerda = B: o subpixel de cima-esquerda vira B.
  assert.equal(at(out, 2, 2), B);
  assert.equal(at(out, 3, 3), 1);
});

test('scale4x multiplies the size by four', () => {
  const src = px([5, 6, 7, 8], 2);
  const out = scale4x(src.rgba, src.width, src.height);
  assert.deepEqual([out.width, out.height], [8, 8]);
});
