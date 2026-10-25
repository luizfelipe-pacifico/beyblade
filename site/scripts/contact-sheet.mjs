// Monta uma folha de contato numerada das imagens de uma pasta.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const [dir, out] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
const W = 360, H = 270, cols = 6;
const rows = Math.ceil(files.length / cols);
const tiles = [];
for (const [i, f] of files.entries()) {
  const img = await sharp(path.join(dir, f)).resize(W, H, { fit: 'cover' }).toBuffer();
  const label = Buffer.from(`<svg width="${W}" height="${H}"><rect width="64" height="36" fill="#000"/><text x="8" y="27" font-size="24" fill="#ff0" font-family="Arial">${f.split('.')[0]}</text></svg>`);
  tiles.push({ input: img, left: (i % cols) * W, top: Math.floor(i / cols) * H }, { input: label, left: (i % cols) * W, top: Math.floor(i / cols) * H });
}
await sharp({ create: { width: cols * W, height: rows * H, channels: 3, background: '#222' } }).composite(tiles).jpeg({ quality: 80 }).toFile(out);
console.log(out);
