'use client';

import { useEffect, useRef } from 'react';
import { InputManager } from '@/input/manager';

const LIMIAR = 0.6;

// Navegação de menu pelo mesmo InputManager da batalha (controle e teclado, D-015).
// onNav(jogador, acao): acao é -1/1 (esquerda/direita), 'confirmar', 'voltar', 'abaAnterior' ou 'abaProxima'.
// Dispara só na borda: um toque = um passo.
export function useMenuNav(onNav) {
  const cb = useRef(onNav);
  cb.current = onNav;

  useEffect(() => {
    const input = new InputManager();
    const prevX = [0, 0];
    let raf = 0;

    function tick() {
      input.poll().forEach((f, jogador) => {
        const x = f.move.x > LIMIAR ? 1 : f.move.x < -LIMIAR ? -1 : 0;
        if (x && x !== prevX[jogador]) cb.current(jogador, x);
        prevX[jogador] = x;
        if (f.pressed.confirm) cb.current(jogador, 'confirmar');
        if (f.pressed.back) cb.current(jogador, 'voltar');
        if (f.pressed.prevTab) cb.current(jogador, 'abaAnterior');
        if (f.pressed.nextTab) cb.current(jogador, 'abaProxima');
      });
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      input.dispose();
    };
  }, []);
}
