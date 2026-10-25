# <Nome da Beyblade> (<Nome JP / romaji>)

![Beyblade](imagem.jpg)

| Campo | Valor |
|---|---|
| Dono | <personagem> |
| Código do produto | <ex.: A-81 (Takara)> |
| Tipo | Attack / Defense / Stamina (Endurance) / Balance |
| Sistema | Spin Gear System / Magnacore System / Engine Gear System / HMS |
| Rotação | Direita / Esquerda / Ambas |
| Fera Bit (Bit-Beast) | <nome + animal/mitologia> |
| Série / temporada | Bakuten Shoot (2001) / V-Force (2002) / G-Revolution (2003) |
| Primeira aparição (anime) | <episódio> |
| Antecessora → Sucessora | <X> → <Y> |

## 1. Peças (de cima para baixo)

| Camada | Peça | Descrição física | Função em batalha |
|---|---|---|---|
| Bit Chip | | | identidade / fera bit |
| Attack Ring (AR) | | formato, nº de pontas, ângulo (smash / upper / defesa / slope) | |
| Weight Disk (WD) | | ex.: Ten Heavy, Eight Balance, Wide Defense | |
| Spin Gear (SG) / Core | | direita/esquerda, Metal Weight, Magnecore, Engine Gear | |
| Support Part / Sub Ring (se houver) | | | |
| Blade Base (BB) | | ponta (sharp / flat / semi-flat / grip / bola / mola), gimmick | |

Fotos das peças (quando disponíveis): `pecas/*.jpg`.

## 2. Formato e geometria
- Silhueta vista de cima, nº de contatos, simetria (2/3/4 lados), raio aproximado.
- Distribuição de peso (centro x periferia) e o que isso implica (estabilidade, inércia).
- Altura / perfil lateral (baixa = boa para upper attack; alta = vulnerável).

## 3. Comportamento na arena
- Padrão de movimento (ex.: flower pattern, centro fixo, órbita agressiva, ziguezague).
- Ataque: como causa dano / knockout (smash, upper, recoil).
- Defesa: como absorve impacto.
- Stamina: quanto tempo gira; perde para quem?
- Pontos fortes / pontos fracos / matchups (vence ↔ perde).
- Gimmick especial (ex.: clutch, engine gear, magnacore, mola, ponta retrátil).

## 4. No anime
- Ataques especiais (nome original + nome dublado) e o que fazem visualmente.
- Batalhas marcantes (episódio, adversário, resultado).
- Por que foi substituída / evolução.

## 5. Tradução para o jogo
Valores 1–10 (ver `pesquisa-bakuten/README.md` → "Escala de atributos").

| Atributo | Valor | Justificativa |
|---|---|---|
| Ataque | | |
| Defesa | | |
| Stamina | | |
| Velocidade | | |
| Peso | | |
| Equilíbrio | | |
| Burst/Knockout-resist | | |

- **Movimento em IA**: <descrição do padrão para implementar>
- **Especiais (no jogo)**: nome, efeito mecânico, custo, cooldown sugeridos.
- **Física sugerida**: massa relativa, atrito da ponta, coeficiente de restituição, raio.

Os mesmos dados ficam em `dados.json` (formato em `_template/dados.schema.json`).

## 6. Fontes
- <URLs consultados>
