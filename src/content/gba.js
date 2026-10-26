// Ponte entre o jogo e os dados da ROM do Beyblade G-Revolution (D-007, D-023).
// Aqui ficam só índices e endereços (versionados); números, nomes e imagens são gerados por
// scripts/build-rom-assets.js em public/rom/ (fora do git). Formato da ROM: docs/REVERSE_ENGINEERING.md.

// Bey da pesquisa (slug em pesquisa-bakuten/) → índice na tabela de beys da ROM (0x0807A1F4).
// Beys do anime que não existem no jogo de GBA ficam de fora e usam só os dados da pesquisa.
export const GBA_BEYS = {
  'dragoon-grip-attacker': 30,
  'dragoon-s': 0,
  'dragoon-f': 4,
  'dragoon-v': 52,
  'dragoon-v2': 2,
  'dragoon-g': 1,
  'dragoon-gt': 8,
  'dragoon-ms': 69,
  'master-dragoon': 6,
  'dranzer-s': 56,
  'dranzer-f': 14,
  'dranzer-v': 55,
  'dranzer-g': 62,
  'dranzer-gt': 65,
  'dranzer-ms': 72,
  'driger-s': 10,
  'driger-f': 9,
  'driger-v': 54,
  'driger-g': 11,
  'driger-ms': 67,
  'draciel-s': 18,
  'draciel-f': 20,
  'draciel-v': 74,
  'draciel-v2': 19,
  'draciel-g': 81,
  'draciel-ms': 68,
  'gaia-dragoon-g': 5,
  'gaia-dragoon-ms': 66,
  'wolborg-2': 24,
  'wolborg-4': 63,
  zeus: 50,
  galeon: 42,
  'galeon-2': 76,
  'galeon-2-eg': 76,
  griffolyon: 59,
};

// Sprite 16x32 de 29 quadros de cada personagem e a paleta dele (endereços na ROM, sem a base 0x08000000).
// `confianca`: 'rom' = índice do blader na tabela de bonecos; 'paleta' = identificado pela paleta do blader;
// 'provavel' = identificação visual ainda incerta. Brooklyn e Robert não têm sprite no jogo de GBA.
export const GBA_WALK = {
  'tyson-granger': { sprite: 0x3147c8, palette: 0x3002e0, confianca: 'paleta' },
  'kai-hiwatari': { sprite: 0x3024a4, bladerPalette: 31, confianca: 'paleta' },
  'ray-kon': { sprite: 0x306910, bladerPalette: 12, confianca: 'rom' },
  'max-tate': { sprite: 0x305dc0, bladerPalette: 13, confianca: 'rom' },
  'daichi-sumeragi': { sprite: 0x30191c, bladerPalette: 20, confianca: 'paleta' },
  tala: { sprite: 0x265590, bladerPalette: 44, confianca: 'paleta' },
  'bryan-kuznetsov': { sprite: 0x303a84, bladerPalette: 42, confianca: 'provavel' },
  lee: { sprite: 0x30ab18, bladerPalette: 38, confianca: 'provavel' },
};

// Quadros do sprite de 29 quadros. "Lado" olha para a esquerda; para a direita, espelhe.
export const WALK_FRAMES = {
  idleSide: [0, 1, 2, 3, 4, 5, 6, 7],
  idleBack: [8],
  idleFront: [9, 10, 11, 12, 13, 14, 15, 16],
  walkSide: [17, 18, 19, 20],
  walkBack: [21, 22, 23, 24],
  walkFront: [25, 26, 27, 28],
};
export const WALK_FRAME_SIZE = { width: 16, height: 32 };
export const WALK_FRAME_COUNT = 29;

export const STADIUM_COUNT = 6;

// Efeitos visuais da batalha (conjuntos 64x64 na ROM). A paleta deles não foi achada: saem em tons de cinza
// (índice de cor → cinza) para o renderizador colorir com os tokens do design system. Nomes pelo que mostram.
export const GBA_FX = {
  hit: 0x31854c,
  tie: 0x3197a8,
  reversal: 0x31b490,
  combo: 0x31ca38,
  impactRing: 0x320f20,
  embers: 0x32587c,
  sparkStar: 0x328be8,
  groundSpikes: 0x329968,
  speedLines: 0x32aa98,
  debris: 0x32ad84,
  scatter: 0x32b918,
  shatter: 0x32c1cc,
  darkOrb: 0x3306e0,
  flame: 0x33283c,
  wind: 0x333a10,
  targetRing: 0x3341f4,
  bladeRing: 0x334dd8,
  starFlash: 0x3359e4,
  darkSwirl: 0x3365fc,
};

// Stats de cada peça na ROM vão de 0 a 4; a bey soma Attack Ring + Weight Disk + Blade Base (0 a 12).
const PART_STAT_MAX = 4;
const PARTS_PER_BEY = 3;

// Converte a soma da ROM para a escala 1–10 do catálogo (pesquisa-bakuten/README.md).
export function toTenScale(sum) {
  const max = PART_STAT_MAX * PARTS_PER_BEY;
  const clamped = Math.min(max, Math.max(0, sum));
  return Math.round(1 + (clamped * 9) / max);
}

// Soma os stats das três peças de uma bey do catálogo extraído (assets da ROM).
export function gbaPartTotals(bey, parts) {
  const pieces = [parts.attackRings[bey.attackRing], parts.weightDisks[bey.weightDisk], parts.bladeBases[bey.bladeBase]];
  const total = { attack: 0, defense: 0, endurance: 0 };
  for (const piece of pieces) {
    if (!piece?.stats) continue;
    total.attack += piece.stats.attack;
    total.defense += piece.stats.defense;
    total.endurance += piece.stats.endurance;
  }
  return total;
}

// O que a ROM acrescenta a uma bey da pesquisa: ataque/defesa/stamina na escala 1–10, rotação e nome do especial.
// Devolve null se a bey não existe no jogo de GBA.
export function gbaOverlay(slug, data) {
  const entry = data?.beys?.[slug];
  if (!entry) return null;
  return {
    atributos: {
      ataque: toTenScale(entry.totals.attack),
      defesa: toTenScale(entry.totals.defense),
      stamina: toTenScale(entry.totals.endurance),
    },
    rotacao: entry.spin === 'left' ? 'esquerda' : 'direita',
    especial: entry.special,
  };
}

// Sequência da animação de entrada (D-023): anda de costas até a arena e para. `tick` em quadros de 60 Hz.
export function walkInFrame(tick, { frameTicks = 8, walkTicks = 96 } = {}) {
  if (tick >= walkTicks) return WALK_FRAMES.idleBack[0];
  const cycle = WALK_FRAMES.walkBack;
  return cycle[Math.floor(tick / frameTicks) % cycle.length];
}
