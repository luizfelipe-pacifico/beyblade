// Modo Arcade (D-005): escada de lutas contra a CPU até o chefe, como nos jogos de luta. Puro e determinístico
// (rng injetado), sem DOM. A tela de escada usa createLadder/advance; a batalha recebe cada luta por query string.

export const ARCADE_FIGHTS = 7;
// Chefe final da G-Revolution (pesquisa-bakuten/personagens/brooklyn-masefield): Brooklyn com a Zeus.
export const BOSS = 'brooklyn-masefield';
export const CONTINUES = 3;

// Nível de dificuldade da CPU por etapa (1..5): sobe aos poucos e o chefe é sempre o máximo.
export function cpuLevel(stage, total = ARCADE_FIGHTS) {
  if (stage >= total - 1) return 5;
  return Math.min(4, 1 + Math.floor((stage * 4) / (total - 1)));
}

function shuffle(list, rng) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Oponentes: todos menos o jogador e o chefe, embaralhados, e o chefe por último. Se o jogador for o chefe,
// o último vira um sorteado (o "espelho" fica para depois).
export function createLadder({ player, characters, rng = Math.random, fights = ARCADE_FIGHTS }) {
  const pool = characters.filter((c) => c !== player && c !== BOSS);
  const boss = player === BOSS ? null : BOSS;
  const before = shuffle(pool, rng).slice(0, boss ? fights - 1 : fights);
  const opponents = boss ? [...before, boss] : before;
  return {
    player,
    opponents: opponents.map((character, stage) => ({ character, level: cpuLevel(stage, opponents.length) })),
    stage: 0,
    continues: CONTINUES,
    status: 'playing', // 'playing' | 'continue' | 'gameover' | 'cleared'
  };
}

export const currentFight = (ladder) => ladder.opponents[ladder.stage] ?? null;

// Resultado da luta atual. Vitória sobe um degrau; derrota pede continue (ou acaba sem continues).
export function advance(ladder, result) {
  if (ladder.status !== 'playing') return ladder;
  if (result === 'vitoria') {
    const stage = ladder.stage + 1;
    return { ...ladder, stage, status: stage >= ladder.opponents.length ? 'cleared' : 'playing' };
  }
  return { ...ladder, status: ladder.continues > 0 ? 'continue' : 'gameover' };
}

// Usar um continue repete a mesma luta.
export function spendContinue(ladder) {
  if (ladder.status !== 'continue') return ladder;
  return { ...ladder, continues: ladder.continues - 1, status: 'playing' };
}
