import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMatch, stepMatch, NEUTRAL_INPUT } from '../src/sim/match.js';
import { DT, ENGINE_GEAR, PHYSICS } from '../src/sim/constants.js';

// Giro como vida, direção do golpe, pisão, inclinação e Engine Gear (D-052).
const attrs = { ataque: 6, defesa: 6, stamina: 6, velocidade: 6, peso: 6, equilibrio: 6, resistencia_knockout: 6 };
const bey = (over = {}) => ({ slug: 't', nome: 'T', tipo: 'balance', ponta: 'semi-flat', rotacao: 'direita', atributos: attrs, medidas: { diametro_mm: 46, peso_g: 38 }, ...over });
const input = (over = {}) => ({ move: { x: 0, y: 0 }, held: {}, pressed: {}, ...over });
const ticks = (s) => Math.round(s / DT);

function emBatalha(beys = [bey(), bey()]) {
  const s = createMatch({ beys, seed: 11 });
  while (s.phase === 'launch') stepMatch(s);
  return s;
}

test('engine gear recovers 40% of spin, 60% on attack types, then needs a long recharge', () => {
  for (const [tipo, esperado] of [['balance', ENGINE_GEAR.recover], ['attack', ENGINE_GEAR.recoverAttack]]) {
    const s = emBatalha([bey({ tipo, engineGear: true }), bey()]);
    const a = s.beys[0];
    a.spin = 0.3;
    stepMatch(s, [input({ held: { attack: true, defend: true } }), NEUTRAL_INPUT]);
    assert.ok(Math.abs(a.spin - Math.min(1, 0.3 + esperado)) < 0.01, `${tipo}: giro ${a.spin.toFixed(3)}`);
    assert.ok(a.egCd > ENGINE_GEAR.cooldown - 0.1);
    // Recarregando: apertar de novo não faz nada.
    stepMatch(s, [NEUTRAL_INPUT, NEUTRAL_INPUT]);
    const giro = a.spin;
    stepMatch(s, [input({ held: { attack: true, defend: true } }), NEUTRAL_INPUT]);
    assert.ok(a.spin <= giro, 'usou de novo durante a recarga');
  }
});

test('after the engine gear, the bey burns spin a bit faster', () => {
  const perda = (usou) => {
    const s = emBatalha([bey({ engineGear: true }), bey()]);
    s.beys[1].state = 'out';
    const a = s.beys[0];
    if (usou) stepMatch(s, [input({ held: { attack: true, defend: true } }), NEUTRAL_INPUT]);
    else stepMatch(s);
    a.spin = 0.8;
    for (let t = 0; t < ticks(10); t++) stepMatch(s);
    return 0.8 - a.spin;
  };
  assert.ok(perda(true) > 1.15 * perda(false), `com ${perda(true).toFixed(4)} × sem ${perda(false).toFixed(4)}`);
});

test('spin works like health: idle spin lasts long, hits take the most', () => {
  const s = emBatalha();
  s.beys[1].state = 'out';
  const a = s.beys[0];
  a.spin = 1;
  for (let t = 0; t < ticks(30); t++) stepMatch(s);
  // Meio minuto girando à toa gasta pouco.
  assert.ok(a.spin > 0.7, `perdeu ${(1 - a.spin).toFixed(2)} em 30 s parada`);
});

// Mesma velocidade de aproximação (900 mm/s) nos dois casos: só muda de que lado o golpe pega.
function golpe(alvoVelocidade) {
  const s = emBatalha();
  const [A, B] = s.beys;
  Object.assign(A, { x: -60, y: 0, vx: 900 + alvoVelocidade, vy: 0, spin: 1 });
  Object.assign(B, { x: 0, y: 0, vx: alvoVelocidade, vy: 0, spin: 1 });
  for (let t = 0; t < 8; t++) stepMatch(s);
  return 1 - B.spin;
}

test('a hit in the back takes more spin than a head-on one', () => {
  // Pelas costas: o alvo anda para longe de quem bate. De frente: anda na direção dele. (De frente com
  // as duas velocidades somadas o impacto é maior e dói mais: isso é física, não a regra do lado.)
  const costas = golpe(300);
  const frente = golpe(-300);
  assert.ok(costas > 1.3 * frente, `costas ${costas.toFixed(4)} × frente ${frente.toFixed(4)}`);
});

test('landing a jump on the other bey pushes it away and knocks it off balance', () => {
  const s = emBatalha();
  const [A, B] = s.beys;
  Object.assign(B, { x: 20, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 });
  Object.assign(A, { x: 0, y: 0, vx: 0, vy: 0, air: DT * 1.5 });
  let pisou = false;
  for (let t = 0; t < 3; t++) {
    Object.assign(A, { vx: 0, vy: 0 });
    stepMatch(s);
    pisou ||= s.events.some((e) => e.type === 'stomp');
  }
  assert.ok(pisou, 'não houve pisão');
  assert.ok(B.vx > PHYSICS.maxSpeed * 0.3, `alvo saiu a ${B.vx.toFixed(0)} mm/s`);
  assert.ok(Math.hypot(B.tx, B.ty) > 0.2, 'o alvo não desequilibrou');
});

test('tilt steers the bey and the spin straightens it, faster with more spin', () => {
  // Inclinada para +y, a ponta rola de lado (sentido do giro): a bey sai da linha reta.
  const s = emBatalha();
  s.beys[1].state = 'out';
  const a = s.beys[0];
  Object.assign(a, { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0.5, spin: 1 });
  stepMatch(s);
  assert.ok(Math.abs(a.vx) > 1, 'a inclinação não moveu a bey');
  const endireitar = (spin) => {
    const s2 = emBatalha();
    s2.beys[1].state = 'out';
    const b = s2.beys[0];
    Object.assign(b, { tx: 0.5, ty: 0, spin });
    for (let t = 0; t < ticks(0.3); t++) {
      b.spin = spin;
      stepMatch(s2);
    }
    return Math.hypot(b.tx, b.ty);
  };
  assert.ok(endireitar(1) < endireitar(0.3), 'mais giro não endireitou mais rápido');
});
