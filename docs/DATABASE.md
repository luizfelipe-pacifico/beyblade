# Banco de dados

PostgreSQL 18 em container Docker (D-012), acessado pelo Prisma ORM 7 (D-011). O banco guarda só o que precisa sobreviver entre sessões: configuração dos controles, preferências e histórico de partidas. Conteúdo do jogo (personagens, beys, peças) **não** fica no banco: é dado versionado no repositório (ver [`ARCHITECTURE.md`](ARCHITECTURE.md#7-conteúdo-orientado-a-dados)).

## Como rodar

Requisitos: Docker Desktop aberto e o `.env` criado a partir do `.env.example` (troque a senha).

```bash
npm run db:up        # sobe o container e espera o healthcheck (docker compose up -d --wait)
npm run db:deploy    # aplica as migrações pendentes
npm run db:studio    # (opcional) Prisma Studio para ver e editar os dados
npm run db:down      # para o container (os dados ficam no volume)
```

| Item | Valor |
| --- | --- |
| Imagem | `postgres:18-alpine` |
| Container | `beyblade-db` (projeto compose `beyblade`) |
| Porta | `127.0.0.1:5434` → `5432` no container. Só interface local; 5432/5433 já estavam ocupadas nesta máquina |
| Volume | `beyblade_pgdata`, montado em `/var/lib/postgresql` (no Postgres 18 o `PGDATA` passou a ser `/var/lib/postgresql/18/docker`; montar em `/data` como nas versões antigas **perde dados**) |
| Healthcheck | `pg_isready -U $POSTGRES_USER -d $POSTGRES_DB` a cada 5 s |
| Credenciais | `.env` (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`, `DATABASE_URL`) |
| Fuso | Datas em `timestamptz` (UTC); conversão para o fuso local só na interface |

## Schema

Fonte da verdade: [`prisma/schema.prisma`](../prisma/schema.prisma). Nomes no banco em `snake_case` (via `@map`), no código em `camelCase`.

### `controller_configs`

Bindings e ajustes de controle por jogador.

| Coluna | Tipo | Regras |
| --- | --- | --- |
| `slot` | `smallint` PK | `CHECK (slot IN (1, 2))` |
| `config` | `jsonb` | `{ gamepadIndex, deadzone, rumble, bindings }`, validado por `parseConfig` |
| `updated_at` | `timestamptz(3)` | atualizado pelo Prisma (`@updatedAt`) |

### `settings`

Preferências em chave/valor (ex.: `lastSetup` = últimos jogadores e beys escolhidos).

| Coluna | Tipo |
| --- | --- |
| `key` | `varchar(64)` PK |
| `value` | `jsonb` |
| `updated_at` | `timestamptz(3)` |

### `matches`

Uma linha por partida terminada.

| Coluna | Tipo | Regras |
| --- | --- | --- |
| `id` | `serial` PK | |
| `p1_name`, `p2_name` | `varchar(24)` | |
| `p1_bey`, `p2_bey` | `varchar(32)` | id da bey (`^[a-z0-9-]+$`) |
| `p1_score`, `p2_score` | `smallint` | `CHECK (>= 0)` |
| `winner` | `smallint` | `CHECK (winner IN (1, 2))` |
| `target_points` | `smallint` | `CHECK (BETWEEN 1 AND 20)` |
| `duration_ms` | `integer` | `CHECK (>= 0)` |
| `played_at` | `timestamptz(3)` | default `now()`, índice `DESC` |

### `match_rounds`

Rodadas de cada partida (antes eram JSON dentro de `matches`; viraram tabela para o ranking por tipo de finalização ser uma consulta simples).

| Coluna | Tipo | Regras |
| --- | --- | --- |
| `match_id` | `integer` FK → `matches.id` | `ON DELETE CASCADE` |
| `number` | `smallint` | PK composta (`match_id`, `number`), `CHECK (>= 1)` |
| `winner` | `smallint` | `CHECK (IN (0, 1, 2))`; 0 = empate |
| `finish` | enum `FinishType` | `spin`, `ringout`, `xtreme`, `burst`, `decision`, `draw` |
| `points` | `smallint` | `CHECK (BETWEEN 0 AND 3)` |

As restrições `CHECK` são a **segunda linha de defesa** além do `src/validate.js`: mesmo com um bug na API, o banco recusa valores fora do domínio. O Prisma não expressa `CHECK`, então elas vivem numa migração SQL própria (`*_check_constraints`).

## Migrações

Fluxo oficial do Prisma:

| Comando | Quando | O que faz |
| --- | --- | --- |
| `npm run db:migrate -- --name <nome>` | **Desenvolvimento**, depois de mudar o `schema.prisma` | Gera a migração SQL, aplica e regera o client. Usa um *shadow database* temporário para detectar drift |
| `npx prisma migrate dev --create-only --name <nome>` | Quando a migração precisa de SQL manual (ex.: `CHECK`, índices parciais) | Cria o arquivo sem aplicar; edite e rode `db:migrate` |
| `npm run db:deploy` | Máquina do jogador / build / CI | Só aplica migrações já commitadas. Não usa shadow database e não detecta drift |
| `npx prisma migrate status` | Diagnóstico | Mostra o que está pendente ou divergente |

Regras:

- **Nunca edite uma migração já aplicada** (em qualquer máquina). Crie uma nova. A pasta `prisma/migrations/` vai para o git.
- **Nunca rode `migrate dev` contra um banco com dados que importam.** Ele pode pedir para resetar.
- O Prisma Migrate não tem rollback: desfazer = nova migração reversa ou restaurar backup.
- `migrate deploy` usa *advisory lock*, então duas execuções simultâneas não se atropelam.

Histórico:

| Migração | Conteúdo |
| --- | --- |
| `20261025193844_init` | Tabelas, enum `FinishType`, índice `matches(played_at DESC)` |
| `20261025193853_check_constraints` | Restrições `CHECK` de domínio |

## Consultas

- CRUD pelo Prisma Client (parametrizado por construção).
- **Só recursos comuns ao PostgreSQL e ao SQLite** (D-014): o ranking que une P1 e P2 é feito com `groupBy` do Prisma por lado e somado em JavaScript (`src/db.js`), sem SQL específico de um banco.
- Se um dia for inevitável usar SQL manual: **`prisma.$queryRaw` com template literal** (vira prepared statement), testado nos dois bancos. **Nunca** `$queryRawUnsafe` nem concatenação de strings. Cuidado: `COUNT`/`SUM` no Postgres voltam como `bigint`, que o `JSON.stringify` não serializa.
- Escritas relacionadas na mesma operação: `create` aninhado (partida + rodadas) ou `prisma.$transaction`.

## Backup e reset

```bash
# backup (arquivo no host)
docker exec beyblade-db pg_dump -U beyblade -d beyblade -Fc > backup.dump

# restaurar
docker exec -i beyblade-db pg_restore -U beyblade -d beyblade --clean < backup.dump

# zerar tudo (apaga o volume!) e recriar
docker compose down -v && npm run db:up && npm run db:deploy
```

Backups (`*.dump`) **nunca** vão para o git.

## Testes

- A suíte padrão (`npm test`) **não depende do banco**: testa validação, regras e simulação, que são lógica pura. Isso mantém o hook `pre-push` rápido e funcionando com o Docker parado.
- Testes de integração com banco, quando existirem, usam um banco separado (`beyblade_test`, via `DATABASE_URL` próprio) e nunca o banco de desenvolvimento.

## Dois bancos: desenvolvimento e `.exe`

Pela D-014, o PostgreSQL no Docker é só para desenvolvimento e testes em `localhost`. O `.exe` usa **SQLite**, num arquivo dentro de `app.getPath('userData')`, sem Docker.

- O `provider` do schema do Prisma é fixo, então cada banco tem o seu schema, as suas migrações e o seu client gerado.
- `src/db.js` usa só o que os dois bancos suportam: nada de tipos ou SQL exclusivos do PostgreSQL.
- Pendente (registrar aqui quando decidido): adapter SQLite do Prisma 7, compilação do driver nativo para o Electron e como as migrações são aplicadas na primeira execução do `.exe`.

## Fontes

- [Docker Hub: imagem oficial `postgres`](https://hub.docker.com/_/postgres): `PGDATA` e volume a partir do 18.
- [Postgres 18 Docker: mudança do caminho de montagem](https://industrialmonitordirect.com/blogs/knowledgebase/docker-postgres-18-mount-path-change-upgrading-from-17).
- [Pulse: Postgres no Docker](https://pulse.support/kb/postgres-docker): healthcheck com `pg_isready`, `depends_on: service_healthy`, porta em `127.0.0.1`.
- [Prisma: Development and production](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production) e [About the shadow database](https://prisma.io/docs/concepts/components/prisma-migrate/shadow-database).
- [Prisma 7 + PostgreSQL (driver adapter `@prisma/adapter-pg`)](https://medium.com/@faresahmednabih/getting-started-with-prisma-7-with-nodejs-postgresql-1bb4de3c8336).
