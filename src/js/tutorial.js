/* Chrono Critters — animated "How Clocks Work" tutorial.
 * Copyright (C) 2026 Shawn Rapaz — GPL-3.0-or-later */
'use strict';

const CX = 640, CY = 318, CR = 158;

function ease(x) { x = Math.max(0, Math.min(1, x)); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

function canvasLabel(ctx, text, x, y, bg, size, fg) {
  ctx.save();
  ctx.font = '800 ' + (size || 34) + 'px "M PLUS Rounded 1c", sans-serif';
  const w = ctx.measureText(text).width + 36, h = (size || 34) * 1.5;
  ctx.shadowColor = 'rgba(40,20,60,.25)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
  Draw.rr(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = bg || '#fff'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = fg || '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 2);
  ctx.restore();
}

function drawKey(ctx, x, y, label, color, pressed, w) {
  w = w || 70;
  ctx.save();
  const dy = pressed ? 5 : 0;
  Draw.rr(ctx, x - w / 2, y - 30 + 6, w, 60, 14); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fill();
  Draw.rr(ctx, x - w / 2, y - 30 + dy, w, 60, 14); ctx.fillStyle = color; ctx.fill();
  if (pressed) { ctx.shadowColor = color; ctx.shadowBlur = 25; ctx.fill(); ctx.shadowBlur = 0; }
  ctx.fillStyle = '#fff'; ctx.font = '800 ' + (label.length > 2 ? 20 : 28) + 'px "M PLUS Rounded 1c", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, y + dy + 2);
  ctx.restore();
}

const Tutorial = {
  idx: 0,
  start: 0,
  lastAct: -1,

  slides: [
    { animal: 0, draw(ctx, lt, t) {
      const pop = ease(lt / 0.7);
      const lit = new Set(); const k = Math.floor(lt * 2.2) % 16;
      for (let i = 1; i <= Math.min(12, k); i++) lit.add(i);
      ctx.save(); ctx.translate(CX, CY); ctx.scale(pop, pop); ctx.translate(-CX, -CY);
      drawClock(ctx, CX, CY, CR, { hour: 10 + 10 / 60, minute: 10, theme: ANIMALS[0].theme, animal: 0, t, litNumbers: lit, pulseNumber: k <= 12 ? k : 0 });
      ctx.restore();
      if (k >= 1 && k <= 12) canvasLabel(ctx, String(k), CX + 270, CY - 60, '#ff7a45', 56);
    } },
    { animal: 1, draw(ctx, lt, t) {
      const step = lt / 1.3, n = Math.floor(step), f = ease((step - n) / 0.4);
      const h = (n % 12) + f;
      const cur = ((n + (f > 0.5 ? 1 : 0)) % 12) + 0;
      const shown = cur === 0 ? 12 : cur;
      drawClock(ctx, CX, CY, CR, { hour: h, minute: 0, theme: ANIMALS[1].theme, animal: 1, t, glowHour: true, pulseNumber: shown, litNumbers: new Set([shown]) });
      canvasLabel(ctx, I18n.lang === 'ja' ? shown + 'じ' : shown + " o'clock", CX + 300, CY, HOUR_COLOR, 40);
    } },
    { animal: 2, draw(ctx, lt, t) {
      const step = lt / 1.0, n = Math.floor(step), f = ease((step - n) / 0.45);
      const k = n % 13;
      const m = Math.min(12, k + (k < 12 ? f : 0)) * 5;
      const lit = new Set(); for (let i = 1; i <= Math.min(k, 12); i++) lit.add(i % 12);
      drawClock(ctx, CX, CY, CR, { hour: 12 + m / 60, minute: m, theme: ANIMALS[2].theme, animal: 2, t, glowMinute: true, minuteNums: true, litMinute: lit });
      const mins = Math.min(k, 12) * 5;
      if (k > 0) canvasLabel(ctx, I18n.lang === 'ja' ? mins + (mins % 10 === 0 ? 'ぷん' : 'ふん') : mins + ' minutes', CX + 330, CY, MIN_COLOR, 40);
    } },
    { animal: 3, draw(ctx, lt, t) {
      const loop = lt % 5;
      const mm = 30 + 30 * ease(loop / 1.5);   // long hand sweeps from 6 up to 12
      const done = loop > 1.5;
      drawClock(ctx, CX, CY, CR, { hour: 2 + mm / 60, minute: mm, theme: ANIMALS[3].theme, animal: 3, t, glowMinute: done, pulseNumber: done ? (Math.floor(t * 1.5) % 2 ? 12 : 3) : 0, litNumbers: done ? new Set([3, 12]) : null });
      if (loop > 1.6) canvasLabel(ctx, '3:00', CX + 300, CY - 30, '#8a6cd8', 52);
      if (loop > 2.2) canvasLabel(ctx, I18n.lang === 'ja' ? '3じ ちょうど' : "3 o'clock", CX + 300, CY + 50, '#fff', 30, '#4a3328');
    } },
    { animal: 4, draw(ctx, lt, t) {
      const loop = lt % 6;
      const m = 30 * ease((loop - 0.5) / 2.5);
      drawClock(ctx, CX, CY, CR, { hour: 3 + m / 60, minute: m, theme: ANIMALS[4].theme, animal: 4, t, glowMinute: loop > 3, glowHour: loop > 4, pulseNumber: loop > 3 ? 6 : 0, litNumbers: loop > 3 ? new Set([6]) : null });
      if (loop > 3) canvasLabel(ctx, '3:30', CX + 300, CY - 30, '#8a6cd8', 52);
      if (loop > 3.5) canvasLabel(ctx, I18n.lang === 'ja' ? '3じ はん' : 'half past 3', CX + 300, CY + 50, '#fff', 30, '#4a3328');
    } },
    { animal: 5, draw(ctx, lt, t) {
      const loop = lt % 8;
      const p1 = loop < 2.5, p2 = loop >= 2.5 && loop < 5.5;
      const lit = new Set();
      if (loop >= 2.5) { const c = Math.min(3, Math.floor((loop - 2.5) / 0.8) + 1); for (let i = 1; i <= c; i++) lit.add(i); }
      drawClock(ctx, CX, CY, CR, { hour: 8.25, minute: 15, theme: ANIMALS[5].theme, animal: 5, t, glowHour: p1, glowMinute: p2, minuteNums: loop >= 2.5, litMinute: lit, litNumbers: p1 ? new Set([8]) : null, pulseNumber: p1 ? 8 : 0 });
      if (loop > 0.5) canvasLabel(ctx, I18n.lang === 'ja' ? '① 8じ' : '1) 8', CX + 320, CY - 110, HOUR_COLOR, 40);
      if (loop >= 2.5) canvasLabel(ctx, I18n.lang === 'ja' ? '② ' + lit.size * 5 + 'ふん' : '2) ' + lit.size * 5, CX + 320, CY - 30, MIN_COLOR, 40);
      if (loop >= 5.5) canvasLabel(ctx, '8:15', CX + 320, CY + 70, '#8a6cd8', 60);
    } },
    { animal: 6, sky: true, draw(ctx, lt, t) {
      const h24 = (lt * 1.5) % 24;
      drawClock(ctx, CX, CY, CR, { hour: h24, minute: (h24 % 1) * 60, theme: ANIMALS[6].theme, animal: 6, t });
      const pm = h24 >= 12;
      const lab = I18n.lang === 'ja' ? (pm ? 'ごご' : 'ごぜん') : (pm ? 'PM' : 'AM');
      canvasLabel(ctx, lab, CX + 300, CY - 40, pm ? '#5a4fb8' : '#ffa53d', 58);
      const hh = Math.floor(h24);
      canvasLabel(ctx, TimeFmt.label(hh, 0), CX + 300, CY + 50, '#fff', 30, '#4a3328');
      const lap = pm ? 2 : 1;
      canvasLabel(ctx, I18n.lang === 'ja' ? lap + 'かいめ' : (lap === 1 ? '1st time around' : '2nd time around'), CX - 330, CY - 120, 'rgba(255,255,255,.9)', 24, '#4a3328');
      return h24;
    } },
    { animal: 7, draw(ctx, lt, t) {
      const loop = lt % 9;
      // actions: [time, type].  Each tap moves one step; the long hold on ▶ moves one minute at a time.
      const acts = [[0.8, 'up'], [1.3, 'up'], [1.8, 'up'], [2.5, 'right'], [2.9, 'right']];
      const HOLD0 = 3.4, HOLD_STEP = 0.1;
      for (let k = 1; k <= 13; k++) acts.push([HOLD0 + k * HOLD_STEP, 'hold']);
      acts.push([5.3, 'space'], [6.4, 'enter']);
      let h = 0, m = 0, last = null, lastIdx = -1;
      acts.forEach(([at, a], i) => {
        if (loop >= at) {
          if (a === 'up') h++; if (a === 'right' || a === 'hold') m += 1; if (a === 'space') h += 12;
          last = [at, a]; lastIdx = i;
        }
      });
      if (lastIdx !== this._last) {
        if (lastIdx >= 0 && lastIdx !== this._last) {
          const a = acts[lastIdx][1];
          if (a === 'up') Sound.wind('hour'); else if (a === 'right' || a === 'hold') Sound.wind('minute'); else if (a === 'space') Sound.toggle(); else Sound.correct();
        }
        this._last = lastIdx;
      }
      const holding = loop >= HOLD0 && loop < HOLD0 + 13 * HOLD_STEP + 0.15;
      const pressed = (k) => (k === 'right' && holding) || (last && last[1] === k && loop - last[0] < 0.35);
      this._h = this._h === undefined ? h : this._h + (h + m / 60 - this._h) * 0.2;
      this._m = this._m === undefined ? m : this._m + (m - this._m) * 0.35;
      if (loop < 0.1) { this._h = 0; this._m = 0; }
      drawClock(ctx, CX - 120, CY, CR, { hour: this._h, minute: this._m, theme: ANIMALS[7].theme, animal: 7, t, glowHour: pressed('up'), glowMinute: pressed('right') });
      const kx = 960, ky = CY + 10;
      drawKey(ctx, kx, ky - 70, '▲', HOUR_COLOR, pressed('up'));
      drawKey(ctx, kx, ky, '▼', HOUR_COLOR, false);
      drawKey(ctx, kx - 80, ky, '◀', MIN_COLOR, false);
      drawKey(ctx, kx + 80, ky, '▶', MIN_COLOR, pressed('right'));
      drawKey(ctx, kx, ky + 90, 'Space', '#8a6cd8', pressed('space'), 200);
      drawKey(ctx, kx + 170, ky + 90, 'Enter', '#4cc970', pressed('enter'), 110);
      const pm = (h % 24) >= 12;
      canvasLabel(ctx, TimeFmt.label(h % 24, m % 60), kx + 40, ky - 170, pm ? '#5a4fb8' : '#ffa53d', 34);
      if (loop > 6.4) { Particles.list.length < 5 && Particles.sparkle(CX - 120, CY, 20, '#ffd166'); }
      return (h % 24) + m / 60;
    } },
    { animal: 8, draw(ctx, lt, t) {
      const loop = lt % 8;
      drawClock(ctx, CX - 130, CY, CR, { hour: 4.5, minute: 30, theme: ANIMALS[8].theme, animal: 8, t });
      const typed = loop < 1 ? '' : loop < 1.8 ? '4' : loop < 2.6 ? '4:3' : '4:30';
      const [hs, ms] = typed.split(':');
      const bx = 960, by = CY + 10;
      for (const [i, txt, col] of [[0, hs || '', HOUR_COLOR], [1, ms || '', MIN_COLOR]]) {
        Draw.rr(ctx, bx - 120 + i * 140, by - 40, 100, 80, 18); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = '#e8dfe9'; ctx.stroke();
        ctx.fillStyle = col; ctx.font = '800 50px "M PLUS Rounded 1c", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(txt, bx - 70 + i * 140, by + 3);
      }
      ctx.fillStyle = '#4a3328'; ctx.font = '800 50px "M PLUS Rounded 1c", sans-serif'; ctx.fillText(':', bx, by);
      const pmOn = loop > 3.6;
      canvasLabel(ctx, I18n.t('am'), bx - 60, by + 100, 'rgba(255,255,255,.9)', 30, '#7a6458');
      canvasLabel(ctx, I18n.t('pm'), bx + 60, by + 100, pmOn ? '#5a4fb8' : 'rgba(255,255,255,.9)', 30, pmOn ? '#fff' : '#7a6458');
      if (loop > 4.6) canvasLabel(ctx, '✓', bx + 170, by + 100, '#4cc970', 34);
      return 16.5;
    } },
    { animal: 9, draw(ctx, lt, t) {
      const frac = 1 - (lt % 10) / 10;
      drawHourglass(ctx, CX + 300, CY + 10, 250, frac, t, 0);
      drawClock(ctx, CX - 120, CY, CR * 0.9, { hour: 9, minute: 0, theme: ANIMALS[9].theme, animal: 9, t, mood: 'happy' });
    } }
  ],

  open() {
    this.idx = 0;
    this.show(0);
  },

  show(i) {
    this.idx = Math.max(0, Math.min(this.slides.length - 1, i));
    this.start = performance.now() / 1000;
    this.slides[7]._last = -1; this.slides[7]._h = undefined; this.slides[7]._m = undefined;
    const s = I18n.t('tut')[this.idx];
    document.getElementById('tutH').textContent = s.h;
    document.getElementById('tutP').textContent = s.p;
    const dots = document.getElementById('tutDots');
    dots.innerHTML = this.slides.map((_, k) => '<i class="' + (k === this.idx ? 'on' : '') + '"></i>').join('');
    document.getElementById('tutBack').style.visibility = this.idx === 0 ? 'hidden' : 'visible';
    const last = this.idx === this.slides.length - 1;
    document.getElementById('tutNextLbl').textContent = last ? I18n.t('play') : I18n.t('next');
    this.speak();
  },

  speak() {
    const s = I18n.t('tut')[this.idx];
    Sound.say('tut' + this.idx, I18n.lang, s.h + '。 ' + s.p);
  },

  next() {
    Sound.pop();
    if (this.idx === this.slides.length - 1) { Sound.stopSpeech(); App.go('map'); return; }
    this.show(this.idx + 1);
  },
  back() { Sound.pop(); this.show(this.idx - 1); },

  render(ctx, t) {
    const lt = performance.now() / 1000 - this.start;
    const sl = this.slides[this.idx];
    // sky for AM/PM & interactive slides follows the demo, others sit at a sunny morning
    let skyHour = 9.5;
    if (sl.sky) skyHour = (lt * 1.5) % 24;
    if (this.idx === 7) skyHour = 10;
    if (this.idx === 8) skyHour = 16.5;
    drawScene(ctx, skyHour, t);
    // guide animal
    const mood = lt < 1.5 ? 'wave' : 'idle';
    drawAnimal(ctx, sl.animal, this.idx === 7 || this.idx === 8 || this.idx === 9 ? 150 : 200, 360, 54, { t, body: true, mood, arm: lt < 1.5 ? 1 : 0.15 });
    sl.draw.call(sl, ctx, lt, t);
  },

  key(e) {
    if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.next(); }
    else if (e.key === 'ArrowLeft') { if (this.idx > 0) this.back(); }
    else if (e.key === 'Escape') { Sound.stopSpeech(); App.go('title'); }
  }
};
