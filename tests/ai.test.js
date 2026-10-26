import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMatch, stepMatch, NEUTRAL_INPUT } from '../src/sim/match.js';
import { createCpu } from '../src/sim/ai.js';

// IA da CPU (D-051).
const attrs = { ataque: 7, defesa: 6, stamina: 6, velocidade: 6, peso: 6, equilibrio: 6, resistencia_knockout: 6 };
const ataque = { slug: 'a', nome: 'A', tipo: 'attack', ponta: 'flat', rotacao: 'direita', atributos: attrs, medidas: { diametro_mm: 46, peso_g: 38 }, engineGear: true };
const defesa = { ...ataque, slug: 'd', nome: 'D', tipo: 'defense', ponta: 'metal-ball', engineGear: false };

function cpuXcpu({ seed = 3, niveis = [3, 3], beys = [ataque, defesa], ticks = 60 * 120 } = {}) {
  const s = createMatch({ beys, seed });
  const cpus = [0, 1].map((slot) => createCpu({ slot, nivel: niveis[slot], seed: seed + slot }));
  const eventos = [];
  const entradas = [];
  for (let t = 0; t < ticks && s.phase !== 'matchOver'; t++) {
    const c = cpus.map((x) => x.pensar(s));
    entradas.push(JSON.stringify(c));
    stepMatch(s, c);
    eventos.push(...s.events);
  }
  return { s, cpus, eventos, entradas };
}

test('the same seed gives the same CPU inputs (deterministic, own random)', () => {
  const a = cpuXcpu({ ticks: 60 * 30 });
  const b = cpuXcpu({ ticks: 60 * 30 });
  assert.deepEqual(a.entradas, b.entradas);
});

test('the CPU locks its own launch instead of taking the default power', () => {
  const { eventos } = cpuXcpu({ ticks: 60 * 4 });
  for (const slot of [0, 1]) assert.ok(eventos.some((e) => e.type === 'launchLock' && e.slot === slot), `CPU ${slot + 1} não lançou`);
});

test('the CPU attacks, defends and uses the bit-beast and the Engine Gear during a match', () => {
  const { eventos, cpus } = cpuXcpu({ ticks: 60 * 200 });
  const tem = (tipo, slot) => eventos.some((e) => e.type === tipo && (slot === undefined || e.slot === slot));
  assert.ok(tem('attack'), 'ninguém investiu');
  assert.ok(tem('special'), 'ninguém soltou a fera');
  assert.ok(tem('engineGear', 0), 'a ataque com Engine Gear não usou');
  assert.ok(cpus.some((c) => c.log.some((l) => l.intencao === 'defender')), 'ninguém defendeu');
  // Cada decisão tem um motivo legível (é o "raciocínio" do relatório).
  for (const c of cpus) for (const l of c.log) assert.ok(l.motivo && l.intencao, JSON.stringify(l));
});

test('a harder CPU releases at the full-charge flash more often than an easy one', () => {
  const perfeitas = (nivel) => {
    let p = 0;
    let total = 0;
    for (const seed of [1, 2, 3, 4]) {
      const { eventos } = cpuXcpu({ seed, niveis: [nivel, nivel], ticks: 60 * 150 });
      for (const e of eventos) if (e.type === 'attack') {
        total++;
        if (e.perfeita) p++;
      }
    }
    return p / Math.max(1, total);
  };
  assert.ok(perfeitas(5) > perfeitas(1) + 0.1, `nível 5 ${perfeitas(5).toFixed(2)} × nível 1 ${perfeitas(1).toFixed(2)}`);
});

test('a CPU raises the shield against an incoming charged rush', () => {
  const s = createMatch({ beys: [ataque, defesa], seed: 4 });
  while (s.phase === 'launch') stepMatch(s);
  const cpu = createCpu({ slot: 1, nivel: 5, seed: 9 });
  const [A, D] = s.beys;
  let defendeu = false;
  for (let t = 0; t < 60 && !defendeu; t++) {
    // O P1 (humano parado) segura ✕ carregando bem perto.
    Object.assign(A, { x: -100, y: 0, vx: 0, vy: 0, attackCharge: 0.9 });
    Object.assign(D, { x: 60, y: 0 });
    const c = cpu.pensar(s);
    defendeu = c.held.defend;
    stepMatch(s, [NEUTRAL_INPUT, c]);
  }
  assert.ok(defendeu, 'a CPU não defendeu');
});
