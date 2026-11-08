/* Chrono Critters — i18n: every player-facing string in English and Japanese.
 * Copyright (C) 2026 Shawn Rapaz — GPL-3.0-or-later */
'use strict';

const STRINGS = {
  en: {
    title: 'Chrono Critters',
    subtitle: 'Learn to tell time with cute animal friends!',
    ages: 'Ages 3+',
    play: 'Play!',
    tutorial: 'How Clocks Work',
    stickers: 'Sticker Book',
    parents: 'For Parents',
    credits: 'Credits',
    mode: 'Mode',
    modeSet: 'Set the Clock',
    modeRead: 'Read the Clock',
    difficulty: 'Level',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    bgm: 'Music',
    on: 'On',
    off: 'Off',
    voice: 'Voice',
    language: 'Language',
    back: 'Back',
    home: 'Home',
    next: 'Next',
    again: 'Try Again',
    map: 'Sticker Book',
    close: 'Close',
    level: 'Level',
    score: 'Score',
    setPrompt: 'Set the clock to:',
    readPrompt: 'What time is it?',
    check: 'Check!',
    hourHand: 'Short hand (hour)',
    minuteHand: 'Long hand (minutes)',
    ampmKey: 'AM / PM',
    yourClock: 'Your clock',
    typeHint: 'Type the time with numbers, then pick AM or PM',
    chooseAmPm: 'Pick AM or PM!',
    typeTime: 'Type the hour and minutes!',
    greet: "Hi! I'm {animal}! Can you help me?",
    greetRead: "Hi! I'm {animal}! What time does my clock say?",
    hintHour: 'Almost! Move the SHORT hand with the up and down arrows.',
    hintMinute: 'Almost! Move the LONG hand with the left and right arrows.',
    hintAmPm: 'So close! Is it AM or PM? Press Space to switch.',
    hintHourRead: 'Look at the SHORT hand. Which number did it pass?',
    hintMinuteRead: 'Look at the LONG hand. Count by 5s from the 12!',
    hintAmPmRead: 'Look at the sky! Is it AM or PM?',
    great: ['Great job!', 'Amazing!', 'You did it!', 'Super!', 'Wonderful!', 'Fantastic!'],
    timesUp: "Time's up!",
    timesUpMsg: "That's OK! Here is the answer. Let's learn it together!",
    points: 'points',
    newSticker: 'New sticker!',
    allDone: 'You collected all 24 stickers! You are a Clock Master!',
    paused: 'Paused',
    resume: 'Keep Playing',
    totalStars: 'Stars',
    locked: 'Locked',
    pickLevel: 'Pick a level!',
    am: 'AM',
    pm: 'PM',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
    // tutorial
    tutTitle: 'How Clocks Work',
    tut: [
      { h: 'Hello, clock!', p: 'This is a clock. It has the numbers 1 to 12 in a circle. They go around the same way every time.' },
      { h: 'The short hand', p: 'The SHORT orange hand is the HOUR hand. It points to the hour. Look: 1 o\'clock, 2 o\'clock, 3 o\'clock...' },
      { h: 'The long hand', p: 'The LONG blue hand is the MINUTE hand. Each little mark is 1 minute, and each number means 5 more minutes. Count with me: 5, 10, 15, 20...' },
      { h: "O'clock", p: "When the long hand points straight up at 12, it is something o'clock. Short hand on 3, long hand on 12: 3 o'clock!" },
      { h: 'Half past', p: 'When the long hand points down at 6, it is half past, or 30 minutes. See how the short hand is halfway to the next number?' },
      { h: 'Short hand first!', p: 'To read a clock: look at the short hand first for the hour. Then count the long hand by 5s for the minutes. This says 8:15!' },
      { h: 'AM and PM', p: 'The short hand goes around TWO times every day! The first time is AM: night and morning. The second time is PM: afternoon and evening.' },
      { h: 'Set the clock!', p: 'In Set the Clock, press UP or DOWN to move the short hand 1 hour. Press LEFT or RIGHT to move the long hand 1 minute. Hold a key to keep it moving! Space switches AM and PM. Press Enter to check!' },
      { h: 'Read the clock!', p: 'In Read the Clock, look at the clock and type the time with numbers. Then pick AM or PM and press Enter!' },
      { h: 'Watch the hourglass!', p: 'The sand in the hourglass shows how much time is left. Take your time and have fun. Ready? Let\'s go!' }
    ],
    // parents
    parentsTitle: 'For Parents',
    gateQ: 'Grown-ups only! What is {a} + {b}?',
    gateWrong: 'Not quite. Please try again.',
    playTime: 'Time spent playing levels',
    appTime: 'Total time in the app',
    sessions: 'Play sessions',
    levelsPlayed: 'Levels played',
    levelsCleared: 'Levels cleared',
    accuracy: 'First-try accuracy',
    totalScore: 'Total score',
    bestScore: 'Best level score',
    starsSet: 'Stars (Set the Clock)',
    starsRead: 'Stars (Read the Clock)',
    mistakes: 'Mistakes',
    mHour: 'Hour (short hand)',
    mMinute: 'Minutes (long hand)',
    mAmPm: 'AM / PM',
    mTimeout: 'Ran out of time',
    last7: 'Play time, last 7 days (minutes)',
    recent: 'Recent levels',
    improve: 'Where to practice',
    noData: 'No play data yet. Play a few levels and check back here!',
    resetStats: 'Reset all data',
    resetConfirm: 'Erase all scores, stickers and statistics? This cannot be undone.',
    colDate: 'Date',
    colMode: 'Mode',
    colDiff: 'Level',
    colTarget: 'Time',
    colResult: 'Result',
    colMistakes: 'Mistakes',
    colSecs: 'Seconds',
    resOk: 'Cleared',
    resTimeout: 'Time out',
    tipFew: 'Play at least 3 levels to get personal advice.',
    tipHour: 'The hour hand is the tricky part. Point at a real clock together and ask: "Which number is the SHORT hand pointing at, or just past?"',
    tipMinute: 'Minutes need practice. Count by 5s together while pointing at each number on the clock: 5, 10, 15...',
    tipQuarter: 'Quarter hours (:15, :45) are causing trouble. Show how :15 is a quarter of the way around, and :45 is three quarters.',
    tipExact: 'Exact minutes (like 8:23) are tricky. Count by 5s up to the last number the long hand passed, then count the little marks one by one: 20, 21, 22, 23.',
    tipAmPm: 'AM and PM get mixed up. Link them to daily routines: breakfast is AM, dinner is PM, and after midnight it is AM again.',
    tipTimeout: 'The hourglass often runs out. Try the Easy level, or sit together and talk through each step.',
    tipGreat: 'Excellent accuracy! Your child may be ready for the next difficulty level.',
    tipOk: 'Steady progress! Keep playing regularly. Short, frequent sessions work best.',
    minutesShort: 'min',
    // credits
    creditsTitle: 'Credits',
    creator: 'Created by',
    madeWith: 'Made with',
    website: 'Website',
    email: 'Email',
    license: 'License',
    licenseText: 'This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. It is distributed WITHOUT ANY WARRANTY. See the LICENSE file for details.',
    version: 'Version',
    date: 'Date',
    thanks: 'Thank you for playing!',
    keysHelp: 'Arrow keys: move hands  ·  Space: AM/PM  ·  Enter: check  ·  Esc: pause',
    listen: 'Listen'
  },

  ja: {
    title: 'クロノ・クリッターズ',
    subtitle: 'かわいい どうぶつと とけいを よもう！',
    ages: '3さいから',
    play: 'あそぶ！',
    tutorial: 'とけいの よみかた',
    stickers: 'シールちょう',
    parents: 'ほごしゃの かたへ',
    credits: 'クレジット',
    mode: 'モード',
    modeSet: 'とけいを あわせる',
    modeRead: 'とけいを よむ',
    difficulty: 'むずかしさ',
    easy: 'かんたん',
    medium: 'ふつう',
    hard: 'むずかしい',
    bgm: 'おんがく',
    on: 'オン',
    off: 'オフ',
    voice: 'こえ',
    language: 'ことば',
    back: 'もどる',
    home: 'ホーム',
    next: 'つぎへ',
    again: 'もういちど',
    map: 'シールちょう',
    close: 'とじる',
    level: 'レベル',
    score: 'スコア',
    setPrompt: 'とけいを この じかんに あわせてね：',
    readPrompt: 'いま なんじ かな？',
    check: 'できた！',
    hourHand: 'みじかい はり（じ）',
    minuteHand: 'ながい はり（ふん）',
    ampmKey: 'ごぜん／ごご',
    yourClock: 'きみの とけい',
    typeHint: 'すうじで じかんを いれて、ごぜんか ごごを えらんでね',
    chooseAmPm: 'ごぜんか ごごを えらんでね！',
    typeTime: 'なんじ なんぷんか いれてね！',
    greet: 'こんにちは！ {animal}だよ！ てつだって くれる？',
    greetRead: 'こんにちは！ {animal}だよ！ ぼくの とけいは なんじ かな？',
    hintHour: 'おしい！ みじかい はりを うえと したの やじるしで うごかしてね。',
    hintMinute: 'おしい！ ながい はりを ひだりと みぎの やじるしで うごかしてね。',
    hintAmPm: 'あと すこし！ ごぜん かな？ ごご かな？ スペースキーで かえられるよ。',
    hintHourRead: 'みじかい はりを みてね。どの すうじを すぎたかな？',
    hintMinuteRead: 'ながい はりを みてね。12から 5ずつ かぞえてみよう！',
    hintAmPmRead: 'そらを みてね！ ごぜん かな？ ごご かな？',
    great: ['よく できました！', 'すごい！', 'やったね！', 'すばらしい！', 'じょうず！', 'てんさい！'],
    timesUp: 'じかん ぎれ！',
    timesUpMsg: 'だいじょうぶ！ こたえは これだよ。いっしょに おぼえよう！',
    points: 'てん',
    newSticker: 'あたらしい シール！',
    allDone: '24まい ぜんぶ あつめたね！ きみは とけいマスターだ！',
    paused: 'いちじ ていし',
    resume: 'つづける',
    totalStars: 'ほし',
    locked: 'まだ だよ',
    pickLevel: 'レベルを えらんでね！',
    am: 'ごぜん',
    pm: 'ごご',
    morning: 'あさ',
    afternoon: 'ひる',
    evening: 'ゆうがた',
    night: 'よる',
    tutTitle: 'とけいの よみかた',
    tut: [
      { h: 'こんにちは、とけい！', p: 'これが とけい だよ。1から 12までの すうじが まるく ならんで いるね。いつも おなじ むきに まわるよ。' },
      { h: 'みじかい はり', p: 'みじかい オレンジの はりは「じ」を おしえる はり だよ。みてね：1じ、2じ、3じ…' },
      { h: 'ながい はり', p: 'ながい あおい はりは「ふん」を おしえる はり だよ。ちいさな めもり ひとつで 1ぷん、すうじ ひとつで 5ふん。いっしょに かぞえよう：5、10、15、20…' },
      { h: '「ちょうど」の とき', p: 'ながい はりが まうえの 12を さしたら「ちょうど」だよ。みじかい はりが 3、ながい はりが 12なら 3じ！' },
      { h: '「はん」の とき', p: 'ながい はりが したの 6を さしたら 30ぷん、「はん」だよ。みじかい はりが つぎの すうじとの まんなかに あるね。' },
      { h: 'みじかい はりから！', p: 'よみかた：まず みじかい はりで「なんじ」を みるよ。つぎに ながい はりを 5ずつ かぞえて「なんぷん」。これは 8じ15ふん！' },
      { h: 'ごぜんと ごご', p: 'みじかい はりは いちにちに 2かい まわるよ！ 1かいめは ごぜん：よなかと あさ。2かいめは ごご：ひると ゆうがたと よる。' },
      { h: 'とけいを あわせよう！', p: '「とけいを あわせる」では、うえ・したの やじるしを 1かい おすと みじかい はりが 1じかん、ひだり・みぎで ながい はりが 1ぷん うごくよ。おしたままに すると うごきつづけるよ！ スペースで ごぜんと ごごを かえて、エンターで チェック！' },
      { h: 'とけいを よもう！', p: '「とけいを よむ」では、とけいを みて すうじで じかんを いれてね。ごぜんか ごごを えらんで、エンターを おしてね！' },
      { h: 'すなどけいを みてね！', p: 'すなどけいの すなは のこりの じかんを おしえて くれるよ。あせらず たのしんでね。じゅんびは いい？ さあ、はじめよう！' }
    ],
    parentsTitle: 'ほごしゃの かたへ',
    gateQ: 'おとなの かた だけ！ {a} + {b} は？',
    gateWrong: 'ちがいます。もう一度どうぞ。',
    playTime: 'レベルのプレイ時間',
    appTime: 'アプリの合計使用時間',
    sessions: 'プレイ回数',
    levelsPlayed: 'プレイしたレベル',
    levelsCleared: 'クリアしたレベル',
    accuracy: '一回目の正解率',
    totalScore: '合計スコア',
    bestScore: '最高スコア（1レベル）',
    starsSet: 'ほし（とけいを あわせる）',
    starsRead: 'ほし（とけいを よむ）',
    mistakes: 'まちがい',
    mHour: '「時」（短い針）',
    mMinute: '「分」（長い針）',
    mAmPm: '午前／午後',
    mTimeout: '時間切れ',
    last7: '過去7日間のプレイ時間（分）',
    recent: '最近のレベル',
    improve: '練習するとよいところ',
    noData: 'まだデータがありません。いくつかレベルをプレイしてから見てください。',
    resetStats: 'データをすべて消す',
    resetConfirm: 'スコア、シール、統計をすべて消去しますか？元に戻せません。',
    colDate: '日付',
    colMode: 'モード',
    colDiff: 'むずかしさ',
    colTarget: '時刻',
    colResult: '結果',
    colMistakes: 'まちがい',
    colSecs: '秒',
    resOk: 'クリア',
    resTimeout: '時間切れ',
    tipFew: '3レベル以上プレイすると、アドバイスが表示されます。',
    tipHour: '「時」の読み取りが難しいようです。本物の時計を一緒に指さして「短い針はどの数字をさしている？（または過ぎた？）」と聞いてみましょう。',
    tipMinute: '「分」の練習が必要です。時計の数字を一つずつ指さしながら、一緒に5ずつ数えてみましょう：5、10、15…',
    tipQuarter: '15分・45分でつまずいています。15分は円の4分の1、45分は4分の3であることを見せてあげましょう。',
    tipExact: '8時23分のような「1分きざみ」の時刻が難しいようです。長い針が最後に通った数字まで5ずつ数え、そこから小さな目盛りを1つずつ数えましょう：20、21、22、23。',
    tipAmPm: '午前と午後が混ざりやすいようです。朝ごはんは午前、夕ごはんは午後、夜中の12時を過ぎたらまた午前、と生活と結びつけましょう。',
    tipTimeout: '砂時計が切れることが多いようです。「かんたん」にするか、一緒に一つずつ声に出して進めてみましょう。',
    tipGreat: 'とても良い正解率です！次のむずかしさに挑戦できるかもしれません。',
    tipOk: '順調に上達しています！短い時間でも、こまめに遊ぶのが効果的です。',
    minutesShort: '分',
    creditsTitle: 'クレジット',
    creator: '制作',
    madeWith: '使用ツール',
    website: 'ウェブサイト',
    email: 'メール',
    license: 'ライセンス',
    licenseText: 'このプログラムはフリーソフトウェアです。フリーソフトウェア財団が発行する GNU 一般公衆利用許諾書（バージョン3、または任意でそれ以降のバージョン）の条件のもとで再配布・改変できます。このプログラムは一切の保証なしに配布されます。詳しくは LICENSE ファイルをご覧ください。',
    version: 'バージョン',
    date: '日付',
    thanks: 'あそんでくれて ありがとう！',
    keysHelp: 'やじるし：はりを うごかす ・ スペース：ごぜん／ごご ・ エンター：チェック ・ Esc：ていし',
    listen: 'きく'
  }
};

const ANIMAL_NAMES = {
  en: ['Kitty', 'Puppy', 'Bunny', 'Bear', 'Panda', 'Fox', 'Piggy', 'Froggy', 'Owl', 'Chick', 'Penguin', 'Mouse',
       'Koala', 'Lion', 'Tiger', 'Monkey', 'Elephant', 'Cow', 'Sheep', 'Raccoon', 'Hamster', 'Duck', 'Deer', 'Unicorn'],
  ja: ['ねこ', 'いぬ', 'うさぎ', 'くま', 'パンダ', 'きつね', 'ぶた', 'かえる', 'ふくろう', 'ひよこ', 'ペンギン', 'ねずみ',
       'コアラ', 'ライオン', 'とら', 'さる', 'ぞう', 'うし', 'ひつじ', 'アライグマ', 'ハムスター', 'あひる', 'しか', 'ユニコーン']
};

const I18n = {
  lang: 'en',
  t(key, vars) {
    let s = (STRINGS[this.lang] && STRINGS[this.lang][key]);
    if (s === undefined) s = STRINGS.en[key];
    if (s === undefined) return key;
    if (vars && typeof s === 'string') {
      for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    }
    return s;
  },
  animal(i) { return ANIMAL_NAMES[this.lang][i]; },

  /** Apply translations to every element with data-i18n. */
  apply(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = this.t(el.getAttribute('data-i18n'));
    });
    document.documentElement.lang = this.lang;
  }
};

/* ---------------- Time helpers ---------------- */
const EN_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];
function enNumber(n) {
  if (n < 20) return EN_ONES[n];
  const t = Math.floor(n / 10), o = n % 10;
  return EN_TENS[t] + (o ? '-' + EN_ONES[o] : '');
}

const TimeFmt = {
  hour12(h24) { const h = h24 % 12; return h === 0 ? 12 : h; },
  isPM(h24) { return h24 >= 12; },
  pad(m) { return (m < 10 ? '0' : '') + m; },

  /** Digital numerals, e.g. "7:30" */
  digits(h24, m) { return this.hour12(h24) + ':' + this.pad(m); },

  ampm(h24) { return I18n.t(this.isPM(h24) ? 'pm' : 'am'); },

  period(h24) {
    if (h24 >= 5 && h24 < 12) return 'morning';
    if (h24 >= 12 && h24 < 17) return 'afternoon';
    if (h24 >= 17 && h24 < 20) return 'evening';
    return 'night';
  },

  /** Full digital label in the current language, e.g. "7:30 AM" / "ごぜん 7:30" */
  label(h24, m) {
    if (I18n.lang === 'ja') return this.ampm(h24) + ' ' + this.digits(h24, m);
    return this.digits(h24, m) + ' ' + this.ampm(h24);
  },

  /** How to say it, written out for children. */
  words(h24, m) {
    const h = this.hour12(h24);
    if (I18n.lang === 'ja') {
      const ap = this.ampm(h24);
      if (m === 0) return ap + ' ' + h + 'じ ちょうど';
      const fun = (m % 10 === 0 || m % 10 === 1 || m % 10 === 3 || m % 10 === 4 || m % 10 === 6 || m % 10 === 8) ? 'ぷん' : 'ふん';
      return ap + ' ' + h + 'じ ' + m + fun;
    }
    let s = enNumber(h) + ' ';
    if (m === 0) s += "o'clock";
    else if (m < 10) s += 'oh ' + enNumber(m);
    else s += enNumber(m);
    const per = { morning: 'in the morning', afternoon: 'in the afternoon', evening: 'in the evening', night: 'at night' }[this.period(h24)];
    return s + ' ' + (this.isPM(h24) ? 'PM' : 'AM') + ' — ' + per;
  },

  /** Text to be spoken by the speech synthesizer. */
  speech(h24, m) {
    const h = this.hour12(h24);
    if (I18n.lang === 'ja') {
      const ap = this.isPM(h24) ? '午後' : '午前';
      return ap + h + '時' + (m === 0 ? 'ちょうど' : m + '分') + 'です。';
    }
    let s = "It's " + enNumber(h) + ' ';
    if (m === 0) s += "o'clock";
    else if (m < 10) s += 'oh ' + enNumber(m);
    else s += enNumber(m);
    const per = { morning: 'in the morning', afternoon: 'in the afternoon', evening: 'in the evening', night: 'at night' }[this.period(h24)];
    return s + ', ' + (this.isPM(h24) ? 'P.M.' : 'A.M.') + ' ' + per + '!';
  }
};
