// Shared colour data: item paint swatches and room themes.

export const INK = '#15151a';

/** 28 swatches — neutrals, warms, cools and jewel/pastel tones. */
export const COLOURS = [
  { id: 'ink', name: 'Ink', hex: '#15151a' },
  { id: 'slate', name: 'Slate', hex: '#4a5568' },
  { id: 'stone', name: 'Stone', hex: '#8d9199' },
  { id: 'brown', name: 'Brown', hex: '#7b4b22' },
  { id: 'tan', name: 'Tan', hex: '#c08552' },
  { id: 'cream', name: 'Cream', hex: '#e8d5a8' },
  { id: 'chalk', name: 'Chalk', hex: '#fbfaf4' },

  { id: 'crimson', name: 'Crimson', hex: '#a4133c' },
  { id: 'red', name: 'Red', hex: '#e02424' },
  { id: 'orange', name: 'Orange', hex: '#ef6c00' },
  { id: 'amber', name: 'Amber', hex: '#f4a300' },
  { id: 'gold', name: 'Gold', hex: '#c99700' },
  { id: 'peach', name: 'Peach', hex: '#f7a08a' },
  { id: 'rose', name: 'Rose', hex: '#f06292' },

  { id: 'forest', name: 'Forest', hex: '#14532d' },
  { id: 'green', name: 'Green', hex: '#2a9d4a' },
  { id: 'lime', name: 'Lime', hex: '#7cb518' },
  { id: 'teal', name: 'Teal', hex: '#0d9488' },
  { id: 'cyan', name: 'Cyan', hex: '#1c95bd' },
  { id: 'sky', name: 'Sky', hex: '#7fb8f0' },
  { id: 'mint', name: 'Mint', hex: '#79d6a4' },

  { id: 'navy', name: 'Navy', hex: '#1e3a8a' },
  { id: 'blue', name: 'Blue', hex: '#2563eb' },
  { id: 'indigo', name: 'Indigo', hex: '#4c1d95' },
  { id: 'violet', name: 'Violet', hex: '#8b5cf6' },
  { id: 'magenta', name: 'Magenta', hex: '#c2185b' },
  { id: 'pink', name: 'Pink', hex: '#f9a8d4' },
  { id: 'lilac', name: 'Lilac', hex: '#c4b5fd' },
];

/** Colours the Rainbow button and Surprise pick from (skips near-white ones). */
export const PAINTABLE = COLOURS.filter((c) => !['chalk', 'cream', 'stone'].includes(c.id)).map((c) => c.hex);

export const ROOM_THEMES = [
  { id: 'paper', name: 'Paper', wall: '#fdfbf2', floor: '#f1ecdd' },
  { id: 'rose', name: 'Rose', wall: '#fce6ea', floor: '#f6d6cf' },
  { id: 'sky', name: 'Sky', wall: '#e3eefb', floor: '#dbe6f2' },
  { id: 'mint', name: 'Mint', wall: '#e2f3e8', floor: '#d8ead9' },
  { id: 'butter', name: 'Butter', wall: '#fcf2d8', floor: '#f3e6c4' },
  { id: 'lilac', name: 'Lilac', wall: '#eee5f7', floor: '#e3daf0' },
  { id: 'circus', name: 'Circus', wall: '#ffd166', floor: '#ef476f' },
  { id: 'jungle', name: 'Jungle', wall: '#7ec4a0', floor: '#2f6b47' },
  { id: 'ocean', name: 'Ocean', wall: '#4ea8de', floor: '#1b4965' },
  { id: 'sunset', name: 'Sunset', wall: '#f4845f', floor: '#7b2d5e' },
  { id: 'berry', name: 'Berry', wall: '#b5179e', floor: '#560bad' },
  { id: 'night', name: 'Night', wall: '#2b2d42', floor: '#14151f' },
];

export function themeById(id) {
  return ROOM_THEMES.find((t) => t.id === id) || ROOM_THEMES[0];
}

export function randomColour(exclude) {
  const pool = exclude ? PAINTABLE.filter((c) => c !== exclude) : PAINTABLE;
  return pool[Math.floor(Math.random() * pool.length)];
}

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

export const isDark = (hex) => luminance(hex) < 0.55;

/** Ink that stays visible on a given background. */
export const contrastInk = (hex) => (isDark(hex) ? '#f4f1e6' : INK);

export function hexToHsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h, s, l) {
  const sn = s / 100;
  const ln = l / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
}
