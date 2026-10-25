import { ArrowLeft } from 'lucide-react';
import Footer from './Footer';
import { UPDATED_AT } from '../site';

export default function DocPage({ title, intro, children }) {
  return (
    <>
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
        <main className="doc-main">
          <header>
            <h1 className="display">{title}</h1>
            <p className="lead">{intro}</p>
            <p className="small">Atualizado em {UPDATED_AT}.</p>
          </header>
          <div className="doc-body">{children}</div>
        </main>
      </div>
      <Footer />
    </>
  );
}
