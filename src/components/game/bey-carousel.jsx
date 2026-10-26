'use client';

import { cn } from 'cn';
import { beyImage, beyName } from '@/game/bey-options';
import { RANDOM_BEY } from '@/game/select-state';

// Vista de topo da bey: sprite da ROM ampliado em pixel art ou a arte vetorial da pesquisa.
export function BeyTop({ id, generated, romData, size = 112, girando = true, className }) {
  const img = beyImage(id, generated, romData);
  if (img.kind === 'random') {
    return (
      <span
        role="img"
        aria-label="Aleatória"
        className={cn('cartela grid place-items-center rounded-full bg-tinta text-chamada', className)}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        ?
      </span>
    );
  }
  if (img.kind === 'sprite') {
    return (
      <div
        role="img"
        aria-label={beyName(id, generated, romData)}
        className={cn('sel-bey-sprite rounded-full', className)}
        data-parado={!girando}
        style={{ width: size, height: size, backgroundImage: `url(${img.src})`, '--quadros': img.frames }}
      />
    );
  }
  return (
    <img
      src={img.src}
      alt={beyName(id, generated, romData)}
      width={size}
      height={size}
      className={cn('sel-bey-svg', className)}
      data-girando={girando}
      style={{ width: size, height: size }}
    />
  );
}

// Carrossel das beys do personagem escolhido (D-023): a do centro gira e mostra o nome embaixo;
// as vizinhas aparecem menores e apagadas para dizer que dá para passar para os lados.
export function BeyCarousel({ ids, cursor, generated, romData, jogador, pronto, className }) {
  const n = ids.length;
  const vizinhas = n > 1 ? [-1, 1] : [];
  const atual = ids[cursor];
  const tipo = generated?.[atual]?.tipo;
  const reais = ids.filter((id) => id !== RANDOM_BEY).length;
  return (
    <div className={cn('grid justify-items-center gap-3', className)} aria-live="polite">
      <div className="relative flex items-center justify-center gap-4">
        {vizinhas.length ? <Seta lado="esquerda" /> : null}
        {vizinhas.length ? (
          <BeyTop id={ids[(cursor - 1 + n) % n]} generated={generated} romData={romData} size={64} girando={false} className="opacity-40" />
        ) : null}
        <div
          key={atual}
          className={cn(
            'sel-pop grid place-items-center rounded-full p-3',
            jogador === 0 ? 'shadow-[0_0_0_3px_var(--p1),0_0_32px_var(--p1)]' : 'shadow-[0_0_0_3px_var(--p2),0_0_32px_var(--p2)]',
          )}
          style={{ background: 'radial-gradient(circle, rgb(255 255 255 / 0.14), transparent 70%)' }}
        >
          <BeyTop id={atual} generated={generated} romData={romData} size={128} girando={!pronto} />
        </div>
        {vizinhas.length ? (
          <BeyTop id={ids[(cursor + 1) % n]} generated={generated} romData={romData} size={64} girando={false} className="opacity-40" />
        ) : null}
        {vizinhas.length ? <Seta lado="direita" /> : null}
      </div>
      <p key={atual} className="sel-pop cartela text-center text-2xl uppercase">{beyName(atual, generated, romData)}</p>
      <p className="text-sm font-semibold text-texto-2">
        {atual === RANDOM_BEY ? `Sorteia uma das ${reais}` : n > 1 ? `${cursor + 1} de ${reais}` : 'Única bey'}
        {tipo ? ` · ${ROTULO_TIPO[tipo] ?? tipo}` : ''}
      </p>
    </div>
  );
}

const ROTULO_TIPO = { attack: 'Ataque', defense: 'Defesa', stamina: 'Resistência', endurance: 'Resistência', balance: 'Equilíbrio', combination: 'Equilíbrio' };

function Seta({ lado }) {
  return (
    <svg viewBox="0 0 16 24" width="16" height="24" aria-hidden="true" className="text-chamada">
      <path d={lado === 'esquerda' ? 'M12 3 4 12l8 9' : 'M4 3l8 9-8 9'} fill="none" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}
