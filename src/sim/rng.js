// PRNG mulberry32: o estado (um uint32) vive dentro do estado da partida, então a mesma semente
// com os mesmos inputs dá sempre o mesmo resultado (ARCHITECTURE.md §4). Nunca Math.random na simulação.
export function nextRandom(state) {
  let t = (state.rng = (state.rng + 0x6d2b79f5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
