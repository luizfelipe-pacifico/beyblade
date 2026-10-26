import { BattleScreen } from '@/components/game/battle-screen';

const texto = (v) => (typeof v === 'string' && v ? v : undefined);
const MODOS = new Set(['versus', 'cpu', 'arcade', 'treino']);
const inteiro = (v, min, max, padrao) => {
  const n = Number.parseInt(v, 10);
  return Number.isInteger(n) && n >= min && n <= max ? n : padrao;
};

// Contrato com a seleção (D-023, D-035): /batalha?p1&p2[&b1&b2][&arena][&cpu=2][&modo&etapa&cpuNivel].
export default async function BatalhaPage({ searchParams }) {
  const { p1, p2, b1, b2, arena, cpu, modo, etapa, cpuNivel } = await searchParams;
  return (
    <>
      <h1 className="sr-only">Batalha</h1>
      <BattleScreen
        p1={texto(p1)}
        p2={texto(p2)}
        b1={texto(b1)}
        b2={texto(b2)}
        arena={texto(arena)}
        cpu={cpu === '2'}
        modo={MODOS.has(modo) ? modo : cpu === '2' ? 'cpu' : 'versus'}
        etapa={inteiro(etapa, 0, 20, 0)}
        cpuNivel={inteiro(cpuNivel, 1, 5, 1)}
      />
    </>
  );
}
