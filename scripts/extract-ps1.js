// Converte a imagem BIN/CUE do PS1 e extrai os arquivos, FORA do repositório (D-027):
//   node scripts/extract-ps1.js "<jogo>.bin" [pasta-saida]
// Saída padrão: ../ps1-bbt2/ (ao lado do repositório): disc.iso, files/ (Form 1 normal; Form 2 em .raw com
// setores de 2352 bytes) e manifest.json (caminho, LBA, tamanho, forma, SHA-1). Não toca no jogo.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { bootExecutable, listFiles, readFile, sectorCount, toIso } from './lib/iso9660.js';

const [binPath, outArg] = process.argv.slice(2);
if (!binPath) {
  console.error('uso: node scripts/extract-ps1.js "<jogo>.bin" [pasta-saida]');
  process.exit(1);
}
const outDir = resolve(outArg ?? join(import.meta.dirname, '..', '..', 'ps1-bbt2'));
const repo = resolve(import.meta.dirname, '..');
if (outDir.startsWith(repo)) {
  console.error(`A saída precisa ficar fora do repositório (D-007/D-027): ${outDir}`);
  process.exit(1);
}

const sha1 = (b) => createHash('sha1').update(b).digest('hex');
const bin = readFileSync(binPath);
const { volumeId, files } = listFiles(bin);
mkdirSync(join(outDir, 'files'), { recursive: true });
writeFileSync(join(outDir, 'disc.iso'), toIso(bin));

const manifest = [];
for (const file of files) {
  const { raw, data } = readFile(bin, file);
  const target = join(outDir, 'files', raw ? `${file.path}.raw` : file.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, data);
  manifest.push({ path: file.path, lba: file.lba, size: file.size, form: raw ? 2 : 1, sha1: sha1(data) });
}

const cnf = files.find((f) => f.path.toUpperCase() === 'SYSTEM.CNF');
const boot = cnf ? bootExecutable(readFile(bin, cnf).data.toString('latin1')) : null;
writeFileSync(
  join(outDir, 'manifest.json'),
  `${JSON.stringify({ source: binPath, binSha1: sha1(bin), sectors: sectorCount(bin), volumeId, boot, files: manifest }, null, 2)}\n`,
);
console.log(`${outDir}: volume "${volumeId}", ${manifest.length} arquivos (${manifest.filter((f) => f.form === 2).length} em Form 2), boot ${boot}`);
