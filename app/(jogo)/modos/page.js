'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ModeSelect } from '@/components/game/mode-select';

export default function ModosPage() {
  const router = useRouter();
  const escolher = useCallback((modo) => router.push(`/personagens?modo=${modo}`), [router]);
  const voltar = useCallback(() => router.push('/'), [router]);
  return (
    <>
      <h1 className="sr-only">Modos de jogo</h1>
      <ModeSelect onPick={escolher} onBack={voltar} />
    </>
  );
}
