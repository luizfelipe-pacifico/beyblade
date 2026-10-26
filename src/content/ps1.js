// Ponte com o jogo de PS1 (D-031, D-040): só índices versionados. As imagens são geradas em public/ps1/
// por scripts/build-ps1-assets.js a partir do disco extraído (fora do git).

// Arquivo BCHR de cada personagem do roster que existe no PS1 (docs/PS1.md).
export const PS1_PORTRAITS = {
  'tyson-granger': 'BCHR00D',
  'kai-hiwatari': 'BCHR01D',
  'max-tate': 'BCHR02D',
  'ray-kon': 'BCHR03D',
  'daichi-sumeragi': 'BCHR04D',
};

// Entradas de cada BCHR: 4 expressões, cada uma em par espelhado (a de índice par e a ímpar).
export const PS1_POSES = { normal: [0, 1], fala: [2, 3], comemora: [4, 5], bravo: [6, 7] };

// Fera bit em arte do anime (BSJEF00D, 256×128) por fera do roster (src/content/roster.js → fera).
export const PS1_BEASTS = { dragoon: 20, dranzer: 21, draciel: 22, driger: 23 };

export const PS1_SCALE = 4;

// Caminho público da imagem gerada. lado: 'a' = entrada par, 'b' = espelhada.
export const ps1Portrait = (slug, pose = 'normal', lado = 'a') => `/ps1/personagens/${slug}/${pose}-${lado}.png`;
export const ps1Beast = (fera) => `/ps1/feras/${fera}.png`;
