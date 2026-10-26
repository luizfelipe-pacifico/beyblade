// Simulação da partida (D-006): funções puras sobre um estado serializável, em mm e segundos.
// Não importa nada de DOM, canvas, áudio ou relógio; a UI só lê o estado e os eventos de cada tick.
// Comandos do jogo de GBA (D-024): ✕ ataca e ○ defende (segurar carrega), L1 pula, R1 esquiva,
// L1+R1 soltam a fera bit, ✕+○ ativam o Engine Gear e o lançamento é ✕ no tempo certo.
import { nextRandom } from './rng.js';
import {
  ARENA_RADIUS,
  BOWL,
  DT,
  GRAVITY,
  TIPS,
  TYPES,
  bowlSlope,
  tipClass,
  FINISH_SECONDS,
  LAUNCH_SECONDS,
  PHYSICS as P,
  POCKETS,
  POCKET_HALF_WIDTH,
  ROUND_OVER_SECONDS,
  ROUND_SECONDS,
  ROUNDS_TO_WIN,
  START_X,
  SUBSTEPS,
} from './constants.js';

export const NEUTRAL_INPUT = Object.freeze({ move: Object.freeze({ x: 0, y: 0 }), held: Object.freeze({}), pressed: Object.freeze({}) });

const ticksOf = (seconds) => Math.round(seconds / DT);
// Atributos do catálogo vão de 1 a 10 (BEYBLADES.md); a física usa 0 a 1.
const unit = (v) => Math.min(1, Math.max(0, ((v ?? 5.5) - 1) / 9));
// Onda triangular 0→1→0: a barra de força do lançamento sobe e desce sozinha; ✕ trava o valor.
const triangle = (x) => 1 - Math.abs((x % 2) - 1);
const LAUNCH_CYCLE = 0.9;
const LAUNCH_DEFAULT = 0.35;

function makeBey(def, slot) {
  const a = def.atributos ?? {};
  return {
    slot,
    x: slot === 0 ? -START_X : START_X,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    r: (def.medidas?.diametro_mm ?? 46) / 2,
    mass: def.medidas?.peso_g ?? 38,
    dir: def.rotacao === 'esquerda' ? -1 : 1,
    tipo: def.tipo ?? 'balance',
    // Comportamento na arena: a ponta manda (docs/BEY_BEHAVIOR.md); o tipo cobre massa e recuo.
    tip: def.tip ?? TIPS[tipClass(def.ponta, def.tipo)],
    kind: TYPES[def.tipo] ?? TYPES.balance,
    peso: unit(a.peso),
    atk: unit(a.ataque),
    def: unit(a.defesa),
    sta: unit(a.stamina),
    vel: unit(a.velocidade),
    bal: unit(a.equilibrio),
    rko: unit(a.resistencia_knockout),
    engineGear: Boolean(def.engineGear),
    egUsed: false,
    spin: 0,
    special: 0,
    attackCharge: 0,
    guardCharge: 0,
    dashCd: 0,
    jumpCd: 0,
    dodgeCd: 0,
    air: 0,
    invuln: 0,
    guard: false,
    // Botões do tick anterior: soltar ✕ investe, tocar L1/R1 pula/esquiva, a não ser que tenham
    // feito parte de uma combinação (L1+R1 ou ✕+○) segurada ao mesmo tempo.
    btn: { attack: false, defend: false, jump: false, dodge: false, comboLR: false, comboAD: false },
    state: 'ready',
    effects: [],
  };
}

export function createMatch({ beys, seed = 1 }) {
  if (!Array.isArray(beys) || beys.length !== 2) throw new Error('createMatch precisa de duas beys');
  const state = {
    tick: 0,
    rng: seed >>> 0,
    defs: beys.map((b) => ({ slug: b.slug, nome: b.nome, especial: b.especial ?? 'Especial' })),
    source: beys,
    round: 1,
    wins: [0, 0],
    rounds: [],
    winner: 0,
    phase: 'launch',
    phaseTicks: 0,
    pending: null,
    hitCd: 0,
    beys: [],
    launch: [],
    events: [],
  };
  startRound(state);
  return state;
}

function startRound(state) {
  state.beys = state.source.map((def, slot) => makeBey(def, slot));
  state.launch = [0, 1].map(() => ({ power: null }));
  state.phase = 'launch';
  state.phaseTicks = 0;
  state.pending = null;
  state.events.push({ type: 'roundStart', round: state.round });
}

const launchWave = (state) => triangle((state.phaseTicks * DT) / LAUNCH_CYCLE);

// Força travada pelo jogador, ou a posição atual da barra enquanto ele ainda não apertou.
export function launchPower(state, slot) {
  const l = state.launch[slot];
  if (!l) return 0;
  if (l.power !== null) return l.power;
  return state.phase === 'launch' ? launchWave(state) : LAUNCH_DEFAULT;
}

// Avança um tick (1/60 s). Os eventos ficam em state.events só até o próximo tick.
export function stepMatch(state, inputs = [NEUTRAL_INPUT, NEUTRAL_INPUT]) {
  state.events = [];
  state.tick++;
  state.phaseTicks++;
  switch (state.phase) {
    case 'launch':
      stepLaunch(state, inputs);
      break;
    case 'battle':
      handleCommands(state, inputs);
      simulate(state, inputs, true);
      if (state.phase === 'battle' && state.phaseTicks >= ticksOf(ROUND_SECONDS)) decide(state);
      break;
    case 'finishing':
      simulate(state, inputs, false);
      if (state.phaseTicks >= ticksOf(FINISH_SECONDS)) endRound(state);
      break;
    case 'roundOver':
      if (state.phaseTicks >= ticksOf(ROUND_OVER_SECONDS)) {
        if (state.winner) {
          state.phase = 'matchOver';
          state.phaseTicks = 0;
          state.events.push({ type: 'matchEnd', winner: state.winner, wins: [...state.wins] });
        } else {
          state.round++;
          startRound(state);
        }
      }
      break;
    default:
      break;
  }
  return state;
}

function stepLaunch(state, inputs) {
  const t = state.phaseTicks;
  const second = ticksOf(1);
  // Um número por segundo, no primeiro tick de cada segundo: 3, 2, 1.
  if ((t - 1) % second === 0 && t <= 2 * second + 1) state.events.push({ type: 'countdown', n: 3 - (t - 1) / second });
  state.launch.forEach((l, slot) => {
    if (l.power === null && inputs[slot]?.pressed.attack) {
      l.power = launchWave(state);
      state.events.push({ type: 'launchLock', slot, power: l.power });
    }
  });
  if (t >= ticksOf(LAUNCH_SECONDS)) launchBeys(state);
}

function launchBeys(state) {
  state.beys.forEach((b, slot) => {
    const l = state.launch[slot];
    const power = l.power ?? LAUNCH_DEFAULT;
    l.power = power;
    b.spin = 0.55 + 0.45 * power;
    // Os dois entram girando no mesmo sentido em volta do centro, como no lançamento do anime.
    // Um desvio sorteado (com semente) de ângulo e força: lançamentos idênticos fariam órbitas
    // espelhadas que nunca se cruzam, e a rodada acabaria sempre empatada.
    const speed = (P.launchSpeed + P.launchSpeedPerPower * power) * (0.85 + 0.3 * nextRandom(state));
    const aim = (nextRandom(state) - 0.5) * 0.9;
    const along = slot === 0 ? -1 : 1;
    b.vx = Math.sin(aim) * speed * along + (slot === 0 ? P.launchDrift : -P.launchDrift);
    b.vy = Math.cos(aim) * speed * along;
    b.state = 'active';
    if (power >= 0.92) state.events.push({ type: 'perfect', slot });
  });
  state.phase = 'battle';
  state.phaseTicks = 0;
  state.events.push({ type: 'go' });
}

function other(state, b) {
  return state.beys[b.slot === 0 ? 1 : 0];
}

function handleCommands(state, inputs) {
  for (const b of state.beys) {
    if (b.state !== 'active') continue;
    const inp = inputs[b.slot] ?? NEUTRAL_INPUT;
    const h = inp.held;
    const prev = b.btn;

    // L1 + R1 segurados: fera bit (se a barra estiver cheia). Tocar só um deles: pulo ou esquiva.
    const lr = Boolean(h.jump && h.dodge);
    if (lr && !prev.comboLR) {
      prev.comboLR = true;
      if (b.special >= 1) activateSpecial(state, b);
    }
    if (prev.jump && !h.jump && !prev.comboLR) jump(state, b);
    if (prev.dodge && !h.dodge && !prev.comboLR) dodge(state, b, inp.move);
    if (!h.jump && !h.dodge) prev.comboLR = false;

    // ✕ + ○ segurados: Engine Gear, uma vez por rodada e só em bey com a peça.
    const ad = Boolean(h.attack && h.defend);
    if (ad && !prev.comboAD) {
      prev.comboAD = true;
      b.attackCharge = 0;
      if (b.engineGear && !b.egUsed) engineGear(state, b);
    }
    // ✕: segurar carrega, soltar investe. Avisa uma vez quando a carga enche (o render dá o "estalo").
    if (h.attack && !prev.comboAD) {
      const antes = b.attackCharge;
      b.attackCharge = Math.min(1, b.attackCharge + DT);
      if (antes < 1 && b.attackCharge === 1) state.events.push({ type: 'chargeFull', slot: b.slot });
    }
    if (prev.attack && !h.attack && !prev.comboAD) attack(state, b, inp.move);
    if (!h.attack && !h.defend) prev.comboAD = false;

    // ○: segurar defende; quanto mais tempo, mais firme.
    b.guard = Boolean(h.defend && !ad);
    b.guardCharge = b.guard ? Math.min(1, b.guardCharge + DT) : 0;

    prev.attack = Boolean(h.attack);
    prev.defend = Boolean(h.defend);
    prev.jump = Boolean(h.jump);
    prev.dodge = Boolean(h.dodge);
  }
}

function aimAt(state, b, move) {
  if (Math.hypot(move.x, move.y) >= 0.25) return { x: move.x, y: move.y };
  const opp = other(state, b);
  return { x: opp.x - b.x, y: opp.y - b.y };
}

function attack(state, b, move) {
  const charge = b.attackCharge;
  b.attackCharge = 0;
  if (b.dashCd > 0) return;
  const d = aimAt(state, b, move);
  const m = Math.hypot(d.x, d.y) || 1;
  const power = P.dashSpeed * (0.8 + 0.4 * b.atk) * (0.7 + 0.8 * charge);
  b.vx += (d.x / m) * power;
  b.vy += (d.y / m) * power;
  b.spin = Math.max(0, b.spin - P.dashSpinCost * (1 + charge));
  b.dashCd = P.dashCooldown;
  state.events.push({ type: 'attack', slot: b.slot, charge });
}

function jump(state, b) {
  if (b.air > 0 || b.jumpCd > 0) return;
  b.air = P.jumpTime;
  b.jumpCd = P.jumpCooldown;
  state.events.push({ type: 'jump', slot: b.slot });
}

function dodge(state, b, move) {
  if (b.dodgeCd > 0) return;
  const opp = other(state, b);
  let dx = opp.x - b.x;
  let dy = opp.y - b.y;
  const m = Math.hypot(dx, dy) || 1;
  dx /= m;
  dy /= m;
  // De lado em relação ao adversário; o direcional escolhe o lado (sem direcional, para a esquerda).
  const side = move.x * -dy + move.y * dx < 0 ? -1 : 1;
  b.vx += -dy * side * P.dodgeSpeed;
  b.vy += dx * side * P.dodgeSpeed;
  b.dodgeCd = P.dodgeCooldown;
  b.invuln = P.dodgeInvuln;
  state.events.push({ type: 'dodge', slot: b.slot });
}

function engineGear(state, b) {
  b.egUsed = true;
  b.spin = Math.min(1, b.spin + 0.1);
  b.effects.push({ t: 4, speed: 1.3, dmgOut: 1.3 });
  state.events.push({ type: 'engineGear', slot: b.slot });
}

// Especial genérico por tipo (protótipo): os efeitos únicos de cada fera entram depois (ROADMAP M3).
function activateSpecial(state, b) {
  const opp = other(state, b);
  b.special = 0;
  if (b.tipo === 'attack') {
    const dx = opp.x - b.x;
    const dy = opp.y - b.y;
    const m = Math.hypot(dx, dy) || 1;
    b.vx = (dx / m) * P.specialRush;
    b.vy = (dy / m) * P.specialRush;
    b.effects.push({ t: 1.2, dmgOut: 1.8, knockOut: 1.5 });
  } else if (b.tipo === 'defense') {
    b.effects.push({ t: 3, mass: 4, dmgIn: 0.4, knockIn: 0.3 });
  } else if (b.tipo === 'stamina') {
    b.spin = Math.min(1, b.spin + 0.25);
    b.effects.push({ t: 2, dmgIn: 0.8 });
  } else {
    b.effects.push({ t: 3, dmgOut: 1.4, dmgIn: 0.7, steal: 0.4 });
  }
  state.events.push({ type: 'special', slot: b.slot, nome: state.defs[b.slot].especial, tipo: b.tipo });
}

function mods(b) {
  const m = { mass: 1, dmgIn: 1, dmgOut: 1, knockIn: 1, knockOut: 1, steal: 0, speed: 1 };
  if (b.guard) {
    m.mass *= 1.8;
    m.knockIn *= 0.6 - 0.25 * b.guardCharge;
    m.dmgIn *= 0.7 - 0.2 * b.guardCharge;
  }
  if (b.invuln > 0) m.dmgIn = 0;
  for (const e of b.effects) {
    m.mass *= e.mass ?? 1;
    m.dmgIn *= e.dmgIn ?? 1;
    m.dmgOut *= e.dmgOut ?? 1;
    m.knockIn *= e.knockIn ?? 1;
    m.knockOut *= e.knockOut ?? 1;
    m.steal += e.steal ?? 0;
    m.speed *= e.speed ?? 1;
  }
  return m;
}

function simulate(state, inputs, control) {
  const h = DT / SUBSTEPS;
  for (let s = 0; s < SUBSTEPS; s++) {
    const finishes = [];
    for (const b of state.beys) moveBey(state, b, h, control ? inputs[b.slot] ?? NEUTRAL_INPUT : null);
    const [a, b] = state.beys;
    if (isOnStage(a) && isOnStage(b)) collide(state, a, b, finishes);
    for (const bey of state.beys) wall(state, bey, finishes);
    for (const bey of state.beys) {
      if (bey.state === 'active' && bey.spin <= 0) {
        finishes.push({ loser: bey.slot, finish: 'spin', left: bey.spin });
        bey.spin = 0;
        bey.state = 'stopped';
        bey.guard = false;
      }
    }
    state.hitCd = Math.max(0, state.hitCd - h);
    if (finishes.length && state.phase === 'battle') resolveFinish(state, finishes);
  }
}

const isOnStage = (b) => b.state !== 'out' && b.state !== 'burst';

function moveBey(state, b, h, inp) {
  if (b.state === 'out') {
    b.x += b.vx * h;
    b.y += b.vy * h;
    b.angle += b.dir * 8 * h;
    return;
  }
  if (b.state === 'burst') return;
  const spin = Math.max(0, b.spin);
  const m = mods(b);
  const r = Math.hypot(b.x, b.y);
  const ux = r > 1e-6 ? b.x / r : 0;
  const uy = r > 1e-6 ? b.y / r : 0;
  const slope = bowlSlope(r);
  // 1) Gravidade na rampa: puxa para o fundo, mais forte perto da parede.
  let ax = -GRAVITY * slope * ux;
  let ay = -GRAVITY * slope * uy;
  const speed0 = Math.hypot(b.vx, b.vy);
  if (b.state === 'active') {
    const tip = b.tip;
    // 2) Ponta: inclinada na rampa, empurra a bey de lado no sentido da rotação. Giro baixo inclina mais.
    const wobble = spin < BOWL.wobbleSpin ? ((BOWL.wobbleSpin - spin) / BOWL.wobbleSpin) * BOWL.wobbleTilt : 0;
    const tilt = Math.min(BOWL.maxTilt, slope + wobble);
    const tracao = tip.mu * GRAVITY;
    const lado = Math.min(tracao, tip.drive * spin * tilt * GRAVITY * (b.air > 0 ? 0 : 1));
    ax += -uy * lado * b.dir;
    ay += ux * lado * b.dir;
    // A borda da ponta, girando no chão, empurra a bey para frente (também limitada pela tração).
    if (speed0 > 1 && b.air <= 0) {
      const frente = Math.min(tracao, tip.fwd * spin * GRAVITY);
      ax += (b.vx / speed0) * frente;
      ay += (b.vy / speed0) * frente;
    }
    // 4) Jogador inclina a bey: soma ao movimento e também tem teto na tração da ponta (não é um carro).
    if (inp && b.air <= 0) {
      const f = tracao * (0.6 + 0.6 * b.vel) * (0.4 + 0.6 * spin) * (b.guard ? 0.4 : 1) * m.speed;
      ax += inp.move.x * f;
      ay += inp.move.y * f;
    }
  }
  // 3) Atrito contra o piso. Parada e com a rampa puxando menos que o atrito, a bey não se mexe
  // (atrito estático); sem isso ela "rastejava" alguns mm/s a cada subpasso.
  const slide = (b.state === 'active' ? b.tip.slide * (b.guard ? 2 : 1) : BOWL.stoppedSlide) * GRAVITY;
  if (b.state !== 'active' && speed0 <= slide * h && GRAVITY * slope <= slide) {
    b.vx = 0;
    b.vy = 0;
    return;
  }
  if (speed0 > 1e-6 && b.air <= 0) {
    const freio = Math.min(slide, speed0 / h);
    ax -= (b.vx / speed0) * freio;
    ay -= (b.vy / speed0) * freio;
  }
  b.vx += ax * h;
  b.vy += ay * h;
  if (b.air <= 0) {
    const k = Math.exp(-BOWL.drag * h);
    b.vx *= k;
    b.vy *= k;
  }
  const speed = Math.hypot(b.vx, b.vy);
  const cap = P.maxSpeed * 1.5;
  if (speed > cap) {
    b.vx *= cap / speed;
    b.vy *= cap / speed;
  }
  b.x += b.vx * h;
  b.y += b.vy * h;
  if (b.state === 'active') {
    // Peso gasta giro e ponta de mais tração também (defesa perde para resistência na Parada).
    const desgaste = (0.6 + b.tip.mu) * (0.85 + 0.05 * (1 + 9 * b.peso));
    b.spin -= (P.spinDecay * (1.6 - b.sta) * desgaste + (b.guard ? P.guardDrain : 0)) * h;
    b.special = Math.min(1, b.special + P.specialPassive * h);
    b.dashCd = Math.max(0, b.dashCd - h);
    b.jumpCd = Math.max(0, b.jumpCd - h);
    b.dodgeCd = Math.max(0, b.dodgeCd - h);
    b.invuln = Math.max(0, b.invuln - h);
    if (b.air > 0) {
      b.air = Math.max(0, b.air - h);
      if (b.air === 0) state.events.push({ type: 'land', slot: b.slot });
    }
    b.effects = b.effects.filter((e) => (e.t -= h) > 0);
  }
  b.angle += b.dir * (6 + 60 * spin) * h;
}

function collide(state, a, b, finishes) {
  // Uma bey no ar passa por cima da outra (é para isso que serve o pulo).
  if (a.air > 0 || b.air > 0) return;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const minD = a.r + b.r;
  if (dist >= minD || dist === 0) return;
  const nx = dx / dist;
  const ny = dy / dist;
  const ma_ = mods(a);
  const mb_ = mods(b);
  const ma = a.mass * a.kind.mass * ma_.mass;
  const mb = b.mass * b.kind.mass * mb_.mass;
  const tot = ma + mb;
  const overlap = minD - dist;
  a.x -= nx * overlap * (mb / tot);
  a.y -= ny * overlap * (mb / tot);
  b.x += nx * overlap * (ma / tot);
  b.y += ny * overlap * (ma / tot);

  const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (vn >= 0) return;
  const impact = -vn;
  const sr = (Math.max(0, a.spin) + Math.max(0, b.spin)) / 2;
  // Mesmo sentido: as superfícies se chocam de frente, mais recuo. Oposto: menos recuo e o giro se equaliza.
  const same = a.dir === b.dir;
  const j = ((1 + P.restitution) * impact) / (1 / ma + 1 / mb);
  const repel = P.repel * sr * (same ? 1.3 : 0.8);
  // Recuo próprio pelo tipo (ataque se joga mais, defesa absorve), BEY_BEHAVIOR.md.
  const knockA = (1.3 - 0.6 * a.rko) * a.kind.recoil * ma_.knockIn * mb_.knockOut;
  const knockB = (1.3 - 0.6 * b.rko) * b.kind.recoil * mb_.knockIn * ma_.knockOut;
  const pushA = (j / ma + repel * (mb / tot) * 2) * knockA;
  const pushB = (j / mb + repel * (ma / tot) * 2) * knockB;
  a.vx -= nx * pushA;
  a.vy -= ny * pushA;
  b.vx += nx * pushB;
  b.vy += ny * pushB;

  const base = impact * P.hitDamage + 0.0005 * sr;
  const sameMul = same ? 1 : 0.85;
  const dmgA = (base * (0.6 + 0.8 * b.atk)) / (0.6 + 0.8 * a.def) * mb_.dmgOut * ma_.dmgIn * sameMul;
  const dmgB = (base * (0.6 + 0.8 * a.atk)) / (0.6 + 0.8 * b.def) * ma_.dmgOut * mb_.dmgIn * sameMul;
  if (a.state === 'active') a.spin -= dmgA;
  if (b.state === 'active') b.spin -= dmgB;
  if (ma_.steal && a.state === 'active') a.spin = Math.min(1, a.spin + dmgB * ma_.steal);
  if (mb_.steal && b.state === 'active') b.spin = Math.min(1, b.spin + dmgA * mb_.steal);
  if (!same && impact > P.equalizeImpact && a.state === 'active' && b.state === 'active') {
    // Só em rotação oposta; quem recebe aproveita conforme o "life after death" do tipo.
    const transfer = (a.spin - b.spin) * P.equalization;
    a.spin -= transfer * (transfer < 0 ? a.kind.lad : 1);
    b.spin += transfer * (transfer > 0 ? b.kind.lad : 1);
  }
  a.special = Math.min(1, a.special + impact * P.specialPerImpact);
  b.special = Math.min(1, b.special + impact * P.specialPerImpact);

  if (impact > P.hitEventImpact && state.hitCd <= 0) {
    state.hitCd = 0.06;
    state.events.push({ type: 'hit', impact, x: a.x + nx * a.r, y: a.y + ny * a.r, nx, ny });
  }
  checkBurst(state, a, impact, ma_, finishes);
  checkBurst(state, b, impact, mb_, finishes);
}

function checkBurst(state, b, impact, m, finishes) {
  if (b.state !== 'active' || impact < P.burstImpact || b.spin >= P.burstSpin) return;
  const chance = ((impact - P.burstImpact) / P.burstSpan) * (1 - b.spin / P.burstSpin) * (1.2 - b.bal * 0.6) * m.dmgIn;
  if (nextRandom(state) < chance) {
    b.state = 'burst';
    b.spin = 0;
    finishes.push({ loser: b.slot, finish: 'burst' });
    state.events.push({ type: 'burst', slot: b.slot, x: b.x, y: b.y });
  }
}

function angleDiff(a, b) {
  const d = Math.abs(a - b) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
}

function wall(state, b, finishes) {
  if (!isOnStage(b)) return;
  const d = Math.hypot(b.x, b.y);
  if (d + b.r <= ARENA_RADIUS) return;
  const nx = b.x / d;
  const ny = b.y / d;
  const vOut = b.vx * nx + b.vy * ny;
  if (vOut > 0) {
    const ang = Math.atan2(b.y, b.x);
    const pocket = POCKETS.some((p) => angleDiff(ang, p) < POCKET_HALF_WIDTH);
    if ((pocket && vOut > P.pocketOutSpeed) || vOut > P.rimOutSpeed) {
      b.state = 'out';
      finishes.push({ loser: b.slot, finish: 'ringout' });
      state.events.push({ type: 'ringout', slot: b.slot });
      return;
    }
    b.vx -= (1 + P.wallRestitution) * vOut * nx;
    b.vy -= (1 + P.wallRestitution) * vOut * ny;
    if (b.state === 'active') b.spin -= vOut * P.wallDamage;
    if (vOut > P.wallEventSpeed) state.events.push({ type: 'wall', slot: b.slot, impact: vOut, x: b.x + nx * b.r, y: b.y + ny * b.r });
  }
  const k = (ARENA_RADIUS - b.r) / d;
  b.x *= k;
  b.y *= k;
}

const FINISH_PRIORITY = { burst: 3, ringout: 2, spin: 1 };

function resolveFinish(state, finishes) {
  const losers = new Set(finishes.map((f) => f.loser));
  if (losers.size > 1) {
    // As duas pararam no mesmo subpasso: perde a que passou mais do zero, isto é, a que parou antes.
    const [x, y] = finishes;
    if (finishes.length === 2 && x.finish === 'spin' && y.finish === 'spin' && x.left !== y.left) {
      const loser = x.left < y.left ? x.loser : y.loser;
      return setPending(state, loser === 0 ? 2 : 1, 'spin');
    }
    return setPending(state, 0, 'draw');
  }
  const f = finishes.reduce((best, x) => (FINISH_PRIORITY[x.finish] > FINISH_PRIORITY[best.finish] ? x : best));
  setPending(state, f.loser === 0 ? 2 : 1, f.finish);
}

function decide(state) {
  const [a, b] = state.beys;
  if (Math.abs(a.spin - b.spin) < 0.01) setPending(state, 0, 'draw');
  else setPending(state, a.spin > b.spin ? 1 : 2, 'decision');
}

function setPending(state, winner, finish) {
  state.pending = { winner, finish };
  state.phase = 'finishing';
  state.phaseTicks = 0;
  state.events.push({ type: 'finish', winner, finish });
}

function endRound(state) {
  const { winner, finish } = state.pending;
  if (winner) state.wins[winner - 1]++;
  state.rounds.push({ winner, finish });
  if (state.wins[0] >= ROUNDS_TO_WIN) state.winner = 1;
  else if (state.wins[1] >= ROUNDS_TO_WIN) state.winner = 2;
  state.phase = 'roundOver';
  state.phaseTicks = 0;
  state.events.push({ type: 'roundEnd', winner, finish, wins: [...state.wins] });
}
