'use client';

import { cn } from 'cn';
import { cenario } from '@/content/cenarios';
import { RANDOM_STAGE } from '@/game/select-state';

// Amostra de uma arena: o chão do estádio do GBA (public/rom) ou a tigela do cenário nas cores do tema.
export function ArenaSwatch({ slug, romData, className }) {
  if (slug === RANDOM_STAGE) {
    return <span className={cn('cartela grid place-items-center rounded-full bg-tinta text-5xl text-chamada', className)}>?</span>;
  }
  const rom = /^rom-(\d+)$/.exec(slug);
  const piso = rom ? romData?.stadiums?.[Number(rom[1])]?.floor : null;
  if (piso) return <img src={piso} alt="" className={cn('rounded-full object-cover', className)} style={{ imageRendering: 'pixelated' }} />;
  const [claro, meio, escuro] = cenario(slug)?.tema?.tigela ?? ['#8fd3ff', '#2a7fd6', '#0c3f8f'];
  return <span className={cn('block rounded-full', className)} style={{ background: `radial-gradient(circle, ${claro} 0%, ${meio} 55%, ${escuro} 100%)` }} />;
}

// Escolha da arena (D-023, D-039): cenários do anime, estádios do jogo de GBA e a Aleatória (a batalha sorteia).
export function StageSelect({ stages, cursor, romData }) {
  const atual = stages[cursor];
  const info = atual === RANDOM_STAGE ? null : cenario(atual);
  return (
    <div className="grid gap-5">
      <h2 className="cartela text-center text-4xl uppercase">Escolha a arena</h2>
      <ul className="grid grid-cols-6 gap-3" role="listbox" aria-label="Arenas">
        {stages.map((slug, i) => {
          const foco = i === cursor;
          const nome = slug === RANDOM_STAGE ? 'Aleatória' : cenario(slug)?.nome ?? slug;
          return (
            <li key={slug} role="option" aria-selected={foco} className={cn('sel-card grid gap-1.5 p-2', foco && 'sel-cursor outline outline-4 outline-chamada text-chamada')} data-foco={foco}>
              <ArenaSwatch slug={slug} romData={romData} className="aspect-square w-full" />
              <span className="line-clamp-2 text-center text-xs font-extrabold uppercase text-papel">{nome}</span>
            </li>
          );
        })}
      </ul>
      <div key={atual} className="sel-pop grid min-h-20 justify-items-center gap-1 text-center" aria-live="polite">
        <p className="cartela text-3xl uppercase">{atual === RANDOM_STAGE ? 'Aleatória' : info?.nome}</p>
        <p className="text-base font-semibold text-texto-2">
          {atual === RANDOM_STAGE ? 'A batalha sorteia um cenário do anime.' : [info?.origem, info?.regra].filter(Boolean).join(' · ')}
        </p>
      </div>
    </div>
  );
}
