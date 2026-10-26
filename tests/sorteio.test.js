import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALEATORIO, sortearBey } from '../src/content/sorteio.js';

const beys = {
  a: { id: 'a', dono: 'tyson' },
  b: { id: 'b', dono: 'tyson' },
  c: { id: 'c', dono: 'kai' },
};

test('a random bey is always one of that character’s own beys', () => {
  for (const r of [0, 0.4, 0.99]) assert.ok(['a', 'b'].includes(sortearBey(beys, 'tyson', ALEATORIO, () => r)));
  assert.equal(sortearBey(beys, 'kai', ALEATORIO, () => 0.7), 'c');
});

test('a chosen bey passes through and an unknown character gets none', () => {
  assert.equal(sortearBey(beys, 'tyson', 'b'), 'b');
  assert.equal(sortearBey(beys, 'tyson', undefined), undefined);
  assert.equal(sortearBey(beys, 'ninguem', ALEATORIO), undefined);
});
