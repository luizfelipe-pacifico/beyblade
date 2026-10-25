// Renders every sound of a recipe file: node scripts/synth.js <sons.json> <output-dir>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { renderWav } from './lib/synth.js';

const [recipePath, outDir] = process.argv.slice(2);
if (!recipePath || !outDir) {
  console.error('uso: node scripts/synth.js <sons.json> <pasta-saida>');
  process.exit(1);
}

const { sounds } = JSON.parse(readFileSync(recipePath, 'utf8'));
mkdirSync(outDir, { recursive: true });
for (const [name, recipe] of Object.entries(sounds)) {
  writeFileSync(join(outDir, `${name}.wav`), renderWav(recipe));
  console.log(`${name}.wav (${recipe.duration}s)`);
}
