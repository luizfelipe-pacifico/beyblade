import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const sources = JSON.parse(fs.readFileSync(new URL('../site/assets/beyblades/sources.json', import.meta.url)));
const models = ['dragoon-s', 'dranzer-s', 'driger-s', 'draciel-s'];

test('all four real bey references are local, attributed and checksum-pinned', () => {
  assert.deepEqual(sources.map((source) => source.id), models);
  for (const source of sources) {
    const photo = fs.readFileSync(new URL(`../site/assets/beyblades/${source.file}`, import.meta.url));
    assert.equal(crypto.createHash('sha256').update(photo).digest('hex'), source.sha256);
    assert.match(source.credit, /^https:\/\/beyblade\.fandom\.com\/wiki\/File:/);
  }
});

test('beyblade SVG masters contain vector paths, never embedded raster images', () => {
  for (const model of models) {
    const svg = fs.readFileSync(new URL(`../site/public/beyblades/${model}.svg`, import.meta.url), 'utf8');
    assert.match(svg, /<svg\b[^>]*viewBox=/);
    assert.match(svg, /<path\b/);
    assert.doesNotMatch(svg, /<image\b|data:image|<foreignObject\b|image-rendering:\s*pixelated/i);
  }
});

test('every beyblade has local WebP delivery assets for all responsive sizes', () => {
  for (const model of models) {
    for (const width of [480, 960, 1440]) {
      const file = fs.readFileSync(new URL(`../site/public/beyblades/${model}-${width}.webp`, import.meta.url));
      assert.equal(file.toString('ascii', 0, 4), 'RIFF');
      assert.equal(file.toString('ascii', 8, 12), 'WEBP');
    }
  }
});
