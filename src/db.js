import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.ts';

// Sem arquivo .env, usa as variáveis já definidas no ambiente.
try {
  process.loadEnvFile();
} catch {}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não definida. Copie .env.example para .env e rode `npm run db:up`.');
}

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Endereço do banco para log, sem usuário e senha.
export const DB_LABEL = (() => {
  const url = new URL(process.env.DATABASE_URL);
  return `${url.hostname}:${url.port}${url.pathname}`;
})();

export async function getConfigs() {
  const out = { 1: null, 2: null };
  for (const row of await prisma.controllerConfig.findMany()) out[row.slot] = row.config;
  return out;
}

export async function saveConfig(slot, config) {
  await prisma.controllerConfig.upsert({
    where: { slot },
    create: { slot, config },
    update: { config },
  });
}

export async function getSetting(key) {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key, value) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

// Partida e rodadas entram juntas: o create aninhado do Prisma roda numa transação só.
export async function insertMatch(m) {
  const match = await prisma.match.create({
    data: {
      p1Name: m.p1.name,
      p1Bey: m.p1.bey,
      p1Score: m.p1.score,
      p2Name: m.p2.name,
      p2Bey: m.p2.bey,
      p2Score: m.p2.score,
      winner: m.winner,
      targetPoints: m.targetPoints,
      durationMs: m.durationMs,
      rounds: { create: m.rounds.map((r, i) => ({ number: i + 1, ...r })) },
    },
    select: { id: true },
  });
  return match.id;
}

export async function listMatches(limit) {
  return prisma.match.findMany({
    orderBy: { id: 'desc' },
    take: limit,
    include: {
      rounds: { orderBy: { number: 'asc' }, select: { winner: true, finish: true, points: true } },
    },
  });
}

// Soma os grupos de P1 e P2 numa linha por chave. `keyOf` decide o que conta como "o mesmo"
// (nomes de jogador ignoram maiúsculas; a primeira grafia encontrada é a exibida).
function mergeSides(groups, keyOf) {
  const rows = new Map();
  for (const { key, label, matches, wins, points } of groups) {
    const id = keyOf(key);
    const row = rows.get(id) ?? { label, matches: 0, wins: 0, points: 0 };
    row.matches += matches;
    row.wins += wins;
    row.points += points;
    rows.set(id, row);
  }
  return [...rows.values()];
}

// Agrega uma coluna de um lado (P1 ou P2): partidas e pontos por valor, vitórias por valor.
async function sideGroups(field, scoreField, winner) {
  const [all, won] = await Promise.all([
    prisma.match.groupBy({ by: [field], _count: { _all: true }, _sum: { [scoreField]: true } }),
    prisma.match.groupBy({ by: [field], where: { winner }, _count: { _all: true } }),
  ]);
  const winsBy = new Map(won.map((g) => [g[field], g._count._all]));
  return all.map((g) => ({
    key: g[field],
    label: g[field],
    matches: g._count._all,
    wins: winsBy.get(g[field]) ?? 0,
    points: g._sum[scoreField] ?? 0,
  }));
}

// Só API do Prisma, sem SQL específico: precisa rodar igual no PostgreSQL (dev) e no SQLite (.exe, D-014).
export async function getStats() {
  const [totals, finishes, p1Names, p2Names, p1Beys, p2Beys] = await Promise.all([
    prisma.match.aggregate({ _count: { _all: true }, _sum: { durationMs: true } }),
    prisma.matchRound.groupBy({ by: ['finish'], _count: { _all: true } }),
    sideGroups('p1Name', 'p1Score', 1),
    sideGroups('p2Name', 'p2Score', 2),
    sideGroups('p1Bey', 'p1Score', 1),
    sideGroups('p2Bey', 'p2Score', 2),
  ]);

  const players = mergeSides([...p1Names, ...p2Names], (name) => name.toLowerCase())
    .sort((a, b) => b.wins - a.wins || b.points - a.points || a.matches - b.matches)
    .slice(0, 20)
    .map(({ label, matches, wins, points }) => ({ name: label, matches, wins, points }));

  const beys = mergeSides([...p1Beys, ...p2Beys], (bey) => bey)
    .sort((a, b) => b.wins - a.wins || b.matches - a.matches)
    .map(({ label, matches, wins }) => ({ bey: label, matches, wins }));

  return {
    totals: { matches: totals._count._all, durationMs: totals._sum.durationMs ?? 0 },
    finishes: finishes.map((f) => ({ finish: f.finish, count: f._count._all })),
    players,
    beys,
  };
}
