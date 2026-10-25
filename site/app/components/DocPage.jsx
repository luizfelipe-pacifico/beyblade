import { ArrowLeft } from 'lucide-react';
import Footer from './Footer';
import { UPDATED_AT } from '../site';

export default function DocPage({ title, intro, children }) {
  return (
    <>
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>
      <div className="doc" id="topo">
        <nav className="doc-bar" aria-label="Principal">
          <a className="wordmark" href="/">
            Beyblade Arena
          </a>
          <a href="/">
            <ArrowLeft size={18} aria-hidden="true" />
            Voltar para a página inicial
          </a>
        </nav>
        <main className="doc-main" id="conteudo">
          <header>
            <h1 className="display">{title}</h1>
            <p className="lead">{intro}</p>
            <p className="small">Atualizado em {UPDATED_AT}.</p>
          </header>
          <nav className="doc-links" aria-label="Informações do projeto">
            <a href="/privacidade/" aria-current={title === 'Privacidade' ? 'page' : undefined}>Privacidade</a>
            <a href="/termos/" aria-current={title === 'Termos de uso' ? 'page' : undefined}>Termos de uso</a>
            <a href="/creditos/" aria-current={title.startsWith('Créditos') ? 'page' : undefined}>Créditos</a>
          </nav>
          <div className="doc-body">{children}</div>
        </main>
      </div>
      <Footer />
    </>
  );
}
