# Arte: padrão visual dos assets próprios

Assets originais em SVG ([D-008](DECISIONS.md#d-008-arte-e-som-próprios-gerados-a-partir-dos-dados)). Servem para o jogo 2D (D-006) e como referência de modelagem para o 3D.

## Regras gerais (todos os SVGs)

- Arquivo autocontido: **sem** imagens externas, fontes externas ou `<script>`. Animação só com CSS `@keyframes` dentro de `<style>` (ou SMIL), para funcionar em `<img>`, no GitHub e no canvas.
- Fundo **transparente**.
- Traço de contorno: `#0d1226`, `stroke-linejoin="round"`, `stroke-linecap="round"`.
- Luz vindo de **cima à esquerda**. Cel shading: cor base + 1 tom de sombra (≈ 25% mais escuro, saturação um pouco maior) + 1 brilho (highlight) pequeno.
- Grupos nomeados com `id` em inglês (`body`, `head`, `wing-left`, `tail`, `aura`), para o jogo poder animar partes depois.
- Inclua `@media (prefers-reduced-motion: reduce)` reduzindo a animação a um leve fade/pulso.
- Tamanho alvo ≤ 80 KB por arquivo. Use `<defs>` + `<use>` para repetir formas.
- Cores de cada fera e personagem vêm do `dados.json` correspondente; mantenha as mesmas em todos os arquivos.

## Feras bit (`feras-bit/<slug>/`)

| Arquivo | Conteúdo | Animação |
|---|---|---|
| `emblema.svg` | Símbolo simples da fera (silhueta/cabeça), `viewBox="0 0 64 64"`, até 3 cores, legível em 16 px. Vai no Bit Chip. | Nenhuma |
| `idle.svg` | Fera inteira, pose de presença | Loop 2,4–4 s: respiração, flutuação, asas/cauda, aura pulsando |
| `invocacao.svg` | Fera surgindo de baixo (da bey) | 1,2–1,8 s, uma vez (`animation-fill-mode: forwards`): luz/coluna de energia, fera cresce e abre as asas/garras, termina na pose do idle |
| `ataque.svg` | Golpe especial característico | 0,8–1,2 s, pode repetir: avanço, rastro/efeito do elemento (vento, fogo, raio, água, gelo...) |

- `viewBox="0 0 512 512"`. **Âncora** em `(256, 448)`: é onde fica o centro da beyblade quando a fera é desenhada em cima dela; a fera "sai" desse ponto e ocupa a área acima.
- Estilo: inspirado em anime (traços limpos, poses dinâmicas), **arte original**: não copiar/decalcar imagens oficiais.
- A aura (`#aura`) usa a cor `brilho` com desfoque (`feGaussianBlur`) e fica atrás do corpo.
- Feras escuras (Zeus, Black Dranzer, Draciel, Galeon) usam `overlay.blend: "normal"`; as claras podem usar `"screen"` para brilhar sobre a arena.

## Retratos (`personagens/<p>/retrato.svg`)

- `viewBox="0 0 512 640"`, busto em 3/4, olhando levemente para o centro.
- Atrás: disco com a cor da fera bit do personagem (`cores.primaria` da fera; se ela for muito escura, como Galeon e Zeus, use `cores.brilho` ou um tom claro dela), com borda `#0d1226`.
- Elementos marcantes obrigatórios (boné, faixa, pinturas no rosto, cachecol etc.) descritos no README do personagem.
- Mesmo traço e cel shading das feras, para o conjunto parecer de um jogo só.

## Peças, beys e lançadores (gerados)

Gerados por `scripts/build-research.js` (`npm run build:research`), nunca à mão:

- `topo.svg` (vista de cima) e `lateral.svg` (perfil) de cada peça, **na escala real em mm**, com régua de 10 mm e cotas de diâmetro e altura.
- `montada.svg` (bey completa em 3/4 + topo) e `explodida.svg` (peças empilhadas e separadas, com nome, material e peso de cada uma).
- Mesma câmera, luz e fundo em todos, para comparar peças lado a lado.
