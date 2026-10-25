# Galeon (ガルオン, Garuon) — Leão Negro do Trovão

![Galeon](idle.svg)

Fera bit de **Lee** ([personagens/lee](../../personagens/lee/)). Dados estruturados em [`dados.json`](dados.json).

| Campo | Valor |
|---|---|
| Animal | Leão negro (muitos fãs descrevem como pantera negra) |
| Elemento | Trovão negro (deduzido dos especiais; a wiki não tem página da fera) |
| Inspiração | Leão: "Rai" (Lee) vem de "Laion"; rivalidade leão × tigre (Byakko de Ray) |
| Beys | Galeon (Hasbro: Galeon Attacker), Galeon 2, Galeon 2 (Engine Gear) |
| Emblema | [`emblema.svg`](emblema.svg) |

## Inspiração e história
- A wiki registra que o nome japonês de Lee, **Rai**, é a forma curta de "Laion" (lion), e que isso reforça a rivalidade **leão × tigre** com Ray (Rei), ambos "reis das feras", do Oeste e do Leste.
- Lee queria o poder do Tigre Branco, mas o avô o entregou a Ray. Lee lidera os White Tigers com Galeon e perdoa Ray após a final do Torneio Asiático (S1 ep 17).
- Galeon é tomado por Kai/Black Dranzer (S1 ep 44) e volta quando Tyson vence Tala.
- **Divergência**: o pedido falava em "pantera negra"; as fontes encontradas (wiki: trivia de Lee e nomes das peças "War Lion" e "Howling Leo"; Manga Wiki: "black lion with the abilities of lightning") apontam **leão negro**. O desenho é um híbrido: corpo de pantera e juba espetada de leão.

## Aparência (como desenhar)
- Grande felino **negro**, esguio e musculoso, de quatro patas, rondando em postura baixa.
- **Juba curta e espetada roxo-escura** em volta da cabeça e do pescoço, e tufo espetado na ponta da cauda.
- Olhos **dourados**, rosnado com presas brancas, rosetas quase invisíveis no pelo e luz de borda azul-lilás para ler a forma no escuro.
- Envolto em **raios negros** de núcleo claro e brilho violeta (Black Thunder).
- Virado para a **direita**, para encarar Driger nos SVGs.
- Aparência exata no anime **não confirmada** por fonte de texto, e não há imagem dele no repositório. Cores e detalhes são interpretação de design.

## Personalidade
Orgulhoso, intenso e rancoroso como Lee: aperfeiçoa técnicas conhecidas em vez de buscar novas. Ataca com explosões elétricas que repelem o adversário.

## Especiais por bey
| Especial | Bey | Estreia | Visual no anime | Proposta no jogo |
|---|---|---|---|---|
| Dark Lightning (Black Thunder) | Galeon | S1 ep 17 | Galeon se cobre de raios; quem encosta é repelido com uma explosão para fora do estádio. Lee o aperfeiçoou a ponto de não precisar invocar a fera | Aura elétrica de 3 s: contato causa knockback x2 e dano |
| Tiger Claw | Galeon | S1 | Técnica da tribo do Tigre Branco: rajada de arranhões | Como o de Driger, com rastro violeta |
| Spiral Lightning | Galeon 2 (e 2 EG) | G-Rev ep 10 | Raios que desorientam a bey adversária e a lançam para fora | Espiral que embaralha a direção do alvo por 1,5 s e o empurra para a borda |

Nomes no dub em inglês: "Black Thunder" / "Dark Lightning" (a wiki usa os dois). Nomes da dublagem brasileira **não confirmados**.

## Aparições marcantes
- S1 ep 13: estreia de Galeon, contra Bruno.
- S1 ep 17: Black Thunder na final contra Ray, que vira o golpe contra Lee somando-o ao Tiger Claw.
- S1 ep 44: Galeon é tomado por Kai/Black Dranzer.
- G-Rev ep 7: Galeon 2 contra a Driger G de Ray (estreia do Gatling Claw).
- G-Rev ep 10: Spiral Lightning contra o Dragoon de Tyson.

## Paleta
| Uso | Hex |
|---|---|
| Primária: pelo | `#2b2840` |
| Secundária: juba | `#3e2a78` |
| Brilho: aura e halo | `#a066ff` |
| Juba (brilho) | `#8a6ae0` |
| Pelo distante | `#1f1c30` |
| Luz de borda | `#7d76b8` |
| Olhos | `#ffc93a` |
| Raio (núcleo / corpo / luz) | `#fbf7ff` / `#2a0f5c` / `#c9a6ff` |
| Contorno | `#0d1226` |

Corpo escuro: o overlay usa `blend: "normal"`. Atenção: o retrato de Lee usa um disco com cor **proposta** (`#4e5396`); pela regra de `docs/ART.md` ele deveria usar `cores.primaria` daqui (`#2b2840`), ou um tom mais claro se o contraste ficar ruim.

## Animações
- **idle.svg** (loop de 2,8 s): ronda com flutuação, respiração, cabeça baixa oscilando e rosnando, juba eriçando (escala), cauda chicoteando com o tufo balançando à parte, aura violeta pulsando, raios negros piscando ao redor e partículas subindo.
- **invocacao.svg** (1,5 s, uma vez): dois raios negros caem na âncora, abre-se um redemoinho escuro (elipses tracejadas girando) com fumaça subindo. Galeon cresce como **silhueta preta** e depois revela as cores; juba eriça, cauda e cabeça vão para a pose, explosão radial de raios e rugido. Termina na pose do idle.
- **ataque.svg** (1 s, loop): Dark Lightning + Spiral Lightning. Galeon se agacha e se ergue rugindo; uma **gaiola de raios** contorna o corpo e pisca (a fera clareia junto), **ondas de choque** elípticas se expandem (repulsão) e uma **espiral de raio** percorre a cena.
- Partes animáveis: `#body`, `#head`, `#jaw`, `#eye`, `#mane`, `#tail`, `#tail-tuft`, `#leg-front`, `#leg-front-far`, `#leg-back`, `#leg-back-far`, `#aura`, `#particles`. A fera é desenhada virada para a esquerda e espelhada com `scale(-1 1)`.

## Sons (`sons.json` → `sons/*.wav`)
- **invocacao** (2,6 s): dois estalos de trovão, estrondo longo em pink e sub-grave em sine, zumbido elétrico grave e sujo (square com growl e drive), rugido de leão mais grave que o de Driger (saw 85–130 Hz, formantes 520/1050/2250 Hz) e sopro de garganta, com reverb longo.
- **rugido** (1,8 s): rugido de leão com camada sub-grave, sopro em pink e chiado elétrico agudo de fundo.
- **ataque** (1,3 s): zumbido elétrico crescendo, dois estalos de raio, varredura em espiral subindo (saw em uníssono com vibrato rápido), boom grave e rosnado curto.

## Fontes
- https://beyblade.fandom.com/wiki/Lee (trivia: Rai = "Laion"; rivalidade leão × tigre)
- https://beyblade.fandom.com/wiki/Galeon , /Galeon_2 , /Bit_Chip_-_Galeon , /List_of_Bit_Beasts
- https://beyblade.fandom.com/wiki/Dark_Lightning_(Black_Thunder) , /Spiral_Lightning , /Tiger_Claw
- https://manga.fandom.com/wiki/Lee_Wong (fã: leão negro com poderes de relâmpago)
- READMEs das beys em `pesquisa-bakuten/personagens/lee/beyblades/`
- Arte e sons originais deste projeto (sem decalque).
