'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { roster } from '@/content/roster';
import { VersusSelect } from '@/components/game/versus-select';
import { lembrarSelecao } from '@/components/game/game-shell';

export default function PersonagensPage() {
  const router = useRouter();
  const batalhar = useCallback(
    (sel) => {
      const query = new URLSearchParams({ p1: roster[sel[0]].slug, p2: roster[sel[1]].slug }).toString();
      lembrarSelecao(query);
      router.push(`/batalha?${query}`);
    },
    [router],
  );

  return (
    <>
      <h1 className="sr-only">Escolha os personagens</h1>
      <VersusSelect label="Escolha os personagens" onBothReady={batalhar} onBack={() => router.push('/')} className="min-h-[calc(100dvh-3.5rem)]" />
    </>
  );
}
