'use client';

import { useEffect } from 'react';

// Marca com .is-in cada [data-reveal] quando entra na tela (uma vez). O CSS faz a entrada dos filhos em sequência.
// Sem JavaScript, a classe .js não existe e tudo já aparece visível.
export default function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
