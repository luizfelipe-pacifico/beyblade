# Heavy Attack

<!-- auto:inicio (gerado por npm run build:research; não edite este bloco) -->
<img src="topo.svg" width="380" alt="vista de cima"> <img src="lateral.svg" width="380" alt="perfil">

| Medidas e material | |
|---|---|
| Diâmetro | 35 <sub>estimado</sub> mm |
| Altura / espessura | 4,7 <sub>estimado</sub> mm |
| Peso | 15 <sub>estimado</sub> g |
| Material | Metal (metalico) |
| Estrelas Takara (A / D / S) | 2 / 3 / 1 |
| Usada em | [Gaia Dragoon (Strata Dragoon)](../../../personagens/daichi-sumeragi/beyblades/gaia-dragoon/) |
<!-- auto:fim -->

Weight Disk · sistema **spin-gear** · id `weight-disk/heavy-attack`

## Descrição

Disco da série Heavy em forma de hexágono, como o Six Heavy, mas com entalhes circulares (furos) em cada vértice. A foto mostra o hexágono com seis furos nos cantos e abertura central com recortes de encaixe.

**Função:** Os vértices deveriam dar ataque, mas o disco é pequeno demais para tocar no adversário. Na prática é um Heavy mais leve: peso no centro, mais RPM.

## Funcionamento interno

O Weight Disk é o anel de metal entre o Attack Ring e o Spin Gear (ou Running Core). É a peça mais pesada da bey de plástico (13–17 g, quase metade do peso total), então é ela que mais define massa e momento de inércia. Este disco tem distribuição **centro** (massa concentrada perto do eixo).

### Por que o lugar do peso muda RPM e estabilidade

O lançador entrega à bey um impulso de rotação (momento angular, `L = I·ω`). O momento de inércia `I` soma cada pedaço de massa vezes o quadrado da distância ao eixo (`I = Σ m·r²`), então **onde** o metal fica pesa mais que **quanto** metal existe.

- **Peso no centro** (Heavy): `I` menor para a mesma massa. Com o mesmo puxão, a bey sai com **mais RPM**, fica mais compacta e mais difícil de empurrar (massa alta), o que ajuda defesa e combos compactos. Em compensação guarda menos energia por RPM e perde rotação mais rápido quando atrita.
- **Peso na periferia** (Wide, Circle Wide): `I` maior. A bey sai com RPM um pouco menor, mas guarda mais energia de rotação e tem mais estabilidade giroscópica. Perde rotação mais devagar a cada choque ou atrito (stamina, roubo de rotação) e entrega golpes mais fortes, porque a massa está no raio de contato (smash attack). Também ajuda a controlar o recuo de ARs agressivos.
- **Balance** fica no meio-termo.

## Beys que usam

- `daichi-sumeragi/gaia-dragoon` ([ficha](../../../personagens/daichi-sumeragi/beyblades/gaia-dragoon/))

## Medidas, material e stats

| Item | Valor | Fonte |
|---|---|---|
| Peso | 15 g | estimado (a wiki só diz que é mais leve que os outros Heavy; sem peso publicado) |
| Diâmetro (vértice a vértice) | 35 mm | estimado |
| Espessura | 4,7 mm | estimado (calculada do peso com densidade 7.1 g/cm³) |
| Lados | 6 | wiki (nome/descrição) |
| Material | Metal | metal fundido; a liga não é especificada nas fontes |
| Stats oficiais (A/D/S) | não publicados | infobox em branco |

Não há medidas de diâmetro/espessura publicadas nas fontes consultadas (Beyblade Wiki e WBO). Diâmetro e furo central foram estimados pela proporção das fotos e pelo tamanho típico de uma bey de plástico (~45–50 mm). A espessura foi calculada para fechar com o peso publicado, assumindo densidade de 7,1 g/cm³.

## Referência

- `referencia/heavy-attack.jpg` (copiada de `personagens/daichi-sumeragi/beyblades/gaia-dragoon/pecas/weight-disk.jpg`)

## Fontes

- https://beyblade.fandom.com/wiki/Weight_Disk_-_Heavy_Attack
