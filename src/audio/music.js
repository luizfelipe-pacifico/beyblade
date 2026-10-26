'use client';

// Música de fundo por contexto. Os arquivos são do usuário, em public/audio/musica/ (fora do git,
// como a ROM na D-007); se um faltar, o jogo só fica em silêncio. Um único <audio> por vez, em laço,
// com troca suave de volume entre as faixas.
export const MUSICAS = {
  abertura: '/audio/musica/abertura.mp3',
  inicio: '/audio/musica/menu-inicio.mp3',
  selecao: '/audio/musica/menu-selecao.mp3',
  batalha: '/audio/musica/batalha.mp3',
  decisiva: '/audio/musica/batalha-decisiva.mp3',
};

const VOLUME = 0.35;
const FADE_MS = 600;

let atual = null;
let atualId = null;

function fade(audio, de, para, ms, fim) {
  const t0 = performance.now();
  const passo = () => {
    const f = Math.min(1, (performance.now() - t0) / ms);
    audio.volume = de + (para - de) * f;
    if (f < 1) requestAnimationFrame(passo);
    else fim?.();
  };
  requestAnimationFrame(passo);
}

export function tocarMusica(id) {
  if (typeof window === 'undefined' || id === atualId) return;
  const url = MUSICAS[id];
  const anterior = atual;
  if (anterior) fade(anterior, anterior.volume, 0, FADE_MS, () => anterior.pause());
  atualId = id;
  atual = null;
  if (!url) return;
  const audio = Object.assign(new Audio(url), { loop: true, volume: 0, preload: 'auto' });
  atual = audio;
  // Sem gesto do usuário o navegador pode recusar; no Electron o autoplay é liberado.
  audio.play().then(() => fade(audio, 0, VOLUME, FADE_MS)).catch(() => {});
}

export function pararMusica() {
  tocarMusica(null);
}
