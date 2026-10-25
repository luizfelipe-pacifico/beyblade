# Dranzer Shooter DX

<!-- auto:inicio (gerado por npm run build:research; não edite este bloco) -->
![Lançador](lancador.svg)

| Atributo | Valor |
|---|---|
| Força | 7 |
| RPM máx. (estimado) | 6750 |
| Precisão | 7 |
| Controle de ângulo | 7 |
| Facilidade | 6 |
<!-- auto:fim -->

**Nome JP:** ドランザーシューターDX · **Tipo:** ripcord · **Rotação:** direita · **Sistema:** spin-gear · **No anime:** sim

Lançador eletrônico temático da fênix Dranzer, com minijogos (wiki).

Dados para o jogo em [`dados.json`](dados.json). Arte: `lancador.svg` será gerado por `scripts/render-art.js` a partir de `forma` (não desenhe à mão).

## Produto (Takara / Hasbro)

- A-29 Dranzer Shooter DX (Takara)

**Acessórios:** Eletrônica com minijogos.

**Material:** ABS + Circuito eletrônico e pilhas.

| Medida | Valor | Fonte |
|---|---|---|
| comprimento_mm | 140 | estimado |
| largura_mm | 70 | estimado |
| altura_mm | 125 | estimado |
| peso_g | 140 | estimado |
| curso_corda_mm | 145 | estimado |

## Ripcords

De fábrica: [Winder padrão (Beyblade Winder)](../ripcords/winder-padrao/). Compatíveis: [Winder padrão (Beyblade Winder)](../ripcords/winder-padrao/), [Ripcord Hasbro (era plástica)](../ripcords/winder-hasbro/), [Dragon Winder](../ripcords/dragon-winder/), [Neo-Dragon Winder](../ripcords/neo-dragon-winder/), [Ultimate Winder](../ripcords/ultimate-winder/). O rpm_max abaixo foi estimado com o ripcord de fábrica; trocar de ripcord aplica a razão dos multiplicadores (ver o [README do catálogo](../README.md#ripcords)).

## Como funciona

O **winder** (ripcord) é uma régua de plástico com uma fileira de dentes: uma **cremalheira**. Ao entrar pela fenda do lançador, os dentes engatam num **pinhão** (engrenagem pequena; 10 dentes no EZ Shooter, segundo a wiki). O pinhão é ligado aos **dois prongs**, que se encaixam nas aberturas ao lado do Bit Chip e empurram as abas do Spin Gear.

Ao puxar, a cremalheira passa reto pelo pinhão e o faz girar, levando a beyblade junto. Cada dente que passa avança um dente do pinhão: o Dragon Winder (68 dentes) dá **~6,8 voltas** num pinhão de 10 dentes. A rotação final depende sobretudo da **velocidade da mão no fim da puxada** e do **raio do pinhão**: rpm ≈ v / (2π·r) × 60. Com ~3,5 m/s e r ≈ 5,1 mm, isso dá ~6.500 rpm. Pinhão menor (Power Custom, 9 dentes) dá mais rpm com a mesma mão.

Quando a cremalheira sai, o pinhão fica livre (catraca) e a bey, ainda presa só pela gravidade e pelos prongs, cai. Se o lançador estiver inclinado, a bey sai inclinada. Se a puxada for torta, a corda raspa na fenda: perde força e desgasta o lançador (a wiki recomenda endireitar o winder em água quente).

**Sentido de rotação:** os prongs só empurram as abas do Spin Gear num sentido. Um SG esquerdo tem as abas invertidas e precisa de um lançador esquerdo, que inverte o sentido com uma engrenagem extra (Left EZ original) ou com o winder entrando de cabeça para baixo (Neo Reverse). O Dual Shooter do HMS tem duas fendas, uma para cada sentido.

**O papel do grip:** o cabo em pistola põe a mão que segura o lançador **abaixo e atrás** do ponto de lançamento, como numa pistola. Assim o punho trava o ângulo (menos inclinação acidental), o braço absorve o tranco da puxada e a outra mão puxa o winder em linha reta, alinhado com a fenda. Resultado: quase a mesma rotação, mas muito mais **precisão** e **controle de ângulo**. Acessórios como Spring Support/Spring Trigger (mola que guia a corda), Rubber Grip (borracha antiderrapante) e Metal Trigger (peso e apoio para o dedo) reforçam isso (wiki, Grip/Customize Grip).

## Quem usa no anime

- **Kai** (s1; dranzer-f, black-dranzer): Ep. 33 (Paris): Dranzer S vira Dranzer F e o Kai troca o lançador pelo Dranzer Shooter DX. Uso com a Black Dranzer inferido (mesmo arco).

Beys que apontam para este lançador em [`_mapa.json`](../_mapa.json): `kai-hiwatari/dranzer-f`, `kai-hiwatari/black-dranzer`.

## Técnica de lançamento dos personagens

### Kai

- **No anime:** Lançamento forte e preciso. Na G-Rev ep. 39 a Hilary lança a Hopper 2 "imitando o jeito como o Kai lança a Dranzer" (trivia da wiki), sinal de que a pose do Kai é marcante. Contra rivais fortes vai com tudo desde o lançamento.
- **Frase de lançamento:** "Let it rip!" / "Go Shoot!"; "Dranzer, go!"
- **No mini-game:** Janela perfeita um pouco mais estreita, mas com bônus de precisão (desvio angular x0,8) quando acertada: estilo "frio e exato".

## Atributos e mini-game

| Força | rpm máx. | Precisão | Controle de ângulo | Facilidade |
|---|---|---|---|---|
| 7 | 6750 | 7 | 7 | 6 |

Todos estimados (escala 1–10). Mesma família dos DX (corpo grande, mecanismo embutido). Direito porque toda a linha Dranzer é de rotação direita.

**Tradução para o DualShock 4** (regras gerais no [README do catálogo](../README.md#mini-game-de-lançamento-dualshock-4)):

- **R2 (puxar):** apertar até o fim em ~260 ms. A janela perfeita é de **125 ms** em torno do "Let it rip!"; força máxima x1.03.
- **Analógico esquerdo (inclinar/mirar):** até 30° de inclinação; desvio angular aleatório de ±4°, reduzido pela assistência de mira (0.2).

## Referências visuais

Nenhuma foto local deste lançador existe no repositório (as fotos da wiki estão atrás do CDN bloqueado). Cores e formas em `forma` são estimadas e marcadas em `obs_cores`.

## Incertezas

- Medidas e peso são **estimativas** coerentes entre os lançadores (nenhuma ficha técnica oficial foi encontrada).
- Sentido de rotação inferido (direita).

## Fontes

- https://beyblade.fandom.com/wiki/Dranzer_Shooter_DX
- https://beyblade.fandom.com/wiki/Beyblade_-_Episode_33
- https://beyblade.fandom.com/wiki/Launcher
- https://beyblade.fandom.com/wiki/List_of_Original_Series_products_(Takara)
