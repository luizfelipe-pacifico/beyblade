// Os quatro botões de face do DualShock 4, desenhados em SVG (nada de caracteres unicode no lugar de ícone).
const shapes = {
  cross: { label: 'Xis', d: <path d="M8 8l16 16M24 8L8 24" /> },
  circle: { label: 'Círculo', d: <circle cx="16" cy="16" r="9" /> },
  square: { label: 'Quadrado', d: <rect x="8" y="8" width="16" height="16" /> },
  triangle: { label: 'Triângulo', d: <path d="M16 7l10 17H6z" /> },
};

export function PsButton({ name, size = 32 }) {
  const s = shapes[name];
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label={s.label}>
      <circle cx="16" cy="16" r="15" fill="#111111" />
      <g fill="none" stroke="#f2f2f2" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round">
        {s.d}
      </g>
    </svg>
  );
}

export default function PsButtons({ size }) {
  return (
    <span className="ps">
      {Object.keys(shapes).map((name) => (
        <PsButton key={name} name={name} size={size} />
      ))}
    </span>
  );
}
