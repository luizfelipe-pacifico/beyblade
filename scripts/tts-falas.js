// Gera o áudio provisório das falas (pesquisa-bakuten/audio/falas.json) por TTS do Windows.
// Saída em public/audio/tts/ (gerada, fora do git). Só roda no Windows, que é a plataforma do jogo.
// Uso: node scripts/tts-falas.js
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const falas = JSON.parse(readFileSync(path.join(root, 'pesquisa-bakuten', 'audio', 'falas.json'), 'utf8'));
const outRoot = path.join(root, 'public', 'audio', 'tts');

// Voz feminina é a única pt-BR instalada; o tom mais grave aproxima os personagens até haver gravação própria.
const VOZ = 'Microsoft Maria Desktop';
const TOM_PERSONAGEM = '-25%';

const escapeXml = (s) => s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);

function ssml(texto, tom) {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR"><voice name="${VOZ}"><prosody pitch="${tom}" rate="+8%">${escapeXml(texto)}</prosody></voice></speak>`;
}

const jobs = [];
for (const fala of falas.narracao) {
  jobs.push({ ssml: ssml(fala.pt, '+0%'), out: path.join(outRoot, 'narracao', `${fala.id}.wav`) });
}
for (const [slug, p] of Object.entries(falas.personagens)) {
  for (const fala of p.falas) jobs.push({ ssml: ssml(fala.pt, TOM_PERSONAGEM), out: path.join(outRoot, slug, `${fala.id}.wav`) });
}

rmSync(outRoot, { recursive: true, force: true });
for (const job of jobs) mkdirSync(path.dirname(job.out), { recursive: true });

const jobsFile = path.join(tmpdir(), `bb-tts-${process.pid}.json`);
writeFileSync(jobsFile, JSON.stringify(jobs), 'utf8');
const result = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(import.meta.dirname, 'tts.ps1'), jobsFile], { stdio: 'inherit' });
rmSync(jobsFile, { force: true });

if (result.status !== 0) {
  console.error('tts: a síntese falhou. Confira se a voz "Microsoft Maria Desktop" está instalada no Windows.');
  process.exit(1);
}
console.log(`tts: ${jobs.length} falas geradas em public/audio/tts/`);
