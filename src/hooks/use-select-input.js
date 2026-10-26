'use client';

import { useEffect, useRef } from 'react';
import { DEFAULT_DEADZONE, KEYBOARD, readPad } from '@/input/frame';

const LIMIAR = 0.6;
// Segurar a direção repete o passo, como em menu de jogo de luta (ticks de ~60 Hz).
const REPETE_APOS = 18;
const REPETE_CADA = 6;

function direcao(move) {
  if (Math.abs(move.x) >= Math.abs(move.y)) {
    if (move.x > LIMIAR) return 'right';
    if (move.x < -LIMIAR) return 'left';
  } else {
    if (move.y > LIMIAR) return 'down';
    if (move.y < -LIMIAR) return 'up';
  }
  return null;
}

// Tecla → [jogador, ação]. Montado a partir dos mapas de src/input/frame.js (D-015, D-024).
function mapaTeclado() {
  const mapa = new Map();
  KEYBOARD.forEach((m, jogador) => {
    for (const d of ['up', 'down', 'left', 'right']) mapa.set(m[d], [jogador, d]);
    for (const code of m.confirm) mapa.set(code, [jogador, 'confirm']);
    for (const code of m.back) mapa.set(code, [jogador, 'back']);
    for (const code of m.pause) mapa.set(code, [jogador, 'start']);
  });
  return mapa;
}

// Input da seleção para os dois jogadores. onAction(jogador, acao): 'left' | 'right' | 'up' | 'down' |
// 'confirm' | 'back' | 'start' (Options). O teclado vem por evento, para um toque rápido nunca se perder entre
// dois quadros; o controle vem por polling (a Gamepad API não tem eventos de botão).
export function useSelectInput(onAction, ativo = true) {
  const cb = useRef(onAction);
  cb.current = onAction;

  useEffect(() => {
    if (!ativo) return undefined;
    const teclas = mapaTeclado();

    const onKeyDown = (e) => {
      const alvo = teclas.get(e.code);
      if (!alvo) return;
      e.preventDefault();
      // Repetição automática do sistema só vale para direções.
      if (e.repeat && !['up', 'down', 'left', 'right'].includes(alvo[1])) return;
      cb.current(alvo[0], alvo[1]);
    };
    window.addEventListener('keydown', onKeyDown);

    const ultima = [null, null];
    const segurando = [0, 0];
    const antes = [{}, {}];
    let raf = 0;
    function tick() {
      const pads = navigator.getGamepads?.() ?? [];
      [0, 1].forEach((jogador) => {
        const pad = readPad(pads[jogador], DEFAULT_DEADZONE);
        if (!pad) return;
        const d = direcao(pad.move);
        if (d && d !== ultima[jogador]) {
          cb.current(jogador, d);
          segurando[jogador] = 0;
        } else if (d) {
          segurando[jogador] += 1;
          if (segurando[jogador] >= REPETE_APOS && (segurando[jogador] - REPETE_APOS) % REPETE_CADA === 0) cb.current(jogador, d);
        }
        ultima[jogador] = d;
        for (const [botao, acao] of [['confirm', 'confirm'], ['back', 'back'], ['pause', 'start']]) {
          if (pad.held[botao] && !antes[jogador][botao]) cb.current(jogador, acao);
        }
        antes[jogador] = pad.held;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [ativo]);
}
