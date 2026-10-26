'use client';

import { useCallback, useState } from 'react';
import { cn } from 'cn';
import { useSelectInput } from '@/hooks/use-select-input';
import { uiSounds } from '@/audio/ui-sounds';
import { ControlHint } from './pad-glyph';
import './select.css';

export const MODOS = [
  { id: 'versus', nome: '1 vs 1', descricao: 'Dois jogadores lado a lado, com dois controles ou no mesmo teclado.' },
  { id: 'cpu', nome: '1 vs CPU', descricao: 'Você escolhe seu personagem e o adversário da CPU.' },
  { id: 'arcade', nome: 'Arcade', descricao: 'Sete lutas seguidas contra a CPU, ficando mais difícil, até o chefe final.' },
  { id: 'treino', nome: 'Treino', descricao: 'Arena livre contra um adversário parado, para testar lançamento e golpes.' },
];

// Escolha do modo de jogo (D-005), navegável pelo controle e pelo teclado.
export function ModeSelect({ onPick, onBack }) {
  const [cursor, setCursor] = useState(0);
  const agir = useCallback(
    (jogador, acao) => {
      if (jogador !== 0) return;
      if (acao === 'left' || acao === 'up') {
        uiSounds.move();
        setCursor((c) => (c - 1 + MODOS.length) % MODOS.length);
      } else if (acao === 'right' || acao === 'down') {
        uiSounds.move();
        setCursor((c) => (c + 1) % MODOS.length);
      } else if (acao === 'confirm') {
        uiSounds.lockIn();
        onPick(MODOS[cursor].id);
      } else if (acao === 'back') {
        uiSounds.back();
        onBack();
      }
    },
    [cursor, onPick, onBack],
  );
  useSelectInput(agir);

  return (
    <section aria-label="Modos de jogo" className="sel-palco grid h-dvh content-center gap-10 px-[var(--gutter)]">
      <h2 className="cartela text-center text-5xl uppercase">Escolha o modo</h2>
      <ul className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 md:grid-cols-4" role="listbox" aria-label="Modos">
        {MODOS.map((m, i) => {
          const foco = i === cursor;
          return (
            <li key={m.id} role="option" aria-selected={foco}>
              <button
                type="button"
                className={cn('sel-card grid h-full w-full gap-3 p-6 text-left', foco && 'sel-cursor outline outline-4 outline-chamada text-chamada')}
                data-foco={foco}
                onMouseEnter={() => setCursor(i)}
                onClick={() => {
                  uiSounds.lockIn();
                  onPick(m.id);
                }}
              >
                <span className="cartela text-4xl uppercase text-papel">{m.nome}</span>
                <span className="text-base font-semibold text-texto-2">{m.descricao}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-texto-2">
        <ControlHint pad="cross" tecla="F / Enter">
          Confirmar
        </ControlHint>
        <ControlHint pad="circle" tecla="G / Backspace">
          Voltar
        </ControlHint>
      </div>
    </section>
  );
}
