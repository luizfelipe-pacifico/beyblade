'use client';

// Sons da batalha (sintetizados, D-008), copiados para public/audio/ pelo scripts/sync-art.js.
// Cada som tem um pequeno pool de <audio> para poder tocar por cima de si mesmo nos choques seguidos.
const POOL = 3;

export function createSounds(names) {
  const bank = Object.fromEntries(
    Object.entries(names).map(([id, url]) => [id, Array.from({ length: POOL }, () => Object.assign(new Audio(url), { preload: 'auto' }))]),
  );
  const next = {};
  return {
    play(id, volume = 1) {
      const pool = bank[id];
      if (!pool) return;
      const i = (next[id] = ((next[id] ?? -1) + 1) % POOL);
      const audio = pool[i];
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.currentTime = 0;
      // Sem gesto do usuário o navegador pode recusar; no Electron o autoplay é liberado.
      audio.play().catch(() => {});
    },
    stopAll() {
      for (const pool of Object.values(bank)) for (const a of pool) a.pause();
    },
  };
}

export const BATALHA = {
  contagem: '/audio/batalha/contagem.wav',
  lancamento: '/audio/batalha/lancamento.wav',
  choqueLeve: '/audio/batalha/choque-leve.wav',
  choqueForte: '/audio/batalha/choque-forte.wav',
  ringOut: '/audio/batalha/ring-out.wav',
  parada: '/audio/batalha/parada.wav',
};
