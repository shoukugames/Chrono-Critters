/* Chrono Critters — application shell: screens, title, sticker book, input, main loop.
 * Copyright (C) 2026 Shawn Rapaz — GPL-3.0-or-later */
'use strict';

const App = {
  screen: 'title',
  scale: 1,
  dpr: 1,
  ctx: null, fx: null,
  last: 0,
  appAccum: 0,
  mapSel: 0,

  init() {
    Store.load();
    Store.stats.sessions++;
    Store.save();
    const st = Store.settings;
    I18n.lang = st.lang;
    Sound.bgmOn = st.bgm;
    Sound.voiceOn = st.voice;
    Sound.loadVoices();

    this.ctx = $('scene').getContext('2d');
    this.fx = $('fx').getContext('2d');
    applyIcons();
    this.bindTitle();
    this.bindGame();
    this.bindMisc();
    this.applyLang();
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Audio may start immediately in the desktop app; in browsers it waits for the first gesture.
    Sound.mood = Sound.moodFor(new Date().getHours());
    try { Sound.init(); } catch (e) { /* no audio */ }
    const unlock = () => Sound.resume();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    window.addEventListener('keydown', e => this.onKey(e));
    window.addEventListener('keyup', e => Game.onKeyUp(e));
    window.addEventListener('blur', () => Game.holdStop());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.screen === 'game') Game.pause();
    });
    window.addEventListener('beforeunload', () => { Game.flushPlayTime(); Store.addAppTime(this.appAccum); this.appAccum = 0; Store.save(); });

    this.go('title');
    const loop = now => { this.frame(now); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  },

  resize() {
    const s = Math.min(window.innerWidth / W, window.innerHeight / H);
    this.scale = s;
    this.dpr = window.devicePixelRatio || 1;
    const st = $('stage');
    st.style.transform = 'scale(' + s + ')';
    st.style.left = Math.round((window.innerWidth - W * s) / 2) + 'px';
    st.style.top = Math.round((window.innerHeight - H * s) / 2) + 'px';
    for (const c of [$('scene'), $('fx')]) {
      c.width = Math.round(W * s * this.dpr);
      c.height = Math.round(H * s * this.dpr);
    }
  },

  go(name) {
    if (this.screen === 'game' && name !== 'game') Game.leave();
    if (this.screen === 'tutorial' && name !== 'tutorial') Sound.stopSpeech();
    this.screen = name;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $('screen-' + name).classList.add('active');
    Particles.list = [];
    if (name === 'title') this.refreshToggles();
    if (name === 'map') this.buildMap();
    if (name === 'tutorial') Tutorial.open();
    if (name === 'parents') Parents.open();
    const first = $('screen-' + name).querySelector('.btn-play, .btn-go, .btn');
    if (first && name !== 'game' && name !== 'map') setTimeout(() => first.focus({ preventScroll: true }), 50);
  },

  /* ---------- title ---------- */
  bindTitle() {
    $('btnPlay').onclick = () => { Sound.pop(); this.go('map'); };
    $('btnTutorial').onclick = () => { Sound.pop(); this.go('tutorial'); };
    $('btnStickers').onclick = () => { Sound.pop(); this.go('map'); };
    $('btnParents').onclick = () => { Sound.pop(); this.go('parents'); };
    $('btnCredits').onclick = () => { Sound.pop(); this.go('credits'); };
    const group = (id, fn) => $(id).querySelectorAll('button').forEach(b => b.onclick = () => { fn(b.dataset.v); Sound.toggle(); this.refreshToggles(); });
    group('tgMode', v => Store.setSetting('mode', v));
    group('tgDiff', v => Store.setSetting('difficulty', v));
    group('tgBgm', v => { Store.setSetting('bgm', v === 'on'); Sound.resume(); Sound.setBGM(v === 'on'); });
    group('tgVoice', v => {
      Store.setSetting('voice', v === 'on'); Sound.voiceOn = v === 'on';
      if (v === 'on') Sound.say('voiceon', I18n.lang, I18n.lang === 'ja' ? 'こえ オン！' : 'Voice on!');
      else Sound.stopSpeech();
    });
    group('tgLang', v => { Store.setSetting('lang', v); I18n.lang = v; this.applyLang(); });
  },

  refreshToggles() {
    const st = Store.settings;
    const mark = (id, v) => $(id).querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
    mark('tgMode', st.mode); mark('tgDiff', st.difficulty);
    mark('tgBgm', st.bgm ? 'on' : 'off'); mark('tgVoice', st.voice ? 'on' : 'off'); mark('tgLang', st.lang);
  },

  applyLang() {
    I18n.apply();
    document.title = I18n.t('title');
    this.refreshToggles();
    if (this.screen === 'map') this.buildMap();
    if (this.screen === 'game') Game.refreshTexts();
    if (this.screen === 'parents' && Parents.unlocked) Parents.render();
    if (this.screen === 'tutorial') Tutorial.show(Tutorial.idx);
  },

  /* ---------- sticker book / level map ---------- */
  buildMap() {
    const mode = Store.settings.mode;
    $('mapMode').textContent = I18n.t(mode === 'set' ? 'modeSet' : 'modeRead');
    $('mapMode').style.background = mode === 'set' ? 'var(--hour)' : 'var(--minute)';
    $('mapMode').style.color = '#fff';
    $('mapDiff').textContent = I18n.t(Store.settings.difficulty);
    $('mapStars').textContent = Store.totalStars(mode);
    $('mapScore').textContent = Store.data.score[mode].toLocaleString();
    const grid = $('mapGrid');
    grid.innerHTML = '';
    const next = Store.nextLevel(mode);
    this.mapSel = next;
    for (let i = 0; i < LEVEL_COUNT; i++) {
      const unlocked = Store.isUnlocked(mode, i);
      const stars = Store.stars(mode, i);
      const b = document.createElement('button');
      b.className = 'sticker' + (unlocked ? '' : ' locked') + (i === next && stars === null ? ' next' : '');
      b.dataset.i = i;
      const cv = document.createElement('canvas');
      cv.width = 240; cv.height = 164;
      b.appendChild(cv);
      b.insertAdjacentHTML('beforeend',
        '<span class="s-num">' + (i + 1) + '</span>' +
        '<span class="s-name">' + (unlocked ? I18n.animal(i) : I18n.t('locked')) + '</span>' +
        '<span class="s-stars">' + [0, 1, 2].map(k => '<span class="' + (stars !== null && k < stars ? 'lit' : '') + '">' + icon('star', 20) + '</span>').join('') + '</span>');
      const c = cv.getContext('2d');
      c.scale(2, 2);
      if (unlocked) drawAnimal(c, i, 60, 40, 24, { t: 1 + i * 0.7, mood: stars !== null ? 'happy' : undefined });
      else drawLockedAnimal(c, i, 60, 40, 24);
      b.onclick = () => this.startLevel(i);
      b.onmouseenter = () => { this.mapSel = i; this.markSel(); };
      grid.appendChild(b);
    }
    this.markSel();
  },

  markSel() {
    $('mapGrid').querySelectorAll('.sticker').forEach((b, i) => b.classList.toggle('sel', i === this.mapSel));
  },

  startLevel(i) {
    if (!Store.isUnlocked(Store.settings.mode, i)) { Sound.wrong(); return; }
    Sound.pop();
    this.go('game');
    Game.start(i);
  },

  /* ---------- game bindings ---------- */
  bindGame() {
    document.querySelectorAll('#setControls [data-act], #readControls [data-act]').forEach(b => {
      const a = b.dataset.act;
      if (Game.isHandAct(a)) {
        // tap = one step, press and hold = keep moving until released
        b.addEventListener('pointerdown', e => {
          e.preventDefault(); Sound.resume();
          try { b.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
          Game.holdStart(a);
        });
        for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(ev, () => Game.holdStop(a));
        b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault(); });
      } else {
        b.onclick = () => { Sound.resume(); Game.act(a); };
      }
    });
    document.querySelectorAll('.ampm-choice button').forEach(b => b.onclick = () => Game.chooseAP(b.dataset.ap));
    $('inH').onclick = () => Game.setFocus('h');
    $('inM').onclick = () => Game.setFocus('m');
    $('ampmPill').onclick = () => Game.act('ampm');
    const pad = $('numpad');
    pad.innerHTML = '';
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].forEach(d => {
      const b = document.createElement('button'); b.textContent = d; b.onclick = () => Game.typeDigit(d); pad.appendChild(b);
    });
    const bk = document.createElement('button'); bk.className = 'bk'; bk.textContent = '⌫'; bk.onclick = () => Game.backspace(); pad.appendChild(bk);
    $('btnPause').onclick = () => Game.pause();
    $('btnListen').onclick = () => { Sound.resume(); Sound.sayTime(Game.target.h, Game.target.m, I18n.lang); };
    document.querySelectorAll('[data-res]').forEach(b => b.onclick = () => Game.resultAction(b.dataset.res));
    document.querySelectorAll('[data-pause]').forEach(b => b.onclick = () => {
      if (b.dataset.pause === 'resume') Game.resume(); else { Sound.pop(); this.go('title'); }
    });
  },

  bindMisc() {
    document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { Sound.pop(); this.go(b.dataset.go); });
    $('tutNext').onclick = () => Tutorial.next();
    $('tutBack').onclick = () => Tutorial.back();
    $('tutListen').onclick = () => { Sound.resume(); Tutorial.speak(); };
    document.querySelectorAll('a.ext').forEach(a => a.onclick = e => { e.preventDefault(); window.open(a.href, '_blank'); });
    // keep on-screen buttons from stealing arrow / space keys from the game
    document.querySelectorAll('#screen-game button').forEach(b => b.addEventListener('mousedown', e => e.preventDefault()));
  },

  /* ---------- input ---------- */
  onKey(e) {
    if (e.key === 'F11' || (e.key === 'Enter' && e.altKey)) return;
    switch (this.screen) {
      case 'game': Game.key(e); break;
      case 'tutorial': Tutorial.key(e); break;
      case 'parents': Parents.key(e); break;
      case 'map': this.mapKey(e); break;
      case 'credits': if (e.key === 'Escape') this.go('title'); break;
      case 'title':
        if (e.key === 'Enter' && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) { Sound.pop(); this.go('map'); }
        break;
    }
  },

  mapKey(e) {
    const cols = 6;
    let s = this.mapSel;
    if (e.key === 'ArrowRight') s++;
    else if (e.key === 'ArrowLeft') s--;
    else if (e.key === 'ArrowDown') s += cols;
    else if (e.key === 'ArrowUp') s -= cols;
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.startLevel(this.mapSel); return; }
    else if (e.key === 'Escape') { this.go('title'); return; }
    else return;
    e.preventDefault();
    this.mapSel = Math.max(0, Math.min(LEVEL_COUNT - 1, s));
    Sound.key();
    this.markSel();
  },

  /* ---------- rendering ---------- */
  frame(now) {
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    const t = now / 1000;
    const ctx = this.ctx, k = this.scale * this.dpr;
    ctx.setTransform(k, 0, 0, k, 0, 0);

    this.appAccum += dt * 1000;
    if (this.appAccum > 10000) { Store.addAppTime(this.appAccum); this.appAccum = 0; Store.save(); }

    // Music follows the time of day: the level's time while playing,
    // the real clock everywhere else.
    const musicHour = (this.screen === 'game' && Game.target) ? Game.target.h : new Date().getHours();
    Sound.setMood(Sound.moodFor(musicHour));

    switch (this.screen) {
      case 'title': this.renderTitle(ctx, t); break;
      case 'game': Game.update(dt); Game.render(ctx, t); break;
      case 'tutorial': Tutorial.render(ctx, t); break;
      case 'map': drawScene(ctx, 10, t); this.renderParade(ctx, t, 700, 0.5); break;
      case 'parents': drawScene(ctx, 15, t); ctx.fillStyle = 'rgba(60,40,90,.25)'; ctx.fillRect(0, 0, W, H); break;
      case 'credits': drawScene(ctx, 17.4, t); this.renderParade(ctx, t, 640, 1); break;
    }

    Particles.update(dt);
    const fx = this.fx;
    fx.setTransform(1, 0, 0, 1, 0, 0);
    fx.clearRect(0, 0, fx.canvas.width, fx.canvas.height);
    fx.setTransform(k, 0, 0, k, 0, 0);
    Particles.draw(fx);
  },

  renderTitle(ctx, t) {
    const d = new Date();
    const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds() + d.getMilliseconds() / 1000;
    drawScene(ctx, h + m / 60, t);
    const cx = 935, cy = 375, r = 150;
    const featured = Math.floor(t / 7) % LEVEL_COUNT;
    drawClock(ctx, cx, cy, r, { hour: h + m / 60, minute: m + s / 60, t, theme: ANIMALS[featured].theme, animal: featured, minuteNums: true });
    // second hand for the real-time title clock
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.floor(s) / 60 * Math.PI * 2);
    ctx.strokeStyle = '#ff5c8a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, r * 0.15); ctx.lineTo(0, -r * 0.86); ctx.stroke();
    ctx.restore();
    // two friends beside the clock
    const a1 = featured, a2 = (featured + 12) % LEVEL_COUNT;
    drawAnimal(ctx, a1, 715, 520, 40, { t, body: true, mood: Math.sin(t) > 0.6 ? 'wave' : undefined, arm: 0.6 });
    drawAnimal(ctx, a2, 1160, 520, 40, { t: t + 1, body: true, mood: Math.sin(t + 2) > 0.6 ? 'happy' : undefined });
  },

  renderParade(ctx, t, y, scale) {
    const n = LEVEL_COUNT, spacing = 120;
    for (let i = 0; i < n; i++) {
      const x = ((i * spacing + t * 50) % (n * spacing)) - 60;
      if (x < -80 || x > W + 80) continue;
      const hop = Math.abs(Math.sin(t * 5 + i)) * 10;
      drawAnimal(ctx, i, x, y - 50 * scale - hop, 22 * scale, { t: t + i, body: true, mood: i % 5 === 0 ? 'happy' : undefined });
    }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  const go = () => App.init();
  if (document.fonts && document.fonts.load) {
    Promise.race([
      Promise.all([
        document.fonts.load('800 40px "M PLUS Rounded 1c"', '0123456789:AMP'),
        document.fonts.load('500 20px "M PLUS Rounded 1c"', 'abc'),
        document.fonts.load('800 40px "M PLUS Rounded 1c"', 'ごぜんごじふん')
      ]),
      new Promise(r => setTimeout(r, 1500))
    ]).then(go, go);
  } else go();
});
