import { getLanguage, languages, t } from '../systems/i18n.js';
import { storageError } from '../systems/save.js';
import { DEFAULT_KEYS, UI } from '../data/settings.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const text = (key, params) => esc(t(key, params));
const button = (action, label, extra = '') => `<button type="button" data-action="${action}" ${extra}>${label}</button>`;
const clock = seconds => `${Math.floor((seconds || 0) / 60).toString().padStart(2, '0')}:${Math.floor((seconds || 0) % 60).toString().padStart(2, '0')}`;
const stars = count => '★'.repeat(count || 0) + '☆'.repeat(3 - (count || 0));
function keyLabel(code) {
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit\d$/.test(code)) return code.slice(5);
  return t(`key${code.replace(/(Shift|Control|Alt)(Left|Right)/, '$1')}`);
}
export function createUI({ onAction }) {
  const root = document.getElementById('ui');
  if (!root) throw new Error('Missing #ui mount');
  let screen = 'title';
  let data = {};
  let currentState = null;
  let currentSave = null;
  let tab = 'stats';
  let settingsTab = 'audio';
  let remapping = null;
  let previousFocus = null;
  let mapCache = null;
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const actions = (action, payload) => onAction(action, payload);
  function languagePicker() { return `<div class="language-picker" aria-label="${text('language')}">${languages.map(lang => button('language', lang.toUpperCase(), `data-value="${lang}" aria-pressed="${getLanguage() === lang}"`)).join('')}</div>`; }
  function warning() { return `<p class="storage-warning" role="status" ${storageError || data.storageError || data.saveError ? '' : 'hidden'}>${text('storageFailure')}</p>${data.error && screen !== 'import' ? `<p class="ui-message error-message" role="alert">${esc(data.error)}</p>` : ''}${data.notice ? `<p class="ui-message" role="status">${esc(data.notice)}</p>` : ''}`; }
  function recordContent(save) {
    const stats = save?.stats ?? {};
    return `<div class="record-grid"><div><span>${text('highestFloor')}</span><strong>${stats.highestFloor || 1}</strong></div><div><span>${text('bestStars')}</span><strong class="gold">${stars(stats.bestStars)}</strong></div><div><span>${text('escapes')}</span><strong>${stats.escapes || 0}</strong></div><div><span>${text('catches')}</span><strong>${stats.catches || 0}</strong></div></div><ol class="record-list">${save?.records?.length ? save.records.slice(-UI.recordPreviewLimit).reverse().map(record => `<li><span>${text('floor')} ${record.floor}</span><b class="gold">${stars(record.stars)}</b><time>${clock(record.elapsed)}</time></li>`).join('') : `<li class="empty">${text('empty')}</li>`}</ol><p class="fine-print">${text('localOnly')}</p>`;
  }
  function helpContent() { return `<h3>${text('guideTitle')}</h3><ul class="guide-list">${['guideMove', 'guideHide', 'guideSight', 'guideMemory', 'guideExit', 'guidePause'].map(key => `<li>${text(key)}</li>`).join('')}</ul>`; }
  function tools() { return `<div class="save-tools"><h3>${text('saveTools')}</h3><div class="button-row">${button('exportFile', text('exportFile'))}${button('exportCode', text('exportCode'))}${button('importOpen', text('import'))}${button('restoreBackup', text('restoreBackup'))}</div></div>${data.code && screen === 'settings' ? `<label class="code-label" for="export-code">${text('saveCode')}</label><textarea id="export-code" readonly spellcheck="false">${esc(data.code)}</textarea><p class="fine-print">${text('copied')}</p>` : ''}`; }
  function sidebar() { return `<aside class="side-panel"><div class="panel-tabs" role="tablist">${button('tab', text('statistics'), `data-value="stats" role="tab" aria-selected="${tab === 'stats'}"`)}${button('tab', text('help'), `data-value="help" role="tab" aria-selected="${tab === 'help'}"`)}</div><section class="stats-tab" ${tab === 'stats' ? '' : 'hidden'}><h2>${text('memory')}</h2><canvas id="memory-map" width="240" height="240" aria-label="${text('memory')}"></canvas><h2>${text('records')}</h2><div id="live-records">${recordContent(currentSave)}</div></section><section class="help-tab" ${tab === 'help' ? '' : 'hidden'}>${helpContent()}</section></aside>`; }
  function playing() { return `<div class="play-ui"><header class="hud"><div class="hud-brand">${text('title')}<span>${text('edition')}</span></div><div class="hud-numbers"><div><span>${text('floor')}</span><strong data-live="floor">1</strong></div><div><span>${text('time')}</span><strong data-live="time">00:00</strong></div><div><span>${text('detections')}</span><strong data-live="detections">0</strong></div></div><div class="hud-actions">${button('pause', 'Ⅱ', `aria-label="${text('pause')}" title="${text('pause')}"`)}${button('settings', '⚙', `aria-label="${text('settings')}" title="${text('settings')}"`)}</div></header>${sidebar()}<p class="player-status" data-live="status">${text('safe')}</p><div class="touch-controls"><div class="move-controls"><div id="joystick" role="group" aria-label="${text('controls')}"><span></span></div><div class="dpad">${[['up', '↑'], ['left', '←'], ['down', '↓'], ['right', '→']].map(([direction, glyph]) => `<button type="button" data-dir="${direction}" aria-label="${text(direction)}">${glyph}</button>`).join('')}</div></div><div class="interaction-controls"><div class="zoom-controls">${button('zoom', '−', `data-value="-1" aria-label="${text('zoomOut')}"`)}${button('zoom', '+', `data-value="1" aria-label="${text('zoomIn')}"`)}</div>${button('interact', text('interact'), 'class="interact-button"')}</div></div>${warning()}</div>`; }
  function title() { return `<main class="title-screen"><div class="title-art" aria-hidden="true"></div><header class="title-top"><span class="wordmark">${text('title')}</span>${languagePicker()}</header><div class="title-grid"><section class="title-copy"><p class="eyebrow">${text('edition')}</p><h1>${text('title')}</h1><p class="subtitle">${text('subtitle')}</p><div class="title-actions">${button('start', text(currentSave?.floor > 1 ? 'continue' : 'start', { floor: currentSave?.floor || 1 }), 'class="primary"')}${button('settings', text('settings'))}</div><div class="title-guide">${helpContent()}</div></section><section class="title-records"><p class="eyebrow">${text('records')}</p>${recordContent(currentSave)}${tools()}</section></div><footer class="title-footer"><a href="https://github.com/YuStellarGamesStudio/HiddenShade" target="_blank" rel="noopener noreferrer">${text('source')}</a><span>© YuStellarGamesStudio</span></footer>${warning()}</main>`; }
  function metrics(state) { return `<div class="result-metrics"><div><span>${text('time')}</span><strong>${clock(state?.elapsed)}</strong></div><div><span>${text('detections')}</span><strong>${state?.detections || 0}</strong></div><div><span>${text('hideUses')}</span><strong>${state?.hideUses || 0}</strong></div></div>`; }
  function outcome() {
    const state = data.state || currentState;
    const escaped = screen === 'escaped';
    const rating = data.stars ?? data.rating ?? state?.stars ?? 1;
    const capture = state?.capture;
    const coordinate = point => ({ x: Number(point.x).toFixed(1), y: Number(point.y).toFixed(1) });
    return `<p class="eyebrow">${text('floor')} ${data.floor || state?.floor || currentSave?.floor || 1}</p><h1>${text(escaped ? 'escapedTitle' : 'caughtTitle')}</h1><p>${text(escaped ? 'escapedText' : 'caughtText')}</p>${escaped ? `<div class="result-stars" aria-label="${text('stars')}">${stars(rating)}</div><h3>${text(`rating${rating}`)}</h3>` : capture ? `<div class="capture-details"><strong>${text('guardDetail', { guard: capture.guardId })}</strong>${capture.lastSeen ? `<p>${text('lastSeen', coordinate(capture.lastSeen))}</p>` : ''}${capture.position ? `<p>${text('captureAt', coordinate(capture.position))}</p>` : ''}</div>` : ''}${metrics(state)}<div class="button-row">${button(escaped ? 'next' : 'retry', text(escaped ? 'next' : 'retry', { floor: data.nextFloor || currentSave?.floor || (state?.floor || 1) + 1 }), 'class="primary"')}${escaped ? button('share', text('share')) : ''}${button('title', text('home'))}</div>${escaped ? `<p class="fine-print">${text('scoreThreshold')}</p>` : ''}`;
  }
  function settings() {
    const values = currentSave?.settings || {};
    return `<div class="modal-heading"><div><p class="eyebrow">${text('title')}</p><h1>${text('settings')}</h1></div>${button('back', '×', `aria-label="${text('close')}"`)}</div><div class="settings-grid"><section><h3>${text('language')}</h3>${languagePicker()}<div class="audio-settings">${['music', 'sfx'].map(key => `<label class="toggle-row">${text(key)}<input type="checkbox" data-setting="${key}" ${values[key] !== false ? 'checked' : ''}></label>`).join('')}${['masterVolume', 'musicVolume', 'sfxVolume'].map(key => `<label class="volume-row"><span>${text(key)}</span><input type="range" min="0" max="1" step="0.01" data-setting="${key}" value="${values[key] ?? 0.5}" aria-label="${text(key)}"></label>`).join('')}</div></section><section><h3>${text('controls')}</h3><p class="fine-print">${text('remap')}</p><div class="key-grid">${Object.entries(values.keys || DEFAULT_KEYS).map(([key, code]) => `<label>${text(key === 'pause' ? 'pauseKey' : key)}${button('remap', esc(keyLabel(code)), `data-value="${key}"`)}</label>`).join('')}</div><p class="key-message" role="status"></p></section></div>${tools()}<div class="button-row">${button('back', text('back'), 'class="primary"')}</div>`;
  }
  function importScreen() {
    const preview = data.preview?.save ?? data.preview;
    return `<div class="modal-heading"><h1>${text('importTitle')}</h1>${button('importCancel', '×', `aria-label="${text('close')}"`)}</div><p>${text('importText')}</p><div class="import-grid"><section><label class="file-picker">${text('chooseFile')}<input type="file" id="import-file" accept="application/json,.json"></label><label class="code-label" for="save-code">${text('saveCode')}</label><textarea id="save-code" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="{ … }">${esc(data.code ?? data.raw ?? '')}</textarea>${button('importPreview', text('preview'))}<p class="import-error" role="alert">${data.error ? text(data.error === 'storage' ? 'importFailed' : 'invalidSave') : ''}</p></section><section class="import-summary"><h3>${text('previewTitle')}</h3>${preview?.floor ? `<dl><div><dt>${text('floor')}</dt><dd>${preview.floor}</dd></div><div><dt>${text('bestStars')}</dt><dd class="gold">${stars(preview.stats?.bestStars)}</dd></div><div><dt>${text('escapes')}</dt><dd>${preview.stats?.escapes || 0}</dd></div><div><dt>${text('playTime')}</dt><dd>${clock(preview.stats?.playTime)}</dd></div><div><dt>${text('updated')}</dt><dd>${esc(new Date(preview.updatedAt).toLocaleString(getLanguage() === 'zh' ? 'zh-TW' : getLanguage()))}</dd></div></dl>` : `<p class="fine-print">${text('importText')}</p>`}<p class="backup-note">${text('backup')}</p>${button('importConfirm', text('confirm'), `class="primary" ${preview?.floor ? '' : 'disabled'}`)}</section></div><div class="button-row">${button('importCancel', text('cancel'))}</div>`;
  }
  function show(nextScreen, nextData = {}) {
    if (!['title', 'playing', 'paused', 'caught', 'escaped', 'settings', 'import'].includes(nextScreen)) throw new Error(`Unknown UI screen: ${nextScreen}`);
    if (screen === 'playing' && nextScreen !== 'playing') previousFocus = document.activeElement;
    screen = nextScreen; data = nextData;
    currentSave = data.save || currentSave; currentState = data.state || currentState; remapping = null; mapCache = null;
    root.dataset.screen = screen;
    root.innerHTML = screen === 'title' ? title() : playing();
    if (!['title', 'playing'].includes(screen)) {
      root.querySelector('.play-ui').inert = true;
      const content = screen === 'settings' ? settings() : screen === 'import' ? importScreen() : screen === 'paused' ? `<p class="eyebrow">${text('pause')}</p><h1>${text('pausedTitle')}</h1><p>${text('pausedText')}</p><div class="button-row">${button('resume', text('resume'), 'class="primary"')}${button('settings', text('settings'))}${button('title', text('home'))}</div>${tools()}` : outcome();
      root.insertAdjacentHTML('beforeend', `<div class="modal-backdrop"><section class="modal modal-${screen}" role="dialog" aria-modal="true" aria-label="${text(screen === 'caught' ? 'caughtTitle' : screen === 'escaped' ? 'escapedTitle' : screen === 'import' ? 'importTitle' : screen === 'paused' ? 'pausedTitle' : 'settings')}">${content}${warning()}</section></div>`);
      if (screen === 'settings') {
        const modal = root.querySelector('.modal-settings');
        modal.dataset.settingsTab = settingsTab;
        modal.querySelector('.modal-heading').insertAdjacentHTML('afterend', `<nav class="settings-tabs" aria-label="${text('settings')}">${[['audio', 'language'], ['controls', 'controls'], ['save', 'saveTools']].map(([value, label]) => button('settingsTab', text(label), `data-value="${value}" aria-pressed="${settingsTab === value}"`)).join('')}</nav>`);
      }
      root.querySelector('.modal button:not([disabled])')?.focus({ preventScroll: true });
    } else if (screen === 'playing' && previousFocus) { root.querySelector('[data-action="pause"]')?.focus({ preventScroll: true }); previousFocus = null; }
    update(currentState, currentSave);
  }
  function drawMap(state) {
    const canvas = root.querySelector('#memory-map');
    if (!canvas || !state?.maze || !state.explored) return;
    const { maze, player, explored } = state;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cell = canvas.width / maze.size;
    const exploredCount = explored.reduce((sum, value) => sum + value, 0);
    const signature = `${exploredCount}:${Math.round(player.x)}:${Math.round(player.y)}`;
    if (mapCache?.maze === maze && mapCache.signature === signature) return;
    mapCache = { maze, signature };
    ctx.fillStyle = '#0a1119'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < maze.cells.length; i++) {
      if (!explored[i] || !maze.cells[i]) continue;
      ctx.fillStyle = maze.cells[i] === 3 ? '#edc27e' : maze.cells[i] === 2 ? '#76b9b0' : '#354957';
      ctx.fillRect((i % maze.size) * cell, Math.floor(i / maze.size) * cell, Math.max(1, cell - 1), Math.max(1, cell - 1));
    }
    ctx.fillStyle = '#e3f4ee'; ctx.beginPath(); ctx.arc((player.x + 0.5) * cell, (player.y + 0.5) * cell, Math.max(2, cell / 2), 0, Math.PI * 2); ctx.fill();
  }
  function update(state, save) {
    currentState = state || currentState;
    const changedSave = save && save !== currentSave;
    currentSave = save || currentSave;
    root.dataset.observed = String(Boolean(currentState?.observed));
    const values = { floor: currentState?.floor || data.floor || currentSave?.floor || 1, time: clock(currentState?.elapsed), detections: currentState?.detections || 0, status: t(currentState?.player?.emerging ? 'emerging' : currentState?.player?.hidden ? 'hidden' : currentState?.guards?.some(guard => guard.state === 'chase' || guard.state === 'alert') ? 'alert' : 'safe') };
    root.querySelectorAll('[data-live]').forEach(element => { const value = String(values[element.dataset.live]); if (element.textContent !== value) element.textContent = value; });
    root.querySelectorAll('.storage-warning').forEach(element => { element.hidden = !(storageError || data.storageError || data.saveError); });
    if (changedSave && root.querySelector('#live-records')) root.querySelector('#live-records').innerHTML = recordContent(currentSave);
    drawMap(currentState);
  }
  root.addEventListener('click', event => {
    const element = event.target.closest('[data-action]');
    if (!element || element.disabled) return;
    const action = element.dataset.action;
    if (action === 'interact') return;
    if (root.querySelector('.modal') && !element.closest('.modal')) return;
    if (action === 'settingsTab') {
      settingsTab = element.dataset.value;
      const modal = element.closest('.modal-settings');
      modal.dataset.settingsTab = settingsTab;
      modal.querySelectorAll('[data-action="settingsTab"]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.value === settingsTab)));
      return;
    }
    if (action === 'tab') {
      const side = element.closest('.side-panel');
      side.classList.toggle('expanded', tab !== element.dataset.value || !side.classList.contains('expanded'));
      tab = element.dataset.value;
      root.querySelector('.stats-tab').hidden = tab !== 'stats'; root.querySelector('.help-tab').hidden = tab !== 'help';
      root.querySelectorAll('[data-action="tab"]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.value === tab))); return;
    }
    if (action === 'remap') { remapping = element.dataset.value; root.querySelector('.key-message').textContent = t('pressKey'); return; }
    if (action === 'importOpen') { actions('importPreview', ''); return; }
    if (action === 'language') { actions('language', element.dataset.value); return; }
    if (action === 'zoom') { actions('zoom', Number(element.dataset.value)); return; }
    if (action === 'importPreview') { actions('importPreview', root.querySelector('#save-code')?.value || ''); return; }
    actions(action);
  }, options);
  root.addEventListener('change', async event => {
    if (event.target.id === 'import-file') {
      const file = event.target.files?.[0];
      if (!file) return;
      try { const raw = await file.text(); const field = root.querySelector('#save-code'); if (field) field.value = raw; actions('importPreview', raw); }
      catch { const message = root.querySelector('.import-error'); if (message) message.textContent = t('invalidSave'); }
      return;
    }
    const key = event.target.dataset.setting;
    if (key) actions('setting', { key, value: event.target.type === 'checkbox' ? event.target.checked : Number(event.target.value) });
  }, options);
  root.addEventListener('input', event => {
    if (event.target.type === 'range' && event.target.dataset.setting) actions('setting', { key: event.target.dataset.setting, value: Number(event.target.value) });
  }, options);
  window.addEventListener('keydown', event => {
    if (remapping) {
      event.preventDefault(); event.stopImmediatePropagation();
      const keys = { ...(currentSave?.settings?.keys || DEFAULT_KEYS) };
      if (Object.entries(keys).some(([key, value]) => key !== remapping && value === event.code)) { root.querySelector('.key-message').textContent = t('duplicateKey'); return; }
      if (!/^(Key[A-Z]|Digit[0-9]|Arrow(Up|Down|Left|Right)|Space|Escape|Enter|Tab|Backspace|Shift(Left|Right)|Control(Left|Right)|Alt(Left|Right)|Bracket(Left|Right)|Semicolon|Quote|Comma|Period|Slash|Backslash|Minus|Equal|Backquote)$/.test(event.code)) return;
      keys[remapping] = event.code; remapping = null; actions('setting', { key: 'keys', value: keys });
      show('settings', { ...data, save: { ...currentSave, settings: { ...currentSave.settings, keys } } }); return;
    }
    const modal = root.querySelector('.modal');
    if (modal && event.key === 'Tab') {
      const items = [...modal.querySelectorAll('button:not([disabled]), input, textarea, select')];
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }, { ...options, capture: true });
  window.addEventListener('hiddenshade:language', () => show(screen, { ...data, save: currentSave, state: currentState, raw: root.querySelector('#save-code')?.value ?? data.raw }), options);
  show('title');
  return { show, update, destroy() { controller.abort(); root.replaceChildren(); } };
}
