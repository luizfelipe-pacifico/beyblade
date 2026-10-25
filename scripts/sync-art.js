// Copia a arte própria (D-008) de pesquisa-bakuten/ para public/art/, onde o Next a serve.
// pesquisa-bakuten/ continua sendo a fonte da verdade; public/art/ é gerado e fica fora do git.
// Só SVG: fotos da wiki (referencia/, *.jpg) são de terceiros e nunca vão para o jogo.
import { cpSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const source = path.join(root, 'pesquisa-bakuten');
const target = path.join(root, 'public', 'art');

rmSync(target, { recursive: true, force: true });

let copied = 0;
function copySvgs(fromDir, toDir) {
  if (!existsSync(fromDir)) return;
  for (const entry of readdirSync(fromDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.svg')) {
      mkdirSync(toDir, { recursive: true });
      cpSync(path.join(fromDir, entry.name), path.join(toDir, entry.name));
      copied++;
    }
  }
}

for (const fera of readdirSync(path.join(source, 'feras-bit'), { withFileTypes: true })) {
  if (fera.isDirectory()) copySvgs(path.join(source, 'feras-bit', fera.name), path.join(target, 'feras', fera.name));
}
for (const p of readdirSync(path.join(source, 'personagens'), { withFileTypes: true })) {
  if (p.isDirectory()) copySvgs(path.join(source, 'personagens', p.name), path.join(target, 'personagens', p.name));
}

console.log(`art: ${copied} SVGs copiados para public/art/`);
