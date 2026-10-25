'use client';

import { useEffect } from 'react';

// O conteúdo permanece visível sem JS. O observer dispara uma entrada curta por seção.
export default function Reveal() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        entry.target.classList.add('is-in');
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
    const stop = () => {
      if (!reduced.matches) return;
      observer.disconnect();
    };
    reduced.addEventListener('change', stop);
    return () => {
      observer.disconnect();
      reduced.removeEventListener('change', stop);
    };
  }, []);
  return null;
}
