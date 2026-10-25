import http from 'node:http';
import path from 'node:path';
import express from 'express';
import * as store from './src/db.js';
import { parseConfig, parseMatch, parseSetup } from './src/validate.js';

// O projeto roda sempre na porta 5000 (ver CLAUDE.md). Sem fallback para outra porta.
const PORT = 5000;

const app = express();
app.use(express.json({ limit: '64kb' }));
app.use(express.static(path.join(import.meta.dirname, 'public')));

function parseSlot(raw) {
  const slot = Number(raw);
  return slot === 1 || slot === 2 ? slot : null;
}

app.get('/api/config', (req, res) => {
  res.json(store.getConfigs());
});

app.put('/api/config/:slot', (req, res) => {
  const slot = parseSlot(req.params.slot);
  if (!slot) return res.status(400).json({ error: 'Jogador inválido' });
  const { value, error } = parseConfig(req.body);
  if (error) return res.status(400).json({ error });
  store.saveConfig(slot, value);
  res.status(204).end();
});

app.get('/api/setup', (req, res) => {
  res.json(store.getSetting('lastSetup'));
});

app.put('/api/setup', (req, res) => {
  const { value, error } = parseSetup(req.body);
  if (error) return res.status(400).json({ error });
  store.setSetting('lastSetup', value);
  res.status(204).end();
});

app.post('/api/matches', (req, res) => {
  const { value, error } = parseMatch(req.body);
  if (error) return res.status(400).json({ error });
  res.status(201).json({ id: store.insertMatch(value) });
});

app.get('/api/matches', (req, res) => {
  const limit = Math.min(200, Math.max(1, Number.parseInt(req.query.limit, 10) || 30));
  res.json(store.listMatches(limit));
});

app.get('/api/stats', (req, res) => {
  res.json(store.getStats());
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
});

const server = http.createServer(app);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} já está em uso. Feche o processo que está usando a porta e tente de novo.`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`Beyblade Arena rodando em http://localhost:${PORT}`);
  console.log(`Banco de dados: ${store.DB_PATH}`);
});
