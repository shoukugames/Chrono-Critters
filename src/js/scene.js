/* Chrono Critters — scenery, analog clock, hourglass and particle effects.
 * Copyright (C) 2026 Shawn Rapaz — GPL-3.0-or-later */
'use strict';

const HOUR_COLOR = '#ff7a45';
const MIN_COLOR = '#3f8cff';
const W = 1280, H = 720;

/* ---------------- Sky & landscape ---------------- */
const SKY_KEYS = [   // [hour, top, bottom]
  [0, '#141a3d', '#2b3168'],
  [4.5, '#1d2352', '#3c3d78'],
  [6, '#6d7fc9', '#ffb38a'],
  [7.5, '#79c3f2', '#ffe2b8'],
  [10, '#5fb8f5', '#c9ecff'],
  [15, '#56b0f0', '#c4e9ff'],
  [17.5, '#7d8fd8', '#ffc58f'],
  [19, '#4b3f8f', '#ff8f7a'],
  [20.5, '#22275a', '#4b4a8a'],
  [24, '#141a3d', '#2b3168']
];

function lerpColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) + (((pb >> 16) & 255) - ((pa >> 16) & 255)) * t);
  const g = Math.round(((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * t);
  const bl = Math.round((pa & 255) + ((pb & 255) - (pa & 255)) * t);
  return 'rgb(' + r + ',' + g + ',' + bl + ')';
}

function skyAt(h) {
  h = ((h % 24) + 24) % 24;
  for (let i = 0; i < SKY_KEYS.length - 1; i++) {
    const [h0, t0, b0] = SKY_KEYS[i], [h1, t1, b1] = SKY_KEYS[i + 1];
    if (h >= h0 && h <= h1) {
      const k = (h - h0) / (h1 - h0);
      return [lerpColor(t0, t1, k), lerpColor(b0, b1, k)];
    }
  }
  return ['#5fb8f5', '#c9ecff'];
}

function nightness(h) {   // 0 = full day, 1 = deep night
  h = ((h % 24) + 24) % 24;
  if (h >= 7.5 && h <= 17.5) return 0;
  if (h > 20.5 || h < 4.5) return 1;
  if (h < 7.5) return Math.max(0, Math.min(1, (7.5 - h) / 3));
  return Math.max(0, Math.min(1, (h - 17.5) / 3));
}

const STARS = Array.from({ length: 90 }, (_, i) => ({
  x: (Math.sin(i * 91.7) * 0.5 + 0.5) * W,
  y: (Math.sin(i * 47.3 + 1) * 0.5 + 0.5) * H * 0.55,
  r: 0.8 + (i % 5) * 0.35,
  p: i * 1.37
}));
const CLOUDS = Array.from({ length: 6 }, (_, i) => ({ x: i * 260 + 40, y: 70 + (i % 3) * 55, s: 0.7 + (i % 3) * 0.25, v: 6 + (i % 4) * 3 }));
const FLOWERS = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 53.3 + Math.sin(i) * 30) % W, y: 640 + (i % 4) * 18,
  c: ['#ff8fa3', '#ffd166', '#c79bff', '#ffffff', '#8fc8ff'][i % 5], s: 5 + (i % 3) * 2
}));

function drawSky(ctx, hour, t) {
  const [top, bot] = skyAt(hour);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top); g.addColorStop(0.75, bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const n = nightness(hour);

  // stars
  if (n > 0.02) {
    ctx.save();
    for (const s of STARS) {
      ctx.globalAlpha = n * (0.5 + 0.5 * Math.sin(t * 2 + s.p));
      ctx.fillStyle = '#fffbe0';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // sun travels 6 → 18 h, moon 18 → 6 h along an arc
  const h = ((hour % 24) + 24) % 24;
  const arcPos = (p) => ({ x: 80 + p * (W - 160), y: 330 - Math.sin(p * Math.PI) * 260 });
  if (h > 5.2 && h < 18.8) {
    const p = (h - 5.5) / 13;
    const { x, y } = arcPos(Math.max(-0.05, Math.min(1.05, p)));
    const glow = ctx.createRadialGradient(x, y, 10, x, y, 120);
    glow.addColorStop(0, 'rgba(255,240,170,.8)'); glow.addColorStop(1, 'rgba(255,240,170,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, 120, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.2);
    ctx.strokeStyle = '#ffd65a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let k = 0; k < 10; k++) {
      ctx.rotate(Math.PI / 5);
      ctx.beginPath(); ctx.moveTo(0, 50 + Math.sin(t * 3 + k) * 3); ctx.lineTo(0, 64 + Math.sin(t * 3 + k) * 3); ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, 40, 0, Math.PI * 2);
    const sg = ctx.createRadialGradient(x - 12, y - 12, 5, x, y, 40);
    sg.addColorStop(0, '#fff6b0'); sg.addColorStop(1, '#ffc53d');
    ctx.fillStyle = sg; ctx.fill();
    // sleepy-happy sun face
    ctx.strokeStyle = '#c47a12'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x - 13, y - 4, 5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 13, y - 4, 5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y + 6, 10, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }
  if (h > 17.8 || h < 6.4) {
    const p = h >= 17.8 ? (h - 18) / 12 : (h + 6) / 12;
    const { x, y } = arcPos(Math.max(-0.05, Math.min(1.05, p)));
    const glow = ctx.createRadialGradient(x, y, 10, x, y, 100);
    glow.addColorStop(0, 'rgba(220,230,255,.5)'); glow.addColorStop(1, 'rgba(220,230,255,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, 100, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.rect(x - 60, y - 60, 120, 120); ctx.arc(x + 18, y - 10, 30, 0, Math.PI * 2, true);
    ctx.clip('evenodd');
    ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2); ctx.fillStyle = '#fff7d6'; ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#e8d9a0';
    ctx.beginPath(); ctx.arc(x - 16, y + 4, 3, 0, Math.PI * 2); ctx.fill();
  }

  // clouds
  for (const c of CLOUDS) {
    const x = ((c.x + t * c.v) % (W + 300)) - 150;
    ctx.save(); ctx.globalAlpha = 0.85 - n * 0.55;
    ctx.fillStyle = n > 0.5 ? '#9aa3d6' : '#ffffff';
    ctx.translate(x, c.y); ctx.scale(c.s, c.s);
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.arc(30, -14, 34, 0, Math.PI * 2);
    ctx.arc(64, 0, 26, 0, Math.PI * 2); ctx.arc(32, 8, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  return n;
}

function drawHills(ctx, hour, t) {
  const n = nightness(hour);
  const back = lerpColor('#9fdc8a', '#3c5a5e', n), front = lerpColor('#7ccf6c', '#2f4d4f', n);
  ctx.fillStyle = back;
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 560 + Math.sin(x / 170) * 30 + Math.sin(x / 63) * 8);
  ctx.lineTo(W, H); ctx.fill();
  // little round trees
  for (const tx of [90, 1190, 1010, 300]) {
    const ty = 560 + Math.sin(tx / 170) * 30;
    ctx.fillStyle = lerpColor('#8a5a3a', '#3a2e2e', n); ctx.fillRect(tx - 6, ty - 40, 12, 44);
    ctx.fillStyle = lerpColor('#5dbb63', '#2a4a45', n);
    ctx.beginPath(); ctx.arc(tx, ty - 58, 34, 0, Math.PI * 2); ctx.arc(tx - 22, ty - 40, 22, 0, Math.PI * 2); ctx.arc(tx + 22, ty - 40, 22, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = front;
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 625 + Math.sin(x / 120 + 1) * 18);
  ctx.lineTo(W, H); ctx.fill();
  for (const f of FLOWERS) {
    const sway = Math.sin(t * 1.8 + f.x) * 2;
    ctx.save(); ctx.translate(f.x + sway, f.y); ctx.globalAlpha = 1 - n * 0.5;
    ctx.fillStyle = f.c;
    for (let k = 0; k < 5; k++) { ctx.rotate(Math.PI * 2 / 5); ctx.beginPath(); ctx.arc(0, f.s * 0.8, f.s * 0.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#ffcf4a'; ctx.beginPath(); ctx.arc(0, 0, f.s * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // fireflies at night
  if (n > 0.3) {
    for (let k = 0; k < 14; k++) {
      const x = (k * 97 + Math.sin(t * 0.5 + k) * 40) % W, y = 560 + Math.sin(t * 0.8 + k * 2) * 40;
      ctx.save(); ctx.globalAlpha = n * (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + k)));
      ctx.fillStyle = '#fff6a0'; ctx.shadowColor = '#fff6a0'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
}

function drawScene(ctx, hour, t) { drawSky(ctx, hour, t); drawHills(ctx, hour, t); }

/* ---------------- Analog clock ---------------- */
function drawHand(ctx, cx, cy, angle, len, width, color, glow) {
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(angle);
  if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 25 + Math.sin(performance.now() / 150) * 10; }
  else { ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4; }
  ctx.beginPath();
  ctx.moveTo(-width * 0.5, len * 0.12);
  ctx.lineTo(-width * 0.55, -len * 0.75);
  ctx.quadraticCurveTo(-width * 0.9, -len * 0.82, 0, -len);
  ctx.quadraticCurveTo(width * 0.9, -len * 0.82, width * 0.55, -len * 0.75);
  ctx.lineTo(width * 0.5, len * 0.12);
  ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3; ctx.strokeStyle = Draw.shade(color, -0.3); ctx.stroke();
  // shine
  ctx.beginPath(); ctx.moveTo(-width * 0.15, -len * 0.05); ctx.lineTo(-width * 0.18, -len * 0.7);
  ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = width * 0.18; ctx.stroke();
  // little paw print near the tip
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  const py = -len * 0.82;
  ctx.beginPath(); ctx.ellipse(0, py + width * 0.25, width * 0.22, width * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  for (const dx of [-0.22, 0, 0.22]) { ctx.beginPath(); ctx.arc(dx * width, py - width * 0.08 - (dx === 0 ? width * 0.06 : 0), width * 0.08, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

/**
 * opts: hour (fractional, 0-12 display), minute (fractional 0-60), theme colour,
 *       animal index, minuteNums (bool), litNumbers (Set), glowHour, glowMinute,
 *       pulseNumber, t, mood, hideHands
 */
function drawClock(ctx, cx, cy, r, o) {
  const t = o.t || 0;
  ctx.save();
  // drop shadow & rim
  ctx.save();
  ctx.shadowColor = 'rgba(40,20,60,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.beginPath(); ctx.arc(cx, cy, r * 1.12, 0, Math.PI * 2);
  const rim = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  rim.addColorStop(0, Draw.shade(o.theme || '#ffb36b', 0.3)); rim.addColorStop(1, Draw.shade(o.theme || '#ffb36b', -0.15));
  ctx.fillStyle = rim; ctx.fill();
  ctx.restore();
  ctx.lineWidth = 4; ctx.strokeStyle = OL; ctx.beginPath(); ctx.arc(cx, cy, r * 1.12, 0, Math.PI * 2); ctx.stroke();
  // rim dots decoration
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2;
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * 1.06, cy + Math.sin(a) * r * 1.06, r * 0.012, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill();
  }
  // little cat-ear bumps on the top of the rim (cute bell-style)
  // face
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const face = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
  face.addColorStop(0, '#fffefa'); face.addColorStop(1, '#fff1dc');
  ctx.fillStyle = face; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = OL; ctx.stroke();

  // AM/PM soft tint arc hint around the inside edge
  // minute ticks
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * Math.PI * 2 - Math.PI / 2;
    const big = i % 5 === 0;
    const r1 = r * (big ? 0.86 : 0.9), r2 = r * 0.95;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.strokeStyle = big ? '#6b5a7a' : '#c8bccf';
    ctx.lineWidth = big ? 4 : 2; ctx.lineCap = 'round'; ctx.stroke();
  }

  // minute helper numbers outside the face
  if (o.minuteNums) {
    ctx.font = '800 ' + Math.round(r * 0.085) + 'px "M PLUS Rounded 1c", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * r * 1.27, y = cy + Math.sin(a) * r * 1.27;
      const lit = o.litMinute && o.litMinute.has(i);
      ctx.beginPath(); ctx.arc(x, y, r * 0.085, 0, Math.PI * 2);
      ctx.fillStyle = lit ? MIN_COLOR : 'rgba(255,255,255,.88)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = MIN_COLOR; ctx.stroke();
      ctx.fillStyle = lit ? '#fff' : MIN_COLOR;
      ctx.fillText(String(i * 5).padStart(2, '0'), x, y + 1);
    }
  }

  // hour numbers
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) {
    const a = i / 12 * Math.PI * 2 - Math.PI / 2;
    const rr = r * 0.72;
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    const lit = o.litNumbers && o.litNumbers.has(i);
    const pulse = o.pulseNumber === i ? 1 + Math.sin(t * 8) * 0.12 : 1;
    const size = r * 0.19 * (lit ? 1.18 : 1) * pulse;
    if (lit) {
      ctx.beginPath(); ctx.arc(x, y, r * 0.13 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,122,69,.18)'; ctx.fill();
    }
    ctx.font = '800 ' + Math.round(size) + 'px "M PLUS Rounded 1c", sans-serif';
    ctx.lineWidth = Math.max(3, r * 0.025); ctx.strokeStyle = '#ffffff'; ctx.strokeText(String(i), x, y + r * 0.01);
    ctx.fillStyle = lit ? HOUR_COLOR : (i % 3 === 0 ? '#5a3f78' : '#7b6a8c');
    ctx.fillText(String(i), x, y + r * 0.01);
  }

  if (!o.hideHands) {
    const ha = ((o.hour % 12) / 12) * Math.PI * 2;
    const ma = ((o.minute % 60) / 60) * Math.PI * 2;
    drawHand(ctx, cx, cy, ha, r * 0.5, r * 0.11, HOUR_COLOR, o.glowHour);
    drawHand(ctx, cx, cy, ma, r * 0.8, r * 0.075, MIN_COLOR, o.glowMinute);
  }

  // centre cap with the level's animal
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.13, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OL; ctx.stroke();
  if (o.animal !== undefined && o.animal !== null) {
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r * 0.13, 0, Math.PI * 2); ctx.clip();
    drawAnimal(ctx, o.animal, cx, cy + r * 0.02, r * 0.085, { t, mood: o.mood });
    ctx.restore();
  }
  // glass shine
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  const shine = ctx.createLinearGradient(cx - r, cy - r, cx + r * 0.2, cy + r * 0.2);
  shine.addColorStop(0, 'rgba(255,255,255,.35)'); shine.addColorStop(0.45, 'rgba(255,255,255,.05)'); shine.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = shine; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
  ctx.restore();
}

/* ---------------- Hourglass ---------------- */
function drawHourglass(ctx, x, y, h, frac, t, flip) {
  frac = Math.max(0, Math.min(1, frac));
  const w = h * 0.52;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(flip || 0);
  const low = frac < 0.15;
  // glow when low
  if (low) {
    const g = ctx.createRadialGradient(0, 0, 10, 0, 0, h * 0.7);
    g.addColorStop(0, 'rgba(255,120,120,' + (0.25 + Math.sin(t * 6) * 0.15) + ')'); g.addColorStop(1, 'rgba(255,120,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, h * 0.7, 0, Math.PI * 2); ctx.fill();
  }
  const gh = h * 0.42;  // half glass height
  const glassPath = () => {
    ctx.beginPath();
    ctx.moveTo(-w * 0.42, -gh);
    ctx.bezierCurveTo(-w * 0.46, -gh * 0.3, -w * 0.06, -gh * 0.15, -w * 0.05, 0);
    ctx.bezierCurveTo(-w * 0.06, gh * 0.15, -w * 0.46, gh * 0.3, -w * 0.42, gh);
    ctx.lineTo(w * 0.42, gh);
    ctx.bezierCurveTo(w * 0.46, gh * 0.3, w * 0.06, gh * 0.15, w * 0.05, 0);
    ctx.bezierCurveTo(w * 0.06, -gh * 0.15, w * 0.46, -gh * 0.3, w * 0.42, -gh);
    ctx.closePath();
  };
  // glass back
  glassPath(); ctx.fillStyle = 'rgba(220,240,255,.35)'; ctx.fill();

  // sand
  ctx.save(); glassPath(); ctx.clip();
  const sand = ctx.createLinearGradient(0, -gh, 0, gh);
  sand.addColorStop(0, '#ffd98a'); sand.addColorStop(1, '#f4b14e');
  ctx.fillStyle = sand;
  // top bulb: sand level drops with a dip in the middle
  if (frac > 0.001) {
    const topLevel = -gh * 0.1 - (gh * 0.85) * frac;
    ctx.beginPath();
    ctx.moveTo(-w, topLevel); ctx.quadraticCurveTo(0, topLevel + gh * 0.12 * (1 - frac) + 6, w, topLevel);
    ctx.lineTo(w, 0); ctx.lineTo(-w, 0); ctx.closePath(); ctx.fill();
  }
  // bottom pile grows as a mound
  const pile = 1 - frac;
  if (pile > 0.001) {
    const base = gh, peak = gh - gh * 0.9 * Math.sqrt(pile);
    ctx.beginPath();
    ctx.moveTo(-w, base); ctx.lineTo(-w, base - (base - peak) * 0.35);
    ctx.quadraticCurveTo(0, peak - gh * 0.12, w, base - (base - peak) * 0.35);
    ctx.lineTo(w, base); ctx.closePath(); ctx.fill();
  }
  // falling stream with grains
  if (frac > 0.002 && pile < 0.999) {
    ctx.fillStyle = '#f4b14e';
    ctx.fillRect(-1.6, 0, 3.2, gh * 0.95);
    for (let k = 0; k < 8; k++) {
      const yy = ((t * 260 + k * 37) % (gh * 0.9));
      ctx.beginPath(); ctx.arc(Math.sin(k * 3 + t * 9) * 2.2, yy, 1.8, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();

  // glass outline & shine
  glassPath(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(90,120,160,.8)'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w * 0.3, -gh * 0.85); ctx.quadraticCurveTo(-w * 0.34, -gh * 0.4, -w * 0.12, -gh * 0.15);
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w * 0.3, gh * 0.85); ctx.quadraticCurveTo(-w * 0.34, gh * 0.5, -w * 0.2, gh * 0.35); ctx.stroke();

  // wooden frame
  const wood = ctx.createLinearGradient(0, -h / 2, 0, -gh);
  wood.addColorStop(0, '#c98a55'); wood.addColorStop(1, '#8a5a3a');
  for (const sy of [-1, 1]) {
    Draw.rr(ctx, -w * 0.62, sy > 0 ? gh : -h / 2, w * 1.24, h / 2 - gh, 10);
    ctx.fillStyle = wood; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OL; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    Draw.rr(ctx, -w * 0.55, (sy > 0 ? gh : -h / 2) + 4, w * 1.1, 5, 3); ctx.fill();
  }
  for (const sx of [-1, 1]) {
    Draw.rr(ctx, sx * w * 0.54 - 6, -gh, 12, gh * 2, 6);
    ctx.fillStyle = '#a8703f'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = OL; ctx.stroke();
  }
  ctx.restore();
}

/* ---------------- Particles ---------------- */
const Particles = {
  list: [],
  confetti(x, y, n) {
    const cols = ['#ff8fa3', '#ffd166', '#8fe39a', '#8fc8ff', '#c79bff', '#ffa94d'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 250 + Math.random() * 450;
      this.list.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 300, life: 2.5 + Math.random(), age: 0,
        c: cols[i % cols.length], s: 6 + Math.random() * 8, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12,
        kind: Math.random() < 0.25 ? 'star' : 'rect' });
    }
  },
  sparkle(x, y, n, col) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 160;
      this.list.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.6 + Math.random() * 0.4, age: 0,
        c: col || '#fff6a0', s: 3 + Math.random() * 4, rot: 0, vr: 0, kind: 'dot', nograv: true });
    }
  },
  update(dt) {
    for (const p of this.list) {
      p.age += dt;
      if (!p.nograv) { p.vy += 600 * dt; p.vx *= 0.99; }
      else { p.vx *= 0.94; p.vy *= 0.94; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    }
    this.list = this.list.filter(p => p.age < p.life && p.y < H + 50);
  },
  draw(ctx) {
    for (const p of this.list) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      if (p.kind === 'rect') ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      else if (p.kind === 'star') drawStarShape(ctx, 0, 0, p.s * 0.9, p.c);
      else { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
  }
};

function drawStarShape(ctx, x, y, r, fill, stroke) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.48;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.lineWidth = 2; ctx.strokeStyle = stroke; ctx.stroke(); }
}
