# Registro de decisões

Toda decisão de produto ou técnica tomada durante o desenvolvimento entra aqui, a mais recente no topo. Uma decisão só muda com uma nova entrada que a substitua (marque a antiga como **Substituída por D-XXX**); não apague o histórico.

Formato:

```
## D-XXX: título curto
- Data: AAAA-MM-DD
- Status: Aceita | Substituída por D-YYY
- Contexto: por que a decisão foi necessária
- Decisão: o que foi decidido
- Consequências: o que isso implica no código, nos testes e na documentação
```

---

## D-033: retratos do G-Revolution vetorizados de imagens do usuário

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu os personagens com a aparência real do G-Revolution, a partir de imagens do anime vetorizadas. A ROM do GBA não tem retratos (só bonecos 16×32; levantado pela outra sessão).
- Decisão: o usuário escolhe e salva as imagens em `assets-usuario/personagens/<slug>.*`; `scripts/vetorizar-retratos.js` (sharp para quantizar com paleta exata e alfa binário, imagetracerjs para traçar em 2×) gera o SVG 512×640, e o `sync-art` usa esse vetor no lugar do retrato próprio. O projeto não baixa frames do anime. Tudo em `assets-usuario/` fica fora do git, como a ROM (D-007).
- Consequências: `imagetracerjs` e `sharp` como dependências de desenvolvimento; passo a passo em [`ART.md`](ART.md#retratos-do-anime-vetorizados-d-033). D-032 fica reservada para a física do movimento (em andamento).

## D-031: jogo de PS1 como segunda referência, extraído fora do repositório

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário trouxe *Bakuten Shoot Beyblade 2002: Bey Battle Tournament 2* (PS1, Japão, SLPM-87130), cujas funcionalidades estão mais próximas da proposta final, e pediu para começar a engenharia reversa "separado, sem afetar os jogos", convertendo e guardando primeiro e extraindo aos poucos depois.
- Decisão:
  - o disco (BIN/CUE) é convertido e extraído por `scripts/extract-ps1.js` para **`../ps1-bbt2/`, fora do repositório** (ISO, arquivos e `manifest.json`); o script recusa uma saída dentro do repositório;
  - nada do PS1 entra no jogo por enquanto; cada coisa aproveitada vem depois, em atualizações próprias, com decisão registrada;
  - as mesmas regras da D-007 valem: o disco e tudo o que sair dele nunca vão para o git.
- Consequências: código do extrator e testes (ISO sintética) no repositório; mapa do disco e próximos passos em [`PS1.md`](PS1.md). O jogo de PS1 é 3D, então é a referência natural para a refatoração 3D (D-006).

## D-030: músicas de fundo baixadas pelo usuário, fora do git

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário baixou quatro faixas "unreleased" do Beyblade (duas de fundo e duas versões do tema de batalha) e pediu que fossem renomeadas e usadas por contexto.
- Decisão: as faixas ficam em `public/audio/musica/` com nomes por contexto (`menu-inicio`, `menu-selecao`, `batalha`, `batalha-decisiva`), **nunca no git**, como a ROM (D-007): são gravações com direitos autorais, só para uso pessoal. `src/audio/music.js` toca uma por vez, em laço, e a falta de um arquivo deixa a tela em silêncio, sem erro. As cópias repetidas do download foram ignoradas (mesmo hash).
- Consequências: mapa das faixas em [`AUDIO.md`](AUDIO.md#músicas-de-fundo-d-030). Um build para distribuir não pode levar essas faixas.

## D-029: arena e beys com volume, no estilo do estádio da Burst

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário achou o estilo "mais criança, mais flat" e pediu algo mais realista e fiel ao anime; a [`BEY_BEHAVIOR.md`](BEY_BEHAVIOR.md) pede a arena com as cores do estádio da Burst.
- Decisão: na **batalha**, a regra "flat, sem brilho nem degradê" da D-022 deixa de valer para o canvas. A arena ganha tigela de plástico azul translúcido (clara no fundo, saturada na borda), curvas de nível calculadas de `bowlHeight`, linhas radiais, círculo central, tornado ridge claro, parede com luz de cima à esquerda, oclusão e bolsos escuros. As beys ganham sombra que se afasta com a altura na rampa e no pulo, escala leve pela altura, borrão de giro, rastro da velocidade e faíscas aditivas. Para continuar leve na GPU integrada, todo degradê e desfoque é desenhado **uma vez** em canvas de cache; por frame só há `drawImage`, arcos e linhas. Com movimento reduzido, não há rastro nem borrão. Menus e HUD continuam na D-022.
- Consequências: tudo isso fica em `src/render/arena-renderer.js`; a simulação não muda. Substitui em parte a D-022 (só o canvas da batalha).

## D-028: física da tigela funda e comportamento pela ponta

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu que cada tipo de bey se comporte como no brinquedo (ataque rápido que para antes; resistência sempre puxada para o centro; defesa girando num círculo pequeno em volta do centro) e notou que a bey "corria como se a arena fosse plana". A especificação está em [`BEY_BEHAVIOR.md`](BEY_BEHAVIOR.md).
- Decisão:
  - a tigela é **funda** (perfil `h(r)` parabólico com borda íngreme, profundidade 0,2·R, período de pêndulo ~2,1 s): a gravidade na rampa substitui o empurrão constante do protótipo;
  - a **ponta** (de `calculo.ponta` no catálogo) define o movimento: empurrão lateral na rampa, impulso para frente, tração máxima e atrito; o tipo só cobre massa, recuo e *life after death* na equalização de giro; o comando do jogador inclina a bey e é limitado pela tração da ponta;
  - atrito estático para bey parada; perda de giro cresce com o peso e a tração da ponta;
  - arena com **raio de 450 mm (~20:1)**, beys no tamanho real, velocidades escaladas por um fator único.
- Consequências: o comportamento é medido em `tests/sim-bowl.test.js` (energia, pêndulo, raio por ponta, ordem de parada ataque → equilíbrio → defesa → resistência). Upper attack e Gyro EG da especificação ainda não estão implementados. Substitui o raio de 360 mm da D-026.

## D-027: brilho de carga do ataque e da defesa

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu que, ao segurar ✕, a bey brilhe para medir a força do rush, e que a defesa tenha outro estilo de brilho, na cor de defesa.
- Decisão: **ataque** com halo laranja (token `ataque`) que cresce e pulsa mais rápido com a carga, anel serrilhado girando que fecha na carga cheia e um "estalo" (anel que se expande uma vez, com vibração) quando enche; **defesa** com escudo hexagonal ciano (token `defesa`), sólido e parado, mais grosso conforme firma. Forma e movimento diferentes, não só a cor; halo pré-renderizado (sem `shadowBlur`); com movimento reduzido nada gira, pulsa nem se expande.
- Consequências: tokens `ataque` e `defesa` em `design-system/tokens.json`; evento `chargeFull` na simulação.

## D-026: regras da batalha do protótipo (melhor de 3, arena 16:1)

- Data: 2026-10-25
- Status: Proposta (aguardando confirmação do usuário); implementada para o protótipo M1
- Contexto: o usuário pediu para já batalhar dentro do Electron. O placar é decisão de design ([`GAME_FLOW.md`](GAME_FLOW.md#finais-e-regras)), e o usuário achou a arena pequena (proporção do brinquedo, ~9:1).
- Decisão: partida em **melhor de 3 rodadas**, como num jogo de luta (D-005); cada rodada termina em **Parada** (spin finish), **Fora** (ring out) ou **Burst**; aos 60 s vence quem tem mais giro (**Decisão**); empate não pontua. Arena com **raio de 360 mm** (~16:1, como o GBA), beys no tamanho real, velocidades e limiares escalados ×1,8 para o ritmo não mudar. Especiais genéricos por tipo de bey até os efeitos de cada fera (M3).
- Consequências: `src/sim/constants.js` concentra os números (calibração no M1/M3); `tests/sim.test.js` cobre lançamento, colisão, finais, desempate e determinismo. Combos depois de um "HIT!" (D-024) ainda não existem.

## D-025: jogo na 5000, landing na 3000 e `pnpm run dev:all`

- Data: 2026-10-25
- Status: Aceita (substitui a regra de porta única do `CLAUDE.md`)
- Contexto: o usuário pediu o jogo na porta 5000, a landing na 3000 e um comando `pnpm run dev:all` que abra a janela do Electron com o jogo e as abas Início, Personagens e Batalha. Na primeira execução a janela abriu a landing: um preview antigo dela continuava escutando a 5000 em IPv6.
- Decisão:
  - **jogo** (Express + Next, `server.js`) sempre em `127.0.0.1:5000`; **landing** (`site/`) sempre na **3000**; nenhuma das duas cai para outra porta se a sua estiver ocupada;
  - `pnpm run dev:all` (= `node scripts/dev-all.js`) copia a arte, tenta subir o PostgreSQL, inicia jogo e landing e só abre o Electron quando a 5000 responde com o cabeçalho `X-Beyblade-App: jogo`; fechar a janela encerra tudo;
  - o projeto continua **instalado pelo npm** (`package-lock.json`); o pnpm só roda scripts (`verifyDepsBeforeRun: false` em `pnpm-workspace.yaml`), porque a instalação automática dele antes do `run` tentou converter o `node_modules` e falhou com arquivos em uso.
- Consequências: a landing não sobe quando a 3000 está ocupada (nesta máquina, por um container de outro projeto); o jogo segue normalmente. Abas trocam por L1/R1 (Q/E no teclado) só fora da batalha, onde L1/R1 são pulo e esquiva (D-024).

## D-024: controles da batalha iguais aos do jogo de GBA

- Data: 2026-10-25
- Status: Aceita (substitui o "mapeamento padrão das ações, proposta inicial" do `CONTROLLERS.md`)
- Contexto: as FAQs na web se contradizem sobre os botões do jogo de GBA; os textos de dica da própria ROM definem os comandos. O usuário escolheu manter os comandos do GBA adaptados ao DualShock 4.
- Decisão: ✕ ataca e ○ defende (segurar carrega), L1 pula, R1 esquiva, L1+R1 segurados soltam a fera bit, ✕+○ segurados ativam o Engine Gear, combos com direcional + ✕ depois de um "HIT!", ✕ com timing no lançamento e Options para pausar e para o P2 entrar.
- Consequências: as ações por jogador passam a ser `attack`, `defend`, `jump`, `dodge`, `launch`, `pause` e as direções; as combinações saem delas. `src/validate.js` (`ACTIONS`) e os testes mudam quando o input for implementado. Tabela em [`CONTROLLERS.md`](CONTROLLERS.md#mapeamento-padrão-das-ações).

## D-023: fluxo de partida estilo Street Fighter, entrada do 2º jogador e entrada na arena

- Data: 2026-10-25
- Status: Aceita (detalha a D-005; os modos dela continuam valendo)
- Contexto: o usuário detalhou como a partida começa: tela com todos os personagens, escolha da bey do personagem, entrada do 2º jogador pelo Start, escolha da arena e a animação dos personagens andando até a arena, como no jogo de GBA. A jogabilidade (beys, lançadores, ripcords) vem do jogo de GBA.
- Decisão:
  - **Seleção de personagem** com todos os personagens disponíveis e uma opção **Aleatório** junto com eles;
  - depois do personagem, **seleção da beyblade daquele personagem**;
  - **2º jogador:** se alguém apertar **Options (Start)** num segundo controle durante a seleção (ou a tecla de Start do P2 no teclado, D-015), abre o cursor do **Player 2**. Se ninguém apertar, a mesma pessoa escolhe em seguida o personagem (e a bey) da **CPU**;
  - depois dos personagens, **seleção da arena** (estádio);
  - antes da batalha, **animação de entrada**: os personagens escolhidos andam até a arena; em seguida vêm o lançamento e a batalha;
  - **jogabilidade com dados do jogo de GBA** (D-007): beys e peças com seus stats, lançadores e ripcords, controles e regras de batalha confirmados na ROM. Detalhes em [`GAME_FLOW.md`](GAME_FLOW.md).
- Consequências: a máquina de estados das telas ([`ARCHITECTURE.md`](ARCHITECTURE.md#5-modelo-de-entidades-ecs-leve)) ganha `stageSelect` e `walkIn` entre `beySelect` e `launch`, e a seleção precisa tratar a entrada do P2 a qualquer momento antes de confirmar. Respostas do usuário: Aleatório sorteia só o personagem; sem P2, o P1 escolhe personagem e bey da CPU; elenco com os 10 personagens do roster; o P2 entra a qualquer momento da seleção.

## D-022: direção visual "Abertura do Anime" e shadcn/ui no jogo

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu um design system e uma rota para ele, validados com as skills taste, impeccable e Emil Kowalski, e o shadcn/ui como biblioteca de componentes do jogo. Nas perguntas, ele escolheu a sensação "abertura do anime" e marcou como errado: cara de app/dashboard, infantil demais, pesado no notebook e fugir da 1ª geração. Na página de decisão do impeccable (sorteio: transmissão do torneio BBA), ele escolheu a alternativa "Abertura do Anime".
- Decisão:
  - toda tela do jogo é um quadro da abertura de Bakuten Shoot: o **campo da fera bit** do personagem toma a área inteira, com linhas de velocidade de borda dura, nome em cartela de título (Dela Gothic One) e VS amarelo inclinado;
  - **shadcn/ui** (base Radix, estilo `radix-nova`, JavaScript) para os componentes de interface, ajustados aos tokens: cantos retos, foco amarelo de 4px (o cursor de quem joga no controle), pressão em `scale(0.97)`, sem desfoque nem `transition-all`;
  - componentes do jogo em `src/components/game/` e a galeria viva em `/design-system`.
- Consequências: os tokens seguem a fonte única da D-018. O Express em `server.js` repassa ao Next tudo o que não é `/api`, para o jogo e a API ficarem juntos na porta 5000 até a D-013 ser confirmada. A arte própria (D-008) é copiada de `pesquisa-bakuten/` para `public/art/` por `scripts/sync-art.js` (gerado, fora do git). Detalhes em [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md#componentes-do-jogo).

## D-021: ripcords catalogados junto com os lançadores

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu para lembrar dos ripcords. No brinquedo, a corda dentada é uma peça própria (curta, longa, de lançador de corda, de Engine Gear, com pegador diferente); no jogo de GBA, lançador e ripcord são itens separados (4 de cada), com durabilidade que cai a cada batalha.
- Decisão: cada ripcord vira uma ficha em `pesquisa-bakuten/lancadores/ripcords/<slug>/` (medidas, nº de dentes, comprimento, material, sentido, compatibilidade com lançadores, atributos de lançamento e arte gerada). Cada lançador indica os ripcords compatíveis, e cada personagem/bey aponta para o ripcord que usa no anime quando a fonte disser.
- Consequências: no mini-game de lançamento, a força vem do lançador e o comprimento/dentes do ripcord definem quanto spin a puxada entrega (ver [`BEYBLADES.md`](BEYBLADES.md)).

## D-020: modelos físicos reais como referência das artes da landing

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário rejeitou a aparência dos sprites simplificados e pediu beyblades reais, vetorizadas, com detalhes e nitidez.
- Decisão: substituir as quatro matrizes por traçados em curvas de fotografias dos brinquedos clássicos, preservando peças, cores e adesivos. Guardar as fontes e sua procedência localmente. Não embutir raster em SVG nem inventar detalhe ausente na referência. Entregar WebP responsivo para evitar o peso dos vetores detalhados no navegador; manter os SVGs completos. Regenerar a animação em 1152 × 648 com as mesmas artes.
- Consequências: o pipeline usa VTracer apenas em desenvolvimento, verifica checksums e produz máscaras vetoriais de transparência. Créditos deixam de atribuir essas artes como originais do catálogo. Os direitos das fotos permanecem com seus titulares. Giro por scroll, pausa, movimento reduzido, duas fontes e paleta 60/30/10 continuam definidos por D-019 e D-018.

## D-019: hero vetorial com giro na rolagem e demonstrações animadas

- Data: 2026-10-25
- Status: Substituída por D-020 quanto às fontes das artes; comportamento de movimento mantido
- Contexto: o usuário pediu uma hero mais visual, com uma beyblade girando ao rolar, ícones e imagens animadas de melhor qualidade.
- Decisão: usar a arte própria da Dragoon S em SVG na hero, com rotação vinculada à rolagem; substituir a imagem da seção de controles por uma demonstração de batalha em WebP animado gerado dos SVGs, também usado na etapa Batalha. Manter as duas fontes e a paleta 60/30/10.
- Consequências: a hero não perde resolução ao ampliar; a demonstração tem poster e pausa, respeita movimento reduzido e não roda fora da tela. As ilustrações e sua origem ficam creditadas em `site/public/beyblades/README.md` e na página de créditos. Não são capturas de gameplay.

## D-018: design unificado, duas fontes e proporção 60/30/10

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu a refatoração da landing com Taste, Impeccable e Emil Kowalski, unificando o design system durante o processo e seguindo o princípio de menos é mais.
- Decisão: usar Dela Gothic One e Barlow; tinta azul profunda como base (60%), superfícies azuis de apoio (30%) e amarelo de ação (10%). As cores das feras ficam no conteúdo de identidade. Tokens comuns em `design-system/tokens.json`, com CSS gerado para jogo e landing. Animações da landing disparam na rolagem, uma vez por bloco, respeitando movimento reduzido.
- Consequências: `docs/DESIGN_SYSTEM.md` documenta o contrato; testes detectam divergências entre as saídas. `site/` continua independente para o build na Vercel. Pesquisa e backend em andamento não entram nesta refatoração.

## D-016: landing page pública em Next.js, com download do `.exe` pelo GitHub Releases

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu uma landing page em português com um botão que baixa o instalador do jogo, usando Next.js, imagens da web e as skills de design instaladas.
- Decisão:
  - a landing é um **app Next.js separado em `site/`** (não é o app do jogo da D-013), com **export estático** (`output: 'export'`), publicado na **Vercel** (Root Directory = `site`);
  - o botão principal baixa o **instalador `.exe` para Windows** (D-004) pelo link fixo `https://github.com/luizfelipe-pacifico/beyblade/releases/latest/download/BeybladeArena-Setup.exe`. O instalador fica **anexado às GitHub Releases, nunca commitado** (o GitHub recusa arquivos acima de 100 MB);
  - enquanto não houver release, o botão continua ativo e a página avisa que o jogo está **em desenvolvimento**, mostrando o estágio atual do [`ROADMAP.md`](ROADMAP.md);
  - **público principal:** amigos e conhecidos que recebem o link;
  - **imagens do anime** (*Beyblade*, Bakuten Shoot) podem ser usadas na landing, por decisão do usuário (substitui a proposta inicial de usar só imagens livres). Fonte e créditos ficam em `site/CREDITS.md`;
  - a página é **`noindex`** (meta `robots` + cabeçalho `X-Robots-Tag` na Vercel): não aparece em buscadores e só é acessada por quem recebe o link;
  - **contato público** pelas Issues do GitHub (sem e-mail exposto).
- Consequências: o `noindex` reduz a exposição, mas não muda os direitos autorais: o detentor ainda pode pedir remoção à Vercel/GitHub. Por isso o nome "Beyblade" e as imagens do anime vêm com aviso de **projeto de fã, sem fins lucrativos e não afiliado à Takara Tomy, Hasbro, Nelvana ou d-rights**. A página não coleta dados (sem analytics, cookies ou formulários), o que mantém a política de privacidade simples. O instalador não pode conter material extraído da ROM (D-007): só arte própria (D-008). Detalhes em [`LANDING.md`](LANDING.md).

## D-017: licença MIT para o código

- Data: 2026-10-25
- Status: Aceita
- Contexto: o projeto vai ter download público e precisava de uma licença definida.
- Decisão: código sob **licença MIT** (`LICENSE` na raiz). A licença cobre só o código e a arte própria; marcas, personagens e nomes da franquia Beyblade pertencem aos donos e não são licenciados.
- Consequências: `LICENSE`, `README.md` e a página de termos deixam claro o que a MIT cobre e o que não cobre. Imagens de terceiros seguem as próprias licenças, listadas em `site/CREDITS.md`.

## D-015: jogo completo pelo teclado quando não há controle

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu que quem não tiver controle consiga jogar com o teclado do computador. A D-001 já previa o teclado como fallback, mas sem definir até onde.
- Decisão:
  - **tudo** é jogável pelo teclado, não só a batalha: menus, seleção de personagem e bey, lançamento, pausa e tela de Controles;
  - **dois jogadores no mesmo teclado**, com blocos de teclas separados (P1 à esquerda, P2 à direita), e também **misto** (um no DualShock 4, outro no teclado);
  - sem controle na porta do jogador, o teclado dele fica ativo automaticamente e a interface mostra as teclas em vez dos símbolos do PS4; com controle, os dois funcionam ao mesmo tempo;
  - teclas remapeáveis na tela de Controles e salvas no banco, como os botões do controle. Mapeamento padrão em [`CONTROLLERS.md`](CONTROLLERS.md#teclado).
- Consequências: o input converte teclado e gamepad no mesmo `InputFrame` ([`ARCHITECTURE.md`](ARCHITECTURE.md#6-input)), então a simulação não sabe de onde veio o comando. Teclados de notebook têm limite de teclas simultâneas (*ghosting*), por isso o layout padrão evita juntar as teclas dos dois jogadores na mesma região. Os testes de input cobrem o teclado, e "pronto" exige testar com teclado também.

## D-014: PostgreSQL só no desenvolvimento; SQLite no `.exe`

- Data: 2026-10-25
- Status: Aceita
- Contexto: D-012 deixava o `.exe` dependente do Docker Desktop para salvar dados (risco registrado em [`DATABASE.md`](DATABASE.md#risco-conhecido) e no [`ROADMAP.md`](ROADMAP.md)). O usuário definiu o papel de cada banco.
- Decisão:
  - **PostgreSQL no Docker** é usado só no desenvolvimento e nos testes em `localhost`;
  - o **`.exe` empacotado usa SQLite**: um arquivo local na pasta de dados do usuário (`app.getPath('userData')`), sem Docker nem serviço externo.
- Consequências:
  - substitui em parte a D-012, que vale só para o ambiente de desenvolvimento;
  - o schema do Prisma tem um `provider` fixo, então os dois bancos exigem **um schema e um client por provider** (ex.: `prisma/schema.prisma` para PostgreSQL e um schema SQLite gerado a partir dele), com migrações separadas. O adapter SQLite do Prisma 7 e o jeito de compilar o driver nativo para o Electron ainda precisam ser escolhidos e registrados;
  - o código de acesso a dados (`src/db.js`) não pode usar recurso exclusivo do PostgreSQL (tipos, `$queryRaw` com SQL específico), para funcionar nos dois;
  - os testes precisam cobrir as queries também no SQLite, que é o banco que o jogador usa de verdade.

## D-013: Next.js serve interface e API na porta 5000, dentro do Electron

- Data: 2026-10-25
- Status: Proposta (aguardando confirmação do usuário)
- Contexto: com D-004 (Electron + Next.js) e D-012 (PostgreSQL), falta definir quem fala com o banco. O `server.js` com Express é da stack original e duplicaria o servidor do Next.
- Decisão: o servidor do Next.js (App Router) roda em `127.0.0.1:5000` e expõe a API em *route handlers* (`app/api/**/route.js`), que usam `src/validate.js` e o Prisma. O processo principal do Electron sobe esse servidor (`next dev -p 5000` em dev, saída `standalone` no build) e abre a janela nele. O renderer não tem acesso a Node (`contextIsolation`, `sandbox`); tudo passa pela API HTTP local.
- Consequências: o Express em `server.js` é **transitório** e sai quando as rotas forem migradas (marco M0 do [`ROADMAP.md`](ROADMAP.md)). Detalhes em [`ARCHITECTURE.md`](ARCHITECTURE.md).

## D-012: banco PostgreSQL em container Docker

- Data: 2026-10-25
- Status: Aceita, restrita ao desenvolvimento pela D-014
- Contexto: o usuário pediu o banco rodando em container Docker. O SQLite é um arquivo embutido no processo e não roda como serviço, então foi preciso escolher um banco cliente-servidor. Opções apresentadas: PostgreSQL no Docker, manter SQLite sem Docker, ou SQLite agora e Postgres depois. O usuário escolheu PostgreSQL no Docker.
- Decisão: **PostgreSQL 18** (`postgres:18-alpine`) via `docker-compose.yml`, publicado só em `127.0.0.1:5434` (5432/5433 já estavam ocupadas na máquina), volume nomeado `pgdata`, healthcheck com `pg_isready` e credenciais no `.env` (fora do git).
- Consequências: substitui o "SQLite nativo via `node:sqlite`" da stack original e define a persistência que a D-004 deixou em aberto. O Docker Desktop precisa estar rodando para o jogo salvar dados (`npm run db:up`); isso entra como risco para o `.exe` no [`ROADMAP.md`](ROADMAP.md). Schema, migrações e operação em [`DATABASE.md`](DATABASE.md).

## D-011: Prisma como ORM

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu um ORM. Opções apresentadas: Drizzle ou Prisma. O usuário escolheu Prisma.
- Decisão: **Prisma ORM 7** (`prisma`, `@prisma/client`) com o driver adapter `@prisma/adapter-pg` (`pg`). Generator `prisma-client`, com client gerado em `src/generated/prisma/` (fora do git, regerado no `postinstall`). Configuração em `prisma7.config.ts`, que carrega o `.env` com `process.loadEnvFile()` (nativo, sem `dotenv`). Migrações versionadas em `prisma/migrations/`.
- Consequências: substitui o "sem ORM" e as migrações por `PRAGMA user_version` da stack original. O Prisma 8 ainda está em release candidate e só será adotado quando sair estável, com nova entrada aqui. SQL manual só via `$queryRaw` com template literal (parametrizado), nunca `$queryRawUnsafe`.

## D-010: lançadores fazem parte do catálogo

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário pediu os lançadores junto com as beyblades; o fluxo de D-005 tem uma etapa de lançamento.
- Decisão: cada lançador usado no anime (e os modelos de brinquedo da época) vira uma ficha em `pesquisa-bakuten/lancadores/` com medidas, material, sentido de rotação, atributos (força, RPM, precisão, controle) e arte própria. Cada personagem aponta para o lançador que usa.
- Consequências: a fase de lançamento do jogo usa os atributos do lançador junto com os da beyblade (ver [`BEYBLADES.md`](BEYBLADES.md)).

## D-009: atributos calculados a partir das peças

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário quer atributos base (velocidade, força etc.) mapeados como os criadores pensaram, para cada peça e para a bey completa.
- Decisão: cada peça tem medidas físicas (mm, g), material, os stats oficiais Ataque/Defesa/Stamina (wiki/Takara) e, quando extraídos, os valores do jogo de GBA (D-007). Os atributos da bey são **calculados** dessas peças por fórmulas documentadas em [`BEYBLADES.md`](BEYBLADES.md) e implementadas em `src/beyblade/stats.js` (com testes). Um ajuste separado (`ajuste_anime`) representa o desempenho exagerado do anime.
- Consequências: os atributos escritos à mão na primeira pesquisa passam a ser só referência; o valor de jogo é o calculado. Mudou peça → recalcula com `npm run build:research`.

## D-008: arte e som próprios gerados a partir dos dados

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário quer imagens padronizadas e de qualidade bem superior às baixadas da wiki (que são de terceiros, de tamanhos e ângulos variados e, em parte, bloqueadas pelo CDN), além de feras bit animadas com som para aparecer em cima da beyblade.
- Decisão:
  - peças, beys montadas, vistas explodidas e lançadores são **SVG gerados por script** a partir dos parâmetros de forma de cada peça (`scripts/build-research.js`), com padrão único de ângulo, escala (mm) e iluminação;
  - feras bit e retratos de personagens são **SVG vetoriais originais**, com animações CSS (idle, invocação, ataque) seguindo [`ART.md`](ART.md);
  - sons das feras e da batalha são **sintetizados** a partir de receitas JSON (`scripts/synth.js`, ver [`AUDIO.md`](AUDIO.md));
  - fotos da wiki ficam só como referência, em subpastas `referencia/`.
- Consequências: esses assets são próprios e podem ir para o git (diferente do material extraído da ROM em D-007). A extração de sprites da ROM continua possível, mas não é a fonte desses assets.

## D-007: ROM de GBA como referência e fonte inicial de assets

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário quer recriar a batalha do *Beyblade G-Revolution* (GBA, Atari/Hasbro, 2003) e usar o jogo original como base, ajustando depois. É um projeto pessoal, sem comercialização, para rodar só no PC dele.
- Decisão:
  - a ROM `Beyblade G-Revolution (USA).gba` (código `BB2E`, SHA-1 `a89f7b4eb77dc986022201db51a676451ba7c5e4`) é a referência de engenharia reversa: regras, números, fluxo de telas e dados de peças;
  - **inicialmente**, sprites, retratos e sons podem ser **extraídos da ROM** para uso no jogo; depois serão ajustados ou trocados aos poucos;
  - a ROM e tudo o que for extraído dela **nunca entram no git** (ficam fora do repositório ou em pasta no `.gitignore`).
- Consequências: substitui em parte a regra de assets de [`BEST_PRACTICES.md`](BEST_PRACTICES.md#13-assets-e-direitos-autorais) para este uso pessoal; o build/exe não deve ser distribuído. Descobertas da engenharia reversa vão em [`REVERSE_ENGINEERING.md`](REVERSE_ENGINEERING.md).

## D-006: batalha em 2D agora, refatoração para 3D depois

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário quer começar em 2D e depois refatorar tudo para 3D.
- Decisão: a primeira versão é 2D com arena vista de cima (canvas). Tudo é documentado pensando na migração para 3D.
- Consequências: a simulação (física, regras, IA, input) fica totalmente separada da renderização e trabalha em unidades do mundo (não em pixels), para que o renderer 2D possa ser trocado por um 3D sem reescrever a lógica. Valores calibrados e limitações do 2D vão para os docs do assunto.

## D-005: formato de luta estilo Street Fighter e modos de jogo

- Data: 2026-10-25
- Status: Aceita
- Contexto: não vamos replicar a história do jogo de GBA; o foco é a batalha.
- Decisão:
  - fluxo: **seleção de personagem** (todos disponíveis desde o início: Tyson, Kai, Ray, Max, Daichi etc.) → **seleção da beyblade** daquele personagem → **lançamento** → **batalha na arena**;
  - modos da primeira versão: **1 vs 1 local**, **1 vs CPU**, **Arcade** (sequência de CPUs até um chefe) e **Treino**;
  - todo o controle pelo DualShock 4 (D-001), incluindo menus e lançamento.
- Consequências: personagens e beyblades vêm da pesquisa em `pesquisa-bakuten/` (perfis de IA já descritos lá); a IA da CPU usa o perfil de cada personagem.

## D-004: jogo como executável Windows (Electron + Next.js)

- Data: 2026-10-25
- Status: Aceita
- Contexto: o usuário quer jogar por um `.exe` no Windows em vez de um emulador de `.gba`.
- Decisão: frontend em **Next.js** rodando dentro do **Electron**, empacotado como `.exe` para Windows. Em desenvolvimento, o servidor continua na porta 5000 (`CLAUDE.md`).
- Consequências: substitui o "frontend estático em `public/`" da stack original. A forma de persistência no app empacotado (banco, API) ainda precisa ser definida e registrada.

## D-003: testes automáticos antes de todo push

- Data: 2026-10-25
- Status: Aceita
- Contexto: queremos que nada quebrado chegue ao GitHub e que bugs corrigidos não voltem.
- Decisão: suíte com `node:test` (`npm test`), hook `pre-push` versionado em `.githooks/` que bloqueia o push se algum teste falhar, e regra de teste de regressão para todo bug corrigido.
- Consequências: o hook é ativado por `git config core.hooksPath .githooks` (feito automaticamente pelo script `prepare` no `npm install`). Nunca usar `git push --no-verify` para pular os testes. Detalhes em [`BEST_PRACTICES.md`](BEST_PRACTICES.md#10-testes).

## D-002: documentação contínua em Markdown

- Data: 2026-10-25
- Status: Aceita
- Contexto: o projeto é desenvolvido com apoio de IA, que não guarda memória entre sessões; o contexto precisa estar nos arquivos.
- Decisão: toda decisão, requisito e descoberta é registrada em `docs/` durante o trabalho, e os docs são relidos no início de cada tarefa.
- Consequências: regra no `CLAUDE.md`; este arquivo existe para isso.

## D-001: controle principal é o DualShock 4 (PS4)

- Data: 2026-10-25
- Status: Aceita
- Contexto: o jogo é para dois jogadores locais com controle. Precisamos de um controle de referência para mapeamentos padrão, textos da interface e testes.
- Decisão: o jogo é projetado e testado primeiro com **dois controles DualShock 4 (PS4)**. O teclado continua como fallback e outros controles devem funcionar via remapeamento, mas não são a referência.
- Consequências:
  - mapeamento padrão dos botões baseado no layout do DualShock 4 (ver [`CONTROLLERS.md`](CONTROLLERS.md));
  - interface mostra os símbolos do PS4 (✕ ○ □ △, L1/R1, L2/R2, Options);
  - toda funcionalidade de input é testada com DualShock 4 antes de ser dada como pronta.
