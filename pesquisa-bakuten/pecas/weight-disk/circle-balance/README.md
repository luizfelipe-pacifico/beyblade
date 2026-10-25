# Circle Balance

<!-- auto:inicio (gerado por npm run build:research; não edite este bloco) -->
<img src="topo.svg" width="380" alt="vista de cima"> <img src="lateral.svg" width="380" alt="perfil">

| Medidas e material | |
|---|---|
| Diâmetro | 37 <sub>estimado</sub> mm |
| Altura / espessura | 3,4 <sub>estimado</sub> mm |
| Peso | 15,1 <sub>wiki</sub> g |
| Material | Metal (metalico) |
| Estrelas Takara (A / D / S) | 1,5 / 1,5 / 2 |
| Usada em | [Dranzer MS](../../../personagens/kai-hiwatari/beyblades/dranzer-ms/), [Driger MS](../../../personagens/ray-kon/beyblades/driger-ms/) |
<!-- auto:fim -->

Weight Disk · sistema **hms** · id `weight-disk/circle-balance`

## Descrição

Disco circular do HMS, intermediário entre Circle Heavy (mais compacto e pesado) e Circle Wide (mais largo e leve).

**Função:** Versátil, faz um pouco de tudo, mas sem destaque em nada.

## Funcionamento interno

O Weight Disk é o anel de metal entre o Attack Ring e o Spin Gear (ou Running Core). É a peça mais pesada da bey de plástico (13–17 g, quase metade do peso total), então é ela que mais define massa e momento de inércia. Este disco tem distribuição **equilibrado** (massa distribuída entre o centro e a borda).

### Por que o lugar do peso muda RPM e estabilidade

O lançador entrega à bey um impulso de rotação (momento angular, `L = I·ω`). O momento de inércia `I` soma cada pedaço de massa vezes o quadrado da distância ao eixo (`I = Σ m·r²`), então **onde** o metal fica pesa mais que **quanto** metal existe.

- **Peso no centro** (Heavy): `I` menor para a mesma massa. Com o mesmo puxão, a bey sai com **mais RPM**, fica mais compacta e mais difícil de empurrar (massa alta), o que ajuda defesa e combos compactos. Em compensação guarda menos energia por RPM e perde rotação mais rápido quando atrita.
- **Peso na periferia** (Wide, Circle Wide): `I` maior. A bey sai com RPM um pouco menor, mas guarda mais energia de rotação e tem mais estabilidade giroscópica. Perde rotação mais devagar a cada choque ou atrito (stamina, roubo de rotação) e entrega golpes mais fortes, porque a massa está no raio de contato (smash attack). Também ajuda a controlar o recuo de ARs agressivos.
- **Balance** fica no meio-termo.

## Beys que usam

- `kai-hiwatari/dranzer-ms` ([ficha](../../../personagens/kai-hiwatari/beyblades/dranzer-ms/))
- `ray-kon/driger-ms` ([ficha](../../../personagens/ray-kon/beyblades/driger-ms/))

## Medidas, material e stats

| Item | Valor | Fonte |
|---|---|---|
| Peso | 15,13 g | wiki |
| Diâmetro (vértice a vértice) | 37 mm | estimado |
| Espessura | 3,4 mm | estimado (calculada do peso com densidade 7.1 g/cm³) |
| Lados | circular | wiki (nome/descrição) |
| Material | Metal | metal fundido; a liga não é especificada nas fontes |
| Stats oficiais (A/D/S) | não publicados | infobox em branco |

Não há medidas de diâmetro/espessura publicadas nas fontes consultadas (Beyblade Wiki e WBO). Diâmetro e furo central foram estimados pela proporção das fotos e pelo tamanho típico de uma bey de plástico (~45–50 mm). A espessura foi calculada para fechar com o peso publicado, assumindo densidade de 7,1 g/cm³.

## Referência

- Sem foto local desta peça no repositório.

## Fontes

- https://beyblade.fandom.com/wiki/Weight_Disk_-_Circle_Balance
- http://wiki.worldbeyblade.org/index.php?title=Circle_Balance
