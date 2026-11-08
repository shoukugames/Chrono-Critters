/* Chrono Critters — audio: time-of-day BGM (happy by day, sleepy by night),
 * clock-winding ratchet and gentle sound effects, all synthesized live with the
 * Web Audio API; plus the spoken voice, played from natural pre-recorded clips
 * in src/voice/ (made with tools/make_voice.py).
 * Copyright (C) 2026 Shawn Rapaz — GPL-3.0-or-later */
'use strict';

const midi = n => 440 * Math.pow(2, (n - 69) / 12);

const Sound = {
  ctx: null,
  master: null,
  musicBus: null,
  sfxBus: null,
  reverb: null,
  voiceOn: true,
  _clip: null,
  _nextChordAt: 0,
  _chordIdx: 0,
  _nextBellAt: 0,
  _noise: null,
  _duck: null,

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = this.ctx = new AC();

    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 3;
    this.master.connect(comp); comp.connect(ctx.destination);

    this._duck = ctx.createGain();           // lowered while speaking
    this._duck.connect(this.master);
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0;
    this.musicBus.connect(this._duck);
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.55;
    this.sfxBus.connect(this.master);

    // One bus per music mood so day and night can cross-fade.
    this.dayBus = ctx.createGain(); this.dayBus.gain.value = 0; this.dayBus.connect(this.musicBus);
    this.nightBus = ctx.createGain(); this.nightBus.gain.value = 0; this.nightBus.connect(this.musicBus);

    // Soft hall reverb made from decaying noise (night), and a small bright room (day).
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this._impulse(4.5, 2.6);
    const revGain = ctx.createGain(); revGain.gain.value = 0.55;
    this.reverb.connect(revGain); revGain.connect(this.nightBus);
    this.dayRev = ctx.createConvolver();
    this.dayRev.buffer = this._impulse(1.4, 3.2);
    const dayRevGain = ctx.createGain(); dayRevGain.gain.value = 0.3;
    this.dayRev.connect(dayRevGain); dayRevGain.connect(this.dayBus);
    this.sfxReverb = ctx.createConvolver();
    this.sfxReverb.buffer = this._impulse(1.8, 3);
    const sr = ctx.createGain(); sr.gain.value = 0.25;
    this.sfxReverb.connect(sr); sr.connect(this.sfxBus);

    // white noise buffer for clicks and whooshes
    const len = ctx.sampleRate;
    this._noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this._noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    // music echo
    this.echo = ctx.createDelay(2);
    this.echo.delayTime.value = 0.55;
    const fb = ctx.createGain(); fb.gain.value = 0.35;
    const echoLP = ctx.createBiquadFilter(); echoLP.type = 'lowpass'; echoLP.frequency.value = 2200;
    this.echo.connect(echoLP); echoLP.connect(fb); fb.connect(this.echo);
    echoLP.connect(this.reverb);

    if (this.bgmOn) this.startBGM();
  },

  resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  _impulse(seconds, decay) {
    const ctx = this.ctx, rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  },

  /* ---------------- Background music ----------------
   * Two moods that follow the time of day:
   *   day   (6:00 AM – 5:59 PM): a happy, bouncy marimba-and-ukulele tune
   *   night (6:00 PM – 5:59 AM): the soft, sleepy ambient pad with music-box bells
   * Switching moods cross-fades over a few seconds. */
  PROG: [
    { notes: [53, 57, 60, 64], bass: 41 },   // Fmaj7
    { notes: [52, 55, 59, 62], bass: 40 },   // Em7
    { notes: [50, 53, 57, 60], bass: 38 },   // Dm7
    { notes: [48, 52, 55, 59, 62], bass: 36 } // Cmaj9
  ],
  BELLS: [72, 74, 76, 79, 81, 84, 86, 88],  // C major pentatonic, high and sparkly
  CHORD_LEN: 10,

  // Day tune: 16 bars, I–V–vi–IV with a lift at the end.  tones = chord tones low→high.
  DAY_CHORDS: {
    C:  { tones: [60, 64, 67, 72, 76, 79], bass: 36 },
    G:  { tones: [59, 62, 67, 71, 74, 79], bass: 43 },
    Am: { tones: [57, 60, 64, 69, 72, 76], bass: 45 },
    F:  { tones: [57, 60, 65, 69, 72, 77], bass: 41 },
    Em: { tones: [59, 64, 67, 71, 76, 79], bass: 40 },
    Dm: { tones: [57, 62, 65, 69, 74, 77], bass: 38 }
  },
  DAY_SONG: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C', 'F', 'G', 'Em', 'Am', 'Dm', 'G', 'C', 'C'],
  // Melody patterns: 8 eighth notes per bar, numbers index into the chord tones.
  DAY_MEL: [
    [2, null, 3, null, 4, 3, 2, null],
    [3, null, null, 2, 1, null, 2, null],
    [1, 2, 3, 5, 4, null, 3, null],
    [5, null, 4, null, 3, null, null, null],
    [null, null, 3, 4, 5, null, 3, 2],
    [2, 3, 2, null, 1, null, null, null],
    [4, null, 4, 3, 2, null, 1, null]
  ],
  DAY_BPM: 104,
  LEVEL: { day: 1.3, night: 1 },   // evens out the loudness of the two moods

  bgmOn: true,
  mood: 'night',
  _bgmTimer: null,

  setBGM(on) {
    this.bgmOn = on;
    if (!this.ctx) return;
    if (on) this.startBGM(); else this.stopBGM();
  },

  /** 'day' or 'night' for a 24-hour clock value. */
  moodFor(h24) { const h = ((h24 % 24) + 24) % 24; return (h >= 6 && h < 18) ? 'day' : 'night'; },

  /** Pick the music for this time of day; cross-fades when it changes. */
  setMood(mood) {
    if (mood !== 'day' && mood !== 'night') return;
    if (mood === this.mood) return;
    this.mood = mood;
    if (!this.ctx || !this._bgmTimer) return;
    this._fadeMoods(3.5);
    this._armMood(mood);
  },

  _fadeMoods(sec) {
    const now = this.ctx.currentTime;
    for (const [m, bus] of [['day', this.dayBus], ['night', this.nightBus]]) {
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(bus.gain.value, now);
      bus.gain.linearRampToValueAtTime(m === this.mood ? this.LEVEL[m] : 0, now + sec);
      if (m !== this.mood) this._live[m] = now + sec + 0.5;   // keep scheduling until faded out
    }
  },

  _armMood(m) {
    const now = this.ctx.currentTime;
    if (this._live[m] === Infinity) return;
    this._live[m] = Infinity;
    if (m === 'night') { this._nextChordAt = now + 0.1; this._nextBellAt = now + 2; }
    else { this._dayNext = now + 0.15; this._dayStep = 0; }
  },

  startBGM() {
    if (!this.ctx || this._bgmTimer) return;
    const now = this.ctx.currentTime;
    this.musicBus.gain.cancelScheduledValues(now);
    this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, now);
    this.musicBus.gain.linearRampToValueAtTime(0.32, now + 3);
    this._live = { day: 0, night: 0 };
    this.dayBus.gain.setValueAtTime(this.mood === 'day' ? this.LEVEL.day : 0, now);
    this.nightBus.gain.setValueAtTime(this.mood === 'night' ? this.LEVEL.night : 0, now);
    this._armMood(this.mood);
    this._bgmTimer = setInterval(() => this._schedule(), 150);
    this._schedule();
  },

  stopBGM() {
    if (!this.ctx) return;
    clearInterval(this._bgmTimer); this._bgmTimer = null;
    const now = this.ctx.currentTime;
    this.musicBus.gain.cancelScheduledValues(now);
    this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, now);
    this.musicBus.gain.linearRampToValueAtTime(0, now + 1.5);
  },

  _schedule() {
    const now = this.ctx.currentTime, ahead = now + 0.6;
    if (this._live.night > now) this._scheduleNight(ahead);
    if (this._live.day > now) this._scheduleDay(ahead);
  },

  /* ----- night: slow dreamy pads and music-box bells ----- */
  _scheduleNight(ahead) {
    const ctx = this.ctx;
    if (this._nextChordAt < ctx.currentTime - 1) this._nextChordAt = ctx.currentTime + 0.1;
    if (this._nextBellAt < ctx.currentTime - 1) this._nextBellAt = ctx.currentTime + 1;
    while (this._nextChordAt < ahead) {
      const ch = this.PROG[this._chordIdx % this.PROG.length];
      this._pad(ch, this._nextChordAt, this.CHORD_LEN + 3.5);
      this._chordIdx++;
      this._nextChordAt += this.CHORD_LEN;
    }
    while (this._nextBellAt < ahead) {
      if (Math.random() < 0.65) {
        const n = this.BELLS[Math.floor(Math.random() * this.BELLS.length)];
        this._bell(midi(n), this._nextBellAt, 0.045 + Math.random() * 0.03);
        if (Math.random() < 0.3) {               // a little two-note answer
          const n2 = this.BELLS[Math.floor(Math.random() * this.BELLS.length)];
          this._bell(midi(n2), this._nextBellAt + 0.55, 0.03);
        }
      }
      this._nextBellAt += 2 + Math.random() * 3;
    }
  },

  _pad(chord, t0, dur) {
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, t0);
    out.gain.linearRampToValueAtTime(1, t0 + 3.2);
    out.gain.setValueAtTime(1, t0 + dur - 3.6);
    out.gain.linearRampToValueAtTime(0, t0 + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 800; lp.Q.value = 0.4;
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain();
    lfo.frequency.value = 0.06; lfoG.gain.value = 300;
    lfo.connect(lfoG); lfoG.connect(lp.frequency);
    lfo.start(t0); lfo.stop(t0 + dur + 0.1);
    out.connect(lp);
    const dry = ctx.createGain(); dry.gain.value = 0.55;
    lp.connect(dry); dry.connect(this.nightBus);
    lp.connect(this.reverb);

    const voice = (freq, type, gain, detune) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq; o.detune.value = detune;
      g.gain.value = gain;
      o.connect(g); g.connect(out);
      o.start(t0); o.stop(t0 + dur + 0.1);
    };
    for (const n of chord.notes) {
      const f = midi(n);
      voice(f, 'sine', 0.05, -5);
      voice(f, 'triangle', 0.028, 6);
    }
    voice(midi(chord.bass), 'sine', 0.07, 0);
    voice(midi(chord.bass + 12), 'sine', 0.025, 3);
  },

  _bell(freq, t0, vol) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.4);
    const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 3.01;
    const g2 = ctx.createGain(); g2.gain.value = 0.18;
    o1.connect(g); o2.connect(g2); g2.connect(g);
    g.connect(this.nightBus); g.connect(this.reverb); g.connect(this.echo);
    o1.start(t0); o2.start(t0); o1.stop(t0 + 2.5); o2.stop(t0 + 2.5);
  },

  /* ----- day: happy, bouncy marimba, ukulele strums, soft bass and shaker ----- */
  _scheduleDay(ahead) {
    const ctx = this.ctx;
    const eighth = 60 / this.DAY_BPM / 2;
    if (this._dayNext < ctx.currentTime - 0.5) this._dayNext = ctx.currentTime + 0.1;
    while (this._dayNext < ahead) {
      const step = this._dayStep, slot = step % 8, bar = Math.floor(step / 8);
      const name = this.DAY_SONG[bar % this.DAY_SONG.length];
      const ch = this.DAY_CHORDS[name];
      // gentle swing on the off-beats makes it bounce
      const t = this._dayNext + (slot % 2 ? eighth * 0.16 : 0);

      if (slot === 0) {
        this._dayMel = (bar % 4 === 3 && Math.random() < 0.35) ? null
          : this.DAY_MEL[Math.floor(Math.random() * this.DAY_MEL.length)];
        this._dayPad(ch, t, eighth * 8);
        if (bar % 8 === 0) this._glock(midi(ch.tones[3] + 12), t, 0.035);
      }
      // bass: root on 1, fifth on 3, a little pickup on the "and" of 4
      if (slot === 0) this._pluckBass(midi(ch.bass), t, 0.16);
      if (slot === 4) this._pluckBass(midi(ch.bass + 7), t, 0.12);
      if (slot === 7 && Math.random() < 0.5) this._pluckBass(midi(ch.bass + 12), t, 0.07);
      // ukulele strums on beats 2 and 4
      if (slot === 2 || slot === 6) this._strum(ch, t, 0.022);
      if (slot === 3 && Math.random() < 0.4) this._strum(ch, t, 0.012);
      // melody
      const mi = this._dayMel && this._dayMel[slot];
      if (mi != null) this._marimba(midi(ch.tones[mi] + 12), t, 0.09);
      // soft percussion
      if (slot === 0 || slot === 4) this._softKick(t, 0.22);
      if (slot === 2 || slot === 6) this._snap(t, 0.06);
      this._shaker(t, slot % 2 ? 0.05 : 0.025);

      this._dayStep++;
      this._dayNext += eighth;
    }
  },

  _marimba(freq, t0, vol) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
    const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 3.9;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.35, t0); g2.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
    o1.connect(g); o2.connect(g2); g2.connect(g);
    g.connect(this.dayBus); g.connect(this.dayRev);
    o1.start(t0); o2.start(t0); o1.stop(t0 + 0.75); o2.stop(t0 + 0.2);
  },

  _glock(freq, t0, vol) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2.76;
    const g2 = ctx.createGain(); g2.gain.value = 0.25;
    o.connect(g); o2.connect(g2); g2.connect(g);
    g.connect(this.dayBus); g.connect(this.dayRev);
    o.start(t0); o2.start(t0); o.stop(t0 + 1.7); o2.stop(t0 + 1.7);
  },

  _strum(ch, t0, vol) {
    const ctx = this.ctx;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    lp.connect(this.dayBus); lp.connect(this.dayRev);
    ch.tones.slice(0, 4).forEach((n, i) => {
      const ti = t0 + i * 0.014;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = midi(n);
      g.gain.setValueAtTime(0, ti);
      g.gain.linearRampToValueAtTime(vol, ti + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, ti + 0.32);
      o.connect(g); g.connect(lp);
      o.start(ti); o.stop(ti + 0.35);
    });
  },

  _pluckBass(freq, t0, vol) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(900, t0); lp.frequency.exponentialRampToValueAtTime(250, t0 + 0.3);
    o.type = 'triangle'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.45);
    o.connect(lp); lp.connect(g); g.connect(this.dayBus);
    o.start(t0); o.stop(t0 + 0.5);
  },

  _dayPad(ch, t0, dur) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.018, t0 + 0.4);
    g.gain.setValueAtTime(0.018, t0 + dur - 0.3);
    g.gain.linearRampToValueAtTime(0, t0 + dur + 0.2);
    g.connect(this.dayBus); g.connect(this.dayRev);
    ch.tones.slice(0, 3).forEach(n => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = midi(n);
      o.connect(g); o.start(t0); o.stop(t0 + dur + 0.3);
    });
  },

  _dayNoise(t0, dur, freq, q, vol, type) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this._noise;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(this.dayBus);
    src.start(t0, Math.random() * 0.5); src.stop(t0 + dur + 0.02);
  },
  _shaker(t0, vol) { this._dayNoise(t0, 0.05, 7000, 0.8, vol, 'highpass'); },
  _snap(t0, vol) { this._dayNoise(t0, 0.09, 1900, 1.2, vol, 'bandpass'); },
  _softKick(t0, vol) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(130, t0); o.frequency.exponentialRampToValueAtTime(48, t0 + 0.14);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
    o.connect(g); g.connect(this.dayBus);
    o.start(t0); o.stop(t0 + 0.25);
  },

  /* ---------------- Sound effects ---------------- */
  _ok() { return this.ctx && this.ctx.state === 'running'; },

  _tone(freq, t0, dur, type, vol, opts) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (opts && opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + (opts && opts.attack || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.sfxBus);
    if (!opts || opts.reverb !== false) g.connect(this.sfxReverb);
    o.start(t0); o.stop(t0 + dur + 0.05);
  },

  _noiseBurst(t0, dur, freq, q, vol, type) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this._noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = ctx.createBiquadFilter();
    f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(this.sfxBus);
    src.start(t0, Math.random() * 0.5); src.stop(t0 + dur + 0.02);
    return { src, f, g };
  },

  /** Mechanical clock-winding ratchet: a quick run of crisp clicks on a
   *  tiny metallic body.  'hour' sounds deeper, 'minute' brighter. */
  wind(kind) {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    const base = kind === 'hour' ? 1700 : 2900;
    const clicks = 4;
    for (let i = 0; i < clicks; i++) {
      const ti = t + i * 0.038 + Math.random() * 0.006;
      const pitch = base * (0.94 + Math.random() * 0.12);
      this._noiseBurst(ti, 0.022, pitch, 6, 0.55, 'bandpass');
      this._noiseBurst(ti, 0.008, 7000, 1, 0.18, 'highpass');
      // metallic ring of the ratchet spring
      this._tone(pitch * 1.5, ti, 0.05, 'square', 0.012, { reverb: false });
    }
    // final "detent" thunk
    const te = t + clicks * 0.038 + 0.01;
    this._tone(kind === 'hour' ? 320 : 460, te, 0.07, 'triangle', 0.09, { to: 180, reverb: false });
    this._noiseBurst(te, 0.03, 1200, 2, 0.25);
  },

  pop() {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    this._tone(520, t, 0.12, 'sine', 0.22, { to: 900 });
  },

  key() {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    this._tone(880 + Math.random() * 120, t, 0.06, 'triangle', 0.12, { reverb: false });
    this._noiseBurst(t, 0.02, 3000, 3, 0.15);
  },

  toggle() {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    this._tone(660, t, 0.15, 'sine', 0.18);
    this._tone(990, t + 0.07, 0.2, 'sine', 0.15);
  },

  correct() {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    [72, 76, 79, 84, 88].forEach((n, i) => {
      this._tone(midi(n), t + i * 0.09, 0.9, 'sine', 0.2);
      this._tone(midi(n) * 2, t + i * 0.09, 0.5, 'sine', 0.05);
    });
    // sparkle
    for (let i = 0; i < 10; i++) this._tone(midi(96 + Math.floor(Math.random() * 8)), t + 0.45 + i * 0.05, 0.3, 'sine', 0.04);
  },

  wrong() {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    this._tone(392, t, 0.25, 'triangle', 0.18, { to: 370 });
    this._tone(311, t + 0.2, 0.4, 'triangle', 0.16, { to: 294 });
  },

  star(i) {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    const n = [79, 83, 86][i] || 88;
    this._tone(midi(n), t, 0.8, 'sine', 0.22);
    this._tone(midi(n + 12), t, 0.5, 'sine', 0.08);
  },

  fanfare() {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    const mel = [[67, 0], [72, 0.15], [76, 0.3], [79, 0.45], [76, 0.7], [79, 0.85], [84, 1.0]];
    mel.forEach(([n, d]) => {
      this._tone(midi(n), t + d, 0.45, 'triangle', 0.14);
      this._tone(midi(n), t + d, 0.6, 'sine', 0.12);
    });
    this._tone(midi(48), t + 1.0, 1.2, 'sine', 0.15);
    this._tone(midi(55), t + 1.0, 1.2, 'sine', 0.1);
  },

  timeout() {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    [76, 72, 69, 67].forEach((n, i) => this._tone(midi(n), t + i * 0.22, 0.6, 'sine', 0.16));
  },

  whoosh() {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    const n = this._noiseBurst(t, 0.6, 400, 1.2, 0.3);
    n.g.gain.setValueAtTime(0.0001, t);
    n.g.gain.linearRampToValueAtTime(0.3, t + 0.25);
    n.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    n.f.frequency.setValueAtTime(300, t);
    n.f.frequency.exponentialRampToValueAtTime(2500, t + 0.5);
  },

  sandTick() {
    if (!this._ok()) return;
    const t = this.ctx.currentTime;
    this._tone(1200, t, 0.05, 'sine', 0.06, { reverb: false });
    this._noiseBurst(t, 0.03, 2000, 4, 0.08);
  },

  /* ---------------- Speech ---------------- */
  _voices: [],
  loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const load = () => { this._voices = speechSynthesis.getVoices() || []; };
    load();
    speechSynthesis.onvoiceschanged = load;
  },

  _pickVoice(lang) {
    const want = lang === 'ja' ? 'ja' : 'en';
    const vs = this._voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(want));
    if (!vs.length) return null;
    // prefer friendly / natural sounding voices when present
    const prefs = want === 'ja'
      ? ['Nanami', 'Haruka', 'Kyoko', 'Google 日本語', 'Ayumi', 'Sayaka', 'O-Ren']
      : ['Aria', 'Jenny', 'Samantha', 'Google US English', 'Zira', 'Karen', 'Moira', 'female'];
    for (const p of prefs) {
      const v = vs.find(v => v.name.toLowerCase().includes(p.toLowerCase()));
      if (v) return v;
    }
    return vs.find(v => /US|GB/i.test(v.lang)) || vs[0];
  },

  canSpeak() { return 'speechSynthesis' in window; },

  _duckDown() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this._duck.gain.cancelScheduledValues(now);
    this._duck.gain.setTargetAtTime(0.3, now, 0.12);
  },
  _unduck() { if (this.ctx) this._duck.gain.setTargetAtTime(1, this.ctx.currentTime, 0.6); },

  /** Play a pre-recorded natural voice clip (src/voice/<lang>/<id>.ogg, made by
   *  tools/make_voice.py).  If the clip cannot be played, `text` is read by the
   *  system speech synthesizer instead. */
  say(id, lang, text) {
    if (!this.voiceOn) return;
    this.stopSpeech();
    const a = new window.Audio('voice/' + (lang === 'ja' ? 'ja' : 'en') + '/' + id + '.ogg');
    this._clip = a;
    let fell = false;
    const fallback = () => {
      if (fell || this._clip !== a) return;
      fell = true; this._clip = null;
      if (text) this.speak(text, lang); else this._unduck();
    };
    a.onerror = fallback;
    a.onended = () => { if (this._clip === a) { this._clip = null; this._unduck(); } };
    this._duckDown();
    try { const p = a.play(); if (p && p.catch) p.catch(fallback); } catch (e) { fallback(); }
  },

  /** Say a time of day, e.g. "It's seven thirty AM, in the morning!" */
  sayTime(h24, m, lang) {
    const id = 't' + (h24 < 10 ? '0' : '') + h24 + (m < 10 ? '0' : '') + m;
    this.say(id, lang, TimeFmt.speech(h24, m));
  },

  speak(text, lang) {
    if (!this.voiceOn || !this.canSpeak()) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'ja' ? 'ja-JP' : 'en-US';
      const v = this._pickVoice(lang);
      if (v) u.voice = v;
      u.rate = lang === 'ja' ? 0.9 : 0.85;
      u.pitch = 1.15;
      u.volume = 1;
      this._duckDown();
      const unduck = () => this._unduck();
      u.onend = unduck; u.onerror = unduck;
      speechSynthesis.speak(u);
    } catch (e) { /* speech unavailable */ }
  },

  stopSpeech() {
    if (this._clip) { try { this._clip.pause(); } catch (e) { /* ignore */ } this._clip = null; }
    if (this.canSpeak()) try { speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    if (this.ctx) this._duck.gain.setTargetAtTime(1, this.ctx.currentTime, 0.3);
  }
};
