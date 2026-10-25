# Registro de decisões

Toda decisão de produto ou técnica tomada durante o desenvolvimento entra aqui, a mais recente no topo. Uma decisão só muda com uma nova entrada que a substitua (marque a antiga como **Substituída por D-XXX**); não apague o histórico.

Formato:

```
## D-XXX: título curto
- Data: AAAA-MM-DD
- Status: Aceita | Substituída por D-YYY
- Contexto: por que a decisão foi necessária
- Decisão: o que foi decidido
- Consequências: o que isso implica no código, nos testes e na documentação
```

---

## D-003: testes automáticos antes de todo push

- Data: 2026-10-25
- Status: Aceita
- Contexto: queremos que nada quebrado chegue ao GitHub e que bugs corrigidos não voltem.
- Decisão: suíte com `node:test` (`npm test`), hook `pre-push` versionado em `.githooks/` que bloqueia o push se algum teste falhar, e regra de teste de regressão para todo bug corrigido.
- Consequências: o hook é ativado por `git config core.hooksPath .githooks` (feito automaticamente pelo script `prepare` no `npm install`). Nunca usar `git push --no-verify` para pular os testes. Detalhes em [`BEST_PRACTICES.md`](BEST_PRACTICES.md#10-testes).

## D-002: documentação contínua em Markdown

- Data: 2026-10-25
- Status: Aceita
- Contexto: o projeto é desenvolvido com apoio de IA, que não guarda memória entre sessões; o contexto precisa estar nos arquivos.
- Decisão: toda decisão, requisito e descoberta é registrada em `docs/` durante o trabalho, e os docs são relidos no início de cada tarefa.
- Consequências: regra no `CLAUDE.md`; este arquivo existe para isso.

## D-001: controle principal é o DualShock 4 (PS4)

- Data: 2026-10-25
- Status: Aceita
- Contexto: o jogo é para dois jogadores locais com controle. Precisamos de um controle de referência para mapeamentos padrão, textos da interface e testes.
- Decisão: o jogo é projetado e testado primeiro com **dois controles DualShock 4 (PS4)**. O teclado continua como fallback e outros controles devem funcionar via remapeamento, mas não são a referência.
- Consequências:
  - mapeamento padrão dos botões baseado no layout do DualShock 4 (ver [`CONTROLLERS.md`](CONTROLLERS.md));
  - interface mostra os símbolos do PS4 (✕ ○ □ △, L1/R1, L2/R2, Options);
  - toda funcionalidade de input é testada com DualShock 4 antes de ser dada como pronta.
