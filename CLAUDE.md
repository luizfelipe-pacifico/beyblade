# Beyblade Arena

Jogo de Beyblade local para dois jogadores com controles (Gamepad API) e teclado. O servidor Express serve o frontend e uma API JSON que grava configurações e partidas em SQLite.

## Contexto: sempre reler os docs

- **No início de toda tarefa**, releia `docs/DECISIONS.md` e os docs relacionados ao que vai mexer (ex.: input → `docs/CONTROLLERS.md`). Em tarefas longas, releia de novo antes de decisões importantes. Os docs são a memória do projeto entre sessões.
- **Decisões já registradas valem.** Não contradiga uma decisão de `docs/DECISIONS.md` sem perguntar; se ela mudar, registre uma nova entrada que substitua a anterior.
- Decisões atuais que mais afetam o código: o jogo é feito para **dois controles DualShock 4 (PS4)**, com teclado como fallback (D-001); testes rodam automaticamente antes de todo push (D-003).

## Documentação contínua

- **Documente durante o trabalho, não no fim.** Toda decisão, requisito ou preferência que o usuário disser (ex.: "vamos jogar com controle de PS4") vira uma entrada em `docs/DECISIONS.md` na hora.
- Descobertas técnicas (limitações de navegador, bugs e causas, valores calibrados) vão no doc do assunto. Se o assunto não tiver doc, **crie um novo `.md` em `docs/`** e adicione-o à lista da seção Documentação.
- Docs desatualizados devem ser corrigidos no mesmo commit da mudança de código.

## Stack

- Node.js **>= 22.13**, ES Modules (`"type": "module"`)
- Express **5**
- SQLite nativo via `node:sqlite` (`DatabaseSync`), sem ORM
- Frontend estático em `public/`, servido por `express.static`

## Comandos

- `npm run dev`: servidor com `node --watch` (recarrega ao salvar)
- `npm start`: servidor normal
- `npm test`: roda todos os testes (`node --test`, arquivos `tests/*.test.js`)
- Acesse em `http://localhost:5000`

## Estrutura

- `server.js`: rotas da API, handler de erro e inicialização na porta 5000
- `src/db.js`: conexão SQLite, schema e queries
- `src/validate.js`: validação de tudo que chega pela API (`parse*` retorna `{ value }` ou `{ error }`)
- `public/`: frontend do jogo
- `tests/`: testes (`*.test.js`), incluindo os de regressão
- `.githooks/pre-push`: roda `npm test` antes de todo push (ativado por `core.hooksPath`)
- `data/`: banco `beyblade.db` (gerado em runtime, **nunca versionar**)
- `pesquisa-bakuten/`: material de referência (imagens de terceiros); não usar no jogo sem verificar a licença
- `docs/`: documentação; veja a seção Documentação

## Porta

- O projeto deve sempre rodar na porta **5000** (dev server, preview e servidor de produção local).
- Fixe a porta explicitamente na configuração (ex.: `server.port: 5000` + `strictPort: true` no Vite, `PORT=5000` no Node/Express, `--port 5000` em CLIs). Não deixe cair para outra porta automaticamente se a 5000 estiver ocupada.

## Commits e push

- Durante o trabalho, faça commit e push para o GitHub a cada etapa concluída e funcionando (testes verdes).
- **Antes de cada commit**, revise `git diff --staged` e garanta que não sobe nada que não deva: `.env`, segredos e tokens, `data/` e arquivos `*.db*`, `node_modules/`, logs, arquivos pessoais. Adicione arquivos específicos em vez de `git add .` às cegas.
- Mensagens **sempre em inglês**, no padrão Conventional Commits: `tipo(escopo): descrição`.
  - Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
  - Escopos: `api`, `db`, `game`, `input`, `ui`, `docs`, `config`.
  - Descrição no imperativo, minúscula, sem ponto final. Ex.: `fix(input): apply deadzone before reading stick direction`.
- Um commit por mudança lógica.

## Regras de código

- ES Modules e prefixo `node:` nos módulos nativos (`node:fs`, `node:path`).
- Prefira recursos nativos do Node (`node:sqlite`, `node:test`, `--watch`, `--env-file`) a dependências novas; justifique qualquer dependência adicionada.
- Valide toda entrada da API em `src/validate.js` (allowlist) antes de usar ou gravar. Erros no formato `{ "error": "mensagem" }`, com o status HTTP correto.
- SQL **somente** com prepared statements e parâmetros; nunca concatene valores. Várias escritas relacionadas vão em uma transação.
- Mudanças de schema via migração versionada (`PRAGMA user_version`); nunca edite uma migração já aplicada.
- Texto vindo do usuário (nomes de jogadores etc.) entra no DOM via `textContent`, nunca `innerHTML`.
- Game loop com `requestAnimationFrame` + timestep fixo; lógica de simulação separada da renderização.
- Gamepad: controle de referência é o DualShock 4 (mapeamento em `docs/CONTROLLERS.md`); chame `navigator.getGamepads()` a cada tick (não guarde o objeto), trate slots `null`, aplique deadzone e mantenha o teclado como fallback.
- Textos da interface e mensagens de erro da API em português; código, nomes e commits em inglês.
- Siga o estilo do código existente: comentários curtos, só para explicar o porquê.

## Testes e regressão

- **Algo quebrou? Siga esta ordem:**
  1. Escreva um teste em `tests/` que **reproduz o erro** e confirme que ele **falha**.
  2. Corrija o código.
  3. Confirme que o teste agora **passa** e que `npm test` inteiro continua verde.
  4. Mantenha o teste para sempre (nome descreve o bug, ex.: `rejects deadzone above 0.9`) e anote a causa no doc do assunto, se não for óbvia.
- Toda funcionalidade nova com lógica (validação, pontuação, física, input) vem com testes.
- **Antes de todo push, os testes rodam automaticamente** pelo hook `.githooks/pre-push`. Se falhar, corrija antes de subir. **Nunca use `git push --no-verify`.**
- Se o hook não estiver ativo (`git config core.hooksPath` vazio), rode `npm install` ou `git config core.hooksPath .githooks`.
- Testes com `node:test` + `node:assert/strict`; banco em memória (`:memory:`), nunca `data/`; lógica do jogo testável sem DOM.

## Verificação

- Antes de dar uma tarefa por concluída: `npm test` verde e o app testado de verdade em `http://localhost:5000` (com DualShock 4 e/ou teclado).

## Documentação

Atualize no mesmo commit da mudança (e crie novos arquivos quando surgir um assunto sem doc):

- `docs/DECISIONS.md`: registro de decisões (ler sempre primeiro)
- `docs/CONTROLLERS.md`: DualShock 4, mapeamentos, Gamepad API
- `docs/ARCHITECTURE.md`: estrutura, módulos, fluxo de dados
- `docs/DATABASE.md`: schema, migrações, PRAGMAs
- `docs/SECURITY.md`: validação, exposição de rede, dependências
- `docs/ROADMAP.md`: funcionalidades concluídas ou planejadas
- `docs/BEST_PRACTICES.md`: guia completo de boas práticas (leia antes de tarefas maiores)
