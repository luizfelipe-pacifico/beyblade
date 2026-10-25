# Brief: fase 2 dos READMEs de beyblades (narrativa + ajuste do anime)

Leia antes: `CLAUDE.md`, `docs/BEYBLADES.md` (principalmente "Modelo de atributos do jogo"), `pesquisa-bakuten/ATRIBUTOS-ORIGEM.md` e `pesquisa-bakuten/INDICE.md`.

Cada README de bey agora começa com um **bloco gerado** entre `<!-- auto:inicio ... -->` e `<!-- auto:fim -->`: ficha, tabela de peças (catálogo em `pesquisa-bakuten/pecas/`), vista explodida e atributos calculados. **Nunca edite esse bloco nem rode `npm run build:research`** (o coordenador roda no fim; rodar em paralelo apaga o trabalho dos outros). Não edite o `dados.json` exceto o campo `ajuste_anime`.

## O que fazer em cada bey do seu escopo

1. **Limpar o que ficou obsoleto** abaixo do bloco gerado:
   - avisos de "Imagens faltantes/pendentes" (as imagens agora são geradas; fotos de terceiros ficam em `referencia/`);
   - a tabela antiga de atributos da seção "Tradução para o jogo" e o `dados.json` antigo citado lá (os valores de jogo agora são calculados);
   - a seção "Peças" antiga se ela só repete a tabela do bloco gerado. Mantenha o que for **análise** (por que a peça funciona assim, como reage em cada sentido de rotação) e, onde fizer sentido, ligue para a ficha da peça no catálogo (`../../../../pecas/<categoria>/<slug>/`).
   - links quebrados: confira que todo link/imagem relativo aponta para um arquivo que existe.
2. **Padronizar as seções** (nesta ordem, depois do bloco gerado): `## Formato e geometria`, `## Comportamento na arena`, `## No anime`, `## Mecânica no jogo`, `## Ajuste do anime`, `## Fontes`. Reaproveite o texto existente; não invente fatos.
3. **`## Mecânica no jogo`**: padrão de movimento para a IA (como se desloca no estádio 2D), como o gimmick funciona no jogo (clutch, Engine Gear, Magnecore, troca de modo, eixo livre), e os **especiais** com efeito mecânico concreto (ex.: "impulso de +40% na velocidade por 2 s e golpe com 2× de empurrão"), custo de energia e recarga. Use a fera bit da bey (`pesquisa-bakuten/feras-bit/<fera>/`, se já existir) para nomear os efeitos visuais.
4. **`ajuste_anime`** no `dados.json` (objeto com os atributos que mudam; ex. `{ "ataque": 2, "stamina": 1 }`): deltas entre **-3 e +3**, soma dos deltas positivos até **+6**. Representa o desempenho no anime em relação ao brinquedo. Regras:
   - respeite os resultados canônicos das batalhas (quem venceu quem, e como: ring out, sleep out, destruição);
   - versões finais e "de chefe" (Dragoon MS UV, Zeus, Black Dranzer, Dranzer MS, Wolborg 4) podem ter ajustes maiores; beys usadas uma vez ou genéricas, quase nenhum;
   - nunca use o ajuste para corrigir dado errado de peça: anote a suspeita em "Ajuste do anime" para o coordenador.
5. **`## Ajuste do anime`**: tabela `Atributo | Delta | Justificativa (episódio/batalha)` e uma frase sobre o resultado esperado.
6. Atualize o `README.md` do personagem: na tabela de beyblades, acrescente uma coluna com a miniatura (`<img src="beyblades/<slug>/sprite.svg" width="56">`) e o lançador (`pesquisa-bakuten/lancadores/_mapa.json` diz qual é). Não mexa nas outras seções nem no `retrato.svg`.

Mantenha o fim de linha original dos arquivos. Valide os JSON editados. Não faça commit.

## Relatório final (até 15 linhas)
Beys revisadas, tabela-resumo dos `ajuste_anime` escolhidos, suspeitas de dado errado em peças, links que não deu para resolver.
