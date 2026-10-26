// Linha do tempo da entrada na arena (D-023, D-052). Pura: o componente só desenha o que sai daqui.
// Os dois entram pelas laterais andando de lado (quadros do GBA), freiam e param ao lado do prato, virados
// para ele; depois os retratos cruzam a tela com o VS e a batalha começa.
import { WALK_FRAMES } from '../content/gba.js';

export const WALK_IN = {
  andar: 150, // ticks de 60 Hz da caminhada (2,5 s)
  passadas: 9, // passos do caminho inteiro; 2 quadros por passo, então o pé não escorrega no chão
  quadroParado: 8, // ticks por quadro da pose parada
  vs: 160, // quando os retratos e o VS entram
  corte: 20, // ticks do retrato cruzando para o lugar
  fim: 290, // vai para a batalha
};

// Freia no fim do caminho, como alguém que chega e para: a velocidade cai a zero na beira do prato.
const frear = (p) => 1 - (1 - p) ** 1.8;

// tick → { avanco 0–1 do caminho, quadro do GBA, pulo (px do sprite, sobe no meio do passo), fase, corte 0–1 }.
export function walkInPose(tick, t = WALK_IN) {
  const p = Math.min(1, Math.max(0, tick / t.andar));
  const avanco = frear(p);
  const corte = Math.min(1, Math.max(0, (tick - t.vs) / t.corte));
  if (p < 1) {
    // O quadro segue a distância andada, não o relógio: freando, o passo fica mais lento junto.
    const meioPasso = Math.floor(avanco * t.passadas * 2);
    const quadro = WALK_FRAMES.walkSide[meioPasso % WALK_FRAMES.walkSide.length];
    return { fase: 'andando', avanco, quadro, pulo: meioPasso % 2 ? 1 : 0, corte };
  }
  const parado = WALK_FRAMES.idleSide;
  const quadro = parado[Math.floor((tick - t.andar) / t.quadroParado) % parado.length];
  return { fase: tick >= t.vs ? 'vs' : 'parado', avanco: 1, quadro, pulo: 0, corte };
}
