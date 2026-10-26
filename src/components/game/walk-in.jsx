'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from 'cn';
import { retrato } from '@/content/roster';
import { ps1Portrait } from '@/content/ps1';
import { WALK_FRAME_SIZE } from '@/content/gba';
import { desenharEstadio } from '@/render/estadio-preview';
import { WALK_IN, walkInPose } from '@/game/walk-in';

const ESCALA = 6; // pixel do sprite do GBA → pixels da tela
const LARGURA_PRATO = 'min(62vh, 52vw)';

// Entrada na arena (D-023, D-052): o estádio de verdade (o mesmo desenho da batalha, deitado como chão),
// os dois entrando pelas laterais com a caminhada do GBA até a beira do prato e, no fim, os retratos com o
// VS. Os quadros de lado do GBA olham para a esquerda: o P1, que entra pela esquerda, vai espelhado.
export function WalkIn({ personagens, romData, ps1, arena, onDone }) {
  const [tick, setTick] = useState(0);
  const prato = useRef(null);

  useEffect(() => {
    const canvas = prato.current;
    if (!canvas || !arena) return undefined;
    const redesenhar = desenharEstadio(canvas, arena);
    const obs = new ResizeObserver(() => redesenhar());
    obs.observe(canvas);
    return () => obs.disconnect();
  }, [arena]);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setTick(WALK_IN.vs + WALK_IN.corte);
      const t = setTimeout(onDone, 1200);
      return () => clearTimeout(t);
    }
    let raf = 0;
    let inicio = 0;
    const loop = (agora) => {
      inicio ||= agora;
      const t = Math.floor(((agora - inicio) / 1000) * 60);
      setTick(t);
      if (t >= WALK_IN.fim) onDone();
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const pose = walkInPose(tick);
  // A câmera recua devagar enquanto eles chegam (dolly out), e para quando param.
  const camera = 1.12 - 0.12 * pose.avanco;

  return (
    <section aria-label="Entrada na arena" className="sel-palco relative h-dvh overflow-hidden">
      <div className="absolute inset-0" style={{ transform: `scale(${camera})`, transformOrigin: '50% 58%' }}>
        <div className="sel-estadio absolute left-1/2 top-[58%] aspect-square -translate-x-1/2 -translate-y-1/2" style={{ width: LARGURA_PRATO }}>
          <canvas ref={prato} className="block h-full w-full rounded-full" aria-hidden="true" />
        </div>
        {personagens.map((p, i) => (
          <Andante key={p.slug} p={p} i={i} pose={pose} romData={romData} />
        ))}
      </div>
      {pose.corte > 0 ? (
        <>
          {personagens.map((p, i) => (
            <Retrato key={p.slug} p={p} i={i} corte={pose.corte} ps1={ps1} />
          ))}
          <p className="vs sel-vs pointer-events-none absolute left-1/2 top-[14%] z-20 -translate-x-1/2 text-[clamp(4rem,10vw,8rem)]" aria-label="contra">
            VS
          </p>
        </>
      ) : null}
    </section>
  );
}

// Um personagem andando de fora da tela até a beira do prato, do seu lado.
function Andante({ p, i, pose, romData }) {
  const lado = i === 0 ? -1 : 1;
  const andando = romData?.walk?.characters?.[p.slug];
  // Destino: a borda do prato mais um respiro; a partida fica fora da tela, na mesma linha do chão.
  const destino = `(${LARGURA_PRATO} / 2 + 4vw)`;
  const x = `calc(${lado} * (${destino} + (1 - ${pose.avanco}) * 40vw))`;
  const alto = WALK_FRAME_SIZE.height * ESCALA;
  return (
    <div className="absolute left-1/2 top-[58%]" style={{ transform: `translate(calc(-50% + ${x}), -100%)` }}>
      <div className="relative grid justify-items-center">
        {andando ? (
          <div
            role="img"
            aria-label={p.nome}
            className="sel-andando"
            style={{
              width: WALK_FRAME_SIZE.width * ESCALA,
              height: alto,
              backgroundImage: `url(${andando.sprite})`,
              backgroundSize: `${romData.walk.frameCount * 100}% 100%`,
              backgroundPosition: `${(pose.quadro / (romData.walk.frameCount - 1)) * 100}% 0`,
              transform: `translateY(${-pose.pulo * ESCALA}px) scaleX(${i === 0 ? -1 : 1})`,
            }}
          />
        ) : (
          // Sem boneco no GBA: o retrato entra deslizando, com um balanço leve no ritmo do passo.
          <img src={retrato(p.slug)} alt={p.nome} className="w-auto object-contain" style={{ height: alto, transform: `translateY(${-pose.pulo * 4}px)` }} />
        )}
        {/* Sombra no chão: some um pouco quando o pé sai do chão. */}
        <span
          aria-hidden="true"
          className="absolute -bottom-2 h-4 w-20 rounded-[50%] bg-black/50 blur-[2px]"
          style={{ transform: `scaleX(${1 - pose.pulo * 0.12})` }}
        />
        <p className={cn('absolute -bottom-10 w-fit whitespace-nowrap px-2 py-0.5 text-sm font-extrabold uppercase text-tinta', i === 0 ? 'bg-p1' : 'bg-p2')}>
          {p.nome}
        </p>
      </div>
    </div>
  );
}

// Retrato de corpo, cruzando a tela do seu lado com o VS (estilo jogo de luta): PS1 bravo quando existe.
function Retrato({ p, i, corte, ps1 }) {
  const lado = i === 0 ? -1 : 1;
  const src = ps1?.personagens?.[p.slug] ? ps1Portrait(p.slug, 'bravo', i === 0 ? 'a' : 'b') : retrato(p.slug);
  const sai = (1 - (1 - corte) ** 3) * 100;
  return (
    <div
      className={cn('pointer-events-none absolute bottom-0 z-10 h-[62vh]', i === 0 ? 'left-0' : 'right-0')}
      style={{ transform: `translateX(${lado * (100 - sai)}%)`, opacity: corte }}
    >
      <img src={src} alt="" className="h-full w-auto object-contain object-bottom drop-shadow-[0_0_24px_rgb(0_0_0_/_0.7)]" style={{ imageRendering: ps1?.personagens?.[p.slug] ? 'auto' : undefined }} />
      <p className={cn('cartela absolute bottom-4 text-4xl uppercase', i === 0 ? 'left-4' : 'right-4')}>{p.nome}</p>
    </div>
  );
}
