import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMatch, stepMatch, NEUTRAL_INPUT } from '../src/sim/match.js';
import { ARENA_RADIUS as R, BOWL, DT, GRAVITY, bowlHeight } from '../src/sim/constants.js';

// Física da tigela e comportamento por ponta (docs/BEY_BEHAVIOR.md).
const ticks = (s) => Math.round(s / DT);
const attrs = { ataque: 6, defesa: 6, stamina: 6, velocidade: 6, peso: 6, equilibrio: 6, resistencia_knockout: 6 };
const bey = (over = {}) => ({ slug: 't', nome: 'T', tipo: 'balance', rotacao: 'direita', atributos: attrs, medidas: { diametro_mm: 46, peso_g: 38 }, ...over });

// Uma bey sozinha na arena: a outra sai do palco para não haver choque.
function solo(def, place) {
  const s = createMatch({ beys: [def, bey({ ponta: 'sharp' })], seed: 5 });
  while (s.phase === 'launch') stepMatch(s);
  s.beys[1].state = 'burst';
  if (place) Object.assign(s.beys[0], place);
  return s;
}

const energy = (b) => 0.5 * (b.vx ** 2 + b.vy ** 2) + GRAVITY * bowlHeight(Math.hypot(b.x, b.y));
const NO_TIP = { drive: 0, fwd: 0, mu: 0, slide: 0 };

test('without tip, friction or drag the bowl conserves energy', () => {
  const drag = BOWL.drag;
  BOWL.drag = 0;
  try {
    const s = solo(bey({ tip: NO_TIP }), { x: 0.8 * R, y: 0, vx: 0, vy: 0, spin: 1 });
    const b = s.beys[0];
    const e0 = energy(b);
    const amostras = [];
    for (let t = 0; t < ticks(10); t++) {
      b.spin = 1;
      stepMatch(s);
      amostras.push(energy(b));
    }
    // O integrador semi-implícito faz o erro oscilar perto da borda íngreme, sem acumular.
    const pior = Math.max(...amostras.map((e) => Math.abs(e - e0) / e0));
    const media = (xs) => xs.reduce((x, y) => x + y, 0) / xs.length;
    const deriva = Math.abs(media(amostras.slice(-ticks(2))) - media(amostras.slice(0, ticks(2)))) / e0;
    assert.ok(pior < 0.02, `oscilação de energia ${(pior * 100).toFixed(2)}%`);
    assert.ok(deriva < 0.01, `deriva de energia ${(deriva * 100).toFixed(2)}%`);
  } finally {
    BOWL.drag = drag;
  }
});

test('released on the slope it swings through the center like a pendulum', () => {
  const s = solo(bey({ tip: NO_TIP }), { x: 0.8 * R, y: 0, vx: 0, vy: 0, spin: 1 });
  const b = s.beys[0];
  let minX = Infinity;
  for (let t = 0; t < ticks(1.6); t++) {
    stepMatch(s);
    minX = Math.min(minX, b.x);
  }
  assert.ok(minX < -0.4 * R, `subiu do outro lado só até ${(minX / R).toFixed(2)}R`);
});

test('with light friction and no tip a bey settles at the bottom', () => {
  const s = solo(bey({ tip: { drive: 0, fwd: 0, mu: 0, slide: 0.05 } }), { x: 0.7 * R, y: 0, vx: 0, vy: 300, spin: 1 });
  const b = s.beys[0];
  for (let t = 0; t < ticks(12); t++) {
    b.spin = 1;
    stepMatch(s);
  }
  assert.ok(Math.hypot(b.x, b.y) < 0.15 * R, `ficou a ${(Math.hypot(b.x, b.y) / R).toFixed(2)}R`);
});

// Bey que parou de girar cai de lado e fica onde parou: o atrito dela segura mais que a rampa.
test('a bey that stopped spinning stays where it fell', () => {
  const s = solo(bey({ ponta: 'flat' }), { x: 0.3 * R, y: 0, vx: 0, vy: 0, spin: 0 });
  for (let t = 0; t < ticks(3); t++) {
    stepMatch(s);
    if (s.phase !== 'battle') s.phase = 'battle';
  }
  const b = s.beys[0];
  assert.ok(Math.abs(Math.hypot(b.x, b.y) - 0.3 * R) < 0.05 * R);
});

function radii(def, seconds = 20) {
  const s = solo(def);
  const b = s.beys[0];
  const rs = [];
  let centro = 0;
  for (let t = 0; t < ticks(seconds); t++) {
    stepMatch(s);
    if (t < ticks(2)) continue;
    const r = Math.hypot(b.x, b.y) / R;
    rs.push(r);
    if (r < 0.08) centro++;
  }
  rs.sort((x, y) => x - y);
  return { median: rs[Math.floor(rs.length / 2)], p90: rs[Math.floor(rs.length * 0.9)], centro: centro * DT };
}

test('stamina (sharp tip) stays at the center', () => {
  const r = radii(bey({ ponta: 'sharp', tipo: 'stamina' }));
  assert.ok(r.p90 < 0.1, `p90 ${r.p90.toFixed(2)}`);
});

test('defense (ball tip) circles close to the center without sitting on it', () => {
  const r = radii(bey({ ponta: 'metal-ball', tipo: 'defense' }));
  assert.ok(r.median > 0.1 && r.median < 0.3, `mediana ${r.median.toFixed(2)}`);
  assert.ok(r.p90 < 0.45, `p90 ${r.p90.toFixed(2)}`);
});

test('balance (semi-flat) orbits the middle of the bowl', () => {
  const r = radii(bey({ ponta: 'semi-flat' }));
  assert.ok(r.median > 0.4 && r.median < 0.7, `mediana ${r.median.toFixed(2)}`);
});

test('attack (flat) runs wide and keeps cutting through the center', () => {
  const r = radii(bey({ ponta: 'flat', tipo: 'attack' }));
  assert.ok(r.median > 0.6, `mediana ${r.median.toFixed(2)}`);
  assert.ok(r.centro > 0.5, `passou ${r.centro.toFixed(1)}s perto do centro`);
});

test('with the same spin the stop order is attack, balance, defense, stamina', () => {
  const tempo = (def) => {
    const s = solo(def, { spin: 0.9 });
    const b = s.beys[0];
    let t = 0;
    while (b.state === 'active' && t < ticks(150)) {
      stepMatch(s);
      // A rodada tem limite de tempo; aqui só interessa quanto o giro dura.
      if (s.phase !== 'battle') s.phase = 'battle';
      t++;
    }
    return t;
  };
  const ordem = [
    tempo(bey({ ponta: 'flat', tipo: 'attack', atributos: { ...attrs, peso: 7 } })),
    tempo(bey({ ponta: 'semi-flat', tipo: 'balance', atributos: { ...attrs, peso: 7 } })),
    tempo(bey({ ponta: 'metal-ball', tipo: 'defense', atributos: { ...attrs, peso: 8 } })),
    tempo(bey({ ponta: 'sharp', tipo: 'stamina', atributos: { ...attrs, peso: 6 } })),
  ];
  for (let i = 1; i < ordem.length; i++) assert.ok(ordem[i] > ordem[i - 1], `ordem de parada: ${ordem.map((t) => (t * DT).toFixed(1)).join(' → ')}`);
});
