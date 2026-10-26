import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LAUNCH,
  beatTick,
  beatWindow,
  cpuLaunchPress,
  createLaunch,
  judge,
  launchEndTick,
  launchMisses,
  launchSpin,
  perfectLaunch,
  stepLaunchSlot,
} from '../src/sim/launch.js';

const NADA = { move: { x: 0, y: 0 }, pressed: {} };
const APERTA = { move: { x: 0, y: 0 }, pressed: { attack: true } };

// Roda o lançamento inteiro apertando nos ticks de `apertos`.
function rodar(apertos, input = () => NADA) {
  const l = createLaunch();
  const set = new Set(apertos);
  for (let tick = 1; !l.done; tick++) stepLaunchSlot(l, tick, set.has(tick) ? APERTA : input(tick));
  return l;
}
const batidas = (delta = 0) => Array.from({ length: LAUNCH.beats }, (_, n) => beatTick(n) + delta);

test('the hit window narrows every beat and the rhythm speeds up', () => {
  for (let n = 1; n < LAUNCH.beats; n++) {
    assert.ok(beatWindow(n) < beatWindow(n - 1));
    assert.ok(beatTick(n) - beatTick(n - 1) <= beatTick(Math.max(1, n - 1)) - beatTick(Math.max(0, n - 2)) || n === 1);
  }
  assert.equal(judge(0, 5), 'bom');
  assert.equal(judge(9, 5), 'errou', 'o mesmo atraso que vale Bom no começo erra no fim');
});

test('ten exact presses fill the energy and give the perfect launch above max spin', () => {
  const l = rodar(batidas());
  assert.deepEqual(l.hits, Array(10).fill('perfeito'));
  assert.equal(l.energy, 1);
  assert.ok(perfectLaunch(l));
  assert.equal(launchSpin(l), LAUNCH.perfectSpin);
  assert.ok(launchSpin(l) > 1);
});

test('eight perfects are enough for the perfect launch, seven are not', () => {
  const oito = batidas().map((t, n) => (n < 8 ? t : t + 200));
  assert.ok(perfectLaunch(rodar(oito)));
  const sete = batidas().map((t, n) => (n < 7 ? t : t + 200));
  const l = rodar(sete);
  assert.ok(!perfectLaunch(l));
  assert.ok(launchSpin(l) <= 1);
});

test('not pressing at all launches with the minimum spin', () => {
  const l = rodar([]);
  assert.deepEqual(l.hits, Array(10).fill('errou'));
  assert.equal(launchSpin(l), 0.55);
  assert.equal(launchMisses(l), 10);
});

test('mashing the button counts as misses instead of helping', () => {
  const tudo = [];
  for (let t = LAUNCH.aimTicks + 1; t < launchEndTick(); t++) tudo.push(t);
  const l = rodar(tudo);
  assert.ok(l.hits.filter((h) => h === 'errou').length >= 8);
  assert.ok(!perfectLaunch(l));
});

test('pressing during the countdown is a premature launch with no energy', () => {
  const l = rodar([60]);
  assert.equal(l.early, true);
  assert.equal(l.done, true);
  assert.equal(launchSpin(l), 0.55);
});

test('the stick moves the aim during the countdown and it is clamped', () => {
  const l = rodar([], (tick) => ({ move: { x: tick < LAUNCH.aimTicks ? 1 : 0, y: 0 }, pressed: {} }));
  assert.equal(l.aim, 1);
});

test('the cpu is deterministic by seed and better at higher levels', () => {
  const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const cpu = (nivel, seed) => {
    const l = createLaunch();
    const rand = seeded(seed);
    for (let tick = 1; !l.done; tick++) stepLaunchSlot(l, tick, cpuLaunchPress(l, tick, nivel, rand) ? APERTA : NADA);
    return l;
  };
  assert.deepEqual(cpu(3, 42).hits, cpu(3, 42).hits);
  const media = (nivel) => {
    let e = 0;
    for (let s = 1; s <= 40; s++) e += cpu(nivel, s * 97).energy;
    return e / 40;
  };
  assert.ok(media(5) > media(1) + 0.2, `nível 5 ${media(5)} × nível 1 ${media(1)}`);
});
