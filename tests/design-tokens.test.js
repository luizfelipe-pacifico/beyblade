import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { colors, feras, textPairs, contrast } from '../src/design/tokens.js';

const css = readFileSync(path.join(import.meta.dirname, '..', 'src', 'design', 'tokens.css'), 'utf8');

function cssVar(name) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  return match?.[1].toLowerCase();
}

test('contrast matches known WCAG values', () => {
  assert.equal(contrast('#000000', '#ffffff').toFixed(1), '21.0');
  assert.equal(contrast('#ffffff', '#ffffff'), 1);
});

test('js tokens mirror the css tokens', () => {
  const pairs = {
    tinta: colors.tinta, 'tinta-2': colors.tinta2, 'tinta-3': colors.tinta3,
    papel: colors.papel, 'texto-2': colors.texto2, 'texto-3': colors.texto3,
    chamada: colors.chamada, p1: colors.p1, p2: colors.p2, destructive: colors.destructive,
  };
  for (const [name, value] of Object.entries(pairs)) assert.equal(cssVar(name), value, `--${name}`);
  for (const [slug, fera] of Object.entries(feras)) assert.equal(cssVar(`fera-${slug}`), fera.campo, `--fera-${slug}`);
});

for (const [label, fg, bg, min] of textPairs) {
  test(`${label} meets ${min}:1 contrast`, () => {
    const ratio = contrast(fg, bg);
    assert.ok(ratio >= min, `${label}: ${ratio.toFixed(2)}:1 (${fg} sobre ${bg})`);
  });
}
