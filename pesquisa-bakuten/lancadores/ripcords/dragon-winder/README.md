# Dragon Winder

<!-- auto:inicio (gerado por npm run build:research; não edite este bloco) -->
![Ripcord](ripcord.svg)

| Medida / atributo | Valor |
|---|---|
| Comprimento | 270 <sub>estimado</sub> mm |
| Largura · espessura | 11 <sub>estimado</sub> · 2,2 <sub>estimado</sub> mm |
| Dentes (passo) | 68 <sub>wiki</sub> (3,2 <sub>estimado</sub> mm) |
| Peso | 6 <sub>estimado</sub> g |
| Spin entregue | 7 |
| Facilidade | 8 |
| Durabilidade | 6 |
<!-- auto:fim -->

**Nome JP:** ドラゴンワインダー · **Tipo:** winder · **Sentido:** esquerda

Winder das primeiras Dragoon: mais longo que o padrão (68 dentes) e com pegador em forma de dragão para dois dedos. Os dentes eram virados para a esquerda e depois mudaram para a direita, para os Neo Left EZ Shooters (wiki).

Dados em [`dados.json`](dados.json). A arte será gerada a partir de `forma` (comprimento, dentes, cor, pegador).

## Produto

- Incluso nas Dragoon da primeira fase (Takara)
- Starter Dragoon V: azul
- Starter Dragoon G: amarelo

**Material:** Plástico flexível (PE/PP, estimado).

| Medida | Valor | Fonte |
|---|---|---|
| comprimento_mm | 270 | estimado: cremalheira + pegador |
| largura_mm | 11 | estimado |
| espessura_mm | 2.2 | estimado |
| numero_dentes | 68 | wiki |
| passo_dente_mm | 3.2 | estimado |
| peso_g | 6 | estimado |

## Como funciona

Cada dente da cremalheira passa por um dente do pinhão do lançador. Com 68 dentes num pinhão de 10, a bey dá ~6.8 voltas durante a puxada. O que define o rpm final é a velocidade da mão no fim do curso: um ripcord mais longo (curso de 218 mm) dá mais tempo para acelerar. Por isso o multiplicador é 1.05 em relação ao winder padrão. O pegador muda a firmeza: o anel é para um dedo; o pegador de dragão (horizontal ou em T) é para dois.

## Compatibilidade

[EZ Shooter (Easy Shooter, rotação direita)](../../ez-shooter/), [Left EZ Shooter (lançador esquerdo original, "Dragoon")](../../left-ez-shooter/), [Neo Reverse Shooter (Neo Left EZ Shooter)](../../neo-reverse-shooter/), [EZ Shooter Grip (Easy Shooter Grip)](../../ez-shooter-grip/), [Catapult Grip](../../catapult-grip/), [Marksmen Grip (Sniper Grip)](../../marksmen-grip/), [Spring Shooter](../../spring-shooter/), [Dragoon Shooter DX](../../dragoon-shooter-dx/), [Driger Shooter DX](../../driger-shooter-dx/), [Dranzer Shooter DX](../../dranzer-shooter-dx/), [Bey Ultimate Shooter (BeyUltimate Shooter)](../../bey-ultimate-shooter/), [Customize Grip (Off-White) - versão Tyson](../../customize-grip-tyson/), [Customize Grip (Gun Metallic / preto) - versão Kai](../../customize-grip-kai/), [Customize Grip (Sky Blue) - versão Ray](../../customize-grip-ray/), [Customize Grip (Dark Green) - versão Max](../../customize-grip-max/), [EZ Shooter Power Custom](../../ez-shooter-power-custom/), [EZ Shooter Spring Custom](../../ez-shooter-spring-custom/), [Duotron Launcher (Hasbro)](../../duotron-launcher/), [Mangual-lançador do Robert (anime)](../../griffolyon-flail/), [RC Shooter (lançador-controle das RC Beyblades)](../../rc-shooter/).

## Quem usa no anime

- **Tyson** (dragoon-s, dragoon-f, dragoon-v, dragoon-v2, dragoon-g): Inferido do brinquedo: vem com as Dragoon (wiki). O anime não nomeia o winder do Tyson.

Beys que apontam para este ripcord em `_mapa.json` (chave `ripcords`): `tyson-granger/dragoon-s`, `tyson-granger/dragoon-f`, `tyson-granger/dragoon-v`, `tyson-granger/dragoon-v2`, `tyson-granger/dragoon-g`.

## Atributos e mini-game

| Spin entregue | Facilidade | Durabilidade |
|---|---|---|
| 7 | 8 | 6 |

Estimados (1–10). Mais longo que o padrão: mais curso para a mão acelerar ("aumenta a velocidade de giro", wiki). Pegador de dragão para dois dedos. A wiki diz que não há desvantagem em relação ao padrão.

- **multiplicador_rpm:** 1.05 (winder padrão = 1,00).
- **curso_puxada_mm:** 218: o curso do R2 corresponde a este comprimento; ripcords mais longos pedem uma puxada mais longa (tempo ideal ≈ curso / 0,85 m/s).
- **desgaste_por_batalha:** 2, durabilidade 100.

## Incertezas

- Medidas físicas sem ficha oficial: estimadas com passo de dente comum de ~3,2 mm (coerente com 68 dentes ≈ 218 mm de cremalheira).
- A wiki diz que os dentes passaram de esquerda para direita para o Neo Left, mas também diz que o Neo Left recebe o winder de cabeça para baixo. O sentido aqui é o da linha de beys (esquerda).

## Fontes

- https://beyblade.fandom.com/wiki/Ripcord
- https://beyblade.fandom.com/wiki/Dragoon_V
- https://beyblade.fandom.com/wiki/Dragoon_G
