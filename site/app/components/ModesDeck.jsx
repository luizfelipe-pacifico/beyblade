'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bot, Dumbbell, Swords, Trophy } from 'lucide-react';
import { ROADMAP_URL } from '../site';

const MODES = [
  { title: '1 contra 1', text: 'Dois jogadores no mesmo PC: dois DualShock 4, os dois no teclado ou um de cada.', Icon: Swords, tone: '#ffe27a' },
  { title: 'Contra a CPU', text: 'Cada personagem luta do jeito do anime: Tyson parte pra cima, Max segura, Kai calcula.', Icon: Bot, tone: '#ffc21a' },
  { title: 'Arcade', text: 'Uma sequência de adversários até o chefe final, com o mesmo blader do começo ao fim.', Icon: Trophy, tone: '#f0b000' },
  { title: 'Treino', text: 'Arena livre para testar lançamento, peças e especiais, sem placar e sem pressa.', Icon: Dumbbell, tone: '#ffe27a' },
];
const SPINE = 120;

// Seção presa por pouco mais de duas telas: cada passo da rolagem traz o próximo modo pela direita
// e os anteriores ficam como lombadas de 120 px à esquerda. No celular vira uma pilha simples (CSS).
export default function ModesDeck() {
  const pin = useRef(null);
  const deck = useRef(null);
  const [active, setActive] = useState(0);
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    function update() {
      const el = pin.current;
      const total = el.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-el.getBoundingClientRect().top, 0), total);
      const progress = total > 0 ? passed / total : 0;
      setActive(Math.min(MODES.length - 1, Math.floor(progress * MODES.length)));
      setWidth(deck.current.offsetWidth);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Clicar numa lombada rola até o ponto em que aquele cartão fica aberto.
  function open(i) {
    const el = pin.current;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + total * ((i + 0.5) / MODES.length) });
  }

  return (
    <section id="modos" className="modes" aria-labelledby="modos-titulo">
      <div className="modes-pin" ref={pin}>
        <div className="modes-stage">
          <h2 id="modos-titulo" className="head">
            Quatro modos de jogo
          </h2>
          <ol className="deck" ref={deck}>
            {MODES.map(({ title, text, Icon, tone }, i) => {
              // Anteriores: lombada de 120 px com o título na vertical. Atual: aberta. Seguintes: escondidas à direita.
              const state = i < active ? 'past' : i > active ? 'future' : 'open';
              const style = {
                '--tone': tone,
                '--x': state === 'future' ? Math.min(width, i * SPINE + 240) : i * SPINE,
                '--clip': state === 'past' ? `calc(100% - ${SPINE}px)` : '0px',
              };
              return (
                <li key={title} className="mode" data-state={state} style={style} aria-current={state === 'open' ? 'true' : undefined}>
                  <div className="mode-full">
                    <div className="mode-icon">
                      <Icon size={28} strokeWidth={2.25} aria-hidden="true" />
                      <h3>{title}</h3>
                    </div>
                    <p>{text}</p>
                    <footer>
                      <span>Previsto para o Alpha</span>
                      <a href={ROADMAP_URL}>Ver no roadmap</a>
                    </footer>
                  </div>
                  <button type="button" className="mode-spine" tabIndex={-1} aria-hidden="true" onClick={() => open(i)}>
                    {title}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="modes-foot">
            Quatro modos no lançamento, todos para jogar sem internet.{' '}
            <a href={ROADMAP_URL}>
              Ver o plano completo
              <ArrowUpRight size={16} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-2px', marginLeft: 2 }} />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
