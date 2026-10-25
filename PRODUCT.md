# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- Jogo: Electron + Next.js no Windows (`.exe`), ver `docs/DECISIONS.md` (D-004, D-013, D-014).
- Landing page: app Next.js separado em `site/`, export estático, publicado na Vercel (D-016). Ícones `lucide-react`. Imagens em WebP otimizadas por `site/scripts/optimize-images.mjs`.

## Users

Amigos e conhecidos do autor que recebem o link da página. Em geral cresceram com o anime *Beyblade* (Bakuten Shoot, 2001–2003, exibido no Brasil) e querem jogar no PC, em dupla no mesmo computador, com dois controles de PS4 ou pelo teclado. Chegam pelo link (WhatsApp, Discord), muitas vezes pelo celular, e baixam depois no PC.

## Product Purpose

Beyblade Arena é um jogo de luta de Beyblade para PC, feito por fã, em português, para dois jogadores locais. A landing existe para explicar o que é o jogo, mostrar o estágio de desenvolvimento e levar ao download do instalador `.exe`. Sucesso: quem recebe o link entende em segundos o que é, sabe que funciona com controle de PS4 e baixa o jogo.

## Positioning

É a batalha do anime da primeira geração (Tyson, Kai, Ray, Max e as feras bit Dragoon, Dranzer, Driger e Draciel) como jogo de luta local estilo Street Fighter: escolher o personagem, escolher a beyblade, lançar e lutar na arena. Os atributos vêm das peças reais dos piões. É gratuito, em português e feito para jogar lado a lado.

## Operating Context

- Fluxo do jogo (D-005): seleção de personagem → seleção da beyblade → lançamento → batalha. Modos: 1 vs 1 local, 1 vs CPU, Arcade e Treino.
- Controles (D-001, D-015): dois DualShock 4 ou teclado (dois jogadores no mesmo teclado), ou misto.
- Batalha 2D vista de cima agora; 3D depois (D-006).
- O `.exe` usa SQLite local, sem Docker nem conta (D-014). Instalador sem assinatura digital: o Windows SmartScreen avisa na primeira execução.

## Capabilities and Constraints

- O jogo está **em desenvolvimento** (marco M0 do `docs/ROADMAP.md`). Ainda não há release publicada; o botão aponta para `releases/latest/download/BeybladeArena-Setup.exe` e passa a funcionar quando a primeira release sair.
- Somente Windows.
- A página não coleta dados: sem analytics, cookies, formulários ou contas. Página `noindex`.
- Contato público só pelas Issues do GitHub.

## Brand Commitments

- Nome: **Beyblade Arena**. Idioma: português do Brasil.
- Projeto de fã, sem fins lucrativos e não afiliado à Takara Tomy, Hasbro, Nelvana ou d-rights; o aviso aparece na página, no README e nos termos.
- Imagens do anime permitidas na landing por decisão do usuário (D-016), com créditos em `site/CREDITS.md`.

## Evidence on Hand

- Frames do anime (temporadas 1 e 3) baixados da Beyblade Wiki, com créditos.
- Pesquisa de personagens e beyblades em `pesquisa-bakuten/` (10 personagens, perfis e atributos).
- Decisões e roadmap em `docs/`.
- **Não existem:** capturas de tela do jogo, trailer, avaliações, número de jogadores ou downloads. Não inventar.

## Product Principles

1. Honestidade sobre o estágio: nunca prometer o que ainda não existe.
2. Jogar junto, lado a lado: o centro é o multiplayer local.
3. Fiel à primeira geração do anime, que é a memória do público.
4. Sem fricção: baixar, instalar, jogar, sem conta nem configuração.

## Accessibility & Inclusion

Texto em português simples. Página navegável por teclado, contraste AA, respeito a `prefers-reduced-motion`, legível no celular (onde o link costuma ser aberto).
