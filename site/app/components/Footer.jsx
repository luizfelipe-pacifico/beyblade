import { ArrowUpRight } from 'lucide-react';
import { ISSUES_URL, LICENSE_URL, RELEASES_URL, REPO, ROADMAP_URL } from '../site';

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer-name" aria-hidden="true">
        Beyblade Arena
      </p>
      <div className="footer-row">
        <ul className="places" aria-label="Onde encontrar o projeto">
          <li>
            <a href={REPO}>
              Código no GitHub <ArrowUpRight size={28} aria-hidden="true" />
            </a>
          </li>
          <li>
            <a href={RELEASES_URL}>
              Todas as versões <ArrowUpRight size={28} aria-hidden="true" />
            </a>
          </li>
          <li>
            <a href={ISSUES_URL}>
              Reportar um problema <ArrowUpRight size={28} aria-hidden="true" />
            </a>
          </li>
        </ul>
        <nav className="footer-links" aria-label="Rodapé">
          <div>
            <h3>Nesta página</h3>
            <ul>
              <li><a href="/#personagens">Personagens</a></li>
              <li><a href="/#como-jogar">Como jogar</a></li>
              <li><a href="/#controles">Controles</a></li>
              <li><a href="/#modos">Modos de jogo</a></li>
              <li><a href="/#perguntas">Perguntas</a></li>
            </ul>
          </div>
          <div>
            <h3>Projeto</h3>
            <ul>
              <li><a href="/#estagio">Andamento do projeto</a></li>
              <li><a href={ROADMAP_URL}>Roadmap</a></li>
              <li><a href={LICENSE_URL}>Licença MIT</a></li>
              <li><a href="/creditos/">Créditos das imagens</a></li>
            </ul>
          </div>
          <div>
            <h3>Legal</h3>
            <ul>
              <li><a href="/privacidade/">Privacidade</a></li>
              <li><a href="/termos/">Termos de uso</a></li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="legal">
        <p>
          Beyblade Arena é um projeto de fã, gratuito e sem fins lucrativos, sem vínculo com a Takara Tomy, Hasbro,
          Nelvana ou d-rights. Beyblade e os personagens pertencem aos seus donos. Imagens do anime usadas como
          homenagem; <a href="/creditos/">veja os créditos</a>. Código sob licença MIT.
        </p>
        <a href="#topo">Voltar ao topo</a>
      </div>
    </footer>
  );
}
