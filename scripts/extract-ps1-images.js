// Extrai as imagens comprimidas em ECD (TIM) dos arquivos do PS1 para PNG, FORA do repositório (D-031):
//   node scripts/extract-ps1-images.js [pasta-ps1]   (padrão: ../ps1-bbt2, gerada por extract-ps1.js)
// Saída em <pasta-ps1>/png/<ARQUIVO>/<entrada>.png e <pasta-ps1>/png/index.json.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { containerEntries, ecdDecompress, isEcd, timToRgba } from './lib/ps1-ecd.js';
import { encodePng } from './lib/gba-gfx.js';

const base = resolve(process.argv[2] ?? join(import.meta.dirname, '..', '..', 'ps1-bbt2'));
const dir = join(base, 'files', 'OUTBIN');
const index = [];
let total = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.BIN')).sort()) {
  const buf = readFileSync(join(dir, file));
  for (const { index: i, offset } of containerEntries(buf)) {
    if (!isEcd(buf, offset)) continue;
    let data;
    try {
      data = ecdDecompress(buf, offset);
    } catch {
      continue;
    }
    if (data.length < 8 || data.readUInt32LE(0) !== 0x10) continue;
    let img;
    try {
      img = timToRgba(data);
    } catch {
      continue;
    }
    const name = file.replace(/\.BIN$/, '');
    mkdirSync(join(base, 'png', name), { recursive: true });
    const out = join('png', name, `${String(i).padStart(2, '0')}.png`);
    writeFileSync(join(base, out), encodePng(img.width, img.height, img.rgba));
    index.push({ file, entry: i, png: out.replaceAll('\\', '/'), width: img.width, height: img.height });
    total++;
  }
}
writeFileSync(join(base, 'png', 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
console.log(`${total} imagens em ${join(base, 'png')}`);
