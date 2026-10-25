'use client';

import { useEffect, useRef } from 'react';

const LIMIAR = 0.6;
// Teclas de navegação por jogador (mapa padrão de docs/CONTROLLERS.md, D-015).
const TECLAS = {
  KeyA: [0, -1], KeyD: [0, 1], KeyF: [0, 'confirmar'],
  ArrowLeft: [1, -1], ArrowRight: [1, 1], KeyK: [1, 'confirmar'],
};

// Navegação de menu por controle e teclado. Lê navigator.getGamepads() a cada frame (os objetos
// são snapshots), aplica limiar no analógico e dispara só na borda: um toque = um passo.
export function useMenuNav(onNav) {
  const cb = useRef(onNav);
  cb.current = onNav;

  useEffect(() => {
    const anterior = [{ x: 0, a: false }, { x: 0, a: false }];
    let raf = 0;

    function tick() {
      const pads = navigator.getGamepads?.() ?? [];
      for (let jogador = 0; jogador < 2; jogador++) {
        const pad = pads[jogador];
        if (!pad) continue;
        const eixo = pad.axes[0] ?? 0;
        const esquerda = eixo < -LIMIAR || pad.buttons[14]?.pressed;
        const direita = eixo > LIMIAR || pad.buttons[15]?.pressed;
        const x = esquerda ? -1 : direita ? 1 : 0;
        const a = Boolean(pad.buttons[0]?.pressed);
        if (x !== 0 && x !== anterior[jogador].x) cb.current(jogador, x);
        if (a && !anterior[jogador].a) cb.current(jogador, 'confirmar');
        anterior[jogador] = { x, a };
      }
      raf = requestAnimationFrame(tick);
    }

    function onKey(e) {
      const alvo = e.target;
      if (alvo instanceof HTMLElement && alvo.closest('input, textarea, select, [contenteditable="true"]')) return;
      const mapa = TECLAS[e.code];
      if (!mapa || e.repeat) return;
      e.preventDefault();
      cb.current(mapa[0], mapa[1]);
    }

    raf = requestAnimationFrame(tick);
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    };
  }, []);
}
