# Chrono Critters 🕰️

**Learn to tell time with cute animal friends!**
*かわいい どうぶつと とけいを よもう！*

Chrono Critters is a gentle, colorful game that teaches young children how an analog clock works: the short hour hand, the long minute hand, and AM and PM. It is fully bilingual in **English** and **Japanese (日本語)**.

**Recommended for ages 4+**

- **Version:** v0.1.2
- **Release date:** 2026-11-08
- **Created by:** Shawn Rapaz, with Claude Code
- **Website:** <https://shoukugames.org/>
- **Contact:** info@shoukugames.org
- **License:** GNU General Public License v3.0 (see [LICENSE](LICENSE))

---

## What's new in v0.1.2

- **Hard is now really hard**: Hard levels use exact times to the minute, such as **8:23 PM**, **9:11 AM** or **12:34 PM**. Hard times are never on a 5-minute mark, so players must count the little minute marks. The minute helper numbers stay hidden.
- The voice can now say **every minute of the day** in English and Japanese, with correct Japanese readings (いっぷん, ろっぷん, はっぷん, じゅっぷん…).
- For Parents gives a new tip when exact minutes are causing trouble.

## What's new in v0.1.1

- **Natural, human-sounding voice** in English and Japanese, replacing the robotic system voice.
- **Music that follows the time of day**: happy and upbeat in the morning and afternoon, soft and sleepy at night and early morning.
- **Precise hands**: one key press moves one hour or one minute; hold to keep moving.
- Tutorial updated to match.

## Features

- **Two game modes**
  - **Set the Clock**: the time is shown in numbers at the top of the screen (for example `7:30 AM`), and the player turns the hands to match it.
  - **Read the Clock**: the clock shows a time, and the player types it in numbers at the bottom of the screen, then picks AM or PM.
- **24 levels**, each with a different cute animal friend: kitty, puppy, bunny, bear, panda, fox, piggy, froggy, owl, chick, penguin, mouse, koala, lion, tiger, monkey, elephant, cow, sheep, raccoon, hamster, duck, deer and unicorn. Every level picks a new random time.
- **Three difficulty levels**
  - *Easy*: o'clock times between 6 AM and 8 PM.
  - *Medium*: o'clock, quarter past, half past and quarter to, at any hour.
  - *Hard*: exact times to the minute, at any hour (for example 8:23 PM, 9:11 AM, 12:34 PM). Hard times are never on a 5-minute mark, and the minute helper numbers are hidden.
- **Teaches AM and PM**: the hour hand goes around twice a day. As the player moves the hands, the sky changes from night to sunrise, daytime, sunset and night again.
- **Hourglass timer**: each level has 120 seconds, shown as sand falling in an hourglass instead of numbers.
- **Natural spoken voice**: when the clock is set correctly, a friendly, human-sounding voice says the time out loud ("It's seven thirty AM, in the morning!" / 「ごぜん、しちじ さんじゅっぷん です。」) so children learn how to say it. The tutorial is narrated too. Every line is pre-recorded with a neural voice and bundled with the game, so it sounds the same on every computer, works offline, and needs no voices installed. Japanese times use the correct readings (よじ, くじ, じゅっぷん, さんじゅっぷん…).
- **Rewards**: points, up to 3 stars per level, confetti, and a **Sticker Book** that collects every animal friend.
- **Precise hand control**: each press of an arrow key moves a hand exactly one step: the short hand one hour, the long hand one minute. No numbers or minutes are skipped. Hold the key down and the hand keeps moving until you let go. Like a real clock, when the long hand passes 12 the short hand moves on to the next hour.
- **Animated tutorial** ("How Clocks Work") on the title screen, with narration.
- **For Parents** section (behind a simple grown-up math gate) showing:
  - time spent playing levels and total time in the app
  - levels played and cleared, first-try accuracy, score
  - mistakes split into hour, minutes, AM/PM and timeouts
  - play time for the last 7 days
  - personalized advice on where your child needs to practice
  - a list of recent levels
- **Music that follows the time of day** (can be turned on or off on the title screen):
  - **Daytime (6:00 AM – 5:59 PM)**: a happy, upbeat tune with marimba, ukulele and soft percussion.
  - **Night and early morning (6:00 PM – 5:59 AM)**: soft, sleepy ambient pads and music-box bells.
  - In a level, the music matches the level's time (a 7:30 AM puzzle is bright and bouncy, an 8:00 PM puzzle is calm and sleepy). On the title screen and menus it follows the computer's clock. The music cross-fades smoothly when it changes.
- A **clock-winding ratchet sound** when turning the hands, and gentle sound effects. Music and effects are generated live in code.
- **Credits** screen with version, date, creator, website, email and license.

## Controls

| Action | Set the Clock | Read the Clock |
|---|---|---|
| Move the **short (hour) hand** one hour | `↑` / `↓` (hold to keep moving) | — |
| Move the **long (minute) hand** one minute | `←` / `→` (hold to keep moving) | — |
| Switch **AM / PM** | `Space` | `A` / `P`, or `↑` / `↓` |
| Type the time | — | number keys, `Backspace`, `:` or `Tab` to jump to minutes |
| Check the answer | `Enter` | `Enter` |
| Pause | `Esc` / `P` | `Esc` |
| Full screen | `F11` or `Alt+Enter` | `F11` or `Alt+Enter` |

Everything can also be played with the mouse or a touch screen using the buttons on screen. Tap a hand button for one step, or press and hold it to keep the hand moving.

## Installing

### Linux (Debian / Ubuntu): `.deb`

```bash
sudo apt install ./dist/chrono-critters_0.1.2_amd64.deb
```

Then launch **Chrono Critters** from your application menu, or run `chrono-critters`.

> **Voice:** the spoken voice is built into the game, so nothing extra is needed. `speech-dispatcher` is only recommended as a backup in case a voice clip cannot be played.

### Windows: `.exe`

Run `dist/Chrono-Critters-Setup-0.1.2.exe` and follow the installer. The installer is not code-signed yet, so Windows may show an "unknown publisher" warning; choose *More info → Run anyway*.

## Building from source

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
npm install          # install Electron and electron-builder
npm start            # run the game in development

npm run dist:linux   # build dist/chrono-critters_0.1.2_amd64.deb
npm run dist:win     # build dist/Chrono-Critters-Setup-0.1.2.exe (needs Wine on Linux)
npm run dist         # build both
```

### Re-recording the voice

The voice clips in `src/voice/` are made by `tools/make_voice.py` with the open [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) text-to-speech model (Apache License 2.0). The script's header lists the Python packages it needs. Edit the texts in the script, then run:

```bash
python tools/make_voice.py --print   # check the texts and pronunciation
python tools/make_voice.py --force   # re-make every clip
```

You can also open `src/index.html` directly in a modern browser to play without installing anything. Browsers only start audio after the first click or key press.

## Project layout

```
main.js            Electron main process (window, full screen, external links)
src/index.html     Game page
src/style.css      Styles
src/js/i18n.js     All English and Japanese text, time wording
src/js/storage.js  Settings, progress and parent statistics (saved locally)
src/js/audio.js    Day / night music, clock-winding sound, effects, voice playback
src/js/animals.js  The 24 animal friends (drawn in code)
src/js/scene.js    Sky, hills, analog clock, hourglass, confetti
src/js/tutorial.js Animated "How Clocks Work" tutorial
src/js/parents.js  For Parents dashboard
src/js/game.js     Gameplay for both modes
src/js/app.js      Screens, title, sticker book, input, main loop
src/voice/         Pre-recorded voice clips (English and Japanese)
src/fonts/         M PLUS Rounded 1c (SIL Open Font License 1.1)
tools/make_voice.py  Makes the voice clips
assets/            App icons used by the installers
```

## Privacy

Chrono Critters does not collect, send or share any data. Scores and statistics are stored only on the local computer and can be erased from the For Parents screen.

## Reporting bugs

See [BUGREPORT.md](BUGREPORT.md).

## License

Copyright © 2026 Shawn Rapaz

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the [GNU General Public License](LICENSE) for more details.

The bundled font *M PLUS Rounded 1c* is licensed under the SIL Open Font License 1.1 (`src/fonts/OFL-LICENSE.txt`). The voice clips were generated with the *Kokoro-82M* model, licensed under the Apache License 2.0.
