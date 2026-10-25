import { cn } from 'cn';
import { feras } from '@/design/tokens';

const FINISH = {
  spin: { nome: 'Parada', pontos: 1 },
  ringout: { nome: 'Fora', pontos: 2 },
  burst: { nome: 'Burst', pontos: 2 },
  xtreme: { nome: 'Xtreme', pontos: 3 },
  decision: { nome: 'Decisão', pontos: 1 },
  draw: { nome: 'Empate', pontos: 0 },
};

// Fileira de rodadas: uma linha só, que nunca quebra; a rodada atual tem a luz que corre.
export function RoundRow({ rounds, total = 7, feraP1, feraP2, className }) {
  const cells = Array.from({ length: Math.max(total, rounds.length + 1) }, (_, i) => rounds[i] ?? null);
  const atual = rounds.length;
  return (
    <ol className={cn('flex gap-1.5 overflow-hidden', className)} aria-label="Rodadas">
      {cells.map((r, i) => {
        const fera = r?.winner === 1 ? feraP1 : r?.winner === 2 ? feraP2 : null;
        const f = fera ? feras[fera] : null;
        const info = r ? FINISH[r.finish] : null;
        return (
          <li
            key={i}
            className={cn('relative flex h-14 min-w-0 flex-1 flex-col justify-center overflow-hidden px-2.5', !r && 'bg-tinta-2')}
            style={f ? { background: f.campo, color: f.campoTexto } : undefined}
            aria-current={i === atual ? 'step' : undefined}
          >
            {r ? (
              <>
                <span className="truncate text-sm font-extrabold">{r.winner ? `P${r.winner} +${info.pontos}` : 'Empate'}</span>
                <span className="truncate text-xs font-semibold">{info.nome}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-texto-3 tabular-nums">{i + 1}</span>
            )}
            {i === atual ? <span className="luz-corre absolute inset-x-0 bottom-0 h-1 bg-chamada" aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
