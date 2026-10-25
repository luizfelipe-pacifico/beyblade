'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import Picture from './Picture';
import { BEASTS, BLADERS } from '../site';

const MAX_STAT = 10;

// Tela de seleção estilo jogo de luta: nomes à esquerda, ficha do blader à direita.
// A cor do palco é a da fera bit do personagem escolhido.
export default function CharacterSelect() {
  const [index, setIndex] = useState(0);
  const buttons = useRef([]);
  const section = useRef(null);
  const blader = BLADERS[index];

  function select(next, focus = false) {
    const i = (next + BLADERS.length) % BLADERS.length;
    setIndex(i);
    if (focus) buttons.current[i]?.focus();
  }

  function onKeyDown(e) {
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      select(e.key === 'Home' ? 0 : BLADERS.length - 1, true);
      return;
    }
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    select(index + step, true);
  }

  // Bônus: com um DualShock 4 conectado e a seção na tela, o direcional troca o personagem.
  useEffect(() => {
    let raf = 0;
    let visible = false;
    let last = { up: false, down: false };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(section.current);

    function poll() {
      raf = requestAnimationFrame(poll);
      if (!visible || document.hidden) return;
      const pad = [...(navigator.getGamepads?.() ?? [])].find(Boolean);
      if (!pad) { last = { up: false, down: false }; return; }
      const up = pad.buttons[12]?.pressed || pad.axes[1] < -0.6;
      const down = pad.buttons[13]?.pressed || pad.axes[1] > 0.6;
      if (up && !last.up) setIndex((i) => (i - 1 + BLADERS.length) % BLADERS.length);
      if (down && !last.down) setIndex((i) => (i + 1) % BLADERS.length);
      last = { up, down };
    }
    const start = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(poll);
    };
    window.addEventListener('gamepadconnected', start);
    if ([...(navigator.getGamepads?.() ?? [])].some(Boolean)) start();
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('gamepadconnected', start);
    };
  }, []);

  const color = BEASTS[blader.beast].color;
  const SpinIcon = blader.spin === 'Esquerda' ? RotateCcw : RotateCw;

  return (
    <section id="personagens" className="select on-night" aria-labelledby="personagens-titulo" ref={section}>
      <div className="select-side" data-reveal="">
        <h2 id="personagens-titulo" className="head" style={{ '--i': 0 }}>
          Escolha seu blader
        </h2>
        <div className="names" role="group" aria-label="Personagens" onKeyDown={onKeyDown} style={{ '--i': 1 }}>
          {BLADERS.map((b, i) => (
            <button
              key={b.id}
              ref={(el) => (buttons.current[i] = el)}
              type="button"
              aria-pressed={i === index}
              aria-controls="ficha"
              onClick={() => select(i)}
              style={{ '--c': BEASTS[b.beast].color }}
            >
              <span className="swatch" aria-hidden="true" />
              {b.name}
            </button>
          ))}
        </div>
        <p style={{ '--i': 2 }}>
          Os quatro Bladebreakers da primeira temporada, cada um com a sua fera bit. Os atributos saem das peças
          reais de cada beyblade, como referência para o balanceamento.
        </p>
      </div>

      <div className="stage" style={{ '--c': color, '--field-text': BEASTS[blader.beast].text }}>
        <article id="ficha" className="card" data-ui="" aria-live="polite" aria-atomic="true" style={{ '--c': color }}>
          <div className="card-visual">
            <div className="card-photo">
              <Picture id={blader.image} sizes="(max-width: 800px) 42vw, 300px" style={{ objectPosition: blader.focus }} />
              <span className="card-tag">{BEASTS[blader.beast].name}</span>
            </div>
            <div className="card-bey">
              <img src={`/beyblades/${blader.beast}-s.svg`} alt={`Ilustração da ${blader.bey}`} width="768" height="768" loading="lazy" />
            </div>
          </div>
          <div className="card-body">
            <div className="card-name">
              <h3>{blader.fullName}</h3>
              <span>{blader.beastLabel}</span>
            </div>
            <dl className="card-facts">
              <div>
                <dt>Beyblade</dt>
                <dd>{blader.bey}</dd>
              </div>
              <div>
                <dt>Rotação</dt>
                <dd style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SpinIcon size={18} strokeWidth={2.5} aria-hidden="true" />
                  {blader.spin}
                </dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>{blader.type}</dd>
              </div>
            </dl>
            <dl className="stats" aria-label="Atributos, de 1 a 10">
              {Object.entries(blader.stats).map(([name, value]) => (
                <div className="stat" key={name}>
                  <dt>{name}</dt>
                  <dd>
                    <span className="meter" aria-hidden="true">
                      <span style={{ '--v': value / MAX_STAT }} />
                    </span>
                    <span>{value}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="special">
              <strong>Especial planejado: {blader.special.name}</strong>
              {blader.special.text}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
