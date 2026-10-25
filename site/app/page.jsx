import { ArrowUpRight, Check, Download, Gamepad2, Keyboard } from 'lucide-react';
import CharacterSelect from './components/CharacterSelect';
import Footer from './components/Footer';
import ModesDeck from './components/ModesDeck';
import Picture from './components/Picture';
import PsButtons from './components/PsButtons';
import Reveal from './components/Reveal';
import StageSlider from './components/StageSlider';
import { DOWNLOAD_URL, INSTALLER, ISSUES_URL, MILESTONES, RELEASES_URL, ROADMAP_URL } from './site';

function Hero() {
  return (
    <header className="hero" id="topo">
        <nav className="header" aria-label="Principal">
          <a className="wordmark" href="#topo">
            Beyblade Arena
          </a>
          <div className="tab">
            <a href="#personagens">Personagens</a>
            <a href="#como-jogar">Como jogar</a>
            <a href="#controles">Controles</a>
            <a href="#perguntas">Perguntas</a>
          </div>
          <a className="button" href={DOWNLOAD_URL}>
            <Download size={20} strokeWidth={2.5} aria-hidden="true" />
            Baixar
          </a>
        </nav>
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
          <p className="hero-meta" style={{ '--i': 2 }}>
            <span>Grátis</span>
            <span>Windows 10 e 11</span>
            <span>Em desenvolvimento: ainda sem versão jogável</span>
          </p>
        </div>
        </div>
        <figure className="hero-art">
          <Picture id="ray-lancamento" priority sizes="(max-width: 800px) 100vw, 52vw" />
          <figcaption>Bakuten Shoot. A geração que começou tudo.</figcaption>
        </figure>
      </div>
    </header>
  );
}

function Controls() {
  return (
    <section id="controles" className="controls" aria-labelledby="controles-titulo">
      <div className="board">
        <figure className="piece piece--photo" data-reveal="settle">
          <div style={{ height: '100%' }}>
            <Picture id="bladebreakers" sizes="(max-width: 1080px) 100vw, 50vw" />
            <figcaption>Os Bladebreakers, temporada 1</figcaption>
          </div>
        </figure>
        <div className="piece piece--title" data-reveal="">
          <h2 id="controles-titulo" style={{ '--i': 0 }}>
            Dois no mesmo PC
          </h2>
          <p className="lead" style={{ '--i': 1 }}>
            Sentem lado a lado e joguem. Sem conta, sem internet e sem configurar nada para começar.
          </p>
        </div>
        <div className="piece piece--list" data-reveal="">
          <h3 style={{ '--i': 0 }}>Jogue do seu jeito</h3>
          <ul className="checks" style={{ '--i': 1 }}>
            <li>
              <Gamepad2 size={26} aria-hidden="true" />
              <span>Dois DualShock 4, por USB ou Bluetooth</span>
            </li>
            <li>
              <Keyboard size={26} aria-hidden="true" />
              <span>
                Os dois no teclado: <span className="key">W</span> <span className="key">A</span>{' '}
                <span className="key">S</span> <span className="key">D</span> e as setas
              </span>
            </li>
            <li>
              <Check size={26} aria-hidden="true" />
              <span>Misto: um no controle, outro no teclado</span>
            </li>
            <li>
              <Check size={26} aria-hidden="true" />
              <span>Botões e teclas remapeáveis</span>
            </li>
          </ul>
        </div>
        <div className="controls-note" data-reveal="">
          <p>Os comandos aparecem como no controle de PS4.</p>
          <PsButtons size={32} />
          <p>Sem controle? O teclado funciona nos menus também. O progresso fica salvo no seu PC, sem internet.</p>
        </div>
      </div>
    </section>
  );
}

function Status() {
  return (
    <section id="estagio" className="status" aria-labelledby="estagio-titulo">
      <div className="status-board" data-reveal="">
        <div className="status-tile status-tile--head" style={{ '--i': 0 }}>
          <h2 id="estagio-titulo">O próximo lançamento</h2>
          <p>
            O jogo ainda não tem uma versão jogável. Estas são as etapas até o Beta, as mesmas do{' '}
            <a href={ROADMAP_URL}>roadmap no GitHub</a>.
          </p>
        </div>
        {MILESTONES.map((m, i) => (
          <div key={m.name} className={`status-tile${i === 0 ? ' is-now' : ''}`} style={{ '--i': i + 1 }}>
            <h3>{m.name}</h3>
            <div>
              <p className="state">{m.status}</p>
              <p className="small">{m.note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DownloadBand() {
  return (
    <a className="download" href={DOWNLOAD_URL} id="baixar">
      <div className="download-top">
        <p>Baixa o instalador da versão mais recente para Windows 10 e 11, de graça, direto do GitHub.</p>
        <ArrowUpRight className="download-arrow" size={48} strokeWidth={2.25} aria-hidden="true" />
      </div>
      <span className="download-word">Baixar</span>
      <span className="sr-only"> o instalador {INSTALLER}</span>
    </a>
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
    q: 'O Windows disse que protegeu o computador. E agora?',
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
        <details className="qa" key={q}>
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
