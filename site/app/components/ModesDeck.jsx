import { ArrowUpRight } from 'lucide-react';
import { ROADMAP_URL } from '../site';

const MODES = [
  ['1 contra 1', 'Dois jogadores no mesmo PC: dois DualShock 4, os dois no teclado ou um de cada.'],
  ['Contra a CPU', 'Cada personagem luta do jeito do anime: Tyson parte pra cima, Max segura, Kai calcula.'],
  ['Arcade', 'Uma sequência de adversários até o chefe final, com o mesmo blader do começo ao fim.'],
  ['Treino', 'Arena livre para testar lançamento, peças e especiais, sem placar e sem pressa.'],
];

export default function ModesDeck() {
  return (
    <section id="modos" className="modes" aria-labelledby="modos-titulo">
      <div className="section-intro" data-reveal="">
        <h2 id="modos-titulo" className="head">Encontre sua luta</h2>
        <p className="lead">Quatro modos planejados para o Alpha. Todos para jogar sem internet.</p>
      </div>
      <article className="mode-feature" data-reveal="">
        <div><h3>{MODES[0][0]}</h3><p>{MODES[0][1]}</p></div>
        <div className="versus-art" role="img" aria-label="Dragoon e Dranzer frente a frente">
          <img src="/beyblades/dragoon-s.svg" alt="" width="768" height="768" loading="lazy" />
          <span aria-hidden="true">VS</span>
          <img src="/beyblades/dranzer-s.svg" alt="" width="768" height="768" loading="lazy" />
        </div>
      </article>
      <div className="mode-list">
        {MODES.slice(1).map(([title, text]) => (
          <article className="mode" key={title} data-reveal="">
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <a className="text-link" href={ROADMAP_URL}>Ver o plano completo <ArrowUpRight size={18} aria-hidden="true" /></a>
    </section>
  );
}
