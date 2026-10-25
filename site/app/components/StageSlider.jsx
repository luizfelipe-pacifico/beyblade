'use client';

import { useState } from 'react';
import Picture from './Picture';
import { BLADERS } from '../site';
import { PsButton } from './PsButtons';
import BattleLoop from './BattleLoop';

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
          <div key={name} className={`ui-pick${on ? ' is-on' : ''}`}>
            <div className="ui-row">
              <strong>{name}</strong>
              <span>
                {type} · {atk}/10
              </span>
            </div>
            <div className="ui-bar" style={{ '--value': atk / 10 }}>
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
          <span style={{ color: 'var(--chamada)', fontWeight: 600 }}>Ponto ideal</span>
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
        <BattleLoop />
        {[
          ['Dragoon S', 72],
          ['Dranzer S', 51],
        ].map(([name, v]) => (
          <div key={name} style={{ display: 'grid', gap: 6 }}>
            <div className="ui-row">
              <span>{name}</span>
              <span>Giro {v}%</span>
            </div>
            <div className="ui-bar" style={{ '--value': v / 100 }}>
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
  const progress = step / (STAGES.length - 1);

  return (
    <section id="como-jogar" className="stages" aria-labelledby="como-jogar-titulo">
      <div className="stages-copy" data-reveal="">
        <div aria-live="polite">
          <h2 id="como-jogar-titulo">{stage.clause}</h2>
          <p className="lead">{stage.text}</p>
        </div>
      </div>
      <div className="stages-ui" data-reveal="">
        <div data-ui="">
          {stage.ui()}
        </div>
      </div>

      <div className="stage-track">
        <div className="range-wrap" style={{ '--progress': progress }}>
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
