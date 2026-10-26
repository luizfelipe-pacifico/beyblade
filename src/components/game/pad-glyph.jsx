import { cn } from 'cn';
import { Kbd } from '@/components/ui/kbd';

// Glifos do DualShock 4 desenhados em SVG (nada de caracteres Unicode no lugar de ícone).
// Cores das formas seguem o controle: triângulo verde, bola vermelha, xis azul, quadrado rosa.
const FACE = {
  cross: { cor: '#8fb4ff', nome: 'botão xis' },
  circle: { cor: '#ff7a7a', nome: 'botão bola' },
  square: { cor: '#ff9ad5', nome: 'botão quadrado' },
  triangle: { cor: '#5fe0b4', nome: 'botão triângulo' },
};
const PILL = { l1: 'L1', r1: 'R1', l2: 'L2', r2: 'R2', options: 'OPTIONS', share: 'SHARE' };

export function PadGlyph({ name, size = 28, className }) {
  if (FACE[name]) {
    const { cor, nome } = FACE[name];
    return (
      <svg viewBox="0 0 32 32" width={size} height={size} role="img" aria-label={nome} className={cn('shrink-0', className)}>
        <circle cx="16" cy="16" r="15" fill="#0d1226" stroke="#3a4470" strokeWidth="1.5" />
        <g fill="none" stroke={cor} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          {name === 'cross' && <path d="M10.5 10.5 21.5 21.5M21.5 10.5 10.5 21.5" />}
          {name === 'circle' && <circle cx="16" cy="16" r="6.5" />}
          {name === 'square' && <rect x="10.5" y="10.5" width="11" height="11" />}
          {name === 'triangle' && <path d="M16 9.5 23 21.5H9Z" />}
        </g>
      </svg>
    );
  }
  const label = PILL[name] ?? name.toUpperCase();
  const w = label.length > 2 ? 64 : 36;
  return (
    <svg viewBox={`0 0 ${w} 24`} width={(size * w) / 32} height={(size * 24) / 32} role="img" aria-label={`botão ${label}`} className={cn('shrink-0', className)}>
      <rect x="0.75" y="0.75" width={w - 1.5} height="22.5" rx="6" fill="#0d1226" stroke="#3a4470" strokeWidth="1.5" />
      <text x={w / 2} y="16.5" textAnchor="middle" fill="#ffffff" fontSize={label.length > 2 ? 10 : 12} fontWeight="800" fontFamily="var(--font-ui)">
        {label}
      </text>
    </svg>
  );
}

// Dica de comando: o glifo do controle e/ou a tecla, mais o que acontece. Sempre os dois juntos
// quando o jogador pode estar em qualquer um dos dispositivos (D-015).
export function ControlHint({ pad, tecla, children, className }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-base font-semibold', className)}>
      {pad ? <PadGlyph name={pad} size={26} /> : null}
      {tecla ? <Kbd className="h-7 min-w-7 whitespace-nowrap px-2 text-sm">{tecla}</Kbd> : null}
      <span>{children}</span>
    </span>
  );
}
