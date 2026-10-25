import { cn } from 'cn';
import { feras } from '@/design/tokens';

const SEGMENTOS = 20;

// Barra do HUD em segmentos chapados (giro e especial). Especial cheio vira amarelo de chamada.
export function GaugeBar({ label, value, fera, tipo = 'giro', className }) {
  const v = Math.min(1, Math.max(0, value));
  const cheios = Math.round(v * SEGMENTOS);
  const cheio = tipo === 'especial' && cheios === SEGMENTOS;
  const cor = cheio ? 'var(--chamada)' : tipo === 'especial' ? 'var(--papel)' : fera ? feras[fera].campo : 'var(--papel)';

  return (
    <div className={cn('grid gap-1.5', className)}>
      <div className="flex items-baseline justify-between text-sm font-semibold">
        <span>{label}</span>
        <span className="tabular-nums text-texto-2">{cheio ? 'Pronto' : `${Math.round(v * 100)}%`}</span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(v * 100)}
        className="grid h-4 gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${SEGMENTOS}, 1fr)` }}
      >
        {Array.from({ length: SEGMENTOS }, (_, i) => (
          <span key={i} style={{ background: i < cheios ? cor : 'var(--tinta-3)' }} />
        ))}
      </div>
    </div>
  );
}
