import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FAIXAS, PLAYLISTS, proximaFaixa } from '../src/audio/playlist.js';

// Playlists (D-055): o usuário pediu que a mesma música não se repita sempre.
test('every playlist has more than one track and only known files', () => {
  for (const [nome, p] of Object.entries(PLAYLISTS)) {
    assert.ok(p.faixas.length > 1, `${nome} tem uma faixa só`);
    for (const f of [...p.faixas, p.primeira].filter(Boolean)) assert.ok(FAIXAS[f], `${nome}: ${f}`);
  }
});

test('the next track is never the one that just played', () => {
  for (const nome of Object.keys(PLAYLISTS)) {
    for (const anterior of PLAYLISTS[nome].faixas) {
      for (const r of [0, 0.3, 0.6, 0.99]) assert.notEqual(proximaFaixa(nome, anterior, { random: () => r }), anterior);
    }
  }
});

test('the battle playlist includes the opening and the start screen opens with it', () => {
  assert.ok(PLAYLISTS.batalha.faixas.includes('abertura'));
  assert.equal(proximaFaixa('inicio', null, { inicio: true }), 'abertura');
  assert.equal(proximaFaixa('decisiva', 'batalha', { inicio: true }), 'batalha-decisiva');
  // Ao longo de várias trocas, a batalha passa por todas as faixas dela.
  const tocadas = new Set();
  let anterior = null;
  let r = 0.11;
  for (let i = 0; i < 30; i++) {
    anterior = proximaFaixa('batalha', anterior, { random: () => (r = (r * 7.31) % 1) });
    tocadas.add(anterior);
  }
  assert.equal(tocadas.size, PLAYLISTS.batalha.faixas.length);
});
