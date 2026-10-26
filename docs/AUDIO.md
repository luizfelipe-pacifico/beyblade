# Áudio: sons sintetizados

Todos os sons próprios são gerados por `scripts/synth.js` a partir de receitas JSON ([D-008](DECISIONS.md#d-008-arte-e-som-próprios-gerados-a-partir-dos-dados)). Saída: WAV PCM 16-bit mono, 44,1 kHz, normalizado, com fade de 10 ms nas bordas. Mesma receita gera sempre o mesmo arquivo (ruído com semente).

```
node scripts/synth.js pesquisa-bakuten/feras-bit/dragoon/sons.json pesquisa-bakuten/feras-bit/dragoon/sons
```

## Formato da receita

```jsonc
{
  "sounds": {
    "rugido": {
      "duration": 2.2,                       // segundos (máx. 30)
      "gain": 0.9,                           // pico final após normalizar
      "seed": 7,                             // opcional
      "reverb": { "mix": 0.3, "decay": 0.75, "size": 1 },
      "layers": [
        {
          "wave": "saw",                     // sine | triangle | saw | square | noise | pink
          "start": 0, "length": 2.2,         // opcional, em segundos
          "freq": [[0, 90], [0.3, 140], [2.1, 60]],   // Hz; número ou envelope [[t, valor], ...]
          "gain": [[0, 0], [0.15, 1], [2.1, 0]],      // obrigatório
          "unison": 3, "detune": 25,         // vozes e espalhamento em cents
          "vibrato": { "rate": 6, "depth": 0.3 },     // Hz e semitons
          "growl": { "rate": 45, "depth": 0.7 },      // aspereza de garganta (modulação aleatória)
          "drive": 2.5,                      // saturação (tanh)
          "filter": { "type": "lowpass", "freq": [[0, 800], [1, 2000]], "q": 1 },
          "formants": [ { "freq": 500, "q": 4, "gain": 1 }, { "freq": 1100, "q": 6, "gain": 0.6 } ]
        }
      ]
    }
  }
}
```

Envelopes são pontos `[tempo_s, valor]` interpolados linearmente, com tempo relativo ao início da camada.

## Dicas de timbre

| Som | Receita base |
|---|---|
| Rugido (dragão, tigre, pantera) | `saw` grave (60–160 Hz) com `unison` 3, `growl` 35–60 Hz, `drive` 2–3, formantes 400–800 / 1000–1300 / 2200–2600 Hz + camada `pink` em `bandpass` |
| Grito de ave (fênix, falcão, grifo) | `saw`/`square` agudo (900–2500 Hz) com queda rápida de pitch, `vibrato` rápido, formantes altos, `reverb` longo |
| Uivo (lobo) | `saw` 300–700 Hz subindo e descendo devagar, `vibrato` 5 Hz, filtro `lowpass` abrindo |
| Tartaruga / terra | `sine`/`triangle` muito grave (40–80 Hz) + `noise` em `lowpass` (estrondo), ataque lento |
| Vento | `pink` em `bandpass` com frequência varrendo 400–3000 Hz |
| Fogo | `noise` em `bandpass` 1–4 kHz com `growl` rápido (crepitar) + `pink` grave |
| Raio / trovão | `noise` com ataque instantâneo e `highpass`, seguido de `pink` grave longo com `reverb` |
| Gelo / cristal | `sine` e `triangle` agudos (2–5 kHz) em notas curtas, `reverb` alto |

## Sons por fera bit (`feras-bit/<slug>/sons.json`)

| Nome | Duração | Uso no jogo |
|---|---|---|
| `invocacao` | 2–3 s | Fera surge em cima da bey (toca com `invocacao.svg`) |
| `rugido` | 1–2 s | Grito característico (seleção de personagem, provocação) |
| `ataque` | 1–1,5 s | Golpe especial (toca com `ataque.svg`) |

## Sons de batalha (`pesquisa-bakuten/sons-batalha/`)

`lancamento`, `giro` (loop), `choque-leve`, `choque-forte`, `ring-out`, `parada`, `contagem` (3-2-1-Let it rip!).

## Músicas e vozes: de onde vêm

As gravações do anime (temas de abertura e encerramento, trilha de fundo e dublagem) têm direitos autorais e **não são baixadas nem versionadas**. Por decisão do usuário, o áudio do jogo tem três fontes:

| Fonte | O que entra | Onde fica | Git |
| --- | --- | --- | --- |
| ROM do GBA (D-007) | Músicas e efeitos do *Beyblade G-Revolution* do próprio usuário, só para uso pessoal | `assets-rom/audio/` | Nunca |
| Trilhas originais (D-008) | Músicas novas no clima da abertura, feitas por script | `pesquisa-bakuten/audio/` (receitas) | Sim |
| Músicas do usuário (D-030) | Faixas que o próprio usuário baixou, só para uso pessoal | `public/audio/musica/` | Nunca |
| TTS provisório | As falas clássicas lidas por voz sintética até haver gravação própria | `public/audio/tts/` (gerado) | Nunca |

### Catálogo

- [`pesquisa-bakuten/audio/trilhas.json`](../pesquisa-bakuten/audio/trilhas.json): temas das três temporadas como **metadado** (título, artista, episódios, compositor da trilha de fundo), com fonte na Wikipédia japonesa, e os espaços de música do jogo (`menu`, `selecao`, `lancamento`, `batalha`, `vitoria`, `resultado`), cada um com a fonte planejada e o status.
- [`pesquisa-bakuten/audio/falas.json`](../pesquisa-bakuten/audio/falas.json): por personagem, as frases do anime já registradas nos READMEs (dublagem em inglês, com tradução nossa) e o grito de especial da bey do jogo. `origem: "jogo"` marca falas escritas para o jogo, que nunca são atribuídas ao anime. `tests/audio-catalog.test.js` garante isso.

### Músicas de fundo (D-030)

`src/audio/music.js` toca uma faixa por vez, em laço, com troca suave de volume. Os arquivos ficam em `public/audio/musica/`, fora do git; se um faltar, a tela só fica em silêncio. O nome do arquivo diz onde a faixa toca:

| Arquivo | Origem (nome do download) | Onde toca |
| --- | --- | --- |
| `abertura.mp3` | Abertura do G-Revolution (só a música, D-038) | Aba Início |
| `menu-inicio.mp3` | BEYBLADE (DUB) unreleased Background music #2 | Outras telas de menu (modos, arcade) |
| `menu-selecao.mp3` | BEYBLADE (DUB) unreleased Background music #3 | Aba Personagens (seleção) |
| `batalha.mp3` | BEYBLADE unreleased music: BATTLE THEME #1 Original | Batalha, rodadas 1 e 2 |
| `batalha-decisiva.mp3` | BEYBLADE unreleased music: BATTLE THEME #1 [WIP] | Rodada decisiva (1 a 1 no placar) |

O vídeo da abertura (`public/video/abertura.mp4`, fora do git) toca uma vez por sessão antes da tela inicial, com o som dele; a música volta quando ele acaba ou é pulado. Cada tela tem uma **playlist** (D-055, `src/audio/playlist.js`): inicio (abertura e fundo #2), menus, seleção (fundo #3, fundo #2 e abertura), batalha (tema, abertura e tema WIP) e decisiva; quando uma faixa acaba, toca outra da mesma lista, nunca a mesma em seguida. A tela escolhe a playlist (`game-shell.jsx`), e a batalha troca para a decisiva no `roundStart` com 1 a 1. Para trocar uma música, substitua o arquivo com o mesmo nome.

### Vozes provisórias (TTS)

`npm run audio:tts` gera um WAV por fala em `public/audio/tts/<personagem>/<id>.wav` com a voz **Microsoft Maria Desktop** (pt-BR, do Windows, offline), tom 25% mais grave para os personagens. É provisório: a única voz pt-BR instalada é feminina, e os nomes de golpes em inglês saem com sotaque. Os textos vão para o PowerShell por arquivo (`scripts/tts.ps1`), nunca pela linha de comando.

### Extração da ROM (a fazer)

1. Identificar o motor de som do jogo (muitos jogos de GBA usam o MP2K/"Sappy" da Nintendo; **não confirmado** para este) com o mGBA e uma ferramenta como o agbplay.
2. Exportar cada música e efeito para `assets-rom/audio/` e anotar o endereço na ROM em [`REVERSE_ENGINEERING.md`](REVERSE_ENGINEERING.md).
3. Preencher o campo `rom` dos espaços em `trilhas.json`. Uma análise do jogo indica só uma música de combate e poucas no modo RPG, então várias telas vão precisar de trilha original.

### Trilhas originais (a fazer)

O `scripts/synth.js` gera efeitos curtos (máximo de 30 s). As músicas em loop pedem uma extensão: sequência de notas, padrões de bateria e loop sem emenda, no ritmo e na energia de uma abertura de anime de 2001, sem copiar melodia de nenhum tema.
