/* Chrono Critters — core gameplay: Set the Clock and Read the Clock modes.
 * Copyright (C) 2026 Shawn Rapaz — GPL-3.0-or-later */
'use strict';

const LEVEL_TIME = 120;            // seconds in the hourglass
const DIFF_MULT = { easy: 1, medium: 1.5, hard: 2 };
const mod = (n, m) => ((n % m) + m) % m;

const $ = id => document.getElementById(id);

const Game = {
  mode: 'set', diff: 'easy', level: 0,
  target: { h: 0, m: 0 },
  hU: 0, mU: 0,                 // unwrapped hand positions (hours, minutes) chosen by the player
  dispH: 0, dispM: 0,           // smoothed hand positions for drawing
  timeLeft: LEVEL_TIME,
  mistakes: 0,
  state: 'idle',                // intro | play | won | timeout | paused
  stateT: 0,
  flip: 0,
  mood: 'idle', moodUntil: 0,
  arm: 0,
  glow: { hour: 0, minute: 0 },
  shake: 0,
  clockX: 640,
  lastTick: 0,
  lastWind: 0,
  input: { h: '', m: '', ap: null, focus: 'h' },
  scoreShown: 0,
  playAccum: 0,
  prevTarget: null,

  layout() {
    return this.mode === 'set'
      ? { cy: 400, r: 162 }
      : { cy: 346, r: 156 };
  },

  /* ---------- level setup ---------- */
  randomTarget() {
    const d = this.diff;
    let h, m;
    for (let tries = 0; tries < 50; tries++) {
      if (d === 'easy') { h = 6 + Math.floor(Math.random() * 15); m = 0; }                  // 6 AM – 8 PM, o'clock
      else if (d === 'medium') { h = Math.floor(Math.random() * 24); m = [0, 15, 30, 45][Math.floor(Math.random() * 4)]; }
      else {
        // Hard: exact minutes such as 8:23 PM, 9:11 AM or 12:34 PM (never a multiple of 5)
        h = Math.floor(Math.random() * 24);
        m = Math.floor(Math.random() * 12) * 5 + 1 + Math.floor(Math.random() * 4);
      }
      const same = this.prevTarget && this.prevTarget.h === h && this.prevTarget.m === m;
      if (!same && !(this.mode === 'set' && h === 0 && m === 0)) break;
    }
    return { h, m };
  },

  start(level) {
    const st = Store.settings;
    this.run++;
    this.mode = st.mode; this.diff = st.difficulty; this.level = level;
    this.target = this.randomTarget();
    this.prevTarget = this.target;
    this.hU = 0; this.mU = 0;
    this.dispH = 0; this.dispM = 0;
    this.timeLeft = LEVEL_TIME;
    this.mistakes = 0;
    this.state = 'intro'; this.stateT = 0;
    this.flip = Math.PI;
    this.mood = 'wave'; this.moodUntil = 2.2;
    this.arm = 1;
    this.clockX = 640;
    this.lastTick = 0;
    this.input = { h: '', m: '', ap: null, focus: 'h' };
    this.scoreShown = Store.data.score[this.mode];
    this.playAccum = 0;
    Particles.list = [];

    $('result').classList.remove('show');
    $('screen-game').classList.remove('resulting');
    $('pause').classList.remove('show');
    $('setControls').classList.toggle('show', this.mode === 'set');
    $('readControls').classList.toggle('show', this.mode === 'read');
    $('ampmPill').style.display = this.mode === 'set' ? '' : 'none';
    this.refreshTexts();
    const card = $('targetCard');
    card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
    this.updateHud(true);
    this.updateInput();
    const name = I18n.animal(level);
    setTimeout(() => this.say(I18n.t(this.mode === 'set' ? 'greet' : 'greetRead', { animal: name }), 3200), 350);
    Sound.whoosh();
  },

  /** Re-render all translated texts on the game screen (also on language change). */
  refreshTexts() {
    const tg = this.target;
    $('hudLevel').textContent = I18n.t('level') + ' ' + (this.level + 1) + ' / ' + LEVEL_COUNT;
    $('hudAnimal').textContent = I18n.animal(this.level) + ' · ' + I18n.t(this.diff);
    const card = $('targetCard');
    card.classList.toggle('read', this.mode === 'read');
    $('tPrompt').textContent = I18n.t(this.mode === 'set' ? 'setPrompt' : 'readPrompt');
    const pm = TimeFmt.isPM(tg.h);
    $('tDigits').innerHTML = '<span class="h">' + TimeFmt.hour12(tg.h) + '</span><span class="c">:</span><span class="m">' + TimeFmt.pad(tg.m) + '</span>';
    const ap = $('tAmPm');
    ap.className = 't-ampm ' + (pm ? 'pm' : 'am');
    ap.innerHTML = icon(pm ? 'moon' : 'sun', 28) + I18n.t(pm ? 'pm' : 'am');
    $('tWords').textContent = TimeFmt.words(tg.h, tg.m);
    const per = TimeFmt.period(tg.h);
    const ico = per === 'morning' ? 'sunrise' : per === 'afternoon' ? 'sun' : per === 'evening' ? 'sunset' : 'moon';
    $('tPeriod').innerHTML = icon(ico, 36) + '<span>' + I18n.t(per) + '</span>';
    this.updatePill(false);
    I18n.apply($('screen-game'));
  },

  curH24() { return mod(this.hU, 24); },
  curM() { return mod(this.mU, 60); },

  updatePill(anim) {
    const pm = this.curH24() >= 12;
    $('pillVal').innerHTML = icon(pm ? 'moon' : 'sun', 30) + '<span>' + I18n.t(pm ? 'pm' : 'am') + '</span>';
    if (anim) { const p = $('ampmPill'); p.classList.remove('flip'); void p.offsetWidth; p.classList.add('flip'); }
  },

  updateHud(instant) {
    const target = Store.data.score[this.mode];
    if (instant) this.scoreShown = target;
    $('hudScore').textContent = Math.round(this.scoreShown).toLocaleString();
  },

  say(text, ms, warn) {
    const b = $('bubble');
    b.textContent = text;
    b.classList.toggle('warn', !!warn);
    b.classList.add('show');
    clearTimeout(this._bubbleT);
    this._bubbleT = setTimeout(() => b.classList.remove('show'), ms || 3000);
  },

  setMood(m, secs) { this.mood = m; this.moodUntil = this.stateT + secs; },

  /* ---------- actions (keyboard / on-screen buttons) ---------- */
  canAct() { return this.state === 'play' || this.state === 'intro'; },

  act(a) {
    if (!this.canAct()) return;
    if (this.state === 'intro') this.beginPlay();
    if (this.mode === 'set') {
      // One press = one step: the short hand moves one hour, the long hand one minute.
      const now = performance.now();
      const windOk = now - this.lastWind > 70;
      const wasPM = this.curH24() >= 12;
      switch (a) {
        case 'hup': this.hU++; this.glow.hour = 0.6; if (windOk) Sound.wind('hour'); break;
        case 'hdown': this.hU--; this.glow.hour = 0.6; if (windOk) Sound.wind('hour'); break;
        // Like a real clock, passing 12 on the long hand carries the short hand to the next hour.
        case 'mright': if (this.curM() === 59) this.hU++; this.mU++; this.glow.minute = 0.6; if (windOk) Sound.wind('minute'); break;
        case 'mleft': if (this.curM() === 0) this.hU--; this.mU--; this.glow.minute = 0.6; if (windOk) Sound.wind('minute'); break;
        case 'ampm': this.hU += 12; Sound.toggle(); break;
        case 'check': this.check(); return;
        default: return;
      }
      if (windOk) this.lastWind = now;
      this.arm = 1;
      if ((this.curH24() >= 12) !== wasPM) this.updatePill(true);
    } else {
      if (a === 'check') this.check();
    }
  },

  beginPlay() { this.state = 'play'; },

  /** setTimeout that is cancelled when the level is restarted or left, so a
   *  result card from the last level can never pop up over the next one. */
  run: 0,
  later(fn, ms) { const run = this.run; setTimeout(() => { if (this.run === run) fn(); }, ms); },

  /* ---------- press-and-hold for the hand keys and buttons ----------
   * A tap moves exactly one step.  Holding keeps moving, one step at a time,
   * until the key or button is let go (minutes speed up after a moment). */
  HOLD_DELAY: 420,
  _hold: null,
  isHandAct(a) { return a === 'hup' || a === 'hdown' || a === 'mleft' || a === 'mright'; },
  holdStart(a) {
    this.holdStop();
    if (!this.canAct()) return;
    this.act(a);
    const isHour = a === 'hup' || a === 'hdown';
    const h = this._hold = { a, n: 0, timer: 0 };
    const tick = () => {
      if (this._hold !== h) return;
      if (!this.canAct()) { this.holdStop(); return; }
      this.act(a); h.n++;
      h.timer = setTimeout(tick, isHour ? 300 : (h.n > 12 ? 55 : 110));
    };
    h.timer = setTimeout(tick, this.HOLD_DELAY);
  },
  holdStop(a) {
    if (!this._hold || (a && this._hold.a !== a)) return;
    clearTimeout(this._hold.timer);
    this._hold = null;
  },
  onKeyUp(e) {
    const map = { ArrowUp: 'hup', ArrowDown: 'hdown', ArrowLeft: 'mleft', ArrowRight: 'mright' };
    if (map[e.key]) this.holdStop(map[e.key]);
  },

  /* ---------- read-mode text input ---------- */
  typeDigit(d) {
    if (!this.canAct() || this.mode !== 'read') return;
    if (this.state === 'intro') this.beginPlay();
    const inp = this.input;
    Sound.key();
    if (inp.focus === 'h') {
      if (inp.h.length === 0) {
        if (d === '0') return;
        inp.h = d;
        if (d !== '1') inp.focus = 'm';          // 2-9 can only be a one-digit hour
      } else if (inp.h === '1' && '012'.includes(d)) {
        inp.h += d; inp.focus = 'm';
      } else {                                   // "1" followed by 3-9 → start the minutes
        inp.focus = 'm'; inp.m = d;
      }
    } else if (inp.m.length < 2) {
      if (inp.m.length === 0 && Number(d) > 5) { inp.m = '0' + d; }
      else inp.m += d;
    }
    this.updateInput();
  },

  backspace() {
    if (!this.canAct() || this.mode !== 'read') return;
    const inp = this.input;
    Sound.key();
    if (inp.focus === 'm') {
      if (inp.m.length) inp.m = inp.m.slice(0, -1);
      else { inp.focus = 'h'; inp.h = inp.h.slice(0, -1); }
    } else inp.h = inp.h.slice(0, -1);
    this.updateInput();
  },

  setFocus(f) { if (this.mode === 'read') { this.input.focus = f; this.updateInput(); } },

  chooseAP(ap) {
    if (!this.canAct() || this.mode !== 'read') return;
    if (this.state === 'intro') this.beginPlay();
    this.input.ap = ap; Sound.toggle(); this.updateInput();
  },

  updateInput() {
    const inp = this.input;
    $('inH').textContent = inp.h; $('inM').textContent = inp.m;
    $('inH').classList.toggle('focus', inp.focus === 'h');
    $('inM').classList.toggle('focus', inp.focus === 'm');
    document.querySelectorAll('.ampm-choice button').forEach(b => b.classList.toggle('on', b.dataset.ap === inp.ap));
  },

  /* ---------- checking answers ---------- */
  check() {
    if (this.state !== 'play') return;
    const tg = this.target;
    let h24, m;
    if (this.mode === 'set') { h24 = this.curH24(); m = this.curM(); }
    else {
      const inp = this.input;
      if (!inp.h || !inp.m) { this.say(I18n.t('typeTime'), 2500, true); Sound.wrong(); return; }
      const hh = parseInt(inp.h, 10), mm = parseInt(inp.m, 10);
      if (!(hh >= 1 && hh <= 12 && mm >= 0 && mm <= 59)) { this.say(I18n.t('typeTime'), 2500, true); Sound.wrong(); return; }
      if (!inp.ap) { this.say(I18n.t('chooseAmPm'), 2500, true); Sound.wrong(); return; }
      h24 = (hh % 12) + (inp.ap === 'pm' ? 12 : 0); m = mm;
    }
    const hourOk = h24 % 12 === tg.h % 12;
    const minOk = m === tg.m;
    const apOk = (h24 >= 12) === (tg.h >= 12);
    if (hourOk && minOk && apOk) { this.win(); return; }

    this.mistakes++;
    const r = this.mode === 'set' ? '' : 'Read';
    if (!hourOk) Store.recordMistake('hour', this.mode, this.diff, tg.m);
    if (!minOk) Store.recordMistake('minute', this.mode, this.diff, tg.m);
    if (!apOk) Store.recordMistake('ampm', this.mode, this.diff, tg.m);
    let hint;
    if (!hourOk) { hint = 'hintHour' + r; this.glow.hour = 2.0; }
    else if (!minOk) { hint = 'hintMinute' + r; this.glow.minute = 2.0; }
    else hint = 'hintAmPm' + r;
    this.say(I18n.t(hint), 4200, true);
    Sound.wrong();
    this.setMood('think', 2.2);
    this.shake = 0.5;
  },

  calcScore() {
    const mult = DIFF_MULT[this.diff];
    const base = 100 + Math.round(this.timeLeft);
    return Math.max(Math.round(10 * mult), Math.round(base * mult - this.mistakes * 15 * mult));
  },

  calcStars() {
    if (this.mistakes === 0 && this.timeLeft >= 60) return 3;
    if (this.mistakes <= 1 && this.timeLeft >= 30) return 2;
    return 1;
  },

  win() {
    this.state = 'won'; this.stateT = 0;
    const firstTime = Store.stars(this.mode, this.level) === null;
    const score = this.calcScore(), stars = this.calcStars();
    Store.recordResult({ mode: this.mode, diff: this.diff, level: this.level, h24: this.target.h, m: this.target.m,
      ok: true, mistakes: this.mistakes, secs: Math.round(LEVEL_TIME - this.timeLeft), score, stars });
    this.flushPlayTime();
    Sound.correct();
    this.setMood('happy', 99);
    this.dispH = this.hU + this.curM() / 60;   // settle
    const L = this.layout();
    Particles.confetti(this.clockX, L.cy - 40, 110);
    $('bubble').classList.remove('show');
    this.later(() => Sound.sayTime(this.target.h, this.target.m, I18n.lang), 650);
    this.later(() => this.showResult(true, stars, score, firstTime), 1100);
  },

  timeout() {
    this.state = 'timeout'; this.stateT = 0;
    const firstTime = Store.stars(this.mode, this.level) === null;
    Store.recordResult({ mode: this.mode, diff: this.diff, level: this.level, h24: this.target.h, m: this.target.m,
      ok: false, mistakes: this.mistakes, secs: LEVEL_TIME, score: 0, stars: 0 });
    this.flushPlayTime();
    Sound.timeout();
    this.setMood('think', 2.5);
    // show the right answer on the clock
    if (this.mode === 'set') {
      const tH = this.target.h, tM = this.target.m;
      this.hU = this.hU + (mod(tH - this.curH24() + 12, 24) - 12);
      this.mU = this.mU + (mod(tM - this.curM() + 30, 60) - 30);
      this.updatePill(true);
    } else {
      this.input.h = String(TimeFmt.hour12(this.target.h)); this.input.m = TimeFmt.pad(this.target.m);
      this.input.ap = this.target.h >= 12 ? 'pm' : 'am'; this.updateInput();
    }
    this.later(() => Sound.sayTime(this.target.h, this.target.m, I18n.lang), 900);
    this.later(() => this.showResult(false, 0, 0, firstTime), 900);
  },

  showResult(ok, stars, score, firstTime) {
    const tg = this.target;
    $('resTitle').textContent = ok ? I18n.t('great')[Math.floor(Math.random() * 6)] : I18n.t('timesUp');
    const pm = TimeFmt.isPM(tg.h);
    const time = '<span class="h">' + TimeFmt.hour12(tg.h) + '</span>:<span class="m">' + TimeFmt.pad(tg.m) + '</span> ';
    const ap = '<span style="font-size:.6em;color:' + (pm ? '#5a4fb8' : '#ff9d2e') + '">' + I18n.t(pm ? 'pm' : 'am') + '</span>';
    $('resTime').innerHTML = I18n.lang === 'ja' ? ap + ' ' + time : time + ap;
    $('resWords').textContent = TimeFmt.words(tg.h, tg.m);
    $('resMsg').textContent = ok ? '' : I18n.t('timesUpMsg');
    $('resPoints').textContent = ok ? '+' + score + ' ' + I18n.t('points') : '';
    const showSticker = firstTime;
    $('resSticker').classList.remove('show');
    const box = $('resStars');
    box.innerHTML = [0, 1, 2].map(i => '<span class="st' + (i < stars ? ' lit' : '') + '">' + icon('star', 64) + '</span>').join('');
    $('result').classList.add('show');
    $('screen-game').classList.add('resulting');
    const nextBtn = document.querySelector('[data-res="next"]');
    nextBtn.style.display = '';
    box.querySelectorAll('.st').forEach((el, i) => this.later(() => {
      el.classList.add('in');
      if (i < stars) { Sound.star(i); Particles.sparkle(1050 - 70 + i * 72, 250, 14, '#ffd166'); }
    }, 350 + i * 330));
    if (ok) {
      this.later(() => Sound.fanfare(), 1450);
      this.later(() => { if (showSticker) { $('resSticker').classList.add('show'); Particles.confetti(1050, 420, 40); } }, 1500);
      const sc = $('hudScore').parentElement; sc.classList.remove('bump'); void sc.offsetWidth; sc.classList.add('bump');
    }
    if (this.level === LEVEL_COUNT - 1 && ok && Store.data.progress[this.mode].every(p => p !== null)) {
      $('resMsg').textContent = I18n.t('allDone');
    }
    this.later(() => nextBtn.focus(), 100);
  },

  resultAction(a) {
    Sound.pop();
    Sound.stopSpeech();
    if (a === 'map') App.go('map');
    else if (a === 'again') this.start(this.level);
    else if (a === 'next') {
      if (this.level < LEVEL_COUNT - 1) this.start(this.level + 1);
      else App.go('map');
    }
  },

  pause() {
    this.holdStop();
    if (this.state !== 'play' && this.state !== 'intro') return;
    this._prevState = this.state;
    this.state = 'paused';
    $('pause').classList.add('show');
    Sound.pop();
  },
  resume() {
    if (this.state !== 'paused') return;
    this.state = this._prevState || 'play';
    $('pause').classList.remove('show');
    Sound.pop();
  },

  flushPlayTime() {
    if (this.playAccum > 0) { Store.addPlayTime(this.playAccum); this.playAccum = 0; Store.save(); }
  },

  leave() { this.run++; this.holdStop(); this.flushPlayTime(); Sound.stopSpeech(); this.state = 'idle'; },

  /* ---------- per-frame ---------- */
  update(dt) {
    this.stateT += dt;
    if (this.state === 'paused' || this.state === 'idle') return;

    if (this.flip > 0) this.flip = Math.max(0, this.flip - dt * 4.5);
    if (this.state === 'intro' && this.stateT > 1.6) this.beginPlay();

    if (this.state === 'play') {
      this.timeLeft -= dt;
      this.playAccum += dt * 1000;
      if (this.playAccum > 5000) { Store.addPlayTime(this.playAccum); this.playAccum = 0; Store.save(); }
      const sec = Math.ceil(this.timeLeft);
      if (sec <= 10 && sec !== this.lastTick && sec > 0) { this.lastTick = sec; Sound.sandTick(); }
      if (this.timeLeft <= 0) { this.timeLeft = 0; this.timeout(); }
    }
    if (this.stateT > this.moodUntil && this.state !== 'won') this.mood = 'idle';

    // ease hands
    const tgtH = this.hU + this.curM() / 60;   // hour hand creeps forward with the minutes, like a real clock
    const k = 1 - Math.pow(0.0001, dt);
    this.dispH += (tgtH - this.dispH) * k * 0.9;
    this.dispM += (this.mU - this.dispM) * k * 0.9;
    this.glow.hour = Math.max(0, this.glow.hour - dt);
    this.glow.minute = Math.max(0, this.glow.minute - dt);
    this.arm = Math.max(0.1, this.arm - dt * 1.5);
    this.shake = Math.max(0, this.shake - dt);

    // slide clock left when the result card is shown
    const wantX = (this.state === 'won' || this.state === 'timeout') && this.stateT > 0.9 ? 520 : 640;
    this.clockX += (wantX - this.clockX) * Math.min(1, dt * 5);

    // count up displayed score
    const target = Store.data.score[this.mode];
    if (this.scoreShown < target) {
      this.scoreShown = Math.min(target, this.scoreShown + Math.max(1, (target - this.scoreShown) * dt * 3));
      $('hudScore').textContent = Math.round(this.scoreShown).toLocaleString();
    }
  },

  render(ctx, t) {
    const L = this.layout();
    let sky;
    if (this.mode === 'set') sky = mod(this.dispH, 24);
    else sky = this.target.h + this.target.m / 60;
    drawScene(ctx, sky, t);

    // hand positions to draw
    let hour, minute;
    if (this.mode === 'set') { hour = this.dispH; minute = this.dispM; }
    else { hour = this.target.h + this.target.m / 60; minute = this.target.m; }

    const sx = this.shake > 0 ? Math.sin(this.shake * 60) * 8 * this.shake : 0;
    drawClock(ctx, this.clockX + sx, L.cy, L.r, {
      hour, minute, t, theme: ANIMALS[this.level].theme, animal: this.level, mood: this.mood === 'happy' ? 'happy' : undefined,
      minuteNums: this.diff !== 'hard', glowHour: this.glow.hour > 0, glowMinute: this.glow.minute > 0
    });

    // the animal friend beside the clock
    const ax = 205, ay = this.mode === 'set' ? 372 : 352;
    drawAnimal(ctx, this.level, ax, ay, 60, {
      t, body: true, mood: this.mood === 'idle' ? undefined : this.mood, arm: this.mode === 'set' ? this.arm : 0.1,
      look: { x: 1, y: 0 }
    });

    // hourglass
    const hgY = this.mode === 'set' ? 430 : 390;
    drawHourglass(ctx, 1065, hgY, this.mode === 'set' ? 250 : 230, this.timeLeft / LEVEL_TIME, t, this.flip);
  },

  key(e) {
    const k = e.key;
    if (this.state === 'paused') {
      if (k === 'Escape' || k === 'Enter' || k === ' ') { e.preventDefault(); this.resume(); }
      return;
    }
    if (this.state === 'won' || this.state === 'timeout') {
      if (!$('result').classList.contains('show')) return;
      if (k === 'Escape') { this.resultAction('map'); }
      return;     // Enter activates the focused result button natively
    }
    if (k === 'Escape' || (this.mode === 'set' && (k === 'p' || k === 'P'))) { e.preventDefault(); this.pause(); return; }
    if (this.mode === 'set') {
      const map = { ArrowUp: 'hup', ArrowDown: 'hdown', ArrowLeft: 'mleft', ArrowRight: 'mright', ' ': 'ampm', Enter: 'check' };
      if (map[k]) {
        e.preventDefault();
        if (e.repeat) return;                 // holding is handled by holdStart, not key auto-repeat
        if (this.isHandAct(map[k])) this.holdStart(map[k]); else this.act(map[k]);
        const btn = document.querySelector('#setControls [data-act="' + map[k] + '"]');
        if (btn) { btn.classList.add('pressed'); setTimeout(() => btn.classList.remove('pressed'), 120); }
      }
    } else {
      if (/^[0-9]$/.test(k)) { e.preventDefault(); this.typeDigit(k); }
      else if (k === 'Backspace' || k === 'Delete') { e.preventDefault(); this.backspace(); }
      else if (k === ':' || k === 'Tab' || k === '.' || k === 'ArrowRight') { e.preventDefault(); this.setFocus('m'); }
      else if (k === 'ArrowLeft') { e.preventDefault(); this.setFocus('h'); }
      else if (k === 'a' || k === 'A') this.chooseAP('am');
      else if (k === 'p' || k === 'P') this.chooseAP('pm');
      else if (k === 'ArrowUp' || k === 'ArrowDown' || k === ' ') { e.preventDefault(); this.chooseAP(this.input.ap === 'am' ? 'pm' : 'am'); }
      else if (k === 'Enter') { e.preventDefault(); if (!e.repeat) this.check(); }
    }
  }
};
