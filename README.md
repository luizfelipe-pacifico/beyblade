# Beyblade Arena

Jogo de luta de Beyblade para PC, feito por fã, em português. Escolha o blader, escolha a beyblade, lance e lute contra um amigo no mesmo computador, com dois controles de PS4 (DualShock 4) ou pelo teclado.

> **Status:** em desenvolvimento (marco M0, fundação técnica). Ainda não há versão jogável. Veja o [roadmap](docs/ROADMAP.md).

## Baixar

Quando a primeira versão sair, o instalador para Windows 10 e 11 (64 bits) fica em [Releases](https://github.com/luizfelipe-pacifico/beyblade/releases/latest). O instalador não tem assinatura digital: o Windows SmartScreen avisa na primeira execução ("Mais informações" → "Executar assim mesmo"). Confira o SHA-256 publicado em cada versão:

```powershell
Get-FileHash .\BeybladeArena-Setup.exe -Algorithm SHA256
```

## Como jogar

- **1 contra 1** no mesmo PC, **contra a CPU**, **Arcade** e **Treino**.
- **Controles:** dois DualShock 4 (USB ou Bluetooth), os dois no teclado (P1 em `WASD`, P2 nas setas) ou misto. Detalhes em [docs/CONTROLLERS.md](docs/CONTROLLERS.md).

## Desenvolvimento

Requisitos: Node.js 24.11+ e Docker Desktop (PostgreSQL de desenvolvimento).

```bash
npm install          # instala dependências, gera o Prisma Client e ativa o hook de testes
cp .env.example .env # depois troque a senha
npm run db:up        # sobe o PostgreSQL no Docker
npm run db:migrate   # aplica as migrações
npm run dev          # servidor em http://localhost:5000
pnpm run dev:all     # tudo junto: banco, jogo (5000), landing (3000) e a janela do Electron
npm test             # testes (rodam também antes de todo push)
```

A landing page fica em [`site/`](site/) (Next.js, export estático, publicada na Vercel com Root Directory = `site`):

```bash
cd site && npm install && npm run dev   # http://localhost:3000
npm run images                          # regenera os WebP a partir de images.json
```

## Documentação

Decisões em [docs/DECISIONS.md](docs/DECISIONS.md), arquitetura em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), boas práticas em [docs/BEST_PRACTICES.md](docs/BEST_PRACTICES.md). Regras para agentes de IA em [CLAUDE.md](CLAUDE.md).

## Licença e aviso de fã

Código sob [licença MIT](LICENSE). A licença cobre só o código e a arte original do projeto.

Beyblade Arena é um projeto de fã, gratuito e sem fins lucrativos, sem vínculo com a Takara Tomy, Hasbro, Nelvana ou d-rights. Beyblade, os personagens e as feras bit pertencem aos seus donos. As imagens do anime na landing estão creditadas em `site/app/creditos`. Pedidos de remoção: abra uma [issue](https://github.com/luizfelipe-pacifico/beyblade/issues).
