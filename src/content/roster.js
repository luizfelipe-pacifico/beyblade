// Elenco da 1ª geração (pesquisa-bakuten/README.md). A arte vem de public/art/ (scripts/sync-art.js).
// `fera` aponta para o token de campo em src/design/tokens.js quando a cor da fera já foi fixada;
// as demais usam o painel neutro até a arte delas definir a cor.

export const roster = [
  { slug: 'tyson-granger', nome: 'Tyson', fera: 'dragoon', bey: 'Dragoon G', arteFera: 'dragoon' },
  { slug: 'kai-hiwatari', nome: 'Kai', fera: 'dranzer', bey: 'Dranzer G', arteFera: 'dranzer' },
  { slug: 'ray-kon', nome: 'Ray', fera: 'driger', bey: 'Driger G', arteFera: 'driger' },
  { slug: 'max-tate', nome: 'Max', fera: 'draciel', bey: 'Draciel G', arteFera: 'draciel' },
  { slug: 'daichi-sumeragi', nome: 'Daichi', fera: 'gaia', bey: 'Gaia Dragoon G', arteFera: 'gaia-dragoon' },
  { slug: 'tala', nome: 'Tala', fera: null, bey: 'Wolborg 4', arteFera: 'wolborg' },
  { slug: 'bryan-kuznetsov', nome: 'Bryan', fera: null, bey: 'Falborg 2', arteFera: 'falborg' },
  { slug: 'brooklyn-masefield', nome: 'Brooklyn', fera: null, bey: 'Zeus', arteFera: null },
  { slug: 'lee', nome: 'Lee', fera: null, bey: 'Galeon 2', arteFera: null },
  { slug: 'robert-jurgen', nome: 'Robert', fera: null, bey: 'Griffolyon', arteFera: 'griffolyon' },
];

export const retrato = (slug) => `/art/personagens/${slug}/retrato.svg`;
export const feraArte = (slug, pose = 'idle') => `/art/feras/${slug}/${pose}.svg`;
