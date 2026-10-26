# Engenharia reversa: Bey Battle Tournament 2 (PS1)

Segunda referência do jogo ([D-031](DECISIONS.md#d-031-jogo-de-ps1-como-segunda-referência-extraído-fora-do-repositório)): *Bakuten Shoot Beyblade 2002: Bey Battle Tournament 2* (PlayStation, Japão). As funcionalidades dele estão mais próximas da proposta final e ele é **3D**, o que faz dele a base natural para a refatoração 3D (D-006). Por enquanto ele fica **separado**: convertido e guardado fora do repositório, sem afetar o jogo. Cada coisa aproveitada vem depois, em atualizações com decisão própria.

## O disco

| Campo | Valor |
| --- | --- |
| Arquivos | `Bakuten Shoot Beyblade 2002 - Bey Battle Tournament 2 (Japan).bin` + `.cue` (em `Downloads/`) |
| Trilha | 1 trilha de dados, `MODE2/2352` (sem trilhas de áudio CD-DA) |
| Tamanho | 272.803.776 bytes (115.988 setores) |
| SHA-1 do `.bin` | `3cf777830fa5f4216c17e44d50f61225e7c2b99a` |
| Volume / código | `SLPM_87130` (SLPM-87130) |
| Executável | `SLPM_871.30` (via `SYSTEM.CNF`: `BOOT = cdrom:\SLPM_871.30;1`, pilha em `0x801FFF00`) |

## Como extrair

```
node scripts/extract-ps1.js "<caminho>/Bakuten Shoot Beyblade 2002 - Bey Battle Tournament 2 (Japan).bin"
```

Saída em **`../ps1-bbt2/`** (ao lado do repositório; o script recusa uma pasta dentro dele):

- `disc.iso`: imagem ISO de 2048 bytes por setor (só os dados de usuário);
- `files/`: os 419 arquivos do disco. Setores **Form 1** viram o arquivo normal; arquivos em **Form 2** (áudio XA, vídeo STR) ficam com os setores crus de 2352 bytes em `<nome>.raw`, para decodificar depois;
- `manifest.json`: caminho, LBA, tamanho, forma e SHA-1 de cada arquivo.

Leitura do CD e do ISO 9660 em `scripts/lib/iso9660.js`, com testes numa imagem sintética (`tests/iso9660.test.js`).

## Mapa do disco (primeira leitura)

Quase tudo fica em `OUTBIN/`. Os arquivos `*D.BIN` começam com uma **tabela de offsets** (o primeiro `u32` é o tamanho da tabela, ou seja, nº de entradas × 4) apontando para as partes internas.

| Arquivos | Quantos | Provável conteúdo |
| --- | --- | --- |
| `BBAR??MD/TD` | 16 (8 pares) | **Attack Rings**: modelo 3D (`MD`, marca `ECD\x01`) e textura (`TD`) |
| `BBBB??MD/TD` | 18 | **Blade Bases** |
| `BBBC??MD/TD` | 18 | **Bit Chips** |
| `BBWD??MD/TD` | 10 | **Weight Disks** |
| `BBSG??MD/TD`, `BBSD??MD/TD` | 16 + 4 | **Spin Gears** e núcleos |
| `BBFRM00D`, `BBMDL00D` | 2 | Estrutura/modelo base da bey montada |
| `BCHR??D` | 17 | **Personagens** (bladers) |
| `BSC???D` | 24 | Cenários / **estádios** |
| `BEFCT00D`, `BSEF??D`, `BSJEF00D`, `DSEF??D` | 1 + 12 + 1 + 12 | **Efeitos** de batalha |
| `CUST??D`, `OVLMCUST.BIN` | 7 + 1 | Tela de **customização** de peças |
| `OVLBTL.BIN` | 1 | **Código da batalha** (overlay; tem textos de debug de câmera, `CAMERA AX=%d AY=%d AZ=%d`) |
| `OVLMDSEL`, `OVLMNAME`, `OVLMFREE`, `OVLMTONA`, `OVLMFILE`, `OVLMEND`, `OVLSYS`, `OVLTEST` | 8 | Código das outras telas (seleção, nome, batalha livre, torneio, arquivo/save, final, sistema, teste) |
| `DMUS???D` | 11 | **Músicas** em sequência SEQ do PS1 (assinatura `pQES`) |
| `DSE*`, `TONE??D`, `TONK??D`, `TONN??D`, `TON*` | ~80 | **Bancos de som VAB** (assinatura `pBAV`) e sons de torneio/narração |
| `DMUV???D` | 11 | Bancos de instrumentos das músicas (provável VAB) |
| `MODE??D`, `TTL??D`, `LOAD??D`, `FILE??D`, `FREE??D`, `END??D`, `DEF???D`, `C?????D` | — | Telas: modos, título, carregamento, arquivo, batalha livre, final, menus |
| `WAV/XBGM??.XA` | 5 (Form 2) | **Trilha sonora** em áudio XA (ADPCM), ~100 MB |
| `ZZZZMIN3.PAD` | 3 | Enchimento do disco (38 MB cada), sem conteúdo |

## Próximos passos (em atualizações separadas)

1. **Texturas:** identificar o formato dos `TD` (provável TIM do PS1 ou variação) e exportar PNG.
2. **Modelos 3D:** decodificar o formato `ECD` dos `MD` (vértices, faces, UV) e exportar glTF das peças, para montar beys 3D na refatoração (D-006).
3. **Personagens** (`BCHR`): modelos/sprites e animações.
4. **Estádios** (`BSC`): geometria da tigela (perfil real de profundidade para a física da `BEY_BEHAVIOR.md`).
5. **Batalha** (`OVLBTL.BIN`, MIPS R3000): física, lançamento, especiais e IA, com Ghidra (processador MIPS:LE:32:default, base do overlay a descobrir).
6. **Som:** converter SEQ+VAB para MIDI/WAV e o XA para WAV.
