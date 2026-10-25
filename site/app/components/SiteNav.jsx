'use client';

import { useRef } from 'react';
import { Download, Menu, X } from 'lucide-react';
import { DOWNLOAD_URL } from '../site';

const LINKS = [
  ['personagens', 'Personagens'],
  ['como-jogar', 'Como jogar'],
  ['controles', 'Controles'],
  ['estagio', 'Projeto'],
  ['perguntas', 'Perguntas'],
];

export default function SiteNav() {
  const menu = useRef(null);

  function close(event) {
    if (event.type === 'keydown' && event.key !== 'Escape') return;
    menu.current.open = false;
    if (event.type === 'keydown') menu.current.querySelector('summary').focus();
  }

  return (
    <nav className="header" aria-label="Principal">
      <a className="wordmark" href="#topo">Beyblade Arena</a>
      <div className="tab">
        {LINKS.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </div>
      <details className="mobile-nav" ref={menu} onKeyDown={close}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) menu.current.open = false; }}>
        <summary>
          <Menu className="menu-open" size={20} aria-hidden="true" />
          <X className="menu-close" size={20} aria-hidden="true" />
          <span>Menu</span>
        </summary>
        <div className="mobile-links">
          {LINKS.map(([id, label]) => <a key={id} href={`#${id}`} onClick={close}>{label}</a>)}
        </div>
      </details>
      <a className="button" href={DOWNLOAD_URL}><Download size={20} aria-hidden="true" />Baixar</a>
    </nav>
  );
}
