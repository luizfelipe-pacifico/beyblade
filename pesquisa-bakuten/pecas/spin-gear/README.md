# Catálogo: Spin Gears, Neo SGs, Engine Gears e Running Cores

Categoria `spin-gear` de [`docs/BEYBLADES.md`](../../../docs/BEYBLADES.md). Inclui Spin Gears (SG) comuns e com gimmick, Neo SGs com núcleo, Engine Gears (EG), a Customize Gear do Zeus e os Running Cores (RC) do HMS. Mapa bey → peça em [`../_mapa/spin-gear.json`](../_mapa/spin-gear.json).

## Decisão: uma peça = o que vem montado na bey

Cada ficha representa **a combinação vendida com a bey**, não os componentes separados:

- **Neo SG + núcleo** formam uma peça só (`neo-right-sg-mw-core`, `neo-right-sg-south-magnecore`, ...). É assim que a Beyblade Wiki nomeia as peças ("Neo Right SG (MW Core)"), é como o brinquedo vem e mantém `pecas.spin_gear` da bey como **um único id** (como no exemplo `spin-gear/neo-right-sg-mw-core` de `BEYBLADES.md`).
- **Engine Gear + CEW** (Customize Engine Weight, a ponta trocável) também são uma peça só (`right-eg-reverse` inclui o CEW Metal Semi-Flat; `left-eg-turbo` inclui o CEW Metal Grip; `right-eg-circle-survivor` inclui a tigela; `right-customize-gear-free-shaft-version` inclui o CEW Light Sharp).
- Por isso o mapa nunca usa lista: cada bey aponta para um id ou `null`.
- Se um dia o jogo permitir customização (trocar núcleo/CEW), os componentes podem virar fichas próprias; os pesos dos núcleos isolados estão nos READMEs (Normal Core 1,2 g; núcleo do Magnecore Dranzer V 3,3 g; CEW Metal Grip 3 g; CEW Circle Survivor 5 g).

## Normalização dos nomes brutos

| Nome bruto (`pecas-brutas.json`) | Peça |
|---|---|
| Right SG; Right SG (segundo o infobox); Right SG (infobox) / Engine Gear no anime | `right-sg` |
| Neo Right SG (MW Core) = Neo Right SG (Metal Weight Core) | `neo-right-sg-mw-core` |
| Neo Right SG (S-MG Core) = (South Core) = (MG Core) do Draciel V2 | `neo-right-sg-south-magnecore` |
| Right SG (Oil Ball / Ball Bearing ver.) | `right-sg-oil-ball-version` |
| Right EG (Metal Semi-Flat) = Right Engine Gear (Metal Semi-Flat) | `right-eg-metal-semi-flat` |
| Left Engine Gear (CEW Metal Semi-Flat) | `left-eg-metal-semi-flat` (a ponta é fixa; ver README) |
| Running Core - Grip Flat Core / Running Core: Sharp Core / ... (Running Core) | `grip-flat-core`, `sharp-core`, ... |

O Draciel V2 só tem "MG Core" na Beyblade Wiki; a WBO diz "S-MG Core", então foi para o Magnecore Sul. O Gaia Dragoon MS (Flat Core) não estava na lista bruta e foi incluído (`flat-core`).

## Beys sem peça nesta categoria (`null` no mapa)

| Bey | Motivo |
|---|---|
| `robert-jurgen/griffolyon` | A Griffolyon Base tem o SG **integrado** à base, como nas beys 4-layer (WBO). Não existe SG separado; a rotação (direita) e a ponta ficam na ficha do Blade Base. |
| `tyson-granger/dragoon-grip-attacker` | 4-layer, não tem Spin Gear. |
| `tyson-granger/dragoon-v2-high-power-custom` | Versão radiocontrolada; SG/núcleo **não confirmado** nas fontes. |

`bryan-kuznetsov/falborg-2` (bey só de anime/mangá) foi mapeada para `right-sg` pela infobox da wiki, mas a trivia diz que no anime ela é Engine Gear: **não confirmado**.

## Divergência sobre os polos do Magnecore

A Beyblade Wiki diz: Norte atrai os ímãs do estádio (defesa), Sul repele (ataque, movimento irregular). A WBO diz que o estádio usa ímãs Norte e descreve o efeito ao contrário. As fichas seguem a Beyblade Wiki, que bate com o uso no anime (Draciel V de defesa com Norte; Driger V e Gaia Dragoon V de ataque com Sul).

## Peças

| Slug | Tipo | Sistema | Gimmick | Peso (g) | Beys |
|---|---|---|---|---|---|
| `right-sg` | SG | spin-gear | nenhum | 4,5 (estimado) | 7 |
| `left-sg` | SG | spin-gear | nenhum | 4,5 (estimado) | 2 |
| `right-sg-g-ball` | SG | spin-gear | nenhum | 5,5 (estimado) | 1 |
| `right-sg-triple-change-version` | SG | spin-gear | nenhum (troca manual) | 5 | 3 |
| `right-sg-free-shaft-version` | SG | spin-gear | free-shaft | 6 | 1 |
| `right-sg-oil-ball-version` | SG | spin-gear | bearing | 5,5 (estimado) | 1 |
| `right-sg-full-auto-clutch-version` | SG | spin-gear | free-shaft | 7 | 1 |
| `right-sg-bearing-version-2` | SG | spin-gear | bearing | 5,5 | 1 |
| `neo-right-sg-mw-core` | Neo SG | magnacore | metal-weight | 4,8 | 3 |
| `neo-left-sg-mw-core` | Neo SG | magnacore | metal-weight | 5 | 1 |
| `neo-left-sg-normal-core` | Neo SG | magnacore | nenhum | 3,6 | 1 |
| `neo-right-sg-south-magnecore` | Neo SG | magnacore | magnecore (S) | 6 | 3 |
| `neo-right-sg-south-magnecore-dranzer-v` | Neo SG | magnacore | magnecore (S) | 5,6 | 1 |
| `neo-right-sg-north-magnecore` | Neo SG | magnacore | magnecore (N) | 6 | 1 |
| `right-eg-metal-semi-flat` | EG | engine-gear | engine-gear | 11 | 3 |
| `right-eg-metal-flat` | EG | engine-gear | engine-gear | 11 | 1 |
| `right-eg-metal-ball` | EG | engine-gear | engine-gear | 11 | 1 |
| `right-eg-reverse` | EG + CEW | engine-gear | engine-gear (reverso) | 10 (estimado) | 1 |
| `right-eg-circle-survivor` | EG + CEW | engine-gear | engine-gear | 12 | 1 |
| `left-eg-metal-semi-flat` | EG | engine-gear | engine-gear | 11 | 1 |
| `left-eg-turbo` | EG + CEW | engine-gear | engine-gear (turbo) | 10 | 1 |
| `right-customize-gear-free-shaft-version` | Customize Gear + CEW | engine-gear | free-shaft | 8 (estimado) | 1 |
| `flat-core` | RC | hms | running-core | 1,5 | 1 |
| `sharp-core` | RC | hms | running-core | 2 | 1 |
| `semi-flat-core` | RC | hms | running-core | 2 | 1 |
| `manual-change-core` | RC | hms | running-core | 2,14 | 1 |
| `grip-flat-core` | RC | hms | running-core | 1 | 1 |
| `grip-flat-core-ultimate-mode` | RC | hms | running-core | 1 | 1 |

Diâmetro e altura de todas as peças são estimados (nenhuma fonte publica). As cores seguem fotos locais quando existem (G Ball, EGs Metal Flat/Metal Ball/Circle Survivor, Oil Ball, North Magnecore, Bearing Version 2, Flat Core, Sharp Core); nas outras são estimadas pelo tema da bey.
