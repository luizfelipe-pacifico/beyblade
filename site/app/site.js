// Endereços e dados fixos da landing. Mude aqui, não espalhado pelas páginas.
import images from './images.generated.json';

export const REPO = 'https://github.com/luizfelipe-pacifico/beyblade';
export const INSTALLER = 'BeybladeArena-Setup.exe';
// Link fixo para o instalador da última release (D-016). Funciona assim que a primeira versão for publicada.
export const DOWNLOAD_URL = `${REPO}/releases/latest/download/${INSTALLER}`;
export const RELEASES_URL = `${REPO}/releases`;
export const ISSUES_URL = `${REPO}/issues`;
export const ROADMAP_URL = `${REPO}/blob/main/docs/ROADMAP.md`;
export const LICENSE_URL = `${REPO}/blob/main/LICENSE`;

export const UPDATED_AT = '25 de outubro de 2026';

const byId = Object.fromEntries(images.map((img) => [img.id, img]));
export function image(id) {
  const img = byId[id];
  if (!img) throw new Error(`Imagem desconhecida: ${id}`);
  return img;
}
export { images };

// Cores das feras bit, restritas à identidade dos personagens.
export const BEASTS = {
  dragoon: { name: 'Dragoon', color: 'var(--fera-dragoon)', text: 'var(--fera-dragoon-texto)' },
  dranzer: { name: 'Dranzer', color: 'var(--fera-dranzer)', text: 'var(--fera-dranzer-texto)' },
  driger: { name: 'Driger', color: 'var(--fera-driger)', text: 'var(--fera-driger-texto)' },
  draciel: { name: 'Draciel', color: 'var(--fera-draciel)', text: 'var(--fera-draciel-texto)' },
};

// Atributos da beyblade da 1ª temporada de cada um, de pesquisa-bakuten/personagens/*/beyblades/*/dados.json.
export const BLADERS = [
  {
    id: 'tyson',
    name: 'Tyson',
    fullName: 'Tyson Granger',
    beast: 'dragoon',
    beastLabel: 'Dragoon, o dragão azul do vento',
    bey: 'Dragoon S',
    type: 'Ataque',
    spin: 'Esquerda',
    tip: 'Ponta de borracha',
    special: { name: 'Storm Attack', text: 'Tornado de 4 s em volta da bey que arremessa quem encostar.' },
    stats: { Ataque: 7, Defesa: 4, Stamina: 3, Velocidade: 9 },
    blurb: 'Impulsivo e veloz. Gira para a esquerda, contra quase todo mundo.',
    image: 'tyson',
    focus: '38% 30%',
  },
  {
    id: 'kai',
    name: 'Kai',
    fullName: 'Kai Hiwatari',
    beast: 'dranzer',
    beastLabel: 'Dranzer, a fênix de fogo',
    bey: 'Dranzer S',
    type: 'Equilíbrio',
    spin: 'Direita',
    tip: 'Ponta de metal ou plana, trocável',
    special: { name: 'Spin Fire', text: 'Salto no ar e mergulho em chamas sobre o alvo.' },
    stats: { Ataque: 5, Defesa: 4, Stamina: 6, Velocidade: 6 },
    blurb: 'Frio, calculista e o rival de sempre. Ataca de cima.',
    image: 'kai',
    focus: '52% 22%',
  },
  {
    id: 'ray',
    name: 'Ray',
    fullName: 'Ray Kon',
    beast: 'driger',
    beastLabel: 'Driger, o tigre branco',
    bey: 'Driger S',
    type: 'Equilíbrio',
    spin: 'Direita',
    tip: 'Metal change',
    special: { name: 'Tiger Claw', text: 'Investida com 3 ou 4 golpes rápidos de garra.' },
    stats: { Ataque: 6, Defesa: 5, Stamina: 7, Velocidade: 6 },
    blurb: 'Calmo e ágil. A bey mais equilibrada do time.',
    image: 'ray',
    focus: '40% 28%',
  },
  {
    id: 'max',
    name: 'Max',
    fullName: 'Max Tate',
    beast: 'draciel',
    beastLabel: 'Draciel, a tartaruga',
    bey: 'Draciel S',
    type: 'Defesa',
    spin: 'Direita',
    tip: 'Bola de metal',
    special: { name: 'Metal Ball Defense', text: 'Por 6 s fica mais pesada e drena o giro de quem bate nela.' },
    stats: { Ataque: 2, Defesa: 8, Stamina: 6, Velocidade: 2 },
    blurb: 'Alegre e paciente. Aguenta o tranco e vence no cansaço.',
    image: 'max',
    focus: '50% 30%',
  },
];

// Marcos do docs/ROADMAP.md. Atualize junto com o roadmap.
export const MILESTONES = [
  { name: 'Fundação técnica', status: 'Em andamento', note: 'Banco, API, testes e base do app' },
  { name: 'Protótipo da batalha', status: 'Próximo', note: 'Física, colisão e as finalizações' },
  { name: 'Vertical slice', status: 'Planejado', note: 'Uma partida completa com Tyson e Kai' },
  { name: 'Alpha', status: 'Planejado', note: 'Todos os modos e personagens jogáveis' },
  { name: 'Beta', status: 'Planejado', note: 'Polimento, balanceamento e o instalador' },
  { name: '3D', status: 'Depois do Beta', note: 'A mesma batalha, refeita em 3D' },
];
