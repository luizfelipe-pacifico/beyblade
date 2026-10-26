import { BattleScreen } from '@/components/game/battle-screen';

const texto = (v) => (typeof v === 'string' && v ? v : undefined);

// Contrato com a seleção (D-023): /batalha?p1&p2[&b1&b2][&arena][&cpu=2].
export default async function BatalhaPage({ searchParams }) {
  const { p1, p2, b1, b2, cpu } = await searchParams;
  return (
    <>
      <h1 className="sr-only">Batalha</h1>
      <BattleScreen p1={texto(p1)} p2={texto(p2)} b1={texto(b1)} b2={texto(b2)} cpu={cpu === '2'} />
    </>
  );
}
