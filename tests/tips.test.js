import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTip, tipTypeFromName, TIP_FRICTION } from '../src/beyblade/tips.js';
import { computeAttributes } from '../src/beyblade/stats.js';

test('infers tip type from part names, most specific first', () => {
  assert.equal(tipTypeFromName('Grip Flat Core'), 'grip-flat');
  assert.equal(tipTypeFromName('Semi-Flat Core'), 'semi-flat');
  assert.equal(tipTypeFromName('Right EG Metal Semi-Flat'), 'metal-semi-flat');
  assert.equal(tipTypeFromName('Right SG (G Ball)'), 'metal-ball');
  assert.equal(tipTypeFromName('Sharp Core'), 'sharp');
  assert.equal(tipTypeFromName('Ten Heavy'), null);
});

test('prefers the blade base tip, then the HMS running core', () => {
  const bb = { categoria: 'blade-base', id: 'blade-base/x', fisica: { tipo_ponta: 'flat', atrito: 0.5 } };
  const core = { categoria: 'spin-gear', id: 'spin-gear/sharp-core', nome: 'Sharp Core', forma: { tipo: 'running-core' } };
  assert.deepEqual(resolveTip([bb, core]), { tipo: 'flat', atrito: 0.5, origem: 'blade-base/x' });
  assert.deepEqual(resolveTip([core]), { tipo: 'sharp', atrito: TIP_FRICTION.sharp, origem: 'spin-gear/sharp-core' });
  assert.equal(resolveTip([{ categoria: 'spin-gear', nome: 'Right SG' }]), null);
});

test('engine gears add speed and attack, turbo more than clutch', () => {
  const bb = { categoria: 'blade-base', fisica: { tipo_ponta: 'metal-semi-flat', atrito: 0.25 }, medidas: {} };
  const eg = (modo) => ({ categoria: 'spin-gear', fisica: { gimmick: 'engine-gear', ativacao: { modo } }, medidas: {} });
  const plain = computeAttributes([bb, { categoria: 'spin-gear', medidas: {} }]).atributos;
  const clutch = computeAttributes([bb, eg('clutch')]).atributos;
  const turbo = computeAttributes([bb, eg('turbo')]).atributos;
  assert.ok(clutch.velocidade > plain.velocidade && turbo.velocidade > clutch.velocidade);
  assert.ok(turbo.ataque > plain.ataque);
});

test('averages tip friction across the modes of clutch and change bases', () => {
  const bb = { categoria: 'blade-base', fisica: { tipo_ponta: 'sharp', atrito: 0.1, modos: [{ tipo_ponta: 'sharp', atrito: 0.1 }, { tipo_ponta: 'flat', atrito: 0.5 }] } };
  assert.equal(resolveTip([bb]).atrito, 0.3);
  const single = { categoria: 'blade-base', fisica: { tipo_ponta: 'flat', atrito: 0.5, modos: [{ atrito: 0.5 }] } };
  assert.equal(resolveTip([single]).atrito, 0.5);
});
