import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WALK_IN, walkInPose } from '../src/game/walk-in.js';
import { WALK_FRAMES } from '../src/content/gba.js';

test('walks sideways from off screen and stops at the bowl edge facing it', () => {
  assert.equal(walkInPose(0).avanco, 0);
  assert.ok(WALK_FRAMES.walkSide.includes(walkInPose(30).quadro));
  const parado = walkInPose(WALK_IN.andar);
  assert.equal(parado.avanco, 1);
  assert.ok(WALK_FRAMES.idleSide.includes(parado.quadro));
  assert.equal(parado.pulo, 0);
});

test('slows down before stopping, and the step follows the distance so feet do not slide', () => {
  const v = (t) => walkInPose(t + 1).avanco - walkInPose(t).avanco;
  assert.ok(v(WALK_IN.andar - 3) < v(10) / 3);
  // Mesmo meio passo ⇒ mesmo quadro, não importa quanto tempo passou.
  const meio = (t) => Math.floor(walkInPose(t).avanco * WALK_IN.passadas * 2);
  for (let t = 0; t < WALK_IN.andar - 1; t++) if (meio(t) === meio(t + 1)) assert.equal(walkInPose(t).quadro, walkInPose(t + 1).quadro);
});

test('portraits cut in with the VS after the walk', () => {
  assert.equal(walkInPose(WALK_IN.vs - 1).corte, 0);
  assert.equal(walkInPose(WALK_IN.vs + WALK_IN.corte).corte, 1);
  assert.equal(walkInPose(WALK_IN.vs).fase, 'vs');
  assert.ok(WALK_IN.fim > WALK_IN.vs + WALK_IN.corte);
});
