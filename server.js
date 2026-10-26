import http from 'node:http';
import express from 'express';
import next from 'next';
import * as store from './src/db.js';
import { parseConfig, parseMatch, parseSetup } from './src/validate.js';

// O projeto roda sempre na porta 5000 (ver CLAUDE.md). Sem fallback para outra porta.
const PORT = 5000;
const HOST = '127.0.0.1';

// A interface do jogo é o app Next.js (app/). O Express responde /api e repassa o resto ao Next,
// para tudo ficar numa porta só até a API migrar para route handlers (D-013).
const nextApp = next({ dev: process.env.NODE_ENV !== 'production', hostname: HOST, port: PORT });
const handleNext = nextApp.getRequestHandler();

const app = express();
app.disable('x-powered-by');
// Identidade do servidor: o dev:all só abre a janela do Electron quando quem responde na 5000 é o jogo,
// não outro app que tenha ficado na mesma porta (aconteceu com o preview da landing).
app.use((req, res, done) => {
  res.setHeader('X-Beyblade-App', 'jogo');
  done();
});
app.use('/api', express.json({ limit: '64kb' }));

function parseSlot(raw) {
  const slot = Number(raw);
  return slot === 1 || slot === 2 ? slot : null;
}

app.get('/api/config', async (req, res) => {
  res.json(await store.getConfigs());
});

app.put('/api/config/:slot', async (req, res) => {
  const slot = parseSlot(req.params.slot);
  if (!slot) return res.status(400).json({ error: 'Jogador inválido' });
  const { value, error } = parseConfig(req.body);
  if (error) return res.status(400).json({ error });
  await store.saveConfig(slot, value);
  res.status(204).end();
});

app.get('/api/setup', async (req, res) => {
  res.json(await store.getSetting('lastSetup'));
});

app.put('/api/setup', async (req, res) => {
  const { value, error } = parseSetup(req.body);
  if (error) return res.status(400).json({ error });
  await store.setSetting('lastSetup', value);
  res.status(204).end();
});

app.post('/api/matches', async (req, res) => {
  const { value, error } = parseMatch(req.body);
  if (error) return res.status(400).json({ error });
  res.status(201).json({ id: await store.insertMatch(value) });
});

app.get('/api/matches', async (req, res) => {
  const limit = Math.min(200, Math.max(1, Number.parseInt(req.query.limit, 10) || 30));
  res.json(await store.listMatches(limit));
});

app.get('/api/stats', async (req, res) => {
  res.json(await store.getStats());
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((req, res) => handleNext(req, res));

// Banco fora do ar (container parado) vira 503 com instrução, não um 500 genérico.
function isDbUnavailable(err) {
  for (let e = err; e; e = e.cause) {
    if (e.code === 'ECONNREFUSED' || e.code === 'P1001' || e.kind === 'DatabaseNotReachable') return true;
  }
  return false;
}

app.use((err, req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  if (isDbUnavailable(err)) {
    console.error('Banco de dados indisponível. Rode `npm run db:up`.');
    return res.status(503).json({ error: 'Banco de dados indisponível' });
  }
  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
});

await nextApp.prepare();

const server = http.createServer(app);
// Recarga ao vivo do Next em desenvolvimento usa WebSocket pela mesma porta.
const handleUpgrade = nextApp.getUpgradeHandler();
server.on('upgrade', (req, socket, head) => handleUpgrade(req, socket, head));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} já está em uso. Feche o processo que está usando a porta e tente de novo.`);
    process.exit(1);
  }
  throw err;
});

// Só na interface local: o jogo não fica acessível por outros dispositivos da rede.
server.listen(PORT, HOST, () => {
  console.log(`Beyblade Arena rodando em http://localhost:${PORT}`);
  console.log(`Banco de dados: ${store.DB_LABEL}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close();
    store.prisma.$disconnect().finally(() => process.exit(0));
  });
}
