// IA da CPU (D-051). Pura e determinística: lê o estado da partida e devolve um InputFrame por tick,
// como um jogador com controle. Tem o próprio sorteio com semente (não mexe no da partida).
// Raciocínio: a cada "olhada" (o tempo de reação do nível) avalia a situação e escolhe uma intenção;
// entre olhadas, segue o plano. Cada decisão fica em `log` com o motivo, para o relatório CPU × CPU.
import { ARENA_RADIUS, DT, PHYSICS, POCKETS } from './constants.js';
import { launchPower } from './match.js';

const R = ARENA_RADIUS;

// Nível 1 (fácil) a 5 (difícil). reacao: segundos entre olhadas; precisao: chance de soltar ✕ no estalo
// (e não depois); mira: erro do direcional em radianos; ousadia: vontade de arriscar investidas;
// lancamento: força mínima que ela espera na barra antes de travar.
export const NIVEIS = {
  1: { reacao: 0.45, precisao: 0.15, mira: 0.6, ousadia: 0.35, defesa: 0.3, lancamento: 0.45 },
  2: { reacao: 0.35, precisao: 0.3, mira: 0.45, ousadia: 0.5, defesa: 0.45, lancamento: 0.6 },
  3: { reacao: 0.25, precisao: 0.5, mira: 0.3, ousadia: 0.6, defesa: 0.6, lancamento: 0.72 },
  4: { reacao: 0.18, precisao: 0.7, mira: 0.18, ousadia: 0.7, defesa: 0.75, lancamento: 0.82 },
  5: { reacao: 0.12, precisao: 0.88, mira: 0.08, ousadia: 0.8, defesa: 0.9, lancamento: 0.9 },
};

function sorteio(seed) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VAZIO = { attack: false, defend: false, jump: false, dodge: false };
const frame = (held = {}, move = { x: 0, y: 0 }, pressed = {}) => ({ move, held: { ...VAZIO, ...held }, pressed });
const norm = (x, y) => {
  const m = Math.hypot(x, y) || 1;
  return { x: x / m, y: y / m };
};

export function createCpu({ slot, nivel = 3, seed = 1 }) {
  const n = NIVEIS[Math.min(5, Math.max(1, Math.round(nivel)))];
  const rnd = sorteio(seed * 7919 + slot);
  const log = [];
  let proximaOlhada = 0;
  let intencao = 'orbitar';
  let plano = [];
  let alvoLancamento = n.lancamento + rnd() * (1 - n.lancamento) * 0.5;
  let soltarNoEstalo = false;
  let cargaSemEstalo = 0.8;
  let lancou = false;

  const decidir = (t, nova, motivo) => {
    if (nova !== intencao) log.push({ t: Math.round(t * 100) / 100, intencao: nova, motivo });
    intencao = nova;
  };

  function pensar(state) {
    const eu = state.beys[slot];
    const ele = state.beys[1 - slot];
    const t = state.tick * DT;

    // Lançamento: trava a barra quando ela passar da força que esta CPU espera (nível + sorte).
    if (state.phase === 'launch') {
      if (state.phaseTicks <= 1) {
        lancou = false;
        alvoLancamento = n.lancamento + rnd() * (1 - n.lancamento) * 0.5;
      }
      if (!lancou && launchPower(state, slot) >= alvoLancamento) {
        lancou = true;
        log.push({ t: Math.round(t * 100) / 100, intencao: 'lancar', motivo: `barra em ${Math.round(alvoLancamento * 100)}%` });
        return frame({ attack: true }, undefined, { attack: true });
      }
      return frame();
    }
    if (state.phase !== 'battle' || eu.state !== 'active') return frame();

    // Plano em andamento (apertos de mais de um tick: combos, toque de pulo e esquiva).
    if (plano.length) return plano.shift();

    const dx = ele.x - eu.x;
    const dy = ele.y - eu.y;
    const dist = Math.hypot(dx, dy);
    const ameaca = ele.state === 'active' && (ele.attackCharge > 0.6 || ele.critReady > 0) && dist < 260;
    // O alvo está entre mim e a borda? Então uma investida agora empurra para fora (crítico possível).
    const rAlvo = Math.hypot(ele.x, ele.y) || 1;
    const paraFora = (dx * ele.x + dy * ele.y) / ((dist || 1) * rAlvo);

    if (t >= proximaOlhada) {
      proximaOlhada = t + n.reacao * (0.7 + 0.6 * rnd());

      // Fera bit: barra cheia, no melhor momento do tipo.
      if (eu.special >= 1 && !eu.effects.some((e) => e.fx === 'fera')) {
        const bom = eu.tipo === 'attack' ? dist < 220 : eu.tipo === 'stamina' ? eu.spin < 0.55 : eu.tipo === 'defense' ? ameaca || eu.spin < 0.5 : dist < 260;
        if (bom || rnd() < 0.05) {
          decidir(t, 'fera', eu.tipo === 'attack' ? 'barra cheia e o oponente perto' : 'barra cheia no momento do tipo');
          plano = [frame({ jump: true, dodge: true }), frame({ jump: true, dodge: true }), frame()];
          return plano.shift();
        }
      }
      // Engine Gear: uma vez por rodada, quando o giro começa a cair ou para fechar uma luta.
      if (eu.engineGear && !eu.egUsed && (eu.spin < 0.6 || (ele.spin < 0.35 && rnd() < n.ousadia))) {
        decidir(t, 'engine-gear', eu.spin < 0.6 ? 'giro abaixo de 60%' : 'oponente fraco, acelerar para fechar');
        plano = [frame({ attack: true, defend: true }), frame({ attack: true, defend: true }), frame()];
        return plano.shift();
      }
      // Defesa: alguém vem com investida carregada e o escudo aguenta.
      if (ameaca && eu.shield > 0.3 && !eu.shieldBroken && rnd() < n.defesa) {
        decidir(t, 'defender', `investida do oponente a ${Math.round(dist)} mm, escudo em ${Math.round(eu.shield * 100)}%`);
      } else if (ameaca && (eu.shieldBroken || eu.shield <= 0.3) && eu.dodgeCd <= 0 && rnd() < n.defesa) {
        decidir(t, 'esquivar', 'investida chegando e escudo quebrado');
        plano = [frame({ dodge: true }, norm(-dy, dx)), frame()];
        return plano.shift();
      } else if (eu.tipo === 'stamina' && dist < 120 && eu.dodgeCd <= 0 && rnd() < 0.5 * n.defesa) {
        decidir(t, 'esquivar', 'resistência foge do contato');
        plano = [frame({ dodge: true }, norm(-dy, dx)), frame()];
        return plano.shift();
      } else if (eu.dashCd <= 0 && (eu.tipo === 'attack' || eu.tipo === 'balance' || rnd() < 0.3 * n.ousadia) && dist < 330 && ele.state === 'active') {
        // Investida: carrega; solta no estalo se a precisão do nível deixar, e de preferência para fora.
        soltarNoEstalo = rnd() < n.precisao && paraFora > 0.2;
        cargaSemEstalo = 0.55 + 0.4 * rnd();
        decidir(t, 'carregar', soltarNoEstalo ? 'oponente perto e entre mim e a borda: mirar o crítico' : 'oponente perto: investida');
      } else if (intencao === 'defender' && !ameaca) {
        decidir(t, 'orbitar', 'ameaça passou');
      } else if (intencao !== 'carregar') {
        decidir(t, eu.tipo === 'attack' ? 'rondar' : 'segurar-centro', eu.tipo === 'attack' ? 'correr pela borda esperando a chance' : 'ficar no fundo da tigela');
      }
    }

    // Execução da intenção atual.
    if (intencao === 'defender') {
      // Não deixa o escudo quebrar: abaixa antes (quebrado, ele demora a voltar).
      if (eu.shield < 0.35 || eu.shieldBroken) {
        decidir(t, 'orbitar', `escudo em ${Math.round(eu.shield * 100)}%: poupar`);
        return frame();
      }
      return frame({ defend: true }, norm(-eu.x, -eu.y));
    }
    if (intencao === 'carregar') {
      const cheia = eu.attackCharge >= 1;
      // Sem mirar o crítico, solta antes de encher (como quem não espera o estalo); mirando, no estalo.
      const solta = soltarNoEstalo ? cheia && eu.perfectWindow > 0 && eu.perfectWindow < 0.06 : eu.attackCharge >= cargaSemEstalo;
      // Desiste se o oponente foi para longe antes de a carga encher.
      if (!cheia && dist > 420) {
        decidir(t, 'orbitar', 'oponente fugiu antes da carga');
        return frame();
      }
      if (solta) {
        decidir(t, 'investir', soltarNoEstalo ? 'soltou no estalo' : 'carga cheia');
        intencao = 'orbitar';
        const erro = (rnd() - 0.5) * 2 * n.mira;
        const a = Math.atan2(dy, dx) + erro;
        return frame({}, { x: Math.cos(a) * 0.3, y: Math.sin(a) * 0.3 });
      }
      // Enquanto carrega, se posiciona por dentro do oponente (para o empurrão sair para fora).
      const atras = norm(eu.x - ele.x * 0.6, eu.y - ele.y * 0.6);
      return frame({ attack: true }, { x: -atras.x * 0.4, y: -atras.y * 0.4 });
    }
    if (intencao === 'rondar') {
      // Ataque: sobe a rampa e corre em volta, perto da borda, longe dos bolsos.
      const r = Math.hypot(eu.x, eu.y) || 1;
      const ang = Math.atan2(eu.y, eu.x);
      const perigo = POCKETS.some((p) => Math.abs(Math.atan2(Math.sin(ang - p), Math.cos(ang - p))) < 0.4) && r > 0.8 * R;
      const tang = norm(-eu.y * eu.dir, eu.x * eu.dir);
      const radial = r < 0.65 * R ? 0.5 : perigo || r > 0.85 * R ? -0.6 : 0;
      return frame({}, { x: tang.x * 0.5 + (eu.x / r) * radial, y: tang.y * 0.5 + (eu.y / r) * radial });
    }
    // Defesa, resistência e equilíbrio: volta para o fundo, onde a tigela segura a bey.
    const r = Math.hypot(eu.x, eu.y);
    if (r > 0.25 * R) {
      const c = norm(-eu.x, -eu.y);
      return frame({}, { x: c.x * 0.6, y: c.y * 0.6 });
    }
    return frame();
  }

  return { slot, nivel, pensar, log, get intencao() { return intencao; } };
}

export const NIVEL_PADRAO = 3;
export const _internos = { PHYSICS };
