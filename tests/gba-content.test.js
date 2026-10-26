import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  GBA_BEYS,
  GBA_WALK,
  WALK_FRAMES,
  WALK_FRAME_COUNT,
  gbaOverlay,
  gbaPartTotals,
  toTenScale,
  walkInFrame,
} from '../src/content/gba.js';
import { roster } from '../src/content/roster.js';

test('toTenScale maps the rom part sum 0..12 to 1..10', () => {
  assert.equal(toTenScale(0), 1);
  assert.equal(toTenScale(12), 10);
  assert.equal(toTenScale(6), 6);
  assert.equal(toTenScale(99), 10);
});

test('gbaPartTotals sums attack ring, weight disk and blade base stats', () => {
  const stats = (attack, defense, endurance) => ({ stats: { attack, defense, endurance } });
  const parts = { attackRings: [stats(4, 1, 4)], weightDisks: [stats(4, 4, 1)], bladeBases: [stats(1, 3, 4)] };
  assert.deepEqual(gbaPartTotals({ attackRing: 0, weightDisk: 0, bladeBase: 0 }, parts), { attack: 9, defense: 8, endurance: 9 });
});

test('gbaOverlay converts rom totals and spin for a known bey and returns null otherwise', () => {
  const data = { beys: { 'dragoon-v2': { totals: { attack: 12, defense: 0, endurance: 6 }, spin: 'left', special: 'Dragoon' } } };
  assert.deepEqual(gbaOverlay('dragoon-v2', data), {
    atributos: { ataque: 10, defesa: 1, stamina: 6 },
    rotacao: 'esquerda',
    especial: 'Dragoon',
  });
  assert.equal(gbaOverlay('falborg', data), null);
});

test('walk frames cover all 29 frames exactly once', () => {
  const all = Object.values(WALK_FRAMES).flat().sort((a, b) => a - b);
  assert.deepEqual(all, Array.from({ length: WALK_FRAME_COUNT }, (_, i) => i));
});

test('walkInFrame cycles the back walk and stops facing the arena', () => {
  assert.equal(walkInFrame(0), WALK_FRAMES.walkBack[0]);
  assert.equal(walkInFrame(8), WALK_FRAMES.walkBack[1]);
  assert.equal(walkInFrame(500), WALK_FRAMES.idleBack[0]);
});

test('every mapped bey and walk sprite belongs to a roster character', () => {
  const slugs = new Set(roster.map((c) => c.slug));
  for (const slug of Object.keys(GBA_WALK)) assert.ok(slugs.has(slug), slug);
  for (const index of Object.values(GBA_BEYS)) assert.ok(Number.isInteger(index) && index >= 0 && index < 83);
});

test('mapped bey slugs exist in the research catalog', () => {
  const base = 'pesquisa-bakuten/personagens';
  if (!existsSync(base)) return;
  const research = new Set(readdirSync(base).flatMap((c) => (existsSync(join(base, c, 'beyblades')) ? readdirSync(join(base, c, 'beyblades')) : [])));
  for (const slug of Object.keys(GBA_BEYS)) assert.ok(research.has(slug), `${slug} não está em pesquisa-bakuten`);
});
