'use client';

import { FAIXAS, proximaFaixa } from './playlist';

// Música de fundo por contexto, em playlist (D-055): cada contexto tem várias faixas e, quando uma
// acaba, toca outra da mesma lista, nunca a mesma em seguida. Os arquivos são do usuário, em
// public/audio/musica/ (fora do git, D-030); se um faltar, pula para a próxima ou fica em silêncio.
// Um único <audio> por vez, com troca suave de volume entre as faixas.

const VOLUME = 0.35;
const FADE_MS = 600;

let atual = null;
let contextoAtual = null;
let ultimaFaixa = null;
let falhas = 0;

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

function tocarFaixa(contexto, inicio) {
  const faixa = proximaFaixa(contexto, ultimaFaixa, { inicio });
  const url = FAIXAS[faixa];
  if (!url) return;
  ultimaFaixa = faixa;
  const audio = Object.assign(new Audio(url), { volume: 0, preload: 'auto' });
  atual = audio;
  // Acabou: a próxima da mesma playlist (se o contexto ainda for o mesmo).
  audio.addEventListener('ended', () => {
    if (atual === audio && contextoAtual === contexto) tocarFaixa(contexto, false);
  });
  // Arquivo faltando: tenta a próxima, sem ficar em laço se nenhuma existir.
  audio.addEventListener('error', () => {
    if (atual !== audio || contextoAtual !== contexto || ++falhas > 4) return;
    tocarFaixa(contexto, false);
  });
  // Sem gesto do usuário o navegador pode recusar; no Electron o autoplay é liberado.
  audio.play().then(() => {
    falhas = 0;
    fade(audio, 0, VOLUME, FADE_MS);
  }).catch(() => {});
}

// contexto: inicio, menus, selecao, batalha ou decisiva (src/audio/playlist.js). O mesmo contexto de
// novo não troca de faixa.
export function tocarMusica(contexto) {
  if (typeof window === 'undefined' || contexto === contextoAtual) return;
  const anterior = atual;
  if (anterior) fade(anterior, anterior.volume, 0, FADE_MS, () => anterior.pause());
  contextoAtual = contexto;
  atual = null;
  falhas = 0;
  if (contexto) tocarFaixa(contexto, true);
}

export function pararMusica() {
  tocarMusica(null);
}
