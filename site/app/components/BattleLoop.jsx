'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

// A versão estática é o padrão: sem JS e com movimento reduzido, nada começa a girar.
export default function BattleLoop({ className = '' }) {
  const root = useRef(null);
  const [visible, setVisible] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setAllowed(!reduced.matches && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(root.current);
    update();
    reduced.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      reduced.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  const playing = visible && allowed && !paused;
  const Icon = paused ? Play : Pause;
  return (
    <div className={`battle-loop ${className}`} ref={root}>
      <img src={`/beyblades/${playing ? 'battle-loop' : 'battle-poster'}.webp`} width="768" height="432"
        alt="Ilustração de Dragoon S e Dranzer S girando em sentidos opostos e se encontrando na arena" loading="lazy" decoding="async" />
      <div className="battle-loop-caption">
        <span>Dragoon × Dranzer <span className="small">· Ilustração</span></span>
        {allowed && <button type="button" aria-label={paused ? 'Reproduzir animação' : 'Pausar animação'} onClick={() => setPaused(value => !value)}>
          <Icon size={18} aria-hidden="true" /> {paused ? 'Reproduzir' : 'Pausar'}
        </button>}
      </div>
    </div>
  );
}
