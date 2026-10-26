// Constantes da batalha em unidades do mundo: milímetros, segundos e giro normalizado (0 a 1).
// Valores de protótipo (M1), calibrados no jogo; a ROM do GBA não tem física (REVERSE_ENGINEERING.md).

export const DT = 1 / 60;
export const SUBSTEPS = 2;

// Arena ~16:1 em relação à bey, como no GBA (chão de 512 px, bey de 32 px). O brinquedo é ~9:1 e
// ficava pequeno na tela (GAME_FLOW.md, proporção entre arena e bey). As velocidades e os limiares
// abaixo foram escalados ×1,8 junto com o raio, para o ritmo da luta em segundos não mudar.
export const ARENA_RADIUS = 360;
export const POCKETS = [Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6];
export const POCKET_HALF_WIDTH = 0.26;

export const LAUNCH_SECONDS = 3;
export const ROUND_SECONDS = 60;
export const FINISH_SECONDS = 1.4;
export const ROUND_OVER_SECONDS = 1.8;
export const ROUNDS_TO_WIN = 2;

export const START_X = 200;

export const PHYSICS = {
  bowlPull: 4,
  orbit: 468,
  control: 1620,
  maxSpeed: 1170,
  damping: 0.8,
  stoppedDamping: 2.6,
  restitution: 0.8,
  repel: 216,
  dashSpeed: 774,
  dashCooldown: 0.8,
  dashSpinCost: 0.03,
  jumpTime: 0.45,
  jumpCooldown: 0.9,
  dodgeSpeed: 684,
  dodgeCooldown: 0.8,
  dodgeInvuln: 0.25,
  wallRestitution: 0.6,
  pocketOutSpeed: 468,
  rimOutSpeed: 1170,
  hitDamage: 0.0000667,
  wallDamage: 0.0000278,
  equalization: 0.05,
  burstImpact: 630,
  burstSpin: 0.3,
  spinDecay: 0.018,
  guardDrain: 0.01,
  specialPassive: 0.03,
  specialPerImpact: 0.00022,
  launchSpeed: 216,
  launchSpeedPerPower: 360,
  launchDrift: 72,
  specialRush: 1620,
  hitEventImpact: 108,
  equalizeImpact: 90,
  burstSpan: 1440,
  wallEventSpeed: 270,
};

export const FINISHES = {
  spin: 'Parada',
  ringout: 'Fora',
  burst: 'Burst',
  decision: 'Decisão',
  draw: 'Empate',
};
