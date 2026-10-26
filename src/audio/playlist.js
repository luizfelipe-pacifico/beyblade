// Playlists de música por contexto (D-055). Puro (sem DOM): escolhe a próxima faixa sem repetir a que
// acabou de tocar. Os arquivos são do usuário, em public/audio/musica/ (fora do git, D-030).
export const FAIXAS = {
  abertura: '/audio/musica/abertura.mp3',
  'menu-inicio': '/audio/musica/menu-inicio.mp3',
  'menu-selecao': '/audio/musica/menu-selecao.mp3',
  batalha: '/audio/musica/batalha.mp3',
  'batalha-decisiva': '/audio/musica/batalha-decisiva.mp3',
};

// primeira: faixa que abre o contexto (a tela inicial abre com a abertura; a rodada decisiva com o tema
// tenso); as próximas saem sorteadas da lista, sem repetir a anterior.
export const PLAYLISTS = {
  inicio: { faixas: ['abertura', 'menu-inicio'], primeira: 'abertura' },
  menus: { faixas: ['menu-inicio', 'menu-selecao', 'abertura'] },
  selecao: { faixas: ['menu-selecao', 'menu-inicio', 'abertura'] },
  batalha: { faixas: ['batalha', 'abertura', 'batalha-decisiva'] },
  decisiva: { faixas: ['batalha-decisiva', 'batalha', 'abertura'], primeira: 'batalha-decisiva' },
};

// Próxima faixa de uma playlist. `anterior` é a que acabou de tocar (nunca repete de novo em seguida,
// se houver outra); `inicio` indica que o contexto acabou de começar.
export function proximaFaixa(contexto, anterior, { inicio = false, random = Math.random } = {}) {
  const p = PLAYLISTS[contexto];
  if (!p) return null;
  if (inicio && p.primeira && p.primeira !== anterior) return p.primeira;
  const opcoes = p.faixas.filter((f) => f !== anterior);
  const lista = opcoes.length ? opcoes : p.faixas;
  return lista[Math.floor(random() * lista.length) % lista.length];
}
