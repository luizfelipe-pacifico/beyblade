# Engenharia reversa: Beyblade G-Revolution (GBA)

Referência do jogo ([D-007](DECISIONS.md#d-007-rom-de-gba-como-referência-e-fonte-inicial-de-assets)). Aqui ficam as descobertas sobre a ROM: formato, onde estão os dados e o que já foi extraído. A ROM e os arquivos extraídos **nunca vão para o git**.

## A ROM

| Campo | Valor |
| --- | --- |
| Arquivo | `Beyblade G-Revolution (USA).gba` (mantido fora do repositório, em `Downloads/Beyblade G-Revolution/`) |
| Título interno (0xA0) | `BEYBLADEGREV` |
| Código do jogo (0xAC) | `BB2E` |
| Maker (0xB0) | `70` (Atari) |
| Tamanho | 4 MiB (4.194.304 bytes) |
| SHA-1 | `a89f7b4eb77dc986022201db51a676451ba7c5e4` |
| Save | EEPROM (`EEPROM_V124` na ROM) |
| CPU | ARM7TDMI (código ARM/Thumb), base de carga `0x08000000` |

## Como extrair

```
node scripts/extract-rom.js "<caminho>/Beyblade G-Revolution (USA).gba"
```

O script confere o código e o SHA-1 da ROM, lê as tabelas abaixo (`scripts/lib/rom.js`) e grava `assets-rom/data/catalog.json` (fora do git). Os testes (`tests/rom.test.js`) usam uma ROM sintética, então a suíte não precisa da ROM real.

## Descobertas

- **Textos sem compressão, em ASCII.** Cada texto existe em 5 idiomas, na ordem `en, fr, es, it, de`. O slot `fr` costuma estar vazio ou em inglês (a versão USA não tem francês completo).
- **Ponteiros** são absolutos, little-endian, com base `0x08000000` (endereço da ROM no GBA).
- O código mantém nomes de função de debug em texto (`getBeyBladeWithIndex`, `getRandomBeyBladeFromSeason`, `removeBladeFromTysonsCollection`). Eles servem de âncora para achar as funções no Ghidra.
- O roster do GBA tem beys que não estão em `pesquisa-bakuten/` (ex.: Ultimate Frostic Dranzer, Knight Dranzer, Metal Draciel, Torch Pegasus, Wyvern DJ, Gigars, Rock Bison).

### Tabela de feras bit e especiais (`0x796dc`, 71 registros de 40 bytes)

| Offset | Tamanho | Campo |
| --- | --- | --- |
| `0x00` | 5 × ponteiro | Nome da fera bit, um por idioma |
| `0x14` | 5 × ponteiro | Nome do especial, um por idioma |

Os registros `0x00`–`0x26` são feras genéricas (nome e especial iguais, ex.: `Dragoon`). Os de `0x27`–`0x46` têm especial próprio (ex.: `0x28` Driger → `Driger Slash`, `0x29` Driger → `Driger Disaster`, `0x43` Zeus → `Zeus Claws`).

### Tabela de beyblades (`0x7a1f4`, 83 registros de 40 bytes)

Vem logo depois da tabela de feras bit, no mesmo formato de 40 bytes.

| Offset | Tamanho | Campo | Confiança |
| --- | --- | --- | --- |
| `0x00` | 5 × ponteiro | Nome, um por idioma | confirmado |
| `0x14` | ponteiro | Gráfico da bey (provável: tiles) | provável |
| `0x18` | ponteiro | Paleta da bey | provável |
| `0x1c` | u8 | Tipo: `0` attack, `1` defense, `2` endurance, `3` combination (ordem dos textos "Attack type"…"Combination type") | provável; várias beys da S3 aparecem como `0` mesmo sendo de defesa |
| `0x1d` | u8 | Índice do Attack Ring | confirmado (Dragoon V2 → Spike Dragoon, Driger G → Triple Tiger) |
| `0x1e` | u8 | Índice do Weight Disk | confirmado (Dragoon V2 → Magnetic WD) |
| `0x1f` | u8 | Bits 0–4: índice do Spin Gear/Core. Bits 5–7: flags | índice confirmado (Draciel MS → Sharp Core, Dranzer MS → Manual Change Core) |
| `0x20` | u8 | Índice da Blade Base | confirmado (Dragoon V2 → Customize Grip, Dranzer F → Flame Change) |
| `0x21` | u8 | Índice na tabela de feras bit/especiais | confirmado |
| `0x22` | u8 | Desconhecido (sempre `0`) | — |
| `0x23` | u8 | Sempre `0xff` | — |
| `0x24` | u8 | Desconhecido (sempre `0`) | — |
| `0x25` | u8 | Temporada: `1` S1, `2` V-Force, `3` G-Rev; `0` = bey genérica/outros | provável (bate com `getRandomBeyBladeFromSeason`) |

**Hipótese em aberto:** as flags `0x40`/`0x80` do byte `0x1f` podem ser o sentido de rotação (todas as Dragoons do Tyson, que giram para a esquerda, têm `0x40`), mas a Driger S (direita) também tem `0x40`. Dranzer MS e Wyvern DJ têm `0x00`. Confirmar no código.

### Listas de nomes de peças

Cada lista é uma tabela de idiomas: 5 ponteiros (um por idioma) para arrays de ponteiros de nome. O índice na lista é o que a tabela de beys usa.

| Lista | Tabela de idiomas | Itens |
| --- | --- | --- |
| Spin Gear / Core | `0x7b0c4` | 22 |
| Attack Ring | `0x7b6dc` | 77 |
| Blade Base | `0x7bb6c` | 42 |
| Weight Disk | `0x7bda4` | 19 |

Também existem listas de lançadores e cordas (Plastic, Metal, Professional e Competition launcher; Plastic, Extended e Super long ripcord), golpes de batalha (Normal/Super/Ultra attack e Normal/Super defense) e textos de menu, ainda não extraídas.

### O que ainda falta achar

- **Stats numéricos das peças** (ataque, defesa, resistência, peso). Não ficam junto dos nomes. Caminho: no Ghidra, achar a função que lê `0x7b6dc` (nomes de Attack Ring) e ver qual outra tabela ela indexa com o mesmo índice.
- Stats do blader (o jogo mostra Experience, Level, Strength, Stamina, Power e Speed) e dos lançadores.
- Física da batalha, regras de vitória e efeito dos especiais.
- Gráficos (a partir dos ponteiros `0x14`/`0x18` de cada bey) e áudio.

## Ferramentas

| Ferramenta | Para quê | Status |
| --- | --- | --- |
| REA (`rea-agents`, [morluto/rea](https://github.com/morluto/rea)) | Agente de engenharia reversa (MCP) ligado ao Ghidra | Pacote verificado; `npx rea-agents setup --client claude-code` ainda precisa ser rodado pelo usuário |
| Ghidra + JDK | Desmontar o código ARM/Thumb (necessário para o REA analisar binário nativo) | A instalar |
| mGBA | Emulador com debugger, visualizador de tiles/sprites/paletas e busca de memória | A instalar |

## Plano de extração

1. **Dados**: nomes, peças e stats (tabelas perto dos textos), parâmetros de física, regras de vitória.
2. **Gráficos**: sprites das beys, retratos dos personagens, arenas, efeitos (pelos visualizadores do mGBA ou por descompressão LZ77 da BIOS).
3. **Áudio**: músicas e efeitos.
4. **Comportamento**: lançamento, colisão, perda de rotação e especiais, observados no emulador e confirmados no código pelo Ghidra.

Cada valor extraído é registrado aqui com o endereço na ROM.
