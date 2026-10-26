// Constantes da batalha em unidades do mundo: milímetros, segundos e giro normalizado (0 a 1).
// Valores de protótipo (M1), calibrados no jogo; a ROM do GBA não tem física (REVERSE_ENGINEERING.md).

export const DT = 1 / 60;
export const SUBSTEPS = 2;

// Arena ~20:1 em relação à bey (raio 450 mm; o GBA é 16:1 e o brinquedo ~9:1, ver GAME_FLOW.md).
// As beys mantêm o tamanho real. Distâncias, velocidades e limiares de impacto foram desenhados para
// uma arena de 200 mm e escalam por S, então o ritmo da luta em segundos não muda com o tamanho;
// o dano por mm/s de impacto escala por 1/S.
export const ARENA_RADIUS = 450;
const S = ARENA_RADIUS / 200;
export const POCKETS = [Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6];
export const POCKET_HALF_WIDTH = 0.26;

export const LAUNCH_SECONDS = 3;
export const ROUND_SECONDS = 60;
export const FINISH_SECONDS = 1.4;
export const ROUND_OVER_SECONDS = 1.8;
export const ROUNDS_TO_WIN = 2;

export const START_X = 110 * S;

export const PHYSICS = {
  bowlPull: 4,
  orbit: 260 * S,
  control: 900 * S,
  // Ritmo (D-040): mais lento que no protótipo, para dar tempo de ler a luta e mirar.
  maxSpeed: 500 * S,
  damping: 0.8,
  stoppedDamping: 2.6,
  restitution: 0.8,
  repel: 120 * S,
  dashSpeed: 360 * S,
  dashCooldown: 0.8,
  dashSpinCost: 0.01,
  jumpTime: 0.45,
  jumpCooldown: 0.9,
  dodgeSpeed: 380 * S,
  dodgeCooldown: 0.8,
  dodgeInvuln: 0.25,
  wallRestitution: 0.6,
  pocketOutSpeed: 260 * S,
  rimOutSpeed: 650 * S,
  hitDamage: 0.00008 / S,
  // Atrito de contato entre as beys (por choque, além da força do impacto).
  contactDamage: 0.0002,
  wallDamage: 0.00005 / S,
  equalization: 0.05,
  burstImpact: 450 * S,
  burstSpin: 0.3,
  // Girar à toa gasta pouco; o que mais gasta giro são os choques (hitDamage).
  spinDecay: 0.011,
  guardDrain: 0.01,
  specialPassive: 0.03,
  specialPerImpact: 0.0004 / S,
  launchSpeed: 120 * S,
  launchSpeedPerPower: 200 * S,
  launchDrift: 40 * S,
  specialRush: 900 * S,
  hitEventImpact: 60 * S,
  equalizeImpact: 50 * S,
  burstSpan: 800 * S,
  wallEventSpeed: 150 * S,
  // Faixas de impacto que a apresentação usa (som forte e vibração máxima).
  strongImpact: 300 * S,
  maxImpact: 600 * S,
};

// Tigela funda (docs/BEY_BEHAVIOR.md, física da tigela): quem move a bey é a gravidade na rampa e o
// atrito da ponta que gira, não um motor. Perfil h(r) = d·(r/R)² + (rim·d/3)·(r/R)⁶: parabólico no meio e
// mais íngreme perto da parede. Com d = 0,2·R o período de pêndulo fica em ~2 s.
export const GRAVITY = 9810;
export const BOWL = {
  depth: 0.2 * ARENA_RADIUS,
  rim: 2,
  maxTilt: 0.4,
  // Abaixo deste giro o eixo inclina mais (o "bambear" do fim da rodada).
  wobbleSpin: 0.3,
  wobbleTilt: 0.15,
  // Atrito de quem já parou de girar: escorrega até o fundo e fica.
  stoppedSlide: 0.3,
  // Arrasto proporcional à velocidade (s⁻¹): com o impulso da ponta, dá uma velocidade de equilíbrio.
  drag: 0.9,
};

// Ponta, em frações de g: empurrão lateral na rampa (drive), impulso para frente que a borda da ponta
// tira do giro mesmo no plano (fwd), tração máxima (mu) e atrito de deslizamento (slide).
// Ponta fina quase não anda (fica no centro); ponta larga corre e desenha a flor.
export const TIPS = {
  sharp: { drive: 0.05, fwd: 0, mu: 0.08, slide: 0.04 },
  bola: { drive: 0.2, fwd: 0.075, mu: 0.15, slide: 0.03 },
  'semi-flat': { drive: 0.45, fwd: 0.14, mu: 0.3, slide: 0.08 },
  flat: { drive: 0.7, fwd: 0.22, mu: 0.45, slide: 0.1 },
  grip: { drive: 0.9, fwd: 0.3, mu: 0.8, slide: 0.12 },
};

// O que a ponta não explica (massa efetiva, recuo próprio e "life after death" na equalização de giro)
// e o teto da velocidade própria (fração de PHYSICS.maxSpeed, D-032): ataque mais rápida, resistência mais lenta.
export const TYPES = {
  attack: { mass: 0.9, recoil: 1.4, lad: 0.7, cap: 1 },
  balance: { mass: 1, recoil: 1, lad: 1, cap: 0.8 },
  defense: { mass: 1.5, recoil: 0.5, lad: 1, cap: 0.65 },
  stamina: { mass: 1, recoil: 0.8, lad: 1.3, cap: 0.5 },
};

// Movimento no estilo do app da Burst (D-032): a força própria (rampa, ponta, comando) não passa do
// teto do tipo; o que um choque, a investida ou o especial dão acima do teto decai com meia-vida curta,
// então uma pancada forte ainda joga para fora. O comando curva a trajetória em vez de dirigir.
// Fera bit invocada (D-036): todos os atributos sobem por um tempo e depois voltam. Sem acumular:
// enquanto ela está fora, L1 + R1 não invoca de novo.
export const FERA = {
  seconds: 8,
  boost: 1.25,
};

// Golpe crítico (D-040): só sai com a investida perfeita. Soltar ✕ dentro de perfectWindow depois de a
// carga encher (o "estalo" do brilho) arma o golpe por hitWindow; ele só vale se o choque for de frente
// (direção da investida a no máximo ~12° da linha entre os centros). Aí o tipo do alvo quase não
// protege: é como o ataque consegue vencer a defesa, mas precisa de jogo muito preciso.
export const CRITICAL = {
  perfectWindow: 0.08,
  hitWindow: 0.35,
  minAlign: 0.978,
  knock: 2.4,
  damage: 2.4,
  selfKnock: 0.5,
  // Ponto do choque: o empurrão tem que mandar o alvo para a borda (de dentro para fora).
  minOutward: 0.5,
};

// Escudo da defesa (○, D-042): enquanto aguenta, quem defende não perde giro no choque (só quem bateu
// perde). Tem vida: uma pancada forte (strongImpact) tira perHit, então duas quebram; o crítico tira em
// dobro. Quebrado, só volta a subir quando passar de minToRaise; recarrega devagar sem estar em uso.
export const SHIELD = {
  perHit: 0.5,
  regen: 0.03,
  minToRaise: 0.25,
};

export const MOTION = {
  excessHalfLife: 0.25,
  steerRate: 2.6,
  steerPush: 0.45,
};

// Ponta do catálogo (calculo.ponta) → classe de comportamento; sem ponta confirmada, o tipo decide.
export function tipClass(ponta, tipo) {
  const p = String(ponta ?? '');
  if (/grip|rubber|borracha/.test(p)) return 'grip';
  if (/sharp|bearing/.test(p)) return 'sharp';
  if (/ball|bola/.test(p)) return 'bola';
  if (/semi/.test(p)) return 'semi-flat';
  if (/flat/.test(p)) return 'flat';
  return { attack: 'flat', defense: 'bola', stamina: 'sharp' }[tipo] ?? 'semi-flat';
}

// Altura na tigela (mm) e inclinação |h'(r)|, usadas pela física e pelo render (e pelo 3D depois).
export function bowlHeight(r) {
  const u = Math.min(1, r / ARENA_RADIUS);
  return BOWL.depth * (u * u + (BOWL.rim / 3) * u ** 6);
}
export function bowlSlope(r) {
  const u = Math.min(1, r / ARENA_RADIUS);
  return ((2 * BOWL.depth) / ARENA_RADIUS) * u * (1 + BOWL.rim * u ** 4);
}

export const FINISHES = {
  spin: 'Parada',
  ringout: 'Fora',
  burst: 'Burst',
  decision: 'Decisão',
  draw: 'Empate',
};
