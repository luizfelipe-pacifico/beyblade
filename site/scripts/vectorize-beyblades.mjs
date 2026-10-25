// Trace real product photographs into paths. No embedded raster images in the SVGs.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import vtracer from '@visioncortex/vtracer';

const root = path.join(import.meta.dirname, '..');
const sources = JSON.parse(fs.readFileSync(path.join(root, 'assets/beyblades/sources.json'), 'utf8'));
const output = path.join(root, 'public/beyblades');
const inner = (svg) => svg.match(/<svg\b[^>]*>([\s\S]*)<\/svg>/)[1];
const options = {
  preset: 'photo', mode: 'spline', colorPrecision: 8,
  layerDifference: 1, filterSpeckle: 0, lengthThreshold: 0.5,
  simplify: 0.05, pathPrecision: 3,
};

for (const source of sources) {
  const original = fs.readFileSync(path.join(root, 'assets/beyblades', source.file));
  const hash = crypto.createHash('sha256').update(original).digest('hex');
  if (hash !== source.sha256) throw new Error(`Source checksum mismatch: ${source.id}`);
  const raw = await sharp(original).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = raw.info.width, top = raw.info.height, right = 0, bottom = 0;
  for (let y = 0; y < raw.info.height; y++) {
    for (let x = 0; x < raw.info.width; x++) {
      if (raw.data[(y * raw.info.width + x) * 4 + 3] < 64) continue;
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  left = Math.max(0, left - 4); top = Math.max(0, top - 4);
  right = Math.min(raw.info.width - 1, right + 4); bottom = Math.min(raw.info.height - 1, bottom + 4);
  const { data, info } = await sharp(original).extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // A grayscale vector mask preserves partial transparency and avoids a dark cutout halo.
  const alpha = Buffer.from(data);
  for (let i = 0; i < alpha.length; i += 4) {
    alpha[i] = alpha[i + 1] = alpha[i + 2] = data[i + 3];
    alpha[i + 3] = 255;
  }
  const mask = vtracer.convertPixels(alpha, info.width, info.height, {
    mode: 'spline', colorPrecision: 8, layerDifference: 2,
    filterSpeckle: 0, lengthThreshold: 1, pathPrecision: 2,
  });
  const color = vtracer.convertPixels(data, info.width, info.height, options);
  const side = Math.max(info.width, info.height) * 1.04;
  const x = (info.width - side) / 2;
  const y = (info.height - side) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="${x} ${y} ${side} ${side}">
<title>${source.name} — vetor de fotografia do modelo físico</title>
<desc>Traçado em curvas a partir de ${source.page}. A fotografia original conserva seus direitos; não é arte extraída de ROM.</desc>
<defs><mask id="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="${info.width}" height="${info.height}">${inner(mask)}</mask></defs>
<g mask="url(#alpha)">${inner(color)}</g></svg>\n`;
  if (/<image\b|data:image|<foreignObject\b/i.test(svg)) throw new Error('Raster content in vector output');
  fs.writeFileSync(path.join(output, `${source.id}.svg`), svg);
  // Responsive delivery derivatives; the editable, genuinely vector original remains available.
  const rendered = await sharp(Buffer.from(svg)).resize(1440, 1440).png().toBuffer();
  for (const width of [480, 960, 1440]) {
    await sharp(rendered).resize(width, width).webp({ quality: 94, effort: 6, smartSubsample: true })
      .toFile(path.join(output, `${source.id}-${width}.webp`));
  }
  console.log(`${source.id}: ${info.width}x${info.height} source crop, ${(svg.length / 1024).toFixed(0)} KiB vector, 3 WebP derivatives`);
}
