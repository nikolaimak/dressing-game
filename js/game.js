// Game: scene assembly, tray UI, dressing + room decorating.

import { INK, stroke, ellipsePts, uid } from './marker.js';
import { VB, body } from './figures.js';
import { CATALOG, SLOTS, SLOT_ORDER, findItem } from './wardrobe.js';
import { SCENE, PALETTES, WALL_PATTERNS, FLOOR_PATTERNS, DECOR, findDecor } from './decor.js';

const STORE_KEY = 'marker-dressup-v1';
const FIGURE_SCALE = 0.9;
const FIGURE_X = { lady: 300, gent: 660 };
const FEET_Y = 470;

const KIND_LABEL = { lady: 'Lady', gent: 'Gentleman' };

const emptyLook = () => ({ outfit: null, head: null, neck: null, hands: null, feet: null, extra: null });

const state = {
  tab: 'lady',
  slot: 'outfit',
  colour: false,
  palette: 'paper',
  wall: 'plain',
  floor: 'plain',
  looks: { lady: emptyLook(), gent: emptyLook() },
  decor: [],
};

const $ = (sel) => document.querySelector(sel);
const svg = $('#scene');
const tray = $('#tray');
const tabsEl = $('#tabs');
const hintEl = $('#hint');

/* ------------------------------------------------------------------ state */

function palette() {
  return PALETTES.find((p) => p.id === state.palette) || PALETTES[0];
}

function paint() {
  const p = palette();
  return { fill: state.colour ? p.tint : INK, ink: INK };
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {
    /* storage unavailable — game still works */
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    Object.assign(state, {
      ...state,
      ...data,
      looks: { lady: { ...emptyLook(), ...(data.looks?.lady || {}) }, gent: { ...emptyLook(), ...(data.looks?.gent || {}) } },
      decor: Array.isArray(data.decor) ? data.decor : [],
    });
    state.tab = data.tab === 'room' || data.tab === 'gent' ? data.tab : 'lady';
  } catch (e) {
    /* ignore corrupt saves */
  }
}

/* ------------------------------------------------------------------ scene */

function figureSvg(kind) {
  const P = paint();
  let inner = body(kind);
  for (const slot of SLOT_ORDER) {
    const id = state.looks[kind][slot];
    if (!id) continue;
    const item = findItem(kind, slot, id);
    if (item) inner += item.draw(P);
  }
  const tx = FIGURE_X[kind] - (VB.w / 2) * FIGURE_SCALE;
  const ty = FEET_Y - 414 * FIGURE_SCALE;
  return `<g class="figure" data-kind="${kind}" transform="translate(${tx} ${ty}) scale(${FIGURE_SCALE})">${inner}
    <rect x="0" y="-40" width="${VB.w}" height="${VB.h + 20}" fill="transparent"/></g>`;
}

function decorSvg() {
  return state.decor
    .map((d) => {
      const def = findDecor(d.id);
      if (!def) return '';
      return `<g class="decor" data-uid="${d.uid}" transform="translate(${d.x} ${d.y})">${def.draw()}
        <rect x="${def.box[0]}" y="${def.box[1]}" width="${def.box[2]}" height="${def.box[3]}" fill="transparent"/></g>`;
    })
    .join('');
}

function selectionSvg() {
  if (state.tab === 'room') return '';
  const x = FIGURE_X[state.tab];
  const label = KIND_LABEL[state.tab];
  return `<g id="pick" pointer-events="none">
    ${stroke(ellipsePts(x, FEET_Y + 10, 92, 20, 22), { w: 5, closed: true, seed: 1211, color: INK, opacity: 0.55 })}
    <text x="${x}" y="${FEET_Y + 62}" text-anchor="middle" font-size="24"
      font-family="Comic Sans MS, Chalkboard SE, Segoe Print, sans-serif" fill="${INK}" opacity="0.55">${label}</text>
  </g>`;
}

function renderScene() {
  const p = palette();
  const wall = WALL_PATTERNS.find((w) => w.id === state.wall) || WALL_PATTERNS[0];
  const floor = FLOOR_PATTERNS.find((f) => f.id === state.floor) || FLOOR_PATTERNS[0];
  const shadow = ['lady', 'gent']
    .map(
      (k) =>
        `<ellipse cx="${FIGURE_X[k]}" cy="${FEET_Y + 8}" rx="86" ry="15" fill="${INK}" opacity="0.12"/>`
    )
    .join('');

  svg.innerHTML = `
    <rect x="0" y="0" width="${SCENE.w}" height="${SCENE.floorY}" fill="${p.wall}"/>
    <rect x="0" y="${SCENE.floorY}" width="${SCENE.w}" height="${SCENE.h - SCENE.floorY}" fill="${p.floor}"/>
    <g opacity="0.9">${wall.draw()}</g>
    <g opacity="0.9">${floor.draw()}</g>
    ${stroke([[0, SCENE.floorY], [SCENE.w, SCENE.floorY]], { w: 7, seed: 1201, color: INK })}
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
      { w: 8, closed: true, seed: 1203, color: INK }
    )}
  `;
}

/* -------------------------------------------------------------------- UI */

function itemPreview(item, P) {
  const [x, y, w, h] = item.preview;
  return `<svg class="thumb" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true">${item.draw(P)}</svg>`;
}

function decorPreview(def) {
  const [x, y, w, h] = def.box;
  return `<svg class="thumb" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true">${def.draw()}</svg>`;
}

function renderTabs() {
  tabsEl.innerHTML = [
    { id: 'lady', label: '👒 Lady' },
    { id: 'gent', label: '🎩 Gentleman' },
    { id: 'room', label: '🏠 Room' },
  ]
    .map(
      (t) =>
        `<button class="tab${state.tab === t.id ? ' on' : ''}" data-tab="${t.id}">${t.label}</button>`
    )
    .join('');
}

function renderTray() {
  if (state.tab === 'room') return renderRoomTray();
  const kind = state.tab;
  const P = paint();
  const chips = SLOTS.map(
    (s) =>
      `<button class="chip${state.slot === s.id ? ' on' : ''}" data-slot="${s.id}">${s.icon} ${s.name}</button>`
  ).join('');
  const items = CATALOG[kind][state.slot]
    .map((item) => {
      const on = state.looks[kind][state.slot] === item.id;
      return `<button class="card${on ? ' on' : ''}" draggable="true" data-item="${item.id}" data-slot="${item.slot}" data-kind="${kind}">
        ${itemPreview(item, P)}<span>${item.name}</span></button>`;
    })
    .join('');
  tray.innerHTML = `<div class="chips">${chips}</div><div class="grid">${items}</div>`;
  hintEl.textContent = `Tap a piece to dress the ${KIND_LABEL[kind].toLowerCase()} — tap again to take it off.`;
}

function renderRoomTray() {
  const swatches = PALETTES.map(
    (p) =>
      `<button class="swatch${state.palette === p.id ? ' on' : ''}" data-palette="${p.id}" title="${p.name}">
        <span style="background:${p.wall}"></span><span style="background:${p.floor}"></span></button>`
  ).join('');
  const walls = WALL_PATTERNS.map(
    (w) => `<button class="chip${state.wall === w.id ? ' on' : ''}" data-wall="${w.id}">${w.name}</button>`
  ).join('');
  const floors = FLOOR_PATTERNS.map(
    (f) => `<button class="chip${state.floor === f.id ? ' on' : ''}" data-floor="${f.id}">${f.name}</button>`
  ).join('');
  const decor = DECOR.map((d) => {
    const count = state.decor.filter((x) => x.id === d.id).length;
    return `<button class="card${count ? ' on' : ''}" data-decor="${d.id}">
      ${decorPreview(d)}<span>${d.name}${count > 1 ? ` ×${count}` : ''}</span></button>`;
  }).join('');
  tray.innerHTML = `
    <div class="section"><h3>Colours</h3><div class="swatches">${swatches}</div></div>
    <div class="section"><h3>Wall</h3><div class="chips">${walls}</div></div>
    <div class="section"><h3>Floor</h3><div class="chips">${floors}</div></div>
    <div class="section"><h3>Decorations</h3><div class="grid">${decor}</div></div>`;
  hintEl.textContent = 'Tap to add decorations, drag them around the room, double-tap one to take it away.';
}

function renderAll() {
  renderTabs();
  renderTray();
  renderScene();
}

/* ---------------------------------------------------------------- actions */

function wear(kind, slot, id) {
  state.looks[kind][slot] = state.looks[kind][slot] === id ? null : id;
  save();
  renderTray();
  renderScene();
}

function addDecor(id) {
  const def = findDecor(id);
  if (!def) return;
  if (state.decor.some((d) => d.id === id)) {
    state.decor = state.decor.filter((d) => d.id !== id);
  } else {
    const spot = freeSpot(def, state.decor);
    state.decor.push({ uid: uid('d'), id, x: spot.x, y: spot.y });
  }
  save();
  renderTray();
  renderScene();
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function rectOf(def, x, y) {
  return { x: x + def.box[0], y: y + def.box[1], w: def.box[2], h: def.box[3] };
}

function overlapArea(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

const figureRects = () =>
  ['lady', 'gent'].map((k) => ({ x: FIGURE_X[k] - 96, y: 110, w: 192, h: 366 }));

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
      if (!best || score < best.score) best = { score, x, y, clash };
    }
  }
  return best ? { x: best.x, y: best.y } : { x: def.at[0], y: def.at[1] };
}

function surprise() {
  for (const kind of ['lady', 'gent']) {
    for (const slot of Object.keys(state.looks[kind])) {
      const list = CATALOG[kind][slot];
      const skip = (slot === 'extra' && Math.random() < 0.4) || (slot === 'neck' && Math.random() < 0.25);
      state.looks[kind][slot] = skip ? null : pick(list).id;
    }
  }
  state.palette = pick(PALETTES).id;
  state.wall = pick(WALL_PATTERNS).id;
  state.floor = pick(FLOOR_PATTERNS).id;
  const shuffled = [...DECOR].sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 3));
  state.decor = [];
  for (const d of shuffled) {
    const spot = freeSpot(d, state.decor);
    state.decor.push({ uid: uid('d'), id: d.id, x: spot.x, y: spot.y });
  }
  save();
  renderAll();
}

function undress() {
  if (state.tab === 'room') {
    state.decor = [];
  } else {
    state.looks[state.tab] = emptyLook();
  }
  save();
  renderTray();
  renderScene();
}

async function savePicture() {
  const clone = svg.cloneNode(true);
  clone.querySelector('#pick')?.remove();
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', SCENE.w * 2);
  clone.setAttribute('height', SCENE.h * 2);
  const data = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([data], { type: 'image/svg+xml;charset=utf-8' }));
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
    img.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = SCENE.w * 2;
  canvas.height = SCENE.h * 2;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  const a = document.createElement('a');
  a.download = 'dressing-game.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
}

/* ----------------------------------------------------------------- events */

tabsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-tab]');
  if (!btn) return;
  state.tab = btn.dataset.tab;
  save();
  renderAll();
});

tray.addEventListener('click', (e) => {
  const slotBtn = e.target.closest('[data-slot]:not([data-item])');
  if (slotBtn) {
    state.slot = slotBtn.dataset.slot;
    renderTray();
    return;
  }
  const card = e.target.closest('[data-item]');
  if (card) {
    wear(card.dataset.kind, card.dataset.slot, card.dataset.item);
    return;
  }
  const dec = e.target.closest('[data-decor]');
  if (dec) {
    addDecor(dec.dataset.decor);
    return;
  }
  const pal = e.target.closest('[data-palette]');
  if (pal) {
    state.palette = pal.dataset.palette;
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

// drag a card onto the scene
tray.addEventListener('dragstart', (e) => {
  const card = e.target.closest('[data-item]');
  if (!card) return;
  e.dataTransfer.setData('text/plain', JSON.stringify({ kind: card.dataset.kind, slot: card.dataset.slot, id: card.dataset.item }));
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

svg.addEventListener('pointerdown', (e) => {
  const hit = targetAt(e);
  if (hit.decor) {
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
});

function endDrag(e) {
  if (!drag) return;
  drag.el.classList.remove('dragging');
  if (drag.moved) save();
  drag = null;
  if (e && svg.hasPointerCapture?.(e.pointerId)) svg.releasePointerCapture(e.pointerId);
}
svg.addEventListener('pointerup', endDrag);
svg.addEventListener('pointercancel', endDrag);

svg.addEventListener('dblclick', (e) => {
  const hit = targetAt(e);
  if (!hit.decor) return;
  state.decor = state.decor.filter((d) => d.uid !== hit.decor.uid);
  save();
  renderTray();
  renderScene();
});

$('#btn-surprise').addEventListener('click', surprise);
$('#btn-clear').addEventListener('click', undress);
$('#btn-save').addEventListener('click', savePicture);
$('#btn-colour').addEventListener('click', (e) => {
  state.colour = !state.colour;
  e.currentTarget.classList.toggle('on', state.colour);
  e.currentTarget.setAttribute('aria-pressed', String(state.colour));
  save();
  renderTray();
  renderScene();
});

/* ------------------------------------------------------------------ start */

load();
$('#btn-colour').classList.toggle('on', state.colour);
if (!state.looks.lady.outfit && !state.looks.gent.outfit && !state.decor.length) {
  state.looks.lady = { ...emptyLook(), outfit: 'ball-gown', head: 'spike-crown', neck: 'bead-loop', feet: 'heels' };
  state.looks.gent = { ...emptyLook(), outfit: 'tailcoat', head: 'top-hat', neck: 'bow-tie', feet: 'buckle-shoes', extra: 'cane' };
  state.decor = [];
  for (const id of ['chandelier', 'window', 'portrait', 'rug']) {
    const def = findDecor(id);
    state.decor.push({ uid: uid('d'), id, x: def.at[0], y: def.at[1] });
  }
}
renderAll();
