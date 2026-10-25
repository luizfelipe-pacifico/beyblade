# Brief comum da pesquisa (para quem for documentar personagens/beyblades)

Objetivo: base de conhecimento para um jogo offline de Beyblade baseado em **Bakuten Shoot Beyblade** (anime 2001–2003: temporada 1, V-Force, G-Revolution). Tudo em **português (PT-BR)**; nomes próprios de peças/ataques ficam no original (EN/JP).

## Fonte principal (API da Beyblade Wiki – funciona com curl)
- Wikitext de uma página (infobox com peças, código, tipo, galeria):
  `curl -s -A "Mozilla/5.0" "https://beyblade.fandom.com/api.php?action=parse&page=Dranzer_V2&prop=wikitext&format=json&formatversion=2"`
- Páginas de peças existem no formato `Attack_Ring_-_Cross_Dranzer`, `Blade_Base_-_Customize_Clutch_Base`, etc. (use para descrever peças).
- URL de um arquivo de imagem:
  `curl -s -A "Mozilla/5.0" "https://beyblade.fandom.com/api.php?action=query&titles=File:DranzerV2.jpg&prop=imageinfo&iiprop=url&format=json"`
- Baixar: `curl -sL -A "Mozilla/5.0" -o destino.jpg "<url>"` — depois confira com `file destino.jpg` que é imagem de verdade (não HTML) e tem tamanho > 2 KB.
- Complementar com WebSearch/WebFetch (ex.: worldbeyblade.org, wiki em outras línguas) para comportamento em arena, dados de peso e anime.
- Não há Python na máquina; use bash + curl (+ sed/grep). Não instale nada.

## Estrutura de saída (dentro de `pesquisa-bakuten/personagens/`)
```
<slug-personagem>/
  README.md            # segue _template/TEMPLATE-PERSONAGEM.md
  foto.jpg|png         # imagem do personagem (infobox do anime)
  beyblades/
    <slug-beyblade>/
      README.md        # segue _template/TEMPLATE-BEYBLADE.md
      imagem.jpg|png   # foto da beyblade montada (toy/infobox)
      anime.jpg        # (opcional) frame da beyblade/fera bit no anime
      pecas/           # (opcional) fotos individuais de peças: attack-ring.jpg, weight-disk.jpg, blade-base.jpg...
      dados.json       # segue _template/dados.schema.json
```
Slugs em minúsculas com hífen (ex.: `dragoon-v2`, `black-dranzer`). Ajuste a extensão da imagem nos links do README ao formato real baixado.

## Escopo de beyblades
Todas as beyblades que o personagem **usa em batalha no anime** Bakuten Shoot (3 temporadas + filme "Fierce Battle", se relevante). Inclua beys emprestadas/temporárias se ele batalhou com elas. Não inclua versões só de brinquedo (recolors, edições limitadas) — apenas cite-as na seção de recolors se útil.

## Escala de atributos (1–10), âncoras para calibrar
- Ataque 10 ≈ beys de smash/upper de elite (ex.: Dragoon V2, Driger V). 3 ≈ beys de stamina pura.
- Defesa 10 ≈ Draciel V2 / Draciel G (pesado, liso, ponta de bola/defesa). 3 ≈ attackers leves com ponta flat.
- Stamina 10 ≈ beys de longa rotação (ex.: Wolborg 2, Zeus). 3 ≈ grip/flat attackers.
- Velocidade = deslocamento na arena (flat/grip alta; sharp/bola baixa).
- Peso = massa relativa (metal weight, magnacore e engine gear pesam mais).
- Equilíbrio = estabilidade / resistência a wobble.
- Resistência a knockout = capacidade de não ser expulso do estádio.
Atributos devem refletir o **brinquedo real + o desempenho mostrado no anime** — explique o raciocínio na tabela. Não invente fatos: se um dado não for encontrado, escreva "não confirmado" e marque a estimativa como estimativa.

## Qualidade
- Estude cada beyblade **individualmente**: peças reais da infobox, formato do attack ring, tipo de ponta, gimmick do sistema, comportamento na arena, matchups, especiais do anime, episódios.
- Liste as URLs consultadas em "Fontes".
- Imagens: apenas referência interna de estudo (fan wiki / Takara-Hasbro); não serão distribuídas no jogo.
