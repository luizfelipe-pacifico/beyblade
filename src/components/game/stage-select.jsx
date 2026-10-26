'use client';

import { useEffect, useRef } from 'react';
import { cn } from 'cn';
import { desenharEstadio } from '@/render/estadio-preview';
import { cenario } from '@/content/cenarios';
import { RANDOM_STAGE } from '@/game/select-state';

// "Foto do lugar" (D-050): o estádio de verdade, chão do cenário e prato, com o mesmo desenho da batalha,
// feito uma vez num canvas pequeno (e de novo se o card mudar de tamanho). Aleatória é um "?".
export function ArenaSwatch({ slug, className }) {
  const canvas = useRef(null);
  useEffect(() => {
    if (slug === RANDOM_STAGE || !canvas.current) return undefined;
    const redesenhar = desenharEstadio(canvas.current, slug);
    const obs = new ResizeObserver(() => redesenhar());
    obs.observe(canvas.current);
    return () => obs.disconnect();
  }, [slug]);
  if (slug === RANDOM_STAGE) {
    return <span className={cn('cartela grid place-items-center rounded-full bg-tinta text-5xl text-chamada', className)}>?</span>;
  }
  return <canvas ref={canvas} aria-hidden="true" className={cn('block rounded-md', className)} />;
}

// Escolha da arena (D-023, D-039): cenários do anime, estádios do jogo de GBA e a Aleatória (a batalha sorteia).
export function StageSelect({ stages, cursor }) {
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
              <ArenaSwatch slug={slug} className="aspect-square w-full" />
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
