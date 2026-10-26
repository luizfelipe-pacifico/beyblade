import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ARCADE_FIGHTS, BOSS, CONTINUES, advance, cpuLevel, createLadder, currentFight, spendContinue } from '../src/game/arcade.js';

const characters = ['tyson-granger', 'kai-hiwatari', 'ray-kon', 'max-tate', 'daichi-sumeragi', 'tala', 'bryan-kuznetsov', BOSS, 'lee', 'robert-jurgen'];
const ladderFor = (player) => createLadder({ player, characters, rng: () => 0.42 });

test('the ladder has seven fights, never the player, and ends with the boss', () => {
  const l = ladderFor('tyson-granger');
  assert.equal(l.opponents.length, ARCADE_FIGHTS);
  assert.ok(l.opponents.every((o) => o.character !== 'tyson-granger'));
  assert.equal(l.opponents.at(-1).character, BOSS);
  assert.equal(new Set(l.opponents.map((o) => o.character)).size, ARCADE_FIGHTS);
});

test('playing as the boss still builds a full ladder without him', () => {
  const l = ladderFor(BOSS);
  assert.equal(l.opponents.length, ARCADE_FIGHTS);
  assert.ok(l.opponents.every((o) => o.character !== BOSS));
});

test('cpu level rises with the stage and the last fight is the hardest', () => {
  const levels = Array.from({ length: ARCADE_FIGHTS }, (_, i) => cpuLevel(i));
  assert.deepEqual(levels, [...levels].sort((a, b) => a - b));
  assert.equal(levels[0], 1);
  assert.equal(levels.at(-1), 5);
});

test('winning every fight clears the arcade', () => {
  let l = ladderFor('kai-hiwatari');
  for (let i = 0; i < ARCADE_FIGHTS; i++) {
    assert.equal(currentFight(l).character, l.opponents[i].character);
    l = advance(l, 'vitoria');
  }
  assert.equal(l.status, 'cleared');
  assert.equal(currentFight(l), null);
});

test('a loss asks for a continue that repeats the same fight, and runs out', () => {
  let l = advance(ladderFor('ray-kon'), 'vitoria');
  const second = currentFight(l).character;
  for (let i = 0; i < CONTINUES; i++) {
    l = advance(l, 'derrota');
    assert.equal(l.status, 'continue');
    l = spendContinue(l);
    assert.equal(currentFight(l).character, second);
  }
  l = advance(l, 'derrota');
  assert.equal(l.status, 'gameover');
});
