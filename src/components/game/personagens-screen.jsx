'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { roster } from '@/content/roster';
import { createLadder } from '@/game/arcade';
import { saveLadder } from '@/game/arcade-storage';
import { CharacterSelect } from './character-select';
import { lembrarSelecao } from './game-shell';

// Liga a seleção ao modo (D-005): versus/cpu/treino vão direto para a batalha; o Arcade monta a escada de
// oponentes com o personagem e a bey escolhidos e segue para a tela da escada.
export function PersonagensScreen({ modo }) {
  const router = useRouter();
  const pronto = useCallback(
    (query) => {
      if (modo === 'arcade') {
        const q = new URLSearchParams(query);
        const ladder = createLadder({ player: q.get('p1'), characters: roster.map((c) => c.slug) });
        saveLadder({ ...ladder, playerBey: q.get('b1') });
        router.push('/arcade');
        return;
      }
      lembrarSelecao(query);
      router.push(`/batalha?${query}`);
    },
    [modo, router],
  );
  const sair = useCallback(() => router.push('/modos'), [router]);
  return <CharacterSelect key={modo} mode={modo} onBattle={pronto} onExit={sair} />;
}
