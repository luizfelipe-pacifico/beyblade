import test from 'node:test';
import assert from 'node:assert/strict';
import { ATTRIBUTES, assembledMeasures, computeAttributes, inertia, officialStars, starsTo10 } from '../src/beyblade/stats.js';

const part = (categoria, extra = {}) => ({ categoria, medidas: {}, ...extra });
const weighted = (categoria, g, extra = {}) =>
  part(categoria, { ...extra, medidas: { peso_g: { valor: g }, ...(extra.medidas ?? {}) } });

function bey({ tip = 'semi-flat', friction = 0.3, contact = 'smash', recoil = 0.5, wdWeight = 13, spread = 'equilibrado' } = {}) {
  return [
    weighted('bit-chip', 0.6),
    weighted('attack-ring', 5, { fisica: { tipo_contato: contact, recoil }, forma: { simetria: 3 }, medidas: { diametro_mm: { valor: 44 }, altura_mm: { valor: 7 } } }),
    weighted('weight-disk', wdWeight, { fisica: { distribuicao: spread }, medidas: { altura_mm: { valor: 2.5 } } }),
    weighted('spin-gear', 3),
    weighted('blade-base', 7, { fisica: { tipo_ponta: tip, atrito: friction }, medidas: { altura_mm: { valor: 14 } } }),
  ];
}

test('sums part weights and stacks only visible layers for height', () => {
  const m = assembledMeasures(bey());
  assert.equal(m.peso_g, 28.6);
  assert.equal(m.diametro_mm, 44);
  assert.equal(m.altura_mm, 23.5);
});

test('accepts plain numbers or {valor} for measures', () => {
  assert.equal(assembledMeasures([{ categoria: 'weight-disk', medidas: { peso_g: 16.4 } }]).peso_g, 16.4);
});

test('falls back to typical weights when a part has none', () => {
  assert.equal(assembledMeasures([part('weight-disk')]).peso_g, 14);
});

test('keeps every attribute inside 1..10', () => {
  const extremes = [bey({ friction: 1, wdWeight: 60, recoil: 0 }), bey({ friction: 0, wdWeight: 0, recoil: 1 }), []];
  for (const parts of extremes) {
    const { atributos } = computeAttributes(parts);
    for (const k of ATTRIBUTES) assert.ok(atributos[k] >= 1 && atributos[k] <= 10, `${k}=${atributos[k]}`);
  }
});

test('grip tips are faster than sharp tips', () => {
  const grip = computeAttributes(bey({ tip: 'grip', friction: 0.85 })).atributos;
  const sharp = computeAttributes(bey({ tip: 'sharp', friction: 0.1 })).atributos;
  assert.ok(grip.velocidade > sharp.velocidade);
  assert.ok(sharp.stamina > grip.stamina);
});

test('heavier weight disks raise weight, defense and knockout resistance', () => {
  const light = computeAttributes(bey({ wdWeight: 8 })).atributos;
  const heavy = computeAttributes(bey({ wdWeight: 18 })).atributos;
  assert.ok(heavy.peso > light.peso);
  assert.ok(heavy.defesa > light.defesa);
  assert.ok(heavy.resistencia_knockout > light.resistencia_knockout);
});

test('smash rings attack harder than survival rings', () => {
  const smash = computeAttributes(bey({ contact: 'smash' })).atributos;
  const survival = computeAttributes(bey({ contact: 'survival' })).atributos;
  // Survival rings get their stamina from the Takara stars, not from the contact shape.
  assert.ok(smash.ataque > survival.ataque);
});

test('official ratings shift the baseline', () => {
  const plain = bey();
  const rated = plain.map((p) => (p.categoria === 'attack-ring' ? { ...p, stats_oficiais: { ataque: 3, defesa: 1, stamina: 1 } } : p));
  assert.ok(computeAttributes(rated).atributos.ataque > computeAttributes(plain).atributos.ataque);
  // The unrated WD and base count as neutral (2 stars each).
  assert.deepEqual(officialStars(rated), { ataque: 7, defesa: 5, stamina: 5, partes: 1 });
  assert.equal(officialStars(plain), null);
});

test('only AR, WD and the floor part count towards official stars, like the Takara box', () => {
  const stars = { ataque: 4, defesa: 4, stamina: 4 };
  // Plain Spin Gears have no stars in the catalog; bit chips may, but never count.
  const parts = bey().map((p) => (p.categoria === 'spin-gear' ? p : { ...p, stats_oficiais: stars }));
  assert.equal(officialStars(parts).partes, 3);
  // HMS: no blade base, the running core is the floor part.
  const hms = [
    { categoria: 'attack-ring', stats_oficiais: stars },
    { categoria: 'weight-disk', stats_oficiais: stars },
    { categoria: 'spin-gear', forma: { tipo: 'running-core' }, stats_oficiais: stars },
  ];
  assert.equal(officialStars(hms).partes, 3);
});

test('anime adjustment is applied on top of the toy attributes and clamped', () => {
  const result = computeAttributes(bey(), { anime: { ataque: 20 } });
  assert.equal(result.atributos.ataque, 10);
  assert.ok(result.atributos_brinquedo.ataque < 10);
});

test('missing star values count as neutral instead of zero', () => {
  const parts = [{ categoria: 'attack-ring', stats_oficiais: { defesa: 1 } }];
  assert.deepEqual(officialStars(parts), { ataque: 2, defesa: 1, stamina: 2, partes: 1 });
});

test('bearings and free shafts add stamina', () => {
  const withGimmick = (gimmick) => bey().map((p) => (p.categoria === 'spin-gear' ? { ...p, fisica: { gimmick } } : p));
  assert.ok(computeAttributes(withGimmick('bearing')).atributos.stamina > computeAttributes(withGimmick('nenhum')).atributos.stamina);
});

test('star totals map to 1..10 the way the Takara sums spread (2 → 1, 12 → 10)', () => {
  assert.equal(starsTo10(2), 1);
  assert.equal(starsTo10(12), 10);
  assert.equal(starsTo10(7), 5.5);
  assert.equal(starsTo10(40), 10);
});

test('weight at the rim gives more inertia than the same weight at the centre', () => {
  const disk = (ri, d) => [{ categoria: 'weight-disk', medidas: { peso_g: 15, diametro_mm: d }, forma: { raio_interno_mm: ri } }];
  assert.ok(inertia(disk(15, 42)) > inertia(disk(4, 42)));
  assert.ok(inertia(disk(6, 44)) > inertia(disk(6, 36)));
});

test('dranzer v2 stars sum to the known 6/5/7 total', () => {
  const parts = [
    { categoria: 'attack-ring', stats_oficiais: { ataque: 2, defesa: 2, stamina: 1 } },
    { categoria: 'weight-disk', stats_oficiais: { ataque: 1, defesa: 2, stamina: 3 } },
    { categoria: 'support-part', stats_oficiais: { ataque: 2, defesa: 0, stamina: 2 } },
    { categoria: 'blade-base', stats_oficiais: { ataque: 3, defesa: 1, stamina: 3 } },
  ];
  assert.deepEqual(officialStars(parts), { ataque: 6, defesa: 5, stamina: 7, partes: 3 });
});

test('engine gear stars join the sum, like dranzer gt = 10/5/7', () => {
  const parts = [
    { categoria: 'attack-ring', stats_oficiais: { ataque: 3, defesa: 2, stamina: 1 } },
    { categoria: 'weight-disk', stats_oficiais: { ataque: 2, defesa: 2, stamina: 2 } },
    { categoria: 'spin-gear', fisica: { gimmick: 'engine-gear' }, stats_oficiais: { ataque: 3, defesa: 0, stamina: 2 } },
    { categoria: 'blade-base', stats_oficiais: { ataque: 2, defesa: 1, stamina: 2 } },
    { categoria: 'spin-gear', fisica: { gimmick: 'nenhum' }, stats_oficiais: null },
  ];
  assert.deepEqual(officialStars(parts), { ataque: 10, defesa: 5, stamina: 7, partes: 4 });
});

test('special gears with stars count, support parts and bit chips never do', () => {
  const stars = { ataque: 1, defesa: 1, stamina: 1 };
  const parts = [
    { categoria: 'attack-ring', stats_oficiais: stars },
    { categoria: 'weight-disk', stats_oficiais: stars },
    { categoria: 'blade-base', stats_oficiais: stars },
    { categoria: 'spin-gear', fisica: { gimmick: 'free-shaft' }, stats_oficiais: { ataque: 2, defesa: 1.5, stamina: 3.5 } },
    { categoria: 'support-part', stats_oficiais: stars },
    { categoria: 'bit-chip', stats_oficiais: stars },
  ];
  assert.deepEqual(officialStars(parts), { ataque: 5, defesa: 4.5, stamina: 6.5, partes: 4 });
});
