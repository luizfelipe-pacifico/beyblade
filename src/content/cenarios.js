// Cenários clássicos do anime adaptados para estádios do jogo (D-039; mapa completo em docs/CENARIOS.md).
// Módulo puro (sem DOM): a seleção lê a lista para montar a grade e a batalha resolve o parâmetro arena.
// A arte é toda própria e desenhada em código; nenhum quadro do anime é usado.
//
// regras (lidas pela simulação, createMatch({ regras })):
//   atrito    multiplica tração e atrito da ponta (gelo < 1, areia > 1)
//   ringOut   false: parede alta, sem saída pelos bolsos nem pela borda
//   saida     multiplica a velocidade que tira a bey da arena (< 1 = sai mais fácil)
//   vento     aceleração lateral constante em mm/s², { x, y }
//   giro      multiplica a perda de giro (frio > 1)
// tema (lido pelo render): cenário em volta do prato e cores da tigela.

export const ROM_STADIUMS = 6;
export const ALEATORIA = 'aleatoria';

export const CENARIOS = [
  {
    slug: 'piscina-publica',
    nome: 'Piscina pública',
    origem: 'G-Revolution, ep. 3',
    regras: { saida: 0.85 },
    regra: 'Prato numa boia: sair é mais fácil.',
    tema: { cenario: 'piscina', boia: true, tigela: ['#bfe9ff', '#4fb3ea', '#1477c4'] },
  },
  {
    slug: 'parque-lago-cachoeira',
    nome: 'Parque do lago',
    origem: 'Temporada 1, ep. 3',
    regras: { atrito: 1.15 },
    regra: 'Grama: as beys correm um pouco menos.',
    tema: { cenario: 'parque', tigela: ['#d8f0c8', '#6fb35a', '#2f6e2a'] },
  },
  {
    slug: 'terraco-blade-sharks',
    nome: 'Terraço dos Blade Sharks',
    origem: 'Temporada 1, ep. 1',
    regras: { vento: { x: 900, y: 0 } },
    regra: 'Vento: empurra as beys para a direita.',
    tema: { cenario: 'terraco', tigela: ['#e3e6ea', '#9aa3ad', '#4c5560'] },
  },
  {
    slug: 'bb-shop',
    nome: 'Prato da BB Shop',
    origem: 'Temporada 1, ep. 3',
    regras: { ringOut: false },
    regra: 'Parede alta: sem ring out, só vence por giro ou burst.',
    tema: { cenario: 'loja', paredeAlta: true },
  },
  {
    slug: 'becos-hong-kong',
    nome: 'Becos de Hong Kong',
    origem: 'Temporada 1, ep. 8',
    regras: { saida: 0.9 },
    regra: 'Prato de rua: sair é um pouco mais fácil.',
    tema: { cenario: 'beco', tigela: ['#ffd9a8', '#e0742f', '#7a2a12'] },
  },
  {
    slug: 'torres-da-china',
    nome: 'Topo das torres da China',
    origem: 'Temporada 1, ep. 10',
    regras: { saida: 0.7 },
    regra: 'No alto das torres: ring out acontece com menos força.',
    tema: { cenario: 'telhado', tigela: ['#ffe1b0', '#d9473a', '#7d1a18'] },
  },
  {
    slug: 'lago-baikal',
    nome: 'Lago Baikal congelado',
    origem: 'Temporada 1, ep. 45',
    regras: { atrito: 0.4 },
    regra: 'Gelo: as beys escorregam e freiam pouco.',
    tema: { cenario: 'gelo', tigela: ['#ffffff', '#cfe8f7', '#7fb2d6'] },
  },
  {
    slug: 'prato-de-gelo-final',
    nome: 'Prato de gelo da final',
    origem: 'Temporada 1, ep. 50 e 51',
    regras: { atrito: 0.55, giro: 1.3 },
    regra: 'Gelo e frio: escorrega e o giro cai mais rápido.',
    tema: { cenario: 'rinque', tigela: ['#f4fbff', '#a9d8f2', '#3f7fb3'] },
  },
  {
    slug: 'praia-de-treino',
    nome: 'Praia de treino',
    origem: 'V-Force, ep. 15 e 40',
    regras: { atrito: 1.8 },
    regra: 'Areia: as beys freiam muito.',
    tema: { cenario: 'praia', tigela: ['#fff3d1', '#e6c47a', '#a8823b'] },
  },
  {
    slug: 'estadio-bega',
    nome: 'Estádio da BEGA',
    origem: 'G-Revolution, ep. 36',
    regras: { ringOut: false },
    regra: 'Grades: sem ring out, só vence por giro ou burst.',
    tema: { cenario: 'bega', paredeAlta: true, grade: true, tigela: ['#c9b8ff', '#6a4fd1', '#2a1a6e'] },
  },
];

const PADRAO = { atrito: 1, ringOut: true, saida: 1, vento: null, giro: 1 };

// Estádio do GBA (rom-0…rom-5): só a tigela muda, com a imagem extraída da ROM; sem regra própria.
function romStadium(n) {
  return {
    slug: `rom-${n}`,
    nome: `Estádio ${n + 1} do GBA`,
    origem: 'Beyblade G-Revolution (GBA)',
    regras: {},
    tema: { cenario: 'estadio', tigelaImagem: `/rom/stadiums/${n}-bowl.png` },
  };
}

export function cenario(slug) {
  const rom = /^rom-(\d)$/.exec(slug ?? '');
  if (rom && Number(rom[1]) < ROM_STADIUMS) return romStadium(Number(rom[1]));
  return CENARIOS.find((c) => c.slug === slug) ?? null;
}

// arena: slug do cenário, rom-N, ou ausente/aleatoria/desconhecido → sorteio entre os cenários do anime.
export function resolverArena(arena, random = Math.random) {
  const achado = arena && arena !== ALEATORIA ? cenario(arena) : null;
  return achado ?? CENARIOS[Math.floor(random() * CENARIOS.length) % CENARIOS.length];
}

export function regrasDe(c) {
  return { ...PADRAO, ...(c?.regras ?? {}) };
}
