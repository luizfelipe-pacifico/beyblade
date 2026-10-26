'use client';

import { ArenaRenderer } from './arena-renderer';
import { cenario as acharCenario } from '@/content/cenarios';

// Estádio de verdade (chão do cenário + tigela funda com bolsos e parede) desenhado parado num canvas,
// com o mesmo render da batalha (D-050). Para a entrada na arena (walk-in) e a "foto do lugar" na
// escolha do estádio. `cenario` é o objeto de src/content/cenarios.js ou um slug ('rom-N' também vale).
// O canvas precisa estar no layout (tamanho vem do CSS). Devolve uma função para redesenhar no resize.
export function desenharEstadio(canvas, cenario) {
  const c = typeof cenario === 'string' ? acharCenario(cenario) : cenario;
  const r = new ArenaRenderer(canvas, [], [], c);
  r.desenharParado();
  return () => {
    r.resize();
    r.desenharParado();
  };
}
