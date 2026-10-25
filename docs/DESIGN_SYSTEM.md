# Design system — Beyblade Arena

## Identidade

Abertura de Bakuten Shoot: tipografia firme, imagens do universo do anime, superfícies opacas e cantos retos. A interface deixa o conteúdo aparecer; sem desfoque, brilho, degradês decorativos ou rolagem presa.

As fontes são **Dela Gothic One 400** para cartelas e títulos principais e **Barlow 400/600/800** para interface, texto e números tabulares. As duas são servidas localmente pelo Next.js. Código usa a fonte monoespaçada do sistema apenas dentro de blocos de código.

## Fonte única dos tokens

Edite [`design-system/tokens.json`](../design-system/tokens.json). As cores, campos de fera, escala tipográfica, espaçamento, geometria e curvas de movimento ficam nessa fonte. Execute:

```sh
node scripts/sync-design-tokens.js
node scripts/sync-design-tokens.js --check
npm test
```

O gerador produz `src/design/tokens.css` para o jogo e `site/app/tokens.css` para a landing. Os dois arquivos são versionados; não devem ser editados manualmente. `src/design/tokens.js` lê diretamente o JSON para o canvas e para os testes de contraste. `app/globals.css` importa o CSS gerado e mantém somente as regras do jogo e os aliases do shadcn/ui.

A cópia do site é intencional: a Vercel usa Root Directory = `site`, e o build da landing precisa funcionar sem ler arquivos externos. Testes verificam que as duas saídas correspondem exatamente à fonte e que os dois apps usam as duas fontes da marca.

## Cor: 60/30/10 por superfície

| Proporção de referência | Papel | Token |
| --- | --- | --- |
| 60% | Fundo dominante, respiro, leitura | `--tinta` (`#0d1226`) |
| 30% | Áreas de apoio, campos e painéis | `--tinta-2` (`#161d38`) e `--tinta-3` (`#232b4d`) |
| 10% | Ação principal, foco e comando ativo | `--chamada` (`#ffd400`) |

A proporção orienta a composição, não uma contagem exata de pixels: fotografias e texto não entram como novas cores da interface. Branco é a tinta de leitura; os tons de texto secundário vêm do mesmo azul. O amarelo não preenche todas as seções e não é usado em informação secundária.

As cores das feras são **dados de identidade**, usadas no campo do personagem e no emblema, nunca como decoração em cada seção da landing. P1/P2 e erro mantêm cores semânticas e sempre acompanham um rótulo. Cada tela deve ter uma base, um apoio e um acento predominantes.

## Componentes e hierarquia

- Ação principal: retângulo amarelo, texto em tinta, mínimo de 44px e feedback de pressão em 120ms. Links secundários ficam como texto.
- Cartelas: Dela Gothic One, até duas linhas, máximo de 96px. Corpo em Barlow 18px, medida de leitura de até 65 caracteres.
- Ficha: retrato, nome, beyblade, rotação e tipo, atributos e especial. O campo da fera usa seu token de texto, com contraste próprio.
- Etapas: controle de intervalo e botões acessíveis por teclado, estado selecionado com texto e cor. Sem atrasar a resposta com animação de remontagem.
- Perguntas: `details`/`summary` nativos; funcionam sem JavaScript.
- Créditos, privacidade e termos: a mesma barra, tipografia, espaçamento, foco e rodapé da landing; sem identidade paralela.

## Movimento

Curvas compartilhadas: `--ease-out` para entradas e feedback, `--ease-in-out` para deslocamento. Tempos: pressão 120ms, interface 180ms, corte 260ms. Teclado e navegação repetida respondem imediatamente.

Na landing, `Reveal.jsx` usa IntersectionObserver como scroll trigger. Cada bloco entra uma única vez com 20px de deslocamento e opacidade, em 480ms, com defasagem curta de 60ms entre filhos (máximo de 180ms). O observer ativa keyframes CSS de uma única execução; a preferência por movimento reduzido cancela o deslocamento e desativa novas entradas. O HTML é visível por padrão; falhas de JS não escondem conteúdo.

A hero tem um efeito autoral: a Dragoon S gira em função da rolagem. Sua matriz é um SVG traçado de fotografia do brinquedo real, entregue na página por WebP responsivo. `HeroBey.jsx` agenda no máximo um requestAnimationFrame por evento de scroll, sem renderizar estado React a cada frame. O efeito para fora da tela, na aba oculta e com movimento reduzido. A área da ilustração reserva espaço para o limite diagonal durante a rotação, evitando rolagem horizontal em ângulos intermediários.

As demonstrações de batalha usam WebP animado gerado dos mesmos SVGs, em 1152 × 648: mais cores e melhor compressão que GIF. Sempre existe poster estático; o loop pausa fora da tela, na aba oculta, com movimento reduzido ou pelo botão de pausa. Os controles continuam utilizáveis por teclado. Créditos identificam as fotografias de referência e distinguem a animação conceitual de gameplay.

Artes das beyblades: usar os modelos físicos da geração clássica, com peças e adesivos reconhecíveis. `site/assets/beyblades/` guarda as fotografias e suas origens; `npm run bey:assets` em `site/` gera SVGs em curvas, máscara vetorial de transparência e versões WebP de 480/960/1440px. Não encapsular PNG/JPEG em SVG para chamá-lo de vetor. O traçado mantém a aparência da referência, sem inventar detalhes inexistentes na foto. `BeyArtwork.jsx` centraliza a entrega responsiva e o carregamento prioritário da hero.

## Qualidade e manutenção

A landing usa um limite de leitura e composição de 1440px, preservando fundos de ponta a ponta. No celular, a beyblade aparece entre o título e a descrição; a disponibilidade fica junto do botão de download. O menu móvel usa `details` nativo, fecha com Escape e devolve o foco ao acionador.

Seleção de personagens combina retrato e vetor da bey, com atributos de referência e especiais identificados como planejados. Etapas da partida e dispositivos do guia de comandos usam abas com setas, Home/End e um único ponto de entrada pelo Tab; trocar de opção não dispara animações. Os comandos refletem `CONTROLLERS.md`. O roadmap mantém a etapa atual visível e agrupa o restante em um expansível nativo. O download mantém o endereço definido em D-016 e explica a dependência da primeira release.

Texto normal ≥4,5:1; texto grande ≥3:1. Foco amarelo visível, alvos de toque ≥44px, imagens com dimensões e descrição. Cores não são a única forma de indicar estado. Os tokens do jogo e da landing têm testes de sincronização, fontes e contraste.

A galeria do jogo está em `app/design-system/page.js`; seus componentes vivem em `src/components/game/` e `src/components/ui/`. A landing é um app estático independente em `site/`; seu build não depende de Docker, Prisma ou do banco.

As regras deste documento seguem os tokens implementados. O brief histórico em `.impeccable/` contém uma paleta de exploração anterior e não é fonte de valores para produção.

## Componentes do jogo

Direção "Abertura do Anime" ([D-022](DECISIONS.md#d-022-direção-visual-abertura-do-anime-e-shadcnui-no-jogo)). Base de interface: shadcn/ui em `src/components/ui/`, ajustado aos tokens. Componentes próprios em `src/components/game/`, todos vistos funcionando em `/design-system`:

| Componente | Arquivo | Regra |
| --- | --- | --- |
| Campo de fera | `fera-field.jsx` | Cor da fera na área inteira; linhas de velocidade numa camada que anda só por `transform` e para com movimento reduzido ou qualidade Baixa |
| Cartela e VS | `title-card.jsx` | Nome em Dela Gothic One maiúscula; linha de apoio em Barlow 20px negrito (texto grande sobre o campo) |
| Glifos e dicas | `pad-glyph.jsx` | Botões do DualShock 4 desenhados em SVG; a dica mostra glifo **e** tecla (D-015) |
| Anel de giro | `spin-ring.jsx` | Mais giro = mais marcas e rotação mais rápida; abaixo de 25% o arco fica amarelo |
| Barras do HUD | `gauge-bar.jsx` | 20 segmentos chapados; especial cheio vira amarelo e diz "Pronto" |
| Fileira de rodadas | `round-row.jsx` | Uma linha que nunca quebra; rodada ganha na cor da fera de quem venceu |
| Anúncio de finalização | `announcement.jsx` | Faixa amarela inclinada que entra por varredura (`role="status"`) |
| Seleção versus | `versus-select.jsx` | Cada metade no campo da fera do jogador; navega por controle e teclado (`src/hooks/use-menu-nav.js`) |

Cuidados descobertos:

- **Hidratação com coordenadas calculadas:** servidor e navegador divergem na última casa de `Math.cos`/`Math.sin`, e o React acusa erro de hidratação. Arredonde coordenadas de SVG geradas em código (o anel de giro usa 3 casas).
- **Texto sobre campo de fera:** os campos passam 3:1, não 4,5:1, com o texto da fera. Texto menor que 20px negrito não vai direto sobre o campo.
- **Botão desabilitado** é neutro (`tinta-3` com `texto-3`), nunca o amarelo transparente.
