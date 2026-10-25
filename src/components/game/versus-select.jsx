'use client';

import { useState } from 'react';
import { cn } from 'cn';
import { roster, retrato, feraArte } from '@/content/roster';
import { useMenuNav } from '@/hooks/use-menu-nav';
import { FeraField } from './fera-field';
import { TitleCard, VsBadge } from './title-card';
import { ControlHint } from './pad-glyph';

// Seleção versus: a tela-tese do mundo "Abertura do Anime". Cada metade é o campo da fera
// do personagem do jogador; a faixa de elenco no topo mostra os dois cursores.
export function VersusSelect({ inicial = [0, 1], className }) {
  const [sel, setSel] = useState(inicial);
  const [prontos, setProntos] = useState([false, false]);

  function mover(jogador, passo) {
    if (passo === 'confirmar') {
      setProntos((p) => p.map((v, i) => (i === jogador ? !v : v)));
      return;
    }
    if (prontos[jogador]) return;
    setSel((s) => s.map((v, i) => (i === jogador ? (v + passo + roster.length) % roster.length : v)));
  }

  useMenuNav(mover);

  return (
    <section aria-label="Espécime: seleção versus" className={cn('relative grid min-h-[640px] grid-rows-[auto_1fr]', className)}>
      <RosterStrip sel={sel} onPick={(jogador, i) => setSel((s) => s.map((v, j) => (j === jogador ? i : v)))} />
      <div className="relative grid grid-cols-1 md:grid-cols-2">
        {[0, 1].map((jogador) => (
          <Lado key={`${jogador}-${sel[jogador]}`} jogador={jogador} personagem={roster[sel[jogador]]} pronto={prontos[jogador]} />
        ))}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <VsBadge />
        </div>
      </div>
    </section>
  );
}

function Lado({ jogador, personagem, pronto }) {
  const direita = jogador === 1;
  return (
    <FeraField fera={personagem.fera} movendo={!pronto} className="varredura min-h-[520px]">
      {personagem.arteFera ? (
        <img
          src={feraArte(personagem.arteFera)}
          alt=""
          className={cn('absolute bottom-24 h-[78%] max-h-[560px] w-auto', direita ? '-right-10 -scale-x-100' : '-left-10')}
        />
      ) : null}
      <div className={cn('absolute bottom-10 flex flex-col gap-4', direita ? 'right-8 items-end md:right-12' : 'left-8 md:left-12')}>
        <span className={cn('w-fit px-2 py-0.5 text-lg font-extrabold text-tinta', direita ? 'bg-p2' : 'bg-p1')}>
          P{jogador + 1}
          {pronto ? ' · pronto' : ''}
        </span>
        <TitleCard nome={personagem.nome} sub={personagem.bey} size="xl" align={direita ? 'right' : 'left'} />
        <div className={cn('flex flex-wrap gap-x-5 gap-y-2', direita && 'justify-end')}>
          <ControlHint pad="cross" tecla={direita ? 'K' : 'F'}>
            {pronto ? 'Trocar' : 'Confirmar'}
          </ControlHint>
          <ControlHint tecla={direita ? '← →' : 'A D'}>Escolher</ControlHint>
        </div>
      </div>
    </FeraField>
  );
}

function RosterStrip({ sel, onPick }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto bg-tinta p-2 md:justify-center" role="group" aria-label="Elenco">
      {roster.map((p, i) => {
        const p1 = sel[0] === i;
        const p2 = sel[1] === i;
        return (
          <button
            key={p.slug}
            type="button"
            onClick={(e) => onPick(e.shiftKey ? 1 : 0, i)}
            aria-label={`${p.nome}${p1 ? ', escolhido por P1' : ''}${p2 ? ', escolhido por P2' : ''}`}
            className="pressionavel relative h-20 w-16 shrink-0 overflow-hidden bg-tinta-3"
            style={p.fera ? { background: `var(--fera-${p.fera})` } : undefined}
          >
            <img src={retrato(p.slug)} alt="" className="absolute inset-x-0 bottom-0 h-full w-full object-cover object-top" />
            {p1 ? <Cursor lado="P1" dividido={p2} /> : null}
            {p2 ? <Cursor lado="P2" dividido={p1} /> : null}
          </button>
        );
      })}
    </div>
  );
}

// Os dois no mesmo personagem: a borda se divide ao meio, metade de cada cor.
function Cursor({ lado, dividido }) {
  const p1 = lado === 'P1';
  return (
    <>
      <span
        aria-hidden="true"
        className={cn('absolute inset-0 border-4', p1 ? 'border-p1' : 'border-p2')}
        style={dividido ? { clipPath: p1 ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)' } : undefined}
      />
      <span
        aria-hidden="true"
        className={cn('absolute top-0 px-1 text-xs font-extrabold text-tinta', p1 ? 'left-0 bg-p1' : 'right-0 bg-p2')}
      >
        {lado}
      </span>
    </>
  );
}
