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
  CRITICAL,
  ENGINE_GEAR,
  FERA,
  HIT_ANGLE,
  STOMP,
  TILT,
  SHIELD,
  MOTION,
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
    egCd: 0,
    egDecay: 1,
    // Desvio próprio da inclinação do eixo (radianos), além da que vem da rampa (D-052).
    tx: 0,
    ty: 0,
    spin: 0,
    special: 0,
    attackCharge: 0,
    // Janela da investida perfeita depois do estalo e golpe crítico armado (D-040).
    perfectWindow: 0,
    critReady: 0,
    guardCharge: 0,
    shield: 1,
    shieldBroken: false,
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

// Regras do cenário (D-039): atrito do piso, se há ring out, quão fácil é sair, vento e frio.
const REGRAS = { atrito: 1, ringOut: true, saida: 1, vento: null, giro: 1 };

// treino: sem relógio, rodadas sem placar e o P2 (boneco) não perde giro (D-035).
export function createMatch({ beys, seed = 1, treino = false, regras = {} }) {
  if (!Array.isArray(beys) || beys.length !== 2) throw new Error('createMatch precisa de duas beys');
  const state = {
    tick: 0,
    rng: seed >>> 0,
    treino,
    regras: { ...REGRAS, ...regras },
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
    rubCd: 0,
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
      if (state.treino) state.beys[1].spin = Math.max(state.beys[1].spin, 1);
      else if (state.phase === 'battle' && state.phaseTicks >= ticksOf(ROUND_SECONDS)) decide(state);
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
      if (b.special >= 1 && !feraAtiva(b)) activateSpecial(state, b);
    }
    if (prev.jump && !h.jump && !prev.comboLR) jump(state, b);
    if (prev.dodge && !h.dodge && !prev.comboLR) dodge(state, b, inp.move);
    if (!h.jump && !h.dodge) prev.comboLR = false;

    // ✕ + ○ segurados: Engine Gear, uma vez por rodada e só em bey com a peça.
    const ad = Boolean(h.attack && h.defend);
    if (ad && !prev.comboAD) {
      prev.comboAD = true;
      b.attackCharge = 0;
      if (b.engineGear && b.egCd <= 0) engineGear(state, b);
    }
    // ✕: segurar carrega, soltar investe. Avisa uma vez quando a carga enche (o render dá o "estalo").
    if (h.attack && !prev.comboAD) {
      const antes = b.attackCharge;
      b.attackCharge = Math.min(1, b.attackCharge + DT);
      if (antes < 1 && b.attackCharge === 1) {
        b.perfectWindow = CRITICAL.perfectWindow;
        state.events.push({ type: 'chargeFull', slot: b.slot });
      } else b.perfectWindow = Math.max(0, b.perfectWindow - DT);
    }
    b.critReady = Math.max(0, b.critReady - DT);
    if (prev.attack && !h.attack && !prev.comboAD) attack(state, b, inp.move);
    if (!h.attack && !h.defend) prev.comboAD = false;

    // ○: segurar defende; quanto mais tempo, mais firme.
    // Escudo quebrado não levanta até recarregar um pouco; parado, recarrega devagar.
    if (b.shieldBroken && b.shield >= SHIELD.minToRaise) b.shieldBroken = false;
    b.guard = Boolean(h.defend && !ad && !b.shieldBroken);
    b.guardCharge = b.guard ? Math.min(1, b.guardCharge + DT) : 0;
    if (!b.guard) b.shield = Math.min(1, b.shield + SHIELD.regen * DT);

    prev.attack = Boolean(h.attack);
    prev.defend = Boolean(h.defend);
    prev.jump = Boolean(h.jump);
    prev.dodge = Boolean(h.dodge);
  }
}

// A investida sempre vai na outra bey, mirando onde ela vai estar (antecipa até 0,35 s). O direcional
// só corrige a mira em até ±25° para o lado que o jogador aponta; antes ele trocava o alvo
// e o ataque saía para qualquer lugar.
const AIM_BEND = (25 * Math.PI) / 180;

export function aimAt(state, b, move, speed) {
  const opp = other(state, b);
  let dx = opp.x - b.x;
  let dy = opp.y - b.y;
  const t = Math.min(0.35, Math.hypot(dx, dy) / Math.max(1, speed));
  dx += opp.vx * t;
  dy += opp.vy * t;
  const alvo = Math.atan2(dy, dx);
  const forca = Math.min(1, Math.hypot(move.x, move.y));
  if (forca < 0.25) return { x: Math.cos(alvo), y: Math.sin(alvo) };
  let desvio = Math.atan2(move.y, move.x) - alvo;
  desvio = Math.atan2(Math.sin(desvio), Math.cos(desvio));
  const a = alvo + Math.max(-AIM_BEND, Math.min(AIM_BEND, desvio)) * forca;
  return { x: Math.cos(a), y: Math.sin(a) };
}

function attack(state, b, move) {
  const charge = b.attackCharge;
  const perfeita = charge >= 1 && b.perfectWindow > 0;
  b.attackCharge = 0;
  b.perfectWindow = 0;
  if (b.dashCd > 0) return;
  if (perfeita) b.critReady = CRITICAL.hitWindow;
  const power = P.dashSpeed * (0.8 + 0.4 * b.atk) * (0.7 + 0.8 * charge);
  const d = aimAt(state, b, move, power);
  // A investida troca a direção em vez de somar: somada à velocidade de órbita, ela errava o alvo.
  const keep = Math.max(0, b.vx * d.x + b.vy * d.y);
  b.vx = d.x * (power + 0.5 * keep);
  b.vy = d.y * (power + 0.5 * keep);
  b.spin = Math.max(0, b.spin - P.dashSpinCost * (1 + charge));
  b.dashCd = P.dashCooldown;
  state.events.push({ type: 'attack', slot: b.slot, charge, perfeita });
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

// Inclina o eixo na direção do empurrão (limitado ao máximo de inclinação).
function inclinar(b, nx, ny, quanto) {
  b.tx += nx * quanto;
  b.ty += ny * quanto;
  const m = Math.hypot(b.tx, b.ty);
  if (m > TILT.max) {
    b.tx *= TILT.max / m;
    b.ty *= TILT.max / m;
  }
}

// Caiu do pulo em cima da outra: o peso de quem cai empurra a de baixo para longe e a desequilibra.
function pisar(state, b) {
  const o = other(state, b);
  if (o.state !== 'active' || o.air > 0) return;
  const dx = o.x - b.x;
  const dy = o.y - b.y;
  const dist = Math.hypot(dx, dy);
  if (dist >= (b.r + o.r) * 1.05) return;
  const nx = dist > 1e-6 ? dx / dist : 1;
  const ny = dist > 1e-6 ? dy / dist : 0;
  const share = b.mass * b.kind.mass / (b.mass * b.kind.mass + o.mass * o.kind.mass);
  const empurrao = STOMP.push * 2 * share * (0.5 + 0.5 * Math.max(0, b.spin));
  o.vx += nx * empurrao;
  o.vy += ny * empurrao;
  b.vx -= nx * empurrao * 0.3;
  b.vy -= ny * empurrao * 0.3;
  inclinar(o, nx, ny, TILT.stomp * 2 * share);
  if (o.guard) baterNoEscudo(state, o, P.strongImpact, false);
  else o.spin -= STOMP.damage * 2 * share;
  state.events.push({ type: 'stomp', slot: b.slot, x: o.x, y: o.y, nx, ny });
}

function engineGear(state, b) {
  b.egUsed = true;
  b.egCd = ENGINE_GEAR.cooldown;
  b.egDecay = ENGINE_GEAR.decayAfter;
  b.spin = Math.min(1, b.spin + (b.tipo === 'attack' ? ENGINE_GEAR.recoverAttack : ENGINE_GEAR.recover));
  b.effects.push({ t: 4, speed: 1.3, dmgOut: 1.3 });
  state.events.push({ type: 'engineGear', slot: b.slot });
}

// Especial genérico por tipo (protótipo): os efeitos únicos de cada fera entram depois (ROADMAP M3).
export const feraAtiva = (b) => b.effects.some((e) => e.fx === 'fera');

function activateSpecial(state, b) {
  const opp = other(state, b);
  b.special = 0;
  // A fera sai: ataque, defesa, peso, resistência a KO, velocidade (e o teto do tipo) e stamina
  // sobem juntos por FERA.seconds; o golpe próprio do tipo vem por cima.
  const k = FERA.boost;
  b.effects.push({ t: FERA.seconds, fx: 'fera', mass: k, dmgOut: k, dmgIn: 1 / k, knockIn: 1 / k, speed: k, sta: k });
  if (b.tipo === 'attack') {
    const dx = opp.x - b.x;
    const dy = opp.y - b.y;
    const m = Math.hypot(dx, dy) || 1;
    b.vx = (dx / m) * P.specialRush;
    b.vy = (dy / m) * P.specialRush;
    b.effects.push({ t: 1.2, dmgOut: 1.8, knockOut: 1.5, fx: 'especial' });
  } else if (b.tipo === 'defense') {
    b.effects.push({ t: 3, mass: 4, dmgIn: 0.4, knockIn: 0.3, fx: 'especial' });
  } else if (b.tipo === 'stamina') {
    b.spin = Math.min(1, b.spin + 0.25);
    b.effects.push({ t: 2, dmgIn: 0.8, fx: 'especial' });
  } else {
    b.effects.push({ t: 3, dmgOut: 1.4, dmgIn: 0.7, steal: 0.4, fx: 'especial' });
  }
  state.events.push({ type: 'special', slot: b.slot, nome: state.defs[b.slot].especial, tipo: b.tipo, segundos: FERA.seconds });
}

function mods(b) {
  const m = { mass: 1, dmgIn: 1, dmgOut: 1, knockIn: 1, knockOut: 1, steal: 0, speed: 1, sta: 1 };
  if (b.guard) {
    m.mass *= 1.8;
    m.knockIn *= 0.6 - 0.25 * b.guardCharge;
    // O escudo segura todo o desgaste do choque; quem bateu perde giro normalmente.
    m.dmgIn = 0;
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
    m.sta *= e.sta ?? 1;
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
    state.rubCd = Math.max(0, (state.rubCd ?? 0) - h);
    if (finishes.length && state.phase === 'battle') resolveFinish(state, finishes);
  }
}

const isOnStage = (b) => b.state !== 'out';

function moveBey(state, b, h, inp) {
  if (b.state === 'out') {
    b.x += b.vx * h;
    b.y += b.vy * h;
    b.angle += b.dir * 8 * h;
    return;
  }
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
    // Inclinação total: a da rampa (para fora) mais o desvio próprio da bey (D-052).
    const lx = ux * (slope + wobble) + b.tx;
    const ly = uy * (slope + wobble) + b.ty;
    const lm = Math.hypot(lx, ly);
    const tilt = Math.min(TILT.max, lm);
    const desvio = Math.hypot(b.tx, b.ty);
    // Desequilibrada, a ponta perde tração (raspa a borda no chão).
    const tracao = tip.mu * GRAVITY * state.regras.atrito * (1 - TILT.loseGrip * Math.min(1, desvio / TILT.max));
    const lado = Math.min(tracao, tip.drive * spin * tilt * GRAVITY * (b.air > 0 ? 0 : 1));
    // A ponta inclinada rola de lado em relação à inclinação, no sentido do giro: sem desvio é a órbita
    // de sempre; com desvio, a bey sai para onde foi empurrada.
    const px = lm > 1e-6 ? lx / lm : -uy;
    const py = lm > 1e-6 ? ly / lm : ux;
    ax += -py * lado * b.dir;
    ay += px * lado * b.dir;
    // A borda da ponta, girando no chão, empurra a bey para frente (também limitada pela tração).
    if (speed0 > 1 && b.air <= 0) {
      const frente = Math.min(tracao, tip.fwd * spin * GRAVITY);
      ax += (b.vx / speed0) * frente;
      ay += (b.vy / speed0) * frente;
    }
    // Vento do cenário (terraço): empurra quem está no chão, como uma força própria (tem teto).
    const vento = state.regras.vento;
    if (vento && b.air <= 0) {
      ax += vento.x;
      ay += vento.y;
    }
    // 4) Jogador guia a bey: uma parte empurra (com teto na tração da ponta) e o resto curva a
    // trajetória para o lado do comando, sem ganhar velocidade: arco, não zigue-zague (D-032).
    if (inp && b.air <= 0) {
      const f = tracao * (0.6 + 0.6 * b.vel) * (0.4 + 0.6 * spin) * (b.guard ? 0.4 : 1) * m.speed;
      ax += inp.move.x * f * MOTION.steerPush;
      ay += inp.move.y * f * MOTION.steerPush;
      const forca = Math.min(1, Math.hypot(inp.move.x, inp.move.y));
      if (forca > 0.1 && speed0 > 1) {
        const lado = (b.vx * inp.move.y - b.vy * inp.move.x) / (speed0 * forca);
        const giro = Math.max(-1, Math.min(1, lado)) * MOTION.steerRate * forca * (0.4 + 0.6 * spin) * h;
        const cos = Math.cos(giro);
        const sin = Math.sin(giro);
        [b.vx, b.vy] = [b.vx * cos - b.vy * sin, b.vx * sin + b.vy * cos];
      }
    }
  }
  // 3) Atrito contra o piso. Parada e com a rampa puxando menos que o atrito, a bey não se mexe
  // (atrito estático); sem isso ela "rastejava" alguns mm/s a cada subpasso.
  const slide = (b.state === 'active' ? b.tip.slide * (b.guard ? 2 : 1) : BOWL.stoppedSlide) * GRAVITY * state.regras.atrito;
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
  // Teto do tipo: a força própria não leva a bey acima dele (pode mudar a direção, não ganhar
  // velocidade); o excesso que veio de choque ou investida decai com meia-vida curta.
  const teto = P.maxSpeed * b.kind.cap * m.speed;
  const antes = Math.hypot(b.vx, b.vy);
  b.vx += ax * h;
  b.vy += ay * h;
  if (b.air <= 0) {
    const k = Math.exp(-BOWL.drag * h);
    b.vx *= k;
    b.vy *= k;
  }
  if (b.state === 'active') {
    const depois = Math.hypot(b.vx, b.vy);
    const limite = Math.max(teto, antes);
    let alvo = depois > limite ? limite : depois;
    if (alvo > teto) alvo = teto + (alvo - teto) * Math.exp((-Math.LN2 / MOTION.excessHalfLife) * h);
    if (depois > 1e-6 && alvo < depois) {
      b.vx *= alvo / depois;
      b.vy *= alvo / depois;
    }
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
    const desgaste = (0.6 + b.tip.mu) * (0.85 + 0.05 * (1 + 9 * b.peso)) * b.egDecay;
    // O giro endireita o eixo (efeito giroscópico): quanto mais giro, mais rápido o desvio some.
    const endireita = Math.exp(-TILT.recover * (0.2 + spin) * h);
    b.tx *= endireita;
    b.ty *= endireita;
    // Inclinada, a borda raspa o chão e gasta giro.
    b.spin -= TILT.scrape * Math.hypot(b.tx, b.ty) * h;
    b.egCd = Math.max(0, b.egCd - h);
    b.spin -= ((P.spinDecay * (1.6 - b.sta) * desgaste * state.regras.giro) / m.sta + (b.guard ? P.guardDrain : 0)) * h;
    b.special = Math.min(1, b.special + P.specialPassive * h);
    b.dashCd = Math.max(0, b.dashCd - h);
    b.jumpCd = Math.max(0, b.jumpCd - h);
    b.dodgeCd = Math.max(0, b.dodgeCd - h);
    b.invuln = Math.max(0, b.invuln - h);
    if (b.air > 0) {
      b.air = Math.max(0, b.air - h);
      if (b.air === 0) {
        state.events.push({ type: 'land', slot: b.slot });
        pisar(state, b);
      }
    }
    const antes = feraAtiva(b);
    b.effects = b.effects.filter((e) => (e.t -= h) > 0);
    if (antes && !feraAtiva(b)) state.events.push({ type: 'feraEnd', slot: b.slot });
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
  // Só encostando (sem velocidade de aproximação): o atrito das bordas girando tira giro, empurra uma
  // para longe da outra pelo giro e solta faísca. Escudo levantado gasta por tempo de contato (D-048).
  if (vn >= 0) return raspar(state, a, b, nx, ny, ma, mb, tot, ma_, mb_);
  const impact = -vn;
  // Lado do golpe (D-052), com as velocidades de ANTES do empurrão (medir depois invertia o lado).
  // n aponta de A para B: para B, o golpe vem pelas costas se B já andava na direção de n.
  const lado_ = (x, ux, uy) => {
    const v = Math.hypot(x.vx, x.vy);
    return v > 60 ? (x.vx * ux + x.vy * uy) / v : 0;
  };
  const cA = lado_(a, -nx, -ny);
  const cB = lado_(b, nx, ny);
  // Crítico: quem tem a investida perfeita armada e bate de frente no outro (D-040).
  const deFrente = (x, ux, uy) => {
    const v = Math.hypot(x.vx, x.vy);
    return v > 1 && (x.vx * ux + x.vy * uy) / v >= CRITICAL.minAlign;
  };
  // ...e no ponto certo: empurrando o alvo para fora, rumo à parede e aos bolsos.
  const paraFora = (alvo, ux, uy) => {
    const r = Math.hypot(alvo.x, alvo.y);
    return r > 1 && (alvo.x * ux + alvo.y * uy) / r >= CRITICAL.minOutward;
  };
  const critA = a.critReady > 0 && deFrente(a, nx, ny) && paraFora(b, nx, ny);
  const critB = b.critReady > 0 && deFrente(b, -nx, -ny) && paraFora(a, -nx, -ny);
  if (critA) a.critReady = 0;
  if (critB) b.critReady = 0;
  const sr = (Math.max(0, a.spin) + Math.max(0, b.spin)) / 2;
  // Mesmo sentido: as superfícies se chocam de frente, mais recuo. Oposto: menos recuo e o giro se equaliza.
  const same = a.dir === b.dir;
  const j = ((1 + P.restitution) * impact) / (1 / ma + 1 / mb);
  // O recuo do giro cresce com a força do choque: toque leve afasta pouco, pancada afasta muito.
  const forca = Math.min(2.5, Math.max(0.3, impact / P.strongImpact));
  const repel = P.repel * sr * (same ? 1.3 : 0.8) * forca;
  // Recuo próprio pelo tipo (ataque se joga mais, defesa absorve), BEY_BEHAVIOR.md.
  // No crítico, o recuo do tipo e a defesa segurada do alvo quase não protegem.
  const recuo = (x, m, crit) => (crit ? Math.max(1, x.kind.recoil) * Math.max(0.8, m.knockIn) * CRITICAL.knock : x.kind.recoil * m.knockIn);
  let knockA = (1.3 - 0.6 * a.rko) * recuo(a, ma_, critB) * mb_.knockOut;
  let knockB = (1.3 - 0.6 * b.rko) * recuo(b, mb_, critA) * ma_.knockOut;
  if (critA) knockA *= CRITICAL.selfKnock;
  if (critB) knockB *= CRITICAL.selfKnock;
  // Teto físico do empurrão: a parte do impulso que cabe a cada um (j/m, conservação do momento) mais
  // um empurrão normal do giro. No crítico, o giro no ponto certo rende até CRITICAL.pushShare vezes essa
  // parte. Antes o crítico multiplicava tudo e jogava a defesa a ~3,5 m/s, mais rápido do que o ataque
  // chegou: energia do nada (achado do playtest, D-043).
  const giroMax = P.repel * sr * 1.3;
  const tetoA = (j / ma) * (critB ? CRITICAL.pushShare : 1) + giroMax;
  const tetoB = (j / mb) * (critA ? CRITICAL.pushShare : 1) + giroMax;
  const pushA = Math.min(tetoA, (j / ma + repel * (mb / tot) * 2) * knockA);
  const pushB = Math.min(tetoB, (j / mb + repel * (ma / tot) * 2) * knockB);
  // O choque inclina o eixo de quem foi empurrado, na direção do empurrão.
  inclinar(a, -nx, -ny, TILT.perHit * Math.min(1, pushA / P.maxSpeed));
  inclinar(b, nx, ny, TILT.perHit * Math.min(1, pushB / P.maxSpeed));
  a.vx -= nx * pushA;
  a.vy -= ny * pushA;
  b.vx += nx * pushB;
  b.vy += ny * pushB;

  const base = impact * P.hitDamage + P.contactDamage * sr;
  const sameMul = same ? 1 : 0.85;
  let dmgA = (base * (0.6 + 0.8 * b.atk)) / (0.6 + 0.8 * a.def) * mb_.dmgOut * ma_.dmgIn * sameMul;
  let dmgB = (base * (0.6 + 0.8 * a.atk)) / (0.6 + 0.8 * b.def) * ma_.dmgOut * mb_.dmgIn * sameMul;
  // Força do golpe (D-052): a parte da massa de quem bate e o giro dele (a velocidade já está no impacto).
  // O peso do giro é moderado: maior, ele virava bola de neve (quem perde giro primeiro bate cada vez
  // mais fraco e perde sempre), como o playtest mostrou.
  const forca_ = (x, mx) => (2 * mx / tot) * (0.75 + 0.25 * Math.max(0, x.spin));
  dmgB *= forca_(a, ma);
  dmgA *= forca_(b, mb);
  dmgA *= cA > 0 ? 1 + HIT_ANGLE.back * cA : 1 - HIT_ANGLE.front * -cA;
  dmgB *= cB > 0 ? 1 + HIT_ANGLE.back * cB : 1 - HIT_ANGLE.front * -cB;
  if (cA < 0 && cB < 0) {
    // De frente: as duas sentem parecido.
    const k = HIT_ANGLE.share * Math.min(-cA, -cB);
    const media = (dmgA + dmgB) / 2;
    dmgA += (media - dmgA) * k;
    dmgB += (media - dmgB) * k;
  }
  if (critB) dmgA *= CRITICAL.damage;
  if (critA) dmgB *= CRITICAL.damage;
  // Contato limpo no crítico: quem acertou sente menos o choque.
  if (critA) dmgA *= CRITICAL.selfDamage;
  if (critB) dmgB *= CRITICAL.selfDamage;
  // O escudo absorve o choque e perde vida pela força dele (crítico tira em dobro).
  if (a.guard) baterNoEscudo(state, a, impact, critB);
  if (b.guard) baterNoEscudo(state, b, impact, critA);
  for (const [quem, crit] of [[a, critA], [b, critB]]) {
    if (crit) state.events.push({ type: 'critical', slot: quem.slot, impact, x: a.x + nx * a.r, y: a.y + ny * a.r });
  }
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
    state.events.push({ type: 'hit', impact, x: a.x + nx * a.r, y: a.y + ny * a.r, nx, ny, empurrao: [pushA, pushB] });
  } else if (impact <= P.hitEventImpact && state.rubCd <= 0) {
    // Toque leve: sem estrondo, mas solta faísca (D-048).
    state.rubCd = P.rubSparkCooldown;
    state.events.push({ type: 'contato', x: a.x + nx * a.r, y: a.y + ny * a.r, nx, ny, forca: sr });
  }
}

function raspar(state, a, b, nx, ny, ma, mb, tot, ma_, mb_) {
  const h = DT / SUBSTEPS;
  const sr = (Math.max(0, a.spin) + Math.max(0, b.spin)) / 2;
  const same = a.dir === b.dir;
  // Empurrão do giro, dividido pela massa como no choque (a mais leve se afasta mais).
  const push = P.repel * sr * (same ? 1.3 : 0.8) * P.rubPush;
  a.vx -= nx * push * (mb / tot);
  a.vy -= ny * push * (mb / tot);
  b.vx += nx * push * (ma / tot);
  b.vy += ny * push * (ma / tot);
  const perda = P.rubDamage * sr * h;
  for (const [x, m] of [[a, ma_], [b, mb_]]) {
    if (x.state !== 'active') continue;
    if (x.guard) gastarEscudo(state, x, SHIELD.contactWear * h);
    else x.spin -= perda * m.dmgIn;
  }
  if (state.rubCd <= 0) {
    state.rubCd = P.rubSparkCooldown;
    state.events.push({ type: 'contato', x: a.x + nx * a.r, y: a.y + ny * a.r, nx, ny, forca: sr });
  }
}

function gastarEscudo(state, b, quanto) {
  b.shield -= quanto;
  if (b.shield > 0) return;
  b.shield = 0;
  b.shieldBroken = true;
  b.guard = false;
  b.guardCharge = 0;
  state.events.push({ type: 'shieldBreak', slot: b.slot, x: b.x, y: b.y });
}

function baterNoEscudo(state, b, impact, critico) {
  // Até perHit por pancada (duas fortes quebram); qualquer toque gasta um pouco (D-048).
  b.shield -= SHIELD.perHit * Math.max(0.06, Math.min(1, impact / P.strongImpact)) * (critico ? 2 : 1);
  if (b.shield > 0) return;
  b.shield = 0;
  b.shieldBroken = true;
  b.guard = false;
  b.guardCharge = 0;
  state.events.push({ type: 'shieldBreak', slot: b.slot, x: b.x, y: b.y });
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
    const { ringOut, saida } = state.regras;
    // Parede alta (sem ring out): bolso e borda viram parede.
    const pocket = ringOut && POCKETS.some((p) => angleDiff(ang, p) < POCKET_HALF_WIDTH);
    if (ringOut && ((pocket && vOut > P.pocketOutSpeed * saida) || vOut > P.rimOutSpeed * saida)) {
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

const FINISH_PRIORITY = { ringout: 2, spin: 1 };

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
  if (winner && !state.treino) state.wins[winner - 1]++;
  state.rounds.push({ winner, finish });
  if (state.wins[0] >= ROUNDS_TO_WIN) state.winner = 1;
  else if (state.wins[1] >= ROUNDS_TO_WIN) state.winner = 2;
  state.phase = 'roundOver';
  state.phaseTicks = 0;
  state.events.push({ type: 'roundEnd', winner, finish, wins: [...state.wins] });
}
