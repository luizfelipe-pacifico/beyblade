import { cn } from 'cn';
import { feras } from '@/design/tokens';

// Campo de fera: a cor da fera bit toma a área inteira, com as linhas de velocidade por trás.
// Sem fera definida, cai no painel neutro (personagens cuja arte ainda não fixou a cor).
export function FeraField({ fera, movendo = false, className, style, children, ...props }) {
  const f = fera ? feras[fera] : null;
  return (
    <div
      className={cn('campo', className)}
      style={{ '--campo': f?.campo, '--campo-texto': f?.campoTexto, ...style }}
      {...props}
    >
      <div className="linhas" aria-hidden="true" data-movendo={movendo} />
      {children}
    </div>
  );
}
