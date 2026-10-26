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

## Compressão ECD (resolvida) e imagens

A descompressão é a função `0x800211B0` do executável `SLPM_871.30` (achada pelo uso de `andi 0x3ff`; decompilada no Ghidra). Reimplementada em `scripts/lib/ps1-ecd.js`, com testes em `tests/ps1-ecd.test.js`:

- cabeçalho de 16 bytes **big-endian**: `"ECD"`, nº de bytes iniciais sem compressão, tamanho total dos dados (inclui os iniciais) e tamanho descomprimido;
- os bytes iniciais vão **direto para a saída e não entram no anel** (era isso que faltava);
- LZSS com anel de **1 KB** zerado e cursor inicial em **`0x3BE`** (1024 − 66); flags do bit 0 ao 7, bit 1 = literal; cópia de 2 bytes `(a, c)`: posição `a | (c & 0xC0) << 2`, comprimento `(c & 0x3F) + 3`.

As entradas descomprimidas são texturas **TIM** do PS1 (4bpp/8bpp com paleta ou 16bpp), convertidas por `timToRgba`.

```
node scripts/extract-ps1-images.js
```

Extrai **1.587 imagens** para `../ps1-bbt2/png/<ARQUIVO>/<entrada>.png` (fora do repositório, D-031), com `index.json`. Principais grupos:

| Arquivos | Imagens | Conteúdo |
| --- | --- | --- |
| `BCHR00D`–`BCHR16D` | 221 | **Retratos dos personagens**: meio-corpo em 128×128, várias expressões (normal, falando, comemorando, bravo), em pares espelhados; mais ícones pequenos (48×48) |
| `BBAR`, `BBBB`, `BBWD`, `BBSG`, `BBBC`, `BBSD` | ~1.060 | Texturas das peças (Attack Ring, base, Weight Disk, Spin Gear, bit chip) para os modelos 3D |
| `BEFCT`, `BSEF`, `BSJEF` | 163 | Efeitos de batalha e de especiais |
| `TTL`, `MODE`, `LOAD`, `FREE`, `END`, `DEF`, `CUST`, `TONA` | ~130 | Telas: título, modos, carregamento, batalha livre, final, customização, torneio |

**Personagens dos `BCHR`** (identificação visual; era V-Force/2002, não G-Revolution): 00 Tyson, 01 Kai, 02 Max, 03 Ray, 04 Daichi, 05 Ozuma, 06 Dunga, 07 Mariam, 08 Joseph (os quatro são os Saint Shields), 09 *a confirmar* (cabelo branco, pele escura), 10 Zeo, 11–15 *a confirmar* (garota de cabelo rosa e roupa amarela, cinco arquivos), 16 DJ Jazzman (o locutor).

## Próximos passos (em atualizações separadas)

1. ~~**Texturas**~~: feito (ECD + TIM, acima). Falta ligar cada textura ao seu modelo.
2. **Modelos 3D:** decodificar o formato `ECD` dos `MD` (vértices, faces, UV) e exportar glTF das peças, para montar beys 3D na refatoração (D-006).
3. **Personagens** (`BCHR`): modelos/sprites e animações.
4. **Estádios** (`BSC`): geometria da tigela (perfil real de profundidade para a física da `BEY_BEHAVIOR.md`).
5. **Batalha** (`OVLBTL.BIN`, MIPS R3000): física, lançamento, especiais e IA, com Ghidra (processador MIPS:LE:32:default, base do overlay a descobrir).
6. **Som:** converter SEQ+VAB para MIDI/WAV e o XA para WAV.
