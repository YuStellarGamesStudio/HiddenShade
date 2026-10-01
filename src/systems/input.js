import { DEFAULT_KEYS, INPUT } from '../data/settings.js';

const directions = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const aliases = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right' };
const formFocused = target => target instanceof Element && !!target.closest('input, textarea, select, [contenteditable="true"]');
export function createInput({ onInteract = () => {}, onPause = () => {}, onZoom = () => {}, keys = DEFAULT_KEYS } = {}) {
  let mapping = { ...DEFAULT_KEYS, ...keys };
  let enabled = false;
  const held = new Set();
  const touches = new Map();
  const canvasTouches = new Map();
  let joystick = null;
  let stick = { x: 0, y: 0 };
  let pinchDistance = null;
  const listeners = [];
  function listen(target, type, handler, options) { target.addEventListener(type, handler, options); listeners.push(() => target.removeEventListener(type, handler, options)); }
  function reset() {
    held.clear(); touches.clear(); canvasTouches.clear(); stick = { x: 0, y: 0 }; pinchDistance = null;
    if (joystick) { joystick.style.setProperty('--stick-x', '0px'); joystick.style.setProperty('--stick-y', '0px'); joystick = null; }
    document.querySelectorAll('[data-dir].pressed').forEach(element => element.classList.remove('pressed'));
  }
  function keyDown(event) {
    if (formFocused(event.target) || event.defaultPrevented) return;
    const code = event.code;
    if (code === mapping.pause || code === 'Escape' || code === 'KeyP') {
      event.preventDefault(); if (!event.repeat) { reset(); onPause(); } return;
    }
    if (!enabled) return;
    if (code === mapping.interact) { event.preventDefault(); if (!event.repeat) onInteract(); return; }
    if (code === 'Equal' || code === 'NumpadAdd' || code === 'Minus' || code === 'NumpadSubtract') { event.preventDefault(); onZoom(code === 'Minus' || code === 'NumpadSubtract' ? -1 : 1); return; }
    if (aliases[code] || Object.keys(directions).some(direction => mapping[direction] === code)) { event.preventDefault(); held.add(code); }
  }
  function stickMove(event) {
    const rect = joystick.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const distance = Math.hypot(x, y);
    const radius = Math.min(INPUT.joystickRadius, rect.width / 2);
    const scale = distance > radius ? radius / distance : 1;
    stick = distance < radius * INPUT.joystickDeadzone ? { x: 0, y: 0 } : { x: x * scale / radius, y: y * scale / radius };
    joystick.style.setProperty('--stick-x', `${x * scale}px`); joystick.style.setProperty('--stick-y', `${y * scale}px`);
  }
  function calculatePinch() {
    if (canvasTouches.size !== 2) { pinchDistance = null; return; }
    const [a, b] = canvasTouches.values();
    const next = Math.hypot(a.x - b.x, a.y - b.y);
    if (pinchDistance !== null && enabled) onZoom((next - pinchDistance) / INPUT.pinchScale);
    pinchDistance = next;
  }
  function pointerDown(event) {
    if (!enabled || !(event.target instanceof Element)) return;
    const control = event.target.closest('[data-dir], #joystick, [data-action="interact"]');
    if (control) {
      event.preventDefault();
      if (control.id === 'joystick') {
        if (joystick) return;
        joystick = control; touches.set(event.pointerId, { type: 'stick', element: control }); stickMove(event);
      } else if (control.dataset.dir) {
        touches.set(event.pointerId, { type: control.dataset.dir, element: control }); control.classList.add('pressed');
      } else { onInteract(); touches.set(event.pointerId, { type: 'interact', element: control }); }
      control.setPointerCapture?.(event.pointerId);
    } else if (event.target.closest('#game') && event.pointerType === 'touch') {
      event.preventDefault(); canvasTouches.set(event.pointerId, { x: event.clientX, y: event.clientY }); event.target.setPointerCapture?.(event.pointerId); calculatePinch();
    }
  }
  function pointerMove(event) {
    if (touches.get(event.pointerId)?.type === 'stick' && joystick) { event.preventDefault(); stickMove(event); }
    if (canvasTouches.has(event.pointerId)) { event.preventDefault(); canvasTouches.set(event.pointerId, { x: event.clientX, y: event.clientY }); calculatePinch(); }
  }
  function pointerUp(event) {
    const touch = touches.get(event.pointerId);
    if (touch) {
      touches.delete(event.pointerId);
      if (touch.type === 'stick') { stick = { x: 0, y: 0 }; if (joystick) { joystick.style.setProperty('--stick-x', '0px'); joystick.style.setProperty('--stick-y', '0px'); } joystick = null; }
      if (![...touches.values()].some(other => other.element === touch.element)) touch.element.classList.remove('pressed');
    }
    canvasTouches.delete(event.pointerId); calculatePinch();
  }
  listen(window, 'keydown', keyDown);
  listen(window, 'keyup', event => held.delete(event.code));
  listen(window, 'blur', reset);
  listen(document, 'visibilitychange', () => { if (document.hidden) reset(); });
  listen(document, 'pointerdown', pointerDown, { passive: false });
  listen(document, 'pointermove', pointerMove, { passive: false });
  listen(document, 'pointerup', pointerUp);
  listen(document, 'pointercancel', pointerUp);
  listen(document, 'lostpointercapture', pointerUp);
  listen(document, 'click', event => {
    if (enabled && event.detail === 0 && event.target instanceof Element && event.target.closest('[data-action="interact"]')) onInteract();
  });
  return {
    vector() {
      if (!enabled || formFocused(document.activeElement)) return { x: 0, y: 0 };
      let x = stick.x, y = stick.y;
      const active = new Set();
      for (const code of held) {
        const direction = Object.keys(directions).find(direction => mapping[direction] === code) || aliases[code];
        if (direction) active.add(direction);
      }
      for (const touch of touches.values()) if (directions[touch.type]) active.add(touch.type);
      for (const direction of active) { x += directions[direction].x; y += directions[direction].y; }
      const gx = x + 2 * y, gy = -x + 2 * y;
      const length = Math.hypot(gx, gy);
      return length ? { x: gx / length, y: gy / length } : { x: 0, y: 0 };
    },
    setEnabled(value) { enabled = Boolean(value); reset(); },
    setKeys(value) { mapping = { ...DEFAULT_KEYS, ...value }; reset(); },
    reset,
    destroy() { reset(); listeners.forEach(remove => remove()); }
  };
}
