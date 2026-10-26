// `npm run playtest`: joga partidas automáticas e confere a física e o equilíbrio (docs/PLAYTEST.md).
// Não substitui jogar de verdade; acha cedo o que quebra: bey atravessando a outra ou a parede,
// velocidade absurda, giro fora de 0–1, um tipo que nunca vence, rodada curta ou longa demais.
// Uso: node scripts/playtest.js [partidas por confronto, padrão 20]
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createMatch, stepMatch, NEUTRAL_INPUT } from '../src/sim/match.js';
import * as K from '../src/sim/constants.js';
import { CENARIOS, regrasDe } from '../src/content/cenarios.js';

const root = path.join(import.meta.dirname, '..');
const beys = JSON.parse(readFileSync(path.join(root, 'src/content/beys.generated.json'), 'utf8'));
const { ARENA_RADIUS, DT, PHYSICS } = K;
const N = Number(process.argv[2] ?? 20);
// TUNE='{"PHYSICS":{"hitDamage":0.00005}}' testa valores sem mexer no código (as tabelas são objetos).
for (const [tabela, valores] of Object.entries(JSON.parse(process.env.TUNE || '{}'))) Object.assign(K[tabela], valores);
const input = (o = {}) => ({ move: { x: 0, y: 0 }, held: {}, pressed: {}, ...o });

// Jogadores roteirizados. "nada": só lança. "afobado": investe a cada 1,5 s sem esperar a carga.
// "preciso": solta ✕ no estalo da carga cheia e só com o alvo perto (o melhor que dá para jogar).
const JOGADORES = {
  nada: () => NEUTRAL_INPUT,
  // Um dos dois fica meio ciclo defasado (dois roteiros idênticos no mesmo tick empatam para sempre).
  // Quem fica defasado alterna a cada partida: senão o resultado mede só quem investe por último.
  afobado: (s, eu, ciclo, defasado) => input({ held: { attack: (ciclo + (eu === defasado ? 45 : 0)) % 90 < 36 } }),
  preciso: (s, eu) => {
    const [a, d] = eu === 0 ? s.beys : [s.beys[1], s.beys[0]];
    const perto = Math.hypot(d.x - a.x, d.y - a.y) < 230;
    const solta = a.attackCharge >= 1 && (a.perfectWindow > 0 ? perto : true);
    return input({ held: { attack: !solta && a.dashCd <= 0 } });
  },
};

// Invariantes físicas conferidas a cada tick; cada violação é contada com um exemplo.
function conferir(s, falhas) {
  const [a, b] = s.beys;
  for (const x of s.beys) {
    const r = Math.hypot(x.x, x.y);
    const v = Math.hypot(x.vx, x.vy);
    if (!Number.isFinite(x.x + x.y + x.vx + x.vy + x.spin)) falhas.nan.push(s.tick);
    if (x.state === 'active' && r > ARENA_RADIUS - x.r + 1) falhas.fora.push(`${r.toFixed(1)} mm`);
    if (x.spin < -1e-9 || x.spin > 1 + 1e-9) falhas.giro.push(x.spin.toFixed(3));
    // Pancada crítica e a investida do especial passam do teto por um instante (decaem rápido);
    // acima de 2,5× é velocidade absurda.
    if (v > PHYSICS.maxSpeed * 2.5) falhas.velocidade.push(`${v.toFixed(0)} mm/s`);
  }
  const ativas = a.state === 'active' && b.state === 'active' && a.air <= 0 && b.air <= 0;
  if (ativas) {
    const sobra = a.r + b.r - Math.hypot(a.x - b.x, a.y - b.y);
    // Um pouco de sobreposição entre subpassos é normal; mais que 15% do raio é atravessar.
    if (sobra > 0.15 * Math.min(a.r, b.r)) falhas.atravessou.push(`${sobra.toFixed(1)} mm`);
  }
}

function partida({ p1, p2, j1, j2, seed, regras, defasado = 1 }) {
  const s = createMatch({ beys: [beys[p1], beys[p2]], seed, regras });
  const falhas = { nan: [], fora: [], giro: [], velocidade: [], atravessou: [] };
  const rodadas = [];
  let t0 = 0;
  let ciclo = 0;
  let criticos = 0;
  while (s.phase !== 'matchOver' && s.tick < 60 * 600) {
    let comandos = [NEUTRAL_INPUT, NEUTRAL_INPUT];
    if (s.phase === 'launch') {
      const trava = input({ held: { attack: s.phaseTicks === 40 } });
      comandos = [trava, trava];
    } else if (s.phase === 'battle') {
      ciclo++;
      comandos = [JOGADORES[j1](s, 0, ciclo, defasado), JOGADORES[j2](s, 1, ciclo, defasado)];
    }
    stepMatch(s, comandos);
    conferir(s, falhas);
    for (const e of s.events) {
      if (e.type === 'roundStart') t0 = s.tick;
      if (e.type === 'critical') criticos++;
      if (e.type === 'finish') rodadas.push({ vencedor: e.winner, fim: e.finish, segundos: (s.tick - t0) * DT });
    }
  }
  return { vencedor: s.winner, rodadas, falhas, criticos };
}

function confronto(rotulo, opcoes) {
  const r = { vitorias: [0, 0], rodadas: 0, segundos: 0, criticos: 0, fins: {}, falhas: {} };
  for (let i = 0; i < N; i++) {
    const p = partida({ ...opcoes, seed: 1000 + i * 7919, defasado: i % 2 });
    if (p.vencedor) r.vitorias[p.vencedor - 1]++;
    r.criticos += p.criticos;
    for (const x of p.rodadas) {
      r.rodadas++;
      r.segundos += x.segundos;
      r.fins[x.fim] = (r.fins[x.fim] ?? 0) + 1;
    }
    for (const [k, lista] of Object.entries(p.falhas)) if (lista.length) (r.falhas[k] ??= []).push(lista[0]);
  }
  r.media = r.rodadas ? r.segundos / r.rodadas : 0;
  console.log(
    `${rotulo.padEnd(46)} P1 ${String(r.vitorias[0]).padStart(2)}/${N}  rodada ${r.media.toFixed(1).padStart(5)} s  críticos ${String(r.criticos).padStart(3)}  ${JSON.stringify(r.fins)}`,
  );
  return r;
}

const resultados = [];
const espera = (nome, ok, detalhe) => resultados.push({ nome, ok, detalhe });

console.log(`Playtest: ${N} partidas por confronto\n`);
const atkDefPreciso = confronto('ataque (preciso) × defesa (nada)', { p1: 'dragoon-g', p2: 'draciel-g', j1: 'preciso', j2: 'nada' });
const atkDefAfobado = confronto('ataque (afobado) × defesa (nada)', { p1: 'dragoon-g', p2: 'draciel-g', j1: 'afobado', j2: 'nada' });
const atkDefParado = confronto('ataque (nada) × defesa (nada)', { p1: 'dragoon-g', p2: 'draciel-g', j1: 'nada', j2: 'nada' });
const espelho = confronto('equilíbrio × equilíbrio (afobado × afobado)', { p1: 'dranzer-g', p2: 'dranzer-g', j1: 'afobado', j2: 'afobado' });
const porCenario = CENARIOS.map((c) =>
  confronto(`cenário ${c.slug}`, { p1: 'dragoon-g', p2: 'draciel-g', j1: 'preciso', j2: 'nada', regras: regrasDe(c) }),
);

// Expectativas de jogo e de física. Faixas largas: o objetivo é achar o que fugiu muito do esperado.
const taxa = (r) => r.vitorias[0] / N;
espera('ataque precisa jogar muito bem para vencer a defesa', taxa(atkDefAfobado) <= 0.15, `afobado vence ${(taxa(atkDefAfobado) * 100).toFixed(0)}%`);
espera('ataque bem jogado consegue vencer a defesa', taxa(atkDefPreciso) >= 0.25 && taxa(atkDefPreciso) <= 0.8, `preciso vence ${(taxa(atkDefPreciso) * 100).toFixed(0)}%`);
espera('parada, a defesa dura mais que a ataque', taxa(atkDefParado) <= 0.1, `ataque parada vence ${(taxa(atkDefParado) * 100).toFixed(0)}%`);
espera('espelho fica perto de 50%', Math.abs(taxa(espelho) - 0.5) <= 0.3, `P1 vence ${(taxa(espelho) * 100).toFixed(0)}%`);
espera('rodada com investidas dura 12–45 s', atkDefAfobado.media >= 12 && atkDefAfobado.media <= 45, `${atkDefAfobado.media.toFixed(1)} s`);
espera('rodada sem investidas dura 35 s ou mais', atkDefParado.media >= 35, `${atkDefParado.media.toFixed(1)} s`);
for (const r of [atkDefPreciso, atkDefAfobado, atkDefParado, espelho, ...porCenario]) {
  for (const [k, ex] of Object.entries(r.falhas)) espera(`invariante física: ${k}`, false, `ex.: ${ex[0]}`);
}

console.log('');
let ruins = 0;
for (const r of resultados) {
  if (!r.ok) ruins++;
  console.log(`${r.ok ? 'ok  ' : 'FALHA'} ${r.nome} (${r.detalhe})`);
}
console.log(ruins ? `\n${ruins} expectativa(s) fora do esperado: investigue, corrija e trave com um teste de regressão.` : '\nTudo dentro do esperado.');
process.exitCode = ruins ? 1 : 0;
