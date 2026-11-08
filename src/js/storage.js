/* Chrono Critters — persistent settings, progress and parent statistics.
 * Copyright (C) 2026 Shawn Rapaz — GPL-3.0-or-later */
'use strict';

const LEVEL_COUNT = 24;
const STORE_KEY = 'chrono-critters-v1';

function todayKey(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function freshStats() {
  return {
    firstPlayed: Date.now(),
    totalPlayMs: 0,      // time inside levels (not paused)
    appMs: 0,            // time the app was open
    sessions: 0,
    attempts: 0,
    cleared: 0,
    firstTry: 0,         // cleared with zero mistakes
    timeouts: 0,
    totalScore: 0,
    bestScore: 0,
    mistakes: { hour: 0, minute: 0, ampm: 0 },
    minuteKind: { oclock: 0, half: 0, quarter: 0, five: 0, exact: 0 },  // minute errors grouped by target kind
    byMode: { set: { attempts: 0, cleared: 0, mistakes: 0 }, read: { attempts: 0, cleared: 0, mistakes: 0 } },
    byDiff: {
      easy: { attempts: 0, cleared: 0, mistakes: 0 },
      medium: { attempts: 0, cleared: 0, mistakes: 0 },
      hard: { attempts: 0, cleared: 0, mistakes: 0 }
    },
    daily: {},           // 'YYYY-MM-DD' -> ms played
    history: []          // most recent first, capped
  };
}

function freshData() {
  return {
    settings: { lang: 'en', bgm: true, voice: true, difficulty: 'easy', mode: 'set' },
    progress: { set: new Array(LEVEL_COUNT).fill(null), read: new Array(LEVEL_COUNT).fill(null) },
    score: { set: 0, read: 0 },
    stats: freshStats()
  };
}

function deepMerge(base, extra) {
  if (!extra || typeof extra !== 'object') return base;
  for (const k in base) {
    if (!(k in extra)) continue;
    const b = base[k], e = extra[k];
    if (Array.isArray(b)) base[k] = Array.isArray(e) ? e : b;
    else if (b && typeof b === 'object') base[k] = deepMerge(b, e);
    else if (typeof e === typeof b || b === null) base[k] = e;
  }
  // keep dynamic keys (daily)
  if (base.daily && extra.daily) base.daily = extra.daily;
  return base;
}

const Store = {
  data: freshData(),

  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) this.data = deepMerge(freshData(), JSON.parse(raw));
    } catch (e) { this.data = freshData(); }
    for (const m of ['set', 'read']) {
      if (!Array.isArray(this.data.progress[m]) || this.data.progress[m].length !== LEVEL_COUNT) {
        this.data.progress[m] = new Array(LEVEL_COUNT).fill(null);
      }
    }
  },

  save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.data)); } catch (e) { /* storage unavailable */ }
  },

  get settings() { return this.data.settings; },
  get stats() { return this.data.stats; },

  setSetting(k, v) { this.data.settings[k] = v; this.save(); },

  /** null = never played; number = best stars (0-3). Level i unlocked if i==0 or level i-1 played. */
  isUnlocked(mode, i) { return i === 0 || this.data.progress[mode][i - 1] !== null; },
  stars(mode, i) { return this.data.progress[mode][i]; },
  totalStars(mode) { return this.data.progress[mode].reduce((a, s) => a + (s || 0), 0); },
  nextLevel(mode) {
    const p = this.data.progress[mode];
    for (let i = 0; i < LEVEL_COUNT; i++) if (p[i] === null) return i;
    return 0;
  },

  addPlayTime(ms) {
    const s = this.data.stats;
    s.totalPlayMs += ms;
    const k = todayKey();
    s.daily[k] = (s.daily[k] || 0) + ms;
  },
  addAppTime(ms) { this.data.stats.appMs += ms; },

  recordMistake(kind, mode, diff, targetMin) {
    const s = this.data.stats;
    s.mistakes[kind]++;
    s.byMode[mode].mistakes++;
    s.byDiff[diff].mistakes++;
    if (kind === 'minute') {
      const mk = targetMin === 0 ? 'oclock' : targetMin === 30 ? 'half' : (targetMin === 15 || targetMin === 45) ? 'quarter'
        : targetMin % 5 === 0 ? 'five' : 'exact';
      s.minuteKind[mk] = (s.minuteKind[mk] || 0) + 1;
    }
    this.save();
  },

  /** Record a finished level attempt. */
  recordResult(r) {
    const s = this.data.stats;
    s.attempts++;
    s.byMode[r.mode].attempts++;
    s.byDiff[r.diff].attempts++;
    if (r.ok) {
      s.cleared++;
      s.byMode[r.mode].cleared++;
      s.byDiff[r.diff].cleared++;
      if (r.mistakes === 0) s.firstTry++;
    } else {
      s.timeouts++;
    }
    s.totalScore += r.score;
    s.bestScore = Math.max(s.bestScore, r.score);
    this.data.score[r.mode] += r.score;
    const p = this.data.progress[r.mode];
    p[r.level] = Math.max(p[r.level] === null ? 0 : p[r.level], r.stars);
    s.history.unshift({ d: Date.now(), mode: r.mode, diff: r.diff, level: r.level, h: r.h24, m: r.m, ok: r.ok, mistakes: r.mistakes, secs: r.secs, score: r.score });
    if (s.history.length > 40) s.history.length = 40;
    this.save();
  },

  reset() {
    const settings = this.data.settings;
    this.data = freshData();
    this.data.settings = settings;
    this.save();
  }
};
