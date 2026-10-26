// Extrai o NitroFS de uma ROM de Nintendo DS, FORA do repositório (mesma regra do GBA/PS1, D-007/D-031):
//   node scripts/extract-nds.js "<jogo>.nds" [pasta-saida]
// Saída padrão: ../nds-metal-fusion/ (ao lado do repositório): arm9.bin, arm7.bin, files/ (arquivos com
// nome + overlay/) e manifest.json (cabeçalho, caminho, id, offset, tamanho, SHA-1, NARC/LZ). Não toca no jogo.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve, sep } from 'node:path';
import { fileData, isNarc, listFiles, lzSize, readNarc } from './lib/nitrofs.js';

const [romPath, outArg] = process.argv.slice(2);
if (!romPath) {
  console.error('uso: node scripts/extract-nds.js "<jogo>.nds" [pasta-saida]');
  process.exit(1);
}
const outDir = resolve(outArg ?? join(import.meta.dirname, '..', '..', 'nds-metal-fusion'));
const repo = resolve(import.meta.dirname, '..');
if (outDir === repo || outDir.startsWith(repo + sep)) {
  console.error(`A saída precisa ficar fora do repositório (D-007/D-031): ${outDir}`);
  process.exit(1);
}

const sha1 = (b) => createHash('sha1').update(b).digest('hex');
const rom = readFileSync(romPath);
const { header, dirs, files } = listFiles(rom);
mkdirSync(join(outDir, 'files'), { recursive: true });
writeFileSync(join(outDir, 'arm9.bin'), rom.subarray(header.arm9.offset, header.arm9.offset + header.arm9.size));
writeFileSync(join(outDir, 'arm7.bin'), rom.subarray(header.arm7.offset, header.arm7.offset + header.arm7.size));

const manifest = [];
for (const file of files) {
  const data = fileData(rom, file);
  const target = join(outDir, 'files', file.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, data);
  const entry = { id: file.id, path: file.path, offset: file.start, size: data.length, sha1: sha1(data) };
  if (file.overlay) entry.overlay = file.overlay;
  if (lzSize(data)) entry.lz = { type: data[0], size: lzSize(data) }; // provável LZ10/LZ11 (pode ser falso positivo)
  if (isNarc(data)) {
    try {
      entry.narc = readNarc(data).length;
    } catch {
      entry.narc = 'inválido';
    }
  }
  manifest.push(entry);
}

writeFileSync(
  join(outDir, 'manifest.json'),
  `${JSON.stringify({ source: romPath, romSha1: sha1(rom), romSize: rom.length, header, dirs, files: manifest }, null, 2)}\n`,
);
console.log(`${outDir}: "${header.title}" (${header.gameCode}), ${manifest.length} arquivos em ${dirs.length} pastas, ${manifest.filter((f) => f.narc).length} NARC`);
