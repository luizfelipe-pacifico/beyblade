import { cn } from 'cn';
import { colors, feras } from '@/design/tokens';
import { FINISHES } from '@/sim/constants';

// Fileira de rodadas: uma linha só, que nunca quebra; a rodada atual tem a luz que corre.
// O texto fica no painel neutro (texto pequeno não vai direto sobre o campo da fera, DESIGN_SYSTEM.md);
// a cor de quem venceu entra numa faixa no topo, com a cor do jogador quando a fera não tem cor fixada.
// encerrada: partida acabou, sem célula de rodada em andamento.
export function RoundRow({ rounds, total = 3, feraP1, feraP2, encerrada = false, className }) {
  const length = encerrada ? rounds.length : Math.max(total, rounds.length + 1);
  const cells = Array.from({ length }, (_, i) => rounds[i] ?? null);
  const atual = encerrada ? -1 : rounds.length;
  return (
    <ol className={cn('flex gap-1.5 overflow-hidden', className)} aria-label="Rodadas">
      {cells.map((r, i) => {
        const fera = r?.winner === 1 ? feraP1 : r?.winner === 2 ? feraP2 : null;
        const faixa = fera ? feras[fera]?.campo : r?.winner ? [colors.p1, colors.p2][r.winner - 1] : null;
        return (
          <li
            key={i}
            className="relative flex h-14 min-w-0 flex-1 flex-col justify-center overflow-hidden bg-tinta-2 px-2.5"
            aria-current={i === atual ? 'step' : undefined}
          >
            {faixa ? <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: faixa }} aria-hidden="true" /> : null}
            {r ? (
              <>
                <span className="truncate text-sm font-extrabold">{r.winner ? `P${r.winner} vence` : 'Empate'}</span>
                <span className="truncate text-xs font-semibold text-texto-2">{r.winner ? FINISHES[r.finish] ?? r.finish : 'Ninguém pontua'}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-texto-3 tabular-nums">Rodada {i + 1}</span>
            )}
            {i === atual ? <span className="luz-corre absolute inset-x-0 bottom-0 h-1 bg-chamada" aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
