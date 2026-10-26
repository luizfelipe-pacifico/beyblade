# Segurança

O Beyblade Arena é um jogo **local, pessoal e offline** (D-004, D-007). O modelo de ameaça é pequeno, mas real: um app Electron tem acesso ao sistema de arquivos, e a API e o banco escutam em portas da máquina. As regras abaixo mantêm tudo fechado na própria máquina.

## Modelo de ameaça

| Ameaça | Cenário | Defesa |
| --- | --- | --- |
| Acesso pela rede local | Outro dispositivo no Wi-Fi acessa a API (5000) ou o banco (5434) | Tudo escuta só em `127.0.0.1` |
| Conteúdo malicioso no renderer | Nome de jogador com HTML/JS, link externo, página carregada por engano | React escapa texto, CSP, renderer em sandbox, navegação bloqueada |
| Escalada renderer → sistema | XSS no renderer usando Node para ler arquivos | `nodeIntegration: false`, `contextIsolation`, `sandbox`, sem `file://` |
| Dado inválido no banco | Bug ou requisição forjada grava placar impossível | Validação allowlist + `CHECK` no banco |
| Vazamento de segredo | `.env` ou backup no GitHub | `.gitignore`, revisão do diff antes de cada commit |
| Dependência comprometida | Pacote npm com script malicioso | Poucas dependências, lockfile, `npm audit`, scripts de instalação revisados |
| Material de terceiros | ROM ou assets extraídos publicados | Nunca entram no git (D-007) |

## Rede

- **Servidor do jogo:** `127.0.0.1:5000` (`server.listen(PORT, '127.0.0.1')`). Não usar `0.0.0.0`.
- **Banco:** `127.0.0.1:5434` no `docker-compose.yml`. Publicar só `5434:5432` (sem IP) exporia o Postgres na rede.
- Nenhuma porta é aberta no firewall. Se um dia houver jogo em rede, isso vira uma decisão nova com autenticação.

## Electron

Seguindo o [guia oficial de segurança do Electron](https://www.electronjs.org/docs/latest/tutorial/security), em `electron/main.js`:

- [x] `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false` em toda `BrowserWindow` (padrão desde o Electron 12/20; deixar **explícito**). Desligar o `contextIsolation` desliga o sandbox junto.
- [ ] **Preload mínimo:** se precisar de algo do processo principal, expor funções específicas com `contextBridge`, nunca o `ipcRenderer` inteiro.
- [ ] **Validar o `sender`** de toda mensagem IPC pelo `senderFrame.origin` contra uma allowlist (`http://127.0.0.1:5000`), tratando `senderFrame` nulo.
- [x] **Bloquear navegação** (`will-navigate` → `preventDefault` se a origem não for a do jogo, comparando com o `URL` parseado, nunca com `startsWith`) e negar `window.open` (`setWindowOpenHandler` → `deny`). Links externos, se houver, abrem com `shell.openExternal` depois de checar o protocolo `https:`.
- [ ] **Content Security Policy** restritiva (`default-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data: blob:`), enviada como header pelo servidor e como `<meta>` de reserva.
- [x] Não carregar `file://`: a interface vem do servidor local (ou de um protocolo customizado com `protocol.handle` limitado aos arquivos do app).
- [x] Nada de conteúdo remoto: o jogo não carrega scripts, fontes ou imagens da internet.
- [ ] Manter o Electron atualizado (correções de segurança do Chromium chegam por ele).
- [ ] Desativar DevTools no build de produção.

## API

- **Allowlist em `src/validate.js`** para todo `body`, `params` e `query`; o que não é conhecido é descartado. Cada `parse*` devolve `{ value }` limpo ou `{ error }`.
- Erros no formato `{ "error": "mensagem" }`, com o status certo (`400`, `404`, `503`), e **sem stack trace** para o cliente; detalhes só no log.
- Limite de payload (`64kb`) e de listagem (`limit` até 200).
- Regras que importam (placar, vencedor, limites) são validadas no servidor, nunca só no cliente.

## Banco

- Acesso **só pelo servidor**; o renderer nunca recebe a `DATABASE_URL`.
- Prisma Client parametriza tudo. SQL manual **só** com `$queryRaw` em template literal; `$queryRawUnsafe` e concatenação são proibidos.
- Usuário do banco só para o jogo, com senha aleatória gerada na criação do `.env` (nunca a do `.env.example`).
- Restrições `CHECK`, `NOT NULL` e FKs como segunda linha de defesa ([`DATABASE.md`](DATABASE.md)).
- Imagem Docker oficial e com versão maior fixada (`postgres:18-alpine`); atualizar de forma consciente.

## Interface (XSS)

- React escapa texto por padrão: nomes de jogadores sempre como `{nome}` no JSX.
- **Proibido** `dangerouslySetInnerHTML` com qualquer dado vindo do usuário ou do banco.
- Fora do React (canvas, DOM direto): `textContent`, nunca `innerHTML`.
- SVGs gerados pelos scripts (D-008) são nossos; SVG de terceiros não é inserido inline.

## Segredos e repositório

- `.env` no `.gitignore`; `.env.example` versionado sem valores reais.
- Nunca versionar: `.env`, `data/`, `*.db*`, backups (`*.dump`), `node_modules/`, `src/generated/`, ROMs (`*.gba`, `*.sav`) e `assets-rom/`.
- Antes de cada commit: `git diff --staged` revisado linha a linha (`CLAUDE.md`).

## Dependências

| Pacote | Por quê |
| --- | --- |
| `electron` (dev) | Executável Windows (D-004) |
| `next`, `react`, `react-dom` | Interface (D-004) |
| `prisma` (dev), `@prisma/client`, `@prisma/adapter-pg`, `pg` | ORM e driver do PostgreSQL (D-011, D-012) |
| `express` | API atual; **sai** quando as rotas forem para o Next (D-013) |
| `tailwindcss`, `@tailwindcss/postcss`, `tw-animate-css` | Estilos do jogo com os tokens do design system (D-018, D-022) |
| `shadcn`, `radix-ui`, `class-variance-authority`, `cn`, `lucide-react` | Componentes de interface acessíveis do shadcn/ui (D-022); `cn` é do próprio mantenedor do shadcn |

- `package-lock.json` versionado; `npm ci` em instalação limpa.
- `npm audit` a cada atualização de dependências (estado atual: 0 vulnerabilidades).
- O npm 11 avisa sobre **scripts de instalação** ainda não aprovados (`prisma`, `@prisma/engines`, `electron`). Revise com `npm install-scripts ls` e aprove só os conhecidos.
- Cada dependência nova precisa de justificativa nesta tabela.

## Fontes

- [Electron: Security](https://www.electronjs.org/docs/latest/tutorial/security): checklist oficial (context isolation, sandbox, validação de sender IPC, CSP, navegação, `file://`).
- [Express: Production Best Practices: Security](https://expressjs.com/en/advanced/best-practice-security.html).
- [OWASP Top 10](https://owasp.org/www-project-top-ten/).
- [Docker Hub: `postgres`](https://hub.docker.com/_/postgres) e [Pulse: Postgres no Docker](https://pulse.support/kb/postgres-docker): porta só em `127.0.0.1`, imagem com tag fixa.
