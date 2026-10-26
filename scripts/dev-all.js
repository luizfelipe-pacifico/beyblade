// `pnpm run dev:all` (ou `npm run dev:all`): sobe tudo do desenvolvimento e abre o jogo no Electron.
// 1. copia a arte e os dados das beys; 2. tenta subir o PostgreSQL no Docker (sem ele o jogo roda,
// só não salva); 3. jogo em 127.0.0.1:5000 e landing em 3000; 4. abre a janela do Electron quando o
// jogo responder. Fechar a janela (ou Ctrl+C) encerra todos os processos.
// Portas fixas (CLAUDE.md): quem estiver escutando na 5000 ou na 3000 é encerrado e a porta é aberta
// de novo por este script, nunca trocada (D-034). Processo do Docker não é derrubado: avisa e segue.
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import net from 'node:net';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const GAME_PORT = 5000;
const SITE_PORT = 3000;
const GAME_URL = `http://127.0.0.1:${GAME_PORT}`;
const children = [];
let encerrando = false;

const log = (tag, msg) => console.log(`[${tag}] ${msg}`);

// Livre só se ninguém atender nem em IPv4 nem em IPv6: um servidor em "::" responde no 127.0.0.1
// e passaria despercebido se a checagem olhasse só um dos dois.
function atende(port, host) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });
}

async function portaLivre(port) {
  const [v4, v6] = await Promise.all([atende(port, '127.0.0.1'), atende(port, '::1')]);
  return !v4 && !v6;
}

// Quem escuta na porta (IPv4 e IPv6): PID e nome do executável.
function donosDaPorta(port) {
  if (process.platform === 'win32') {
    const out = spawnSync('netstat', ['-ano', '-p', 'tcp'], { encoding: 'utf8' }).stdout ?? '';
    const out6 = spawnSync('netstat', ['-ano', '-p', 'tcpv6'], { encoding: 'utf8' }).stdout ?? '';
    const pids = new Set();
    for (const linha of (out + out6).split(/\r?\n/)) {
      const c = linha.trim().split(/\s+/);
      if (c.length >= 5 && /LISTEN/i.test(c[3]) && c[1].endsWith(`:${port}`) && c[4] !== '0') pids.add(c[4]);
    }
    return [...pids].map((pid) => {
      const csv = spawnSync('tasklist', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'], { encoding: 'utf8' }).stdout ?? '';
      return { pid, nome: (csv.match(/^"([^"]+)"/m)?.[1] ?? '?').toLowerCase() };
    });
  }
  const out = spawnSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-Fpc'], { encoding: 'utf8' }).stdout ?? '';
  const donos = [];
  for (const linha of out.split('\n')) {
    if (linha.startsWith('p')) donos.push({ pid: linha.slice(1), nome: '?' });
    else if (linha.startsWith('c') && donos.length) donos.at(-1).nome = linha.slice(1).toLowerCase();
  }
  return donos;
}

// Derrubar o Docker mataria todos os contêineres do usuário; porta de contêiner só é avisada.
const DOCKER = /^(com\.docker|docker|wslrelay|vpnkit)/;

async function liberarPorta(port, tag) {
  if (await portaLivre(port)) return true;
  const donos = donosDaPorta(port);
  const docker = donos.filter((d) => DOCKER.test(d.nome));
  if (docker.length) {
    log(tag, `a porta ${port} é de um contêiner do Docker (${docker.map((d) => d.nome).join(', ')}); pare o contêiner para usar a porta.`);
    return false;
  }
  for (const { pid, nome } of donos) {
    if (Number(pid) === process.pid) continue;
    log(tag, `fechando ${nome} (PID ${pid}) que estava na porta ${port}`);
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', pid, '/T', '/F'], { stdio: 'ignore' });
    else spawnSync('kill', ['-TERM', pid], { stdio: 'ignore' });
  }
  for (let i = 0; i < 20; i++) {
    if (await portaLivre(port)) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  log(tag, `a porta ${port} continua ocupada.`);
  return false;
}

function iniciar(tag, command, args, options = {}) {
  const child = spawn(command, args, { cwd: root, env: process.env, ...options, stdio: ['ignore', 'pipe', 'pipe'] });
  const prefixar = (data) => {
    for (const line of String(data).split(/\r?\n/)) if (line.trim()) log(tag, line);
  };
  child.stdout.on('data', prefixar);
  child.stderr.on('data', prefixar);
  child.on('exit', (code) => {
    log(tag, `encerrado (código ${code ?? 'sinal'})`);
    if (tag === 'electron' || tag === 'jogo') encerrar();
  });
  children.push(child);
  return child;
}

function encerrar() {
  if (encerrando) return;
  encerrando = true;
  for (const child of children) {
    if (child.exitCode !== null || !child.pid) continue;
    // No Windows o Next abre processos filhos; taskkill /T derruba a árvore inteira.
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else child.kill('SIGTERM');
  }
  process.exit(0);
}

async function esperarJogo(timeoutMs = 120_000) {
  const limite = Date.now() + timeoutMs;
  while (Date.now() < limite) {
    try {
      const res = await fetch(GAME_URL);
      if (res.ok && res.headers.get('x-beyblade-app') === 'jogo') return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);

spawnSync(process.execPath, ['scripts/sync-art.js'], { cwd: root, stdio: 'inherit' });

const docker = spawnSync('docker', ['compose', 'up', '-d', '--wait'], { cwd: root, stdio: 'ignore' });
log('banco', docker.status === 0 ? 'PostgreSQL no ar (127.0.0.1:5434)' : 'Docker indisponível: o jogo roda, mas as partidas não serão salvas');

if (!(await liberarPorta(GAME_PORT, 'jogo'))) process.exit(1);
iniciar('jogo', process.execPath, ['server.js']);

if (await liberarPorta(SITE_PORT, 'landing')) {
  const nextBin = path.join(root, 'site', 'node_modules', 'next', 'dist', 'bin', 'next');
  iniciar('landing', process.execPath, [nextBin, 'dev', '-p', String(SITE_PORT)], { cwd: path.join(root, 'site') });
} else {
  log('landing', 'a landing não foi iniciada (o jogo segue normalmente).');
}

log('jogo', `aguardando ${GAME_URL}...`);
if (!(await esperarJogo())) {
  log('jogo', 'o servidor do jogo não respondeu a tempo (ou outro app respondeu na porta 5000).');
  encerrar();
}
// require('electron') devolve o caminho do executável baixado na instalação.
iniciar('electron', require('electron'), ['.'], { env: { ...process.env, GAME_URL } });
log('electron', 'janela do jogo aberta');
