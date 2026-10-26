'use client';

import { useEffect, useRef } from 'react';
import { useMenuNav } from '@/hooks/use-menu-nav';
import { ControlHint } from './pad-glyph';

// Abertura do anime antes da tela inicial (D-038). O vídeo é do usuário, em public/video/ (fora do
// git); se faltar ou o navegador recusar tocar, a abertura some sem erro e o jogo segue.
export const INTRO_URL = '/video/abertura.mp4';

export function IntroVideo({ onFim }) {
  const ref = useRef(null);
  const fim = useRef(onFim);
  fim.current = onFim;

  useMenuNav((_, acao) => {
    if (acao === 'confirmar' || acao === 'voltar') fim.current();
  });

  useEffect(() => {
    const v = ref.current;
    v.play().catch(() => fim.current());
    // Options / Esc também pula (o hook de menu não lê a pausa).
    const onKey = (e) => e.key === 'Escape' && fim.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black">
      <video ref={ref} src={INTRO_URL} className="h-full w-full object-contain" playsInline onEnded={() => fim.current()} onError={() => fim.current()} />
      <div className="absolute bottom-6 right-8 flex items-center gap-4 bg-tinta/80 px-4 py-2 text-papel">
        <ControlHint pad="cross" tecla="F / Enter">
          Pular abertura
        </ControlHint>
      </div>
    </div>
  );
}
