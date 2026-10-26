'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from 'cn';
import { useMenuNav } from '@/hooks/use-menu-nav';
import { pararMusica, tocarMusica } from '@/audio/music';
import { IntroVideo } from './intro-video';
import { ControlHint } from './pad-glyph';

export const ABAS = [
  { href: '/', nome: 'Início' },
  { href: '/personagens', nome: 'Personagens' },
  { href: '/batalha', nome: 'Batalha' },
];

const SELECAO_KEY = 'bb:selecao';

// Última dupla escolhida, para a aba Batalha abrir com ela. sessionStorage pode falhar (modo privado).
export function lembrarSelecao(query) {
  try {
    sessionStorage.setItem(SELECAO_KEY, query);
  } catch {}
}

function ultimaBatalha() {
  try {
    const q = sessionStorage.getItem(SELECAO_KEY);
    return q ? `/batalha?${q}` : '/batalha';
  } catch {
    return '/batalha';
  }
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

// Casca do jogo: barra com as abas e o conteúdo da tela. L1/R1 (Q/E para P1, U/O para P2) trocam de aba.
export function GameShell({ children }) {
  const path = usePathname();
  const router = useRouter();
  const atual = Math.max(0, ABAS.findIndex((a) => a.href === path));
  // Lido só depois de montar: no servidor não existe sessionStorage e a hidratação quebraria.
  const [batalhaHref, setBatalhaHref] = useState('/batalha');
  useEffect(() => setBatalhaHref(ultimaBatalha()), [path]);
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
  const hrefDaAba = (href) => (href === '/batalha' ? batalhaHref : href);

  useMenuNav((_, acao) => {
    // Na batalha L1/R1 são pulo e esquiva (D-024); as abas ficam no mouse e no Esc/Options da pausa.
    if (path === '/batalha') return;
    if (acao !== 'abaAnterior' && acao !== 'abaProxima') return;
    const proxima = (atual + (acao === 'abaProxima' ? 1 : -1) + ABAS.length) % ABAS.length;
    router.push(hrefDaAba(ABAS[proxima].href));
  });

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] bg-tinta">
      <header className="relative z-20 flex h-14 items-center gap-6 bg-tinta px-6">
        <span className="cartela text-lg uppercase">Beyblade Arena</span>
        <nav aria-label="Abas do jogo" className="flex h-full">
          {ABAS.map((aba, i) => {
            const ativa = i === atual;
            return (
              <Link
                key={aba.href}
                href={hrefDaAba(aba.href)}
                aria-current={ativa ? 'page' : undefined}
                className={cn('relative flex items-center px-5 text-base font-extrabold', ativa ? 'text-papel' : 'text-texto-2 hover:text-papel')}
              >
                {aba.nome}
                {ativa ? <span className="absolute inset-x-3 bottom-0 h-1 bg-chamada" aria-hidden="true" /> : null}
              </Link>
            );
          })}
        </nav>
        <span className={cn('ml-auto items-center gap-3 text-sm font-semibold text-texto-2', path === '/batalha' ? 'hidden' : 'hidden lg:flex')}>
          <ControlHint pad="l1" tecla="Q">
            <span className="sr-only">aba anterior</span>
          </ControlHint>
          <ControlHint pad="r1" tecla="E">
            Trocar aba
          </ControlHint>
        </span>
      </header>
      {/* A tela inicial só monta depois da abertura, para o botão que pula não confirmar a tela também. */}
      <main className="relative min-h-0">{path === '/' && intro !== false ? null : children}</main>
      {intro ? <IntroVideo onFim={fimDaIntro} /> : null}
    </div>
  );
}
