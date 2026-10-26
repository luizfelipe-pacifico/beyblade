// `npm run cpu:duelo`: duas CPUs batalham só por comando, para testar a IA (D-051). Não aparece no
// jogo. Joga as partidas sem tela e imprime o que cada CPU fez e pontos de melhoria.
// Uso: node scripts/cpu-duelo.js [--p1 dragoon-g] [--p2 draciel-g] [--n1 3] [--n2 3] [--partidas 10]
//      [--arena <slug do cenário>] [--log] (o --log imprime o raciocínio da primeira partida)
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { createMatch, stepMatch } from '../src/sim/match.js';
import * as K from '../src/sim/constants.js';
import { createCpu } from '../src/sim/ai.js';
import { cenario, regrasDe } from '../src/content/cenarios.js';

const { values: op } = parseArgs({
  options: {
    p1: { type: 'string', default: 'dragoon-g' },
    p2: { type: 'string', default: 'draciel-g' },
    n1: { type: 'string', default: '3' },
    n2: { type: 'string', default: '3' },
    partidas: { type: 'string', default: '10' },
    arena: { type: 'string' },
    log: { type: 'boolean', default: false },
  },
});

const beys = JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'src/content/beys.generated.json'), 'utf8'));
for (const id of [op.p1, op.p2]) if (!beys[id]) throw new Error(`bey desconhecida: ${id} (veja src/content/beys.generated.json)`);
const { DT } = K;
// TUNE='{"PHYSICS":{...}}' testa valores sem mexer no código.
for (const [tabela, valores] of Object.entries(JSON.parse(process.env.TUNE || '{}'))) Object.assign(K[tabela], valores);
const N = Number(op.partidas);
const niveis = [Number(op.n1), Number(op.n2)];
const regras = op.arena ? regrasDe(cenario(op.arena)) : undefined;

const total = {
  vitorias: [0, 0],
  fins: {},
  rodadas: 0,
  segundos: 0,
  eventos: [{}, {}],
  intencoes: [{}, {}],
  giroNoFim: [[], []],
};
const contar = (obj, k, v = 1) => (obj[k] = (obj[k] ?? 0) + v);

for (let i = 0; i < N; i++) {
  const seed = 2000 + i * 104729;
  const s = createMatch({ beys: [beys[op.p1], beys[op.p2]], seed, regras });
  const cpus = [0, 1].map((slot) => createCpu({ slot, nivel: niveis[slot], seed: seed + slot }));
  let t0 = 0;
  while (s.phase !== 'matchOver' && s.tick < 60 * 600) {
    const comandos = cpus.map((c) => c.pensar(s));
    stepMatch(s, comandos);
    if (s.phase === 'battle') for (const c of cpus) contar(total.intencoes[c.slot], c.intencao, DT);
    for (const e of s.events) {
      if (e.slot !== undefined && ['critical', 'special', 'engineGear', 'shieldBreak', 'attack', 'dodge', 'jump'].includes(e.type)) {
        contar(total.eventos[e.slot], e.type);
        if (e.type === 'attack' && e.perfeita) contar(total.eventos[e.slot], 'investidaPerfeita');
      }
      if (e.type === 'roundStart') t0 = s.tick;
      if (e.type === 'finish') {
        total.rodadas++;
        total.segundos += (s.tick - t0) * DT;
        contar(total.fins, `${e.winner ? `P${e.winner}` : 'ninguém'} por ${e.finish}`);
        s.beys.forEach((b, k) => total.giroNoFim[k].push(Math.max(0, b.spin)));
      }
    }
  }
  if (s.winner) total.vitorias[s.winner - 1]++;
  if (op.log && i === 0) {
    for (const c of cpus) {
      console.log(`\nRaciocínio da CPU ${c.slot + 1} (nível ${c.nivel}), partida 1:`);
      for (const l of c.log.slice(0, 60)) console.log(`  ${l.t.toFixed(2).padStart(7)} s  ${l.intencao.padEnd(15)} ${l.motivo}`);
      if (c.log.length > 60) console.log(`  … mais ${c.log.length - 60} decisões`);
    }
  }
}

const media = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
console.log(`\nCPU × CPU: ${op.p1} (nível ${niveis[0]}) × ${op.p2} (nível ${niveis[1]})${op.arena ? ` em ${op.arena}` : ''}, ${N} partidas`);
console.log(`Vitórias: P1 ${total.vitorias[0]} · P2 ${total.vitorias[1]} · rodada média ${(total.segundos / Math.max(1, total.rodadas)).toFixed(1)} s`);
console.log(`Finais: ${JSON.stringify(total.fins)}`);
const melhorias = [];
for (const k of [0, 1]) {
  const ev = total.eventos[k];
  const tempo = Object.values(total.intencoes[k]).reduce((a, b) => a + b, 0) || 1;
  const fatias = Object.entries(total.intencoes[k])
    .sort((a, b) => b[1] - a[1])
    .map(([nome, s]) => `${nome} ${Math.round((s / tempo) * 100)}%`)
    .join(', ');
  console.log(`\nCPU ${k + 1}: ${fatias}`);
  console.log(`  investidas ${ev.attack ?? 0} (perfeitas ${ev.investidaPerfeita ?? 0}), críticos ${ev.critical ?? 0}, fera ${ev.special ?? 0}, engine gear ${ev.engineGear ?? 0}, esquivas ${ev.dodge ?? 0}, escudo quebrado ${ev.shieldBreak ?? 0}; giro no fim da rodada ${Math.round(media(total.giroNoFim[k]) * 100)}%`);
  // Pontos de melhoria: comportamentos que um jogador bom não teria.
  if (!ev.special) melhorias.push(`CPU ${k + 1} nunca soltou a fera bit.`);
  if ((ev.attack ?? 0) > 0 && (ev.investidaPerfeita ?? 0) / ev.attack < 0.05 && niveis[k] >= 4) melhorias.push(`CPU ${k + 1} (nível ${niveis[k]}) quase nunca solta no estalo.`);
  if ((ev.shieldBreak ?? 0) > N) melhorias.push(`CPU ${k + 1} deixa o escudo quebrar demais (${ev.shieldBreak}).`);
  if ((total.intencoes[k].defender ?? 0) / tempo > 0.5) melhorias.push(`CPU ${k + 1} passa mais da metade do tempo defendendo.`);
}
if (total.rodadas && total.segundos / total.rodadas < 10) melhorias.push('Rodadas curtas demais (< 10 s).');
if (Math.abs(total.vitorias[0] - total.vitorias[1]) === N && niveis[0] === niveis[1] && op.p1 === op.p2) melhorias.push('Espelho com um lado vencendo sempre.');
console.log(`\nPontos de melhoria: ${melhorias.length ? `\n- ${melhorias.join('\n- ')}` : 'nenhum óbvio nesta amostra.'}`);
