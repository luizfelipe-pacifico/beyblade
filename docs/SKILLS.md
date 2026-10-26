# Skills e plugins do Claude Code

Skills são pacotes de instruções que o Claude Code carrega quando a tarefa pede (`/nome` ou automaticamente). Este documento lista as que já estão disponíveis no ambiente do projeto e as recomendadas para instalar, com o que cada uma faz **para o Beyblade Arena**.

> Instalar skill ou plugin de terceiros é decisão do dono do projeto: elas rodam com acesso ao repositório e algumas executam scripts ou falam com a rede. Leia o `SKILL.md` no repositório de origem antes. Nenhuma das recomendadas abaixo foi instalada.

## Já disponíveis

### Design e interface (usadas no design system, D-018, D-022)

| Skill | Para que serve aqui |
| --- | --- |
| `design-taste-frontend` | Direção de arte e o "inspetor" que mede telas em 1440/768/390 px (`lint.mjs`, `inspect.mjs`); usada para validar `/design-system` |
| `impeccable` | Fluxo de criação/crítica de interface: contexto do produto (`PRODUCT.md`), sorteio de direção, detector de padrões ruins (`impeccable detect`) |
| `emil-design-eng` | Regras de animação e polimento de componentes (curvas, durações, `scale(0.97)` no clique, o que não animar) |
| `animate` | Construir uma animação do zero, decidindo se deve animar, curva, duração e saída |
| `animation-performance` | Manter animações dentro do orçamento do frame (só `transform`/`opacity`, quando usar `will-change`) |
| `animation-vocabulary` | Descobrir o nome técnico de um efeito descrito de forma vaga |
| `improve-animations` | Auditoria das animações do código com plano de correção |
| `find-animation-opportunities` | Procurar onde falta movimento útil (só propõe, não implementa) |
| `apple-design` | Gestos, molas e movimento físico interrompível; útil para menus com sensação de "peso" |
| `break-ui` | Testar telas com dados extremos (nomes enormes, zero itens, emoji) |
| `mobile-native` | Ajustes para web no celular; serve para a landing (`site/`), não para o jogo |
| `ask-sonner` | Biblioteca de toasts Sonner (não usada no projeto hoje) |
| `animate-expo`, `write-swift` | React Native/Expo e Swift: fora do escopo |

### Banco de dados (D-011, D-012, D-014)

Instaladas pelo `prisma init` em `.claude/skills/` (fora do git).

| Skill | Para que serve aqui |
| --- | --- |
| `prisma-cli` | Referência dos comandos do Prisma 7 (`migrate`, `generate`, `studio`) |
| `prisma-client-api` | Consultas com o Prisma Client (`findMany`, `groupBy`, `$transaction`) |
| `prisma-orm-setup`, `prisma-database-setup` | Configurar ou consertar a conexão do Prisma |
| `prisma-driver-adapter-implementation` | Mexer em driver adapters; relevante para o SQLite do `.exe` (D-014) |
| `prisma-upgrade-v7` | Guia de migração do Prisma 6 para 7 |
| `prisma-postgres`, `prisma-postgres-setup`, `prisma-compute`, `prisma-mongodb-upgrade` | Serviços da Prisma na nuvem e MongoDB: fora do escopo |

### Desenvolvimento e revisão

| Skill | Para que serve aqui |
| --- | --- |
| `code-review` | Revisar o diff ou um PR em busca de bugs |
| `security-review` | Revisão de segurança das mudanças pendentes (Electron, API) |
| `simplify` | Limpeza de código já escrito (reuso, simplificação) |
| `run` | Subir e testar o app de verdade |
| `init` | Gerar um `CLAUDE.md` (o projeto já tem um) |
| `claude-api` | Integrar a API da Anthropic (ex.: uma CPU com IA no futuro) |
| `deep-research` | Pesquisa com várias fontes e relatório |
| `dataviz` | Gráficos (ex.: estatísticas do histórico de partidas) |
| `claude-in-chrome`, `chrome-browser`, `built-in-browser`, `computer-use` | Controlar o navegador ou o computador para testar telas |
| `loop`, `schedule` | Repetir tarefas ou agendar agentes |
| `workflow-authoring` | Orquestrar vários agentes em paralelo |
| `skill-creator` | Criar uma skill própria do projeto (ex.: regras de calibração da física) |
| `update-config`, `keybindings-help`, `fewer-permission-prompts`, `plugin-authoring` | Configuração do próprio Claude Code |

### Documentos e serviços

| Skill | Para que serve aqui |
| --- | --- |
| `docs`, `docx`, `pdf`, `pptx`, `xlsx`, `google-workspace` | Documentos, planilhas e apresentações; fora do jogo |
| `artifact-design`, `artifact-diagramming`, `artifact-capabilities` | Páginas e diagramas publicados como Artifact |
| `cloudflare:*` (cf-cli, workers, durable-objects etc.) | Cloudflare; não usado (a landing vai na Vercel, D-016) |
| `morning`, `import-memory` | Pessoais; fora do escopo |

## Recomendadas para instalar

Pesquisa de 2026-10-25. Estrelas e atividade são as que os repositórios mostravam na consulta. Não há skill oficial do Three.js, do React Three Fiber, do Electron nem do Ghidra: nessas áreas tudo é da comunidade.

| # | Skill / plugin | Origem | Para que serve aqui | Instalação (da fonte) | Riscos |
| --- | --- | --- | --- | --- | --- |
| 1 | [awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills): `game-feel`, `physics-tuning`, `game-ai`, `input-systems`, `audio-design`, `performance-optimization` | Comunidade (~4,3k ★, Apache-2.0) | *Juice* (hit-stop, tremor, recuo), afinar a física da tigela, a IA da CPU (D-005) e o input | `npx skills add gamedev-skills/awesome-gamedev-agent-skills --skill game-feel --agent claude-code` | Instale só as skills escolhidas; boa parte é de Godot/Unity |
| 2 | [openai/plugins `game-studio`](https://github.com/openai/plugins/tree/main/plugins/game-studio/skills): `web-game-foundations`, `react-three-fiber-game`, `web-3d-asset-pipeline`, `sprite-pipeline`, `game-ui-frontend`, `game-playtest` | OpenAI (~7,6k ★) | O mais próximo da nossa stack: jogo web com React, HUD em DOM e estado fora do render; planejar a batalha 3D (D-006) | `npx skills add https://github.com/openai/plugins --skill react-three-fiber-game` | Feito para o Codex; licença não vista. Copie só os `SKILL.md` |
| 3 | [cloudai-x/threejs-skills](https://github.com/cloudai-x/threejs-skills) | Comunidade (~3,7k ★, MIT, só markdown) | Referência do Three.js para o 3D; `threejs-performance` para GPU integrada | `npx skills add cloudai-x/threejs-skills` | Baixo; confira se cobre a versão atual do three.js |
| 4 | [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Oficial do Chrome DevTools (~54k ★) | Gravar traces de performance do loop do canvas e achar frames perdidos | `/plugin marketplace add ChromeDevTools/chrome-devtools-mcp` e `/plugin install chrome-devtools-mcp@chrome-devtools-plugins` | Estatísticas de uso ligadas por padrão (`--no-usage-statistics`, `--no-performance-crux`) |
| 5 | Playwright, no [marketplace oficial](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins) | Marketplace da Anthropic; MCP da Microsoft | Testes de ponta a ponta das telas (menu, seleção) e capturas | `/plugin install playwright@claude-plugins-official` | Baixa navegadores; a Anthropic não controla plugins externos |
| 6 | [game-creator](https://github.com/opusgamelabs/game-creator): só `game-audio` | Comunidade (~350 ★, MIT) | Áudio sintetizado com Web Audio (sequenciador para as trilhas originais da D-008) | `npx skills add playableintelligence/game-creator -a claude-code` | Outras skills do pacote fazem deploy e monetização; `@strudel/web` é AGPL |
| 7 | [Blender MCP](https://github.com/ahujasid/blender-mcp) | Comunidade (~32k ★) | Modelar as beys e o estádio no Blender para exportar GLB no 3D | `claude mcp add blender uvx mcp-for-blender` + addon no Blender | **Alto**: executa Python arbitrário, socket sem autenticação; telemetria (`DISABLE_TELEMETRY=true`), `BLENDER_MCP_SAFE_MODE=1` |
| 8 | [GhidraMCP](https://github.com/LaurieWired/GhidraMCP) | Comunidade (~11,6k ★) | Engenharia reversa da ROM do GBA (D-007, `REVERSE_ENGINEERING.md`) | Extensão do Ghidra (release zip) + MCP via `uvx` em 127.0.0.1:8080 | Servidor HTTP local sem autenticação; use só o repositório original (há forks que copiam o README) |
| 9 | [Context7](https://github.com/upstash/context7) | Upstash (~64k ★), também no marketplace oficial | Documentação da versão certa de Next 16, React 19, Electron 45, Prisma 7 e Tailwind 4 | `/plugin install context7@claude-plugins-official` | Consultas vão para servidor remoto; backend fechado |
| 10 | [anthropics/skills](https://github.com/anthropics/skills): `webapp-testing`, `algorithmic-art` | Oficial da Anthropic | Testes com Playwright; arte gerativa para efeitos (partículas, campos) | `/plugin marketplace add anthropics/skills` e `/plugin install example-skills@anthropic-agent-skills` | Baixo; o pacote traz várias skills de uma vez |
| 11 | [vercel-labs/next-skills](https://github.com/vercel-labs/next-skills) | Oficial da Vercel | Pouco: o Next 16 já traz a documentação embutida | `npx skills add vercel/next.js --skill next-cache-components-optimizer` | Baixo |
| 12 | `typescript-lsp`, no marketplace oficial | Oficial da Anthropic | Navegação e diagnósticos do JS/JSX conforme o código cresce | `/plugin install typescript-lsp@claude-plugins-official` | Baixo; precisa do language server local |

**Ordem sugerida:** 1 (`game-feel`, `physics-tuning`, `game-ai`), 4 e 9 agora, porque ajudam no protótipo M1. 2 e 3 quando começar o 3D. 8 junto com a frente da ROM. 7 só com o Blender isolado e sem dados sensíveis na máquina.

### Pesquisadas e descartadas

- **Skills de Electron da comunidade** (electron-pro, electron-development e similares): só aparecem em agregadores, com autoria não verificável. A documentação oficial do Electron (via Context7) é mais confiável.
- **agent-browser da Vercel (skill de Electron)**: faz o mesmo que o Chrome DevTools MCP e o Playwright, com mais código executável.
- **Pacotes pequenos de Three.js** (OpenAEC Three.js-Claude-Skill-Package, kndoshn/threejs-skill-plugin e coleções agregadoras): pouco mantidos; as opções 2 e 3 cobrem o assunto.
- **Skills presas a Godot/Unity** e partes do game-creator (deploy, monetização, Twitter): fora do escopo e com efeitos de rede.
- **Listas "awesome-claude-skills"** gerais: nenhuma entrada útil para jogos, 3D, Electron ou Ghidra.
- **Diretórios agregadores** (skills.sh, claudemarketplaces, mdskills etc.): números inconsistentes; servem só como índice.

## Fontes

[awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) · [openai/plugins game-studio](https://github.com/openai/plugins/tree/main/plugins/game-studio/skills) · [Tessl: react-three-fiber-game](https://tessl.io/registry/skills/github/openai/plugins/react-three-fiber-game) · [cloudai-x/threejs-skills](https://github.com/cloudai-x/threejs-skills) · [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) · [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) · [anthropics/skills](https://github.com/anthropics/skills) · [game-creator](https://github.com/opusgamelabs/game-creator) · [Blender MCP](https://github.com/ahujasid/blender-mcp) · [GhidraMCP](https://github.com/LaurieWired/GhidraMCP) · [Context7](https://github.com/upstash/context7) · [vercel-labs/next-skills](https://github.com/vercel-labs/next-skills) · [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) · [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)
