import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activeSlot, battleQuery, cardCount, createSelect, reduceSelect } from '../src/game/select-state.js';

const characters = [{ slug: 'tyson' }, { slug: 'kai' }, { slug: 'ray' }];
const beysOf = (slug) => ({ tyson: ['dragoon-s', 'dragoon-g'], kai: ['dranzer-g'], ray: ['driger-g', 'driger-v'] })[slug];
const start = () => createSelect({ characters, beysOf, stages: 6, cols: 2 });
const play = (s, steps, rng = () => 0) => steps.reduce((acc, [player, action]) => reduceSelect(acc, player, action, rng), s);

test('the grid has every character plus the random card', () => {
  assert.equal(cardCount(start()), 4);
});

test('player 1 alone picks own character and bey, then the CPU, then the stage', () => {
  const s = play(start(), [
    [0, 'right'], [0, 'confirm'], // Kai
    [0, 'confirm'], // Dranzer G
  ]);
  assert.equal(s.p2, 'cpu');
  assert.equal(activeSlot(s, 0), 1);
  const done = play(s, [
    [0, 'right'], [0, 'confirm'], // cursor da CPU começa no índice 1 → Ray
    [0, 'right'], [0, 'confirm'], // Driger V
    [0, 'right'], [0, 'right'], [0, 'confirm'], // arena 2
  ]);
  assert.equal(done.phase, 'done');
  assert.equal(battleQuery(done), 'p1=kai&p2=ray&b1=dranzer-g&b2=driger-v&arena=rom-2&cpu=2');
});

test('start on the second controller brings in player 2, even while player 1 picks the CPU', () => {
  let s = play(start(), [[0, 'confirm'], [0, 'confirm']]);
  assert.equal(s.p2, 'cpu');
  s = reduceSelect(s, 1, 'start');
  assert.equal(s.p2, 'human');
  assert.equal(activeSlot(s, 0), null);
  assert.equal(activeSlot(s, 1), 1);
  s = play(s, [[1, 'confirm'], [1, 'confirm']]);
  assert.equal(s.phase, 'stage');
  s = play(s, [[1, 'right'], [0, 'confirm']]);
  assert.equal(s.stage, 0, 'só o P1 escolhe a arena');
  assert.equal(battleQuery(s), 'p1=tyson&p2=kai&b1=dragoon-s&b2=dranzer-g&arena=rom-0');
});

test('both humans choose at the same time', () => {
  let s = reduceSelect(start(), 1, 'start');
  s = play(s, [[1, 'confirm'], [0, 'down'], [0, 'confirm']]);
  assert.equal(s.slots[0].character, 'ray');
  assert.equal(s.slots[1].character, 'kai');
});

test('the random card draws a character and still opens the bey carousel', () => {
  const s = play(start(), [[0, 'left'], [0, 'confirm']], () => 0.99);
  assert.equal(s.slots[0].character, 'ray');
  assert.equal(s.slots[0].randomPick, true);
  assert.equal(s.slots[0].step, 'bey');
});

test('the bey carousel wraps around in both directions', () => {
  let s = play(start(), [[0, 'confirm'], [0, 'left']]);
  assert.equal(s.slots[0].beyCursor, 1);
  s = reduceSelect(s, 0, 'right');
  assert.equal(s.slots[0].beyCursor, 0);
});

test('back steps out of the carousel, out of the CPU pick and finally exits', () => {
  let s = play(start(), [[0, 'confirm'], [0, 'confirm']]);
  assert.equal(s.p2, 'cpu');
  s = reduceSelect(s, 0, 'back');
  assert.equal(s.p2, 'none');
  assert.equal(s.slots[0].step, 'bey');
  s = play(s, [[0, 'back'], [0, 'back']]);
  assert.equal(s.exit, true);
});

test('back on the stage screen returns to the second bey', () => {
  let s = play(start(), [[0, 'confirm'], [0, 'confirm'], [0, 'confirm'], [0, 'confirm']]);
  assert.equal(s.phase, 'stage');
  s = reduceSelect(s, 0, 'back');
  assert.equal(s.phase, 'select');
  assert.equal(s.slots[1].step, 'bey');
});

test('the random stage is left for the battle to draw', () => {
  let s = play(start(), [[0, 'confirm'], [0, 'confirm'], [0, 'confirm'], [0, 'confirm'], [0, 'left']]);
  s = reduceSelect(s, 0, 'confirm');
  assert.equal(s.stage, 'aleatoria');
  assert.match(battleQuery(s), /arena=aleatoria/);
});

test('player 1 can cancel a ready pick while waiting for player 2', () => {
  let s = reduceSelect(start(), 1, 'start');
  s = play(s, [[0, 'confirm'], [0, 'confirm']]);
  assert.equal(s.slots[0].step, 'ready');
  s = reduceSelect(s, 0, 'back');
  assert.equal(s.slots[0].step, 'bey');
});

test('beysByCharacter groups by owner, keeps the roster default first and falls back to it', async () => {
  const { beysByCharacter, beyImage } = await import('../src/game/bey-options.js');
  const generated = {
    'dragoon-s': { slug: 'dragoon-s', dono: 'tyson', ordem: 1 },
    'dragoon-g': { slug: 'dragoon-g', dono: 'tyson', ordem: 5 },
    'dragoon-v': { slug: 'dragoon-v', dono: 'tyson', ordem: 3 },
    'dranzer-f@kai': { slug: 'dranzer-f', dono: 'kai', ordem: 0, sprite: '/art/beys/dranzer-f.svg' },
  };
  const roster = [{ slug: 'tyson', beySlug: 'dragoon-g' }, { slug: 'kai', beySlug: 'dranzer-g' }, { slug: 'ray', beySlug: 'driger-g' }];
  assert.deepEqual(beysByCharacter(generated, roster), { tyson: ['dragoon-g', 'dragoon-s', 'dragoon-v'], kai: ['dranzer-f@kai'], ray: ['driger-g'] });
  // O id com @ resolve para o slug da pesquisa, que é a chave da ROM.
  const rom = { beys: { 'dranzer-f': { sprite: '/rom/beys/dranzer-f.png', frames: 3, frameSize: { width: 32 } } } };
  assert.equal(beyImage('dranzer-f@kai', generated, rom).src, '/rom/beys/dranzer-f.png');
  assert.deepEqual(beyImage('dranzer-f@kai', generated, null), { kind: 'svg', src: '/art/beys/dranzer-f.svg' });
});

test('selectFeedback maps state changes to the fighting game menu sounds', async () => {
  const { selectFeedback } = await import('../src/game/select-feedback.js');
  const s0 = start();
  const moved = reduceSelect(s0, 0, 'right');
  assert.deepEqual(selectFeedback(s0, moved, 'right'), [{ som: 'move', vaga: 0 }]);
  const locked = reduceSelect(moved, 0, 'confirm');
  assert.deepEqual(selectFeedback(moved, locked, 'confirm'), [{ som: 'lockIn', vaga: 0, voz: 'kai', flash: true }]);
  const joined = reduceSelect(locked, 1, 'start');
  assert.deepEqual(selectFeedback(locked, joined, 'start'), [{ som: 'join', banner: 'p2' }]);
  assert.deepEqual(selectFeedback(s0, s0, 'up'), []);
  const tyson = reduceSelect(s0, 0, 'confirm');
  const turned = reduceSelect(tyson, 0, 'right');
  assert.deepEqual(selectFeedback(tyson, turned, 'right'), [{ som: 'carousel', vaga: 0 }]);
});
