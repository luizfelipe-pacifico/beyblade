import { ArcadeScreen } from '@/components/game/arcade-screen';

export default async function ArcadePage({ searchParams }) {
  const { etapa, resultado } = await searchParams;
  return (
    <>
      <h1 className="sr-only">Arcade</h1>
      <ArcadeScreen
        etapa={typeof etapa === 'string' ? etapa : undefined}
        resultado={resultado === 'vitoria' || resultado === 'derrota' ? resultado : undefined}
      />
    </>
  );
}
