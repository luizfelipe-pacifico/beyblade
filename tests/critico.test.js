import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMatch, stepMatch, NEUTRAL_INPUT } from '../src/sim/match.js';
import { CRITICAL, DT } from '../src/sim/constants.js';

// Golpe crítico (D-040): investida perfeita, de frente e empurrando o alvo para fora.
const attrs = { ataque: 9, defesa: 4.4, stamina: 6.8, velocidade: 5.5, peso: 7.9, equilibrio: 6.5, resistencia_knockout: 6.7 };
const ataque = { slug: 'a', nome: 'A', tipo: 'attack', ponta: 'flat', rotacao: 'direita', atributos: attrs, medidas: { diametro_mm: 46, peso_g: 38 } };
const defesa = { ...ataque, slug: 'd', nome: 'D', tipo: 'defense', ponta: 'metal-ball', atributos: { ...attrs, ataque: 4.3, defesa: 9.3, stamina: 9 } };
const input = (over = {}) => ({ move: { x: 0, y: 0 }, held: {}, pressed: {}, ...over });

// Carrega ✕ com as duas beys paradas no lugar e solta `atraso` ticks depois do estalo.
function investida({ a, d, atraso = 0 }) {
  const s = createMatch({ beys: [ataque, defesa], seed: 9 });
  while (s.phase === 'launch') stepMatch(s);
  const [A, D] = s.beys;
  const fixa = () => {
    Object.assign(A, { ...a, vx: 0, vy: 0 });
    Object.assign(D, { ...d, vx: 0, vy: 0 });
  };
  let cheia = -1;
  for (let t = 0; t < 200; t++) {
    fixa();
    stepMatch(s, [input({ held: { attack: true } }), NEUTRAL_INPUT]);
    if (s.events.some((e) => e.type === 'chargeFull')) cheia = t;
    if (cheia >= 0 && t >= cheia + atraso) break;
  }
  const giroAntes = D.spin;
  const eventos = [];
  stepMatch(s, [input(), NEUTRAL_INPUT]);
  eventos.push(...s.events);
  for (let t = 0; t < Math.round(0.5 / DT) && !eventos.some((e) => e.type === 'hit'); t++) {
    stepMatch(s, [NEUTRAL_INPUT, NEUTRAL_INPUT]);
    eventos.push(...s.events);
  }
  return { critico: eventos.some((e) => e.type === 'critical' && e.slot === 0), bateu: eventos.some((e) => e.type === 'hit'), perda: giroAntes - D.spin };
}

const paraFora = { a: { x: -60, y: 0 }, d: { x: 60, y: 0 } };

test('a perfect release that hits head-on and pushes outward is a critical hit', () => {
  const r = investida(paraFora);
  assert.ok(r.bateu, 'a investida não bateu');
  assert.ok(r.critico, 'não saiu crítico');
});

test('releasing after the perfect window gives a normal hit, with less spin damage', () => {
  const tarde = Math.ceil(CRITICAL.perfectWindow / DT) + 2;
  const normal = investida({ ...paraFora, atraso: tarde });
  assert.ok(normal.bateu && !normal.critico);
  assert.ok(investida(paraFora).perda > 1.5 * normal.perda, 'o crítico não dói mais');
});

test('a hit that pushes the target toward the center is never critical', () => {
  // O alvo está entre o ataque e o centro: o empurrão é para dentro.
  const r = investida({ a: { x: 260, y: 0 }, d: { x: 140, y: 0 } });
  assert.ok(r.bateu && !r.critico);
});
