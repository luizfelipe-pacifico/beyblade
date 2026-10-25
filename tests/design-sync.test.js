import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderTokens, tokens } from '../scripts/sync-design-tokens.js';

const root = path.join(import.meta.dirname, '..');
test('game and standalone landing ship the current canonical design tokens', () => {
  for (const file of ['src/design/tokens.css', 'site/app/tokens.css']) {
    assert.equal(readFileSync(path.join(root, file), 'utf8').replaceAll('\r\n', '\n'), renderTokens(), `${file}: execute node scripts/sync-design-tokens.js`);
  }
});

test('both applications load only the two brand font families', () => {
  const expected = [tokens.typography.body.replaceAll(' ', '_'), tokens.typography.display.replaceAll(' ', '_')].sort();
  for (const file of ['app/layout.js', 'site/app/layout.jsx']) {
    const text = readFileSync(path.join(root, file), 'utf8');
    const families = text.match(/import \{([^}]+)\} from 'next\/font\/google'/)?.[1].split(',').map(value => value.trim()).sort();
    assert.deepEqual(families, expected, file);
  }
});
