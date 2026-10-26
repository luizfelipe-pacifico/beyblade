'use client';

import { cn } from 'cn';

// Escolha da arena (D-023): os 6 estádios do jogo de GBA (public/rom/stadiums) e o Aleatório.
// Sem os assets da ROM, mostra um estádio desenhado como substituto.
export function StageSelect({ stages, cursor, romData }) {
  const opcoes = [...Array.from({ length: stages }, (_, i) => i), 'aleatorio'];
  return (
    <div className="grid gap-6">
      <h2 className="cartela text-center text-4xl uppercase">Escolha a arena</h2>
      <ul className="grid grid-cols-4 gap-4 md:grid-cols-7" role="listbox" aria-label="Arenas">
        {opcoes.map((op, i) => {
          const foco = i === cursor;
          const piso = typeof op === 'number' ? romData?.stadiums?.[op]?.floor : null;
          return (
            <li key={String(op)} role="option" aria-selected={foco} className={cn('sel-card grid gap-2 p-2', foco && 'outline outline-4 outline-chamada')} data-foco={foco}>
              <div className="grid aspect-square place-items-center overflow-hidden rounded-full bg-tinta">
                {op === 'aleatorio' ? (
                  <span className="cartela text-5xl text-chamada">?</span>
                ) : piso ? (
                  <img src={piso} alt="" className="h-full w-full object-cover" style={{ imageRendering: 'pixelated' }} />
                ) : (
                  <div className="h-[86%] w-[86%] rounded-full" style={{ background: 'radial-gradient(circle, #8fd3ff 0%, #2a7fd6 55%, #0c3f8f 100%)' }} />
                )}
              </div>
              <span className="text-center text-sm font-extrabold uppercase">{op === 'aleatorio' ? 'Aleatória' : `Estádio ${op + 1}`}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
