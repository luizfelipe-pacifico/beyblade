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

// Escudo (D-042): investida do ataque contra a defesa segurando ○.
function contraEscudo(s, { segura = true } = {}) {
  const [A, D] = s.beys;
  Object.assign(A, { x: -80, y: 0, vx: 900, vy: 0 });
  Object.assign(D, { x: 0, y: 0, vx: 0, vy: 0 });
  const antes = { a: A.spin, d: D.spin };
  const eventos = [];
  for (let t = 0; t < 20; t++) {
    stepMatch(s, [NEUTRAL_INPUT, input({ held: { defend: segura } })]);
    eventos.push(...s.events);
  }
  return { perdaA: antes.a - A.spin, perdaD: antes.d - D.spin, eventos };
}

function emBatalha() {
  const s = createMatch({ beys: [ataque, defesa], seed: 9 });
  while (s.phase === 'launch') stepMatch(s);
  // Escudo já levantado antes do choque.
  for (let t = 0; t < 10; t++) stepMatch(s, [NEUTRAL_INPUT, input({ held: { defend: true } })]);
  return s;
}

test('a raised shield takes no spin loss from the hit; only the attacker loses spin', () => {
  const s = emBatalha();
  const r = contraEscudo(s);
  assert.ok(r.eventos.some((e) => e.type === 'hit'), 'não houve choque');
  assert.ok(r.perdaA > 0, 'quem bateu não perdeu giro');
  // Só a perda passiva da defesa segurada (guardDrain) e do giro parado, nada do choque.
  const s2 = emBatalha();
  const [, D2] = s2.beys;
  const giro = D2.spin;
  for (let t = 0; t < 20; t++) stepMatch(s2, [NEUTRAL_INPUT, input({ held: { defend: true } })]);
  assert.ok(Math.abs(r.perdaD - (giro - D2.spin)) < 0.003, `a defesa perdeu ${r.perdaD.toFixed(4)} no choque`);
});

test('the shield breaks after two strong hits and then cannot be raised until it recharges', async () => {
  const { SHIELD, PHYSICS } = await import('../src/sim/constants.js');
  const s = emBatalha();
  const D = s.beys[1];
  let quebrou = false;
  for (let golpe = 0; golpe < 2; golpe++) {
    const r = contraEscudo(s);
    quebrou ||= r.eventos.some((e) => e.type === 'shieldBreak' && e.slot === 1);
    if (golpe === 0) assert.ok(!quebrou && D.shield > 0, 'quebrou na primeira pancada');
  }
  assert.ok(quebrou, 'não quebrou na segunda pancada');
  assert.equal(D.guard, false);
  // Segurando ○ com o escudo quebrado, ele não sobe; sem segurar, recarrega devagar.
  stepMatch(s, [NEUTRAL_INPUT, input({ held: { defend: true } })]);
  assert.equal(D.guard, false);
  const t = Math.ceil(SHIELD.minToRaise / SHIELD.regen / DT) + 2;
  for (let i = 0; i < t; i++) {
    D.spin = 1;
    stepMatch(s, [NEUTRAL_INPUT, NEUTRAL_INPUT]);
  }
  stepMatch(s, [NEUTRAL_INPUT, input({ held: { defend: true } })]);
  assert.equal(D.guard, true);
  assert.ok(PHYSICS.strongImpact > 0);
});

// Regressão (D-043): o crítico multiplicava o empurrão inteiro e jogava a defesa a ~2,8 m/s, mais
// rápido do que o ataque chegou. O empurrão agora respeita o impulso do choque (momento) e só a parte
// do giro cresce no crítico.
test('a critical hit never pushes the target faster than momentum and spin allow', async () => {
  const { PHYSICS } = await import('../src/sim/constants.js');
  const s = createMatch({ beys: [ataque, defesa], seed: 9 });
  while (s.phase === 'launch') stepMatch(s);
  const [A, D] = s.beys;
  const v = 2 * PHYSICS.maxSpeed;
  Object.assign(A, { x: 20, y: 0, vx: v, vy: 0, critReady: CRITICAL.hitWindow });
  Object.assign(D, { x: 80, y: 0, vx: 0, vy: 0 });
  let critico = false;
  let maior = 0;
  for (let t = 0; t < 10; t++) {
    stepMatch(s, [NEUTRAL_INPUT, NEUTRAL_INPUT]);
    critico ||= s.events.some((e) => e.type === 'critical');
    // O empurrão que o alvo recebeu no choque, antes de qualquer teto de velocidade do passo seguinte.
    for (const e of s.events) if (e.type === 'hit') maior = Math.max(maior, e.empurrao[1]);
  }
  assert.ok(critico, 'o crítico não saiu');
  assert.ok(maior < 2.5 * PHYSICS.maxSpeed, `alvo empurrado a ${maior.toFixed(0)} mm/s`);
});
