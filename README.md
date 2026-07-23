# Braille Blitz — UEB Practice Game

A browser-based typing game for practicing **Unified English Braille (UEB)** using a six-key chord input (Perkins Brailler style). Play it live at:

**https://6610685346.github.io/Braille_UEB_web_game/**

---

## Table of Contents

- [What This Is](#what-this-is)
- [How to Play](#how-to-play)
- [Project Structure](#project-structure)
- [Setting Up a Development Environment](#setting-up-a-development-environment)
- [How the Game Works Internally](#how-the-game-works-internally)
- [UEB Rule Coverage](#ueb-rule-coverage)
- [Development Process & Notes](#development-process--notes)
- [Adding or Editing Content](#adding-or-editing-content)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## What This Is

Braille Blitz teaches UEB by having the player "type" braille cells using a six-key chord (like a Perkins Brailler), rather than reading braille visually. Two modes are supported:

- **Practice mode** — a target word/sentence is shown; the player types it out one braille cell at a time, with live feedback.
- **Timed mode** — a rhythm-game-style "falling note highway," where braille cells scroll down and the player must chord them in time.

The game supports both **Grade 1** (uncontracted, letter-by-letter) and **Grade 2** (contracted, using wordsigns, groupsigns, and shortforms) braille, and progresses through seven levels — letters, numbers, punctuation, contractions, prefixes, shortforms, and indicators.

---

## How to Play

### Controls

Braille cells are entered using six keys, mapped to the two columns of dots in a standard 2×3 braille cell:

| Key | Dot |
|-----|-----|
| `S` | dot 3 |
| `D` | dot 2 |
| `F` | dot 1 |
| `J` | dot 4 |
| `K` | dot 5 |
| `L` | dot 6 |

Press and hold the keys for the dots in a cell, then release — the game reads the combination as one chord. Other controls:

- **Backspace** — delete the last entered cell (practice mode)
- **Enter** — submit/confirm (practice mode)
- **Space** — insert a space between words, or confirm depending on context
- **Escape** — pause the game

### Modes

- Choose **Grade 1** or **Grade 2** before starting.
- Choose **Practice** (self-paced, one word/sentence at a time) or **Timed** (scored, against the clock).
- Timed mode has three difficulty tiers per level (easy / normal / hard), each with its own word/sentence list.

---

## Project Structure

```
/
├── index.html              # Entry point — sets up all game screens/UI
├── style.css                # All game styling
├── script.js                 # All game logic: tokenizers, chord input, decode, rendering
├── songs/                   # Background music (mp3)
│   ├── chill.mp3
│   ├── night.mp3
│   └── ...
├── words/                   # Practice-mode word/sentence pools
│   ├── practice_g1.txt      # Grade 1 practice content (one word/phrase per line)
│   └── practice_g2.txt      # Grade 2 practice content
└── sentence/                 # Timed-mode content, organized by level and difficulty
    └── level{N}/
        └── level{N}_{easy|normal|hard}.txt
```

**Important:** all file references in `script.js` and `index.html` use **relative paths**. `index.html`, `script.js`, `style.css`, `songs/`, `words/`, and `sentence/` must all stay in the same folder, at whatever level GitHub Pages (or your local server) is serving from. Moving `index.html` alone without the rest will break the game.

---

## Setting Up a Development Environment

### Requirements

- Any modern browser (Chrome, Firefox, Edge, Safari)
- A **local web server** — this is required because `script.js` uses `fetch()` to load the word/sentence `.txt` files, and browsers block `fetch()` from working on files opened directly (`file://` URLs) due to CORS restrictions. Just double-clicking `index.html` will not work correctly.

### Quick Start

1. **Clone the repo:**
   ```bash
   git clone https://github.com/6610685346/Braille_UEB_web_game.git
   cd Braille_UEB_web_game
   ```

2. **Start a local server** from the project root. Any of these work:

   ```bash
   # Python 3 (built-in, no install needed)
   python -m http.server 8000

   # Node.js
   npx serve .

   # VS Code
   # Install the "Live Server" extension, right-click index.html → "Open with Live Server"
   ```

3. **Open the game** in your browser:
   ```
   http://localhost:8000
   ```

4. **Edit and reload** — this is a pure static site with no build step. Edit `script.js`, `style.css`, or `index.html` directly and refresh the browser to see changes.

### Debugging Tips

- Open the browser DevTools console (F12) — the game logs buffer state and decoded output during practice mode, which is useful for tracing chord-input bugs (`BUFFER: [...]`, `DECODED: "..."`).
- Since there's no build/bundle step, you can set breakpoints directly in the browser's Sources tab against the real `script.js`.
- If word lists or sentences aren't loading, check the Network tab for 404s on the `.txt` files — this almost always means the local server isn't running from the correct root folder.

### Deploying

The live site is hosted on **GitHub Pages**, configured to serve from the repository root (`main` branch, `/` folder — see Settings → Pages in the repo). Any push to `main` redeploys automatically; there is no separate build/CI step since this is a static site.

---

## How the Game Works Internally

For anyone modifying `script.js`, here's the high-level architecture:

1. **Tokenizers** (`tokenizeGrade1`, `tokenizeGrade2`) — take a plain-text target word/sentence and convert it into a sequence of *target tokens*, each representing one braille cell (or, for multi-cell symbols, a short sequence of cells) and the dot-pattern needed to produce it. This is essentially a forward UEB braille translator.

2. **Chord input** (`handleChordRelease`) — as the player presses key combinations, this function resolves each physical chord into a *token*, appending it to `practiceBufferTokens`. Because many braille cells are **reused for multiple meanings** depending on context (see below), this function frequently checks `nextExpected` — the token the *target* tokenizer says should come next — to disambiguate what the player intended.

3. **Decode** (`decodePracticeBuffer`) — a liblouis-style state machine that walks the accumulated `practiceBufferTokens` and reconstructs the printed text the player has typed so far, for on-screen feedback.

### The central recurring challenge: cell reuse

UEB is not a 1-letter-per-cell system — a huge number of cells mean different things depending on what surrounds them. A single chord might mean:
- A capital indicator, the first cell of a double-dash, *or* a single-quote prefix (dot 6 alone)
- A currency prefix, *or* an angle-bracket prefix (dot 4 alone)
- A quote's base cell, *or* a question mark (they share a cell)
- A wordsign like `it`/`but`, *or* a plain letter, depending on whether it stands alone as a full word
- A letter-group contraction like `wh`, *or* a whole-word sign like `which`, again depending on word-boundary

The general solution used throughout this codebase: whenever a chord is ambiguous, check `nextExpected` (what the *target* tokenizer says should appear at this buffer position) before committing to a resolution. This pattern recurs in dozens of places in `handleChordRelease` and is the main thing to understand before adding new punctuation or contractions.

---

## UEB Rule Coverage

The game's tokenizers and chord-input logic implement substantial portions of the following sections of the *Rules of Unified English Braille, 2024 Edition*:

| Section | Title | Coverage |
|---|---|---|
| 5 | Grade 1 Mode | Uncontracted letter-by-letter braille, used throughout Grade 1 practice and as the fallback within Grade 2 passages |
| 6 | Numeric Mode | Digits, numeric indicator/terminator, commas and periods inside numbers, currency signs, feet/inches measurement marks |
| 7 | Punctuation | Comma, period, colon, semicolon, exclamation, hyphen/dash, question mark, ellipsis, quotation marks (single & double), apostrophe, solidus, brackets, angle quotes |
| 8 | Capitalisation | Capital letter indicator, including its disambiguation against dash and single-quote-prefix, which share the same cell |
| 10 | Contractions | Alphabetic wordsigns, strong wordsigns/groupsigns, lower groupsigns/wordsigns, initial-letter contractions (prefix + base cell), final-letter groupsigns |

This is not full UEB coverage (multi-line formatting, typeforms, and a handful of rarer symbols are intentionally out of scope for a single-line typing game), but it goes well beyond a simple alphabet drill — most of the genuinely tricky disambiguation work in this codebase exists specifically to handle cells that are legitimately reused across these five sections.

---

## Development Process & Notes

Built incrementally against the *Rules of Unified English Braille, 2024 Edition*, starting with Section 7 (Punctuation) and extending into Sections 5, 6, 8, and 10 as gaps surfaced through testing. The recurring cause behind nearly every bug below: a braille cell often means different things depending on context, so resolving a chord correctly requires checking what's expected next or what already came before — not just the dot pattern alone.

**Section 7 — Punctuation**
- **Problem:** `?` and the opening double-quote share a dot pattern; `?` was always misread as a quote. **Fix:** check the target sequence before committing to either meaning.
- **Problem:** standalone single quotes were missing their required indicator, so they misread as the wordsigns "his"/"was". **Fix:** detect the standalone case and insert the indicator.
- **Problem:** typing an ellipsis (three periods) collided with an existing double-tap-period shortcut. **Fix:** check for the ellipsis case first.
- **Problem:** curly quotes (`" " ' '`) weren't recognized at all; the first attempt at fixing this discarded their built-in open/close direction and broke apostrophe detection. **Fix:** match curly quotes explicitly and preserve their direction.

**Section 6 — Numeric Mode**
- **Problem:** currency signs and feet/inches marks broke, since they're the only symbols that appear *inside* an active number and numeric mode had no handling for them. **Fix:** added explicit currency/prime-mark cases to the numeric branch.
- **Problem:** a feet mark needs a fresh number indicator right after it, but the second indicator was read as "end numbers." **Fix:** detect the post-prime-mark case and treat it as a new number.

**Section 10 — Contractions**
- **Problem:** prefixed contractions (`there`, `day`, `-tion`) never resolved — there was no logic to combine a prefix cell with the following cell. **Fix:** added prefix+base lookup against the word tables.
- **Problem:** all 21 single-letter wordsigns (`but`, `it`, `you`, etc.) were unreachable because the plain-letter fallback ran first. **Fix:** reordered so wordsign context is checked before falling back to the letter.

**Section 8 — Capitalisation**
- **Problem:** the capital indicator's cell is shared with the dash and single-quote-prefix. **Fix:** same "check what's next" pattern used throughout.

*Section 5 (Grade 1 Mode) has no entry above — it never had a bug of its own. As the simpler, uncontracted mode, it mostly inherited fixes made for Grade 2's chord handler (the same punctuation/bracket disambiguation logic had to be added to both), rather than surfacing distinct issues.*

---

## Adding or Editing Content

- **Practice-mode words/sentences:** edit `words/practice_g1.txt` or `words/practice_g2.txt` — one word or phrase per line, plain text. New lines are picked up automatically (no code changes needed) as long as every symbol used is one the tokenizer already supports.
- **Timed-mode levels:** edit the relevant `sentence/level{N}/level{N}_{difficulty}.txt` file, same one-per-line format.
- **New punctuation/symbols:** requires code changes in three places in `script.js` — the tokenizer (both grade 1 and grade 2), the chord-input resolution in `handleChordRelease`, and (if the symbol is a two-cell construct) the dedup logic in `decodePracticeBuffer`. Check the actual UEB rulebook for the correct dot pattern before implementing — several "looks obvious" assumptions during this project turned out to be wrong on inspection (see Development Process above).
- **Music:** drop an `.mp3` into `songs/` and add an entry to the `SONGS` array near the top of `script.js`.

---

## Known Limitations

- Nondirectional quotes and multi-line brackets (UEB 7.6.5 and 7.7) are intentionally not implemented — not relevant to a single-line typing game.
- Timed mode has not been exercised as thoroughly as Practice mode against the punctuation additions described above; if you add new symbols, test both modes.

---

## License

This project is licensed under the **GNU General Public License (GPL)**. See [LICENSE](LICENSE) for the full text.
