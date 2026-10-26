import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FeraField } from '@/components/game/fera-field';
import { TitleCard, VsBadge } from '@/components/game/title-card';
import { ControlHint, PadGlyph } from '@/components/game/pad-glyph';
import { RoundRow } from '@/components/game/round-row';
import { VersusSelect } from '@/components/game/versus-select';
import { colors, feras, textPairs, contrast } from '@/design/tokens';
import { AnnouncementDemo, MotionDemo, SettingsDemo, SpinDemo } from './demos';

export const metadata = {
  title: 'Design system · Beyblade Arena',
};

const SECOES = [
  ['cor', 'Cor'],
  ['tipo', 'Tipo'],
  ['movimento', 'Movimento'],
  ['componentes', 'Componentes'],
  ['estados', 'Estados'],
  ['desempenho', 'Desempenho'],
  ['voz', 'Voz'],
];

const NEUTROS = [
  ['tinta', colors.tinta, 'Chão de todas as telas. É a tinta de contorno da arte própria.'],
  ['tinta-2', colors.tinta2, 'Painel: um passo de claridade acima do chão.'],
  ['tinta-3', colors.tinta3, 'Painel dentro de painel, trilhos de barra, segmento vazio.'],
  ['papel', colors.papel, 'Texto principal e cartela sobre campo escuro.'],
  ['texto-2', colors.texto2, 'Texto secundário, sempre puxado do azul da tinta, nunca cinza.'],
  ['texto-3', colors.texto3, 'Meta: números de rodada vazia, legendas.'],
  ['chamada', colors.chamada, 'Só VS, contagem, foco do controle, ação principal e giro baixo.'],
  ['p1', colors.p1, 'Cursor e etiqueta do Jogador 1, sempre com o rótulo P1.'],
  ['p2', colors.p2, 'Cursor e etiqueta do Jogador 2, sempre com o rótulo P2.'],
];

const ESCALA = [
  ['Cartela XL', 'Dela Gothic One 400 · 56–96px', 'Nome do personagem na seleção e no resultado', 'cartela text-[clamp(3.5rem,8vw,6rem)] uppercase', 'Tyson'],
  ['Cartela L', 'Dela Gothic One 400 · 40–64px', 'Anúncios de finalização, título de tela', 'cartela text-[clamp(2.5rem,5vw,4rem)] uppercase', 'Let it rip!'],
  ['Título', 'Barlow 800 · 40px', 'Título de seção em telas de menu', 'text-[2.5rem] font-extrabold leading-tight', 'Escolha sua beyblade'],
  ['Corpo grande', 'Barlow 600 · 20px', 'Texto sobre campo de fera (conta como texto grande)', 'text-xl font-semibold', 'Dragoon G, ataque, giro à esquerda'],
  ['Corpo', 'Barlow 400 · 18px', 'Textos de menu, configurações, ajuda', 'text-lg', 'Aperte qualquer botão no controle para entrar.'],
  ['Meta', 'Barlow 600 · 14px', 'Rótulos de barra, legendas, números de tabela', 'text-sm font-semibold', 'Rodada 3 de 7'],
];

const MOVIMENTO = [
  ['--ease-out', 'cubic-bezier(0.23, 1, 0.32, 1)', 'Tudo que entra ou responde a um comando'],
  ['--ease-in-out', 'cubic-bezier(0.77, 0, 0.175, 1)', 'O que se move na tela (luz da rodada)'],
  ['--dur-press', '120ms', 'Botão encolhe para 0,97 ao apertar'],
  ['--dur-ui', '180ms', 'Interruptor, barra, troca de aba'],
  ['--dur-corte', '260ms', 'Varredura do campo de fera ao trocar de personagem ou tela'],
];

const FREQUENCIA = [
  ['Mover o cursor no menu', 'Dezenas de vezes por partida', 'Sem animação: o cursor salta na hora'],
  ['Trocar de personagem', 'Algumas vezes por partida', 'Varredura de 260 ms no campo'],
  ['Confirmar (botão X)', 'Algumas vezes por tela', 'Encolhe 0,97 em 120 ms'],
  ['Finalização (XTREME, BURST)', 'Uma vez por rodada', 'Faixa entra por varredura e fica 2 s'],
  ['Contagem 3, 2, 1, Let it rip!', 'Uma vez por rodada', 'Cartela troca em corte seco a cada segundo'],
];

const RODADAS = [
  { winner: 1, finish: 'ringout' },
  { winner: 2, finish: 'burst' },
];

const HISTORICO = [
  ['25/10 21:14', 'Tyson', 'Dragoon G', 4, 2, 'Kai', 'Dranzer G'],
  ['25/10 20:58', 'Ray', 'Driger G', 3, 4, 'Max', 'Draciel G'],
  ['24/10 19:40', 'Daichi', 'Gaia Dragoon G', 4, 0, 'Tyson', 'Dragoon G'],
];

const DESEMPENHO = [
  ['backdrop-filter, filter: blur() no desenho', 'Painel opaco um passo acima do chão', 'Desfoque refaz a imagem a cada frame; trava GPU integrada'],
  ['box-shadow e brilho (glow) em repouso', 'Passo de claridade entre superfícies', 'Sombra borrada custa pintura e não é do mundo'],
  ['Animar width, height, top, left, margin', 'transform e opacity', 'Só esses dois pulam layout e pintura'],
  ['transition: all', 'A propriedade exata', 'Evita animar o que não devia, como cor e borda'], // taste-skill-ignore: exemplo do que é proibido
  ['shadowBlur no canvas da batalha', 'Sprites pré-renderizados', 'O canvas 2D faz o desfoque na CPU, por frame'],
  ['Degradê esmaecido no fundo', 'Campo chapado + linhas de borda dura', 'Mais barato e é o desenho da abertura do anime'],
  ['Partículas sem limite', 'Teto fixo + reaproveitamento (pool)', 'Custo previsível nos choques fortes'],
];

const VOZ = [
  ['Pressione o botão de confirmação', 'Aperte X para confirmar', 'Nomeia o botão do controle e a ação'],
  ['Erro ao salvar', 'Não deu para salvar a partida. Ela continua aqui; tente de novo no fim da rodada.', 'Diz o problema e o que fazer'],
  ['Usuário 1', 'Jogador 1', 'O jogo tem jogadores, não usuários'],
  ['Spin finish', 'Parada (Spin Finish)', 'Português primeiro; o termo do anime entre parênteses na primeira vez'],
  ['Carregando…', 'Preparando o estádio…', 'O mundo do jogo, sem enrolar'],
];

function Secao({ id, titulo, intro, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-20 py-20 md:py-28">
      <h2 id={`${id}-titulo`} className="text-[2.5rem] font-extrabold leading-tight">
        {titulo}
      </h2>
      {intro ? <p className="mt-4 max-w-[68ch] text-lg text-texto-2">{intro}</p> : null}
      <div className="mt-12">{children}</div>
    </section>
  );
}

function Sub({ titulo, children }) {
  return (
    <div className="mt-16 first:mt-0">
      <h3 className="mb-6 text-2xl font-extrabold">{titulo}</h3>
      {children}
    </div>
  );
}

function TabelaSimples({ cabecalho, linhas, legenda, numericas = [] }) {
  return (
    <Table className="text-base">
      {legenda ? <TableCaption className="text-left text-texto-2">{legenda}</TableCaption> : null}
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {cabecalho.map((c, i) => (
            <TableHead key={c} className={`text-sm font-semibold text-texto-2 ${numericas.includes(i) ? 'text-right' : ''}`}>
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {linhas.map((l) => (
          <TableRow key={l.join('|')} className="hover:bg-tinta-2">
            {l.map((v, i) => (
              <TableCell key={i} className={`whitespace-normal align-top ${numericas.includes(i) ? 'text-right tabular-nums' : ''}`}>
                {v}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function DesignSystemPage() {
  return (
    <>
      <header className="sticky top-0 z-30 bg-tinta">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-8 px-6">
          <h1 className="text-base font-extrabold">
            Beyblade Arena <span className="font-semibold text-texto-2">· design system “Abertura do Anime”</span>
          </h1>
          <nav aria-label="Seções" className="ml-auto hidden gap-6 text-sm font-semibold text-texto-2 lg:flex">
            {SECOES.map(([id, nome]) => (
              <a key={id} href={`#${id}`} className="hover:text-papel">
                {nome}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <VersusSelect />

        <div className="mx-auto max-w-[1280px] px-6">
          <p className="max-w-[68ch] pt-16 text-xl font-semibold">
            Toda tela do jogo é um quadro da abertura de Bakuten Shoot: a cor da fera bit escolhida toma o campo inteiro. Teste
            acima com dois DualShock 4 (analógico e botão X) ou com o teclado (P1: A, D e F; P2: ← → e K).
          </p>

          <Secao
            id="cor"
            titulo="Cor"
            intro="Campos inteiros de cor chapada, nunca cor salpicada sobre um fundo neutro. A cor da fera identifica o personagem; o rótulo P1/P2 e o lado da tela identificam o jogador."
          >
            <Sub titulo="Campos das feras bit">
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-5">
                {Object.entries(feras).map(([slug, f]) => (
                  <FeraField key={slug} fera={slug} className="grid min-h-64 content-end gap-2 p-5">
                    <img src={`/art/feras/${slug === 'gaia' ? 'gaia-dragoon' : slug}/emblema.svg`} alt="" className="mb-auto size-16" />
                    <p className="cartela text-2xl uppercase">{f.nome}</p>
                    <p className="text-lg font-extrabold tabular-nums">{f.campo}</p>
                    <p className="text-sm font-semibold">
                      Texto {f.campoTexto === colors.papel ? 'branco' : 'tinta'} · {contrast(f.campoTexto, f.campo).toFixed(1)}:1
                    </p>
                  </FeraField>
                ))}
              </div>
              <p className="mt-4 max-w-[68ch] text-texto-2">
                As cores vêm dos SVGs das feras em <code>pesquisa-bakuten/feras-bit</code>. Wolborg, Falborg, Zeus, Galeon e Griffolyon
                ainda usam o painel neutro até a arte delas fixar a cor.
              </p>
            </Sub>

            <Sub titulo="Tinta, papel e chamada">
              <div className="grid gap-1.5 sm:grid-cols-3 lg:grid-cols-9">
                {NEUTROS.map(([nome, hex, uso]) => (
                  <div key={nome} className="grid content-start gap-3">
                    <div className="h-24" style={{ background: hex, outline: nome === 'tinta' ? '1px solid var(--border)' : undefined }} />
                    <p className="text-base font-extrabold">{nome}</p>
                    <p className="text-sm font-semibold tabular-nums text-texto-2">{hex}</p>
                    <p className="text-sm text-texto-2">{uso}</p>
                  </div>
                ))}
              </div>
            </Sub>

            <Sub titulo="Contraste medido">
              <TabelaSimples
                cabecalho={['Par', 'Texto', 'Fundo', 'Contraste', 'Mínimo']}
                numericas={[3, 4]}
                legenda="Calculado em src/design/tokens.js e travado por tests/design-tokens.test.js."
                linhas={textPairs.map(([nome, fg, bg, min]) => [nome, fg, bg, `${contrast(fg, bg).toFixed(2)}:1`, `${min}:1`])}
              />
            </Sub>
          </Secao>

          <Secao
            id="tipo"
            titulo="Tipo"
            intro="Duas famílias, cada uma com um trabalho. Dela Gothic One é a cartela de título da abertura, só para nomes, VS e anúncios. Barlow faz todo o resto, com números tabulares em placar, tempo e porcentagem."
          >
            <div className="grid items-end gap-10 md:grid-cols-[1.4fr_1fr]">
              <p className="cartela text-[clamp(4rem,10vw,6rem)] uppercase">Let it rip!</p>
              <p className="text-lg">
                Barlow lê bem a 18px no sofá, a dois metros da TV, e tem cara de transmissão esportiva. Números como{' '}
                <span className="font-extrabold tabular-nums">12.450 RPM</span> e{' '}
                <span className="font-extrabold tabular-nums">00:45</span> ficam alinhados quando mudam.
              </p>
            </div>
            <div className="mt-14">
              <TabelaSimples
                cabecalho={['Nível', 'Família e tamanho', 'Uso', 'Exemplo']}
                linhas={ESCALA.map(([nivel, fam, uso, cls, ex]) => [
                  nivel,
                  fam,
                  uso,
                  <span key="ex" className={cls}>
                    {ex}
                  </span>,
                ])}
              />
            </div>
          </Secao>

          <Secao
            id="movimento"
            titulo="Movimento"
            intro="Um momento autoral, a varredura do campo de fera; o resto é resposta rápida. Só transform e opacity, curvas de ease-out fortes, nada acima de 300 ms na interface. O que o jogador faz dezenas de vezes por partida não anima."
          >
            <MotionDemo />
            <div className="mt-14 grid gap-14 lg:grid-cols-2">
              <TabelaSimples cabecalho={['Token', 'Valor', 'Uso']} linhas={MOVIMENTO} />
              <TabelaSimples cabecalho={['Ação', 'Frequência', 'Decisão']} linhas={FREQUENCIA} />
            </div>
          </Secao>

          <Secao
            id="componentes"
            titulo="Componentes"
            intro="Base shadcn/ui (Radix) com os tokens do mundo: cantos retos, foco amarelo grosso e botão que encolhe ao apertar. Os componentes do jogo ficam em src/components/game."
          >
            <Sub titulo="Botões">
              <div className="flex flex-wrap items-center gap-4">
                <Button size="lg">Lutar</Button>
                <Button size="lg" variant="secondary">
                  Trocar beyblade
                </Button>
                <Button size="lg" variant="ghost">
                  Voltar
                </Button>
                <Button size="lg" variant="destructive">
                  Apagar histórico
                </Button>
                <Button size="lg" disabled>
                  Aguardando P2
                </Button>
              </div>
              <p className="mt-4 max-w-[68ch] text-texto-2">
                Use Tab para ver o foco: é o cursor de quem joga no controle, 4px amarelo, reto. Amarelo é só da ação principal da tela,
                uma por vez.
              </p>
            </Sub>

            <Sub titulo="Glifos do controle e teclas">
              <div className="flex flex-wrap items-center gap-5">
                {['cross', 'circle', 'square', 'triangle', 'l1', 'r1', 'l2', 'r2', 'options'].map((g) => (
                  <PadGlyph key={g} name={g} size={36} />
                ))}
                <Kbd className="h-8 min-w-8 px-2 text-base">F</Kbd>
                <Kbd className="h-8 min-w-8 px-2 text-base">Esc</Kbd>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                <ControlHint pad="cross" tecla="F">
                  Confirmar
                </ControlHint>
                <ControlHint pad="circle" tecla="G">
                  Voltar
                </ControlHint>
                <ControlHint pad="r2" tecla="R">
                  Segure para lançar
                </ControlHint>
                <ControlHint pad="options" tecla="Esc">
                  Pausar
                </ControlHint>
              </div>
            </Sub>

            <Sub titulo="Cartela, VS e finalização">
              <div className="grid gap-10 lg:grid-cols-2">
                <FeraField fera="driger" className="grid min-h-72 content-between p-8">
                  <VsBadge className="justify-self-end" />
                  <TitleCard nome="Ray" sub="Driger G · equilíbrio" />
                </FeraField>
                <AnnouncementDemo />
              </div>
            </Sub>

            <Sub titulo="Anel de giro e barras do HUD">
              <SpinDemo />
            </Sub>

            <Sub titulo="Fileira de rodadas">
              <RoundRow rounds={RODADAS} total={3} feraP1="dragoon" feraP2="dranzer" />
              <p className="mt-4 max-w-[68ch] text-texto-2">
                Melhor de três, numa linha que nunca quebra. A rodada ganha leva uma faixa na cor da fera de quem venceu e o tipo de
                finalização; a luz amarela corre embaixo da rodada atual.
              </p>
            </Sub>

            <Sub titulo="Configurações de controle">
              <SettingsDemo />
            </Sub>

            <Sub titulo="Histórico">
              <Table className="text-base">
                <TableCaption className="text-left text-texto-2">Dados de exemplo.</TableCaption>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {['Quando', 'Jogador 1', 'Placar', 'Jogador 2'].map((c, i) => (
                      <TableHead key={c} className={`text-sm font-semibold text-texto-2 ${i === 2 ? 'text-center' : ''}`}>
                        {c}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {HISTORICO.map(([quando, n1, b1, s1, s2, n2, b2]) => (
                    <TableRow key={quando} className="hover:bg-tinta-2">
                      <TableCell className="tabular-nums text-texto-2">{quando}</TableCell>
                      <TableCell>
                        <span className={s1 > s2 ? 'font-extrabold' : ''}>{n1}</span> <span className="text-texto-2">{b1}</span>
                      </TableCell>
                      <TableCell className="text-center text-lg font-extrabold tabular-nums">
                        {s1} × {s2}
                      </TableCell>
                      <TableCell>
                        <span className={s2 > s1 ? 'font-extrabold' : ''}>{n2}</span> <span className="text-texto-2">{b2}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Sub>
          </Secao>

          <Secao
            id="estados"
            titulo="Estados"
            intro="Toda tela tem um estado para quando algo falta. O jogo nunca trava esperando: ele diz o que houve e o que fazer, com o botão do controle e a tecla."
          >
            <div className="grid gap-1.5 md:grid-cols-2 lg:grid-cols-4">
              {[
                ['Sem partidas ainda', 'Jogue a primeira e ela aparece aqui.', 'cross', 'F', 'Jogar agora'],
                ['Controle desconectado', 'O controle do Jogador 2 saiu. A partida está pausada.', 'cross', 'K', 'Continuar pelo teclado'],
                ['Histórico indisponível', 'A partida segue normalmente, mas não vai entrar no histórico desta vez.', 'circle', 'G', 'Entendi'],
                ['Preparando o estádio…', 'Carregando arena e sons.', null, null, null],
              ].map(([titulo, texto, pad, tecla, acao]) => (
                <div key={titulo} className="grid min-h-56 content-between gap-6 bg-tinta-2 p-6">
                  <div>
                    <p className="text-xl font-extrabold">{titulo}</p>
                    <p className="mt-2 text-base text-texto-2">{texto}</p>
                  </div>
                  {acao ? (
                    <ControlHint pad={pad} tecla={tecla}>
                      {acao}
                    </ControlHint>
                  ) : (
                    <div className="h-2 overflow-hidden bg-tinta-3" aria-hidden="true">
                      <div className="h-full w-1/3 bg-papel" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Secao>

          <Secao
            id="desempenho"
            titulo="Desempenho"
            intro="Alvo mínimo: 60 FPS em 1080p num notebook sem placa de vídeo. O mundo foi escolhido para isso: campos chapados e bordas duras são baratos de desenhar."
          >
            <TabelaSimples cabecalho={['Proibido', 'Use no lugar', 'Por quê']} linhas={DESEMPENHO} />
          </Secao>

          <Secao
            id="voz"
            titulo="Voz"
            intro="Português do Brasil, frases curtas, o vocabulário do anime. Comandos dizem o botão e a ação; erros dizem o problema e a saída."
          >
            <TabelaSimples cabecalho={['Evite', 'Prefira', 'Por quê']} linhas={VOZ} />
          </Secao>
        </div>
      </main>

      <footer className="mt-12 bg-chamada text-tinta">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-6 px-6 py-14">
          <p className="cartela text-[clamp(2.5rem,6vw,4rem)] uppercase">Beyblade Arena</p>
          <p className="max-w-[48ch] text-base font-semibold">
            Fonte da verdade: app/globals.css e docs/DESIGN_SYSTEM.md. Projeto de fã, sem fins lucrativos, não afiliado à Takara Tomy,
            Hasbro, Nelvana ou d-rights.
          </p>
        </div>
      </footer>
    </>
  );
}
