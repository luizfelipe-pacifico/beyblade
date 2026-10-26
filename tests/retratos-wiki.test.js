import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RETRATOS_WIKI, removerFundo } from '../scripts/retratos-wiki.js';
import { roster } from '../src/content/roster.js';
import { PS1_PORTRAITS } from '../src/content/ps1.js';

// Imagem de teste: cada letra vira um pixel opaco. W = fundo branco, K = contorno, R = pele/roupa,
// B = azul de fundo estampado, L = branco de roupa.
const CORES = { W: [250, 250, 250], K: [10, 10, 10], R: [220, 120, 90], B: [40, 70, 160], L: [245, 245, 250] };
function img(linhas) {
  const width = linhas[0].length;
  const data = new Uint8Array(width * linhas.length * 4);
  linhas.join('').split('').forEach((c, i) => data.set([...CORES[c], 255], i * 4));
  return { data, width, height: linhas.length };
}
const alfa = ({ data, width }) => {
  const linhas = [];
  for (let i = 0; i < data.length / 4; i += width) linhas.push([...Array(width)].map((_, x) => (data[(i + x) * 4 + 3] ? '#' : '.')).join(''));
  return linhas;
};

test('fundo liso sai e o contorno segura o que está dentro, mesmo branco', () => {
  const i = img(['WWWWW', 'WKKKW', 'WKLKW', 'WKKKW', 'WWWWW']);
  removerFundo(i.data, i.width, i.height);
  assert.deepEqual(alfa(i), ['.....', '.###.', '.###.', '.###.', '.....']);
});

test('com teste de cor, só a cor do fundo sai e a roupa branca fica', () => {
  const i = img(['BBBB', 'BLLB', 'BRRB', 'BBBB']);
  removerFundo(i.data, i.width, i.height, { cor: ([r, g, b]) => b - r >= 25 && b - g >= 25 });
  assert.deepEqual(alfa(i), ['....', '.##.', '.##.', '....']);
});

test('ateY deixa sem semente a parte de baixo das laterais', () => {
  const i = img(['BBB', 'KRK', 'BRB']);
  removerFundo(i.data, i.width, i.height, { cor: ([r, g, b]) => b - r >= 25, ateY: 0.5 });
  assert.deepEqual(alfa(i), ['...', '###', '###']);
});

test('a passada seguinte cresce a partir do que já ficou transparente', () => {
  const i = img(['WWW', 'WLW', 'WKW']);
  removerFundo(i.data, i.width, i.height, { cor: ([r]) => r === 250 });
  removerFundo(i.data, i.width, i.height, { cor: ([r, g, b]) => Math.min(r, g, b) > 185 });
  assert.deepEqual(alfa(i), ['...', '...', '.#.']);
});

test('a wiki cobre todo o elenco que não tem retrato do PS1', () => {
  const faltam = roster.map((p) => p.slug).filter((s) => !PS1_PORTRAITS[s]);
  assert.deepEqual(Object.keys(RETRATOS_WIKI).sort(), faltam.sort());
  for (const cfg of Object.values(RETRATOS_WIKI)) {
    assert.equal(cfg.busto.length, 3);
    assert.ok(cfg.fundo.length >= 1);
  }
});
