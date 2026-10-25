import test from 'node:test';
import assert from 'node:assert/strict';
import { envAt, renderWav, validateRecipe } from '../scripts/lib/synth.js';

const ROAR = {
  duration: 0.5,
  layers: [{ wave: 'saw', freq: [[0, 90], [0.5, 60]], gain: [[0, 0], [0.1, 1], [0.5, 0]], growl: { rate: 40, depth: 0.6 } }],
};

test('interpolates envelope points linearly', () => {
  const env = [[0, 0], [1, 10]];
  assert.equal(envAt(env, 0.5), 5);
  assert.equal(envAt(env, -1), 0);
  assert.equal(envAt(env, 2), 10);
  assert.equal(envAt(3, 0.7), 3);
});

test('renders a valid 16-bit mono wav with the recipe duration', () => {
  const wav = renderWav(ROAR);
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  assert.equal(wav.readUInt16LE(22), 1);
  assert.equal(wav.readUInt16LE(34), 16);
  assert.equal(wav.readUInt32LE(40), Math.ceil(0.5 * 44100) * 2);
});

test('renders the same bytes for the same recipe', () => {
  assert.deepEqual(renderWav(ROAR), renderWav(ROAR));
});

test('normalizes output without clipping', () => {
  const wav = renderWav({ ...ROAR, gain: 0.9 });
  let peak = 0;
  for (let i = 44; i < wav.length; i += 2) peak = Math.max(peak, Math.abs(wav.readInt16LE(i)));
  assert.ok(peak <= 32767 && peak > 0.8 * 32767);
});

test('rejects recipes with unknown waves or missing gain', () => {
  const errors = validateRecipe({ duration: 1, layers: [{ wave: 'kazoo' }] });
  assert.equal(errors.length, 2);
  assert.throws(() => renderWav({ duration: 0, layers: [] }));
});
