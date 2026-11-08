/* Chrono Critters — 24 procedurally drawn animal friends (vector, resolution independent).
 * Copyright (C) 2026 Shawn Rapaz — GPL-3.0-or-later */
'use strict';

const OL = '#4a3328';   // soft brown outline for a sticker look

const ANIMALS = [
  { k: 'cat', c: '#f7a85a', c2: '#fff3e3', ear: 'pointy', inner: '#ffb7b2', nose: 'cat', ex: ['whiskers', 'catStripes'], tail: 'curl', theme: '#ffb36b' },
  { k: 'puppy', c: '#d39b68', c2: '#f9ead9', ear: 'floppy', earC: '#8a5a3a', face: 'muzzle', nose: 'dog', ex: ['eyeSpot'], tail: 'stub', theme: '#e0a878' },
  { k: 'bunny', c: '#fdfbff', c2: '#ffe8f0', ear: 'long', inner: '#ffb7cc', nose: 'bunny', tail: 'puff', theme: '#ffb7cc' },
  { k: 'bear', c: '#b07a4f', c2: '#eed2b4', ear: 'round', inner: '#eed2b4', face: 'muzzle', nose: 'dog', tail: 'none', theme: '#c99a6e' },
  { k: 'panda', c: '#ffffff', c2: '#ffffff', ear: 'round', earC: '#2d2d35', inner: '#2d2d35', face: 'panda', nose: 'dog', limb: '#2d2d35', tail: 'none', theme: '#8fd19e' },
  { k: 'fox', c: '#f08a3c', c2: '#fffaf2', ear: 'fox', inner: '#4a3328', face: 'fox', nose: 'dog', tail: 'fox', theme: '#ff9d57' },
  { k: 'pig', c: '#ffc6d2', c2: '#ff9fb4', ear: 'pig', inner: '#ff9fb4', nose: 'snout', tail: 'piggy', theme: '#ff9fb4' },
  { k: 'frog', c: '#8fd46a', c2: '#dff7cc', ear: 'none', face: 'frog', nose: 'frog', tail: 'none', theme: '#7fcc5a' },
  { k: 'owl', c: '#a87b59', c2: '#f3e2c8', ear: 'tuft', face: 'owl', nose: 'beak', tail: 'none', belly: 'feather', theme: '#b98a62' },
  { k: 'chick', c: '#ffe066', c2: '#fff3b0', ear: 'none', nose: 'beak', ex: ['tuft'], tail: 'none', theme: '#ffd84a' },
  { k: 'penguin', c: '#3d4a6b', c2: '#ffffff', ear: 'none', face: 'penguin', nose: 'beak', tail: 'none', theme: '#6fa8dc' },
  { k: 'mouse', c: '#bdbccb', c2: '#ecebf3', ear: 'mouse', inner: '#ffbfcf', nose: 'mouse', ex: ['whiskers'], tail: 'rope', theme: '#b6b4d6' },
  { k: 'koala', c: '#a3a8b8', c2: '#eceef4', ear: 'koala', inner: '#f6f7fb', nose: 'koala', tail: 'none', theme: '#9fb3c8' },
  { k: 'lion', c: '#ffcc5c', c2: '#fff2cc', ear: 'round', inner: '#e8a23f', face: 'muzzle', nose: 'dog', ex: ['mane'], mane: '#e0892f', tail: 'lion', theme: '#ffb84a' },
  { k: 'tiger', c: '#ff9f43', c2: '#fff7ec', ear: 'round', inner: '#fff7ec', face: 'fox', nose: 'cat', ex: ['tigerStripes', 'whiskers'], tail: 'tiger', theme: '#ff8f3a' },
  { k: 'monkey', c: '#9a6a46', c2: '#f6d9b8', ear: 'monkey', inner: '#f6d9b8', face: 'monkey', nose: 'monkey', tail: 'curl', theme: '#c08a5c' },
  { k: 'elephant', c: '#a9bcd6', c2: '#ffc8d6', ear: 'side', inner: '#ffc8d6', nose: 'trunk', tail: 'rope', theme: '#8fb0dd' },
  { k: 'cow', c: '#ffffff', c2: '#ffc0c8', ear: 'cow', inner: '#ffc0c8', nose: 'snout', ex: ['cowSpots', 'horns'], tail: 'rope', theme: '#9ad0f5' },
  { k: 'sheep', c: '#fff1dd', c2: '#ffffff', ear: 'sheep', inner: '#ffd2c6', nose: 'sheep', ex: ['wool'], tail: 'puff', woolBody: true, theme: '#c7b6f0' },
  { k: 'raccoon', c: '#9b9aa6', c2: '#ffffff', ear: 'pointySmall', inner: '#4b4a55', face: 'raccoon', nose: 'dog', tail: 'raccoon', theme: '#8f8fa8' },
  { k: 'hamster', c: '#f2b56b', c2: '#fffaf0', ear: 'roundSmall', inner: '#ffc4c4', face: 'hamster', nose: 'mouse', ex: ['whiskers'], tail: 'none', theme: '#f5c27a' },
  { k: 'duck', c: '#ffffff', c2: '#ffffff', ear: 'none', nose: 'bill', ex: ['duckTuft'], tail: 'none', theme: '#7ec8f0' },
  { k: 'deer', c: '#c98a55', c2: '#fff1de', ear: 'deer', inner: '#ffd6c4', face: 'muzzle', nose: 'dog', ex: ['antlers', 'deerSpots'], tail: 'puff', theme: '#d4a06a' },
  { k: 'unicorn', c: '#fffaff', c2: '#ffe3f1', ear: 'pointy', inner: '#ffc7e0', nose: 'none', ex: ['unicorn'], tail: 'rainbow', theme: '#e4a8ff' }
];

const Draw = {
  ell(ctx, x, y, rx, ry, rot) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, Math.PI * 2); },
  fs(ctx, fill, stroke, lw) {
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  },
  shade(hex, amt) {   // amt -1..1 darken/lighten
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((f - r) * p + r); g = Math.round((f - g) * p + g); b = Math.round((f - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
  rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
};

/**
 * Draw animal #i with its head centred at (x, y); s is the head radius.
 * o = { t, mood: 'idle'|'happy'|'think'|'wave', body: bool, arm: 0..1, look: {x,y} }
 */
function drawAnimal(ctx, i, x, y, s, o) {
  o = o || {};
  const a = ANIMALS[i % ANIMALS.length];
  const t = o.t || 0;
  const lw = Math.max(1.2, s * 0.06);
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';

  let bob = Math.sin(t * 2.2 + i) * 0.03 * s;
  let squash = 1 + Math.sin(t * 2.2 + i) * 0.015;
  if (o.mood === 'happy') { const j = Math.abs(Math.sin(t * 7)); bob = -j * 0.35 * s; squash = 1 + (1 - j) * 0.05; }
  ctx.translate(0, bob);

  if (o.body) drawBody(ctx, a, s, lw, o, t, i);

  ctx.save();
  const tilt = o.mood === 'think' ? Math.sin(t * 1.6) * 0.12 : (o.tilt || Math.sin(t * 1.1 + i) * 0.03);
  ctx.rotate(tilt);
  ctx.scale(1 / squash, squash);
  drawHead(ctx, a, s, lw, o, t, i);
  ctx.restore();

  ctx.restore();
}

function drawBody(ctx, a, s, lw, o, t, idx) {
  const limb = a.limb || a.c;
  // shadow
  ctx.save();
  ctx.globalAlpha = 0.18;
  Draw.ell(ctx, 0, 2.18 * s, 0.95 * s, 0.16 * s); ctx.fillStyle = '#000'; ctx.fill();
  ctx.restore();

  drawTail(ctx, a, s, lw, t);

  // feet
  for (const sx of [-1, 1]) {
    Draw.ell(ctx, sx * 0.42 * s, 2.0 * s, 0.3 * s, 0.19 * s);
    Draw.fs(ctx, a.k === 'duck' || a.k === 'chick' || a.k === 'penguin' ? '#ffa94d' : limb, OL, lw);
  }
  // body
  if (a.woolBody) {
    ctx.fillStyle = '#ffffff';
    for (let k = 0; k < 10; k++) {
      const an = (k / 10) * Math.PI * 2;
      Draw.ell(ctx, Math.cos(an) * 0.68 * s, 1.4 * s + Math.sin(an) * 0.6 * s, 0.3 * s, 0.3 * s);
      Draw.fs(ctx, '#ffffff', OL, lw);
    }
    Draw.ell(ctx, 0, 1.4 * s, 0.75 * s, 0.65 * s); Draw.fs(ctx, '#ffffff');
  } else {
    Draw.ell(ctx, 0, 1.4 * s, 0.82 * s, 0.75 * s);
    Draw.fs(ctx, a.c, OL, lw);
    // belly
    Draw.ell(ctx, 0, 1.5 * s, 0.52 * s, 0.52 * s);
    Draw.fs(ctx, a.k === 'panda' ? '#ffffff' : a.c2);
    if (a.belly === 'feather') {
      ctx.strokeStyle = Draw.shade(a.c, -0.2); ctx.lineWidth = lw * 0.7;
      for (let r = 0; r < 3; r++) for (let c = -1; c <= 1; c++) {
        ctx.beginPath(); ctx.arc(c * 0.2 * s + (r % 2) * 0.1 * s, 1.3 * s + r * 0.18 * s, 0.08 * s, 0.2, Math.PI - 0.2); ctx.stroke();
      }
    }
  }
  // arms: left rests, right one waves / turns the clock
  const armBase = 0.5;
  const raise = o.arm || 0;
  const wave = o.mood === 'happy' ? Math.sin(t * 14) * 0.4 : (o.mood === 'wave' ? Math.sin(t * 9) * 0.5 : 0);
  for (const sx of [-1, 1]) {
    ctx.save();
    ctx.translate(sx * 0.68 * s, 1.05 * s);
    let ang = armBase;
    if (sx === 1) ang = armBase - raise * 2.4 + (raise > 0.3 || o.mood ? wave : 0);
    else if (o.mood === 'happy') ang = armBase - 2.2 - wave;
    ctx.rotate(-sx * ang);
    Draw.ell(ctx, 0, 0.3 * s, 0.17 * s, 0.34 * s);
    Draw.fs(ctx, limb, OL, lw);
    ctx.restore();
  }
}

function drawTail(ctx, a, s, lw, t) {
  const sw = Math.sin(t * 3) * 0.12;
  ctx.save();
  ctx.translate(0.55 * s, 1.75 * s);
  ctx.rotate(sw);
  const curlStroke = (col, w) => {
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(0.7 * s, 0.1 * s, 0.9 * s, -0.7 * s, 0.55 * s, -0.95 * s);
    ctx.strokeStyle = OL; ctx.lineWidth = w + lw * 2; ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  };
  switch (a.tail) {
    case 'curl': curlStroke(a.c, 0.2 * s); break;
    case 'tiger': {
      curlStroke(a.c, 0.2 * s);
      ctx.fillStyle = '#4a3328';
      for (const p of [[0.35, -0.02], [0.68, -0.35], [0.7, -0.7]]) { Draw.ell(ctx, p[0] * s, p[1] * s, 0.05 * s, 0.11 * s, 0.6); ctx.fill(); }
      break;
    }
    case 'lion':
      curlStroke(a.c, 0.13 * s);
      Draw.ell(ctx, 0.55 * s, -0.98 * s, 0.17 * s, 0.17 * s); Draw.fs(ctx, a.mane, OL, lw); break;
    case 'rope':
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.bezierCurveTo(0.6 * s, 0.25 * s, 0.85 * s, -0.25 * s, 0.75 * s, -0.55 * s);
      ctx.strokeStyle = OL; ctx.lineWidth = 0.08 * s + lw * 2; ctx.stroke();
      ctx.strokeStyle = a.k === 'mouse' ? '#ffbfcf' : a.c; ctx.lineWidth = 0.08 * s; ctx.stroke();
      if (a.k === 'cow') { Draw.ell(ctx, 0.75 * s, -0.6 * s, 0.09 * s, 0.13 * s); Draw.fs(ctx, '#4a3328'); }
      break;
    case 'piggy':
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.bezierCurveTo(0.5 * s, 0, 0.5 * s, -0.35 * s, 0.3 * s, -0.3 * s);
      ctx.bezierCurveTo(0.15 * s, -0.25 * s, 0.25 * s, -0.05 * s, 0.5 * s, -0.12 * s);
      ctx.strokeStyle = OL; ctx.lineWidth = 0.07 * s + lw * 2; ctx.stroke();
      ctx.strokeStyle = a.c; ctx.lineWidth = 0.07 * s; ctx.stroke(); break;
    case 'puff':
      Draw.ell(ctx, 0.25 * s, -0.05 * s, 0.24 * s, 0.24 * s); Draw.fs(ctx, '#ffffff', OL, lw); break;
    case 'stub':
      Draw.ell(ctx, 0.3 * s, -0.25 * s, 0.12 * s, 0.3 * s, 0.6); Draw.fs(ctx, a.c, OL, lw); break;
    case 'fox': case 'raccoon': {
      ctx.save(); ctx.rotate(-0.5);
      Draw.ell(ctx, 0.5 * s, -0.3 * s, 0.3 * s, 0.72 * s, 0.3);
      Draw.fs(ctx, a.c, OL, lw);
      ctx.save(); Draw.ell(ctx, 0.5 * s, -0.3 * s, 0.3 * s, 0.72 * s, 0.3); ctx.clip();
      if (a.tail === 'fox') { Draw.ell(ctx, 0.78 * s, -0.95 * s, 0.35 * s, 0.32 * s); Draw.fs(ctx, '#ffffff'); }
      else {
        ctx.fillStyle = '#4b4a55';
        for (let k = 0; k < 3; k++) { ctx.fillRect(-s, (-0.75 + k * 0.38) * s, 3 * s, 0.15 * s); }
      }
      ctx.restore();
      Draw.ell(ctx, 0.5 * s, -0.3 * s, 0.3 * s, 0.72 * s, 0.3); Draw.fs(ctx, null, OL, lw);
      ctx.restore(); break;
    }
    case 'rainbow': {
      const cols = ['#ff8fa3', '#ffc36b', '#fff27a', '#8fe39a', '#8fc8ff', '#c79bff'];
      cols.forEach((col, k) => {
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.bezierCurveTo(0.6 * s, (0.2 - k * 0.04) * s, (0.85 + k * 0.03) * s, (-0.5 - k * 0.05) * s, (0.5 + k * 0.05) * s, (-0.85 - k * 0.04) * s);
        ctx.strokeStyle = col; ctx.lineWidth = 0.1 * s; ctx.stroke();
      });
      break;
    }
    default: break;
  }
  ctx.restore();
}

function drawEars(ctx, a, s, lw, t) {
  const earC = a.earC || a.c;
  const wig = Math.sin(t * 2.5) * 0.04;
  for (const sx of [-1, 1]) {
    ctx.save();
    ctx.scale(sx, 1);
    ctx.rotate(wig * sx);
    switch (a.ear) {
      case 'pointy': case 'fox': case 'pointySmall': {
        const big = a.ear === 'fox' ? 1.18 : a.ear === 'pointySmall' ? 0.8 : 1;
        ctx.beginPath();
        ctx.moveTo(0.3 * s, -0.78 * s);
        ctx.quadraticCurveTo(0.62 * s * big, -1.28 * s * big, 0.9 * s * big, -1.12 * s * big);
        ctx.quadraticCurveTo(1.02 * s, -0.68 * s, 0.92 * s, -0.36 * s);
        ctx.closePath();
        Draw.fs(ctx, earC, OL, lw);
        ctx.beginPath();
        ctx.moveTo(0.42 * s, -0.78 * s);
        ctx.quadraticCurveTo(0.65 * s * big, -1.12 * s * big, 0.84 * s * big, -1.0 * s * big);
        ctx.quadraticCurveTo(0.9 * s, -0.7 * s, 0.84 * s, -0.5 * s);
        ctx.closePath();
        Draw.fs(ctx, a.inner);
        break;
      }
      case 'round': case 'roundSmall': {
        const r = a.ear === 'roundSmall' ? 0.22 : 0.3;
        Draw.ell(ctx, 0.7 * s, -0.72 * s, r * s, r * s); Draw.fs(ctx, earC, OL, lw);
        Draw.ell(ctx, 0.7 * s, -0.72 * s, r * 0.55 * s, r * 0.55 * s); Draw.fs(ctx, a.inner);
        break;
      }
      case 'mouse':
        Draw.ell(ctx, 0.82 * s, -0.62 * s, 0.5 * s, 0.5 * s); Draw.fs(ctx, earC, OL, lw);
        Draw.ell(ctx, 0.82 * s, -0.62 * s, 0.32 * s, 0.32 * s); Draw.fs(ctx, a.inner);
        break;
      case 'koala':
        for (let k = 0; k < 7; k++) {
          const an = k / 7 * Math.PI * 2;
          Draw.ell(ctx, 0.9 * s + Math.cos(an) * 0.32 * s, -0.55 * s + Math.sin(an) * 0.32 * s, 0.16 * s, 0.16 * s);
          Draw.fs(ctx, earC, OL, lw);
        }
        Draw.ell(ctx, 0.9 * s, -0.55 * s, 0.38 * s, 0.38 * s); Draw.fs(ctx, earC);
        Draw.ell(ctx, 0.9 * s, -0.55 * s, 0.22 * s, 0.22 * s); Draw.fs(ctx, a.inner);
        break;
      case 'long':
        ctx.save(); ctx.translate(0.38 * s, -0.95 * s); ctx.rotate(0.14 + Math.sin(t * 2) * 0.05);
        Draw.ell(ctx, 0, -0.45 * s, 0.22 * s, 0.62 * s); Draw.fs(ctx, earC, OL, lw);
        Draw.ell(ctx, 0, -0.42 * s, 0.11 * s, 0.48 * s); Draw.fs(ctx, a.inner);
        ctx.restore();
        break;
      case 'floppy':
        ctx.save(); ctx.translate(0.82 * s, -0.45 * s); ctx.rotate(-0.35 + Math.sin(t * 2.4) * 0.06);
        Draw.ell(ctx, 0.08 * s, 0.42 * s, 0.27 * s, 0.58 * s); Draw.fs(ctx, earC, OL, lw);
        ctx.restore();
        break;
      case 'side':
        Draw.ell(ctx, 0.98 * s, 0.05 * s, 0.6 * s, 0.75 * s, -0.1); Draw.fs(ctx, earC, OL, lw);
        Draw.ell(ctx, 1.02 * s, 0.08 * s, 0.38 * s, 0.52 * s, -0.1); Draw.fs(ctx, a.inner);
        break;
      case 'monkey':
        Draw.ell(ctx, 1.0 * s, 0.02 * s, 0.3 * s, 0.3 * s); Draw.fs(ctx, earC, OL, lw);
        Draw.ell(ctx, 1.0 * s, 0.02 * s, 0.17 * s, 0.17 * s); Draw.fs(ctx, a.inner);
        break;
      case 'tuft':
        ctx.beginPath(); ctx.moveTo(0.35 * s, -0.85 * s); ctx.lineTo(0.78 * s, -1.2 * s); ctx.lineTo(0.85 * s, -0.55 * s); ctx.closePath();
        Draw.fs(ctx, Draw.shade(a.c, -0.15), OL, lw);
        break;
      case 'pig':
        ctx.beginPath(); ctx.moveTo(0.35 * s, -0.8 * s); ctx.quadraticCurveTo(0.8 * s, -1.15 * s, 0.95 * s, -0.95 * s);
        ctx.quadraticCurveTo(0.95 * s, -0.6 * s, 0.82 * s, -0.45 * s); ctx.closePath();
        Draw.fs(ctx, earC, OL, lw);
        ctx.beginPath(); ctx.moveTo(0.5 * s, -0.78 * s); ctx.quadraticCurveTo(0.8 * s, -1.0 * s, 0.86 * s, -0.88 * s);
        ctx.quadraticCurveTo(0.86 * s, -0.68 * s, 0.78 * s, -0.58 * s); ctx.closePath(); Draw.fs(ctx, a.inner);
        break;
      case 'cow': case 'sheep': case 'deer': {
        const len = a.ear === 'deer' ? 0.42 : 0.33;
        ctx.save(); ctx.translate(0.88 * s, -0.4 * s); ctx.rotate(a.ear === 'deer' ? -0.5 : -0.25);
        Draw.ell(ctx, len * s * 0.7, 0, len * s, 0.15 * s); Draw.fs(ctx, a.ear === 'sheep' ? a.c : earC, OL, lw);
        Draw.ell(ctx, len * s * 0.75, 0, len * s * 0.65, 0.08 * s); Draw.fs(ctx, a.inner);
        ctx.restore();
        break;
      }
      default: break;
    }
    ctx.restore();
  }
}

function drawHead(ctx, a, s, lw, o, t, idx) {
  const ex = a.ex || [];
  const hw = 1.06, hh = 0.95;

  // ---- behind the head ----
  if (ex.includes('mane')) {
    const n = 14;
    for (let k = 0; k < n; k++) {
      const an = k / n * Math.PI * 2 + Math.sin(t * 1.5) * 0.03;
      Draw.ell(ctx, Math.cos(an) * 1.05 * s, Math.sin(an) * 1.0 * s, 0.36 * s, 0.36 * s);
      Draw.fs(ctx, a.mane, OL, lw);
    }
    Draw.ell(ctx, 0, 0, 1.1 * s, 1.05 * s); Draw.fs(ctx, a.mane);
  }
  if (ex.includes('unicorn')) {
    const cols = ['#ff8fa3', '#ffc36b', '#fff27a', '#8fe39a', '#8fc8ff', '#c79bff'];
    cols.forEach((col, k) => {
      Draw.ell(ctx, (-0.55 - k * 0.07) * s, (-0.55 + k * 0.28) * s, 0.32 * s, 0.24 * s, -0.6);
      Draw.fs(ctx, col, OL, lw * 0.8);
    });
  }
  if (ex.includes('wool')) {
    for (let k = 0; k < 12; k++) {
      const an = k / 12 * Math.PI * 2;
      Draw.ell(ctx, Math.cos(an) * 0.98 * s, Math.sin(an) * 0.9 * s, 0.32 * s, 0.32 * s);
      Draw.fs(ctx, '#ffffff', OL, lw);
    }
    Draw.ell(ctx, 0, 0, 1.0 * s, 0.92 * s); Draw.fs(ctx, '#ffffff');
  }
  if (ex.includes('antlers')) {
    ctx.strokeStyle = '#8a5a3a'; ctx.lineWidth = 0.1 * s;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sx * 0.4 * s, -0.75 * s); ctx.lineTo(sx * 0.6 * s, -1.45 * s);
      ctx.moveTo(sx * 0.5 * s, -1.1 * s); ctx.lineTo(sx * 0.85 * s, -1.25 * s);
      ctx.moveTo(sx * 0.58 * s, -1.38 * s); ctx.lineTo(sx * 0.4 * s, -1.6 * s);
      ctx.stroke();
    }
  }
  if (a.face === 'frog') {
    for (const sx of [-1, 1]) { Draw.ell(ctx, sx * 0.48 * s, -0.72 * s, 0.36 * s, 0.34 * s); Draw.fs(ctx, a.c, OL, lw); }
  }
  if (ex.includes('horns')) {
    for (const sx of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(sx * 0.45 * s, -0.8 * s);
      ctx.quadraticCurveTo(sx * 0.6 * s, -1.25 * s, sx * 0.78 * s, -1.15 * s);
      ctx.quadraticCurveTo(sx * 0.7 * s, -0.95 * s, sx * 0.68 * s, -0.75 * s); ctx.closePath();
      Draw.fs(ctx, '#f3e2b8', OL, lw);
    }
  }

  drawEars(ctx, a, s, lw, t);

  // ---- head base ----
  Draw.ell(ctx, 0, 0, hw * s, hh * s);
  const g = ctx.createRadialGradient(-0.35 * s, -0.45 * s, 0.1 * s, 0, 0, 1.1 * s);
  g.addColorStop(0, Draw.shade(a.c, 0.25)); g.addColorStop(1, a.c);
  Draw.fs(ctx, g, OL, lw);

  ctx.save();
  Draw.ell(ctx, 0, 0, hw * s, hh * s); ctx.clip();
  // ---- face patterns (clipped to head) ----
  switch (a.face) {
    case 'muzzle': Draw.ell(ctx, 0, 0.38 * s, 0.45 * s, 0.32 * s); Draw.fs(ctx, a.c2); break;
    case 'fox':
      for (const sx of [-1, 1]) { Draw.ell(ctx, sx * 0.42 * s, 0.45 * s, 0.48 * s, 0.4 * s); Draw.fs(ctx, a.c2); }
      break;
    case 'monkey': case 'penguin':
      Draw.ell(ctx, -0.33 * s, -0.05 * s, 0.38 * s, 0.42 * s); Draw.fs(ctx, a.c2);
      Draw.ell(ctx, 0.33 * s, -0.05 * s, 0.38 * s, 0.42 * s); Draw.fs(ctx, a.c2);
      Draw.ell(ctx, 0, 0.35 * s, 0.62 * s, 0.42 * s); Draw.fs(ctx, a.c2);
      break;
    case 'owl':
      for (const sx of [-1, 1]) { Draw.ell(ctx, sx * 0.38 * s, -0.02 * s, 0.34 * s, 0.34 * s); Draw.fs(ctx, a.c2, Draw.shade(a.c, -0.2), lw * 0.7); }
      break;
    case 'panda':
      for (const sx of [-1, 1]) { Draw.ell(ctx, sx * 0.38 * s, 0.02 * s, 0.2 * s, 0.27 * s, sx * 0.6); Draw.fs(ctx, '#2d2d35'); }
      break;
    case 'raccoon':
      ctx.beginPath();
      ctx.moveTo(-1.1 * s, -0.25 * s); ctx.quadraticCurveTo(0, 0.05 * s, 1.1 * s, -0.25 * s);
      ctx.lineTo(1.1 * s, 0.22 * s); ctx.quadraticCurveTo(0, 0.4 * s, -1.1 * s, 0.22 * s); ctx.closePath();
      Draw.fs(ctx, '#4b4a55');
      Draw.ell(ctx, 0, 0.5 * s, 0.4 * s, 0.3 * s); Draw.fs(ctx, a.c2);
      for (const sx of [-1, 1]) { Draw.ell(ctx, sx * 0.4 * s, -0.42 * s, 0.22 * s, 0.1 * s, sx * 0.2); Draw.fs(ctx, '#ffffff'); }
      break;
    case 'hamster':
      for (const sx of [-1, 1]) { Draw.ell(ctx, sx * 0.58 * s, 0.38 * s, 0.4 * s, 0.34 * s); Draw.fs(ctx, a.c2); }
      Draw.ell(ctx, 0, -0.55 * s, 0.14 * s, 0.35 * s); Draw.fs(ctx, a.c2);
      break;
    default: break;
  }
  if (ex.includes('cowSpots')) {
    ctx.fillStyle = '#4a3328';
    Draw.ell(ctx, -0.65 * s, -0.5 * s, 0.38 * s, 0.3 * s, 0.4); ctx.fill();
    Draw.ell(ctx, 0.75 * s, 0.05 * s, 0.25 * s, 0.32 * s, -0.2); ctx.fill();
  }
  if (ex.includes('eyeSpot')) { Draw.ell(ctx, 0.42 * s, -0.12 * s, 0.3 * s, 0.26 * s, 0.3); Draw.fs(ctx, '#8a5a3a'); }
  if (ex.includes('deerSpots')) {
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    for (const p of [[-0.2, -0.65], [0.15, -0.72], [0.0, -0.5]]) { Draw.ell(ctx, p[0] * s, p[1] * s, 0.06 * s, 0.06 * s); ctx.fill(); }
  }
  if (ex.includes('catStripes') || ex.includes('tigerStripes')) {
    ctx.strokeStyle = ex.includes('tigerStripes') ? '#4a3328' : Draw.shade(a.c, -0.18);
    ctx.lineWidth = 0.08 * s;
    ctx.beginPath();
    for (const dx of [-0.2, 0, 0.2]) { ctx.moveTo(dx * s, -0.92 * s); ctx.lineTo(dx * s * 0.9, -0.68 * s); }
    if (ex.includes('tigerStripes')) {
      for (const sx of [-1, 1]) {
        ctx.moveTo(sx * 1.05 * s, 0.0); ctx.lineTo(sx * 0.78 * s, 0.05 * s);
        ctx.moveTo(sx * 1.05 * s, 0.2 * s); ctx.lineTo(sx * 0.8 * s, 0.22 * s);
      }
    }
    ctx.stroke();
  }
  ctx.restore(); // end clip

  if (ex.includes('wool')) {   // fluffy fringe on the forehead
    for (let k = -2; k <= 2; k++) { Draw.ell(ctx, k * 0.22 * s, -0.78 * s + Math.abs(k) * 0.05 * s, 0.2 * s, 0.18 * s); Draw.fs(ctx, '#ffffff', OL, lw * 0.8); }
  }
  if (ex.includes('tuft')) {
    ctx.strokeStyle = OL; ctx.lineWidth = lw * 1.1; ctx.beginPath();
    ctx.moveTo(0, -0.93 * s); ctx.quadraticCurveTo(-0.1 * s, -1.25 * s, 0.12 * s, -1.3 * s);
    ctx.moveTo(0, -0.93 * s); ctx.quadraticCurveTo(0.25 * s, -1.15 * s, 0.32 * s, -1.05 * s);
    ctx.stroke();
  }
  if (ex.includes('duckTuft')) {
    ctx.strokeStyle = OL; ctx.lineWidth = lw; ctx.beginPath();
    ctx.moveTo(0, -0.93 * s); ctx.quadraticCurveTo(0.05 * s, -1.2 * s, 0.22 * s, -1.18 * s); ctx.stroke();
  }
  if (ex.includes('unicorn')) {
    ctx.beginPath(); ctx.moveTo(-0.14 * s, -0.86 * s); ctx.lineTo(0.02 * s, -1.62 * s); ctx.lineTo(0.16 * s, -0.86 * s); ctx.closePath();
    const hg = ctx.createLinearGradient(0, -1.6 * s, 0, -0.86 * s);
    hg.addColorStop(0, '#fff6a8'); hg.addColorStop(1, '#ffc65c');
    Draw.fs(ctx, hg, OL, lw);
    ctx.strokeStyle = 'rgba(200,120,40,.6)'; ctx.lineWidth = lw * 0.6; ctx.beginPath();
    ctx.moveTo(-0.1 * s, -1.0 * s); ctx.lineTo(0.12 * s, -1.08 * s);
    ctx.moveTo(-0.06 * s, -1.2 * s); ctx.lineTo(0.09 * s, -1.28 * s);
    ctx.moveTo(-0.03 * s, -1.4 * s); ctx.lineTo(0.06 * s, -1.45 * s); ctx.stroke();
  }

  // ---- eyes ----
  const blinkPhase = (t + idx * 0.37) % 3.6;
  const blinking = blinkPhase < 0.13;
  const happy = o.mood === 'happy';
  let ey = -0.02 * s, exx = 0.36 * s, er = 0.13 * s;
  if (a.face === 'frog') { ey = -0.72 * s; exx = 0.48 * s; er = 0.17 * s; }
  if (a.face === 'owl') { er = 0.17 * s; exx = 0.38 * s; }
  if (a.face === 'panda') { er = 0.11 * s; ey = 0.0; }
  const lx = (o.look && o.look.x || 0) * er * 0.35, ly = (o.look && o.look.y || 0) * er * 0.35;
  for (const sx of [-1, 1]) {
    const cx = sx * exx, cy = ey;
    if (happy) {
      ctx.strokeStyle = a.face === 'panda' ? '#ffffff' : '#2b1d16'; ctx.lineWidth = lw * 1.4;
      ctx.beginPath(); ctx.arc(cx, cy + er * 0.4, er * 0.9, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    } else if (blinking) {
      ctx.strokeStyle = a.face === 'panda' ? '#ffffff' : '#2b1d16'; ctx.lineWidth = lw * 1.3;
      ctx.beginPath(); ctx.moveTo(cx - er, cy); ctx.quadraticCurveTo(cx, cy + er * 0.6, cx + er, cy); ctx.stroke();
    } else {
      if (a.face === 'frog') { Draw.ell(ctx, cx, cy, er * 1.35, er * 1.35); Draw.fs(ctx, '#ffffff'); }
      Draw.ell(ctx, cx + lx, cy + ly, er, er * 1.08); Draw.fs(ctx, '#2b1d16');
      Draw.ell(ctx, cx + lx - er * 0.32, cy + ly - er * 0.38, er * 0.38, er * 0.38); Draw.fs(ctx, '#ffffff');
      Draw.ell(ctx, cx + lx + er * 0.35, cy + ly + er * 0.35, er * 0.16, er * 0.16); Draw.fs(ctx, '#ffffff');
    }
  }

  // ---- cheeks ----
  ctx.save(); ctx.globalAlpha = 0.55;
  const chY = a.face === 'frog' ? 0.15 * s : 0.27 * s;
  for (const sx of [-1, 1]) { Draw.ell(ctx, sx * 0.62 * s, chY, 0.15 * s, 0.09 * s); Draw.fs(ctx, '#ff8fa3'); }
  ctx.restore();

  // ---- nose & mouth ----
  drawNoseMouth(ctx, a, s, lw, o, t);

  if (ex.includes('whiskers')) {
    ctx.strokeStyle = 'rgba(74,51,40,.7)'; ctx.lineWidth = lw * 0.6; ctx.beginPath();
    for (const sx of [-1, 1]) for (const dy of [-0.05, 0.07]) {
      ctx.moveTo(sx * 0.62 * s, 0.25 * s + dy * s); ctx.lineTo(sx * 1.12 * s, 0.18 * s + dy * 2.2 * s);
    }
    ctx.stroke();
  }
}

function drawNoseMouth(ctx, a, s, lw, o, t) {
  const mood = o.mood;
  let ny = 0.2 * s;
  const mouth = (y, w) => {
    ctx.strokeStyle = '#2b1d16'; ctx.lineWidth = lw * 0.9;
    if (mood === 'happy') {
      ctx.beginPath(); ctx.moveTo(-w, y); ctx.quadraticCurveTo(0, y + w * 1.8, w, y); ctx.closePath();
      Draw.fs(ctx, '#8b2f3a', '#2b1d16', lw * 0.9);
      Draw.ell(ctx, 0, y + w * 0.6, w * 0.45, w * 0.25); Draw.fs(ctx, '#ff7b8b');
    } else if (mood === 'think') {
      Draw.ell(ctx, 0.05 * s, y + 0.05 * s, w * 0.3, w * 0.35); Draw.fs(ctx, '#8b2f3a', '#2b1d16', lw * 0.8);
    } else {
      ctx.beginPath();
      ctx.moveTo(-w, y); ctx.quadraticCurveTo(-w / 2, y + w * 0.8, 0, y);
      ctx.quadraticCurveTo(w / 2, y + w * 0.8, w, y); ctx.stroke();
    }
  };
  switch (a.nose) {
    case 'cat': case 'bunny': case 'mouse':
      ny = a.nose === 'mouse' ? 0.24 * s : 0.2 * s;
      if (a.nose === 'mouse') { Draw.ell(ctx, 0, ny, 0.08 * s, 0.07 * s); Draw.fs(ctx, '#ff8fa8', OL, lw * 0.6); }
      else {
        ctx.beginPath(); ctx.moveTo(-0.08 * s, ny - 0.04 * s); ctx.lineTo(0.08 * s, ny - 0.04 * s); ctx.lineTo(0, ny + 0.05 * s); ctx.closePath();
        Draw.fs(ctx, '#ff8fa8', OL, lw * 0.6);
      }
      mouth(ny + 0.08 * s, 0.13 * s);
      break;
    case 'dog':
      ny = 0.26 * s;
      Draw.ell(ctx, 0, ny, 0.12 * s, 0.085 * s); Draw.fs(ctx, '#2b1d16');
      Draw.ell(ctx, -0.04 * s, ny - 0.03 * s, 0.04 * s, 0.025 * s); Draw.fs(ctx, 'rgba(255,255,255,.7)');
      mouth(ny + 0.12 * s, 0.13 * s);
      break;
    case 'sheep':
      ny = 0.25 * s;
      Draw.ell(ctx, 0, ny, 0.09 * s, 0.06 * s); Draw.fs(ctx, '#d98a8a');
      mouth(ny + 0.1 * s, 0.11 * s);
      break;
    case 'koala':
      ny = 0.18 * s;
      Draw.ell(ctx, 0, ny, 0.19 * s, 0.24 * s); Draw.fs(ctx, '#3b3540');
      Draw.ell(ctx, -0.06 * s, ny - 0.1 * s, 0.05 * s, 0.04 * s); Draw.fs(ctx, 'rgba(255,255,255,.6)');
      mouth(ny + 0.33 * s, 0.11 * s);
      break;
    case 'monkey':
      ny = 0.25 * s;
      for (const sx of [-1, 1]) { Draw.ell(ctx, sx * 0.06 * s, ny, 0.03 * s, 0.04 * s); Draw.fs(ctx, '#4a3328'); }
      mouth(ny + 0.14 * s, 0.17 * s);
      break;
    case 'snout':
      ny = 0.34 * s;
      Draw.ell(ctx, 0, ny, 0.3 * s, 0.2 * s); Draw.fs(ctx, a.c2, OL, lw * 0.8);
      for (const sx of [-1, 1]) { Draw.ell(ctx, sx * 0.1 * s, ny, 0.045 * s, 0.07 * s); Draw.fs(ctx, '#8b4a5a'); }
      if (mood === 'happy') mouth(ny + 0.24 * s, 0.12 * s);
      break;
    case 'beak':
      ny = 0.2 * s;
      ctx.beginPath(); ctx.moveTo(-0.14 * s, ny - 0.04 * s); ctx.quadraticCurveTo(0, ny - 0.12 * s, 0.14 * s, ny - 0.04 * s);
      ctx.lineTo(0, ny + (mood === 'happy' ? 0.2 : 0.14) * s); ctx.closePath();
      Draw.fs(ctx, '#ffa94d', OL, lw * 0.8);
      if (mood === 'happy') { ctx.beginPath(); ctx.moveTo(-0.1 * s, ny); ctx.lineTo(0.1 * s, ny); ctx.strokeStyle = OL; ctx.lineWidth = lw * 0.6; ctx.stroke(); }
      break;
    case 'bill':
      ny = 0.32 * s;
      Draw.ell(ctx, 0, ny, 0.34 * s, 0.15 * s); Draw.fs(ctx, '#ffa94d', OL, lw * 0.8);
      ctx.beginPath(); ctx.moveTo(-0.28 * s, ny); ctx.quadraticCurveTo(0, ny + (mood === 'happy' ? 0.1 : 0.04) * s, 0.28 * s, ny);
      ctx.strokeStyle = OL; ctx.lineWidth = lw * 0.6; ctx.stroke();
      break;
    case 'frog':
      ctx.strokeStyle = '#2b1d16'; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(-0.5 * s, 0.15 * s); ctx.quadraticCurveTo(0, (mood === 'happy' ? 0.7 : 0.48) * s, 0.5 * s, 0.15 * s);
      if (mood === 'happy') { ctx.closePath(); Draw.fs(ctx, '#ff7b8b', '#2b1d16', lw); } else ctx.stroke();
      for (const sx of [-1, 1]) { Draw.ell(ctx, sx * 0.08 * s, -0.05 * s, 0.03 * s, 0.025 * s); Draw.fs(ctx, '#2b1d16'); }
      break;
    case 'trunk': {
      const sw = Math.sin(t * 2) * 0.08 * s;
      ctx.beginPath(); ctx.moveTo(0, 0.12 * s);
      ctx.bezierCurveTo(0, 0.6 * s, 0.05 * s + sw, 0.85 * s, 0.35 * s + sw, 0.8 * s);
      ctx.strokeStyle = OL; ctx.lineWidth = 0.26 * s + lw * 2; ctx.stroke();
      ctx.strokeStyle = a.c; ctx.lineWidth = 0.26 * s; ctx.stroke();
      ctx.strokeStyle = 'rgba(74,51,40,.35)'; ctx.lineWidth = lw * 0.6; ctx.beginPath();
      ctx.moveTo(-0.1 * s, 0.4 * s); ctx.lineTo(0.1 * s, 0.4 * s);
      ctx.moveTo(-0.08 * s, 0.55 * s); ctx.lineTo(0.12 * s, 0.55 * s); ctx.stroke();
      if (mood === 'happy') {
        ctx.beginPath(); ctx.arc(-0.32 * s, 0.38 * s, 0.1 * s, 0, Math.PI); ctx.closePath(); Draw.fs(ctx, '#8b2f3a', OL, lw * 0.7);
      }
      break;
    }
    case 'none':
      mouth(0.3 * s, 0.13 * s);
      break;
    default: break;
  }
}

/** Little silhouette for locked stickers. */
function drawLockedAnimal(ctx, i, x, y, s) {
  ctx.save();
  drawAnimal(ctx, i, x, y, s, { t: 0 });
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = '#b9b3c9';
  ctx.fillRect(x - s * 3, y - s * 3, s * 6, s * 6);
  ctx.restore();
}
