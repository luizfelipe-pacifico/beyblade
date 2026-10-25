# HMS Customize Grip (Ray: Dual Shooter preto + G-Winder azul)

<!-- auto:inicio (gerado por npm run build:research; não edite este bloco) -->
![Lançador](lancador.svg)

| Atributo | Valor |
|---|---|
| Força | 8 |
| RPM máx. (estimado) | 7600 |
| Precisão | 8 |
| Controle de ângulo | 8 |
| Facilidade | 8 |
<!-- auto:fim -->

**Nome JP:** HMSカスタマイズグリップ · **Tipo:** ripcord · **Rotação:** dupla · **Sistema:** hms · **No anime:** sim

Versão HMS do Customize Grip, usável por destros e canhotos: o compartimento do Dual Shooter sai e o cabo desliza para o outro lado (wiki). Aceita Spring Trigger e Rubber Grip.

Dados para o jogo em [`dados.json`](dados.json). Arte: `lancador.svg` será gerado por `scripts/render-art.js` a partir de `forma` (não desenhe à mão).

## Produto (Takara / Hasbro)

- A-132 HMS Customize Grip (Takara)
- A-133 HMS Rubber Grip (Blue)
- MA-05 HMS Spring Trigger (Silver)
- Versão Sonokong (Coreia) com cabo ranhurado

**Acessórios:** Dual Shooter; HMS Rubber Grip; HMS Spring Trigger; G-Winder.

**Material:** ABS + Borracha (Rubber Grip), Mola de aço (Spring Trigger).

| Medida | Valor | Fonte |
|---|---|---|
| comprimento_mm | 100 | estimado |
| largura_mm | 55 | estimado |
| altura_mm | 120 | estimado |
| peso_g | 70 | estimado |
| curso_corda_mm | 218 | estimado |

## Ripcords

De fábrica: [G-Winder (HMS)](../ripcords/g-winder/). Compatíveis: [G-Winder (HMS)](../ripcords/g-winder/). O rpm_max abaixo foi estimado com o ripcord de fábrica; trocar de ripcord aplica a razão dos multiplicadores (ver o [README do catálogo](../README.md#ripcords)).

## Como funciona

O **winder** (ripcord) é uma régua de plástico com uma fileira de dentes: uma **cremalheira**. Ao entrar pela fenda do lançador, os dentes engatam num **pinhão** (engrenagem pequena; 10 dentes no EZ Shooter, segundo a wiki). O pinhão é ligado aos **dois prongs**, que se encaixam nas aberturas ao lado do Bit Chip e empurram as abas do Spin Gear.

Ao puxar, a cremalheira passa reto pelo pinhão e o faz girar, levando a beyblade junto. Cada dente que passa avança um dente do pinhão: o Dragon Winder (68 dentes) dá **~6,8 voltas** num pinhão de 10 dentes. A rotação final depende sobretudo da **velocidade da mão no fim da puxada** e do **raio do pinhão**: rpm ≈ v / (2π·r) × 60. Com ~3,5 m/s e r ≈ 5,1 mm, isso dá ~6.500 rpm. Pinhão menor (Power Custom, 9 dentes) dá mais rpm com a mesma mão.

Quando a cremalheira sai, o pinhão fica livre (catraca) e a bey, ainda presa só pela gravidade e pelos prongs, cai. Se o lançador estiver inclinado, a bey sai inclinada. Se a puxada for torta, a corda raspa na fenda: perde força e desgasta o lançador (a wiki recomenda endireitar o winder em água quente).

**Sentido de rotação:** os prongs só empurram as abas do Spin Gear num sentido. Um SG esquerdo tem as abas invertidas e precisa de um lançador esquerdo, que inverte o sentido com uma engrenagem extra (Left EZ original) ou com o winder entrando de cabeça para baixo (Neo Reverse). O Dual Shooter do HMS tem duas fendas, uma para cada sentido.

**O papel do grip:** o cabo em pistola põe a mão que segura o lançador **abaixo e atrás** do ponto de lançamento, como numa pistola. Assim o punho trava o ângulo (menos inclinação acidental), o braço absorve o tranco da puxada e a outra mão puxa o winder em linha reta, alinhado com a fenda. Resultado: quase a mesma rotação, mas muito mais **precisão** e **controle de ângulo**. Acessórios como Spring Support/Spring Trigger (mola que guia a corda), Rubber Grip (borracha antiderrapante) e Metal Trigger (peso e apoio para o dedo) reforçam isso (wiki, Grip/Customize Grip).

## Quem usa no anime

- **Ray** (g-revolution; driger-ms): Wiki (Ray Kon, "HMS Custom Shooter"): Dual Shooter preto com G-Winder azul num Customize Grip azul com HMS Rubber Grip cinza, no torneio contra a BEGA.

Beys que apontam para este lançador em [`_mapa.json`](../_mapa.json): `ray-kon/driger-ms`.

## Técnica de lançamento dos personagens

### Ray

- **No anime:** Lançamento firme e reto; a Driger orbita rápido e entra em investidas repetidas (pesquisa do personagem). Usa winder preto com o EZ Shooter e o Driger Shooter, e o Ultimate Winder verde com o BeyUltimate Shooter (wiki).
- **Frase de lançamento:** "Let it rip!" / "Go Shoot!"; "Driger, Tiger Claw!"
- **No mini-game:** Tremor do analógico reduzido (mira estável); bônus de órbita quando lançado com inclinação lateral de 10–20°.

## Atributos e mini-game

| Força | rpm máx. | Precisão | Controle de ângulo | Facilidade |
|---|---|---|---|---|
| 8 | 7600 | 8 | 8 | 8 |

Todos estimados (escala 1–10). Dual Shooter (~7400) + grip com mola (+3%). Ambidestro: o compartimento do shooter muda de lado (wiki).

**Tradução para o DualShock 4** (regras gerais no [README do catálogo](../README.md#mini-game-de-lançamento-dualshock-4)):

- **R2 (puxar):** apertar até o fim em ~290 ms. A janela perfeita é de **130 ms** em torno do "Let it rip!"; força máxima x1.16.
- **Analógico esquerdo (inclinar/mirar):** até 35° de inclinação; desvio angular aleatório de ±3°, reduzido pela assistência de mira (0.35).
- **L1/R1:** escolher o sentido de rotação antes da puxada (lançador de rotação dupla).
- **Recuo:** tranco de câmera/vibração proporcional (0.45).
- Melhor lançador de linha da G-Rev no jogo.

## Referências visuais

Nenhuma foto local deste lançador existe no repositório (as fotos da wiki estão atrás do CDN bloqueado). Cores e formas em `forma` são estimadas e marcadas em `obs_cores`.

## Incertezas

- Medidas e peso são **estimativas** coerentes entre os lançadores (nenhuma ficha técnica oficial foi encontrada).

## Fontes

- https://beyblade.fandom.com/wiki/Grip
- https://beyblade.fandom.com/wiki/Ray_Kon
- https://beyblade.fandom.com/wiki/List_of_Original_Series_products_(Takara)
- https://beyblade.fandom.com/wiki/Hard_Metal_System
