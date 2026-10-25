import { ArrowUpRight, Download, Gamepad2, Keyboard, WifiOff } from 'lucide-react';
import CharacterSelect from './components/CharacterSelect';
import Footer from './components/Footer';
import ModesDeck from './components/ModesDeck';
import ControlGuide from './components/ControlGuide';
import SiteNav from './components/SiteNav';
import Reveal from './components/Reveal';
import StageSlider from './components/StageSlider';
import HeroBey from './components/HeroBey';
import BattleLoop from './components/BattleLoop';
import { DOWNLOAD_URL, INSTALLER, ISSUES_URL, MILESTONES, RELEASES_URL, ROADMAP_URL } from './site';

function Hero() {
  return (
    <header className="hero" id="topo">
      <SiteNav />
      <div className="hero-body">
        <div className="hero-intro">
          <h1 className="hero-title">
            <span className="line">
              <span data-line="" style={{ '--i': 0 }}>
                Beyblade
              </span>
            </span>
            <span className="line">
              <span data-line="" style={{ '--i': 1 }}>
                Arena
              </span>
            </span>
          </h1>
          <div className="hero-copy">
            <p className="lead" style={{ '--i': 0 }}>
              A batalha do anime no seu PC: escolha o blader, lance a beyblade e lute contra um amigo, no controle de
              PS4 ou no teclado.
            </p>
            <div style={{ '--i': 1 }}>
              <a className="button" href={DOWNLOAD_URL}>
                <Download size={20} strokeWidth={2.5} aria-hidden="true" />
                Baixar para Windows
              </a>
            </div>
            <p className="hero-meta">Grátis para Windows 10 e 11. Em desenvolvimento, ainda sem versão jogável.</p>
            <div className="hero-features">
              <span><Gamepad2 size={21} aria-hidden="true" /> Dois jogadores</span>
              <span><Keyboard size={21} aria-hidden="true" /> Controle ou teclado</span>
              <span><WifiOff size={21} aria-hidden="true" /> Offline</span>
            </div>
          </div>
        </div>
        <HeroBey />
      </div>
    </header>
  );
}

function Controls() {
  return (
    <section id="controles" className="controls" aria-labelledby="controles-titulo">
      <div className="section-intro" data-reveal="">
        <h2 id="controles-titulo">Dois no mesmo PC</h2>
        <p className="lead">Controle ou teclado. Vocês escolhem. Veja os comandos previstos para entrar na arena lado a lado.</p>
      </div>
      <div className="controls-layout">
        <div className="controls-visual">
          <BattleLoop />
          <p className="lead">A disputa fica entre vocês.</p>
          <p>Sem conta, sem internet. O progresso ficará salvo no próprio PC.</p>
        </div>
        <ControlGuide />
      </div>
    </section>
  );
}

function Status() {
  const current = MILESTONES[0];
  return (
    <section id="estagio" className="status" aria-labelledby="estagio-titulo">
      <div className="status-board">
        <div className="status-intro" data-reveal="">
          <h2 id="estagio-titulo">O próximo lançamento</h2>
          <p className="lead">O jogo está em construção. Ainda não há uma versão jogável, mas você pode acompanhar cada etapa.</p>
          <a className="text-link" href={ROADMAP_URL}>Acompanhar no GitHub <ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
        <div className="roadmap">
          <div className="milestone-current">
            <h3>{current.name}</h3>
            <p className="state">{current.status}</p>
            <p>{current.note}.</p>
          </div>
          <details className="roadmap-next">
            <summary>Ver próximas etapas</summary>
            <ol>
              {MILESTONES.slice(1).map((m) => (
                <li className="milestone" key={m.name}>
                  <div><strong>{m.name}</strong><p>{m.note}</p></div>
                  <span className="small">{m.status}</span>
                </li>
              ))}
            </ol>
          </details>
        </div>
      </div>
    </section>
  );
}

function DownloadBand() {
  return (
    <section className="download" id="baixar" aria-labelledby="download-titulo">
      <div>
        <h2 id="download-titulo">A próxima disputa é no PC</h2>
        <p className="lead">Beyblade Arena será gratuito para Windows 10 e 11. O instalador estará aqui quando a primeira versão sair.</p>
      </div>
      <div className="download-actions">
        <a className="button" href={DOWNLOAD_URL}><Download size={22} aria-hidden="true" />Baixar para Windows</a>
        <p className="small">Em desenvolvimento. Download disponível após a primeira release.</p>
        <a className="text-link" href={RELEASES_URL}>Ver versões no GitHub <ArrowUpRight size={18} aria-hidden="true" /></a>
      </div>
    </section>
  );
}

const FAQ = [
  {
    q: 'Já dá para jogar?',
    a: (
      <>
        <p>
          Ainda não. O jogo está na primeira etapa, a fundação técnica. Quando a primeira versão sair no GitHub, o
          botão Baixar desta página passa a entregar o instalador, sem você precisar de um link novo.
        </p>
        <p>
          Até lá, o botão abre uma página de erro do GitHub. Para saber quando sair, acompanhe a{' '}
          <a href={RELEASES_URL}>página de versões</a>.
        </p>
      </>
    ),
  },
  {
    q: 'Por que o Windows mostra um aviso?',
    a: (
      <>
        <p>
          O aviso do SmartScreen aparece porque o instalador não tem assinatura digital, que é paga e cara para um
          projeto de fã. Ele não quer dizer que o arquivo tem vírus. Para instalar:
        </p>
        <ol>
          <li>Clique em <strong>Mais informações</strong>.</li>
          <li>Clique em <strong>Executar assim mesmo</strong>.</li>
        </ol>
        <p>
          Para conferir que o arquivo é o original, compare o SHA-256 com o publicado na página da versão. No
          PowerShell:
        </p>
        <pre>
          <code>Get-FileHash .\{INSTALLER} -Algorithm SHA256</code>
        </pre>
      </>
    ),
  },
  {
    q: 'Preciso de um controle de PS4?',
    a: (
      <p>
        Não. Tudo funciona no teclado, inclusive os menus, e dois jogadores podem dividir o mesmo teclado: um usa{' '}
        <span className="key">W</span> <span className="key">A</span> <span className="key">S</span>{' '}
        <span className="key">D</span>, o outro as setas. O DualShock 4 é o controle de referência, por USB ou
        Bluetooth.
      </p>
    ),
  },
  {
    q: 'Meu controle não responde. O que pode ser?',
    a: (
      <p>
        Se a Steam estiver aberta, ela pode capturar o DualShock 4 e mudar o que o jogo recebe. Feche a Steam e
        reconecte o controle. Se continuar, <a href={ISSUES_URL}>abra uma issue</a> dizendo o controle e como ele
        está conectado.
      </p>
    ),
  },
  {
    q: 'Quanto custa? Tem anúncio?',
    a: <p>Nada. O jogo é gratuito, sem anúncios, sem compras dentro dele e sem conta. É um projeto de fã.</p>,
  },
  {
    q: 'Roda no meu computador?',
    a: (
      <>
        <p>
          Precisa de Windows 10 ou 11 de 64 bits. Não precisa de placa de vídeo dedicada: a meta é rodar a 60 quadros
          por segundo em 1080p com o vídeo integrado de um notebook comum.
        </p>
        <p>Por enquanto não há versão para Mac, Linux ou celular.</p>
      </>
    ),
  },
  {
    q: 'É um jogo oficial de Beyblade?',
    a: (
      <p>
        Não. É um projeto de fã, gratuito e sem fins lucrativos, sem vínculo com a Takara Tomy, Hasbro, Nelvana ou
        d-rights. Beyblade, os personagens e as feras bit pertencem aos seus donos. Se você representa algum deles e
        quer que algo seja retirado, <a href={ISSUES_URL}>abra uma issue</a> e o conteúdo sai do ar.
      </p>
    ),
  },
];

function Faq() {
  return (
    <section id="perguntas" aria-labelledby="perguntas-titulo">
      <div className="faq-head">
        <h2 id="perguntas-titulo">Perguntas</h2>
      </div>
      {FAQ.map(({ q, a }) => (
        <details name="questions" className="qa" key={q}>
          <summary>{q}</summary>
          <div className="qa-answer">
            {a}
          </div>
        </details>
      ))}
    </section>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip" href="#personagens">
        Pular para o conteúdo
      </a>
      <Hero />
      <main>
        <CharacterSelect />
        <StageSlider />
        <Controls />
        <ModesDeck />
        <Status />
        <DownloadBand />
        <Faq />
      </main>
      <Footer />
      <Reveal />
    </>
  );
}
