import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEYBOARD, makeFrame, radialDeadzone, readKeys, readPad } from '../src/input/frame.js';

const pad = ({ axes = [0, 0], pressed = [], values = {} } = {}) => ({
  axes,
  buttons: Array.from({ length: 18 }, (_, i) => ({ pressed: pressed.includes(i), value: values[i] ?? (pressed.includes(i) ? 1 : 0) })),
});

test('radial deadzone ignores a resting stick and rescales above it', () => {
  assert.deepEqual(radialDeadzone(0.1, 0.1, 0.2), { x: 0, y: 0 });
  const full = radialDeadzone(1, 0, 0.2);
  assert.ok(Math.abs(full.x - 1) < 1e-9 && full.y === 0);
});

test('d-pad overrides the stick and diagonals keep length 1', () => {
  const { move } = readPad(pad({ axes: [0.9, 0], pressed: [12, 14] }));
  assert.ok(Math.abs(Math.hypot(move.x, move.y) - 1) < 1e-9);
  assert.ok(move.x < 0 && move.y < 0, 'cima + esquerda');
});

test('DualShock 4 buttons follow the GBA controls (D-024)', () => {
  const held = readPad(pad({ pressed: [0, 1, 4, 5, 9] })).held;
  assert.deepEqual([held.attack, held.defend, held.jump, held.dodge, held.pause], [true, true, true, true, true]);
  assert.equal(readPad(pad({ values: { 0: 0.3 } })).held.attack, false, 'botão analógico só conta passando do limiar');
});

test('keyboard diagonal is normalized and keys map per player', () => {
  const p1 = readKeys(new Set(['KeyW', 'KeyD', 'KeyF']), KEYBOARD[0]);
  assert.ok(Math.abs(Math.hypot(p1.move.x, p1.move.y) - 1) < 1e-9);
  assert.equal(p1.held.attack, true);
  const p2 = readKeys(new Set(['KeyW', 'KeyD', 'KeyF']), KEYBOARD[1]);
  assert.deepEqual(p2.move, { x: 0, y: 0 });
  assert.equal(p2.held.attack, false);
});

test('pressed fires only on the first tick a button is held', () => {
  const src = { move: { x: 0, y: 0 }, held: { attack: true } };
  const first = makeFrame([src], {});
  const second = makeFrame([src], first.held);
  assert.equal(first.pressed.attack, true);
  assert.equal(second.pressed.attack, false);
  assert.equal(second.held.attack, true);
});

test('pad and keyboard of the same player both count', () => {
  const frame = makeFrame([readPad(pad()), readKeys(new Set(['KeyR']), KEYBOARD[0])], {});
  assert.equal(frame.held.jump, true);
  assert.equal(makeFrame([null, readKeys(new Set(), KEYBOARD[0])], {}).held.jump, false);
});
