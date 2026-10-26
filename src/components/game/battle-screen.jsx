'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from 'cn';
import beys from '@/content/beys.generated.json';
import { roster, beySprite } from '@/content/roster';
import { createMatch, launchPower, NEUTRAL_INPUT, stepMatch } from '@/sim/match';
import { DT, FINISHES, PHYSICS, ROUND_SECONDS, ROUNDS_TO_WIN } from '@/sim/constants';
import { InputManager } from '@/input/manager';
import { ArenaRenderer } from '@/render/arena-renderer';
import { BATALHA, createSounds } from '@/audio/sounds';
import { tocarMusica } from '@/audio/music';
import { Button } from '@/components/ui/button';
import { Announcement } from './announcement';
import { FeraField } from './fera-field';
import { GaugeBar } from './gauge-bar';
import { RoundRow } from './round-row';
import { TitleCard } from './title-card';
import { ControlHint } from './pad-glyph';

const MAX_FRAME = 0.25;
const HUD_INTERVAL = 0.1;
const RESULT_LOCK_MS = 900;

function hudSnapshot(state) {
  return {
    phase: state.phase,
    round: state.round,
    wins: [...state.wins],
    rounds: [...state.rounds],
    beys: state.beys.map((b) => ({ spin: Math.max(0, b.spin), special: b.special, state: b.state, engineGear: b.engineGear, egUsed: b.egUsed })),
    launch: [launchPower(state, 0), launchPower(state, 1)],
    restante: state.phase === 'battle' ? Math.max(0, Math.ceil(ROUND_SECONDS - state.phaseTicks * DT)) : ROUND_SECONDS,
  };
}

// Personagem do roster com a bey escolhida (b1/b2 = id em beys.generated.json). Só vale bey do próprio
// personagem; qualquer outra coisa cai na bey padrão dele.
function comBey(personagem, beyId) {
  const escolhida = beyId && beys[beyId]?.dono === personagem.slug ? beys[beyId] : null;
  const def = escolhida ?? beys[personagem.beySlug];
  return { ...personagem, beySlug: def.id ?? personagem.beySlug, bey: def.nome, sprite: def.sprite ?? beySprite(personagem.beySlug) };
}

// modo (D-035): versus | cpu | arcade | treino. Fora do versus o P2 é da máquina (a IA ainda não
// existe: fica neutro); cpuNivel fica guardado no estado para ela.
export function BattleScreen({ p1, p2, b1, b2, cpu = false, modo = 'versus', etapa = 1, cpuNivel = 1 }) {
  const router = useRouter();
  const treino = modo === 'treino';
  const arcade = modo === 'arcade';
  const p2Maquina = cpu || modo !== 'versus';
  const sair = () => router.push(arcade ? `/arcade?etapa=${etapa}` : '/personagens');
  const paraArcade = (winner) => router.push(`/arcade?etapa=${etapa}&resultado=${winner === 1 ? 'vitoria' : 'derrota'}`);
  const personagens = [
    comBey(roster.find((r) => r.slug === p1) ?? roster[0], b1),
    comBey(roster.find((r) => r.slug === p2) ?? roster[1], b2),
  ];
  const canvasRef = useRef(null);
  const [partida, setPartida] = useState(0);
  const [hud, setHud] = useState(null);
  const [anuncio, setAnuncio] = useState(null);
  const [pausado, setPausado] = useState(false);
  const [fim, setFim] = useState(null);
  const [salvo, setSalvo] = useState(null);
  // O loop e os botões da pausa leem o mesmo valor: o estado do React sozinho não chega ao loop.
  const pausaRef = useRef(false);
  const definirPausa = (v) => {
    pausaRef.current = v;
    setPausado(v);
  };

  useEffect(() => {
    const defs = personagens.map((p) => beys[p.beySlug]);
    const state = createMatch({ beys: defs, seed: Date.now() >>> 0, treino });
    state.cpuNivel = cpuNivel;
    const renderer = new ArenaRenderer(canvasRef.current, personagens.map((p) => p.sprite));
    const input = new InputManager();
    const sons = createSounds({
      ...BATALHA,
      ...Object.fromEntries(personagens.map((p, i) => [`especial${i}`, p.arteFera ? `/audio/feras/${p.arteFera}/ataque.wav` : BATALHA.choqueForte])),
    });
    tocarMusica('batalha');
    const inicio = performance.now();
    let prev = state.beys.map((b) => ({ x: b.x, y: b.y, angle: b.angle }));
    let acc = 0;
    let last = performance.now();
    let hudTimer = HUD_INTERVAL;
    let raf = 0;
    pausaRef.current = false;
    let fimEm = 0;
    let anuncioTimer = 0;

    const mostrar = (titulo, sub, ms = 1200) => {
      clearTimeout(anuncioTimer);
      setAnuncio({ titulo, sub, id: performance.now() });
      anuncioTimer = setTimeout(() => setAnuncio(null), ms);
    };
    const vibrar = (forca, ms) => [0, 1].forEach((slot) => input.rumble(slot, forca, forca * 0.6, ms));

    function onEvent(e) {
      const nome = (w) => personagens[w - 1].nome;
      switch (e.type) {
        case 'roundStart':
          // 1 a 1 no placar: entra a versão mais tensa do tema de batalha.
          tocarMusica(state.wins[0] === 1 && state.wins[1] === 1 ? 'decisiva' : 'batalha');
          break;
        case 'countdown':
          if (e.n === 3) sons.play('contagem', 0.8);
          mostrar(String(e.n), 'Aperte o botão X (F / K) com a barra no topo', 900);
          break;
        case 'go':
          sons.play('lancamento');
          vibrar(0.6, 250);
          mostrar('Let it rip!', null, 900);
          break;
        case 'chargeFull':
          renderer.flash(e.slot);
          input.rumble(e.slot, 0.6, 0.3, 90);
          break;
        case 'attack':
          input.rumble(e.slot, 0.2 + 0.4 * e.charge, 0.5, 80);
          break;
        case 'jump':
        case 'dodge':
          input.rumble(e.slot, 0.15, 0.35, 60);
          break;
        case 'engineGear':
          sons.play('lancamento', 0.7);
          input.rumble(e.slot, 0.7, 0.7, 250);
          mostrar('Engine Gear!', `${personagens[e.slot].bey} acelera`, 1100);
          break;
        case 'perfect':
          mostrar('Lançamento perfeito!', `${personagens[e.slot].nome} entra com giro máximo`, 1100);
          break;
        case 'hit': {
          const forca = Math.min(1, e.impact / PHYSICS.maxImpact);
          renderer.spawnSparks(e.x, e.y, e.nx, e.ny, e.impact);
          sons.play(e.impact > PHYSICS.strongImpact ? 'choqueForte' : 'choqueLeve', 0.4 + 0.6 * forca);
          vibrar(forca, 60 + 120 * forca);
          break;
        }
        case 'wall':
          renderer.spawnSparks(e.x, e.y, -e.x, -e.y, e.impact * 0.5);
          break;
        case 'special':
          sons.play(`especial${e.slot}`);
          input.rumble(e.slot, 0.8, 0.8, 300);
          mostrar(e.nome, `Especial de ${personagens[e.slot].nome}`, 1400);
          break;
        case 'burst':
          sons.play('choqueForte');
          renderer.spawnSparks(e.x, e.y, 1, 0, 900);
          break;
        case 'ringout':
          sons.play('ringOut');
          break;
        case 'finish':
          if (e.finish === 'spin') sons.play('parada');
          if (e.winner) input.rumble(e.winner === 1 ? 1 : 0, 1, 1, 450);
          mostrar(`${FINISHES[e.finish]}!`, e.winner ? `P${e.winner} · ${nome(e.winner)} vence a rodada` : 'Ninguém vence a rodada', 2600);
          break;
        case 'matchEnd':
          fimEm = performance.now();
          setFim({ winner: e.winner, wins: e.wins, rounds: [...state.rounds] });
          salvar(state, performance.now() - inicio);
          break;
        default:
          break;
      }
    }

    async function salvar(s, durationMs) {
      const body = {
        p1: { name: personagens[0].nome, bey: personagens[0].beySlug.split('@')[0], score: s.wins[0] },
        p2: { name: personagens[1].nome, bey: personagens[1].beySlug.split('@')[0], score: s.wins[1] },
        winner: s.winner,
        targetPoints: ROUNDS_TO_WIN,
        durationMs: Math.round(durationMs),
        rounds: s.rounds.map((r) => ({ winner: r.winner, finish: r.finish, points: r.winner ? 1 : 0 })),
      };
      try {
        const res = await fetch('/api/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        setSalvo(res.ok ? 'Partida salva no histórico.' : 'A partida não entrou no histórico desta vez.');
      } catch {
        setSalvo('A partida não entrou no histórico desta vez.');
      }
    }

    function frame(now) {
      const dtReal = Math.min(MAX_FRAME, (now - last) / 1000);
      last = now;
      // Input lido uma vez por frame; as bordas (pressed) valem só no primeiro tick do frame.
      const frames = input.poll();
      const any = (acao) => frames.some((f) => f.pressed[acao]);

      if (state.phase === 'matchOver') {
        if (now - fimEm > RESULT_LOCK_MS) {
          // Arcade: o resultado volta para a escada, que decide a próxima luta.
          if (arcade) {
            if (any('confirm')) paraArcade(state.winner);
          } else if (any('confirm')) setPartida((n) => n + 1);
          else if (any('back')) router.push('/personagens');
        }
      } else if (pausaRef.current) {
        if (any('pause') || any('confirm')) definirPausa(false);
        else if (treino && any('jump')) setPartida((n) => n + 1);
        else if (any('back')) sair();
      } else if (any('pause')) {
        definirPausa(true);
      }

      if (!pausaRef.current) {
        acc += dtReal;
        let primeiro = true;
        while (acc >= DT) {
          prev = state.beys.map((b) => ({ x: b.x, y: b.y, angle: b.angle }));
          // CPU (cpu=2): a IA ainda não existe (ROADMAP M3); até lá o P2 só lança e gira.
          const comandos = p2Maquina ? [frames[0], NEUTRAL_INPUT] : frames;
          stepMatch(state, primeiro ? comandos : comandos.map((f) => ({ ...f, pressed: {} })));
          primeiro = false;
          acc -= DT;
          for (const e of state.events) onEvent(e);
        }
      }
      const parado = pausaRef.current;
      renderer.draw({ beys: prev }, state, parado ? 1 : acc / DT, parado ? 0 : dtReal);
      hudTimer += dtReal;
      if (hudTimer >= HUD_INTERVAL) {
        hudTimer = 0;
        setHud(hudSnapshot(state));
      }
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => renderer.resize());
    ro.observe(canvasRef.current);
    // Janela sem foco pausa a partida (ARCHITECTURE.md §3).
    const onBlur = () => ['launch', 'battle', 'finishing'].includes(state.phase) && definirPausa(true);
    window.addEventListener('blur', onBlur);
    setFim(null);
    setSalvo(null);
    setPausado(false);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(anuncioTimer);
      ro.disconnect();
      window.removeEventListener('blur', onBlur);
      input.dispose();
      sons.stopAll();
    };
    // Uma partida nova a cada revanche ou troca de dupla.
  }, [partida, p1, p2, b1, b2, cpu, modo, etapa, cpuNivel]);

  return (
    // Painéis nas laterais: a arena (redonda) usa a altura inteira da janela, que é a dimensão menor.
    <div className="grid h-[calc(100dvh-3.5rem)] grid-cols-[17rem_1fr_17rem]">
      <aside className="flex min-h-0 flex-col justify-between gap-6 overflow-y-auto bg-tinta p-5" aria-label="Jogador 1">
        <Painel i={0} personagens={personagens} hud={hud} />
        <Comandos />
      </aside>
      <div className="relative min-h-0">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Arena da batalha" role="img" />
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          {anuncio ? <Announcement key={anuncio.id} titulo={anuncio.titulo} sub={anuncio.sub} /> : null}
        </div>
        {pausado && !fim ? (
          <Pausa
            onContinuar={() => definirPausa(false)}
            onReiniciar={treino ? () => setPartida((n) => n + 1) : null}
            onSair={sair}
            sairRotulo={arcade ? 'Voltar para o arcade' : 'Voltar para personagens'}
          />
        ) : null}
        {fim ? (
          <Resultado
            personagens={personagens}
            fim={fim}
            salvo={salvo}
            arcade={arcade}
            onArcade={() => paraArcade(fim.winner)}
            onRevanche={() => setPartida((n) => n + 1)}
            onTrocar={() => router.push('/personagens')}
          />
        ) : null}
      </div>
      <aside className="flex min-h-0 flex-col justify-between gap-6 overflow-y-auto bg-tinta p-5" aria-label="Jogador 2">
        <Painel i={1} personagens={personagens} hud={hud} />
        <Placar personagens={personagens} hud={hud} modo={modo} etapa={etapa} />
      </aside>
    </div>
  );
}

// Comandos da batalha sempre à vista (D-024, CONTROLLERS.md): controle e teclado do P1 / P2.
function Comandos() {
  return (
    <div className="grid gap-2 text-sm">
      <p className="font-extrabold">Comandos (P1 / P2)</p>
      <ControlHint pad="cross" tecla="F / K">Ataque, segure para carregar</ControlHint>
      <ControlHint pad="circle" tecla="G / L">Defesa</ControlHint>
      <ControlHint pad="l1" tecla="R / I">Pulo</ControlHint>
      <ControlHint pad="r1" tecla="T / O">Esquiva</ControlHint>
      <ControlHint tecla="R+T / I+O">Fera bit (L1 + R1)</ControlHint>
      <ControlHint tecla="F+G / K+L">Engine Gear</ControlHint>
      <ControlHint pad="options" tecla="Esc / P">Pausa</ControlHint>
    </div>
  );
}

function Painel({ i, personagens, hud }) {
  const p = personagens[i];
  const b = hud?.beys[i];
  const lancando = hud?.phase === 'launch';
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <span className={cn('px-2 py-0.5 text-base font-extrabold text-tinta', i === 0 ? 'bg-p1' : 'bg-p2')}>P{i + 1}</span>
        <span className="cartela text-2xl uppercase">{p.nome}</span>
      </div>
      <span className="text-base font-semibold text-texto-2">{p.bey}</span>
      {/* Mesmas linhas em todas as fases: se o painel mudasse de altura, o conteúdo pularia. */}
      {lancando ? (
        <GaugeBar label="Força do lançamento" value={hud?.launch[i] ?? 0} tipo="especial" />
      ) : (
        <GaugeBar label="Giro" value={b?.spin ?? 1} fera={p.fera ?? undefined} />
      )}
      <GaugeBar label="Especial" value={b?.special ?? 0} tipo="especial" />
      {b?.engineGear ? (
        <span className="text-sm font-semibold text-texto-2">Engine Gear: {b.egUsed ? 'usado nesta rodada' : 'pronto'}</span>
      ) : null}
    </div>
  );
}

function Placar({ personagens, hud, modo, etapa }) {
  const lancando = hud?.phase === 'launch';
  if (modo === 'treino') {
    return (
      <div className="grid gap-3">
        <p className="font-extrabold">Treino</p>
        <p className="text-sm font-semibold text-texto-2">Sem relógio e sem placar. O boneco não perde giro.</p>
        <ControlHint pad="options" tecla="Esc / P">
          Pausa, reiniciar ou sair
        </ControlHint>
      </div>
    );
  }
  return (
    <div className="grid gap-3">
      <p className="font-extrabold">{modo === 'arcade' ? `Arcade · luta ${etapa} · melhor de 3` : 'Melhor de 3'}</p>
      <RoundRow rounds={hud?.rounds ?? []} total={3} feraP1={personagens[0].fera ?? undefined} feraP2={personagens[1].fera ?? undefined} className="w-full" />
      <p className="text-sm font-semibold tabular-nums text-texto-2">
        {lancando ? 'Aperte o botão X (F / K) quando a barra estiver no topo' : `Rodada ${hud?.round ?? 1} · ${hud?.restante ?? ROUND_SECONDS}s`}
      </p>
    </div>
  );
}

function Pausa({ onContinuar, onReiniciar, onSair, sairRotulo }) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-tinta/85" role="dialog" aria-modal="true" aria-labelledby="pausa-titulo">
      <div className="grid gap-6 bg-tinta-2 p-10">
        <h2 id="pausa-titulo" className="cartela text-5xl uppercase">
          Pausa
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" onClick={onContinuar} autoFocus>
            Continuar
          </Button>
          {onReiniciar ? (
            <Button size="lg" variant="secondary" onClick={onReiniciar}>
              Reiniciar
            </Button>
          ) : null}
          <Button size="lg" variant="secondary" onClick={onSair}>
            {sairRotulo}
          </Button>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <ControlHint pad="options" tecla="Esc / P">
            Continuar
          </ControlHint>
          {onReiniciar ? (
            <ControlHint pad="l1" tecla="R / I">
              Reiniciar
            </ControlHint>
          ) : null}
          <ControlHint pad="circle" tecla="G / L">
            Sair
          </ControlHint>
        </div>
      </div>
    </div>
  );
}

function Resultado({ personagens, fim, salvo, arcade, onArcade, onRevanche, onTrocar }) {
  const vencedor = personagens[fim.winner - 1];
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-tinta/85">
      <FeraField fera={vencedor.fera ?? undefined} className="varredura grid w-[min(44rem,92vw)] gap-6 p-10">
        <span className={cn('w-fit px-2 py-0.5 text-lg font-extrabold text-tinta', fim.winner === 1 ? 'bg-p1' : 'bg-p2')}>P{fim.winner}</span>
        <TitleCard nome={`${vencedor.nome} vence!`} sub={`${vencedor.bey} · ${fim.wins[0]} × ${fim.wins[1]}`} size="lg" as="h2" />
        <div className="grid gap-4 bg-tinta p-5 text-papel">
          <RoundRow rounds={fim.rounds} encerrada feraP1={personagens[0].fera ?? undefined} feraP2={personagens[1].fera ?? undefined} />
          {arcade ? (
            <>
              <Button size="lg" onClick={onArcade} autoFocus className="w-fit">
                Continuar
              </Button>
              <ControlHint pad="cross" tecla="F / K">
                Continuar
              </ControlHint>
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={onRevanche} autoFocus>
                  Revanche
                </Button>
                <Button size="lg" variant="secondary" onClick={onTrocar}>
                  Trocar personagens
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <ControlHint pad="cross" tecla="F / K">
                  Revanche
                </ControlHint>
                <ControlHint pad="circle" tecla="G / L">
                  Trocar personagens
                </ControlHint>
              </div>
            </>
          )}
          {salvo ? <p className="text-sm text-texto-2">{salvo}</p> : null}
        </div>
      </FeraField>
    </div>
  );
}
