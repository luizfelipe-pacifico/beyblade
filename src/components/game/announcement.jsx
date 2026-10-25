import { cn } from 'cn';

// Anúncio de finalização (XTREME FINISH, BURST...): faixa de chamada inclinada, entra por varredura.
export function Announcement({ titulo, sub, className }) {
  return (
    <div role="status" className={cn('varredura -rotate-3 bg-chamada px-8 py-5 text-tinta', className)}>
      <p className="cartela text-[clamp(2.75rem,7vw,5.5rem)] uppercase">{titulo}</p>
      {sub ? <p className="mt-2 text-2xl font-extrabold">{sub}</p> : null}
    </div>
  );
}
