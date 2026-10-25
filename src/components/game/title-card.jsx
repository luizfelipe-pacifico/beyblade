import { cn } from 'cn';

const SIZES = {
  xl: 'text-[clamp(3.5rem,8vw,6rem)]',
  lg: 'text-[clamp(2.5rem,5vw,4rem)]',
  md: 'text-3xl',
};

// Cartela de título: o nome em gótica pesada, como os nomes na abertura do anime.
// A linha de apoio fica em 20px+ negrito, que conta como texto grande no WCAG sobre os campos.
export function TitleCard({ nome, sub, size = 'lg', align = 'left', as: Tag = 'h2', className }) {
  return (
    <div className={cn('flex flex-col gap-3', align === 'right' && 'items-end text-right', className)}>
      <Tag className={cn('cartela uppercase', SIZES[size])}>{nome}</Tag>
      {sub ? <p className="text-xl font-extrabold">{sub}</p> : null}
    </div>
  );
}

export function VsBadge({ className }) {
  return (
    <span className={cn('vs inline-block px-6 text-[clamp(4rem,9vw,6rem)]', className)} aria-label="contra">
      VS
    </span>
  );
}
