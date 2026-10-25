// Ilustração vetorial animada; não é captura de gameplay. Reproduzível dentro de site/.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const output = path.join(import.meta.dirname, '../public/beyblades');
const tokens = fs.readFileSync(path.join(import.meta.dirname, '../app/tokens.css'), 'utf8');
const color = (name) => {
  const match = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i'));
  if (!match) throw new Error(`Token não encontrado: ${name}`);
  return match[1];
};
const uri = (name) => `data:image/svg+xml;base64,${fs.readFileSync(path.join(output, name)).toString('base64')}`;
const dragoon = uri('dragoon-s.svg');
const dranzer = uri('dranzer-s.svg');
const width = 768;
const height = 432;
const count = 48;
const frames = [];
for (let index = 0; index < count; index++) {
  const progress = index / count;
  const phase = progress * Math.PI * 2;
  const x = 100 * Math.cos(phase);
  const y = 66 * Math.sin(phase);
  const image = (source, cx, cy, rotation) => `<g transform="translate(${cx} ${cy}) rotate(${rotation})"><image href="${source}" x="-88" y="-88" width="176" height="176"/></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="768" height="432" fill="${color('tinta')}"/>
    <ellipse cx="384" cy="216" rx="310" ry="185" fill="${color('tinta-2')}"/>
    <ellipse cx="384" cy="216" rx="264" ry="153" fill="none" stroke="${color('tinta-3')}" stroke-width="6"/>
    <ellipse cx="384" cy="216" rx="160" ry="92" fill="none" stroke="${color('tinta-3')}" stroke-width="3"/>
    ${image(dragoon, 330 + x, 216 + y, -progress * 1800)}
    ${image(dranzer, 438 - x, 216 - y, progress * 2520)}
  </svg>`;
  frames.push(await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer());
  if (index === 0) await sharp(Buffer.from(svg)).webp({ quality: 94 }).toFile(path.join(output, 'battle-poster.webp'));
}
await sharp(Buffer.concat(frames), { raw: { width, height: height * count, channels: 4, pageHeight: height } })
  .webp({ quality: 90, effort: 5, loop: 0, delay: Array(count).fill(42), smartSubsample: true })
  .toFile(path.join(output, 'battle-loop.webp'));
const metadata = await sharp(path.join(output, 'battle-loop.webp'), { animated: true }).metadata();
console.log(`WebP animado: ${metadata.width}×${metadata.pageHeight}, ${metadata.pages} frames, ${(fs.statSync(path.join(output, 'battle-loop.webp')).size / 1024).toFixed(0)} KB`);
