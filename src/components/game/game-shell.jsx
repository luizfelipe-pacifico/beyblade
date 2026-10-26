'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { pararMusica, tocarMusica } from '@/audio/music';
import { IntroVideo } from './intro-video';

const SELECAO_KEY = 'bb:selecao';

// Última dupla escolhida (lida pela seleção para reabrir com ela). sessionStorage pode falhar (modo privado).
export function lembrarSelecao(query) {
  try {
    sessionStorage.setItem(SELECAO_KEY, query);
  } catch {}
}

// A abertura do anime toca uma vez por sessão, ao abrir o jogo pela tela inicial (D-038).
const INTRO_KEY = 'beyblade:intro-vista';
function introJaVista() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return true;
  }
}

// Casca do jogo: tela cheia, sem barra de abas de site (D-044). Cada tela tem a própria navegação de
// jogo (✕ avança, ○ volta, Options pausa); aqui ficam só a abertura e a música de cada tela.
export function GameShell({ children }) {
  const path = usePathname();
  // undefined até montar (sessionStorage só existe no cliente); true enquanto a abertura toca.
  const [intro, setIntro] = useState(undefined);
  useEffect(() => setIntro(path === '/' && !introJaVista()), []);
  const fimDaIntro = () => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {}
    setIntro(false);
  };
  // Trilha de cada tela; na batalha a própria tela troca para a faixa da rodada decisiva. Durante a
  // abertura em vídeo, o som é o do vídeo.
  useEffect(() => {
    if (intro !== false) return pararMusica();
    const faixa = { '/': 'abertura', '/personagens': 'selecao', '/batalha': 'batalha' }[path] ?? 'inicio';
    tocarMusica(faixa);
  }, [path, intro]);

  return (
    <div className="h-dvh overflow-hidden bg-tinta">
      {/* A tela inicial só monta depois da abertura, para o botão que pula não confirmar a tela também. */}
      <main className="relative h-full">{path === '/' && intro !== false ? null : children}</main>
      {intro ? <IntroVideo onFim={fimDaIntro} /> : null}
    </div>
  );
}
