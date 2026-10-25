# Boas práticas de desenvolvimento

Guia de referência do projeto **Beyblade Arena** (Node.js 22 + Express 5 + `node:sqlite`, jogo local para dois jogadores com controles). As regras curtas e obrigatórias ficam no [`CLAUDE.md`](../CLAUDE.md); aqui está o porquê e o detalhe.

---

## 1. Princípios gerais

- **Simples primeiro (KISS / YAGNI).** Resolva o problema de hoje. Não crie abstrações, camadas ou configurações "para o futuro" sem uma necessidade real.
- **Legibilidade acima de esperteza.** Código é lido muito mais vezes do que escrito. Prefira nomes claros a comentários explicando nomes ruins.
- **Funções pequenas e com uma responsabilidade.** Se o nome precisa de "e" (`validarESalvar`), provavelmente são duas funções.
- **DRY com moderação.** Duplicar duas vezes é aceitável; na terceira, extraia. Abstração errada custa mais que duplicação.
- **Siga o estilo do código ao redor.** Mesma densidade de comentários, mesmos nomes, mesmos padrões. Consistência vale mais que preferência pessoal.
- **Comentários explicam o porquê**, não o quê. Ex.: `// Sem fallback de porta: ver CLAUDE.md` é útil; `// incrementa i` não é.
- **Falhe cedo e de forma explícita.** Valide entradas na borda (API, leitura de arquivo, input do controle) e devolva erros claros.
- **Mudanças pequenas e incrementais.** Cada passo deve deixar o projeto funcionando.

## 2. Fluxo de trabalho

1. **Releia os docs.** Comece sempre por `docs/DECISIONS.md` e pelos docs do assunto da tarefa (ex.: input → `docs/CONTROLLERS.md`). Em tarefas longas, releia antes de cada decisão importante.
2. **Entenda antes de mudar.** Leia o código envolvido.
3. **Planeje** tarefas maiores (o que muda, em quais arquivos, como verificar).
4. **Implemente em passos pequenos**, cada um verificável, **documentando durante o caminho** (seção 12): decisão tomada → `DECISIONS.md` na hora.
5. **Verifique de verdade:** rode `npm run dev`, abra `http://localhost:5000`, teste com DualShock 4 e/ou teclado. "Compila" não é "funciona".
6. **Rode `npm test`.** Se algo quebrou, siga o fluxo de regressão (seção 10).
7. **Commit + push** seguindo a seção 3. O hook `pre-push` roda os testes de novo e bloqueia o push se falharem.

## 3. Git e commits

### Formato: Conventional Commits

```
<tipo>(<escopo opcional>): <descrição curta no imperativo, em inglês>

[corpo opcional: o porquê da mudança]

[rodapé opcional: BREAKING CHANGE: ..., Refs #12]
```

| Tipo       | Quando usar                                       |
| ---------- | ------------------------------------------------- |
| `feat`     | Nova funcionalidade                               |
| `fix`      | Correção de bug                                   |
| `docs`     | Só documentação                                   |
| `style`    | Formatação, sem mudar comportamento               |
| `refactor` | Reestruturação sem mudar comportamento            |
| `perf`     | Melhoria de desempenho                            |
| `test`     | Adiciona ou corrige testes                        |
| `build`    | Dependências, `package.json`, build               |
| `ci`       | Pipelines de CI                                   |
| `chore`    | Manutenção que não se encaixa acima               |
| `revert`   | Reverte um commit anterior                        |

**Escopos sugeridos:** `api`, `db`, `game`, `input`, `ui`, `docs`, `config`.

**Exemplos:**

```
feat(game): add ring-out finish detection
fix(input): apply deadzone before reading stick direction
docs(readme): add setup instructions
refactor(db): extract match queries into prepared statements
```

**Regras:**

- Descrição em inglês, minúscula, no imperativo (`add`, não `added`/`adds`), sem ponto final, até ~72 caracteres.
- Um commit = uma mudança lógica. Não misture refatoração com feature.
- Mudança incompatível: `feat!:` ou rodapé `BREAKING CHANGE:`.

### Antes de cada commit/push (checklist)

- [ ] `git status` e `git diff --staged` revisados linha a linha.
- [ ] Nenhum segredo: `.env`, tokens, senhas, chaves de API, credenciais.
- [ ] Nenhum dado local: `data/` (banco SQLite), `*.db`, `*.db-wal`, `*.db-shm`, logs.
- [ ] Nenhum `node_modules/`, build gerado ou arquivo pessoal do editor/SO.
- [ ] Nenhum arquivo grande ou de terceiros sem licença clara (imagens, áudio, fontes).
- [ ] `npm test` verde (o hook `pre-push` confere de novo automaticamente).
- [ ] O app sobe na porta 5000 e a mudança foi testada.
- [ ] Use `git add <arquivos>` específicos em vez de `git add .` às cegas.

## 4. JavaScript / Node.js

- **ES Modules** (`"type": "module"`): `import`/`export`, nunca `require`.
- **Prefixo `node:`** para módulos nativos: `node:fs`, `node:path`, `node:sqlite`, `node:test`.
- **Prefira o que o Node já oferece** antes de instalar dependências: `node:sqlite`, `node:test`, `node --watch`, `node --env-file=.env`, `fetch`, `structuredClone`, `import.meta.dirname`.
- **Cada dependência nova é um custo** (segurança, atualização, tamanho). Justifique antes de adicionar e fixe a versão no `package.json`.
- **`async/await`** em vez de callbacks ou cadeias de `.then()`. Nunca deixe Promise sem tratamento.
- **`const` por padrão**, `let` só quando reatribuir; nunca `var`.
- **`===` sempre.** Converta tipos explicitamente (`Number(x)`, `String(x)`).
- **Erros:** lance `Error` (ou subclasses), nunca strings. Diferencie:
  - *erros operacionais* (entrada inválida, porta ocupada): trate e responda com mensagem clara;
  - *erros de programação* (bug): registre e deixe estourar; não esconda com `try/catch` vazio.
- **Sem números mágicos:** extraia constantes nomeadas (`const MAX_ROUNDS = 7`).
- **Imutabilidade quando barato:** prefira criar novos objetos a mutar argumentos recebidos.

## 5. API (Express 5)

- **Valide tudo que chega** (`req.body`, `req.params`, `req.query`) antes de usar ou gravar. O padrão do projeto é `src/validate.js`: cada `parse*` retorna `{ value }` limpo ou `{ error }`.
- **Allowlist, não blocklist:** aceite só campos e valores conhecidos; descarte o resto.
- **Status HTTP corretos:** `200` leitura, `201` criação, `204` sem corpo, `400` entrada inválida, `404` não encontrado, `500` erro interno.
- **Formato de erro consistente:** `{ "error": "mensagem" }`.
- **Handler de erro centralizado** (já existe em `server.js`). Nunca exponha stack trace ao cliente.
- **Limite o tamanho do payload** (`express.json({ limit: '64kb' })`) e limite listagens (`?limit=` com teto).
- Express 5 já repassa erros de handlers `async` ao handler de erro; não é preciso `try/catch` só para chamar `next(err)`.
- **Rede:** o jogo é local. Se não precisar ser acessado por outros dispositivos da rede, faça o servidor escutar só em `127.0.0.1`.
- **Cabeçalhos de segurança:** se o app for exposto além da máquina local, use `helmet` e desative `x-powered-by`.

## 6. Banco de dados (SQLite via `node:sqlite`)

- **Sempre use prepared statements com parâmetros** (`db.prepare('... WHERE id = ?').get(id)`). Nunca concatene valores em SQL.
- **Prepare uma vez, reutilize:** crie os statements no carregamento do módulo, não a cada requisição.
- **Transações** para operações com várias escritas (`BEGIN` / `COMMIT` / `ROLLBACK`). Elas garantem atomicidade e são muito mais rápidas.
- **PRAGMAs recomendados na abertura:**
  - `journal_mode = WAL` (já em uso): leituras não bloqueiam escritas;
  - `foreign_keys = ON`: o SQLite **não** aplica FKs por padrão;
  - `busy_timeout = 5000`: evita erro imediato de "database is locked".
- **Migrações versionadas com `PRAGMA user_version`:**
  - cada mudança de schema é um passo numerado, aplicado em ordem e dentro de uma transação;
  - atualize `user_version` na mesma transação da migração;
  - **nunca edite uma migração já aplicada**: crie uma nova;
  - `CREATE TABLE IF NOT EXISTS` serve para o schema inicial, mas não altera tabelas existentes.
- **Restrições no schema** (`NOT NULL`, `CHECK`, `UNIQUE`) como segunda linha de defesa além da validação da API.
- **Datas em UTC** (ISO 8601 / `datetime('now')`). Converta para o fuso local só na interface.
- **JSON em colunas TEXT** é aceitável para dados aninhados (configs, rounds); valide antes de gravar e trate falha no `JSON.parse` ao ler.
- **Crie índices** para colunas usadas em `WHERE`/`ORDER BY` frequentes (ex.: `played_at`).
- **`data/` nunca vai para o Git.** Documente o schema em `docs/DATABASE.md`.

## 7. Jogo: loop, física e input

### Game loop

- **`requestAnimationFrame`** para o loop, nunca `setInterval`/`setTimeout`.
- **Timestep fixo para a simulação** (ex.: 60 updates/s) com acumulador; renderize uma vez por frame. Assim a física é igual em monitores de 60 Hz e de 144 Hz, e o jogo fica determinístico (replays, testes).

  ```js
  const STEP = 1000 / 60;
  let acc = 0, last = performance.now();

  function frame(now) {
    acc += Math.min(now - last, 250); // limita o dt após aba em segundo plano
    last = now;
    while (acc >= STEP) {
      const input = readInput();      // amostra o input uma vez por tick
      update(input, STEP);
      acc -= STEP;
    }
    render(acc / STEP);               // alpha para interpolação
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  ```

- **Limite o delta** após a aba voltar do segundo plano, para evitar "teleporte" e explosão de física.
- **Pause automático** em `visibilitychange` (aba oculta) e quando um controle desconecta no meio da partida.
- **Separe simulação de renderização:** `update(state, input, dt)` não toca no DOM nem no canvas; `render(state)` não altera o estado. Isso torna a lógica testável em Node.
- **Evite alocações dentro do loop** (objetos/arrays novos a cada frame) para não causar pausas do garbage collector.

### Gamepad API

> Controle de referência: **DualShock 4 (PS4)**. Mapeamento de botões e cuidados específicos em [`CONTROLLERS.md`](CONTROLLERS.md).

- **Não existem eventos de botão/eixo**, só `gamepadconnected`/`gamepaddisconnected`. É preciso fazer polling.
- **Chame `navigator.getGamepads()` a cada tick.** Os objetos retornados são snapshots; guardar a referência congela os valores (no Chrome).
- **Trate slots `null`** (controles desconectados) e índices que mudam ao reconectar.
- **Aplique deadzone** nos analógicos (o projeto valida `deadzone` entre 0 e 0,9). Prefira deadzone radial (pela magnitude do vetor) à deadzone por eixo.
- **Detecte borda de botão** (pressionou agora / soltou agora) comparando com o estado do tick anterior. Ações como "launch" e "pause" disparam uma vez, não a cada frame.
- **Teclado como fallback** sempre disponível (bindings do tipo `key`), usando `event.code` (posição física) e não `event.key`.
- **Rumble** (`vibrationActuator`) é opcional e nem todo navegador/controle suporta; verifique antes de usar e respeite a configuração `rumble`.
- **Os mapeamentos variam por controle:** por isso existe a tela de configuração de bindings por jogador; não assuma o layout "standard".

## 8. Interface, UX e acessibilidade

- **Navegável inteiramente por controle e por teclado** (menus, configuração, pausa), com foco sempre visível.
- **Respeite `prefers-reduced-motion`:** reduza shakes, flashes e partículas.
- **Contraste suficiente** (WCAG AA: 4,5:1 para texto) e informação nunca transmitida só por cor (P1/P2 com cor **e** rótulo/forma).
- **Feedback imediato** para cada ação do jogador (visual, sonoro, vibração).
- **Animações de interface rápidas** (150 a 300 ms), interrompíveis, animando `transform`/`opacity` em vez de propriedades de layout.
- **Textos de UI em português**, curtos e diretos.
- Skills de design instaladas para apoiar esse trabalho: `impeccable` (crítica/polimento de UI), `design-taste-frontend` (direção de arte), `emil-design-eng`, `animate`, `review-animations` e `break-ui` (estresse com dados extremos: nomes longos, emoji etc.).

## 9. Segurança

- **Segredos fora do código:** use `.env` (carregado com `node --env-file=.env`), mantenha `.env` no `.gitignore` e versione um `.env.example` sem valores reais.
- **Nunca confie no cliente:** toda regra que importa (placar, vencedor, limites) é validada no servidor.
- **XSS:** nomes de jogadores e qualquer texto vindo do usuário ou do banco vão para o DOM via `textContent`, nunca `innerHTML`.
- **SQL injection:** só prepared statements (seção 6).
- **Dependências:** poucas, atualizadas, `npm audit` periodicamente e `package-lock.json` versionado.
- **Mensagens de erro** genéricas para o cliente; detalhes só no log do servidor.
- **CSP** (`Content-Security-Policy`) se o app for servido além de localhost.
- Detalhes e decisões específicas ficam em `docs/SECURITY.md`.

## 10. Testes

- **Use `node:test` + `node:assert/strict`** (nativos, sem dependência). `npm test` roda `node --test`, que encontra todos os `tests/*.test.js`.
- **Priorize lógica pura e crítica:**
  - `src/validate.js`: entradas válidas, inválidas e casos-limite;
  - regras de pontuação e finalização (spin, ring-out, burst, xtreme etc.);
  - física/colisão isolada do render (possível graças à seção 7).
- **Banco em testes:** use `new DatabaseSync(':memory:')` para não tocar em `data/`.
- **Testes rápidos e independentes:** sem ordem obrigatória, sem rede, sem estado compartilhado.
- Nome do teste descreve o comportamento: `rejects deadzone above 0.9`.

### Testes de regressão: algo quebrou

Um teste de regressão garante que um bug corrigido **nunca volte**. Fluxo obrigatório:

1. **Reproduza com um teste.** Escreva em `tests/` um teste que simula exatamente a situação do erro (mesma entrada, mesmo estado).
2. **Veja o teste falhar.** Rode `npm test` e confirme que ele falha **pelo motivo certo**. Um teste que passa antes da correção não prova nada.
3. **Corrija o código**, na causa e não no sintoma.
4. **Veja o teste passar**, junto com a suíte inteira (`npm test` verde).
5. **Mantenha o teste para sempre.** Nunca apague um teste de regressão para "fazer passar".
6. **Documente a causa** no doc do assunto se ela não for óbvia (ex.: comportamento estranho do DualShock 4 → `docs/CONTROLLERS.md`).
7. **Commit** com `fix(escopo): ...` contendo o teste e a correção juntos.

Exemplo:

```js
// tests/scoring.test.js
// Regressão: ring-out no último segundo era contado como spin finish.
test('counts ring-out in the final second as ring-out', () => {
  const result = resolveFinish({ outOfStadium: true, spinning: true, timeLeftMs: 400 });
  assert.equal(result.finish, 'ringout');
});
```

Se o bug não for reproduzível em teste automático (ex.: depende do hardware do controle), isole a lógica que dá para testar (ex.: a função que aplica a deadzone) e documente o passo manual de verificação.

### Testes automáticos antes de todo push

- O hook versionado **`.githooks/pre-push`** roda `npm test` antes de cada `git push` e **bloqueia o push** se algum teste falhar.
- Ativação: `git config core.hooksPath .githooks`. O script `prepare` do `package.json` faz isso automaticamente no `npm install`, então um clone novo já fica protegido.
- Push bloqueado → corrija (seguindo o fluxo acima) e tente de novo. **Nunca use `git push --no-verify`** para pular os testes.
- Os testes precisam continuar rápidos (segundos) para que o hook não atrapalhe; testes lentos ou dependentes de hardware ficam fora da suíte padrão.

## 11. Performance

- **Meça antes de otimizar** (DevTools > Performance, `performance.now()`).
- Meta: **60 FPS estáveis** com os dois jogadores; cada frame tem ~16 ms de orçamento.
- Canvas: desenhe só o necessário, reutilize objetos, pré-carregue imagens e sons antes da partida.
- Imagens otimizadas (WebP/PNG comprimido, dimensões adequadas); nada de imagens de vários MB no jogo.
- No servidor: prepared statements reutilizados, índices, listagens paginadas.

## 12. Documentação

O projeto é desenvolvido com apoio de IA, que **não lembra de sessões anteriores**. A memória do projeto são os arquivos em `docs/`, então eles precisam estar sempre atualizados e ser relidos.

### Documentação contínua

- **Documente durante o processo, não no fim.** Quando uma decisão é tomada, ela vai para `docs/DECISIONS.md` na hora. Exemplo real: "vamos jogar com controle de PS4" virou a decisão [D-001](DECISIONS.md#d-001-controle-principal-é-o-dualshock-4-ps4) e gerou o `docs/CONTROLLERS.md`.
- **Assunto novo sem doc → crie um `.md` novo em `docs/`** (ex.: `PHYSICS.md`, `AUDIO.md`, `BEYBLADES.md`) e adicione-o à tabela abaixo e à lista do `CLAUDE.md`.
- **Registre descobertas**, não só decisões: limitações de navegador, valores calibrados (deadzone, atrito, velocidade), causas de bugs.
- **Decisões não se apagam:** quando mudam, uma nova entrada substitui a antiga, que fica marcada como substituída.

### Sempre reler

- No início de toda tarefa: `docs/DECISIONS.md` + docs do assunto.
- Em tarefas longas: releia antes de decisões importantes, para não contradizer algo já decidido.
- Se o código e o doc discordarem, descubra qual está certo e corrija o outro.

### Onde documentar

Atualize no mesmo commit da mudança:

| Arquivo                 | Atualize quando...                                       |
| ----------------------- | -------------------------------------------------------- |
| `docs/DECISIONS.md`     | Qualquer decisão de produto ou técnica (ler sempre primeiro) |
| `docs/CONTROLLERS.md`   | Mudar mapeamentos, suporte a controles ou input          |
| `README.md`             | Mudar instalação, execução ou requisitos                 |
| `docs/ARCHITECTURE.md`  | Mudar estrutura de pastas, módulos ou fluxo de dados     |
| `docs/DATABASE.md`      | Mudar schema, migrações ou PRAGMAs                       |
| `docs/SECURITY.md`      | Mudar validação, exposição de rede ou dependências       |
| `docs/ROADMAP.md`       | Concluir, adicionar ou repriorizar funcionalidades       |
| `docs/BEST_PRACTICES.md`| Adotar ou abandonar uma prática                          |
| `CLAUDE.md`             | Surgir uma regra que precisaria ser repetida toda sessão |

Documentação desatualizada é pior que nenhuma: corrija ou apague.

## 13. Assets e direitos autorais

- Imagens, sons e fontes de terceiros (ex.: material de referência em `pesquisa-bakuten/`) têm direitos dos seus autores. Use como **referência**; antes de publicar no repositório ou distribuir no jogo, confirme a licença ou substitua por assets próprios ou livres.
- Registre a origem e a licença de cada asset usado no jogo.

## 14. Checklist de "pronto"

- [ ] Docs relidos no início e decisões tomadas registradas em `docs/DECISIONS.md`.
- [ ] Funciona de verdade em `http://localhost:5000` (testado com DualShock 4 e/ou teclado).
- [ ] Entradas novas validadas no servidor.
- [ ] `npm test` verde, com teste de regressão para todo bug corrigido.
- [ ] Sem `console.log` de debug esquecido nem código comentado morto.
- [ ] Documentação afetada atualizada.
- [ ] Diff revisado: sem segredos, sem `data/`, sem arquivos indevidos.
- [ ] Commit no padrão Conventional Commits, em inglês.

---

## Fontes

- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [Node.js Best Practices (goldbergyoni)](https://github.com/goldbergyoni/nodebestpractices)
- [Express: Production Best Practices: Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [SQLite: Write-Ahead Logging](https://www.sqlite.org/wal.html) · [PRAGMA](https://www.sqlite.org/pragma.html) · [Foreign Keys](https://www.sqlite.org/foreignkeys.html)
- [Node.js: `node:sqlite`](https://nodejs.org/api/sqlite.html) · [`node:test`](https://nodejs.org/api/test.html)
- [MDN: Using the Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API)
- [web.dev: Jumping the hurdles with the Gamepad API](https://web.dev/doodles-gamepad/)
- [Code inComplete: JavaScript Game Foundations: The Game Loop](https://codeincomplete.com/articles/javascript-game-foundations-the-game-loop)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) · [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Claude Code: Memory / CLAUDE.md](https://code.claude.com/docs/en/memory)
