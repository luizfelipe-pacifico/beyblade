'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { useMenuNav } from '@/hooks/use-menu-nav';
import { feraArte } from '@/content/roster';
import { FeraField } from './fera-field';
import { TitleCard } from './title-card';
import { ControlHint } from './pad-glyph';

// Aba Início: o primeiro quadro da abertura, com a Dragoon tomando a tela e um único comando.
export function StartScreen() {
  const router = useRouter();
  useMenuNav((_, acao) => {
    if (acao === 'confirmar') router.push('/modos');
  });

  return (
    <FeraField fera="dragoon" movendo className="varredura grid h-dvh content-center">
      <img
        src={feraArte('dragoon')}
        alt=""
        className="pointer-events-none absolute -right-16 bottom-0 h-[92%] max-h-[820px] w-auto"
      />
      <div className="relative grid max-w-3xl gap-8 px-8 md:px-16">
        <TitleCard nome="Beyblade Arena" sub="A batalha de Bakuten Shoot, para dois jogadores lado a lado" size="xl" as="h1" />
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/modos" className={buttonVariants({ size: 'lg' })} autoFocus>
            Jogar
          </Link>
          <ControlHint pad="cross" tecla="F / Enter">
            Começar
          </ControlHint>
        </div>
        <p className="max-w-xl text-xl font-semibold">
          Dois DualShock 4 ou o mesmo teclado: Jogador 1 em W A S D, Jogador 2 nas setas.
        </p>
      </div>
    </FeraField>
  );
}
