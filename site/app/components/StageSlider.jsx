'use client';

import { useRef, useState } from 'react';
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
    text: 'Segure para carregar e solte na faixa amarela. Um lançamento bom começa a luta com mais giro.',
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
          <span>Dragoon S × Dranzer S</span>
        </div>
        <BattleLoop />
      </div>
    ),
  },
];

export default function StageSlider() {
  const [step, setStep] = useState(0);
  const tabs = useRef([]);
  const stage = STAGES[step];

  function onKeyDown(event) {
    const next = {
      ArrowRight: (step + 1) % STAGES.length,
      ArrowLeft: (step - 1 + STAGES.length) % STAGES.length,
      Home: 0,
      End: STAGES.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setStep(next);
    tabs.current[next].focus();
  }

  return (
    <section id="como-jogar" className="stages" aria-labelledby="como-jogar-titulo">
      <div className="section-intro" data-reveal="">
        <h2 id="como-jogar-titulo" className="head">Do lançamento à arena</h2>
        <p className="lead">Escolha cada etapa e veja como a partida está sendo pensada.</p>
      </div>
      <div className="stage-names" role="tablist" aria-label="Etapas da partida" onKeyDown={onKeyDown}>
        {STAGES.map((s, i) => (
          <button key={s.name} type="button" role="tab" id={`step-${i}`} aria-controls="stage-preview"
            aria-selected={i === step} tabIndex={i === step ? 0 : -1}
            ref={(el) => { tabs.current[i] = el; }} onClick={() => setStep(i)}>
            <span className="step-number" aria-hidden="true">{i + 1}</span>{s.name}
          </button>
        ))}
      </div>
      <div className="stages-panel" id="stage-preview" role="tabpanel" tabIndex={0} aria-labelledby={`step-${step}`}>
        <div className="stages-copy">
          <h3>{stage.clause}</h3>
          <p className="lead">{stage.text}</p>
          <p className="small stage-disclaimer">Ilustrações do fluxo planejado, sem imagens de gameplay.</p>
        </div>
        <div className="stages-ui" data-ui="">{stage.ui()}</div>
      </div>
    </section>
  );
}
