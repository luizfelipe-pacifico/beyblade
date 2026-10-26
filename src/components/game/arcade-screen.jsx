'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from 'cn';
import { roster, retrato } from '@/content/roster';
import generated from '@/content/beys.generated.json';
import { beysByCharacter } from '@/game/bey-options';
import { advance, currentFight, spendContinue } from '@/game/arcade';
import { clearLadder, loadLadder, saveLadder } from '@/game/arcade-storage';
import { useSelectInput } from '@/hooks/use-select-input';
import { uiSounds } from '@/audio/ui-sounds';
import { ControlHint } from './pad-glyph';
import { WalkIn } from './walk-in';
import { useRomData } from './character-select';
import './select.css';

const personagem = (slug) => roster.find((c) => c.slug === slug);

// Link da luta do Arcade (contrato da batalha): CPU no P2, arena sorteada, etapa e nível para a IA.
export function arcadeBattleQuery(ladder, beysOf) {
  const fight = currentFight(ladder);
  return new URLSearchParams({
    p1: ladder.player,
    b1: ladder.playerBey ?? beysOf[ladder.player]?.[0],
    p2: fight.character,
    b2: beysOf[fight.character]?.[0],
    arena: 'aleatoria',
    cpu: '2',
    modo: 'arcade',
    etapa: String(ladder.stage),
    cpuNivel: String(fight.level),
  }).toString();
}

// Tela da escada (D-005): mostra os sete desafiantes, a luta atual, continue, fim de jogo e o final.
// A batalha volta para cá com ?etapa=&resultado=vitoria|derrota.
export function ArcadeScreen({ etapa, resultado }) {
  const router = useRouter();
  const beysOf = useMemo(() => beysByCharacter(generated, roster), []);
  const [ladder, setLadder] = useState(null);
  const [entrando, setEntrando] = useState(false);
  const romData = useRomData();

  useEffect(() => {
    let l = loadLadder();
    if (!l) {
      router.replace('/modos');
      return;
    }
    // Aplica o resultado só uma vez (recarregar a página não conta a luta de novo).
    if (resultado && Number(etapa) === l.stage && l.status === 'playing') {
      l = advance(l, resultado);
      saveLadder(l);
      if (l.status === 'cleared' || resultado === 'vitoria') uiSounds.join();
      router.replace('/arcade');
    }
    setLadder(l);
  }, [etapa, resultado, router]);

  const atualizar = useCallback((l) => {
    saveLadder(l);
    setLadder(l);
  }, []);

  const agir = useCallback(
    (jogador, acao) => {
      if (jogador !== 0 || !ladder || entrando) return;
      if (ladder.status === 'playing' && acao === 'confirm') {
        uiSounds.vs();
        setEntrando(true);
      } else if (ladder.status === 'continue' && acao === 'confirm') {
        uiSounds.confirm();
        atualizar(spendContinue(ladder));
      } else if (ladder.status === 'continue' && acao === 'back') {
        uiSounds.back();
        atualizar({ ...ladder, status: 'gameover' });
      } else if ((ladder.status === 'gameover' || ladder.status === 'cleared') && acao === 'confirm') {
        clearLadder();
        router.push(ladder.status === 'cleared' ? '/' : '/modos');
      } else if (ladder.status === 'playing' && acao === 'back') {
        uiSounds.back();
        clearLadder();
        router.push('/modos');
      }
    },
    [ladder, entrando, atualizar, router],
  );
  useSelectInput(agir, !entrando);

  const lutar = useCallback(() => router.push(`/batalha?${arcadeBattleQuery(ladder, beysOf)}`), [ladder, beysOf, router]);

  if (!ladder) return <section className="sel-palco h-dvh" aria-busy="true" />;
  const fight = currentFight(ladder);
  if (entrando && fight) {
    return <WalkIn personagens={[personagem(ladder.player), personagem(fight.character)]} romData={romData} arena={null} onDone={lutar} />;
  }

  const jogador = personagem(ladder.player);
  return (
    <section aria-label="Arcade" className="sel-palco relative grid h-dvh grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-8 overflow-hidden px-[var(--gutter)] py-8">
      <div className="relative grid content-end">
        <img src={retrato(jogador.slug)} alt={jogador.nome} className="sel-figura max-h-[70vh] w-auto" style={{ '--luz': 'var(--p1)' }} />
        <p className="cartela text-5xl uppercase">{jogador.nome}</p>
        <p className="text-base font-semibold text-texto-2">Continues: {ladder.continues}</p>
      </div>

      <div className="grid content-center gap-6">
        <Mensagem ladder={ladder} fight={fight} />
        <ol className="grid gap-2" aria-label="Desafiantes">
          {[...ladder.opponents].reverse().map((o, iRev) => {
            const i = ladder.opponents.length - 1 - iRev;
            const vencido = i < ladder.stage;
            const atual = i === ladder.stage && ladder.status !== 'cleared';
            const c = personagem(o.character);
            return (
              <li key={o.character} className={cn('sel-card flex items-center gap-4 px-3 py-2', atual && 'sel-cursor outline outline-4 outline-chamada text-chamada', vencido && 'opacity-40')}>
                <img src={retrato(c.slug)} alt="" className="h-12 w-12 rounded-full object-cover object-top" />
                <span className="cartela flex-1 text-2xl uppercase text-papel">{c.nome}</span>
                <span className="text-sm font-extrabold text-texto-2">{i === ladder.opponents.length - 1 ? 'Chefe' : `Luta ${i + 1}`}</span>
                {vencido ? <span className="text-sm font-extrabold text-chamada">Vencido</span> : null}
              </li>
            );
          })}
        </ol>
        <Dicas status={ladder.status} />
      </div>
    </section>
  );
}

function Mensagem({ ladder, fight }) {
  if (ladder.status === 'cleared') return <h2 className="cartela sel-vs text-6xl uppercase text-chamada">Campeão!</h2>;
  if (ladder.status === 'gameover') return <h2 className="cartela text-6xl uppercase">Fim de jogo</h2>;
  if (ladder.status === 'continue') return <h2 className="cartela text-5xl uppercase">Continuar? <span className="text-chamada">({ladder.continues})</span></h2>;
  return (
    <h2 className="cartela text-5xl uppercase">
      Luta {ladder.stage + 1} de {ladder.opponents.length}: <span className="text-chamada">{personagem(fight.character).nome}</span>
    </h2>
  );
}

function Dicas({ status }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-texto-2">
      <ControlHint pad="cross" tecla="F / Enter">
        {status === 'playing' ? 'Lutar' : status === 'continue' ? 'Continuar' : 'Sair'}
      </ControlHint>
      {status === 'playing' || status === 'continue' ? (
        <ControlHint pad="circle" tecla="G / Backspace">
          {status === 'continue' ? 'Desistir' : 'Abandonar'}
        </ControlHint>
      ) : null}
    </div>
  );
}
