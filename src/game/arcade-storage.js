// Escada do Arcade guardada na sessão (sobrevive à ida e volta da batalha, some ao fechar o jogo).
const KEY = 'beyblade:arcade';

export function saveLadder(ladder) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ladder));
  } catch {}
}

export function loadLadder() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearLadder() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}
