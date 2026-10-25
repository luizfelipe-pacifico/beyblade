# Neo Reverse Shooter (Neo Left EZ Shooter)

<!-- auto:inicio (gerado por npm run build:research; não edite este bloco) -->
![Lançador](lancador.svg)

| Atributo | Valor |
|---|---|
| Força | 7 |
| RPM máx. (estimado) | 6850 |
| Precisão | 5 |
| Controle de ângulo | 5 |
| Facilidade | 7 |
<!-- auto:fim -->

**Nome JP:** ネオリバースシューター · **Tipo:** ripcord · **Rotação:** esquerda · **Sistema:** magnacore · **No anime:** sim

Segunda versão do lançador esquerdo. Não tem a engrenagem inversora; o winder é inserido de cabeça para baixo, o que inverte o sentido de rotação (wiki).

Dados para o jogo em [`dados.json`](dados.json). Arte: `lancador.svg` será gerado por `scripts/render-art.js` a partir de `forma` (não desenhe à mão).

## Produto (Takara / Hasbro)

- Incluso na Starter Dragoon V (Takara, dez/2001, vermelho)
- Incluso na Starter Dragoon G (Takara, dez/2002, azul)
- Incluso nas Starters Dragoon V/G da Hasbro (2003)

**Acessórios:** Dragon Winder (Starter Dragoon V: azul; Dragoon G: amarelo); Turbo Winder branco (Dragoon G).

**Material:** ABS.

| Medida | Valor | Fonte |
|---|---|---|
| comprimento_mm | 72 | estimado |
| largura_mm | 52 | estimado |
| altura_mm | 26 | estimado |
| peso_g | 16 | estimado |
| curso_corda_mm | 218 | estimado: Dragon/Neo-Dragon Winder (68 dentes) |

## Ripcords

De fábrica: [Dragon Winder](../ripcords/dragon-winder/). Compatíveis: [Winder padrão (Beyblade Winder)](../ripcords/winder-padrao/), [Ripcord Hasbro (era plástica)](../ripcords/winder-hasbro/), [Dragon Winder](../ripcords/dragon-winder/), [Neo-Dragon Winder](../ripcords/neo-dragon-winder/), [Ultimate Winder](../ripcords/ultimate-winder/). O rpm_max abaixo foi estimado com o ripcord de fábrica; trocar de ripcord aplica a razão dos multiplicadores (ver o [README do catálogo](../README.md#ripcords)).

## Como funciona

O **winder** (ripcord) é uma régua de plástico com uma fileira de dentes: uma **cremalheira**. Ao entrar pela fenda do lançador, os dentes engatam num **pinhão** (engrenagem pequena; 10 dentes no EZ Shooter, segundo a wiki). O pinhão é ligado aos **dois prongs**, que se encaixam nas aberturas ao lado do Bit Chip e empurram as abas do Spin Gear.

Ao puxar, a cremalheira passa reto pelo pinhão e o faz girar, levando a beyblade junto. Cada dente que passa avança um dente do pinhão: o Dragon Winder (68 dentes) dá **~6,8 voltas** num pinhão de 10 dentes. A rotação final depende sobretudo da **velocidade da mão no fim da puxada** e do **raio do pinhão**: rpm ≈ v / (2π·r) × 60. Com ~3,5 m/s e r ≈ 5,1 mm, isso dá ~6.500 rpm. Pinhão menor (Power Custom, 9 dentes) dá mais rpm com a mesma mão.

Quando a cremalheira sai, o pinhão fica livre (catraca) e a bey, ainda presa só pela gravidade e pelos prongs, cai. Se o lançador estiver inclinado, a bey sai inclinada. Se a puxada for torta, a corda raspa na fenda: perde força e desgasta o lançador (a wiki recomenda endireitar o winder em água quente).

**Sentido de rotação:** os prongs só empurram as abas do Spin Gear num sentido. Um SG esquerdo tem as abas invertidas e precisa de um lançador esquerdo, que inverte o sentido com uma engrenagem extra (Left EZ original) ou com o winder entrando de cabeça para baixo (Neo Reverse). O Dual Shooter do HMS tem duas fendas, uma para cada sentido.

## Quem usa no anime

- **Tyson** (v-force; dragoon-v, dragoon-v2, dragoon-v2-high-power-custom): Inferido do brinquedo: a Dragoon V veio com Neo Reverse Shooter vermelho (wiki). As fontes não dizem qual lançador o Tyson usa na V-Force.
- **Tyson** (g-revolution; dragoon-g, dragoon-gt): Dentro do Customize Grip branco (ver customize-grip-tyson). A Starter Dragoon G trouxe o Neo Reverse Shooter azul.

Beys que apontam para este lançador em [`_mapa.json`](../_mapa.json): `tyson-granger/dragoon-v`, `tyson-granger/dragoon-v2`, `tyson-granger/dragoon-v2-high-power-custom`.

## Técnica de lançamento dos personagens

### Tyson

- **No anime:** Canhoto, mas às vezes lança com a mão direita para controlar melhor o lançador (wiki). Rotação esquerda desde a Dragoon S. Truques: no ep. 1 alonga o winder para ter mais força e corre até o estádio, pulando para lançar do alto; no ep. 4 lança com o lançador virado para cima (a Dragoon S "some e reaparece"). Na G-Rev ep. 21 o lançamento sai fraco quando ele está abalado; no ep. 39 o tranco da Dragoon MS joga o corpo dele para trás.
- **Frase de lançamento:** "3, 2, 1... Let it rip!" (EN) / "Go Shoot!" (JP); "Dragoon, attack!"
- **No mini-game:** Bônus de força com "lançamento com corrida" (segurar o analógico para frente durante a contagem); variação "lançador para cima" (inclinação > 60°) faz a bey quicar e cair num ponto aleatório perto do centro. Penalidade de força se a vida/moral estiver baixa (G-Rev ep. 21).

## Atributos e mini-game

| Força | rpm máx. | Precisão | Controle de ângulo | Facilidade |
|---|---|---|---|---|
| 7 | 6850 | 5 | 5 | 7 |

Todos estimados (escala 1–10). Sem a camada de inversão: o winder entra de cabeça para baixo e aciona os prongs mais diretamente (wiki). Menos atrito que o Left EZ original + Dragon Winder longo => ~+5% sobre a referência (6550 x 1,05 ≈ 6850).

**Tradução para o DualShock 4** (regras gerais no [README do catálogo](../README.md#mini-game-de-lançamento-dualshock-4)):

- **R2 (puxar):** apertar até o fim em ~300 ms. A janela perfeita é de **115 ms** em torno do "Let it rip!"; força máxima x1.05.
- **Analógico esquerdo (inclinar/mirar):** até 35° de inclinação; desvio angular aleatório de ±6°.

## Referências visuais

Nenhuma foto local deste lançador existe no repositório (as fotos da wiki estão atrás do CDN bloqueado). Cores e formas em `forma` são estimadas e marcadas em `obs_cores`.

## Incertezas

- Medidas e peso são **estimativas** coerentes entre os lançadores (nenhuma ficha técnica oficial foi encontrada).

## Fontes

- https://beyblade.fandom.com/wiki/Left-Spin_Shooters
- https://beyblade.fandom.com/wiki/Launcher
- https://beyblade.fandom.com/wiki/Dragoon_V
- https://beyblade.fandom.com/wiki/Dragoon_G
- https://beyblade.fandom.com/wiki/Ripcord
