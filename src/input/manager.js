'use client';

import { DEFAULT_DEADZONE, KEYBOARD, makeFrame, readKeys, readPad } from './frame';

const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);
const isTyping = (el) => el instanceof HTMLElement && Boolean(el.closest('input, textarea, select, [contenteditable="true"]'));

// Lê os dois jogadores a cada poll(). navigator.getGamepads() é chamado de novo a cada tick
// porque os objetos são snapshots; porta 1 = P1, porta 2 = P2 (CONTROLLERS.md).
export class InputManager {
  constructor({ deadzone = DEFAULT_DEADZONE } = {}) {
    this.deadzone = deadzone;
    this.keys = new Set();
    this.prev = [{}, {}];
    this.devices = ['teclado', 'teclado'];
    this.onKeyDown = (e) => {
      if (isTyping(e.target)) return;
      if (SCROLL_KEYS.has(e.code)) e.preventDefault();
      this.keys.add(e.code);
    };
    this.onKeyUp = (e) => this.keys.delete(e.code);
    // Tecla segura durante um Alt+Tab ficaria "apertada" para sempre.
    this.onBlur = () => this.keys.clear();
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  poll() {
    const pads = navigator.getGamepads?.() ?? [];
    return [0, 1].map((slot) => {
      const pad = readPad(pads[slot], this.deadzone);
      this.devices[slot] = pad ? 'controle' : 'teclado';
      const frame = makeFrame([pad, readKeys(this.keys, KEYBOARD[slot])], this.prev[slot]);
      this.prev[slot] = frame.held;
      return frame;
    });
  }

  rumble(slot, strong, weak = strong, duration = 120) {
    const pad = (navigator.getGamepads?.() ?? [])[slot];
    pad?.vibrationActuator?.playEffect?.('dual-rumble', { duration, strongMagnitude: strong, weakMagnitude: weak }).catch(() => {});
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }
}
