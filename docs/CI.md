# CI e automação

Processos automáticos do GitHub que protegem a evolução do jogo. Arquivos em `.github/`.

## Workflow `CI` (`.github/workflows/ci.yml`)

Roda em todo push na `main`, em todo pull request e manualmente (*Run workflow*).

| Job | O que faz | Por quê |
| --- | --- | --- |
| **Testes (ubuntu, windows)** | `npm ci`, `node scripts/sync-art.js` (gera `beys.generated.json` e a arte) e `npm test` | O hook `pre-push` (D-003) só protege quem tem o hook ativo; a CI vale para todo commit. Windows é a plataforma do `.exe` (D-004); Linux pega diferenças de caminho. |
| **Build do jogo** | `npx next build` depois dos testes | Garante que as telas compilam e que nenhuma importação quebrou o bundle (o teste unitário não pega isso). |
| **Build da landing** | `npm ci` e `npm run build` em `site/` | A landing é publicada na Vercel (D-016); quebrar o build quebra o deploy. |
| **Auditoria** | `npm audit --omit=dev --audit-level=high` no jogo e na landing | Avisa sobre vulnerabilidade alta em dependência de produção. Por enquanto é **informativo** (`continue-on-error`). |

Detalhes:

- **Sem ROM na CI** (D-007): os testes de engenharia reversa usam ROMs sintéticas e o jogo builda sem `public/rom/` (a seleção e a batalha caem na arte da pesquisa).
- **Sem banco na CI**: a suíte não depende do PostgreSQL (`DATABASE.md`); a CI só define um `DATABASE_URL` falso para o `prisma generate` do `postinstall`.
- **Concorrência**: um push novo no mesmo branch cancela a execução anterior.
- **Permissões mínimas**: `contents: read`.

## Dependabot (`.github/dependabot.yml`)

Toda segunda abre PRs de atualização para o jogo (`/`), a landing (`/site`) e as próprias GitHub Actions. Minors e patches vêm **agrupados** num PR por pacote; majors vêm separados. A CI roda em cada PR antes do merge.

## Template de PR (`.github/pull_request_template.md`)

Checklist do `CLAUDE.md`/`BEST_PRACTICES.md`: testes, teste real no jogo, regressão, docs, nada de ROM/`.env`/banco no commit, commits em inglês.

## Próximos processos (quando o projeto chegar lá)

| Processo | Quando | Como |
| --- | --- | --- |
| **Release do `.exe`** | Empacotamento do Electron pronto (M4) | Workflow em `windows-latest` disparado por tag `v*`: build do Next `standalone`, empacotar com electron-builder e anexar `BeybladeArena-Setup.exe` ao GitHub Release (o link da landing já aponta para `releases/latest/download/BeybladeArena-Setup.exe`, D-016). |
| **Teste de interface** | Telas estáveis | Playwright abrindo `/personagens` e `/batalha` no Chromium, com teclado simulado e screenshot como artefato. |
| **Matriz de balanceamento** | Física do M3/M4 | Job agendado que roda simulações determinísticas entre todas as beys e publica a tabela de vitórias como artefato (alvo do triângulo em `BEY_BEHAVIOR.md`). |
| **Lint** | Quando o projeto adotar ESLint/Prettier | Job `lint` antes dos testes. |
| **Auditoria bloqueante** | Depois de zerar os alertas atuais | Tirar o `continue-on-error`. |
