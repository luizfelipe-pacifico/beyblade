# Sons de batalha

Sons próprios, sintetizados a partir de [`sons.json`](sons.json) ([`docs/AUDIO.md`](../../docs/AUDIO.md)). Para regerar:

```
node scripts/synth.js pesquisa-bakuten/sons-batalha/sons.json pesquisa-bakuten/sons-batalha/sons
```

| Arquivo | Duração | Quando toca | Como foi feito |
|---|---|---|---|
| [`lancamento.wav`](sons/lancamento.wav) | 1,1 s | Corda puxada e bey solta no estádio | Ruído com textura de dentes (ripcord) subindo de tom + motor acelerando + estalo de soltura |
| [`giro.wav`](sons/giro.wav) | 2 s (loop) | Enquanto a bey gira | Zumbido serrilhado com 3 vozes + chiado da ponta no chão + grave do motor. No jogo, variar o `playbackRate` com o RPM |
| [`choque-leve.wav`](sons/choque-leve.wav) | 0,35 s | Contato leve entre beys | Clique metálico agudo com dois parciais |
| [`choque-forte.wav`](sons/choque-forte.wav) | 0,9 s | Golpe forte / smash | Estalo saturado + impacto grave + ressonância de plástico |
| [`ring-out.wav`](sons/ring-out.wav) | 1,6 s | Bey expulsa do estádio | Giro caindo de tom, pancada no chão e sino de pontuação |
| [`parada.wav`](sons/parada.wav) | 2,2 s | Bey para de girar (sleep out) | Giro perdendo velocidade e oscilando, termina com batidas da bey tombando |
| [`contagem.wav`](sons/contagem.wav) | 3,6 s | "3, 2, 1, Let it rip!" | Três bipes e um acorde de largada |
