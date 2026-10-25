import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(import.meta.dirname, '..', 'data');
mkdirSync(DATA_DIR, { recursive: true });

export const DB_PATH = path.join(DATA_DIR, 'beyblade.db');
const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS controller_configs (
    slot       INTEGER PRIMARY KEY CHECK (slot IN (1, 2)),
    config     TEXT    NOT NULL,
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS matches (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    p1_name       TEXT    NOT NULL,
    p1_bey        TEXT    NOT NULL,
    p1_score      INTEGER NOT NULL,
    p2_name       TEXT    NOT NULL,
    p2_bey        TEXT    NOT NULL,
    p2_score      INTEGER NOT NULL,
    winner        INTEGER NOT NULL CHECK (winner IN (1, 2)),
    target_points INTEGER NOT NULL,
    rounds        TEXT    NOT NULL,
    duration_ms   INTEGER NOT NULL,
    played_at     TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_matches_played_at ON matches (played_at DESC);
`);

const stmts = {
  getConfigs: db.prepare('SELECT slot, config FROM controller_configs'),
  saveConfig: db.prepare(`
    INSERT INTO controller_configs (slot, config, updated_at) VALUES (?, ?, datetime('now'))
    ON CONFLICT (slot) DO UPDATE SET config = excluded.config, updated_at = excluded.updated_at
  `),
  getSetting: db.prepare('SELECT value FROM settings WHERE key = ?'),
  setSetting: db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT (key) DO UPDATE SET value = excluded.value
  `),
  insertMatch: db.prepare(`
    INSERT INTO matches (p1_name, p1_bey, p1_score, p2_name, p2_bey, p2_score, winner, target_points, rounds, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  listMatches: db.prepare(`
    SELECT id, p1_name, p1_bey, p1_score, p2_name, p2_bey, p2_score, winner, target_points, rounds, duration_ms, played_at
    FROM matches ORDER BY id DESC LIMIT ?
  `),
  leaderboard: db.prepare(`
    WITH entries AS (
      SELECT p1_name AS name, p1_score AS points, winner = 1 AS won FROM matches
      UNION ALL
      SELECT p2_name, p2_score, winner = 2 FROM matches
    )
    SELECT MIN(name) AS name, COUNT(*) AS matches, SUM(won) AS wins, SUM(points) AS points
    FROM entries
    GROUP BY name COLLATE NOCASE
    ORDER BY wins DESC, points DESC, matches ASC
    LIMIT 20
  `),
  beyStats: db.prepare(`
    WITH entries AS (
      SELECT p1_bey AS bey, winner = 1 AS won FROM matches
      UNION ALL
      SELECT p2_bey, winner = 2 FROM matches
    )
    SELECT bey, COUNT(*) AS matches, SUM(won) AS wins
    FROM entries
    GROUP BY bey
    ORDER BY wins DESC, matches DESC
  `),
  totals: db.prepare('SELECT COUNT(*) AS matches, COALESCE(SUM(duration_ms), 0) AS duration_ms FROM matches'),
  finishes: db.prepare(`
    SELECT json_extract(r.value, '$.finish') AS finish, COUNT(*) AS count
    FROM matches m, json_each(m.rounds) r
    GROUP BY finish
  `),
};

export function getConfigs() {
  const out = { 1: null, 2: null };
  for (const row of stmts.getConfigs.all()) out[row.slot] = JSON.parse(row.config);
  return out;
}

export function saveConfig(slot, config) {
  stmts.saveConfig.run(slot, JSON.stringify(config));
}

export function getSetting(key) {
  const row = stmts.getSetting.get(key);
  return row ? JSON.parse(row.value) : null;
}

export function setSetting(key, value) {
  stmts.setSetting.run(key, JSON.stringify(value));
}

export function insertMatch(m) {
  const result = stmts.insertMatch.run(
    m.p1.name, m.p1.bey, m.p1.score,
    m.p2.name, m.p2.bey, m.p2.score,
    m.winner, m.targetPoints, JSON.stringify(m.rounds), m.durationMs,
  );
  return Number(result.lastInsertRowid);
}

export function listMatches(limit) {
  return stmts.listMatches.all(limit).map((row) => ({ ...row, rounds: JSON.parse(row.rounds) }));
}

export function getStats() {
  return {
    totals: stmts.totals.get(),
    finishes: stmts.finishes.all(),
    players: stmts.leaderboard.all(),
    beys: stmts.beyStats.all(),
  };
}
