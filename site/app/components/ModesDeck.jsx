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
      <div className="mode-list">
        {MODES.map(([title, text]) => (
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
