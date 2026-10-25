import { cn } from 'cn';
import { feras } from '@/design/tokens';

// Anel de giro: o elemento-assinatura. O giro aparece no próprio desenho: mais giro = mais
// marcas no anel e rotação mais rápida. Gira só por transform, numa camada própria.
export function SpinRing({ value, dir = 1, fera, size = 160, className, children }) {
  const v = Math.min(1, Math.max(0, value));
  const ticks = Math.round(12 + v * 36);
  const seconds = v < 0.02 ? 0 : 2.6 - v * 2.3;
  const cor = fera ? feras[fera].campo : '#ffffff';
  const baixo = v < 0.25;
  // Arredonda: servidor e navegador divergem na última casa de Math.cos e a hidratação quebra.
  const r3 = (n) => Math.round(n * 1000) / 1000;
  const arc = 2 * Math.PI * 34;

  return (
    <div
      role="meter"
      aria-label="Giro"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="anel-giro absolute inset-0"
        style={{ animationDuration: seconds ? `${seconds}s` : undefined, animationDirection: dir < 0 ? 'reverse' : 'normal' }}
        data-parado={seconds === 0}
        aria-hidden="true"
      >
        {Array.from({ length: ticks }, (_, i) => {
          const a = (i / ticks) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={r3(50 + Math.cos(a) * 41)}
              y1={r3(50 + Math.sin(a) * 41)}
              x2={r3(50 + Math.cos(a) * 48)}
              y2={r3(50 + Math.sin(a) * 48)}
              stroke={cor}
              strokeWidth="2.6"
              strokeLinecap="square"
            />
          );
        })}
      </svg>
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r="34" fill="none" stroke="var(--tinta-3)" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke={baixo ? 'var(--chamada)' : 'var(--papel)'}
          strokeWidth="6"
          strokeDasharray={`${arc * v} ${arc}`}
        />
      </svg>
      <div className="absolute inset-[22%] grid place-items-center">{children}</div>
    </div>
  );
}
