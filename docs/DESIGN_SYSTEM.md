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

A hero tem um efeito autoral: a Dragoon S vetorial gira em função da rolagem. `HeroBey.jsx` agenda no máximo um requestAnimationFrame por evento de scroll, sem renderizar estado React a cada frame. O efeito para fora da tela, na aba oculta e com movimento reduzido. A área da ilustração reserva espaço para o limite diagonal do SVG durante a rotação, evitando rolagem horizontal em ângulos intermediários.

As demonstrações de batalha usam WebP animado gerado dos mesmos SVGs: mais cores e melhor compressão que GIF. Sempre existe poster estático; o loop pausa fora da tela, na aba oculta, com movimento reduzido ou pelo botão de pausa. Os controles continuam utilizáveis por teclado. Créditos identificam a animação como ilustração própria, sem apresentá-la como gameplay.

## Qualidade e manutenção

Texto normal ≥4,5:1; texto grande ≥3:1. Foco amarelo visível, alvos de toque ≥44px, imagens com dimensões e descrição. Cores não são a única forma de indicar estado. Os tokens do jogo e da landing têm testes de sincronização, fontes e contraste.

A galeria do jogo está em `app/design-system/page.js`; seus componentes vivem em `src/components/game/` e `src/components/ui/`. A landing é um app estático independente em `site/`; seu build não depende de Docker, Prisma ou do banco.

As regras deste documento seguem os tokens implementados. O brief histórico em `.impeccable/` contém uma paleta de exploração anterior e não é fonte de valores para produção.
