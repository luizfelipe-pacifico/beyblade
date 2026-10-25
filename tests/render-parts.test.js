import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lobedOutline, polygonOutline, renderBeyAssembled, renderBeyExploded, renderLauncher, renderPartSide, renderPartTop, renderRipcord, shade,
} from '../scripts/lib/render-parts.js';

const ring = {
  categoria: 'attack-ring', nome: 'Test <Ring>', medidas: { diametro_mm: { valor: 46 }, peso_g: { valor: 5 } },
  forma: { simetria: 4, raio_base_mm: 18, raio_interno_mm: 9, lobos: [{ inicio: 5, pico: 40, fim: 80, raio_mm: 23, borda: 'reta' }] },
};
const radii = (pts) => pts.map(([x, y]) => Math.hypot(x, y));

test('lobed outline stays between the base and the lobe radius', () => {
  const r = radii(lobedOutline(ring.forma));
  assert.ok(Math.min(...r) >= 18 - 1e-9);
  assert.ok(Math.max(...r) <= 23 + 1e-9);
  assert.ok(Math.max(...r) > 22.9);
});

test('left spin mirrors the outline', () => {
  const right = lobedOutline(ring.forma);
  const left = lobedOutline(ring.forma, true);
  assert.notDeepEqual(radii(right), radii(left));
  // A mirror keeps the same radii, only in another order.
  const sortedRight = radii(right).sort((a, b) => a - b);
  const sortedLeft = radii(left).sort((a, b) => a - b);
  sortedRight.forEach((r, i) => assert.ok(Math.abs(r - sortedLeft[i]) < 0.05));
});

test('polygon outline has one point per side and a circle fallback', () => {
  assert.equal(polygonOutline(10, 20).length, 10);
  assert.equal(polygonOutline(0, 20).length, 120);
});

test('shade darkens and lightens hex colours', () => {
  assert.equal(shade('#808080', -0.5), '#404040');
  assert.equal(shade('#000000', 1), '#ffffff');
  assert.equal(shade('bad', 0.2), 'bad');
});

test('part renders are standalone svg with escaped names and measurements', () => {
  for (const svg of [renderPartTop(ring), renderPartSide(ring)]) {
    assert.match(svg, /^<svg xmlns='http:\/\/www\.w3\.org\/2000\/svg' viewBox='/);
    assert.match(svg, /Test &lt;Ring&gt;/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  }
  assert.match(renderPartTop(ring), /Ø 46 mm/);
});

test('assembled, exploded and launcher renders handle sparse data', () => {
  const bey = { nome: 'Bey', rotacao: 'esquerda', medidas: { peso_g: 30 }, atributos: { ataque: 5 } };
  const parts = [ring, { categoria: 'blade-base', nome: 'Base', forma: { ponta: { tipo: 'sharp' } } }, { categoria: 'spin-gear', nome: 'SG' }];
  for (const svg of [renderBeyAssembled(bey, parts), renderBeyExploded(bey, parts), renderLauncher({ nome: 'L', forma: {} })]) {
    assert.match(svg, /<\/svg>\n$/);
    assert.doesNotMatch(svg, /NaN|undefined/);
  }
});

test('ripcord render draws every tooth, folding long cords into rows', () => {
  const svg = renderRipcord({ nome: 'Ripcord', medidas: { comprimento_mm: { valor: 330 }, numero_dentes: { valor: 100 } }, forma: {} });
  assert.equal((svg.match(/opacity='0.8'/g) ?? []).length, 100);
  assert.match(svg, /330 mm \(dobrado\)/);
  assert.doesNotMatch(renderRipcord({ nome: 'Vazio' }), /NaN|undefined/);
});
