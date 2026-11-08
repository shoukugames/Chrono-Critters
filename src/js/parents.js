/* Chrono Critters — "For Parents" dashboard with a simple grown-up gate.
 * Copyright (C) 2026 Shawn Rapaz — GPL-3.0-or-later */
'use strict';

function fmtDuration(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60), m = totalMin % 60, s = Math.floor(ms / 1000) % 60;
  if (I18n.lang === 'ja') return h > 0 ? h + '時間' + m + '分' : m + '分' + s + '秒';
  return h > 0 ? h + 'h ' + m + 'm' : m + 'm ' + s + 's';
}

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

const Parents = {
  unlocked: false,

  open() {
    this.unlocked = false;
    document.getElementById('dash').classList.remove('show');
    document.getElementById('gate').style.display = '';
    this.makeGate();
  },

  makeGate() {
    const a = 3 + Math.floor(Math.random() * 6), b = 2 + Math.floor(Math.random() * 7), ans = a + b;
    document.getElementById('gateQ').textContent = I18n.t('gateQ', { a, b });
    document.getElementById('gateMsg').textContent = '';
    const opts = new Set([ans]);
    while (opts.size < 3) opts.add(ans + (Math.floor(Math.random() * 7) - 3) || ans + 4);
    const arr = [...opts].sort(() => Math.random() - 0.5);
    const box = document.getElementById('gateOpts');
    box.innerHTML = '';
    arr.forEach(v => {
      const b2 = document.createElement('button');
      b2.className = 'btn'; b2.textContent = v;
      b2.onclick = () => {
        if (v === ans) { Sound.toggle(); this.showDash(); }
        else { Sound.wrong(); document.getElementById('gateMsg').textContent = I18n.t('gateWrong'); setTimeout(() => this.makeGate(), 900); }
      };
      box.appendChild(b2);
    });
  },

  showDash() {
    this.unlocked = true;
    document.getElementById('gate').style.display = 'none';
    const d = document.getElementById('dash');
    d.classList.add('show');
    this.render();
  },

  tips(s) {
    const out = [];
    if (s.attempts < 3) return [I18n.t('tipFew')];
    const total = s.mistakes.hour + s.mistakes.minute + s.mistakes.ampm;
    const per = (n) => n / Math.max(1, s.attempts);
    const ranked = [['hour', s.mistakes.hour], ['minute', s.mistakes.minute], ['ampm', s.mistakes.ampm]].sort((x, y) => y[1] - x[1]);
    for (const [k, n] of ranked) {
      if (n > 0 && (per(n) >= 0.3 || n === ranked[0][1] && total > 0)) {
        out.push(I18n.t(k === 'hour' ? 'tipHour' : k === 'minute' ? 'tipMinute' : 'tipAmPm'));
      }
    }
    const mk = s.minuteKind;
    if (mk.quarter >= 2 && mk.quarter >= mk.five) out.push(I18n.t('tipQuarter'));
    if ((mk.exact || 0) >= 2) out.push(I18n.t('tipExact'));
    if (s.timeouts / s.attempts >= 0.25) out.push(I18n.t('tipTimeout'));
    const acc = s.firstTry / Math.max(1, s.attempts);
    if (acc >= 0.8) out.push(I18n.t('tipGreat'));
    if (!out.length) out.push(I18n.t('tipOk'));
    return out;
  },

  render() {
    const s = Store.stats;
    const d = document.getElementById('dash');
    if (s.attempts === 0 && s.totalPlayMs < 1000) {
      d.innerHTML = '<div class="dpanel empty-note">' + esc(I18n.t('noData')) + '</div>' +
        '<div class="dpanel"><h3>' + esc(I18n.t('appTime')) + '</h3><div class="tile"><div class="tv">' + fmtDuration(s.appMs) + '</div></div></div>';
      return;
    }
    const acc = Math.round(100 * s.firstTry / Math.max(1, s.attempts));
    const tiles = [
      ['playTime', fmtDuration(s.totalPlayMs)],
      ['appTime', fmtDuration(s.appMs)],
      ['levelsCleared', s.cleared + ' / ' + s.attempts],
      ['accuracy', acc + '%'],
      ['totalScore', s.totalScore.toLocaleString()],
      ['sessions', s.sessions],
      ['bestScore', s.bestScore],
      ['starsSet', Store.totalStars('set') + ' / 72'],
      ['starsRead', Store.totalStars('read') + ' / 72'],
      ['mTimeout', s.timeouts]
    ];
    let html = '<div class="tiles">' + tiles.map(([k, v]) =>
      '<div class="tile"><div class="tl">' + esc(I18n.t(k)) + '</div><div class="tv">' + esc(v) + '</div></div>').join('') + '</div>';

    // mistakes bars
    const mx = Math.max(1, s.mistakes.hour, s.mistakes.minute, s.mistakes.ampm, s.timeouts);
    const bar = (label, n, col) => '<div class="bar-row"><span>' + esc(label) + '</span><div class="bar"><i style="width:' +
      Math.round(100 * n / mx) + '%;background:' + col + '"></i></div><span>' + n + '</span></div>';
    const mistakesHtml = '<div class="dpanel"><h3>' + esc(I18n.t('mistakes')) + '</h3>' +
      bar(I18n.t('mHour'), s.mistakes.hour, '#ff7a45') +
      bar(I18n.t('mMinute'), s.mistakes.minute, '#3f8cff') +
      bar(I18n.t('mAmPm'), s.mistakes.ampm, '#8a6cd8') +
      bar(I18n.t('mTimeout'), s.timeouts, '#ff8fa3') + '</div>';

    // last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i);
      days.push({ k: todayKey(dt), lbl: (dt.getMonth() + 1) + '/' + dt.getDate() });
    }
    const vals = days.map(x => (s.daily[x.k] || 0) / 60000);
    const vmax = Math.max(1, ...vals);
    const weekHtml = '<div class="dpanel"><h3>' + esc(I18n.t('last7')) + '</h3><div class="week">' +
      days.map((x, i) => '<div class="day"><span>' + (vals[i] >= 1 ? Math.round(vals[i]) : vals[i] > 0 ? '<1' : '') + '</span><div class="col" style="height:' +
        Math.round(85 * vals[i] / vmax) + '%"></div><span>' + x.lbl + '</span></div>').join('') + '</div></div>';

    html += '<div class="dash-row">' + mistakesHtml + weekHtml + '</div>';

    // advice
    html += '<div class="dpanel" style="margin-bottom:14px"><h3>' + esc(I18n.t('improve')) + '</h3><ul class="tips">' +
      this.tips(s).map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></div>';

    // recent history
    const rows = s.history.slice(0, 15).map(h => {
      const dt = new Date(h.d);
      const date = (dt.getMonth() + 1) + '/' + dt.getDate() + ' ' + String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
      return '<tr><td>' + date + '</td><td>' + esc(I18n.t(h.mode === 'set' ? 'modeSet' : 'modeRead')) + '</td><td>' + esc(I18n.t(h.diff)) +
        ' · ' + (h.level + 1) + '</td><td>' + esc(TimeFmt.label(h.h, h.m)) + '</td><td class="' + (h.ok ? 'ok' : 'bad') + '">' +
        esc(I18n.t(h.ok ? 'resOk' : 'resTimeout')) + '</td><td>' + h.mistakes + '</td><td>' + h.secs + '</td></tr>';
    }).join('');
    html += '<div class="dpanel" style="margin-bottom:14px"><h3>' + esc(I18n.t('recent')) + '</h3><table class="hist"><thead><tr>' +
      ['colDate', 'colMode', 'colDiff', 'colTarget', 'colResult', 'colMistakes', 'colSecs'].map(k => '<th>' + esc(I18n.t(k)) + '</th>').join('') +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';

    html += '<button id="btnReset" class="btn btn-small reset-btn">' + esc(I18n.t('resetStats')) + '</button>';
    d.innerHTML = html;
    document.getElementById('btnReset').onclick = () => {
      if (confirm(I18n.t('resetConfirm'))) { Store.reset(); this.render(); }
    };
  },

  key(e) { if (e.key === 'Escape') App.go('title'); }
};
