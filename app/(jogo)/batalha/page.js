import { BattleScreen } from '@/components/game/battle-screen';

export default async function BatalhaPage({ searchParams }) {
  const { p1, p2 } = await searchParams;
  return (
    <>
      <h1 className="sr-only">Batalha</h1>
      <BattleScreen p1={typeof p1 === 'string' ? p1 : undefined} p2={typeof p2 === 'string' ? p2 : undefined} />
    </>
  );
}
