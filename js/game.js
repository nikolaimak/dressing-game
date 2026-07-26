// Game: scene assembly, tray UI, dressing, painting and room decorating.

import { INK, PAPER, stroke, ellipsePts, uid, recolour } from './marker.js';
import { VB, body } from './figures.js';
import { CATALOG, SLOTS, SLOT_ORDER, findItem } from './wardrobe.js';
import { SCENE, WALL_PATTERNS, FLOOR_PATTERNS, DECOR, findDecor } from './decor.js';
import { COLOURS, ROOM_THEMES, themeById, randomColour, contrastInk, isDark, hexToHsl, hslToHex } from './colours.js';

const STORE_KEY = 'marker-dressup-v2';
const FIGURE_SCALE = 0.9;
const FIGURE_X = { lady: 300, gent: 660 };
const FEET_Y = 470;

const KIND_LABEL = { lady: 'Lady', gent: 'Gentleman' };

// On a dark wall or floor the drawing flips to chalk-on-blackboard so that
// unpainted (plain ink) figures and decorations stay readable.
const CHALK = '#f4f1e6';
const DARK_PAPER = '#22242f';

function skin(markup, background) {
  return isDark(background) ? markup.split(INK).join(CHALK).split(PAPER).join(DARK_PAPER) : markup;
}

/** Tray thumbnails follow the app theme, not the room. */
function traySkin(markup) {
  return state.ui === 'dark' ? skin(markup, '#000000') : markup;
}

const emptyLook = () => ({ outfit: null, head: null, neck: null, hands: null, feet: null, extra: null });

const state = {
  tab: 'lady',
  slot: 'outfit',
  theme: 'paper',
  wallColor: ROOM_THEMES[0].wall,
  floorColor: ROOM_THEMES[0].floor,
  wall: 'plain',
  floor: 'plain',
  looks: { lady: emptyLook(), gent: emptyLook() },
  tints: { lady: emptyLook(), gent: emptyLook() },
  decor: [],
  selectedDecor: null,
  ui: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  mixer: null,
  mix: { h: 210, s: 70, l: 50 },
};

const $ = (sel) => document.querySelector(sel);
const svg = $('#scene');
const tray = $('#tray');
const tabsEl = $('#tabs');
const hintEl = $('#hint');

/* ------------------------------------------------------------------ state */

/** Paint for one worn garment: its own colour, falling back to plain ink. */
function paintFor(kind, slot) {
  return { fill: state.tints[kind][slot] || INK, ink: INK };
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {
    /* storage unavailable — the game still works */
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    Object.assign(state, data, {
      looks: {
        lady: { ...emptyLook(), ...(data.looks?.lady || {}) },
        gent: { ...emptyLook(), ...(data.looks?.gent || {}) },
      },
      tints: {
        lady: { ...emptyLook(), ...(data.tints?.lady || {}) },
        gent: { ...emptyLook(), ...(data.tints?.gent || {}) },
      },
      decor: Array.isArray(data.decor) ? data.decor : [],
    });
    state.tab = data.tab === 'room' || data.tab === 'gent' ? data.tab : 'lady';
  } catch (e) {
    /* ignore corrupt saves */
  }
}

/* ------------------------------------------------------------------ scene */

function figureSvg(kind) {
  let inner = body(kind);
  for (const slot of SLOT_ORDER) {
    const id = state.looks[kind][slot];
    if (!id) continue;
    const item = findItem(kind, slot, id);
    if (item) inner += item.draw(paintFor(kind, slot));
  }
  const tx = FIGURE_X[kind] - (VB.w / 2) * FIGURE_SCALE;
  const ty = FEET_Y - 414 * FIGURE_SCALE;
  return `<g class="figure" data-kind="${kind}" transform="translate(${tx} ${ty}) scale(${FIGURE_SCALE})">${skin(inner, state.wallColor)}
    <rect x="0" y="-40" width="${VB.w}" height="${VB.h + 20}" fill="transparent"/></g>`;
}

function decorSvg() {
  return state.decor
    .map((d) => {
      const def = findDecor(d.id);
      if (!def) return '';
      const bg = d.y > SCENE.floorY ? state.floorColor : state.wallColor;
      return `<g class="decor" data-uid="${d.uid}" transform="translate(${d.x} ${d.y})">${skin(recolour(def.draw(), d.color), bg)}
        <rect x="${def.box[0]}" y="${def.box[1]}" width="${def.box[2]}" height="${def.box[3]}" fill="transparent"/></g>`;
    })
    .join('');
}

function selectionSvg() {
  const ink = contrastInk(state.wallColor);
  if (state.tab === 'room') {
    const sel = state.decor.find((d) => d.uid === state.selectedDecor);
    if (!sel) return '';
    const def = findDecor(sel.id);
    if (!def) return '';
    return `<g id="pick" pointer-events="none"><rect x="${sel.x + def.box[0] - 6}" y="${sel.y + def.box[1] - 6}"
      width="${def.box[2] + 12}" height="${def.box[3] + 12}" rx="16" fill="none" stroke="${ink}"
      stroke-width="4" stroke-dasharray="13 11" opacity="0.6"/></g>`;
  }
  const x = FIGURE_X[state.tab];
  const floorInk = contrastInk(state.floorColor);
  return `<g id="pick" pointer-events="none">
    ${stroke(ellipsePts(x, FEET_Y + 10, 92, 20, 22), { w: 5, closed: true, seed: 1211, color: floorInk, opacity: 0.55 })}
    <text x="${x}" y="${FEET_Y + 62}" text-anchor="middle" font-size="24"
      font-family="Comic Sans MS, Chalkboard SE, Segoe Print, sans-serif" fill="${floorInk}" opacity="0.55">${KIND_LABEL[state.tab]}</text>
  </g>`;
}

function renderScene() {
  const wall = WALL_PATTERNS.find((w) => w.id === state.wall) || WALL_PATTERNS[0];
  const floor = FLOOR_PATTERNS.find((f) => f.id === state.floor) || FLOOR_PATTERNS[0];
  const wallInk = contrastInk(state.wallColor);
  const floorInk = contrastInk(state.floorColor);
  const shadow = ['lady', 'gent']
    .map(
      (k) =>
        `<ellipse cx="${FIGURE_X[k]}" cy="${FEET_Y + 8}" rx="86" ry="15" fill="${floorInk}" opacity="0.12"/>`
    )
    .join('');

  svg.innerHTML = `
    <rect x="0" y="0" width="${SCENE.w}" height="${SCENE.floorY}" fill="${state.wallColor}"/>
    <rect x="0" y="${SCENE.floorY}" width="${SCENE.w}" height="${SCENE.h - SCENE.floorY}" fill="${state.floorColor}"/>
    <g opacity="0.9">${wall.draw(wallInk)}</g>
    <g opacity="0.9">${floor.draw(floorInk)}</g>
    ${stroke([[0, SCENE.floorY], [SCENE.w, SCENE.floorY]], { w: 7, seed: 1201, color: floorInk })}
    <g id="decorLayer">${decorSvg()}</g>
    ${shadow}
    ${figureSvg('lady')}
    ${figureSvg('gent')}
    ${selectionSvg()}
    ${stroke(
      [
        [6, 6],
        [SCENE.w - 6, 6],
        [SCENE.w - 6, SCENE.h - 6],
        [6, SCENE.h - 6],
      ],
      { w: 8, closed: true, seed: 1203, color: wallInk }
    )}
  `;
}

/* -------------------------------------------------------------------- UI */

function itemPreview(item, P) {
  const [x, y, w, h] = item.preview;
  return `<svg class="thumb" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true">${traySkin(item.draw(P))}</svg>`;
}

function decorPreview(def, colour) {
  const [x, y, w, h] = def.box;
  return `<svg class="thumb" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true">${traySkin(recolour(def.draw(), colour))}</svg>`;
}

function renderTabs() {
  tabsEl.innerHTML = [
    { id: 'lady', label: '👒 Lady' },
    { id: 'gent', label: '🎩 Gentleman' },
    { id: 'room', label: '🏠 Room' },
  ]
    .map((t) => `<button class="tab${state.tab === t.id ? ' on' : ''}" data-tab="${t.id}">${t.label}</button>`)
    .join('');
}

/** What the paint swatches currently colour. */
function paintTarget() {
  if (state.tab === 'room') {
    const sel = state.decor.find((d) => d.uid === state.selectedDecor);
    if (!sel) return null;
    const def = findDecor(sel.id);
    return { name: def ? def.name : 'Decoration', colour: sel.color || INK };
  }
  const id = state.looks[state.tab][state.slot];
  if (!id) return null;
  const item = findItem(state.tab, state.slot, id);
  return item ? { name: item.name, colour: state.tints[state.tab][state.slot] || INK } : null;
}

function paintPanel() {
  const target = paintTarget();
  const empty = state.tab === 'room' ? 'Tap a decoration to paint it' : 'Put something on to paint it';
  const current = target ? target.colour.toLowerCase() : INK;
  const dots = COLOURS.map(
    (c) =>
      `<button class="dot${current === c.hex.toLowerCase() ? ' on' : ''}" data-paint="${c.hex}"
        style="background:${c.hex}" title="${c.name}" aria-label="${c.name}"></button>`
  ).join('');
  return `<div class="paint${target ? '' : ' off'}">
    <div class="paint-head">
      <span class="paint-label">${target ? `🖌 ${target.name}` : `🖌 ${empty}`}</span>
      ${mixButton('item', current, target ? '' : 'disabled')}
    </div>
    <div class="dots">${dots}</div>
    ${mixerPanel('item', current)}
  </div>`;
}

/** Button that opens the colour mixer for a target. */
function mixButton(target, colour, disabled = '') {
  const open = state.mixer === target;
  return `<button class="mix-open${open ? ' on' : ''}" data-mixopen="${target}" ${disabled}
    aria-expanded="${open}" title="Mix your own colour">
    <span class="mix-swatch" style="background:${colour}"></span><span class="mix-plus">${open ? '×' : '+'}</span></button>`;
}

/** Hue / strength / lightness rails, rendered inline so they can never fall off screen. */
function mixerPanel(target, colour) {
  if (state.mixer !== target) return '';
  const { h, s, l } = state.mix;
  const hex = hslToHex(h, s, l);
  const rail = (axis, label, min, max, value, gradient) =>
    `<label class="mix-row"><span>${label}</span>
      <input type="range" class="rail" data-mix="${axis}" min="${min}" max="${max}" value="${value}"
        style="background:${gradient}" aria-label="${label}" /></label>`;
  return `<div class="mixer" data-mixer="${target}">
    <div class="mix-top">
      <span class="mix-chip" style="background:${hex}"></span>
      <code class="mix-hex">${hex}</code>
      <button class="mix-done" data-mixclose="1">Done</button>
    </div>
    ${rail('h', 'Colour', 0, 359, h, 'linear-gradient(to right,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)')}
    ${rail('s', 'Strength', 0, 100, s, `linear-gradient(to right,${hslToHex(h, 0, l)},${hslToHex(h, 100, l)})`)}
    ${rail('l', 'Light', 4, 96, l, `linear-gradient(to right,#000000,${hslToHex(h, s, 50)},#ffffff)`)}
  </div>`;
}

/** Replace the tray contents without losing the reader's place. */
function setTray(html) {
  const top = tray.scrollTop;
  tray.innerHTML = html;
  tray.scrollTop = top;
}

function renderTray() {
  if (state.mixer === 'item' && !paintTarget()) state.mixer = null;
  if (state.tab === 'room') return renderRoomTray();
  const kind = state.tab;
  const chips = SLOTS.map(
    (s) => `<button class="chip${state.slot === s.id ? ' on' : ''}" data-slot="${s.id}">${s.icon} ${s.name}</button>`
  ).join('');
  const items = CATALOG[kind][state.slot]
    .map((item) => {
      const on = state.looks[kind][state.slot] === item.id;
      const P = on ? paintFor(kind, state.slot) : { fill: INK, ink: INK };
      return `<button class="card${on ? ' on' : ''}" draggable="true" data-item="${item.id}" data-slot="${item.slot}" data-kind="${kind}">
        ${itemPreview(item, P)}<span>${item.name}</span></button>`;
    })
    .join('');
  setTray(`<div class="chips">${chips}</div>${paintPanel()}<div class="grid">${items}</div>`);
  hintEl.textContent = `Tap a piece to dress the ${KIND_LABEL[kind].toLowerCase()} — tap again to take it off.`;
}

function renderRoomTray() {
  if (state.mixer === 'item' && !paintTarget()) state.mixer = null;
  const themes = ROOM_THEMES.map(
    (t) =>
      `<button class="swatch${state.theme === t.id ? ' on' : ''}" data-theme="${t.id}" title="${t.name}">
        <span style="background:${t.wall}"></span><span style="background:${t.floor}"></span></button>`
  ).join('');
  const walls = WALL_PATTERNS.map(
    (w) => `<button class="chip${state.wall === w.id ? ' on' : ''}" data-wall="${w.id}">${w.name}</button>`
  ).join('');
  const floors = FLOOR_PATTERNS.map(
    (f) => `<button class="chip${state.floor === f.id ? ' on' : ''}" data-floor="${f.id}">${f.name}</button>`
  ).join('');
  const decor = DECOR.map((d) => {
    const placed = state.decor.find((x) => x.id === d.id);
    return `<button class="card${placed ? ' on' : ''}${placed && placed.uid === state.selectedDecor ? ' sel' : ''}" data-decor="${d.id}">
      ${decorPreview(d, placed ? placed.color : null)}<span>${d.name}</span></button>`;
  }).join('');
  setTray(`
    <div class="section"><h3>Room theme</h3><div class="swatches">${themes}</div>
      <div class="surface-row">
        <span class="surface">Wall ${mixButton('wall', state.wallColor)}</span>
        <span class="surface">Floor ${mixButton('floor', state.floorColor)}</span>
      </div>
      ${mixerPanel('wall', state.wallColor)}${mixerPanel('floor', state.floorColor)}
    </div>
    <div class="section"><h3>Wall pattern</h3><div class="chips">${walls}</div></div>
    <div class="section"><h3>Floor pattern</h3><div class="chips">${floors}</div></div>
    ${paintPanel()}
    <div class="section"><h3>Decorations</h3><div class="grid">${decor}</div></div>`);
  hintEl.textContent = 'Tap to add decorations, drag them around, tap one to paint it, tap it twice to take it away.';
}

function renderAll() {
  renderTabs();
  renderTray();
  renderScene();
}

/* ---------------------------------------------------------------- actions */

function wear(kind, slot, id) {
  const off = state.looks[kind][slot] === id;
  state.looks[kind][slot] = off ? null : id;
  if (off) state.tints[kind][slot] = null;
  save();
  renderTray();
  renderScene();
}

function paint(colour, quiet = false) {
  if (state.tab === 'room') {
    const sel = state.decor.find((d) => d.uid === state.selectedDecor);
    if (!sel) return;
    sel.color = colour === INK ? null : colour;
  } else {
    if (!state.looks[state.tab][state.slot]) return;
    state.tints[state.tab][state.slot] = colour === INK ? null : colour;
  }
  save();
  if (!quiet) renderTray();
  renderScene();
}

function applyMix(hex, quiet) {
  if (state.mixer === 'wall') {
    state.wallColor = hex;
    state.theme = null;
    save();
    if (!quiet) renderTray();
    renderScene();
    return;
  }
  if (state.mixer === 'floor') {
    state.floorColor = hex;
    state.theme = null;
    save();
    if (!quiet) renderTray();
    renderScene();
    return;
  }
  paint(hex, quiet);
}

function currentColourOf(target) {
  if (target === 'wall') return state.wallColor;
  if (target === 'floor') return state.floorColor;
  const t = paintTarget();
  return t ? t.colour : INK;
}

function rectOf(def, x, y) {
  return { x: x + def.box[0], y: y + def.box[1], w: def.box[2], h: def.box[3] };
}

function overlapArea(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

const figureRects = () => ['lady', 'gent'].map((k) => ({ x: FIGURE_X[k] - 96, y: 110, w: 192, h: 366 }));

/** Find the tidiest spot near a decoration's home position. */
function freeSpot(def, placed) {
  const taken = placed
    .map((d) => {
      const other = findDecor(d.id);
      return other ? rectOf(other, d.x, d.y) : null;
    })
    .filter(Boolean);
  const figures = figureRects();
  const anchored = def.at[1] >= 380 || def.at[1] <= 60;
  const dxs = [0, -120, 120, -240, 240, -360, 360, -480, 480, -600, 600];
  const dys = anchored ? [0] : [0, -70, 70, -150, 150];
  let best = null;
  for (const dy of dys) {
    for (const dx of dxs) {
      const x = def.at[0] + dx;
      const y = def.at[1] + dy;
      const r = rectOf(def, x, y);
      if (r.x < 4 || r.x + r.w > SCENE.w - 4) continue;
      if (r.y < -12 || r.y + r.h > SCENE.h + 24) continue;
      let clash = 0;
      for (const t of taken) clash += overlapArea(r, t);
      if (clash === 0 && dx === 0 && dy === 0) return { x, y };
      let score = clash;
      for (const f of figures) score += overlapArea(r, f) * 0.5;
      score += (Math.abs(dx) + Math.abs(dy)) * 14;
      if (!best || score < best.score) best = { score, x, y };
    }
  }
  return best ? { x: best.x, y: best.y } : { x: def.at[0], y: def.at[1] };
}

function addDecor(id) {
  const def = findDecor(id);
  if (!def) return;
  const placed = state.decor.find((d) => d.id === id);
  if (placed) return removeDecor(placed.uid);
  const spot = freeSpot(def, state.decor);
  const entry = { uid: uid('d'), id, x: spot.x, y: spot.y, color: null };
  state.decor.push(entry);
  state.selectedDecor = entry.uid;
  save();
  renderTray();
  renderScene();
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function setTheme(id) {
  const t = themeById(id);
  state.theme = t.id;
  state.wallColor = t.wall;
  state.floorColor = t.floor;
}

function surprise() {
  for (const kind of ['lady', 'gent']) {
    for (const slot of Object.keys(state.looks[kind])) {
      const list = CATALOG[kind][slot];
      const skip = (slot === 'extra' && Math.random() < 0.4) || (slot === 'neck' && Math.random() < 0.25);
      state.looks[kind][slot] = skip ? null : pick(list).id;
      state.tints[kind][slot] = skip || Math.random() < 0.25 ? null : randomColour();
    }
  }
  setTheme(pick(ROOM_THEMES).id);
  state.wall = pick(WALL_PATTERNS).id;
  state.floor = pick(FLOOR_PATTERNS).id;
  const shuffled = [...DECOR].sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 3));
  state.decor = [];
  for (const d of shuffled) {
    const spot = freeSpot(d, state.decor);
    state.decor.push({ uid: uid('d'), id: d.id, x: spot.x, y: spot.y, color: Math.random() < 0.6 ? randomColour() : null });
  }
  state.selectedDecor = null;
  save();
  renderAll();
}

function rainbow() {
  for (const kind of ['lady', 'gent']) {
    for (const slot of Object.keys(state.looks[kind])) {
      if (state.looks[kind][slot]) state.tints[kind][slot] = randomColour(state.tints[kind][slot]);
    }
  }
  for (const d of state.decor) d.color = randomColour(d.color);
  save();
  renderTray();
  renderScene();
}

function clearCurrent() {
  if (state.tab === 'room') {
    state.decor = [];
    state.selectedDecor = null;
  } else {
    state.looks[state.tab] = emptyLook();
    state.tints[state.tab] = emptyLook();
  }
  save();
  renderTray();
  renderScene();
}

const SHOT_NAME = 'dressing-game.png';

function sceneMarkup() {
  const clone = svg.cloneNode(true);
  clone.querySelector('#pick')?.remove();
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', SCENE.w * 2);
  clone.setAttribute('height', SCENE.h * 2);
  return new XMLSerializer().serializeToString(clone);
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error('could not decode the drawing'));
    img.src = src;
  });
}

async function sceneToCanvas() {
  const markup = sceneMarkup();
  let img;
  // WebKit has long been unreliable about SVG served from a blob URL in an
  // <img>, so try a data URL first and keep the blob URL as the fallback.
  try {
    img = await loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup));
  } catch (e) {
    const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      img = await loadImage(url);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  const canvas = document.createElement('canvas');
  canvas.width = SCENE.w * 2;
  canvas.height = SCENE.h * 2;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((res, rej) => {
    if (!canvas.toBlob) return rej(new Error('this browser cannot make a PNG'));
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('this browser cannot make a PNG'))), 'image/png');
  });
}

let toastTimer = null;

function toast(message, action) {
  const el = $('#toast');
  el.innerHTML = `<span>${message}</span>`;
  if (action) {
    const btn = document.createElement('button');
    btn.textContent = action.label;
    btn.addEventListener('click', action.run);
    el.append(btn);
  }
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, action ? 8000 : 2600);
}

let shotUrl = null;

/** How you save on a tablet: show the picture so it can be pressed and held. */
function showPicture(src) {
  $('#shot-tip').innerHTML = matchMedia('(any-pointer: coarse)').matches
    ? 'Press and hold the picture, then <b>save it to your photos</b>.'
    : 'Right-click the picture and choose <b>Save image as…</b>';
  $('#shot-img').src = src;
  $('#shot').hidden = false;
}

function closePicture() {
  $('#shot').hidden = true;
  $('#shot-img').removeAttribute('src');
}

async function savePicture() {
  let canvas;
  try {
    canvas = await sceneToCanvas();
  } catch (err) {
    toast(`Sorry — ${err.message}.`);
    return;
  }

  const touch = matchMedia('(any-pointer: coarse)').matches;

  if (touch) {
    // Safari on iOS and Chrome on Android can hand the file to the system share
    // sheet, which is where "Save Image" lives.
    try {
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], SHOT_NAME, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'The Dressing Game' });
        return;
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      // no file sharing (Chrome on iPad, older iOS) — show the picture instead
    }
    // A data URL, not a blob URL: WKWebView, which every iPad browser is built
    // on, will not reliably save a blob-backed image from press-and-hold.
    showPicture(pngSource(canvas));
    return;
  }

  let blob;
  try {
    blob = await canvasToBlob(canvas);
  } catch (err) {
    showPicture(pngSource(canvas));
    return;
  }
  if (shotUrl) URL.revokeObjectURL(shotUrl);
  shotUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = shotUrl;
  a.download = SHOT_NAME;
  a.rel = 'noopener';
  document.body.append(a);
  a.click();
  a.remove();
  toast('Picture saved 💾', { label: 'Show it', run: () => showPicture(shotUrl) });
}

function pngSource(canvas) {
  try {
    return canvas.toDataURL('image/png');
  } catch (err) {
    if (shotUrl) URL.revokeObjectURL(shotUrl);
    shotUrl = URL.createObjectURL(new Blob([sceneMarkup()], { type: 'image/svg+xml;charset=utf-8' }));
    return shotUrl;
  }
}

/* ----------------------------------------------------------------- events */

tabsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-tab]');
  if (!btn) return;
  state.tab = btn.dataset.tab;
  state.mixer = null;
  save();
  renderAll();
});

tray.addEventListener('click', (e) => {
  if (e.target.closest('[data-mixclose]')) {
    state.mixer = null;
    renderTray();
    return;
  }
  const opener = e.target.closest('[data-mixopen]');
  if (opener) {
    const target = opener.dataset.mixopen;
    state.mixer = state.mixer === target ? null : target;
    if (state.mixer) {
      const cur = currentColourOf(target);
      // A plain-ink item would open the rails at near-black, where moving the
      // hue does nothing visible. Start from a usable colour instead, and apply
      // it straight away so the swatch, the rails and the drawing agree.
      state.mix = cur.toLowerCase() === INK ? { h: state.mix.h, s: 75, l: 50 } : hexToHsl(cur);
      applyMix(hslToHex(state.mix.h, state.mix.s, state.mix.l), true);
    }
    renderTray();
    return;
  }
  const swatch = e.target.closest('[data-paint]');
  if (swatch) {
    if (state.mixer) state.mix = hexToHsl(swatch.dataset.paint);
    return paint(swatch.dataset.paint);
  }

  const slotBtn = e.target.closest('[data-slot]:not([data-item])');
  if (slotBtn) {
    state.slot = slotBtn.dataset.slot;
    state.mixer = null;
    renderTray();
    return;
  }
  const card = e.target.closest('[data-item]');
  if (card) return wear(card.dataset.kind, card.dataset.slot, card.dataset.item);

  const dec = e.target.closest('[data-decor]');
  if (dec) return addDecor(dec.dataset.decor);

  const theme = e.target.closest('[data-theme]');
  if (theme) {
    setTheme(theme.dataset.theme);
    save();
    renderTray();
    renderScene();
    return;
  }
  const wall = e.target.closest('[data-wall]');
  if (wall) {
    state.wall = wall.dataset.wall;
    save();
    renderTray();
    renderScene();
    return;
  }
  const floor = e.target.closest('[data-floor]');
  if (floor) {
    state.floor = floor.dataset.floor;
    save();
    renderTray();
    renderScene();
  }
});

tray.addEventListener('input', (e) => {
  const rail = e.target.closest('[data-mix]');
  if (!rail) return;
  state.mix[rail.dataset.mix] = Number(rail.value);
  const { h, s: sat, l } = state.mix;
  const hex = hslToHex(h, sat, l);
  applyMix(hex, true);
  const box = rail.closest('.mixer');
  box.querySelector('.mix-chip').style.background = hex;
  box.querySelector('.mix-hex').textContent = hex;
  box.querySelector('[data-mix="s"]').style.background = `linear-gradient(to right,${hslToHex(h, 0, l)},${hslToHex(h, 100, l)})`;
  box.querySelector('[data-mix="l"]').style.background = `linear-gradient(to right,#000000,${hslToHex(h, sat, 50)},#ffffff)`;
  const opener = tray.querySelector(`[data-mixopen="${box.dataset.mixer}"] .mix-swatch`);
  if (opener) opener.style.background = hex;
});

// once a rail is released, refresh the swatches and thumbnails
tray.addEventListener('change', (e) => {
  if (e.target.closest('[data-mix]')) renderTray();
});

// drag a card from the tray onto the scene
tray.addEventListener('dragstart', (e) => {
  const card = e.target.closest('[data-item]');
  if (!card) return;
  e.dataTransfer.setData(
    'text/plain',
    JSON.stringify({ kind: card.dataset.kind, slot: card.dataset.slot, id: card.dataset.item })
  );
  e.dataTransfer.effectAllowed = 'copy';
});

svg.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});

svg.addEventListener('drop', (e) => {
  e.preventDefault();
  try {
    const { kind, slot, id } = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (state.looks[kind][slot] !== id) wear(kind, slot, id);
  } catch (err) {
    /* not our payload */
  }
});

function svgPoint(evt) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

/** Topmost decoration under a scene point — works even behind a figure. */
function decorAt(p) {
  for (let i = state.decor.length - 1; i >= 0; i--) {
    const d = state.decor[i];
    const def = findDecor(d.id);
    if (!def) continue;
    const r = rectOf(def, d.x, d.y);
    if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return d;
  }
  return null;
}

/** In Room mode decorations win the click; otherwise the figures do. */
function targetAt(evt) {
  const fig = evt.target.closest('.figure');
  if (state.tab === 'room') {
    const d = decorAt(svgPoint(evt));
    return d ? { decor: d } : { figure: fig };
  }
  if (fig) return { figure: fig };
  const d = decorAt(svgPoint(evt));
  return d ? { decor: d } : {};
}

let drag = null;
let lastTap = { uid: null, time: 0 };

function removeDecor(uid) {
  state.decor = state.decor.filter((d) => d.uid !== uid);
  if (state.selectedDecor === uid) state.selectedDecor = null;
  lastTap = { uid: null, time: 0 };
  save();
  renderTray();
  renderScene();
}

svg.addEventListener('pointerdown', (e) => {
  const hit = targetAt(e);
  if (hit.decor) {
    if (state.selectedDecor !== hit.decor.uid) {
      state.selectedDecor = hit.decor.uid;
      save();
      renderTray();
      renderScene();
    }
    const el = svg.querySelector(`.decor[data-uid="${hit.decor.uid}"]`);
    if (!el) return;
    const p = svgPoint(e);
    drag = { el, entry: hit.decor, dx: p.x - hit.decor.x, dy: p.y - hit.decor.y, moved: false };
    el.classList.add('dragging');
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
    return;
  }
  if (hit.figure && state.tab !== hit.figure.dataset.kind) {
    state.tab = hit.figure.dataset.kind;
    state.mixer = null;
    save();
    renderAll();
  }
});

svg.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const p = svgPoint(e);
  const x = Math.max(-60, Math.min(SCENE.w + 60, p.x - drag.dx));
  const y = Math.max(-40, Math.min(SCENE.h + 40, p.y - drag.dy));
  drag.entry.x = x;
  drag.entry.y = y;
  drag.moved = true;
  drag.el.setAttribute('transform', `translate(${Math.round(x)} ${Math.round(y)})`);
  const pickEl = svg.querySelector('#pick rect');
  if (pickEl) {
    const def = findDecor(drag.entry.id);
    pickEl.setAttribute('x', x + def.box[0] - 6);
    pickEl.setAttribute('y', y + def.box[1] - 6);
  }
});

function endDrag(e) {
  if (!drag) return;
  const { entry, moved } = drag;
  drag.el.classList.remove('dragging');
  drag = null;
  if (e && svg.hasPointerCapture?.(e.pointerId)) svg.releasePointerCapture(e.pointerId);
  if (moved) {
    lastTap = { uid: null, time: 0 };
    save();
    return;
  }
  // Double tap on the spot takes a decoration away. Detected by hand because
  // pointerdown calls preventDefault (to drag), which suppresses dblclick.
  const now = Date.now();
  if (lastTap.uid === entry.uid && now - lastTap.time < 450) return removeDecor(entry.uid);
  lastTap = { uid: entry.uid, time: now };
}
svg.addEventListener('pointerup', endDrag);
svg.addEventListener('pointercancel', endDrag);

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Delete' && e.key !== 'Backspace') return;
  if (state.tab !== 'room' || !state.selectedDecor) return;
  if (/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || '')) return;
  e.preventDefault();
  removeDecor(state.selectedDecor);
});

function applyUiTheme() {
  document.documentElement.dataset.ui = state.ui;
  const btn = $('#btn-theme');
  btn.querySelector('.ico').textContent = state.ui === 'dark' ? '☀️' : '🌙';
  btn.querySelector('.label').textContent = state.ui === 'dark' ? 'Light' : 'Dark';
}

$('#btn-theme').addEventListener('click', () => {
  state.ui = state.ui === 'dark' ? 'light' : 'dark';
  applyUiTheme();
  save();
  renderTray();
});

$('#btn-rainbow').addEventListener('click', rainbow);
$('#btn-surprise').addEventListener('click', surprise);
$('#btn-clear').addEventListener('click', clearCurrent);
$('#btn-save').addEventListener('click', savePicture);
$('#shot-close').addEventListener('click', closePicture);
$('#shot').addEventListener('click', (e) => {
  if (e.target.id === 'shot') closePicture();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('#shot').hidden) closePicture();
});

/* ------------------------------------------------------------------ start */

load();
applyUiTheme();
if (!state.looks.lady.outfit && !state.looks.gent.outfit && !state.decor.length) {
  state.looks.lady = { ...emptyLook(), outfit: 'ball-gown', head: 'spike-crown', neck: 'bead-loop', feet: 'heels' };
  state.looks.gent = { ...emptyLook(), outfit: 'tailcoat', head: 'top-hat', neck: 'bow-tie', feet: 'buckle-shoes', extra: 'cane' };
  state.decor = [];
  for (const id of ['chandelier', 'window', 'portrait', 'rug']) {
    const def = findDecor(id);
    state.decor.push({ uid: uid('d'), id, x: def.at[0], y: def.at[1], color: null });
  }
}
renderAll();
