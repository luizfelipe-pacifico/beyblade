// Validação dos dados que chegam pela API antes de irem para o SQLite.
// Cada parse* devolve { value } com uma cópia limpa ou { error } com a mensagem.

const ACTIONS = ['up', 'down', 'left', 'right', 'dash', 'guard', 'special', 'launch', 'pause'];
const FINISHES = new Set(['spin', 'ringout', 'xtreme', 'burst', 'decision', 'draw']);
const BEY_ID = /^[a-z0-9-]{1,32}$/;

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

function parseBinding(b) {
  if (!isObject(b)) return null;
  switch (b.type) {
    case 'button':
      return isInt(b.index, 0, 63) ? { type: 'button', index: b.index } : null;
    case 'axis':
      return isInt(b.index, 0, 15) && (b.dir === 1 || b.dir === -1) ? { type: 'axis', index: b.index, dir: b.dir } : null;
    case 'key':
      return typeof b.code === 'string' && /^[A-Za-z0-9]{1,32}$/.test(b.code) ? { type: 'key', code: b.code } : null;
    default:
      return null;
  }
}

export function parseConfig(c) {
  if (!isObject(c)) return { error: 'Configuração inválida' };
  if (!isInt(c.gamepadIndex, 0, 15)) return { error: 'gamepadIndex inválido' };
  if (typeof c.deadzone !== 'number' || !(c.deadzone >= 0 && c.deadzone <= 0.9)) return { error: 'deadzone inválida' };
  if (typeof c.rumble !== 'boolean') return { error: 'rumble inválido' };
  if (!isObject(c.bindings)) return { error: 'bindings inválidos' };

  const bindings = {};
  for (const action of ACTIONS) {
    const list = c.bindings[action];
    if (!Array.isArray(list) || list.length > 8) return { error: `Mapeamento inválido para "${action}"` };
    const parsed = list.map(parseBinding);
    if (parsed.includes(null)) return { error: `Mapeamento inválido para "${action}"` };
    bindings[action] = parsed;
  }
  return { value: { gamepadIndex: c.gamepadIndex, deadzone: c.deadzone, rumble: c.rumble, bindings } };
}

function parseName(name) {
  if (typeof name !== 'string') return null;
  const clean = name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24);
  return clean || null;
}

function parsePick(p, withScore) {
  if (!isObject(p)) return null;
  const name = parseName(p.name);
  if (!name || typeof p.bey !== 'string' || !BEY_ID.test(p.bey)) return null;
  if (!withScore) return { name, bey: p.bey };
  return isInt(p.score, 0, 99) ? { name, bey: p.bey, score: p.score } : null;
}

export function parseSetup(s) {
  if (!isObject(s)) return { error: 'Setup inválido' };
  const p1 = parsePick(s.p1, false);
  const p2 = parsePick(s.p2, false);
  if (!p1 || !p2) return { error: 'Jogadores inválidos' };
  if (!isInt(s.targetPoints, 1, 20)) return { error: 'targetPoints inválido' };
  return { value: { p1, p2, targetPoints: s.targetPoints } };
}

export function parseMatch(m) {
  if (!isObject(m)) return { error: 'Partida inválida' };
  const p1 = parsePick(m.p1, true);
  const p2 = parsePick(m.p2, true);
  if (!p1 || !p2) return { error: 'Jogadores inválidos' };
  if (m.winner !== 1 && m.winner !== 2) return { error: 'winner inválido' };
  if (!isInt(m.targetPoints, 1, 20)) return { error: 'targetPoints inválido' };
  if (!isInt(m.durationMs, 0, 24 * 60 * 60 * 1000)) return { error: 'durationMs inválido' };
  if (!Array.isArray(m.rounds) || m.rounds.length === 0 || m.rounds.length > 200) return { error: 'rounds inválidos' };

  const rounds = [];
  for (const r of m.rounds) {
    if (!isObject(r) || !isInt(r.winner, 0, 2) || !FINISHES.has(r.finish) || !isInt(r.points, 0, 3)) {
      return { error: 'Rodada inválida' };
    }
    rounds.push({ winner: r.winner, finish: r.finish, points: r.points });
  }
  return { value: { p1, p2, winner: m.winner, targetPoints: m.targetPoints, durationMs: m.durationMs, rounds } };
}
