# Ilustrações de beyblades

- `dragoon-s.svg`: cópia da arte própria de `pesquisa-bakuten/personagens/tyson-granger/beyblades/dragoon-s/sprite.svg`.
- `dranzer-s.svg`: cópia da arte própria de `pesquisa-bakuten/personagens/kai-hiwatari/beyblades/dranzer-s/sprite.svg`.
- `driger-s.svg`: cópia da arte própria de `pesquisa-bakuten/personagens/ray-kon/beyblades/driger-s/sprite.svg`.
- `draciel-s.svg`: cópia da arte própria de `pesquisa-bakuten/personagens/max-tate/beyblades/draciel-s/sprite.svg`.
- Os vetores são gerados pelo pipeline do catálogo a partir das peças, medidas e cores. Não são sprites extraídos da ROM nem fotos ampliadas da wiki.
- `battle-loop.webp` e `battle-poster.webp`: gerados por `node scripts/build-bey-motion.mjs`, executado dentro de `site/`. Animação ilustrativa de 768 × 432, 48 quadros, 42ms por quadro, qualidade 90, loop contínuo. Não representa gameplay já implementado.

O SVG da hero permanece vetorial para não perder resolução. A animação WebP usa as mesmas fontes e os tokens do site, substituindo GIF de paleta limitada. A página carrega o poster estático com movimento reduzido, quando a animação está fora da tela, na aba oculta ou quando o visitante pausa.

Código e ilustrações originais seguem a licença MIT do repositório. Nomes, marcas e personagens Beyblade pertencem aos respectivos titulares; veja `/creditos/` e `/termos/`.
