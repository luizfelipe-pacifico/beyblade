import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aimAt, createMatch, stepMatch, launchPower, NEUTRAL_INPUT } from '../src/sim/match.js';
import { ARENA_RADIUS, DT, LAUNCH_SECONDS, PHYSICS } from '../src/sim/constants.js';

const bey = (over = {}) => ({
  slug: 'teste',
  nome: 'Teste',
  tipo: 'balance',
  rotacao: 'direita',
  especial: 'Golpe',
  atributos: { ataque: 6, defesa: 6, stamina: 6, velocidade: 6, peso: 6, equilibrio: 6, resistencia_knockout: 6 },
  medidas: { diametro_mm: 46, peso_g: 38 },
  ...over,
});

const input = (over = {}) => ({ move: { x: 0, y: 0 }, held: {}, pressed: {}, ...over });
const ticks = (s) => Math.round(s / DT);

function toBattle(state, inputs = [NEUTRAL_INPUT, NEUTRAL_INPUT]) {
  while (state.phase === 'launch') stepMatch(state, inputs);
  return state;
}

// Roteiro de input que muda com o tick: o mesmo roteiro tem que dar o mesmo jogo.
function scripted(tick) {
  const ang = tick * 0.07;
  return [
    input({ move: { x: Math.cos(ang), y: Math.sin(ang) }, held: { attack: tick % 50 < 20 }, pressed: { attack: tick === 40 } }),
    input({ move: { x: -Math.sin(ang), y: Math.cos(ang) }, held: { defend: tick % 90 < 20, jump: tick % 70 < 4, dodge: tick % 140 < 30 } }),
  ];
}

test('same seed and same inputs produce the same match', () => {
  const run = () => {
    const s = createMatch({ beys: [bey({ tipo: 'attack' }), bey({ rotacao: 'esquerda', tipo: 'stamina' })], seed: 42 });
    for (let t = 0; t < ticks(40); t++) stepMatch(s, scripted(s.tick));
    return JSON.stringify({ beys: s.beys, wins: s.wins, rounds: s.rounds, phase: s.phase, rng: s.rng });
  };
  assert.equal(run(), run());
});

test('countdown announces 3, 2, 1 and then go', () => {
  const s = createMatch({ beys: [bey(), bey()] });
  const seen = [];
  for (let t = 0; t < ticks(LAUNCH_SECONDS) + 1; t++) {
    stepMatch(s);
    for (const e of s.events) if (e.type === 'countdown' || e.type === 'go') seen.push(e.n ?? 'go');
  }
  assert.deepEqual(seen, [3, 2, 1, 'go']);
  assert.equal(s.phase, 'battle');
});

test('pressing attack at the top of the launch bar beats not launching', () => {
  const s = createMatch({ beys: [bey(), bey()] });
  // A barra sobe sozinha e chega ao topo em 0,9 s; P1 aperta ✕ ali, P2 não aperta.
  for (let t = 0; t < ticks(LAUNCH_SECONDS) + 1; t++) {
    stepMatch(s, [input({ pressed: { attack: t === ticks(0.9) - 1 } }), NEUTRAL_INPUT]);
  }
  assert.ok(launchPower(s, 0) > 0.9, `força ${launchPower(s, 0)}`);
  assert.ok(s.beys[0].spin > s.beys[1].spin, 'quem lança na hora certa entra com mais giro');
});

test('colliding beys separate and both lose spin', () => {
  const s = toBattle(createMatch({ beys: [bey(), bey()] }));
  const [a, b] = s.beys;
  Object.assign(a, { x: -20, y: 0, vx: 300, vy: 0 });
  Object.assign(b, { x: 20, y: 0, vx: -300, vy: 0 });
  const before = [a.spin, b.spin];
  stepMatch(s);
  assert.ok(Math.hypot(b.x - a.x, b.y - a.y) >= a.r + b.r - 1e-6, 'não ficam sobrepostas');
  assert.ok(a.vx < 300 && b.vx > -300, 'o choque inverte ou freia as duas');
  assert.ok(a.spin < before[0] && b.spin < before[1]);
});

test('a bey that runs out of spin loses by spin finish', () => {
  const s = toBattle(createMatch({ beys: [bey(), bey()] }));
  s.beys[0].spin = 0.0001;
  let finish = null;
  for (let t = 0; t < 10 && !finish; t++) {
    stepMatch(s);
    finish = s.events.find((e) => e.type === 'finish') ?? null;
  }
  assert.deepEqual(finish && { winner: finish.winner, finish: finish.finish }, { winner: 2, finish: 'spin' });
});

test('a fast bey leaving through a pocket loses by ring out', () => {
  const s = toBattle(createMatch({ beys: [bey(), bey()] }));
  const p = s.beys[1];
  // Bolso em 90° (para baixo na tela), saindo acima do limiar de saída.
  Object.assign(p, { x: 0, y: ARENA_RADIUS - p.r - 1, vx: 0, vy: PHYSICS.pocketOutSpeed * 1.2 });
  stepMatch(s);
  assert.equal(p.state, 'out');
  assert.deepEqual(s.pending, { winner: 1, finish: 'ringout' });
});

test('a slow bey bounces off the rim outside a pocket', () => {
  const s = toBattle(createMatch({ beys: [bey(), bey()] }));
  const p = s.beys[1];
  Object.assign(p, { x: ARENA_RADIUS - p.r - 1, y: 0, vx: PHYSICS.pocketOutSpeed * 0.5, vy: 0 });
  stepMatch(s);
  assert.equal(p.state, 'active');
  assert.ok(p.vx < 0, 'volta para dentro');
  assert.ok(Math.hypot(p.x, p.y) + p.r <= ARENA_RADIUS + 1e-6);
});

test('a whole match ends with a winner after two round wins', () => {
  const s = createMatch({ beys: [bey({ tipo: 'attack' }), bey({ tipo: 'defense' })], seed: 7 });
  let guard = 0;
  while (s.phase !== 'matchOver' && guard++ < ticks(60 * 8)) stepMatch(s, scripted(s.tick));
  assert.equal(s.phase, 'matchOver');
  assert.ok(s.winner === 1 || s.winner === 2);
  assert.equal(s.wins[s.winner - 1], 2);
  for (const r of s.rounds) assert.ok(['spin', 'ringout', 'burst', 'decision', 'draw'].includes(r.finish), r.finish);
});

const hold = (held) => input({ held });

test('L1 + R1 held together fire the bit-beast only with a full meter', () => {
  const s = toBattle(createMatch({ beys: [bey({ tipo: 'stamina' }), bey()] }));
  const a = s.beys[0];
  a.special = 0.5;
  stepMatch(s, [hold({ jump: true, dodge: true }), NEUTRAL_INPUT]);
  stepMatch(s, [NEUTRAL_INPUT, NEUTRAL_INPUT]);
  assert.ok(!s.events.some((e) => e.type === 'special'), 'sem barra cheia não sai');
  assert.equal(a.air, 0, 'soltar a combinação não vira pulo');
  a.special = 1;
  a.spin = 0.4;
  stepMatch(s, [hold({ jump: true, dodge: true }), NEUTRAL_INPUT]);
  assert.ok(s.events.some((e) => e.type === 'special' && e.slot === 0));
  assert.ok(a.special < 0.1 && a.spin > 0.6, 'gasta a barra e recupera giro');
});

test('tapping L1 jumps and an airborne bey passes over the other', () => {
  const s = toBattle(createMatch({ beys: [bey(), bey()] }));
  const [a, b] = s.beys;
  stepMatch(s, [hold({ jump: true }), NEUTRAL_INPUT]);
  stepMatch(s, [NEUTRAL_INPUT, NEUTRAL_INPUT]);
  assert.ok(a.air > 0, 'está no ar');
  Object.assign(a, { x: -10, y: 0, vx: 300, vy: 0 });
  Object.assign(b, { x: 10, y: 0, vx: -300, vy: 0 });
  const spins = [a.spin, b.spin];
  stepMatch(s);
  assert.ok(!s.events.some((e) => e.type === 'hit'), 'não houve choque');
  assert.ok(Math.abs(a.spin - spins[0]) < 0.01 && Math.abs(b.spin - spins[1]) < 0.01);
});

test('a charged attack hits harder than a quick tap', () => {
  const dashSpeed = (frames) => {
    const s = toBattle(createMatch({ beys: [bey(), bey()] }));
    const a = s.beys[0];
    Object.assign(a, { x: 0, y: 0, vx: 0, vy: 0 });
    // Adversário fora do palco: sem choque no meio da carga, só a investida conta.
    Object.assign(s.beys[1], { x: 150, y: 0, state: 'burst' });
    for (let t = 0; t < frames; t++) stepMatch(s, [hold({ attack: true }), NEUTRAL_INPUT]);
    Object.assign(a, { vx: 0, vy: 0 });
    stepMatch(s, [NEUTRAL_INPUT, NEUTRAL_INPUT]);
    return Math.hypot(a.vx, a.vy);
  };
  assert.ok(dashSpeed(ticks(1)) > dashSpeed(1) * 1.4);
});

test('holding attack announces a full charge exactly once', () => {
  const s = toBattle(createMatch({ beys: [bey(), bey()] }));
  Object.assign(s.beys[1], { x: 300, y: 0 });
  let cheias = 0;
  for (let t = 0; t < ticks(2); t++) {
    stepMatch(s, [hold({ attack: true }), NEUTRAL_INPUT]);
    cheias += s.events.filter((e) => e.type === 'chargeFull').length;
  }
  assert.equal(cheias, 1);
  assert.equal(s.beys[0].attackCharge, 1);
});

test('✕ + ○ fires the Engine Gear once per round and only on Engine Gear beys', () => {
  const s = toBattle(createMatch({ beys: [bey({ engineGear: true }), bey({ engineGear: false })] }));
  const both = hold({ attack: true, defend: true });
  const fired = [];
  // Aperta a combinação duas vezes, soltando no meio: só a primeira conta.
  for (const inputs of [[both, both], [NEUTRAL_INPUT, NEUTRAL_INPUT], [both, both], [both, both]]) {
    stepMatch(s, inputs);
    for (const e of s.events) if (e.type === 'engineGear') fired.push(e.slot);
  }
  assert.deepEqual(fired, [0]);
  assert.ok(s.beys[0].effects.length > 0, 'o reforço está ativo');
});

// Regressão: com giros opostos a equalização deixava as duas com o mesmo giro, elas paravam
// no mesmo subpasso e toda rodada sem input virava empate, então a partida nunca acabava.
test('two beys stopping in the same substep are split by who stopped first', () => {
  const s = toBattle(createMatch({ beys: [bey(), bey({ rotacao: 'esquerda' })] }));
  s.beys[0].spin = 0.000001;
  s.beys[1].spin = 0.000002;
  let finish = null;
  for (let t = 0; t < 5 && !finish; t++) {
    stepMatch(s);
    finish = s.events.find((e) => e.type === 'finish') ?? null;
  }
  assert.deepEqual(finish && { winner: finish.winner, finish: finish.finish }, { winner: 2, finish: 'spin' });
});

// Com atributos diferentes (como todas as beys do elenco), a que gasta mais giro para antes.
test('an idle match between different beys still finishes', () => {
  const forte = { ataque: 9, defesa: 4.4, stamina: 6.8, velocidade: 5.5, peso: 7.9, equilibrio: 6.5, resistencia_knockout: 6.7 };
  const defensiva = { ataque: 4.3, defesa: 9.3, stamina: 9, velocidade: 3.7, peso: 8.4, equilibrio: 6.4, resistencia_knockout: 6.7 };
  const s = createMatch({ beys: [bey({ tipo: 'attack', rotacao: 'esquerda', atributos: forte }), bey({ tipo: 'defense', atributos: defensiva })], seed: 3 });
  while (s.phase !== 'matchOver' && s.tick < ticks(60 * 10)) stepMatch(s);
  assert.equal(s.phase, 'matchOver');
});

test('training mode has no clock, no score and the dummy keeps its spin', () => {
  const s = toBattle(createMatch({ beys: [bey(), bey()], seed: 3, treino: true }));
  for (let t = 0; t < ticks(70) && s.phase === 'battle'; t++) {
    s.beys[0].spin = 1;
    stepMatch(s);
  }
  // O relógio de 60 s não decide a rodada e o boneco não perde giro.
  assert.equal(s.phase, 'battle');
  assert.ok(s.beys[1].spin >= 1);
  // Uma rodada que termina (aqui forçada pelo P1 parar) não entra no placar.
  s.beys[0].spin = 0;
  for (let t = 0; t < ticks(10) && s.phase !== 'launch'; t++) stepMatch(s);
  assert.deepEqual(s.wins, [0, 0]);
  assert.equal(s.winner, 0);
});

test('a released charged attack heads at the other bey even with the stick pointing away', () => {
  const s = toBattle(createMatch({ beys: [bey(), bey()], seed: 4 }));
  const [a, b] = s.beys;
  Object.assign(a, { x: -150, y: 0, vx: 0, vy: 300 });
  Object.assign(b, { x: 150, y: 0, vx: 0, vy: 0 });
  const angulo = (d) => {
    const alvo = Math.atan2(b.y - a.y, b.x - a.x);
    const x = Math.atan2(d.y, d.x) - alvo;
    return Math.abs(Math.atan2(Math.sin(x), Math.cos(x))) * (180 / Math.PI);
  };
  // A mira com o direcional para trás (para longe do oponente) corrige no máximo 25°.
  assert.ok(angulo(aimAt(s, a, { x: -1, y: 0 }, PHYSICS.dashSpeed)) <= 25.01);
  // Sem direcional, a investida de verdade sai na direção do oponente.
  for (let t = 0; t < ticks(0.8); t++) stepMatch(s, [input({ held: { attack: true } }), NEUTRAL_INPUT]);
  stepMatch(s, [input(), NEUTRAL_INPUT]);
  const ang = angulo({ x: a.vx, y: a.vy });
  assert.ok(ang < 15, `investida saiu a ${ang.toFixed(0)}° do oponente`);
});

test('beys bounce apart farther after a harder hit', () => {
  const gap = (v) => {
    const s = toBattle(createMatch({ beys: [bey(), bey({ rotacao: 'esquerda' })], seed: 2 }));
    const [a, b] = s.beys;
    Object.assign(a, { x: -60, y: 0, vx: v / 2, vy: 0 });
    Object.assign(b, { x: 60, y: 0, vx: -v / 2, vy: 0 });
    let hit = -1;
    for (let t = 0; t < 60; t++) {
      stepMatch(s);
      if (hit < 0 && s.events.some((e) => e.type === 'hit')) hit = t;
      if (hit >= 0 && t === hit + 20) return Math.hypot(a.x - b.x, a.y - b.y) - a.r - b.r;
    }
    return 0;
  };
  const leve = gap(100);
  const forte = gap(1200);
  assert.ok(forte > 2.5 * leve, `leve ${leve.toFixed(0)} mm, forte ${forte.toFixed(0)} mm`);
});

test('the bit-beast boosts the bey for a limited time and cannot stack', async () => {
  const { FERA } = await import('../src/sim/constants.js');
  const s = toBattle(createMatch({ beys: [bey(), bey()], seed: 6 }));
  const a = s.beys[0];
  a.special = 1;
  const lr = input({ held: { jump: true, dodge: true } });
  stepMatch(s, [lr, NEUTRAL_INPUT]);
  assert.ok(s.events.some((e) => e.type === 'special'), 'a fera não saiu');
  assert.ok(a.effects.some((e) => e.fx === 'fera'));
  // Barra cheia de novo com a fera fora: não invoca outra vez.
  stepMatch(s, [NEUTRAL_INPUT, NEUTRAL_INPUT]);
  a.special = 1;
  stepMatch(s, [lr, NEUTRAL_INPUT]);
  assert.equal(a.special, 1, 'invocou por cima da fera ativa');
  // Depois do tempo, os atributos voltam e o fim é avisado.
  let fim = false;
  for (let t = 0; t < ticks(FERA.seconds + 0.5) && !fim; t++) {
    a.spin = 1;
    s.beys[1].spin = 1;
    stepMatch(s);
    fim = s.events.some((e) => e.type === 'feraEnd' && e.slot === 0);
  }
  assert.ok(fim, 'a fera não voltou');
  assert.ok(!a.effects.some((e) => e.fx === 'fera'));
});
