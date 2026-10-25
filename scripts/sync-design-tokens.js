import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(import.meta.dirname, '..');
export const tokens = JSON.parse(readFileSync(path.join(root, 'design-system/tokens.json'), 'utf8'));

export function renderTokens(source = tokens) {
  const vars = Object.entries(source.colors).map(([key, value]) => [key, value]);
  for (const [key, beast] of Object.entries(source.beasts)) {
    vars.push([`fera-${key}`, beast.field], [`fera-${key}-texto`, beast.text]);
  }
  vars.push(...Object.entries(source.space).map(([key, value]) => [`space-${key}`, value]));
  vars.push(...Object.entries(source.layout));
  vars.push(['type-small', source.typography.small], ['type-body', source.typography.bodySize],
    ['type-lead', source.typography.lead], ['type-heading', source.typography.heading], ['type-display', source.typography.displaySize],
    ['ease-out', source.motion.easeOut], ['ease-in-out', source.motion.easeInOut],
    ...['press', 'ui', 'corte'].map((key) => [`dur-${key}`, `${source.motion[key]}ms`]));
  return `/* Gerado por scripts/sync-design-tokens.js. Edite design-system/tokens.json. */\n:root {\n${vars.map(([key, value]) => `  --${key}: ${value};`).join('\n')}\n}\n`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  for (const relative of ['src/design/tokens.css', 'site/app/tokens.css']) {
    const file = path.join(root, relative);
    if (process.argv.includes('--check')) {
      if (readFileSync(file, 'utf8').replaceAll('\r\n', '\n') !== renderTokens()) throw new Error(`Tokens desatualizados: ${relative}`);
    } else {
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, renderTokens());
    }
  }
  console.log(process.argv.includes('--check') ? 'Tokens sincronizados.' : 'Tokens gerados para o jogo e a landing.');
}
