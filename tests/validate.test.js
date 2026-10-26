import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseConfig, parseMatch, parseSetup } from '../src/validate.js';

const ACTIONS = ['up', 'down', 'left', 'right', 'attack', 'defend', 'jump', 'dodge', 'launch', 'pause'];

function validConfig() {
  const bindings = Object.fromEntries(ACTIONS.map((a) => [a, []]));
  bindings.attack = [{ type: 'button', index: 0 }, { type: 'key', code: 'Space' }];
  bindings.left = [{ type: 'axis', index: 0, dir: -1 }];
  return { gamepadIndex: 0, deadzone: 0.15, rumble: true, bindings };
}

function validMatch() {
  return {
    p1: { name: 'Tyson', bey: 'dragoon-v', score: 3 },
    p2: { name: 'Kai', bey: 'dranzer-v', score: 1 },
    winner: 1,
    targetPoints: 3,
    durationMs: 90000,
    rounds: [{ winner: 1, finish: 'burst', points: 2 }, { winner: 2, finish: 'spin', points: 1 }, { winner: 1, finish: 'spin', points: 1 }],
  };
}

test('parseConfig accepts a valid config', () => {
  const { value, error } = parseConfig(validConfig());
  assert.equal(error, undefined);
  assert.deepEqual(value.bindings.attack, [{ type: 'button', index: 0 }, { type: 'key', code: 'Space' }]);
});

test('parseConfig rejects deadzone above 0.9', () => {
  assert.ok(parseConfig({ ...validConfig(), deadzone: 0.95 }).error);
});

test('parseConfig rejects a missing action binding', () => {
  const config = validConfig();
  delete config.bindings.pause;
  assert.ok(parseConfig(config).error);
});

test('parseConfig drops unknown fields from bindings', () => {
  const config = validConfig();
  config.bindings.attack = [{ type: 'button', index: 1, extra: '<script>' }];
  assert.deepEqual(parseConfig(config).value.bindings.attack, [{ type: 'button', index: 1 }]);
});

test('parseSetup trims names and strips control characters', () => {
  const { value } = parseSetup({
    p1: { name: '  Tyson\u0000 ', bey: 'dragoon-v' },
    p2: { name: 'Kai', bey: 'dranzer-v' },
    targetPoints: 3,
  });
  assert.equal(value.p1.name, 'Tyson');
});

test('parseSetup rejects an empty name', () => {
  const { error } = parseSetup({ p1: { name: '   ', bey: 'dragoon-v' }, p2: { name: 'Kai', bey: 'dranzer-v' }, targetPoints: 3 });
  assert.ok(error);
});

test('parseMatch accepts a valid match', () => {
  assert.equal(parseMatch(validMatch()).error, undefined);
});

test('parseMatch rejects an unknown finish type', () => {
  const match = validMatch();
  match.rounds[0].finish = 'knockout';
  assert.ok(parseMatch(match).error);
});

test('parseMatch rejects a bey id with invalid characters', () => {
  const match = validMatch();
  match.p1.bey = '../etc';
  assert.ok(parseMatch(match).error);
});
