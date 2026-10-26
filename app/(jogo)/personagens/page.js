'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterSelect } from '@/components/game/character-select';
import { lembrarSelecao } from '@/components/game/game-shell';

export default function PersonagensPage() {
  const router = useRouter();
  const batalhar = useCallback(
    (query) => {
      lembrarSelecao(query);
      router.push(`/batalha?${query}`);
    },
    [router],
  );
  const sair = useCallback(() => router.push('/'), [router]);

  return (
    <>
      <h1 className="sr-only">Escolha os personagens</h1>
      <CharacterSelect onBattle={batalhar} onExit={sair} />
    </>
  );
}
