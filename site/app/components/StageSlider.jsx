'use client';

import { useState } from 'react';
import Picture from './Picture';
import { BLADERS } from '../site';
import { PsButton } from './PsButtons';

function Bey({ color, x, y }) {
  return (
    <svg className="ui-bey-svg" width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', left: x, top: y }} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="#141414" />
      <path d="M20 4l5 11h-10zM36 20l-11 5v-10zM20 36l-5-11h10zM4 20l11-5v10z" fill={color} />
      <circle cx="20" cy="20" r="6" fill="#f2f2f2" stroke="#141414" strokeWidth="2" />
    </svg>
  );
}

const STAGES = [
  {
    name: 'Personagem',
    clause: 'Primeiro, escolha seu blader',
    text: 'Todos liberados desde o começo. Cada jogador escolhe o seu, no controle ou no teclado.',
    ui: () => (
      <div className="ui">
        <div className="ui-title">
          <span>Escolha o personagem</span>
          <span className="ui-chip">P1</span>
        </div>
        <div className="ui-grid">
          {BLADERS.map((b, i) => (
            <figure key={b.id} className={i === 0 ? 'is-on' : undefined}>
              <Picture id={b.image} sizes="100px" style={{ objectPosition: b.focus }} />
              <figcaption>{b.name}</figcaption>
            </figure>
          ))}
        </div>
        <div className="ui-row">
          <span>P2 está escolhendo…</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PsButton name="cross" size={22} /> confirmar
          </span>
        </div>
      </div>
    ),
  },
  {
    name: 'Beyblade',
    clause: 'Depois, a beyblade',
    text: 'Cada personagem tem as beys que usou no anime. Peso, ponta e rotação mudam a luta.',
    ui: () => (
      <div className="ui">
        <div className="ui-title">
          <span>Tyson: escolha a beyblade</span>
          <span className="ui-chip">P1</span>
        </div>
        {[
          ['Dragoon S', 7, 'Ataque', true],
          ['Dragoon F', 7, 'Ataque', false],
          ['Dragoon V', 7, 'Ataque', false],
        ].map(([name, atk, type, on]) => (
          <div key={name} style={{ display: 'grid', gap: 6, padding: '10px 12px', background: on ? '#2a2a2a' : 'transparent', borderLeft: on ? '4px solid var(--draciel)' : '4px solid transparent' }}>
            <div className="ui-row">
              <strong>{name}</strong>
              <span>
                {type} · {atk}/10
              </span>
            </div>
            <div className="ui-bar" style={{ '--v': `${atk * 10}%` }}>
              <span />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    name: 'Lançamento',
    clause: 'Então, lance na hora certa',
    text: 'Segure para carregar e solte na faixa verde. Um lançamento bom começa a luta com mais giro.',
    ui: () => (
      <div className="ui">
        <div className="ui-title">
          <span>Lançamento</span>
          <span>Segure R2</span>
        </div>
        <p className="ui-count">3, 2, 1… Lançar!</p>
        <div className="ui-power" role="img" aria-label="Força do lançamento perto do ponto ideal">
          <span className="zone" />
          <span className="needle" />
        </div>
        <div className="ui-row">
          <span>Força 78%</span>
          <span style={{ color: 'var(--driger)', fontWeight: 600 }}>Ponto ideal</span>
        </div>
      </div>
    ),
  },
  {
    name: 'Batalha',
    clause: 'Por fim, vença na arena',
    text: 'Investida, defesa e o especial da fera bit. Ganha quem tirar o outro do estádio ou durar mais girando.',
    ui: () => (
      <div className="ui">
        <div className="ui-title">
          <span>Tyson 2 × 1 Kai</span>
          <span>1:24</span>
        </div>
        <div className="ui-dish" role="img" aria-label="Duas beyblades girando no estádio">
          <Bey color="var(--dragoon)" x="38%" y="34%" />
          <Bey color="var(--dranzer)" x="52%" y="48%" />
        </div>
        {[
          ['Dragoon S', 72, 'var(--dragoon)'],
          ['Dranzer S', 51, 'var(--dranzer)'],
        ].map(([name, v, c]) => (
          <div key={name} style={{ display: 'grid', gap: 6 }}>
            <div className="ui-row">
              <span>{name}</span>
              <span>Giro {v}%</span>
            </div>
            <div className="ui-bar" style={{ '--v': `${v}%`, '--c': c }}>
              <span />
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export default function StageSlider() {
  const [step, setStep] = useState(0);
  const stage = STAGES[step];
  const progress = `${(step / (STAGES.length - 1)) * 100}%`;

  return (
    <section id="como-jogar" className="stages" aria-labelledby="como-jogar-titulo">
      <div className="stages-copy">
        <div key={step} className="fade-swap" aria-live="polite">
          <h2 id="como-jogar-titulo">{stage.clause}</h2>
          <p className="lead">{stage.text}</p>
        </div>
      </div>
      <div className="stages-ui">
        <div key={step} className="fade-swap" data-ui="">
          {stage.ui()}
        </div>
      </div>

      <div className="stage-track">
        <div className="range-wrap" style={{ '--p': progress }}>
          <span className="range-base" aria-hidden="true" />
          <span className="range-fill" aria-hidden="true" />
          <input
            className="range"
            type="range"
            min="0"
            max={STAGES.length - 1}
            step="1"
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            aria-label="Etapa da partida"
            aria-valuetext={`${stage.name}: ${stage.clause}`}
          />
        </div>
        <div className="stage-names">
          {STAGES.map((s, i) => (
            <button key={s.name} type="button" aria-current={i === step ? 'step' : undefined} onClick={() => setStep(i)}>
              {s.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
