import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { roster } from '../src/content/roster.js';

const dir = path.join(import.meta.dirname, '..', 'pesquisa-bakuten', 'audio');
const falas = JSON.parse(readFileSync(path.join(dir, 'falas.json'), 'utf8'));
const trilhas = JSON.parse(readFileSync(path.join(dir, 'trilhas.json'), 'utf8'));
const CONTEXTOS = new Set(['selecao', 'especial', 'provocacao', 'lancamento', 'vitoria', 'derrota']);

test('every roster character has voice lines', () => {
  for (const { slug } of roster) assert.ok(falas.personagens[slug]?.falas.length > 0, slug);
});

test('every voice line is well formed and honest about its origin', () => {
  const todas = [...falas.narracao, ...Object.values(falas.personagens).flatMap((p) => p.falas)];
  for (const f of todas) {
    assert.match(f.id, /^[a-z0-9-]+$/, f.id);
    assert.ok(CONTEXTOS.has(f.contexto), `${f.id}: contexto ${f.contexto}`);
    assert.ok(f.pt?.trim(), `${f.id}: texto pt vazio`);
    if (f.origem === 'jogo') assert.equal(f.original, null, `${f.id}: fala do jogo não pode ter citação do anime`);
    else assert.equal(f.origem, 'anime', `${f.id}: origem ${f.origem}`);
  }
});

test('line ids are unique per character', () => {
  for (const [slug, p] of Object.entries(falas.personagens)) {
    const ids = p.falas.map((f) => f.id);
    assert.equal(new Set(ids).size, ids.length, slug);
  }
});

test('game music slots never point at anime recordings', () => {
  for (const slot of trilhas.jogo) {
    assert.ok(!('anime' in slot), slot.id);
    assert.ok(['pendente', 'rom', 'original'].includes(slot.status), slot.id);
  }
});
