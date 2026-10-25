# Duotron Launcher (Hasbro)

<!-- auto:inicio (gerado por npm run build:research; não edite este bloco) -->
![Lançador](lancador.svg)

| Atributo | Valor |
|---|---|
| Força | 4 |
| RPM máx. (estimado) | 5000 |
| Precisão | 3 |
| Controle de ângulo | 4 |
| Facilidade | 6 |
<!-- auto:fim -->

**Tipo:** ripcord · **Rotação:** direita · **Sistema:** magnacore · **No anime:** não (só brinquedo)

Lançador duplo da Hasbro (V-Force): lança duas beys com um só winder, de forma pouco consistente (wiki).

Dados para o jogo em [`dados.json`](dados.json). Arte: `lancador.svg` será gerado por `scripts/render-art.js` a partir de `forma` (não desenhe à mão).

## Produto (Takara / Hasbro)

- Duotron Launcher (Hasbro, linha V-Force/Magnacore)

**Acessórios:** Winder Hasbro.

**Material:** ABS. Molde reaproveitado depois na linha Metal Fusion (wiki).

| Medida | Valor | Fonte |
|---|---|---|
| comprimento_mm | 85 | estimado |
| largura_mm | 115 | estimado |
| altura_mm | 30 | estimado |
| peso_g | 40 | estimado |
| curso_corda_mm | 145 | estimado |

## Ripcords

De fábrica: [Ripcord Hasbro (era plástica)](../ripcords/winder-hasbro/). Compatíveis: [Winder padrão (Beyblade Winder)](../ripcords/winder-padrao/), [Ripcord Hasbro (era plástica)](../ripcords/winder-hasbro/), [Dragon Winder](../ripcords/dragon-winder/), [Neo-Dragon Winder](../ripcords/neo-dragon-winder/), [Ultimate Winder](../ripcords/ultimate-winder/). O rpm_max abaixo foi estimado com o ripcord de fábrica; trocar de ripcord aplica a razão dos multiplicadores (ver o [README do catálogo](../README.md#ripcords)).

## Como funciona

O **winder** (ripcord) é uma régua de plástico com uma fileira de dentes: uma **cremalheira**. Ao entrar pela fenda do lançador, os dentes engatam num **pinhão** (engrenagem pequena; 10 dentes no EZ Shooter, segundo a wiki). O pinhão é ligado aos **dois prongs**, que se encaixam nas aberturas ao lado do Bit Chip e empurram as abas do Spin Gear.

Ao puxar, a cremalheira passa reto pelo pinhão e o faz girar, levando a beyblade junto. Cada dente que passa avança um dente do pinhão: o Dragon Winder (68 dentes) dá **~6,8 voltas** num pinhão de 10 dentes. A rotação final depende sobretudo da **velocidade da mão no fim da puxada** e do **raio do pinhão**: rpm ≈ v / (2π·r) × 60. Com ~3,5 m/s e r ≈ 5,1 mm, isso dá ~6.500 rpm. Pinhão menor (Power Custom, 9 dentes) dá mais rpm com a mesma mão.

Quando a cremalheira sai, o pinhão fica livre (catraca) e a bey, ainda presa só pela gravidade e pelos prongs, cai. Se o lançador estiver inclinado, a bey sai inclinada. Se a puxada for torta, a corda raspa na fenda: perde força e desgasta o lançador (a wiki recomenda endireitar o winder em água quente).

**Sentido de rotação:** os prongs só empurram as abas do Spin Gear num sentido. Um SG esquerdo tem as abas invertidas e precisa de um lançador esquerdo, que inverte o sentido com uma engrenagem extra (Left EZ original) ou com o winder entrando de cabeça para baixo (Neo Reverse). O Dual Shooter do HMS tem duas fendas, uma para cada sentido.

## Quem usa no anime

Ninguém entre os 10 personagens estudados: modelo de brinquedo da época, catalogado para o modo loja/desafio do jogo.

## Atributos e mini-game

| Força | rpm máx. | Precisão | Controle de ângulo | Facilidade |
|---|---|---|---|---|
| 4 | 5000 | 3 | 4 | 6 |

Todos estimados (escala 1–10). Lança duas beys com um winder; "muito inconsistente" (wiki). Sentido direito estimado.

**Tradução para o DualShock 4** (regras gerais no [README do catálogo](../README.md#mini-game-de-lançamento-dualshock-4)):

- **R2 (puxar):** apertar até o fim em ~270 ms. A janela perfeita é de **100 ms** em torno do "Let it rip!"; força máxima x0.78.
- **Analógico esquerdo (inclinar/mirar):** até 20° de inclinação; desvio angular aleatório de ±9°.
- **Lança duas beys:** uma puxada lança as duas, com a força dividida.

## Referências visuais

Nenhuma foto local deste lançador existe no repositório (as fotos da wiki estão atrás do CDN bloqueado). Cores e formas em `forma` são estimadas e marcadas em `obs_cores`.

## Incertezas

- Medidas e peso são **estimativas** coerentes entre os lançadores (nenhuma ficha técnica oficial foi encontrada).
- Sentido de rotação não informado na wiki.

## Fontes

- https://beyblade.fandom.com/wiki/Duotron_Launcher_(Original_Series)
- https://beyblade.fandom.com/wiki/Launcher
