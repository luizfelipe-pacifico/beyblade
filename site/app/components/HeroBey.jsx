'use client';

import { useEffect, useRef } from 'react';
import { ArrowDown, RotateCcw } from 'lucide-react';

export default function HeroBey() {
  const scene = useRef(null);
  const rotor = useRef(null);

  useEffect(() => {
    const element = scene.current;
    const bey = rotor.current;
    const hero = element.closest('.hero');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let visible = false;
    const draw = () => {
      frame = 0;
      if (!visible || document.hidden || reduced.matches) return;
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
      bey.style.transform = `rotate(${-14 - progress * 1080}deg)`;
      element.dataset.progress = progress.toFixed(3);
    };
    const request = () => {
      if (!frame && visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(draw);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) request();
      else { cancelAnimationFrame(frame); frame = 0; }
    });
    observer.observe(element);
    const preference = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (reduced.matches) bey.style.removeProperty('transform');
      else request();
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    document.addEventListener('visibilitychange', preference);
    reduced.addEventListener('change', preference);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      document.removeEventListener('visibilitychange', preference);
      reduced.removeEventListener('change', preference);
    };
  }, []);

  return (
    <figure className="hero-bey-scene" ref={scene}>
      <div className="hero-bey-stage">
        <svg className="hero-stadium" viewBox="0 0 700 700" aria-hidden="true">
          <circle cx="350" cy="350" r="292" fill="var(--tinta-3)" />
          <circle cx="350" cy="350" r="246" fill="var(--tinta-2)" />
          <circle cx="350" cy="350" r="215" fill="none" stroke="var(--tinta-3)" strokeWidth="3" />
        </svg>
        <div className="hero-bey-plane">
          <img ref={rotor} className="hero-bey-rotor" src="/beyblades/dragoon-s.svg" width="768" height="768"
            alt="Dragoon S de Tyson, com anel branco e emblema azul do Dragoon, vista de cima"
            fetchPriority="high" decoding="async" />
        </div>
      </div>
      <figcaption className="hero-bey-caption">
        <div><strong>Dragoon S</strong><span>Tyson Granger · Ataque</span></div>
        <span className="hero-spin-label"><RotateCcw size={18} aria-hidden="true" /> Giro à esquerda</span>
      </figcaption>
      <a className="hero-scroll-cue" href="#personagens"><ArrowDown size={18} aria-hidden="true" /> Conheça os bladers</a>
    </figure>
  );
}
