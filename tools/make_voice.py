#!/usr/bin/env python3
"""Chrono Critters — pre-record every spoken line with a natural neural voice.

Generates src/voice/<lang>/<id>.ogg (Opus) with the Kokoro-82M text-to-speech
model (Apache-2.0).  The game plays these clips; it only falls back to the
system speech synthesizer if a clip is missing.

Setup (one time, in a virtual environment):
    pip install torch --index-url https://download.pytorch.org/whl/cpu
    pip install "kokoro>=0.9.4" "misaki[ja,en]" soundfile unidic-lite
    pip uninstall unidic            # use the small unidic-lite dictionary
Needs ffmpeg on PATH.

Usage:
    python tools/make_voice.py              # everything
    python tools/make_voice.py --only tut   # ids starting with "tut"
    python tools/make_voice.py --print      # show the texts / phonemes only

Copyright (C) 2026 Shawn Rapaz — GPL-3.0-or-later
"""
import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'src', 'voice')

VOICE = {'en': 'af_heart', 'ja': 'jf_alpha'}
SPEED = {'en': 0.9, 'ja': 0.92}

# ---------------------------------------------------------------- English
EN_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
           'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty']


def en_num(n):
    if n < 20:
        return EN_ONES[n]
    t, o = divmod(n, 10)
    return EN_TENS[t] + ('-' + EN_ONES[o] if o else '')


def period(h24):
    if 5 <= h24 < 12:
        return 'morning'
    if 12 <= h24 < 17:
        return 'afternoon'
    if 17 <= h24 < 20:
        return 'evening'
    return 'night'


def en_time(h24, m):
    h = h24 % 12 or 12
    if m == 0:
        mins = "o'clock"
    elif m < 10:
        mins = 'oh ' + en_num(m)
    else:
        mins = en_num(m)
    per = {'morning': 'in the morning', 'afternoon': 'in the afternoon',
           'evening': 'in the evening', 'night': 'at night'}[period(h24)]
    return "It's %s %s %s, %s!" % (en_num(h), mins, 'PM' if h24 >= 12 else 'AM', per)


# ---------------------------------------------------------------- Japanese
# Written in kana so every number is read correctly (よじ, くじ, さんじゅっぷん …).
JA_HOUR = ['じゅうにじ', 'いちじ', 'にじ', 'さんじ', 'よじ', 'ごじ', 'ろくじ', 'しちじ', 'はちじ', 'くじ', 'じゅうじ', 'じゅういちじ']
JA_ONES = ['', 'いっぷん', 'にふん', 'さんぷん', 'よんぷん', 'ごふん', 'ろっぷん', 'ななふん', 'ハップン', 'きゅうふん']  # katakana: the voice reads は as "wa" otherwise
JA_TENS = ['', 'じゅう', 'にじゅう', 'さんじゅう', 'よんじゅう', 'ごじゅう']


def ja_min(m):
    """Minutes in kana with the right sound changes: 1 いっぷん, 6 ろっぷん, 10 じゅっぷん, 18 じゅうはっぷん …"""
    t, o = divmod(m, 10)
    if o == 0:
        return JA_TENS[t][:-1] + 'っぷん'      # じゅっぷん, にじゅっぷん …
    return JA_TENS[t] + JA_ONES[o]


def ja_time(h24, m):
    ap = '午後' if h24 >= 12 else '午前'
    hour = JA_HOUR[h24 % 12]
    if m == 0:
        return '%s、%s ちょうど です。' % (ap, hour)
    return '%s、%s %s です。' % (ap, hour, ja_min(m))


# ---------------------------------------------------------------- Tutorial
TUT = {
    'en': [
        "Hello, clock! This is a clock. It has the numbers 1 to 12 in a circle. They go around the same way every time.",
        "The short hand. The short orange hand is the hour hand. It points to the hour. Look: one o'clock, two o'clock, three o'clock.",
        "The long hand. The long blue hand is the minute hand. Each little mark is one minute, and each number means five more minutes. Count with me: five, ten, fifteen, twenty.",
        "O'clock. When the long hand points straight up at 12, it is something o'clock. Short hand on 3, long hand on 12: three o'clock!",
        "Half past. When the long hand points down at 6, it is half past, or thirty minutes. See how the short hand is halfway to the next number?",
        "Short hand first! To read a clock, look at the short hand first for the hour. Then count the long hand by fives for the minutes. This says eight fifteen!",
        "AM and PM. The short hand goes around two times every day! The first time is AM: night and morning. The second time is PM: afternoon and evening.",
        "Set the clock! In Set the Clock, press up or down to move the short hand one hour. Press left or right to move the long hand one minute. Hold a key to keep it moving! Space switches AM and PM. Press Enter to check!",
        "Read the clock! In Read the Clock, look at the clock and type the time with numbers. Then pick AM or PM, and press Enter!",
        "Watch the hourglass! The sand in the hourglass shows how much time is left. Take your time, and have fun. Ready? Let's go!",
    ],
    'ja': [
        "こんにちは、時計！ これが 時計だよ。いちから じゅうにまでの 数字が、まるく 並んでいるね。いつも 同じ向きに まわるよ。",
        "短い針。 短い オレンジの 針は、「じ」を 教える針だよ。見てね。いちじ、にじ、さんじ。",
        "長い針。 長い 青い針は、「ふん」を 教える針だよ。小さな 目盛り ひとつで いっぷん、数字 ひとつで ごふん。一緒に 数えよう。ごふん、じゅっぷん、じゅうごふん、にじゅっぷん。",
        "ちょうどの とき。 長い針が 真上の じゅうにを さしたら、「ちょうど」だよ。短い針が さん、長い針が じゅうになら、さんじ！",
        "はんの とき。 長い針が 下の ろくを さしたら、さんじゅっぷん、「はん」だよ。短い針が、次の 数字との 真ん中に あるね。",
        "短い針から！ 読み方。まず 短い針で、なんじかを 見るよ。次に 長い針を ごふんずつ 数えて、なんぷんか。これは、はちじ じゅうごふん！",
        "午前と 午後。 短い針は、いちにちに にかい まわるよ！ いっかいめは 午前。夜中と 朝。にかいめは 午後。昼と 夕方と 夜。",
        "時計を 合わせよう！ 「時計を合わせる」では、上か 下の 矢印を いっかい 押すと、短い針が いちじかん 動くよ。左か 右で、長い針が いっぷん 動くよ。押したままに すると、動き続けるよ！ スペースで 午前と 午後を かえて、エンターで チェック！",
        "時計を 読もう！ 「時計を読む」では、時計を 見て、数字で 時間を 入れてね。午前か 午後を 選んで、エンターを 押してね！",
        "砂時計を 見てね！ 砂時計の 砂は、残りの 時間を 教えてくれるよ。あせらず 楽しんでね。準備は いい？ さあ、はじめよう！",
    ],
}

MISC = {
    'en': {'voiceon': 'Voice on!'},
    'ja': {'voiceon': 'こえ、オン！'},
}


def lines():
    """Yield (lang, id, text) for every clip."""
    for lang in ('en', 'ja'):
        for h24 in range(24):
            for m in range(60):            # every minute (Hard uses times like 8:23)
                text = en_time(h24, m) if lang == 'en' else ja_time(h24, m)
                yield lang, 't%02d%02d' % (h24, m), text
        for i, text in enumerate(TUT[lang]):
            yield lang, 'tut%d' % i, text
        for k, text in MISC[lang].items():
            yield lang, k, text


def setup_espeak():
    """espeak-ng cannot open data paths longer than ~160 characters, so copy its
    data to a short folder when the virtual environment lives deep inside /tmp."""
    import espeakng_loader
    from phonemizer.backend.espeak.wrapper import EspeakWrapper
    src = espeakng_loader.get_data_path()
    if len(src) > 120:
        dst = os.path.expanduser('~/.cache/ccesp/espeak-ng-data')
        if not os.path.isdir(dst):
            shutil.copytree(src, dst)
        src = dst
    import misaki.espeak  # noqa: F401  (sets the library path)
    EspeakWrapper.set_data_path(src)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='', help='only ids starting with this prefix')
    ap.add_argument('--lang', default='', help='en or ja')
    ap.add_argument('--print', action='store_true', help='print texts and phonemes, write nothing')
    ap.add_argument('--force', action='store_true', help='re-make clips that already exist')
    args = ap.parse_args()

    setup_espeak()
    import numpy as np
    import soundfile as sf
    from kokoro import KPipeline

    todo = [x for x in lines() if x[1].startswith(args.only) and (not args.lang or x[0] == args.lang)]
    pipes = {}
    model = None
    tmp = tempfile.mkdtemp()
    pool, jobs = ThreadPoolExecutor(max_workers=1), []

    def encode(wav, out):
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-ac', '1', '-c:a', 'libopus',
                        '-b:a', '40k', '-application', 'voip', out], check=True)
        os.remove(wav)
    for n, (lang, cid, text) in enumerate(todo, 1):
        out = os.path.join(OUT, lang, cid + '.ogg')
        if not args.print and not args.force and os.path.exists(out):
            continue
        if lang not in pipes:
            pipes[lang] = KPipeline(lang_code='a' if lang == 'en' else 'j', repo_id='hexgrad/Kokoro-82M',
                                    model=False if args.print else (model if model is not None else True))
            if not args.print and model is None:
                model = pipes[lang].model
        pipe = pipes[lang]
        if args.print:
            ph = ' | '.join(p for _, p, _ in pipe(text))
            print('%s %-6s %s\n           %s' % (lang, cid, text, ph))
            continue
        chunks = [a.numpy() if hasattr(a, 'numpy') else a
                  for _, _, a in pipe(text, voice=VOICE[lang], speed=SPEED[lang]) if a is not None]
        audio = np.concatenate(chunks)
        # trim silence, then add a short, even lead-in / tail
        thr = 0.01 * np.max(np.abs(audio))
        idx = np.where(np.abs(audio) > thr)[0]
        audio = audio[max(0, idx[0] - 600): idx[-1] + 2400]
        audio = np.concatenate([np.zeros(1200), audio, np.zeros(2400)]).astype(np.float32)
        wav = os.path.join(tmp, '%s-%s.wav' % (lang, cid))
        sf.write(wav, audio, 24000)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        jobs.append(pool.submit(encode, wav, out))
        print('[%d/%d] %s/%s  %s' % (n, len(todo), lang, cid, text), flush=True)
    for j in jobs:
        j.result()
    pool.shutdown()
    shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    sys.exit(main())
