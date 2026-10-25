# Beyblades reais, vetores e animação

As matrizes `dragoon-s.svg`, `dranzer-s.svg`, `driger-s.svg` e `draciel-s.svg` são traçados das fotografias dos brinquedos físicos da geração clássica, substituindo os antigos sprites simplificados do catálogo. Dragoon usa a edição Anime Version; não são remakes Burst ou X.

Fotografias originais, URLs das páginas de créditos e SHA-256 estão em `../../assets/beyblades/sources.json`. As fontes locais permitem regenerar os arquivos sem rede. As fotos publicadas na Beyblade Wiki e os modelos conservam os direitos de seus titulares; não são imagens originais do projeto nem passam a receber a licença MIT do código.

`npm run bey:assets` gera vetores com VTracer 1.0.0-alpha.4, modo spline, precisão de cor 8, diferença de camada 1, sem descarte de ruído, tolerância de simplificação 0,05 e precisão de caminho 3. A máscara de transparência também é vetorial, em escala de cinza, preservando bordas suaves. Os SVGs não contêm imagens embutidas nem pixels descritos por retângulos. Os detalhes finos continuam limitados pela referência; vetorizar não recupera informação que a foto não contém.

Os WebP `*-480.webp`, `*-960.webp` e `*-1440.webp`, qualidade 94, são renderizações responsivas das matrizes. A landing usa essas versões para evitar transferir e decodificar vários megabytes de curvas por fotografia. Os SVGs completos permanecem nesta pasta.

`npm run motion:assets` rasteriza as matrizes uma vez e gera `battle-loop.webp` e `battle-poster.webp`. Resolução 1152 × 648, 48 quadros, 42ms por quadro, qualidade 90. O loop é uma animação conceitual, não gameplay. O visitante pode pausá-lo; ele também para fora da tela, com a aba oculta e com movimento reduzido.

A origem de cada foto aparece em `/creditos/`. Nomes, marcas e modelos Beyblade pertencem aos respectivos titulares; veja também `/termos/`.
