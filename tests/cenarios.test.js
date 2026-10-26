import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALEATORIA, CENARIOS, cenario, regrasDe, resolverArena } from '../src/content/cenarios.js';
import { createMatch, stepMatch } from '../src/sim/match.js';
import { ARENA_RADIUS as R, DT, PHYSICS, POCKETS } from '../src/sim/constants.js';

// Cenários do anime (D-039, docs/CENARIOS.md).
const attrs = { ataque: 6, defesa: 6, stamina: 6, velocidade: 6, peso: 6, equilibrio: 6, resistencia_knockout: 6 };
const bey = (over = {}) => ({ slug: 't', nome: 'T', tipo: 'balance', rotacao: 'direita', atributos: attrs, medidas: { diametro_mm: 46, peso_g: 38 }, ponta: 'semi-flat', ...over });
const ticks = (s) => Math.round(s / DT);

function solo(regras, place) {
  const s = createMatch({ beys: [bey(), bey({ ponta: 'sharp' })], seed: 5, regras });
  while (s.phase === 'launch') stepMatch(s);
  s.beys[1].state = 'out';
  Object.assign(s.beys[0], place);
  return s;
}

test('every scenario has a unique slug, a name, an origin and known rules', () => {
  const slugs = new Set(CENARIOS.map((c) => c.slug));
  assert.equal(slugs.size, CENARIOS.length);
  const chaves = new Set(['atrito', 'ringOut', 'saida', 'vento', 'giro']);
  for (const c of CENARIOS) {
    assert.ok(c.nome && c.origem && c.tema?.cenario, c.slug);
    for (const k of Object.keys(c.regras)) assert.ok(chaves.has(k), `${c.slug}: regra ${k}`);
  }
});

test('the arena param resolves a scenario, a GBA stadium or a random pick', () => {
  assert.equal(resolverArena('lago-baikal').slug, 'lago-baikal');
  assert.equal(resolverArena('rom-3').slug, 'rom-3');
  assert.equal(resolverArena('rom-3').tema.tigelaImagem, '/rom/stadiums/3-bowl.png');
  // Fora do intervalo, desconhecido, ausente ou "aleatoria": sorteia entre os do anime.
  for (const arena of ['rom-9', 'nada', undefined, ALEATORIA]) {
    assert.ok(CENARIOS.includes(resolverArena(arena, () => 0.99)), String(arena));
  }
  assert.equal(resolverArena(ALEATORIA, () => 0).slug, CENARIOS[0].slug);
  assert.equal(cenario('rom-7'), null);
});

test('ice lets a bey slide farther than sand', () => {
  const distancia = (slug) => {
    const s = solo(regrasDe(cenario(slug)), { x: 0, y: 0, vx: 600, vy: 0, spin: 0.01 });
    const b = s.beys[0];
    // Sem giro a ponta não empurra: só sobra o atrito do piso freando.
    b.state = 'stopped';
    for (let t = 0; t < ticks(0.4); t++) stepMatch(s);
    return Math.hypot(b.x, b.y);
  };
  assert.ok(distancia('lago-baikal') > 1.5 * distancia('praia-de-treino'));
});

test('a high wall stops ring outs even at full speed through a pocket', () => {
  const a = POCKETS[0];
  const v = 3 * PHYSICS.pocketOutSpeed;
  const lance = (slug) => {
    const s = solo(regrasDe(cenario(slug)), { x: Math.cos(a) * 0.9 * R, y: Math.sin(a) * 0.9 * R, vx: Math.cos(a) * v, vy: Math.sin(a) * v });
    for (let t = 0; t < ticks(0.5); t++) stepMatch(s);
    return s.beys[0].state;
  };
  assert.equal(lance('bb-shop'), 'active');
  assert.equal(lance('piscina-publica'), 'out');
});

test('wind on the rooftop drifts a bey downwind', () => {
  const s = solo(regrasDe(cenario('terraco-blade-sharks')), { x: 0, y: 0, vx: 0, vy: 0 });
  let soma = 0;
  for (let t = 0; t < ticks(6); t++) {
    stepMatch(s);
    soma += s.beys[0].x;
  }
  assert.ok(soma / ticks(6) > 10, `deriva média ${(soma / ticks(6)).toFixed(1)} mm`);
});

test('the cold of the final ice dish drains spin faster', () => {
  const giro = (regras) => {
    const s = solo(regras, { spin: 1 });
    for (let t = 0; t < ticks(10); t++) stepMatch(s);
    return s.beys[0].spin;
  };
  assert.ok(giro(regrasDe(cenario('prato-de-gelo-final'))) < giro(regrasDe(null)));
});
