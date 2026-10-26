import { PersonagensScreen } from '@/components/game/personagens-screen';

const MODOS = new Set(['versus', 'cpu', 'arcade', 'treino']);

export default async function PersonagensPage({ searchParams }) {
  const { modo } = await searchParams;
  return (
    <>
      <h1 className="sr-only">Escolha os personagens</h1>
      <PersonagensScreen modo={MODOS.has(modo) ? modo : 'versus'} />
    </>
  );
}
