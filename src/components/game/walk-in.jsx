'use client';

import { useEffect, useState } from 'react';
import { cn } from 'cn';
import { retrato } from '@/content/roster';
import { WALK_FRAME_SIZE, walkInFrame } from '@/content/gba';
import { ArenaSwatch } from './stage-select';

const PASSOS = 96; // ticks de 60 Hz andando (walkInFrame)
const DURACAO = 150; // ticks até ir para a batalha
const ESCALA = 5;

// Entrada na arena (D-023): os dois personagens andam de costas até o estádio, como no jogo de GBA, e a
// tela segue para a batalha. Personagem sem sprite de caminhada na ROM (Brooklyn, Robert) entra com o retrato.
export function WalkIn({ personagens, romData, arena, onDone }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const reduzido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduzido) {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
    let raf = 0;
    let inicio = 0;
    const loop = (agora) => {
      inicio ||= agora;
      const t = Math.floor(((agora - inicio) / 1000) * 60);
      setTick(t);
      if (t >= DURACAO) onDone();
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const avanco = Math.min(1, tick / PASSOS);

  return (
    <section aria-label="Entrada na arena" className="sel-palco relative grid h-[calc(100dvh-3.5rem)] place-items-center overflow-hidden">
      <div className="sel-estadio relative grid aspect-square w-[min(70vh,60vw)] place-items-center rounded-full">
        {/* Arena sorteada pela batalha ainda não é conhecida aqui: mostra a tigela padrão. */}
        <ArenaSwatch slug={arena && arena !== 'aleatoria' ? arena : ''} romData={romData} className="h-full w-full" />
      </div>
      <p className="vs sel-vs pointer-events-none absolute top-[12%] z-10 text-[clamp(4rem,10vw,8rem)]" aria-label="contra">VS</p>
      {personagens.map((p, i) => {
        const andando = romData?.walk?.characters?.[p.slug];
        // Saem da frente da tela (embaixo) e sobem até a beira do estádio, cada um do seu lado.
        const x = (i === 0 ? -1 : 1) * (34 - 14 * avanco);
        const y = 40 - 30 * avanco;
        return (
          <div key={p.slug} className="absolute left-1/2 top-1/2" style={{ transform: `translate(calc(-50% + ${x}vw), calc(-50% + ${y}vh))` }}>
            {andando ? (
              <div
                role="img"
                aria-label={p.nome}
                className="sel-andando"
                style={{
                  width: WALK_FRAME_SIZE.width * ESCALA,
                  height: WALK_FRAME_SIZE.height * ESCALA,
                  backgroundImage: `url(${andando.sprite})`,
                  backgroundSize: `${romData.walk.frameCount * 100}% 100%`,
                  backgroundPosition: `${(walkInFrame(tick) / (romData.walk.frameCount - 1)) * 100}% 0`,
                  filter: 'drop-shadow(0 12px 8px rgb(0 0 0 / 0.6))',
                }}
              />
            ) : (
              <img src={retrato(p.slug)} alt={p.nome} className="h-48 w-auto" style={{ opacity: 0.4 + 0.6 * avanco }} />
            )}
            <p className={cn('mt-2 w-fit px-2 py-0.5 text-sm font-extrabold uppercase text-tinta', i === 0 ? 'bg-p1' : 'bg-p2')}>{p.nome}</p>
          </div>
        );
      })}
    </section>
  );
}
