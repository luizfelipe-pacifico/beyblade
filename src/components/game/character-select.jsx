'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from 'cn';
import { roster, retrato } from '@/content/roster';
import { ps1Beast, ps1Portrait } from '@/content/ps1';
import generated from '@/content/beys.generated.json';
import { beysByCharacter } from '@/game/bey-options';
import { activeSlot, battleQuery, cardCount, createSelect, defaultStages, isRandomCard, reduceSelect } from '@/game/select-state';
import { CENARIOS, ROM_STADIUMS } from '@/content/cenarios';
import { useSelectInput } from '@/hooks/use-select-input';
import { selectFeedback } from '@/game/select-feedback';
import { playVoice, uiSounds } from '@/audio/ui-sounds';
import { BeyCarousel } from './bey-carousel';
import { StageSelect } from './stage-select';
import { WalkIn } from './walk-in';
import { ControlHint } from './pad-glyph';
import './select.css';

const COLUNAS = 6;
// Cenários do anime primeiro (D-039), depois os estádios do GBA; a Aleatória entra no fim.
const ARENAS = [...CENARIOS.map((c) => c.slug), ...defaultStages(ROM_STADIUMS)];

// JSON gerado fora do git (public/rom, public/ps1): opcional; sem ele o jogo segue com a arte própria.
function useJson(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let vivo = true;
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => vivo && setData(d))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [url]);
  return data;
}

// Dados da ROM do GBA (public/rom/gba.json, D-007).
export const useRomData = () => useJson('/rom/gba.json');
// Retratos e feras bit do PS1 (public/ps1/ps1.json, D-040).
export const usePs1Data = () => useJson('/ps1/ps1.json');

// Expressão do retrato do PS1 em cada etapa: parado escolhendo, falando no carrossel, comemorando ao travar.
const POSE = { character: 'normal', bey: 'fala', ready: 'comemora' };

// Seleção estilo Street Fighter (D-023): cards do elenco no centro, o personagem de corpo inteiro de cada lado
// e, ao escolher, o carrossel das beys dele em cima da figura. Depois, arena e entrada; onBattle(query) navega.
export function CharacterSelect({ onBattle, onExit, mode = 'versus' }) {
  const romData = useRomData();
  const ps1 = usePs1Data();
  const beysOf = useMemo(() => beysByCharacter(generated, roster), []);
  const [s, setS] = useState(() => createSelect({ characters: roster, beysOf: (slug) => beysOf[slug], cols: COLUNAS, mode, stages: ARENAS }));

  // Estado em ref para calcular o próximo na hora e tocar o retorno (som, flash) uma vez por ação.
  const sRef = useRef(s);
  const [flash, setFlash] = useState([0, 0]);
  const [banner, setBanner] = useState(0);
  const aplicar = useCallback((proximo, acao) => {
    const anterior = sRef.current;
    if (proximo === anterior) return;
    sRef.current = proximo;
    setS(proximo);
    for (const e of selectFeedback(anterior, proximo, acao)) {
      uiSounds[e.som]?.();
      if (e.voz) playVoice(`/audio/tts/${e.voz}/selecao.wav`);
      if (e.rugido) {
        const arte = roster.find((c) => c.slug === e.rugido)?.arteFera;
        if (arte) playVoice(`/audio/feras/${arte}/rugido.wav`, 0.7);
      }
      if (e.flash) setFlash((f) => f.map((v, i) => (i === e.vaga ? v + 1 : v)));
      if (e.banner) setBanner((b) => b + 1);
    }
  }, []);
  const agir = useCallback((jogador, acao) => aplicar(reduceSelect(sRef.current, jogador, acao), acao), [aplicar]);
  useSelectInput(agir, s.phase !== 'done');

  useEffect(() => {
    if (s.exit) onExit?.();
  }, [s.exit, onExit]);

  const irParaBatalha = useCallback(() => onBattle(battleQuery(s)), [onBattle, s]);

  if (s.phase === 'done' && s.mode === 'arcade') return <Transicao onDone={irParaBatalha} />;
  if (s.phase === 'done') {
    const personagens = s.slots.map((slot) => roster.find((c) => c.slug === slot.character));
    return <WalkIn personagens={personagens} romData={romData} arena={s.stage} onDone={irParaBatalha} />;
  }

  return (
    <section aria-label="Seleção de personagens" className="sel-palco relative grid h-[calc(100dvh-3.5rem)] grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] overflow-hidden">
      <Lado jogador={0} s={s} romData={romData} ps1={ps1} beysOf={beysOf} flash={flash[0]} />
      <div className="relative z-10 grid content-center gap-6 px-4">
        {s.phase === 'stage' ? (
          <StageSelect stages={s.stages} cursor={s.stageCursor} romData={romData} />
        ) : (
          <Grade s={s} ps1={ps1} onPick={(jogador, i) => {
            // Clique/toque no card: move o cursor de quem está escolhendo e confirma.
            const slot = activeSlot(s, jogador);
            if (slot === null || s.slots[slot].step !== 'character') return;
            const atual = sRef.current;
            const movido = { ...atual, slots: atual.slots.map((v, j) => (j === slot ? { ...v, cursor: i } : v)) };
            aplicar(reduceSelect(movido, jogador, 'confirm'), 'confirm');
          }} />
        )}
        <Dicas s={s} />
      </div>
      <Lado jogador={1} s={s} romData={romData} ps1={ps1} beysOf={beysOf} flash={flash[1]} />
      {banner ? <BannerDesafiante key={banner} /> : null}
      <div className="sel-piso pointer-events-none absolute inset-x-0 bottom-0 h-40" aria-hidden="true" />
    </section>
  );
}

function Grade({ s, ps1, onPick }) {
  const cursores = [0, 1].map((jogador) => {
    const slot = activeSlot(s, jogador);
    return slot !== null && s.slots[slot].step === 'character' ? { slot, cursor: s.slots[slot].cursor } : null;
  });
  return (
    <ul className="grid gap-3" style={{ gridTemplateColumns: `repeat(${COLUNAS}, minmax(0, 1fr))` }} role="listbox" aria-label="Personagens">
      {Array.from({ length: cardCount(s) }, (_, i) => {
        const aleatorio = isRandomCard(s, i);
        const c = aleatorio ? null : roster[i];
        const marcas = cursores.map((cur, jogador) => (cur && cur.cursor === i ? { jogador, cpu: cur.slot === 1 && s.p2 === 'cpu' } : null)).filter(Boolean);
        const foco = marcas.length > 0;
        return (
          <li key={aleatorio ? 'aleatorio' : c.slug} role="option" aria-selected={foco}>
            <button
              type="button"
              onClick={() => marcas.length === 0 && onPick(s.p2 === 'human' ? 1 : 0, i)}
              className="sel-card relative grid aspect-[3/4] w-full overflow-hidden text-left"
              data-foco={foco}
            >
              {aleatorio ? (
                <span className="cartela grid h-full place-items-center text-6xl text-chamada">?</span>
              ) : (
                <img src={ps1?.personagens?.[c.slug] ? ps1Portrait(c.slug, 'normal', 'a') : retrato(c.slug)} alt="" className="h-full w-full object-cover object-top" />
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-tinta to-transparent px-2 pb-1 pt-6 text-sm font-extrabold uppercase">
                {aleatorio ? 'Aleatório' : c.nome}
              </span>
              {marcas.map((m) => (
                <span
                  key={m.jogador}
                  className={cn('sel-cursor pointer-events-none absolute inset-0 border-4', m.cpu ? 'border-texto-3 text-texto-3' : m.jogador === 0 ? 'border-p1 text-p1' : 'border-p2 text-p2')}
                  style={marcas.length > 1 ? { clipPath: m.jogador === 0 ? 'polygon(0 0,100% 0,0 100%)' : 'polygon(100% 0,100% 100%,0 100%)' } : undefined}
                >
                  <span className={cn('absolute top-0 px-1.5 text-xs font-extrabold text-tinta', m.jogador === 0 && !m.cpu ? 'left-0 bg-p1' : 'right-0', m.cpu ? 'bg-texto-3' : m.jogador === 1 ? 'bg-p2' : '')}>
                    {m.cpu ? 'CPU' : `P${m.jogador + 1}`}
                  </span>
                </span>
              ))}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// Um lado da tela: personagem de corpo inteiro com luz de recorte; em cima dele, o carrossel quando escolhe a bey.
function Lado({ jogador, s, romData, ps1, beysOf, flash }) {
  const slot = s.slots[jogador];
  const direita = jogador === 1;
  const cpu = direita && s.p2 === 'cpu';
  const esperandoP2 = direita && s.p2 === 'none';
  const aviso = s.mode === 'versus' ? 'Aperte Options para entrar' : s.mode === 'arcade' ? 'Sete desafiantes te esperam' : 'Depois, escolha o adversário';
  const emFoco = esperandoP2
    ? null
    : slot.step === 'character' ? (isRandomCard(s, slot.cursor) ? null : roster[slot.cursor]) : roster.find((c) => c.slug === slot.character);
  const cor = cpu ? 'var(--texto-3)' : direita ? 'var(--p2)' : 'var(--p1)';

  return (
    <div key={`lado-${flash}`} className="relative grid grid-rows-[auto_1fr_auto] gap-2 px-6 pb-8 pt-6" data-trava={flash > 0}>
      {flash > 0 ? <span className="sel-flash pointer-events-none absolute inset-0 z-20" style={{ background: cor }} aria-hidden="true" /> : null}
      <span className={cn('z-10 w-fit px-2 py-0.5 text-lg font-extrabold text-tinta', direita && 'justify-self-end')} style={{ background: cor }}>
        {cpu ? 'CPU' : `P${jogador + 1}`}
        {slot.step === 'ready' ? ' · pronto' : ''}
      </span>

      <div className="relative min-h-0">
        {esperandoP2 ? (
          <div className="grid h-full place-items-center text-center">
            <p className="cartela animate-pulse text-3xl uppercase text-texto-2">{aviso}</p>
          </div>
        ) : emFoco ? (
          <>
            {slot.step !== 'character' && ps1?.feras?.[emFoco.fera] ? (
              // Fera bit surgindo atrás do personagem ao escolher (D-040); a arte do PS1 olha para a esquerda.
              <img
                key={`fera-${emFoco.slug}`}
                src={ps1Beast(emFoco.fera)}
                alt=""
                className={cn('sel-fera pointer-events-none absolute top-[34%] w-[135%] max-w-none', direita ? '-right-[20%]' : '-left-[20%] -scale-x-100')}
                aria-hidden="true"
              />
            ) : null}
            {ps1?.personagens?.[emFoco.slug] ? (
              <img
                key={`${emFoco.slug}-${slot.step}`}
                src={ps1Portrait(emFoco.slug, POSE[slot.step], direita ? 'b' : 'a')}
                alt={emFoco.nome}
                className={cn('sel-figura absolute bottom-0 h-auto max-h-[78vh] w-full max-w-[34rem] object-contain object-bottom', direita ? 'right-0' : 'left-0')}
                data-entrando="true"
                style={{ '--luz': cor, '--entra-de': direita ? '40px' : '-40px' }}
              />
            ) : (
              <img
                key={emFoco.slug}
                src={retrato(emFoco.slug)}
                alt={emFoco.nome}
                className={cn('sel-figura absolute bottom-0 h-full max-h-[78vh] w-auto object-contain', direita ? 'right-0 -scale-x-100' : 'left-0')}
                data-entrando="true"
                style={{ '--luz': cor, '--entra-de': direita ? '40px' : '-40px' }}
              />
            )}
          </>
        ) : (
          <div className="grid h-full place-items-center">
            <span className="cartela text-[10rem] leading-none text-chamada/70">?</span>
          </div>
        )}

        {slot.step === 'bey' || slot.step === 'ready' ? (
          <div className="absolute inset-x-0 top-4 z-10 grid justify-items-center rounded-sm bg-tinta/55 p-3">
            <BeyCarousel
              ids={beysOf[slot.character] ?? []}
              cursor={slot.step === 'ready' ? Math.max(0, (beysOf[slot.character] ?? []).indexOf(slot.bey)) : slot.beyCursor}
              generated={generated}
              romData={romData}
              jogador={jogador}
              pronto={slot.step === 'ready'}
            />
            {slot.randomPick ? <p className="mt-2 text-sm font-semibold text-chamada">Sorteado</p> : null}
          </div>
        ) : null}
      </div>

      <p className={cn('cartela z-10 text-4xl uppercase', direita && 'text-right')}>{esperandoP2 ? '' : (emFoco?.nome ?? 'Aleatório')}</p>
    </div>
  );
}

// Faixa de "novo desafiante" quando o P2 aperta Options, atravessando a tela.
function BannerDesafiante() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/3 z-30 grid place-items-center" aria-live="assertive">
      <p className="sel-banner cartela w-full bg-chamada py-3 text-center text-5xl uppercase text-tinta">Novo desafiante!</p>
    </div>
  );
}

// Arcade: sem arena nem entrada aqui (cada luta tem a sua); só um respiro antes da escada.
function Transicao({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 400);
    return () => clearTimeout(t);
  }, [onDone]);
  return <section aria-label="Preparando o Arcade" className="sel-palco h-[calc(100dvh-3.5rem)]" />;
}

function Dicas({ s }) {
  const etapa = s.phase === 'stage' ? 'arena' : 'personagem';
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-texto-2">
      <ControlHint pad="cross" tecla="F / Enter">
        Confirmar
      </ControlHint>
      <ControlHint pad="circle" tecla="G / Backspace">
        Voltar
      </ControlHint>
      {etapa === 'personagem' && s.p2 !== 'human' && s.mode === 'versus' ? (
        <ControlHint pad="options" tecla="P">
          Entrar como P2
        </ControlHint>
      ) : null}
    </div>
  );
}
