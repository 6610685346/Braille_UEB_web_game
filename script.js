//-------------------------------//
//----Global constant variables--//
//-------------------------------//

const keyMap = { 'f': 0, 'd': 1, 's': 2, 'j': 3, 'k': 4, 'l': 5 };
const PERFECT_ZONE = { top: 0.70, bot: 0.95 };
const GOOD_ZONE = { top: 0.55, bot: 0.99 };
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const g1SymbolIndicator = [false, false, false, false, true, true];
const g1WordIndicator = [false, false, false, false, true, true];
const g1PassageIndicator = [false, false, false, false, true, true];
const g1Terminator = [false, false, true, false, false, false];
const numTerminatorPattern = [false, true, false, false, false, false];
const currencyIndicatorPattern = [false, false, false, true, false, false];
const dashPattern = [false, false, true, false, false, true];
const underscorePrefixPattern = [false, false, false, true, false, true];
const lineContinuationPattern = [false, false, false, true, false, false];
const dot6OnlyPattern = [false, false, false, false, false, true];
const solidusPattern = [false, false, true, true, false, false];
const dashPrefixPattern = [false, false, false, false, false, true];
const openBracketPattern = [true, true, false, false, false, true];
const closeBracketPattern = [false, false, true, true, true, false];
const backslashPattern = [true, false, false, false, false, true];
const primePattern = [false, true, true, false, true, true];

let currentKeysPressed = [false, false, false, false, false, false];
let keysHitInChord = [false, false, false, false, false, false];
let targetSentence = "", targetBrailleSequence = [], currentIndex = 0;
let score = 0, streak = 0, multiplier = 1, maxMultiplierAchieved = 1;
let timeLeft = 60, timerInterval, isPlaying = false, gameMode = "timed";
let freeWriteText = "", practiceBufferTokens = [];
let lastChord = null;
let wordSpeakBuffer = [];
let unlockedLevels = new Set([1]);
let perfectCount = 0, goodCount = 0, missCount = 0;
let musicOn = false;
let musicNodes = [];
let musicScheduler = null;
let masterVolume = 0.1;
let noteSpeed = 0.0002;
let noteY = 0, noteRaf = null, noteLastTime = null, noteActive = false;
let judgmentTimer = null;
let isPaused = false;
let brailleGrade = 2;
let gameDifficulty = 'easy';
let missPenaltyTime = 0;
let missPenaltyScore = 2;
let sentencePool = [];
let sentencePoolIndex = 0;
let currentPracticeWord = "";
let practiceWordPool = [];
let currentBeat = 0.28;
let moonIdx = 0;
let missedLast = false;
let inputLocked = true;
let currentAudio = null;
let voiceVolume = 1;
let countdownTimeouts = [];
let practiceCharCount = 0;
let dotHintsEnabled = true;
let keyHintsEnabled = true;
let secondLastChord = null;
let thirdLastChord = null;


//-------------------------------//
//-----LEVEL DEFINITIONS ----------
//-------------------------------//

const LEVELS = {
    1: { name: "Letters", description: "Basic alphabet" },
    2: { name: "Numbers", description: "Added numbers" },
    3: { name: "Punctuation", description: "Added punctuation" },
    4: { name: "Contractions", description: "Added contractions" },
    5: { name: "Prefixes", description: "Added prefixes" },
    6: { name: "Shortforms", description: "Added shortform" },
    7: { name: "Indicators", description: "Added indicators" }
};

let currentStageLevel = 1;
const MAX_LEVEL = 7;

//--------------------------------------------//
//----------NORMAL ALPHABET ARRAY---------------
//--------------------------------------------//

const brailleAlphabet = {
    'a': [true, false, false, false, false, false],
    'b': [true, true, false, false, false, false],
    'c': [true, false, false, true, false, false],
    'd': [true, false, false, true, true, false],
    'e': [true, false, false, false, true, false],
    'f': [true, true, false, true, false, false],
    'g': [true, true, false, true, true, false],
    'h': [true, true, false, false, true, false],
    'i': [false, true, false, true, false, false],
    'j': [false, true, false, true, true, false],
    'k': [true, false, true, false, false, false],
    'l': [true, true, true, false, false, false],
    'm': [true, false, true, true, false, false],
    'n': [true, false, true, true, true, false],
    'o': [true, false, true, false, true, false],
    'p': [true, true, true, true, false, false],
    'q': [true, true, true, true, true, false],
    'r': [true, true, true, false, true, false],
    's': [false, true, true, true, false, false],
    't': [false, true, true, true, true, false],
    'u': [true, false, true, false, false, true],
    'v': [true, true, true, false, false, true],
    'w': [false, true, false, true, true, true],
    'x': [true, false, true, true, false, true],
    'y': [true, false, true, true, true, true],
    'z': [true, false, true, false, true, true],
    ',': [false, true, false, false, false, false],
    ';': [false, true, true, false, false, false],
    ':': [false, true, false, false, true, false],
    '\'': [false, false, true, false, false, false],
    '.': [false, true, false, false, true, true],
    '!': [false, true, true, false, true, false],
    '?': [false, true, true, false, false, true],
    ' ': [false, false, false, false, false, false],
    '-': [false, false, true, false, false, true],
};

const dquoteOpenPattern = brailleAlphabet['?'];
const dquoteClosePattern = [false, false, true, false, true, true];

const brailleNumbers = {
    '1': brailleAlphabet['a'], '2': brailleAlphabet['b'], '3': brailleAlphabet['c'],
    '4': brailleAlphabet['d'], '5': brailleAlphabet['e'], '6': brailleAlphabet['f'],
    '7': brailleAlphabet['g'], '8': brailleAlphabet['h'], '9': brailleAlphabet['i'],
    '0': brailleAlphabet['j']
};

const capIndicatorPattern = [false, false, false, false, false, true];
const capTerminator = [false, false, true, false, false, false];
const numIndicatorPattern = [false, false, true, true, true, true];

//-------------------------------//
//--------PREFIX ARRAY------------
//-------------------------------//

const PREFIXES = {
    dot4: [false, false, false, true, false, false],
    dot5: [false, false, false, false, true, false],
    dot45: [false, false, false, true, true, false],
    dot456: [false, false, false, true, true, true],
    dot46: [false, false, false, true, false, true],
    dot56: [false, false, false, false, true, true],
};

const LONE_SIGN_WORDS = { ch: "child", sh: "shall", th: "this", wh: "which", ou: "out", st: "still" };

//-------------------------------//
//--------BRACKET PREFIX ARRAY-----
//-------------------------------//

const BRACKET_PREFIXES = {
    '(': PREFIXES.dot5, ')': PREFIXES.dot5,
    '[': PREFIXES.dot46, ']': PREFIXES.dot46,
    '{': PREFIXES.dot456, '}': PREFIXES.dot456,
    '<': PREFIXES.dot4, '>': PREFIXES.dot4,
};

//------------------------------//
// --- INDICATOR TOKEN TABLE -----
//------------------------------//

const INDICATOR_TOKENS = [
    [capIndicatorPattern, { type: "cap", val: "CAP" }],
    [numIndicatorPattern, { type: "numeric_indicator", val: "#" }],
    [currencyIndicatorPattern, { type: "currency_prefix", val: "CURRENCY" }],
    [PREFIXES.dot5, { type: "prefix", val: "dot5" }],
    [PREFIXES.dot45, { type: "prefix", val: "dot45" }],
    [PREFIXES.dot456, { type: "prefix", val: "dot456" }],
    [PREFIXES.dot46, { type: "prefix", val: "dot46" }],
    [PREFIXES.dot56, { type: "prefix", val: "dot56" }],
    [capTerminator, { type: "cap_terminator", val: "CAP-TERM" }],
];

//-------------------------------//
// --- WHOLE WORD ARRAY-------- ---
//-------------------------------//

const g2WholeWords = {
    "but": { pattern: brailleAlphabet['b'] }, "can": { pattern: brailleAlphabet['c'] },
    "do": { pattern: brailleAlphabet['d'] }, "every": { pattern: brailleAlphabet['e'] },
    "from": { pattern: brailleAlphabet['f'] }, "go": { pattern: brailleAlphabet['g'] },
    "have": { pattern: brailleAlphabet['h'] }, "just": { pattern: brailleAlphabet['j'] },
    "knowledge": { pattern: brailleAlphabet['k'] }, "like": { pattern: brailleAlphabet['l'] },
    "more": { pattern: brailleAlphabet['m'] }, "not": { pattern: brailleAlphabet['n'] },
    "people": { pattern: brailleAlphabet['p'] }, "quite": { pattern: brailleAlphabet['q'] },
    "rather": { pattern: brailleAlphabet['r'] }, "so": { pattern: brailleAlphabet['s'] },
    "that": { pattern: brailleAlphabet['t'] }, "us": { pattern: brailleAlphabet['u'] },
    "very": { pattern: brailleAlphabet['v'] }, "will": { pattern: brailleAlphabet['w'] },
    "it": { pattern: brailleAlphabet['x'] }, "you": { pattern: brailleAlphabet['y'] },
    "as": { pattern: brailleAlphabet['z'] },

    "child": { pattern: [true, false, false, false, false, true] },
    "out": { pattern: [true, true, false, false, true, true] },
    "shall": { pattern: [true, false, false, true, false, true] },
    "still": { pattern: [false, false, true, true, false, false] },
    "this": { pattern: [true, false, false, true, true, true] },
    "which": { pattern: [true, false, false, false, true, true] },
    "be": { pattern: [false, true, true, false, false, false] },
    "enough": { pattern: [false, true, false, false, false, true] },
    "were": { pattern: [false, true, true, false, true, true] },
    "his": { pattern: [false, true, true, false, false, true] },
    "in": { pattern: [false, false, true, false, true, false] },
    "was": { pattern: [false, false, true, false, true, true] },

    "day": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['d'] },
    "ever": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['e'] },
    "father": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['f'] },
    "here": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['h'] },
    "know": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['k'] },
    "lord": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['l'] },
    "mother": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['m'] },
    "name": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['n'] },
    "one": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['o'] },
    "part": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['p'] },
    "question": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['q'] },
    "right": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['r'] },
    "some": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['s'] },
    "time": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['t'] },
    "under": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['u'] },
    "work": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['w'] },
    "young": { prefix: PREFIXES.dot5, pattern: brailleAlphabet['y'] },
    "there": { prefix: PREFIXES.dot5, pattern: [false, true, true, true, false, true] },
    "character": { prefix: PREFIXES.dot5, pattern: [true, false, false, false, false, true] },
    "through": { prefix: PREFIXES.dot5, pattern: [true, false, false, true, true, true] },
    "ought": { prefix: PREFIXES.dot5, pattern: [true, true, false, false, true, true] },
    "where": { prefix: PREFIXES.dot5, pattern: [true, false, false, false, true, true] },

    "these": { prefix: PREFIXES.dot45, pattern: [false, true, true, true, false, true] },
    "those": { prefix: PREFIXES.dot45, pattern: [true, false, false, true, true, true] },
    "whose": { prefix: PREFIXES.dot45, pattern: [true, false, false, false, true, true] },
    "upon": { prefix: PREFIXES.dot45, pattern: brailleAlphabet['u'] },
    "word": { prefix: PREFIXES.dot45, pattern: brailleAlphabet['w'] },
    "cannot": { prefix: PREFIXES.dot456, pattern: brailleAlphabet['c'] },
    "had": { prefix: PREFIXES.dot456, pattern: brailleAlphabet['h'] },
    "many": { prefix: PREFIXES.dot456, pattern: brailleAlphabet['m'] },
    "spirit": { prefix: PREFIXES.dot456, pattern: brailleAlphabet['s'] },
    "their": { prefix: PREFIXES.dot456, pattern: [false, true, true, true, false, true] },
    "world": { prefix: PREFIXES.dot456, pattern: brailleAlphabet['w'] }
};

//-------------------------------//
//-----PART-OF-WORD ARRAY------ ---
//-------------------------------//

const g2PartWords = [
    { text: "and", pattern: [true, true, true, true, false, true], pos: "any" },
    { text: "for", pattern: [true, true, true, true, true, true], pos: "any" },
    { text: "of", pattern: [true, true, true, false, true, true], pos: "any" },
    { text: "the", pattern: [false, true, true, true, true, true], pos: "any" },
    { text: "with", pattern: [false, true, true, true, false, true], pos: "any" },
    { text: "be", pattern: [false, true, true, false, false, false], pos: "start" },
    { text: "con", pattern: [false, true, false, false, true, false], pos: "start" },
    { text: "dis", pattern: [false, true, false, false, true, true], pos: "start" },
    { text: "ch", pattern: [true, false, false, false, false, true], pos: "any" },
    { text: "sh", pattern: [true, false, false, true, false, true], pos: "any" },
    { text: "th", pattern: [true, false, false, true, true, true], pos: "any" },
    { text: "wh", pattern: [true, false, false, false, true, true], pos: "any" },
    { text: "ou", pattern: [true, true, false, false, true, true], pos: "any" },
    { text: "st", pattern: [false, false, true, true, false, false], pos: "any" },
    { text: "gh", pattern: [true, true, false, false, false, true], pos: "any" },
    { text: "ed", pattern: [true, true, false, true, false, true], pos: "any" },
    { text: "er", pattern: [true, true, false, true, true, true], pos: "any" },
    { text: "ow", pattern: [false, true, false, true, false, true], pos: "any" },
    { text: "ar", pattern: [false, false, true, true, true, false], pos: "any" },
    { text: "ing", pattern: [false, false, true, true, false, true], pos: "any" },
    { text: "ound", prefix: PREFIXES.dot46, pattern: brailleAlphabet['d'], pos: "any" },
    { text: "ance", prefix: PREFIXES.dot46, pattern: brailleAlphabet['e'], pos: "any" },
    { text: "sion", prefix: PREFIXES.dot46, pattern: brailleAlphabet['n'], pos: "any" },
    { text: "less", prefix: PREFIXES.dot46, pattern: brailleAlphabet['s'], pos: "any" },
    { text: "ount", prefix: PREFIXES.dot46, pattern: brailleAlphabet['t'], pos: "any" },
    { text: "ence", prefix: PREFIXES.dot56, pattern: brailleAlphabet['e'], pos: "any" },
    { text: "ong", prefix: PREFIXES.dot56, pattern: brailleAlphabet['g'], pos: "any" },
    { text: "ful", prefix: PREFIXES.dot56, pattern: brailleAlphabet['l'], pos: "any" },
    { text: "tion", prefix: PREFIXES.dot56, pattern: brailleAlphabet['n'], pos: "any" },
    { text: "ness", prefix: PREFIXES.dot56, pattern: brailleAlphabet['s'], pos: "any" },
    { text: "ment", prefix: PREFIXES.dot56, pattern: brailleAlphabet['t'], pos: "any" },
    { text: "ity", prefix: PREFIXES.dot56, pattern: brailleAlphabet['y'], pos: "any" },
    { text: "ea", pattern: [false, true, false, false, false, false], pos: "mid" },
    { text: "bb", pattern: [false, true, true, false, false, false], pos: "mid" },
    { text: "cc", pattern: [false, true, false, false, true, false], pos: "mid" },
    { text: "ff", pattern: [false, true, true, false, true, false], pos: "mid" },
    { text: "gg", pattern: [false, true, true, false, true, true], pos: "mid" },
    { text: "en", pattern: [false, true, false, false, false, true], pos: "any" },
    { text: "in", pattern: [false, false, true, false, true, false], pos: "any" }
];

//-------------------------------//
//-----SHORT FORM ARRAY------------
//-------------------------------//

const shortforms = {
    "about": "ab", "above": "abv", "according": "ac",
    "across": "acr", "after": "af", "afternoon": "afn",
    "afterward": "afw", "again": "ag", "against": "agst", "almost": "alm",
    "already": "alr", "also": "al", "although": "alth",
    "altogether": "alt", "always": "alw", "because": "bec",
    "before": "bef", "behind": "beh", "below": "bel",
    "beneath": "ben", "beside": "bes", "between": "bet",
    "beyond": "bey", "blind": "bl", "braille": "brl",
    "children": "chn", "conceive": "concv", "conceiving": "concvg",
    "could": "cd", "deceive": "dcv", "deceiving": "dcvg",
    "declare": "dcl", "declaring": "dclg", "either": "ei",
    "first": "fst", "friend": "fr", "good": "gd",
    "great": "grt", "herself": "herf", "him": "hm",
    "himself": "hmf", "immediate": "imm", "its": "xs",
    "itself": "xf", "letter": "lr", "little": "ll",
    "much": "mch", "must": "mst", "myself": "myf",
    "necessary": "nec", "neither": "nei", "oneself": "onef",
    "ourselves": "ourvs", "paid": "pd", "perceive": "percv",
    "perceiving": "percvg", "perhaps": "perh", "quick": "qk",
    "receive": "rcv", "receiving": "rcvg", "rejoice": "rjc",
    "rejoicing": "rjcg", "said": "sd", "should": "shd",
    "such": "sch", "themselves": "themvs", "thyself": "thyf",
    "today": "td", "together": "tgr", "tomorrow": "tm",
    "tonight": "tn", "would": "wd", "your": "yr",
    "yourself": "yrf", "yourselves": "yrvs"
};

//----------------------------------------------------------------//
//-------------------VOLUME AND MUSIC FUNCTIONS---------------------
//----------------------------------------------------------------//

const SONGS = [
    { name: 'chill', file: 'songs/chill.mp3' },
    { name: 'night', file: 'songs/night.mp3' },
    { name: 'smooth', file: 'songs/smooth.mp3' },
    { name: 'TownTheme', file: 'songs/TownTheme.mp3' },
    { name: 'No_More_Magic', file: 'songs/No_More_Magic.mp3' },
    { name: 'CakeTown_1', file: 'songs/CakeTown_1.mp3' }
];

function selectSong(pick) {
    pick = parseInt(pick);
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    musicOn = true;
    const musicBtn = document.getElementById('music-btn');
    if (musicBtn) { musicBtn.textContent = '⏸'; musicBtn.style.opacity = '1'; }
    const pauseMusicBtn = document.getElementById('pause-music-btn');
    if (pauseMusicBtn) { pauseMusicBtn.textContent = '⏸'; pauseMusicBtn.style.opacity = '1'; }

    currentAudio = new Audio(SONGS[pick].file);
    currentAudio.volume = masterVolume;
    currentAudio.loop = false;
    currentAudio.play();
    currentAudio.addEventListener('ended', () => {
        const nextPick = (pick + 1) % SONGS.length;
        selectSong(nextPick);
        document.querySelectorAll('#song-select, #pause-song-select').forEach(el => {
            if (el) el.value = nextPick;
        });
    });
}

function toggleMusic() {
    if (!currentAudio) return;
    musicOn = !musicOn;
    const symbol = musicOn ? '⏸' : '▶';
    const opacity = musicOn ? '1' : '0.5';
    document.getElementById('music-btn').textContent = symbol;
    document.getElementById('music-btn').style.opacity = opacity;
    const pauseMusicBtn = document.getElementById('pause-music-btn');
    if (pauseMusicBtn) { pauseMusicBtn.textContent = symbol; pauseMusicBtn.style.opacity = opacity; }
    if (musicOn) currentAudio.play();
    else currentAudio.pause();
}

function setVolume(val) {
    masterVolume = parseFloat(val);
    if (currentAudio) currentAudio.volume = masterVolume;
}


function buildSongDropdowns() {
    const options = SONGS.map((s, i) =>
        `<option value="${i}" ${s.name === 'Still Alive' ? 'selected' : ''}>${s.name}</option>`
    ).join('');

    document.querySelectorAll('#song-select, #pause-song-select').forEach(el => {
        if (el) el.innerHTML = options;
    });
}

//------------------//
//-----HELPERS--------
//------------------//

const patMatch = (a, b) => a.every((v, i) => v === b[i]);

// 8.4 / 8.5 / 8.6.3 — classify the word starting at index i for capital
// indicator purposes. Returns null for ordinary words and single capital
// letters, which keep using the existing per-letter cap indicator.
function scanCapitalRun(text, i) {
    const first = text.slice(i).match(/^[A-Za-z]+/);
    if (!first) return null;
    const word = first[0];
    const leadingCaps = (word.match(/^[A-Z]+/) || [""])[0];

    // 8.6.3 / 8.8 — mixed-case word starting with 2+ capitals then lowercase
    // (ABCs, OKd, WASPs): word-mode indicator covers only the capital run,
    // explicitly terminated before the lowercase tail. The whole word is
    // consumed here so the tail isn't re-tokenized as its own standalone word.
    if (leadingCaps.length >= 2 && leadingCaps.length < word.length) {
        return {
            partialWord: true,
            letters: leadingCaps,
            tail: word.slice(leadingCaps.length),
            endIndex: i + word.length,
        };
    }

    if (word.length < 2 || word !== word.toUpperCase()) return null;

    // 8.5 — look ahead (without committing yet) for more all-caps words to
    // see if this is the start of a passage (3+ such words). 8.5.2 allows a
    // single simple punctuation mark to bridge two passage words.
    const segments = [{ word, punctAfter: "" }];
    let pos = i + word.length;
    while (true) {
        const bridge = text.slice(pos).match(/^([,;:.!?]?) ([A-Za-z]+)/);
        if (!bridge) break;
        const [, punct, nextWord] = bridge;
        if (nextWord.length < 2 || nextWord !== nextWord.toUpperCase()) break;
        segments[segments.length - 1].punctAfter = punct;
        segments.push({ word: nextWord, punctAfter: "" });
        pos += bridge[0].length;
    }

    // 8.4.1 — a word indicator covers exactly one letters-sequence, so if we
    // didn't find a genuine 3+ word passage, only claim the single first word
    // here; any further all-caps word gets its own indicator on the next pass.
    if (segments.length < 3) {
        return { segments: [{ word, punctAfter: "" }], endIndex: i + word.length, isPassage: false };
    }

    // it IS a passage — also absorb punctuation glued directly to the last word
    // (e.g. the "!" in "...WET PAINT!") before the explicit terminator (8.6.1/8.6.2)
    const trailing = text.slice(pos).match(/^[,;:.!?]+/);
    if (trailing) {
        segments[segments.length - 1].punctAfter = trailing[0];
        pos += trailing[0].length;
    }

    return { segments, endIndex: pos, isPassage: true };
}

// Pushes the cap-word/cap-passage indicator tokens, the letters themselves
// (uncontracted — 8.4/8.5 words are spelled out), any bridging punctuation,
// and the terminator (for passages and partial words only) onto `sequence`.
// Shared by both tokenizers.
function pushCapitalRun(sequence, capRun) {
    if (capRun.partialWord) {
        sequence.push({ type: "cap_word", visualText: "⠠", pattern: capIndicatorPattern });
        sequence.push({ type: "cap_word", visualText: "⠠", pattern: capIndicatorPattern });
        for (const ch of capRun.letters) {
            sequence.push({ type: "char", visualText: ch, pattern: brailleAlphabet[ch.toLowerCase()] });
        }
        sequence.push({ type: "cap_terminator", visualText: "⠠⠄", pattern: capTerminator });
        for (const ch of capRun.tail) {
            sequence.push({ type: "char", visualText: ch, pattern: brailleAlphabet[ch.toLowerCase()] || brailleAlphabet[" "] });
        }
        return;
    }

    const indicatorType = capRun.isPassage ? "cap_passage" : "cap_word";
    const repeatCount = capRun.isPassage ? 3 : 2;
    for (let n = 0; n < repeatCount; n++) {
        sequence.push({ type: indicatorType, visualText: "⠠", pattern: capIndicatorPattern });
    }
    capRun.segments.forEach((seg, idx) => {
        for (const ch of seg.word) {
            sequence.push({ type: "char", visualText: ch, pattern: brailleAlphabet[ch.toLowerCase()] || brailleAlphabet[" "] });
        }
        if (seg.punctAfter) {
            sequence.push({ type: "punctuation", visualText: seg.punctAfter, pattern: brailleAlphabet[seg.punctAfter] });
        }
        if (idx < capRun.segments.length - 1) {
            sequence.push({ type: "space", visualText: " ", pattern: brailleAlphabet[" "] });
        }
    });
    if (capRun.isPassage) {
        sequence.push({ type: "cap_terminator", visualText: "⠠⠄", pattern: capTerminator });
    }
}



//------------------//
//-----TOKENIZER------
//------------------//



function tokenizeGrade2(text) {

    let forceGrade1UntilBreak = false;

    // 5.4 — grade 1 passage mode triggered by {{...}} wrapper

    const passageMatch = text.match(/^\{\{(.+)\}\}$/);
    if (passageMatch) {
        const innerText = passageMatch[1];
        const sequence = [
            { type: "g1_passage", visualText: "⠰", pattern: g1PassageIndicator },
            { type: "g1_passage", visualText: "⠰", pattern: g1PassageIndicator },
            { type: "g1_passage", visualText: "⠰", pattern: g1PassageIndicator }
        ];
        let i = 0;
        while (i < innerText.length) {
            const ch = innerText[i];
            if (ch === " ") {
                sequence.push({ type: "space", visualText: " ", pattern: brailleAlphabet[" "] });
            } else {
                if (ch === ch.toUpperCase() && /[A-Za-z]/.test(ch))
                    sequence.push({ type: "cap", visualText: "CAP", pattern: capIndicatorPattern });
                sequence.push({ type: "char", visualText: ch, pattern: brailleAlphabet[ch.toLowerCase()] || brailleAlphabet[" "] });
            }
            i++;
        }
        sequence.push({ type: "g1_terminator", visualText: "⠰", pattern: g1PassageIndicator });
        sequence.push({ type: "g1_terminator", visualText: "⠄", pattern: g1Terminator });
        return sequence;
    }

    // 6.9 — numeric passage: [[...]] sets numeric + grade1 mode until terminator
    const numPassageMatch = text.match(/^\[\[(.+)\]\]$/);
    if (numPassageMatch) {
        const innerText = numPassageMatch[1];
        const sequence = [
            { type: "num_passage", visualText: "⠼⠼", pattern: numIndicatorPattern },
            { type: "num_passage", visualText: "⠼⠼", pattern: numIndicatorPattern }
        ];
        let i = 0;
        while (i < innerText.length) {
            const ch = innerText[i];
            if (ch === " ") {
                sequence.push({ type: "space", visualText: " ", pattern: brailleAlphabet[" "] });
            } else if (/[0-9]/.test(ch)) {
                sequence.push({ type: "number", visualText: ch, pattern: brailleNumbers[ch] });
            } else if (/[A-Za-z]/.test(ch)) {
                if (ch === ch.toUpperCase())
                    sequence.push({ type: "cap", visualText: "CAP", pattern: capIndicatorPattern });
                if ('abcdefghijABCDEFGHIJ'.includes(ch)) {
                    sequence.push({ type: "g1_symbol", visualText: "⠰", pattern: g1SymbolIndicator });
                }
                sequence.push({ type: "char", visualText: ch, pattern: brailleAlphabet[ch.toLowerCase()] });
            } else {
                sequence.push({ type: "punctuation", visualText: ch, pattern: brailleAlphabet[ch] || brailleAlphabet[" "] });
            }
            i++;
        }
        sequence.push({ type: "num_terminator", visualText: "⠼⠄", pattern: numTerminatorPattern });
        return sequence;
    }

    let sequence = [], i = 0;
    let quoteOpenState = true, pendingTwoCell = false;
    while (i < text.length) {

        // 7.1.2 — only one blank cell after punctuation, even if print has more
        if (text[i] === " " && sequence.length && sequence[sequence.length - 1].type === "punctuation") {
            const spaceMatch = text.slice(i).match(/^ +/);
            sequence.push({ type: "space", visualText: " ", pattern: brailleAlphabet[" "] });
            i += spaceMatch[0].length;
            forceGrade1UntilBreak = false;
            continue;
        }

        //white space handling

        if (text[i] === " " && /[0-9]/.test(text[i - 1]) && /[0-9]/.test(text[i + 1])) {
            sequence.push({ type: "num_space", visualText: " ", pattern: [false, false, false, true, false, false] }); // dot 4 prefix
            i++; continue;
        }

        if (text[i] === " ") {
            sequence.push({ type: "space", visualText: " ", pattern: brailleAlphabet[" "] });
            i++; forceGrade1UntilBreak = false; continue;
        }

        // 7.1 — brackets: prefix + ⠣ (open) / ⠜ (close)
        if (BRACKET_PREFIXES[text[i]]) {
            const isOpen = '([{<'.includes(text[i]);
            sequence.push({ type: "punctuation", visualText: text[i], pattern: BRACKET_PREFIXES[text[i]] });
            sequence.push({ type: "punctuation", visualText: text[i], pattern: isOpen ? openBracketPattern : closeBracketPattern });
            i++; continue;
        }

        // 7.2 — em dash / en dash use ⠠⠤, distinct from hyphen ⠤
        if (text[i] === '—' || text[i] === '–') {
            sequence.push({ type: "punctuation", visualText: text[i], pattern: dashPrefixPattern });
            sequence.push({ type: "punctuation", visualText: text[i], pattern: dashPattern });
            i++; continue;
        }

        // 7.6.1 / 7.6.7 / 7.6.8 / 7.6.9 — double quotes
        if (text[i] === '"' || text[i] === '\u201C' || text[i] === '\u201D') {
            const prevIsLetter = /[a-zA-Z]/.test(text[i - 1] || "");
            const nextIsLetter = /[a-zA-Z]/.test(text[i + 1] || "");
            const standingAlone = !prevIsLetter && !nextIsLetter;
            const isOpenSemantic = text[i] === '\u201C' ? true
                : text[i] === '\u201D' ? false
                    : quoteOpenState;
            const twoCell = standingAlone || pendingTwoCell || (isOpenSemantic && prevIsLetter);

            const basePattern = isOpenSemantic ? dquoteOpenPattern : dquoteClosePattern;

            if (twoCell) {
                sequence.push({ type: "punctuation", visualText: '"', pattern: PREFIXES.dot45 });
                sequence.push({ type: "punctuation", visualText: '"', pattern: basePattern });
            } else {
                const quoteToken = { type: "punctuation", visualText: '"', pattern: basePattern };
                const lastToken = sequence[sequence.length - 1];
                if (isOpenSemantic && lastToken && (lastToken.type === "cap" || lastToken.type === "g1_symbol" || lastToken.type === "numeric_indicator")) {
                    sequence.splice(sequence.length - 1, 0, quoteToken);
                } else {
                    sequence.push(quoteToken);
                }
            }

            pendingTwoCell = isOpenSemantic ? twoCell : false;
            quoteOpenState = !isOpenSemantic;
            i++; continue;
        }

        // 7.5.2 / 7.5.3 / 7.5.4 — question mark disambiguation (shares cell with opening quote / "his")
        if (text[i] === '?') {
            const prevChar = text[i - 1];
            const prevIsLetter = /[a-zA-Z]/.test(prevChar || "");
            const nextIsLetter = /[a-zA-Z]/.test(text[i + 1] || "");
            const standingAlone = !prevIsLetter && !nextIsLetter;                      // 7.5.3
            const afterSpaceHyphenDash = prevChar === undefined || prevChar === " " || prevChar === "-" || prevChar === "—" || prevChar === "–"; // 7.5.2 / 7.5.4
            if (standingAlone || afterSpaceHyphenDash) {
                sequence.push({ type: "g1_symbol", visualText: "⠰", pattern: g1SymbolIndicator });
            }
            sequence.push({ type: "punctuation", visualText: "?", pattern: brailleAlphabet['?'] });
            i++; continue;
        }

        // 7.6.2 / 7.6.6 / 7.6.10 — single quote vs apostrophe
        if (text[i] === "'" || text[i] === '\u2018' || text[i] === '\u2019') {
            const prevIsLetter = /[a-zA-Z]/.test(text[i - 1] || "");
            const nextIsLetter = /[a-zA-Z]/.test(text[i + 1] || "");
            const midWord = prevIsLetter && nextIsLetter;
            if (midWord) {
                sequence.push({ type: "punctuation", visualText: "'", pattern: brailleAlphabet["'"] });
            } else {
                const isOpen = text[i] === '\u2018' ? true
                    : text[i] === '\u2019' ? false
                        : (i === 0 || /\s/.test(text[i - 1]));
                const standingAlone = !prevIsLetter && !nextIsLetter;
                if (standingAlone) {
                    sequence.push({ type: "g1_symbol", visualText: "⠰", pattern: g1SymbolIndicator });
                }
                sequence.push({ type: "punctuation", visualText: "'", pattern: capIndicatorPattern });
                sequence.push({ type: "punctuation", visualText: "'", pattern: isOpen ? dquoteOpenPattern : dquoteClosePattern });
            }
            i++; continue;
        }

        // 7.6.11 — double angle quotes: dot456 + ⠦/⠴
        if (text[i] === '«' || text[i] === '»') {
            const isOpen = text[i] === '«';
            sequence.push({ type: "punctuation", visualText: text[i], pattern: PREFIXES.dot456 });
            sequence.push({ type: "punctuation", visualText: text[i], pattern: isOpen ? dquoteOpenPattern : dquoteClosePattern });
            i++; continue;
        }

        // 7.2.3 — underscore (low line) for fill-in-the-blank
        if (text[i] === '_') {
            sequence.push({ type: "punctuation", visualText: "_", pattern: underscorePrefixPattern });
            sequence.push({ type: "punctuation", visualText: "_", pattern: dashPattern });
            i++; continue;
        }

        // 7.4 — solidus (forward slash), two-cell: dot456 + dots3,4
        if (text[i] === '/') {
            sequence.push({ type: "punctuation", visualText: "/", pattern: PREFIXES.dot456 });
            sequence.push({ type: "punctuation", visualText: "/", pattern: solidusPattern });
            i++; continue;
        }

        // 7.1 — reverse solidus (backslash): dot456 + dots1,6
        if (text[i] === '\\') {
            sequence.push({ type: "punctuation", visualText: "\\", pattern: PREFIXES.dot456 });
            sequence.push({ type: "punctuation", visualText: "\\", pattern: backslashPattern });
            i++; continue;
        }

        // 7.2.4 — long dash (triple hyphen used as marker for a long dash)
        if (text.slice(i, i + 3) === '---') {
            sequence.push({ type: "punctuation", visualText: "---", pattern: lineContinuationPattern });
            sequence.push({ type: "punctuation", visualText: "---", pattern: dot6OnlyPattern });
            sequence.push({ type: "punctuation", visualText: "---", pattern: dashPattern });
            i += 3; continue;
        }

        // 7.2.6 — two adjacent hyphens as dash substitute
        if (text.slice(i, i + 2) === '--') {
            sequence.push({ type: "punctuation", visualText: "--", pattern: dashPrefixPattern });
            sequence.push({ type: "punctuation", visualText: "--", pattern: dashPattern });
            i += 2; continue;
        }

        // 7.3 — ellipsis: repeat the period cell for each dot in print
        if (text[i] === '.' && text[i + 1] === '.' && text[i + 2] === '.') {
            sequence.push({ type: "punctuation", visualText: "...", pattern: brailleAlphabet['.'] });
            sequence.push({ type: "punctuation", visualText: "...", pattern: brailleAlphabet['.'] });
            sequence.push({ type: "punctuation", visualText: "...", pattern: brailleAlphabet['.'] });
            i += 3; continue;
        }


        // 5.3 — detect spelled-out words like c-a-t or u-n-t-i-d-y grade 1 word indicator
        const spellMatch = text.slice(i).match(/^([A-Za-z](-[A-Za-z])+)/);
        if (spellMatch) {
            const letters = spellMatch[0].split('-');
            sequence.push({ type: "g1_word", visualText: "⠰", pattern: g1WordIndicator });
            sequence.push({ type: "g1_word", visualText: "⠰", pattern: g1WordIndicator });
            letters.forEach((ch, idx) => {
                if (idx > 0) sequence.push({ type: "punctuation", visualText: "-", pattern: brailleAlphabet['-'] });
                if (ch === ch.toUpperCase())
                    sequence.push({ type: "cap", visualText: "CAP", pattern: capIndicatorPattern });
                sequence.push({ type: "char", visualText: ch, pattern: brailleAlphabet[ch.toLowerCase()] });
            });
            i += spellMatch[0].length;
            continue;
        }

        // 6.4.1 — full stop before number: period emitted before numeric indicator
        if (text[i] === '.' && i + 1 < text.length && /[0-9]/.test(text[i + 1])) {
            sequence.push({ type: "punctuation", visualText: ".", pattern: brailleAlphabet['.'] });
            i++; continue;
        }


        // 6.8 — spaced numeric indicator: currency symbol + space + number

        const spacedCurrencyMatch = text.slice(i).match(/^[$£€¢]\s+(?=[0-9.])/);
        if (spacedCurrencyMatch) {
            const symbol = text[i];
            const letterMap = { '$': 's', '£': 'l', '€': 'e', '¢': 'c' };;
            sequence.push({ type: "currency_prefix", visualText: symbol, pattern: currencyIndicatorPattern });
            sequence.push({ type: "currency_letter", visualText: "", pattern: brailleAlphabet[letterMap[symbol]] });
            sequence.push({ type: "num_spaced_indicator", visualText: "#", pattern: numIndicatorPattern });
            sequence.push({ type: "space", visualText: " ", pattern: brailleAlphabet[" "] });
            i += spacedCurrencyMatch[0].length;
            continue;
        }


        // 6.7 — currency prefix ($ £ €) before a number
        const currencyMatch = text.slice(i).match(/^[$£€¢]/);
        if (currencyMatch) {
            const symbol = currencyMatch[0];
            const letterMap = { '$': 's', '£': 'l', '€': 'e', '¢': 'c' };;
            sequence.push({ type: "currency_prefix", visualText: symbol, pattern: currencyIndicatorPattern });
            sequence.push({ type: "currency_letter", visualText: "", pattern: brailleAlphabet[letterMap[symbol]] });
            i += 1;
            continue;
        }

        // 3.15 — feet ′ (prime) and inches ″ (double prime)
        if (text[i] === '\u2032') { // ′ feet
            sequence.push({ type: "punctuation", visualText: "′", pattern: primePattern });
            i++; continue;
        }
        if (text[i] === '\u2033') { // ″ inches — same cell, pressed twice
            sequence.push({ type: "punctuation", visualText: "″", pattern: primePattern });
            sequence.push({ type: "punctuation", visualText: "″", pattern: primePattern });
            i++; continue;
        }

        //Number handling

        const numMatch = text.slice(i).match(/^[0-9][0-9,.]*/);
        if (numMatch) {
            sequence.push({ type: "numeric_indicator", visualText: "#", pattern: numIndicatorPattern });
            for (const char of numMatch[0]) {
                if (char === ',') {
                    sequence.push({ type: "num_comma", visualText: ",", pattern: brailleAlphabet[','] });
                } else if (char === '.') {
                    sequence.push({ type: "num_period", visualText: ".", pattern: brailleAlphabet['.'] });
                } else {
                    sequence.push({ type: "number", visualText: char, pattern: brailleNumbers[char] });
                }
            }
            i += numMatch[0].length;

            // 6.5.1/6.5.3 — grade 1 mode continues until space/hyphen/dash/terminator

            if (i < text.length && /[A-Za-z]/.test(text[i])) {
                forceGrade1UntilBreak = true;
                const nextChar = text[i].toLowerCase();
                if ('abcdefghij'.includes(nextChar)) {
                    sequence.push({ type: "g1_symbol", visualText: "⠰", pattern: g1SymbolIndicator });
                }
            }
            continue;
        }

        // 8.4 / 8.5 — fully capitalized word or passage takes priority over
        // whole-word/shortform contractions and per-letter cap indicators
        const capRun = scanCapitalRun(text, i);
        if (capRun) {
            pushCapitalRun(sequence, capRun);
            i = capRun.endIndex;
            continue;
        }

        //word handling
        const wordMatch = text.slice(i).match(/^[A-Za-z]+/);
        if (wordMatch) {

            const fullWord = wordMatch[0], lowerWord = fullWord.toLowerCase();

            // 6.5.3 — no contractions while grade 1 mode continues from a number

            if (forceGrade1UntilBreak) {
                for (const ch of fullWord) {
                    if (ch === ch.toUpperCase() && /[A-Za-z]/.test(ch))
                        sequence.push({ type: "cap", visualText: "CAP", pattern: capIndicatorPattern });
                    sequence.push({ type: "char", visualText: ch, pattern: brailleAlphabet[ch.toLowerCase()] || brailleAlphabet[" "] });
                }
                i += fullWord.length;
                forceGrade1UntilBreak = false;
                continue;
            }

            //whole word handling

            if (g2WholeWords[lowerWord]) {
                const def = g2WholeWords[lowerWord];
                if (fullWord[0] === fullWord[0].toUpperCase())
                    sequence.push({ type: "cap", visualText: "CAP", pattern: capIndicatorPattern });
                if (def.prefix) sequence.push({ type: "prefix", visualText: "[PRE]", pattern: def.prefix });
                sequence.push({ type: "contraction", visualText: fullWord, pattern: def.pattern });
                i += fullWord.length; continue;
            }

            //short form handling

            if (shortforms[lowerWord]) {
                const abbr = shortforms[lowerWord];
                if (fullWord[0] === fullWord[0].toUpperCase())
                    sequence.push({ type: "cap", visualText: "CAP", pattern: capIndicatorPattern });
                abbr.split('').forEach((ch, idx) => {
                    sequence.push({
                        type: "shortform",
                        visualText: idx === 0 ? fullWord : "",
                        abbrLetter: ch,
                        isLastAbbr: idx === abbr.length - 1,
                        fullWord: idx === abbr.length - 1 ? fullWord : null,
                        pattern: brailleAlphabet[ch.toLowerCase()]
                    });
                });
                i += fullWord.length; continue;
            }

            //part word and letter handling

            let wordIdx = 0;
            while (wordIdx < fullWord.length) {
                const sub = fullWord.slice(wordIdx);
                const isAtStart = wordIdx === 0;
                let matched = false;

                //part word handling

                for (const part of g2PartWords) {
                    if (!sub.toLowerCase().startsWith(part.text)) continue;
                    const isAtEnd = wordIdx + part.text.length === fullWord.length;
                    if (part.pos === "start" && !isAtStart) continue;
                    if (part.pos === "mid" && (isAtStart || isAtEnd)) continue;
                    if (sub[0] === sub[0].toUpperCase())
                        sequence.push({ type: "cap", visualText: "CAP", pattern: capIndicatorPattern });
                    if (part.prefix) sequence.push({ type: "prefix", visualText: "[PRE]", pattern: part.prefix });
                    sequence.push({ type: "contraction", visualText: sub.slice(0, part.text.length), pattern: part.pattern });
                    wordIdx += part.text.length; matched = true; break;
                }

                //letter handling

                if (!matched) {
                    const ch = sub[0];
                    const lowerCh = ch.toLowerCase();
                    const isAlone = fullWord.length === 1;
                    // 10.1.2 — a letter immediately after an apostrophe (it'd, can't,
                    // you'll) is a contraction suffix, never a standalone wordsign,
                    // so it never needs a grade-1 disambiguation indicator here
                    const precededByApostrophe = wordIdx === 0 && text[i - 1] === "'";
                    const chBits = brailleAlphabet[lowerCh];
                    const matchesWordsign = isAlone && !precededByApostrophe && chBits && ch === ch.toLowerCase() && Object.values(g2WholeWords).some(def =>
                        !def.prefix && patMatch(def.pattern, chBits)
                    );

                    // 5.7.1 — standalone letter that matches a wordsign needs grade 1 indicator
                    if (matchesWordsign) {
                        sequence.push({ type: "g1_symbol", visualText: "⠰", pattern: g1SymbolIndicator });
                    }

                    if (ch === ch.toUpperCase())
                        sequence.push({ type: "cap", visualText: "CAP", pattern: capIndicatorPattern });
                    sequence.push({ type: "char", visualText: ch, pattern: chBits || brailleAlphabet[" "] });
                    wordIdx++;
                }
            }
            i += fullWord.length;

        }

        //punctuation handling

        else {
            const ch = text[i];
            sequence.push({ type: "punctuation", visualText: ch, pattern: brailleAlphabet[ch] || brailleAlphabet[" "] });
            i++;
        }
    }
    return sequence;
}





function tokenizeGrade1(text) {

    // 6.9 — numeric passage: [[...]] sets numeric mode until terminator
    const numPassageMatch = text.match(/^\[\[(.+)\]\]$/);
    if (numPassageMatch) {
        const innerText = numPassageMatch[1];
        const sequence = [
            { type: "num_passage", visualText: "⠼⠼", pattern: numIndicatorPattern },
            { type: "num_passage", visualText: "⠼⠼", pattern: numIndicatorPattern }
        ];
        let i = 0;
        while (i < innerText.length) {
            const ch = innerText[i];
            if (ch === " ") {
                sequence.push({ type: "space", visualText: " ", pattern: brailleAlphabet[" "] });
            } else if (/[0-9]/.test(ch)) {
                sequence.push({ type: "number", visualText: ch, pattern: brailleNumbers[ch] });
            } else if (/[A-Za-z]/.test(ch)) {
                if (ch === ch.toUpperCase())
                    sequence.push({ type: "cap", visualText: "CAP", pattern: capIndicatorPattern });
                sequence.push({ type: "char", visualText: ch, pattern: brailleAlphabet[ch.toLowerCase()] });
            } else {
                sequence.push({ type: "punctuation", visualText: ch, pattern: brailleAlphabet[ch] || brailleAlphabet[" "] });
            }
            i++;
        }
        sequence.push({ type: "num_terminator", visualText: "⠼⠄", pattern: numTerminatorPattern });
        return sequence;
    }

    let sequence = [], i = 0;
    let quoteOpenState = true, pendingTwoCell = false;
    while (i < text.length) {

        // 7.1.2 — only one blank cell after punctuation, even if print has more
        if (text[i] === " " && sequence.length && sequence[sequence.length - 1].type === "punctuation") {
            const spaceMatch = text.slice(i).match(/^ +/);
            sequence.push({ type: "space", visualText: " ", pattern: brailleAlphabet[" "] });
            i += spaceMatch[0].length;
            continue;
        }

        //white space handling

        if (text[i] === " " && /[0-9]/.test(text[i - 1]) && /[0-9]/.test(text[i + 1])) {
            sequence.push({ type: "num_space", visualText: " ", pattern: [false, false, false, true, false, false] }); // dot 4 prefix
            i++; continue;
        }

        if (text[i] === " ") {
            sequence.push({ type: "space", visualText: " ", pattern: brailleAlphabet[" "] });
            i++; continue;
        }

        // 7.1 — brackets: prefix + ⠣ (open) / ⠜ (close)
        if (BRACKET_PREFIXES[text[i]]) {
            const isOpen = '([{<'.includes(text[i]);
            sequence.push({ type: "punctuation", visualText: text[i], pattern: BRACKET_PREFIXES[text[i]] });
            sequence.push({ type: "punctuation", visualText: text[i], pattern: isOpen ? openBracketPattern : closeBracketPattern });
            i++; continue;
        }

        // 7.2 em dash

        if (text[i] === '—' || text[i] === '–') {
            sequence.push({ type: "punctuation", visualText: text[i], pattern: dashPrefixPattern });
            sequence.push({ type: "punctuation", visualText: text[i], pattern: dashPattern });
            i++; continue;
        }

        // 7.6.1 / 7.6.7 / 7.6.8 / 7.6.9 — double quotes
        if (text[i] === '"' || text[i] === '\u201C' || text[i] === '\u201D') {
            const prevIsLetter = /[a-zA-Z]/.test(text[i - 1] || "");
            const nextIsLetter = /[a-zA-Z]/.test(text[i + 1] || "");
            const standingAlone = !prevIsLetter && !nextIsLetter;
            // curly quotes are explicitly directional — trust that over the toggle;
            // only the direction-less straight " needs the toggle heuristic
            const isOpenSemantic = text[i] === '\u201C' ? true
                : text[i] === '\u201D' ? false
                    : quoteOpenState;
            const twoCell = standingAlone || pendingTwoCell || (isOpenSemantic && prevIsLetter);

            const basePattern = isOpenSemantic ? dquoteOpenPattern : dquoteClosePattern;

            if (twoCell) {
                sequence.push({ type: "punctuation", visualText: '"', pattern: PREFIXES.dot45 });
                sequence.push({ type: "punctuation", visualText: '"', pattern: basePattern });
            } else {
                const quoteToken = { type: "punctuation", visualText: '"', pattern: basePattern };
                const lastToken = sequence[sequence.length - 1];
                if (isOpenSemantic && lastToken && (lastToken.type === "cap" || lastToken.type === "g1_symbol" || lastToken.type === "numeric_indicator")) {
                    sequence.splice(sequence.length - 1, 0, quoteToken);
                } else {
                    sequence.push(quoteToken);
                }
            }

            pendingTwoCell = isOpenSemantic ? twoCell : false;
            quoteOpenState = !isOpenSemantic;
            i++; continue;
        }
        // 7.5.2 / 7.5.3 / 7.5.4 — question mark disambiguation (shares cell with opening quote / "his")
        if (text[i] === '?') {
            const prevChar = text[i - 1];
            const prevIsLetter = /[a-zA-Z]/.test(prevChar || "");
            const nextIsLetter = /[a-zA-Z]/.test(text[i + 1] || "");
            const standingAlone = !prevIsLetter && !nextIsLetter;                      // 7.5.3
            const afterSpaceHyphenDash = prevChar === undefined || prevChar === " " || prevChar === "-" || prevChar === "—" || prevChar === "–"; // 7.5.2 / 7.5.4
            if (standingAlone || afterSpaceHyphenDash) {
                sequence.push({ type: "g1_symbol", visualText: "⠰", pattern: g1SymbolIndicator });
            }
            sequence.push({ type: "punctuation", visualText: "?", pattern: brailleAlphabet['?'] });
            i++; continue;
        }

        // 7.6.2 / 7.6.6 / 7.6.10 — single quote vs apostrophe
        if (text[i] === "'" || text[i] === '\u2018' || text[i] === '\u2019') {
            const prevIsLetter = /[a-zA-Z]/.test(text[i - 1] || "");
            const nextIsLetter = /[a-zA-Z]/.test(text[i + 1] || "");
            const midWord = prevIsLetter && nextIsLetter;
            if (midWord) {
                sequence.push({ type: "punctuation", visualText: "'", pattern: brailleAlphabet["'"] });
            } else {
                const isOpen = text[i] === '\u2018' ? true
                    : text[i] === '\u2019' ? false
                        : (i === 0 || /\s/.test(text[i - 1]));
                const standingAlone = !prevIsLetter && !nextIsLetter;
                if (standingAlone) {
                    sequence.push({ type: "g1_symbol", visualText: "⠰", pattern: g1SymbolIndicator });
                }
                sequence.push({ type: "punctuation", visualText: "'", pattern: capIndicatorPattern });
                sequence.push({ type: "punctuation", visualText: "'", pattern: isOpen ? dquoteOpenPattern : dquoteClosePattern });
            }
            i++; continue;
        }

        // 7.6.11 — double angle quotes: dot456 + ⠦/⠴
        if (text[i] === '«' || text[i] === '»') {
            const isOpen = text[i] === '«';
            sequence.push({ type: "punctuation", visualText: text[i], pattern: PREFIXES.dot456 });
            sequence.push({ type: "punctuation", visualText: text[i], pattern: isOpen ? dquoteOpenPattern : dquoteClosePattern });
            i++; continue;
        }

        // 7.2.3 — underscore (low line) for fill-in-the-blank
        if (text[i] === '_') {
            sequence.push({ type: "punctuation", visualText: "_", pattern: underscorePrefixPattern });
            sequence.push({ type: "punctuation", visualText: "_", pattern: dashPattern });
            i++; continue;
        }

        // 7.4 — solidus (forward slash), two-cell: dot456 + dots3,4
        if (text[i] === '/') {
            sequence.push({ type: "punctuation", visualText: "/", pattern: PREFIXES.dot456 });
            sequence.push({ type: "punctuation", visualText: "/", pattern: solidusPattern });
            i++; continue;
        }

        // 7.1 — reverse solidus (backslash): dot456 + dots1,6
        if (text[i] === '\\') {
            sequence.push({ type: "punctuation", visualText: "\\", pattern: PREFIXES.dot456 });
            sequence.push({ type: "punctuation", visualText: "\\", pattern: backslashPattern });
            i++; continue;
        }

        // 7.2.4 — long dash (triple hyphen used as marker for a long dash)
        if (text.slice(i, i + 3) === '---') {
            sequence.push({ type: "punctuation", visualText: "---", pattern: lineContinuationPattern });
            sequence.push({ type: "punctuation", visualText: "---", pattern: dot6OnlyPattern });
            sequence.push({ type: "punctuation", visualText: "---", pattern: dashPattern });
            i += 3; continue;
        }

        // 7.2.6 — two adjacent hyphens as dash substitute
        if (text.slice(i, i + 2) === '--') {
            sequence.push({ type: "punctuation", visualText: "--", pattern: dashPrefixPattern });
            sequence.push({ type: "punctuation", visualText: "--", pattern: dashPattern });
            i += 2; continue;
        }

        // 7.3 — ellipsis: repeat the period cell for each dot in print
        if (text[i] === '.' && text[i + 1] === '.' && text[i + 2] === '.') {
            sequence.push({ type: "punctuation", visualText: "...", pattern: brailleAlphabet['.'] });
            sequence.push({ type: "punctuation", visualText: "...", pattern: brailleAlphabet['.'] });
            sequence.push({ type: "punctuation", visualText: "...", pattern: brailleAlphabet['.'] });
            i += 3; continue;
        }


        // 6.4.1 — full stop before number: period emitted before numeric indicator
        if (text[i] === '.' && i + 1 < text.length && /[0-9]/.test(text[i + 1])) {
            sequence.push({ type: "punctuation", visualText: ".", pattern: brailleAlphabet['.'] });
            i++; continue;
        }

        // 6.8 — spaced numeric indicator: currency symbol + space + number
        const spacedCurrencyMatch = text.slice(i).match(/^[$£€¢]\s+(?=[0-9.])/);
        if (spacedCurrencyMatch) {
            const symbol = text[i];
            const letterMap = { '$': 's', '£': 'l', '€': 'e', '¢': 'c' };;
            sequence.push({ type: "currency_prefix", visualText: symbol, pattern: currencyIndicatorPattern });
            sequence.push({ type: "currency_letter", visualText: "", pattern: brailleAlphabet[letterMap[symbol]] });
            sequence.push({ type: "num_spaced_indicator", visualText: "#", pattern: numIndicatorPattern });
            sequence.push({ type: "space", visualText: " ", pattern: brailleAlphabet[" "] });
            i += spacedCurrencyMatch[0].length;
            continue;
        }

        // 6.7 — currency prefix ($ £ €) before a number
        const currencyMatch = text.slice(i).match(/^[$£€¢]/);
        if (currencyMatch) {
            const symbol = currencyMatch[0];
            const letterMap = { '$': 's', '£': 'l', '€': 'e', '¢': 'c' };;
            sequence.push({ type: "currency_prefix", visualText: symbol, pattern: currencyIndicatorPattern });
            sequence.push({ type: "currency_letter", visualText: "", pattern: brailleAlphabet[letterMap[symbol]] });
            i += 1;
            continue;
        }

        // 3.15 — feet ′ (prime) and inches ″ (double prime)
        if (text[i] === '\u2032') { // ′ feet
            sequence.push({ type: "punctuation", visualText: "′", pattern: primePattern });
            i++; continue;
        }
        if (text[i] === '\u2033') { // ″ inches — same cell, pressed twice
            sequence.push({ type: "punctuation", visualText: "″", pattern: primePattern });
            sequence.push({ type: "punctuation", visualText: "″", pattern: primePattern });
            i++; continue;
        }

        //number handling

        const numMatch = text.slice(i).match(/^[0-9][0-9,.]*/);
        if (numMatch) {
            sequence.push({ type: "numeric_indicator", visualText: "#", pattern: numIndicatorPattern });
            for (const char of numMatch[0]) {
                if (char === ',') sequence.push({ type: "num_comma", visualText: ",", pattern: brailleAlphabet[','] });
                else if (char === '.') sequence.push({ type: "num_period", visualText: ".", pattern: brailleAlphabet['.'] });
                else sequence.push({ type: "number", visualText: char, pattern: brailleNumbers[char] });
            }
            i += numMatch[0].length;

            // 6.5.2 — g1 indicator required before a-j following digit/period/comma
            if (i < text.length) {
                const nextChar = text[i].toLowerCase();
                if ('abcdefghij'.includes(nextChar)) {
                    sequence.push({ type: "g1_symbol", visualText: "⠰", pattern: g1SymbolIndicator });
                }
            }
            continue;
        }


        // 8.4 / 8.5 — fully capitalized word or passage takes priority over
        // the per-letter cap indicator below
        const capRun = scanCapitalRun(text, i);
        if (capRun) {
            pushCapitalRun(sequence, capRun);
            i = capRun.endIndex;
            continue;
        }

        //letter handling

        const wordMatch = text.slice(i).match(/^[A-Za-z]+/);
        if (wordMatch) {
            const fullWord = wordMatch[0];
            for (const ch of fullWord) {
                if (ch !== ch.toLowerCase())
                    sequence.push({ type: "cap", visualText: "CAP", pattern: capIndicatorPattern });
                sequence.push({ type: "char", visualText: ch, pattern: brailleAlphabet[ch.toLowerCase()] || brailleAlphabet[" "] });
            }
            i += fullWord.length; continue;
        }

        //punctuation handling

        else {
            const ch = text[i];
            sequence.push({ type: "punctuation", visualText: ch, pattern: brailleAlphabet[ch] || brailleAlphabet[" "] });
            i++;
        }
    }
    return sequence;
}



//------------------------//
//-----REFERENCE SHEET------
//------------------------//

function generateCheatSheetDOM() {
    const container = document.getElementById('cheat-grid-container');
    container.innerHTML = "";

    function createSection(title) {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = title;
        const grid = document.createElement('div');
        grid.className = 'cheat-grid';
        details.appendChild(summary);
        details.appendChild(grid);
        container.appendChild(details);
        return grid;
    }

    const lettersGrid = createSection("Letters");
    const numbersGrid = createSection("Numbers");
    const punctuationGrid = createSection("Punctuation");

    let wholeWordsGrid, partWordsGrid, prefixesGrid;
    if (brailleGrade === 2) {
        wholeWordsGrid = createSection("Whole Words");
        partWordsGrid = createSection("Part Words");
        prefixesGrid = createSection("Prefixes & Indicators");
    } else {
        prefixesGrid = createSection("Indicators");
    }

    const addCheatItem = (target, label, pattern, prefixPattern = null) => {
        if (!Array.isArray(pattern)) return;
        const item = document.createElement('div');
        item.className = 'cheat-item';
        const span = document.createElement('span');
        span.className = 'cheat-char';
        span.textContent = label;
        item.appendChild(span);
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '4px';
        const makeCell = (pat, extraClass = '') => {
            const cell = document.createElement('div');
            cell.className = `mini-braille-cell${extraClass}`;
            [0, 3, 1, 4, 2, 5].forEach(i => {
                const d = document.createElement('div');
                d.className = 'mini-dot' + (pat[i] ? ' filled' : '');
                cell.appendChild(d);
            });
            return cell;
        };
        if (prefixPattern) wrapper.appendChild(makeCell(prefixPattern, ' prefix-cell'));
        wrapper.appendChild(makeCell(pattern));
        item.appendChild(wrapper);
        target.appendChild(item);
    };

    const addMultiCellItem = (target, label, patterns) => {
        const item = document.createElement('div');
        item.className = 'cheat-item';
        const span = document.createElement('span');
        span.className = 'cheat-char';
        span.textContent = label;
        item.appendChild(span);
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '8px';
        patterns.forEach(pat => {
            const cell = document.createElement('div');
            cell.className = 'mini-braille-cell';
            [0, 3, 1, 4, 2, 5].forEach(i => {
                const d = document.createElement('div');
                d.className = 'mini-dot' + (pat[i] ? ' filled' : '');
                cell.appendChild(d);
            });
            wrapper.appendChild(cell);
        });
        item.appendChild(wrapper);
        target.appendChild(item);
    };

    // Indicators — always shown

    addCheatItem(prefixesGrid, "CAP", capIndicatorPattern);
    addMultiCellItem(prefixesGrid, "CAP Word", [capIndicatorPattern, capIndicatorPattern]);
    addMultiCellItem(prefixesGrid, "CAP Passage", [capIndicatorPattern, capIndicatorPattern, capIndicatorPattern]);
    addMultiCellItem(prefixesGrid, "CAP Term", [capIndicatorPattern, capTerminator]);
    addCheatItem(prefixesGrid, "NUM", numIndicatorPattern);
    addCheatItem(prefixesGrid, "NUM Term", numTerminatorPattern);
    addCheatItem(prefixesGrid, "G1 Symbol", g1SymbolIndicator);
    addMultiCellItem(prefixesGrid, "NUM Passage", [numIndicatorPattern, numIndicatorPattern]);
    addMultiCellItem(prefixesGrid, "G1 Word", [g1WordIndicator, g1WordIndicator]);
    addMultiCellItem(prefixesGrid, "G1 Passage", [g1PassageIndicator, g1PassageIndicator, g1PassageIndicator]);
    addMultiCellItem(prefixesGrid, "G1 Term", [g1PassageIndicator, g1Terminator]);

    // currency indicators
    addMultiCellItem(prefixesGrid, "$", [currencyIndicatorPattern, brailleAlphabet['s']]);
    addMultiCellItem(prefixesGrid, "£", [currencyIndicatorPattern, brailleAlphabet['l']]);
    addMultiCellItem(prefixesGrid, "€", [currencyIndicatorPattern, brailleAlphabet['e']]);
    addMultiCellItem(prefixesGrid, "$ Spaced", [currencyIndicatorPattern, brailleAlphabet['s'], numIndicatorPattern]);

    //Prefixes

    if (brailleGrade === 2) {
        Object.entries(PREFIXES).forEach(([k, v]) =>
            addCheatItem(prefixesGrid, k.toUpperCase(), v)
        );
    }

    // Numbers — always shown

    "1234567890".split("").forEach(n =>
        addCheatItem(numbersGrid, n, brailleNumbers[n])
    );

    // Punctuation — always shown

    Object.entries(brailleAlphabet)
        .filter(([l]) => [",", ";", ":", "'", ".", "!", "?"].includes(l))
        .forEach(([l, b]) => addCheatItem(punctuationGrid, l, b));

    // Section 7: dash, underscore, long dash
    addMultiCellItem(punctuationGrid, "— (dash)", [dashPrefixPattern, dashPattern]);
    addMultiCellItem(punctuationGrid, "--- (long dash)", [lineContinuationPattern, dot6OnlyPattern, dashPattern]);
    addMultiCellItem(punctuationGrid, "_ (underscore)", [underscorePrefixPattern, dashPattern]);

    // Section 7: ellipsis
    addMultiCellItem(punctuationGrid, "...", [brailleAlphabet['.'], brailleAlphabet['.'], brailleAlphabet['.']]);

    // Section 7: solidus
    addMultiCellItem(punctuationGrid, "/", [PREFIXES.dot456, solidusPattern]);

    // Section 7: quotation marks & apostrophe
    addCheatItem(punctuationGrid, '" open (2-cell)', dquoteOpenPattern, PREFIXES.dot45);
    addCheatItem(punctuationGrid, '" close (2-cell)', dquoteClosePattern, PREFIXES.dot45);
    addCheatItem(punctuationGrid, '" open', dquoteOpenPattern);
    addCheatItem(punctuationGrid, '" close', dquoteClosePattern);
    addCheatItem(punctuationGrid, "' open", dquoteOpenPattern, capIndicatorPattern);
    addCheatItem(punctuationGrid, "' close", dquoteClosePattern, capIndicatorPattern);
    addCheatItem(punctuationGrid, "« open", dquoteOpenPattern, PREFIXES.dot456);
    addCheatItem(punctuationGrid, "» close", dquoteClosePattern, PREFIXES.dot456);

    // Section 7 / 7.7: brackets
    Object.entries(BRACKET_PREFIXES).forEach(([bracket, prefix]) => {
        const isOpen = '([{<'.includes(bracket);
        addCheatItem(punctuationGrid, bracket, isOpen ? openBracketPattern : closeBracketPattern, prefix);
    });

    // Letters — always shown

    Object.entries(brailleAlphabet)
        .filter(([l]) => /^[a-z]$/i.test(l))
        .forEach(([l, b]) => addCheatItem(lettersGrid, l.toUpperCase(), b));

    //Whole word

    if (brailleGrade === 2) {
        Object.entries(g2WholeWords).forEach(([w, def]) =>
            def?.pattern && addCheatItem(wholeWordsGrid, w, def.pattern, def.prefix || null)
        );

        g2PartWords.forEach(p =>
            p?.pattern && addCheatItem(partWordsGrid, p.text, p.pattern, p.prefix || null)
        );
    }

    //Short form

    if (brailleGrade === 2) {
        const shortformsGrid = createSection("Shortforms");
        Object.entries(shortforms).forEach(([word, abbr]) => {
            const item = document.createElement('div');
            item.className = 'cheat-item';
            const span = document.createElement('span');
            span.className = 'cheat-char';
            span.textContent = word;
            const abbrSpan = document.createElement('span');
            abbrSpan.style.cssText = 'font-size:0.85rem; color:#C05800; font-weight:bold;';
            abbrSpan.textContent = abbr;
            item.appendChild(span);
            item.appendChild(abbrSpan);
            shortformsGrid.appendChild(item);
        });
    }
}

//-------------------//
//-----COMBO UI--------
//-------------------//

function updateComboUI() {
    // multiplier thresholds: x2 at 3, x3 at 6, x4 at 10
    const thresholds = [3, 6, 10];
    const prevThreshold = multiplier === 4 ? 10 : multiplier === 3 ? 6 : multiplier === 2 ? 3 : 0;
    const nextThreshold = multiplier === 4 ? 10 : multiplier === 3 ? 10 : multiplier === 2 ? 6 : 3;

    const streakInTier = streak - prevThreshold;
    const tierSize = nextThreshold - prevThreshold;
    const pct = multiplier >= 4 ? 100 : Math.min((streakInTier / tierSize) * 100, 100);

    const fill = document.getElementById('combo-bar-fill');
    const label = document.getElementById('combo-bar-label');
    const multEl = document.getElementById('multiplier-ui');

    fill.style.width = pct + '%';
    fill.className = `combo-bar-fill x${multiplier}`;

    if (streak === 0) {
        label.textContent = 'streak 0';
        label.style.color = '#aaa';
    } else if (multiplier >= 4) {
        label.textContent = `🔥 MAX ${multiplier}x`;
        label.style.color = '#f2c200';
    } else {
        label.textContent = `🔥 ${streak} streak — ${nextThreshold - streak} to ${multiplier + 1}x`;
        label.style.color = '#C05800';
    }

    multEl.textContent = `${multiplier}x`;
    const active = gameMode === 'timed' && multiplier > 1;
    multEl.style.color = active ? "#C05800" : "#646669";
    multEl.style.background = active ? "rgba(192,88,0,0.12)" : "transparent";
}

function pulseCombo() {
    const el = document.getElementById('multiplier-ui');
    el.classList.remove('combo-pulse');
    void el.offsetWidth;
    el.classList.add('combo-pulse');
}

//---------------------------------------//
//---Level, mode, grade select functions---
//---------------------------------------//

function showLevelUp() {
    const popup = document.getElementById("levelup-popup");
    const stage = LEVELS[currentStageLevel];
    popup.textContent = `LEVEL ${currentStageLevel}: ${stage.name.toUpperCase()}!`;
    popup.classList.remove("show");
    void popup.offsetWidth;
    popup.classList.add("show");
}

function selectModeAndNext(mode) {
    gameMode = mode;
    if (mode === 'practice') {
        startGame();
    } else {
        showScreen('screen-level');
        buildLevelCards();
    }
}

function selectGradeAndNext(g) {
    brailleGrade = g;
    generateCheatSheetDOM();
    document.getElementById('select-mode-title').textContent = `Select Mode for Grade ${g}`;
    showScreen('screen-mode');
}

function goToNextLevel() {
    const next = currentStageLevel + 1;
    if (next <= MAX_LEVEL && unlockedLevels.has(next)) {
        currentStageLevel = next;
        startGame();
    }
}

function goToLevelSelect() {
    document.getElementById('menu-screen').style.display = 'block';
    showScreen('screen-level');
    buildLevelCards();
}

function replayLevel() {
    startGame();
}

function showScreen(id) {
    ['screen-main', 'screen-mode', 'screen-level', 'screen-grade', 'end-game-stats'].forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = 'none';
    });
    document.getElementById('menu-screen').style.display = 'block';
    document.getElementById(id).style.display = 'block';
}

function maxLevelForGrade() {
    return brailleGrade === 1 ? 3 : MAX_LEVEL;
}

function buildLevelCards() {
    const container = document.getElementById('level-cards-container');
    container.innerHTML = '';
    const cap = maxLevelForGrade();
    Object.entries(LEVELS).forEach(([num, data]) => {
        const n = parseInt(num);
        if (n > cap) return; // grade 1 never sees levels 4/5
        const locked = !unlockedLevels.has(n)
        const card = document.createElement('div');
        card.className = 'level-card' + (locked ? ' locked' : '');
        card.innerHTML = `
            <div class="level-num">${n}</div>
            <div class="level-info-text">
                <div class="level-info-title">${data.name}</div>
                <div class="level-info-desc">${data.description}</div>
            </div>
            <div class="level-badge">${locked ? '🔒' : '▶'}</div>
        `;
        if (!locked) card.onclick = () => selectLevel(n);
        container.appendChild(card);
    });
}

function selectLevel(n) {
    currentStageLevel = n;
    startGame();
}

function startCountdown(callback) {

    // clear any previous countdown

    countdownTimeouts.forEach(t => clearTimeout(t));
    countdownTimeouts = [];

    // remove leftover overlay too

    const existing = document.getElementById('countdown-overlay');
    if (existing) existing.remove();


    const overlay = document.createElement('div');
    overlay.id = 'countdown-overlay';
    overlay.style.cssText = `
        position:absolute; top:0; left:0; right:0; bottom:0;
        display:flex; align-items:center; justify-content:center;
        background:${document.body.classList.contains('night') ? '#6d6d6c' : 'rgba(253,251,212,0.92)'}; z-index:100;
        border-radius:15px;
    `;
    const num = document.createElement('div');
    num.id = 'countdown-num';
    num.style.cssText = `
    font-size:6rem; font-weight:bold; color:${document.body.classList.contains('night') ? '#e5e3e0' : '#38240D'};
    font-family:monospace;
    `;
    overlay.appendChild(num);
    document.getElementById('game-screen').appendChild(overlay);

    const steps = ['3', '2', '1', 'GO!'];
    let i = 0;

    function tick() {
        if (!isPlaying) return;
        num.textContent = steps[i];
        num.style.animation = 'none';
        void num.offsetWidth;
        num.style.animation = 'countPop 0.8s ease forwards';
        i++;
        if (i < steps.length) {
            countdownTimeouts.push(setTimeout(tick, 800));
        } else {
            countdownTimeouts.push(setTimeout(() => {    //track it
                overlay.remove();
                if (isPlaying) callback();  //only fire if still playing
            }, 600));
        }
    }
    tick();
}

//--------------------------//
//---Hint enable functions---
//--------------------------//

function toggleDotHints() {
    dotHintsEnabled = !dotHintsEnabled;
    const btn = document.getElementById('dot-hint-btn');
    btn.textContent = dotHintsEnabled ? 'ON' : 'OFF';
    btn.style.background = dotHintsEnabled ? '#C05800' : '#646669';
}

function toggleKeyHints() {
    keyHintsEnabled = !keyHintsEnabled;
    const btn = document.getElementById('key-hint-btn');
    btn.textContent = keyHintsEnabled ? 'ON' : 'OFF';
    btn.style.background = keyHintsEnabled ? '#C05800' : '#646669';
}

//-------------------//
//---Pause functions---
//-------------------//


function togglePause() {
    if (!isPlaying) return;
    isPaused = !isPaused;

    if (isPaused) {
        clearInterval(timerInterval);
        stopNoteLoop();
        showPauseOverlay();
    } else {
        hidePauseOverlay();
        if (gameMode === 'timed') {
            timerInterval = setInterval(() => {
                document.getElementById('timer').textContent = --timeLeft + "s";
                if (timeLeft <= 0) endGame();
            }, 1000);
        }
        if (gameMode === 'timed') spawnNextNote();
    }
}

function showPauseOverlay() {
    let overlay = document.getElementById('pause-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'pause-overlay';
        overlay.style.cssText = `
            position:fixed; top:0; left:0; right:0; bottom:0;
            background:rgba(56,36,13,0.92); z-index:200;
            display:flex; flex-direction:column; align-items:center; justify-content:center;
            gap:18px; color:white;
        `;
        overlay.innerHTML = `
    <div style="font-size:2.5rem; font-weight:bold;">PAUSED</div>

    <div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start;">

        <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.3rem;">Music: </span>
            <button onclick="toggleMusic()" id="pause-music-btn"
                style="background:none; border:none; cursor:pointer; font-size:1.3rem; color:white;"
                title="Play/Pause music">⏸</button>
            <input type="range" id="pause-volume-slider" min="0" max="1" step="0.05"
                value="${masterVolume}" style="width:140px;">
            <select id="pause-song-select" style="font-size:0.85rem; padding:4px;"></select>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.3rem;">Note speed: </span>
            <input type="range" id="pause-speed-slider" min="0.0001" max="0.001" step="0.0001"
                value="${noteSpeed}" style="width:140px;" title="Note Speed">
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.3rem;">Difficulty: </span>
            <select id="pause-difficulty-select" style="font-size:0.85rem; padding:4px;">
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
            </select>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.3rem;">Voice Volume: </span>
            <input type="range" id="pause-voice-slider" min="0" max="1" step="0.05"
                value="${voiceVolume}" style="width:140px;" title="Voice Volume">
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.3rem;">Dot hints: </span>
            <button onclick="toggleDotHints()" id="dot-hint-btn"
                style="background:#646669; border:none; cursor:pointer;
                color:white; padding:4px 12px; border-radius:6px; font-size:0.85rem;">
                OFF
            </button>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.3rem;">Key hints: </span>
            <button onclick="toggleKeyHints()" id="key-hint-btn"
                style="background:#C05800; border:none; cursor:pointer;
                color:white; padding:4px 12px; border-radius:6px; font-size:0.85rem;">
                ON
            </button>
        </div>

    </div>

    <div style="display:flex; gap:12px; margin-top:10px;">
        <button class="btn" onclick="togglePause()">resume</button>
        <button class="btn" style="background:#ca4754;" onclick="exitFromPause()">exit</button>
    </div>
`;
        document.body.appendChild(overlay);
        buildSongDropdowns();

        //--- EVENT LISTENERS ---

        document.getElementById('pause-volume-slider').addEventListener('input', (e) => {
            setVolume(e.target.value);
            document.getElementById('volume-slider').value = e.target.value;
        });

        document.getElementById('pause-song-select').addEventListener('change', (e) => {
            document.getElementById('song-select').value = e.target.value;
            selectSong(e.target.value);
        });

        document.getElementById('pause-speed-slider').addEventListener('input', (e) => {
            noteSpeed = parseFloat(e.target.value);
        });

        document.getElementById('pause-voice-slider').addEventListener('input', (e) => {
            voiceVolume = parseFloat(e.target.value);
        });

        document.getElementById('pause-difficulty-select').addEventListener('change', (e) => {
            gameDifficulty = e.target.value;
            const diffSettings = {
                easy: { speed: 0.0002, time: 90, penaltyTime: 0, penaltyScore: 2 },
                normal: { speed: 0.0004, time: 60, penaltyTime: 1, penaltyScore: 5 },
                hard: { speed: 0.0007, time: 45, penaltyTime: 3, penaltyScore: 10 }
            };
            const s = diffSettings[gameDifficulty];
            noteSpeed = s.speed;
            timeLeft = s.time;
            missPenaltyTime = s.penaltyTime;
            missPenaltyScore = s.penaltyScore;
            document.getElementById('pause-speed-slider').value = noteSpeed;
            document.getElementById('timer').textContent = timeLeft + 's';
        });
    }

    //--- SYNC STATE ---

    document.getElementById('pause-volume-slider').value = masterVolume;
    document.getElementById('pause-song-select').value = document.getElementById('song-select').value;
    document.getElementById('pause-music-btn').textContent = musicOn ? '⏸' : '▶';
    document.getElementById('dot-hint-btn').textContent = dotHintsEnabled ? 'ON' : 'OFF';
    document.getElementById('dot-hint-btn').style.background = dotHintsEnabled ? '#C05800' : '#646669';
    document.getElementById('key-hint-btn').textContent = keyHintsEnabled ? 'ON' : 'OFF';
    document.getElementById('key-hint-btn').style.background = keyHintsEnabled ? '#C05800' : '#646669';
    overlay.style.display = 'flex';
}

function exitFromPause() {
    hidePauseOverlay();
    isPaused = false;
    endGame();
}

function hidePauseOverlay() {
    const overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.style.display = 'none';
}

//---------------------------------------//
//----------Extra BUTTON function----------
//---------------------------------------//

function toggleControlsOverlay() {
    const el = document.getElementById('controls-overlay');
    el.style.display = el.style.display === 'flex' ? 'none' : 'flex';
}

function toggleHowToPlayOverlay() {
    const el = document.getElementById('howtoplay-overlay');
    el.style.display = el.style.display === 'flex' ? 'none' : 'flex';
}

function toggleNightMode() {
    document.body.classList.toggle('night');
    const btn = document.getElementById('night-mode-btn');
    btn.textContent = document.body.classList.contains('night') ? 'light' : 'dark';
}

//-----------------------------//
//-----START GAME function------
//-----------------------------//

async function startGame() {

    //--- RESET STATE ---

    if (isPlaying) return;
    isPlaying = true;
    currentIndex = 0; score = 0; streak = 0; multiplier = 1;
    perfectCount = 0; goodCount = 0; missCount = 0;
    maxMultiplierAchieved = 1; freeWriteText = "";
    practiceBufferTokens = [];
    practiceCharCount = 0;
    dotHintsEnabled = gameDifficulty === 'easy';
    keyHintsEnabled = true;
    practiceWordPool = [];

    //--- DIFFICULTY SETUP ---

    if (gameDifficulty === 'easy') timeLeft = 60;
    else if (gameDifficulty === 'hard') timeLeft = 30;
    else timeLeft = 45;

    const isTimed = gameMode === "timed";

    //--- SHOW GAME SCREEN ---

    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('stats-container').style.display = 'flex';
    document.getElementById('combo-bar-wrapper').style.display = 'block';

    //--- MODE SPECIFIC UI ---

    document.getElementById('timer').textContent = isTimed ? timeLeft + "s" : "infinite ♾️";
    document.getElementById('braille-cheat-sheet').style.display = isTimed ? 'none' : 'block';
    document.getElementById('practice-word-prompt').style.display = isTimed ? 'none' : 'block';

    const exitBtn = document.getElementById('practice-exit-btn');
    if (exitBtn) exitBtn.style.display = isTimed ? 'none' : 'block';

    const hw = document.getElementById('note-highway-wrapper');
    if (hw) hw.style.display = isTimed ? 'block' : 'none';

    const practiceKeyDisplay = document.getElementById('practice-key-display');
    if (practiceKeyDisplay) practiceKeyDisplay.style.display = isTimed ? 'none' : 'flex';

    const displayContainer = document.getElementById('words-container');
    displayContainer.classList.toggle('free-write', !isTimed);

    //--- RESET CONTROLS ---

    resetChord();
    stopNoteLoop();
    clearInterval(timerInterval);
    updateMultiplierUI();
    document.getElementById('score').textContent = score;

    //--- TIMED MODE ---

    if (isTimed) {
        const response = await fetch(`sentence/level${currentStageLevel}/level${currentStageLevel}_${gameDifficulty}.txt?v=${Date.now()}`);
        const text = await response.text();
        sentencePool = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
        sentencePoolIndex = 0;
        targetSentence = sentencePool[sentencePoolIndex];
        targetBrailleSequence = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(targetSentence);

        buildSentenceHTML();
        updateTargetClue();

        const fn = document.getElementById('falling-note');
        if (fn) fn.innerHTML = '';
        const bgLetter = document.getElementById('bg-letter');
        if (bgLetter) bgLetter.textContent = '';

        speakCharacter(targetSentence, () => {
            startCountdown(() => {
                clearInterval(timerInterval);
                if (!musicOn) {
                    const pick = parseInt(document.getElementById('song-select').value) || 2;
                    selectSong(pick);
                }
                spawnNextNote();
                clearInterval(timerInterval);
                timerInterval = setInterval(() => {
                    document.getElementById('timer').textContent = --timeLeft + "s";
                    if (timeLeft <= 0) endGame();
                }, 1000);
            });
        });

        //--- PRACTICE MODE ---

    } else {
        inputLocked = false;
        pickPracticeWord();
        renderFreeWriteContent();
    }
}

function buildSentenceHTML() {
    const container = document.getElementById('words-container');
    container.innerHTML = "";

    // Group tokens into words (split at spaces)
    let wordGroup = [];
    const flushWord = () => {
        if (!wordGroup.length) return;
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.whiteSpace = 'nowrap';
        wordGroup.forEach(({ token, idx }) => {
            const span = document.createElement('span');
            span.textContent = (gameMode === "timed" && ["cap", "prefix", "cap_word", "cap_passage", "cap_terminator", "g1_symbol", "g1_word", "g1_passage", "g1_terminator"].includes(token.type))
                ? ""
                : token.visualText;
            span.className = "char" + (idx === currentIndex ? " current" : "");
            span.id = `token-${idx}`;
            wordSpan.appendChild(span);
        });
        container.appendChild(wordSpan);
        wordGroup = [];
    };


    targetBrailleSequence.forEach((token, idx) => {
        if (token.type === "space") {
            flushWord();
            // Space as its own inline-block so it can wrap
            const span = document.createElement('span');
            span.textContent = " ";
            span.className = "char" + (idx === currentIndex ? " current" : "");
            span.id = `token-${idx}`;
            span.style.display = 'inline-block';
            container.appendChild(span);
        } else {
            wordGroup.push({ token, idx });
        }
    });
    flushWord();
}

//--------------------------------//
//-----Practice mode function------
//--------------------------------//

function flashPracticeWordCorrect() {
    const el = document.getElementById('practice-word-target');
    if (!el) return;
    el.classList.remove('practice-word-correct');
    void el.offsetWidth; // restart animation
    el.classList.add('practice-word-correct');
}

async function pickPracticeWord() {
    if (!practiceWordPool.length) {
        const file = brailleGrade === 1 ? 'words/practice_g1.txt' : 'words/practice_g2.txt';
        const response = await fetch(file + '?v=' + Date.now());
        const text = await response.text();
        practiceWordPool = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    }
    let word;
    do {
        word = practiceWordPool[Math.floor(Math.random() * practiceWordPool.length)];
    } while (word === currentPracticeWord && practiceWordPool.length > 1);
    currentPracticeWord = word;
    console.log(currentPracticeWord);
    console.log((brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord));
    const el = document.getElementById('practice-word-target');
    if (el) {
        el.innerHTML = '';
        const tokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(word);
        tokens.forEach((token, idx) => {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'display:inline-flex; flex-direction:column; align-items:center; margin:0 6px; vertical-align:middle;';

            if (token.type === 'space') {
                const cell = document.createElement('div');
                cell.style.cssText = 'display:inline-grid; grid-template-columns:repeat(2,14px); gap:4px; width:32px; height:32px;';
                el.appendChild(wrapper);
                wrapper.appendChild(cell);
                const label = document.createElement('div');
                label.style.cssText = 'font-size:9px; color:#888; margin-top:3px; text-align:center;';
                label.textContent = 'SPACE';
                wrapper.appendChild(label);
                return;
            }

            const cell = document.createElement('div');
            cell.style.cssText = 'display:inline-grid; grid-template-columns:repeat(2,14px); gap:4px;';
            [0, 3, 1, 4, 2, 5].forEach(i => {
                const d = document.createElement('div');
                d.style.cssText = `width:14px;height:14px;border-radius:50%;background:${token.pattern?.[i] ? '#C05800' : '#e0d5c5'};`;
                cell.appendChild(d);
            });
            wrapper.appendChild(cell);

            // context-aware label for dot56
            if (token.type === 'prefix' && token.val === 'dot56') {
                const nextToken = tokens[idx + 1];
                const isDot56Contraction = nextToken && g2PartWords.some(p =>
                    p.prefix && patMatch(p.prefix, PREFIXES.dot56) && patMatch(p.pattern, nextToken.pattern)
                );
                if (!isDot56Contraction) {
                    const label = document.createElement('div');
                    label.style.cssText = 'font-size:9px; color:#888; margin-top:3px; text-align:center;';
                    label.textContent = '×2';
                    wrapper.appendChild(label);
                }
            }

            el.appendChild(wrapper);
        });
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function renderFreeWriteContent() {
    const labelMap = {
        cap: "[CAP]",
        cap_word: "[CAP-WORD]",
        cap_passage: "[CAP-PASSAGE]",
        cap_terminator: "[CAP-TERM]",
        g1_symbol: "[G1]",
        g1_word: "[G1-WORD]",
        g1_passage: "[G1-PASSAGE]",
        g1_terminator: "[G1-TERM]"
    };

    let bufStr = "";
    let i = 0;
    while (i < practiceBufferTokens.length) {
        const t = practiceBufferTokens[i];
        if (t.type === "prefix") {
            bufStr += `[${t.val.toUpperCase()}]`;
            i++; continue;
        }
        if (labelMap[t.type]) {
            let j = i;
            while (j < practiceBufferTokens.length && practiceBufferTokens[j].type === t.type) j++;
            bufStr += labelMap[t.type];
            i = j;
            continue;
        }
        bufStr += t.val;
        i++;
    }

    const bufSpan = bufStr ? `<span style="color:#5c99f5;border-bottom:2px dashed #5c99f5">${escapeHtml(bufStr)}</span>` : "";
    const container = document.getElementById('words-container');
    container.innerHTML = freeWriteText + bufSpan + '<span class="cursor-blink"></span>';
    container.scrollTop = container.scrollHeight;
}

//----------------------------------------//
//--------HINT animation function----------
//----------------------------------------//

function animateHint() {
    if (hintAnimated) return;
    hintAnimated = true;

    const card = document.getElementById("hint-card");
    card.classList.remove("show-horizontal");

    const dots = document.querySelectorAll(".clue-dot");
    dots.forEach(d => d.style.transition = "none");

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            dots.forEach(d => d.style.transition = "");
            setTimeout(() => {
                card.classList.add("show-horizontal");
            }, 300);
        });
    });
}

function updateTargetClue() {
    if (gameMode !== "timed") return;
}

//-----------------------------//
//-----SOUND EFFECT function-----
//-----------------------------//

let speakTimeout = null;

function playTone(type) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'correct') {
        osc.frequency.setValueAtTime(523, audioCtx.currentTime);       // C5
        osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.08); // E5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start(); osc.stop(audioCtx.currentTime + 0.25);
    } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start(); osc.stop(audioCtx.currentTime + 0.2);
    }
}

//-----------------------------//
//-----SPEAK LETTER function-----
//-----------------------------//

function speakCharacter(phrase, onend) {
    if (phrase === "error") { playTone('error'); return; }

    clearTimeout(speakTimeout);
    window.speechSynthesis.cancel();

    let text = phrase === " " ? "space" : phrase;
    if (text.length === 1) text = text + ".";

    speakTimeout = setTimeout(() => {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.1;
        u.volume = voiceVolume;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.name.includes("Google US English"))
            || voices.find(v => v.lang === "en-US");
        if (preferred) u.voice = preferred;
        if (onend) u.onend = onend;
        window.speechSynthesis.speak(u);
    }, 80);
}

function updateMultiplierUI() {
    const el = document.getElementById('multiplier-ui');
    el.textContent = `${multiplier}x`;
    const active = gameMode === 'timed' && multiplier > 1;
    el.style.color = active ? "#5c99f5" : "#646669";
    el.style.background = active ? "rgba(92,153,245,0.1)" : "transparent";
}

//-----------------------------//
//-----INPUT HANDLING------------
//-----------------------------//

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isPlaying) {
        e.preventDefault();
        togglePause();
        return;
    }
    if (!isPlaying || isPaused) return;
    if (!isPlaying) return;
    if (e.key === 'Backspace' && gameMode === 'practice') {
        e.preventDefault();
        if (practiceBufferTokens.length > 0) {
            practiceBufferTokens.pop();
            lastChord = null;
            renderFreeWriteContent();
            speakCharacter("remove");
        } else if (freeWriteText.length > 0) {
            freeWriteText = freeWriteText.slice(0, -1);
            lastChord = null;
            renderFreeWriteContent();
            speakCharacter("backspace");
        }
        return;
    }
    if (e.key === 'Enter' && gameMode === 'practice') {
        e.preventDefault();

        const raw = practiceBufferTokens
            .map(t => t.val)
            .join("");

        if (raw) {
            freeWriteText += raw;
            speakCharacter(raw);
        }

        practiceBufferTokens = [];
        lastChord = null;
        renderFreeWriteContent();
        return;
    }
    if (e.code === 'Space') {
        e.preventDefault();
        if (inputLocked) return;
        if (gameMode === "practice") {

            const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
            const nextExpected = targetTokens[practiceBufferTokens.length];

            if (nextExpected && nextExpected.type === "space") {
                // mid-phrase space — insert it, don't submit yet
                practiceBufferTokens.push({ type: "space", val: " " });
                lastChord = null;
                renderFreeWriteContent();
                speakCharacter(" ");
                return;
            }


            inputLocked = false;
            console.log("BUFFER:", JSON.stringify(practiceBufferTokens));
            const decoded = decodePracticeBuffer();
            console.log("DECODED:", JSON.stringify(decoded));
            lastChord = null;
            let isCorrect = false;
            if (decoded) {
                speakCharacter(decoded);
                const normalizeQuotes = s => s
                    .replace(/[\u2018\u2019]/g, "'")
                    .replace(/[\u201C\u201D]/g, '"');
                const stripPassageWrapper = s => {
                    const m = s.match(/^\{\{(.+)\}\}$/);
                    return m ? m[1] : s;
                };
                console.log("COMPARE:", JSON.stringify(normalizeQuotes(decoded.toLowerCase())), "VS", JSON.stringify(normalizeQuotes(stripPassageWrapper(currentPracticeWord).toLowerCase())));
                isCorrect = normalizeQuotes(decoded.toLowerCase()) === normalizeQuotes(stripPassageWrapper(currentPracticeWord).toLowerCase());
                if (isCorrect) flashPracticeWordCorrect();
            }

            practiceBufferTokens = [];
            if (isCorrect) {
                practiceCharCount += decoded.length;
                freeWriteText = `<span style="color:#48bb78; font-weight:bold;">${escapeHtml(decoded)}</span>`;
                renderFreeWriteContent();
                setTimeout(() => {
                    freeWriteText = '';
                    renderFreeWriteContent();
                    pickPracticeWord();
                }, 800);
            } else {
                freeWriteText = `<span style="color:#ffffff;">${escapeHtml(decoded)}</span>`
                renderFreeWriteContent();
                setTimeout(() => {
                    freeWriteText = '';
                    renderFreeWriteContent();
                }, 800);
            }
        }
        else {
            if (gameMode === 'timed') {
                const token = targetBrailleSequence[currentIndex];
                resolveNote(token && token.type === 'space', false);
            }
        }
        return;
    }
    const idx = keyMap[e.key.toLowerCase()];
    if (idx !== undefined) {
        e.preventDefault();
        currentKeysPressed[idx] = keysHitInChord[idx] = true;
        updateVisualCell();
    }
});

window.addEventListener('keyup', (e) => {
    if (!isPlaying) return;
    const idx = keyMap[e.key.toLowerCase()];
    if (idx !== undefined) {
        currentKeysPressed[idx] = false;
        if (currentKeysPressed.every(v => !v))
            if (!inputLocked)
                handleChordRelease(keysHitInChord);
            else resetChord();
        else updateVisualCell();
    }
});

function handleChordRelease(chord) {
    if (inputLocked) return;

    //--------------------------------------------------//
    //---------------- GRADE 1 PRACTICE -----------------//
    //--------------------------------------------------//

    if (gameMode === "practice" && brailleGrade === 1) {
        let token = null;
        const chordKey = chord.join('');
        const isDoubleTap = lastChord === chordKey;

        thirdLastChord = secondLastChord;
        secondLastChord = lastChord;
        lastChord = chordKey;

        // ── cap indicator: cap vs -- (dash) vs ' (single-quote prefix) ──
        if (patMatch(chord, capIndicatorPattern)) {
            const targetTokens = tokenizeGrade1(currentPracticeWord);
            const nextExpected = targetTokens[practiceBufferTokens.length];

            if (nextExpected && nextExpected.type === "punctuation" &&
                (nextExpected.val === "--" || nextExpected.visualText === "--" ||
                    nextExpected.visualText === "—" || nextExpected.visualText === "–")) {
                token = { type: "punctuation", val: "--" };
            } else if (nextExpected && nextExpected.type === "punctuation" &&
                nextExpected.visualText === "'" && nextExpected.pattern === capIndicatorPattern) {
                token = { type: "punctuation", val: "'" };
            } else if (nextExpected && nextExpected.type === "cap_word") {
                token = { type: "cap_word", val: "CAP-WORD" };
            } else if (nextExpected && nextExpected.type === "cap_passage") {
                token = { type: "cap_passage", val: "CAP-PASS" };
            } else {
                token = { type: "cap", val: "CAP" };
            }

            // ── capitals terminator (8.6): closes a capitalized passage ──
        } else if (patMatch(chord, capTerminator) && (() => {
            for (let k = practiceBufferTokens.length - 1; k >= 0; k--) {
                const t = practiceBufferTokens[k].type;
                if (t === "cap_word" || t === "cap_passage") return true;
                if (t === "cap_terminator") return false;
            }
            return false;
        })()) {
            token = { type: "cap_terminator", val: "CAP-TERM" };

            // ── numeric indicator / numeric passage ──
        } else if (patMatch(chord, numIndicatorPattern)) {
            if (isDoubleTap) {
                practiceBufferTokens.pop();
                token = { type: "num_passage", val: "NUM-PASS" };
            } else {
                token = { type: "numeric_indicator", val: "#" };
            }

            // ── grade 1 symbol indicator ──
        } else if (patMatch(chord, g1SymbolIndicator)) {
            token = { type: "g1_symbol", val: "G1-SYMBOL" };

            // ── dot46: underscore vs [ ] bracket ──
        } else if (patMatch(chord, PREFIXES.dot46)) {
            const targetTokens = tokenizeGrade1(currentPracticeWord);
            const nextExpected = targetTokens[practiceBufferTokens.length];

            token = (nextExpected && nextExpected.type === 'punctuation' && '[]'.includes(nextExpected.visualText))
                ? { type: "punctuation", val: nextExpected.visualText }
                : { type: "punctuation", val: "_" };

            // ── dot456: solidus prefix vs { } bracket vs generic prefix ──
        } else if (chordKey === PREFIXES.dot456.join('')) {
            const targetTokens = tokenizeGrade1(currentPracticeWord);
            const nextExpected = targetTokens[practiceBufferTokens.length];

            if (nextExpected && nextExpected.type === 'punctuation' && nextExpected.visualText === '/') {
                token = { type: "punctuation", val: "/" };
            } else if (nextExpected && nextExpected.type === 'punctuation' && '{}'.includes(nextExpected.visualText)) {
                token = { type: "punctuation", val: nextExpected.visualText };
            } else if (nextExpected && nextExpected.type === 'punctuation' && '«»'.includes(nextExpected.visualText)) {
                token = { type: "punctuation", val: nextExpected.visualText };
            } else if (nextExpected && nextExpected.type === 'punctuation' && nextExpected.visualText === '\\') {
                token = { type: "punctuation", val: "\\" };
            } else {
                token = { type: "prefix", val: "dot456" };
            }

            // ── solidus second cell (or 'j' letter) ──
        } else if (patMatch(chord, solidusPattern)) {
            const lastToken = practiceBufferTokens[practiceBufferTokens.length - 1];
            token = (lastToken && lastToken.type === "punctuation" && lastToken.val === "/")
                ? { type: "punctuation", val: "/" }
                : { type: "char", val: "j" };

            // ── dot45: two-cell quote prefix vs generic prefix ──
        } else if (chordKey === PREFIXES.dot45.join('')) {
            const targetTokens = tokenizeGrade1(currentPracticeWord);
            const nextExpected = targetTokens[practiceBufferTokens.length];

            token = (nextExpected && nextExpected.type === 'punctuation' && nextExpected.visualText === '"')
                ? { type: "punctuation", val: '"' }
                : { type: "prefix", val: "dot45" };

            // ── dot5: ( ) bracket prefix ──
        } else if (chordKey === PREFIXES.dot5.join('')) {
            const targetTokens = tokenizeGrade1(currentPracticeWord);
            const nextExpected = targetTokens[practiceBufferTokens.length];

            if (nextExpected && nextExpected.type === 'punctuation' && '()'.includes(nextExpected.visualText)) {
                token = { type: "punctuation", val: nextExpected.visualText };
            }

            // ── dot4: < > bracket prefix ──
        } else if (chordKey === PREFIXES.dot4.join('')) {
            const targetTokens = tokenizeGrade1(currentPracticeWord);
            const nextExpected = targetTokens[practiceBufferTokens.length];

            if (nextExpected && nextExpected.type === 'punctuation' && '<>'.includes(nextExpected.visualText)) {
                token = { type: "punctuation", val: nextExpected.visualText };
            }

            // ── bracket second cell: ⠣ (open) / ⠜ (close) ──
        } else if (patMatch(chord, openBracketPattern) || patMatch(chord, closeBracketPattern)) {
            const lastToken = practiceBufferTokens[practiceBufferTokens.length - 1];
            if (lastToken && lastToken.type === "punctuation" && '()[]{}<>'.includes(lastToken.val)) {
                token = { type: "punctuation", val: lastToken.val };
            }

            // ── dash / underscore / double-dash second cell ──
        } else if (patMatch(chord, brailleAlphabet['-'])) {
            const lastToken = practiceBufferTokens[practiceBufferTokens.length - 1];
            if (lastToken && lastToken.type === "punctuation" && lastToken.val === "_") {
                token = { type: "punctuation", val: "_" };
            } else if (lastToken && lastToken.type === "punctuation" && lastToken.val === "--") {
                token = { type: "punctuation", val: "--" };
            } else {
                token = { type: "punctuation", val: "-" };
            }

            // ── quote base cell: ? vs " vs ' ──
        } else if (patMatch(chord, dquoteOpenPattern) || patMatch(chord, dquoteClosePattern)) {
            const targetTokens = tokenizeGrade1(currentPracticeWord);
            const nextExpected = targetTokens[practiceBufferTokens.length];
            const lastToken = practiceBufferTokens[practiceBufferTokens.length - 1];

            if (nextExpected && nextExpected.type === "punctuation" && nextExpected.visualText === "?") {
                token = { type: "punctuation", val: "?" };
            } else if (lastToken && lastToken.type === "punctuation" && '«»'.includes(lastToken.val)) {
                token = { type: "punctuation", val: lastToken.val };
            } else {
                token = (lastToken && lastToken.type === "punctuation" && lastToken.val === "'")
                    ? { type: "punctuation", val: "'" }
                    : { type: "punctuation", val: '"' };
            }

            // ── plain alphabet fallback ──
        } else {
            for (const [letter, bits] of Object.entries(brailleAlphabet)) {
                if (letter === " ") continue;
                if (patMatch(chord, bits)) { token = { type: "char", val: letter }; break; }
            }
        }

        if (token) {
            practiceBufferTokens.push(token);
            renderFreeWriteContent();
            speakCharacter(token.val);
        } else {
            speakCharacter("error");
        }
        resetChord();
        return;
    }

    //--------------------------------------------------//
    //---------------- GRADE 2 PRACTICE -----------------//
    //--------------------------------------------------//

    if (gameMode === "practice") {
        const chordKey = chord.join('');
        const isDoubleTap = lastChord === chordKey;
        const isTripleTap = lastChord === chordKey && secondLastChord === chordKey;

        thirdLastChord = secondLastChord;
        secondLastChord = lastChord;
        lastChord = chordKey;

        const dot56Key = PREFIXES.dot56.join('');
        const dot46Key = PREFIXES.dot46.join('');
        const dot456Key = PREFIXES.dot456.join('');
        const dot45Key = PREFIXES.dot45.join('');
        const dot5Key = PREFIXES.dot5.join('');
        const dot4Key = PREFIXES.dot4.join('');
        const punctuationChars = ["'"];

        // --- MODE DETECTION (liblouis-style state machine) ---
        const inNumericMode = practiceBufferTokens.length > 0 &&
            practiceBufferTokens.some(t => t.type === "numeric_indicator" || t.type === "num_passage") &&
            !practiceBufferTokens.some(t => t.type === "space" || t.val === "-");

        let token = null;

        // ══════════════════ NUMERIC MODE ══════════════════
        // Only digits, comma, period, and g1 indicator are valid

        if (inNumericMode) {
            if (patMatch(chord, numIndicatorPattern)) {
                const lastTok = practiceBufferTokens[practiceBufferTokens.length - 1];
                const afterPrime = lastTok && lastTok.type === "punctuation" && (lastTok.val === "′" || lastTok.val === "″");
                if (afterPrime) {
                    token = { type: "numeric_indicator", val: "#" };
                } else if (isDoubleTap) {
                    practiceBufferTokens.pop();
                    token = { type: "num_passage", val: "NUM-PASS" };
                } else {
                    token = { type: "num_terminator", val: "NUM-TERM" };
                }

            } else if (patMatch(chord, brailleAlphabet[','])) {
                token = { type: "num_comma", val: "," };

            } else if (patMatch(chord, brailleAlphabet['.'])) {
                token = { type: "num_period", val: "." };

            } else if (patMatch(chord, brailleAlphabet['-'])) {
                token = { type: "punctuation", val: "-" };

            } else if (patMatch(chord, brailleAlphabet[' '])) {
                token = { type: "space", val: " " };

            } else if (chordKey === dot56Key) {
                token = { type: "g1_symbol", val: "G1-SYMBOL" };

            } else if (chordKey === dot456Key) {
                token = { type: "punctuation", val: "/" };

            } else if (patMatch(chord, solidusPattern)) {
                const lastToken = practiceBufferTokens[practiceBufferTokens.length - 1];
                token = (lastToken && lastToken.type === "punctuation" && lastToken.val === "/")
                    ? { type: "punctuation", val: "/" }
                    : { type: "char", val: "j" };

            } else if (patMatch(chord, primePattern)) {
                const lastToken = practiceBufferTokens[practiceBufferTokens.length - 1];
                if (lastToken && lastToken.type === "punctuation" && lastToken.val === "′") {
                    practiceBufferTokens.pop();
                    token = { type: "punctuation", val: "″" };
                } else {
                    token = { type: "punctuation", val: "′" };
                }

            } else if (patMatch(chord, currencyIndicatorPattern)) {
                token = { type: "currency_prefix", val: "CURRENCY" };

            } else {
                for (const [letter, bits] of Object.entries(brailleAlphabet)) {
                    if (letter === " ") continue;
                    if (patMatch(chord, bits)) { token = { type: "char", val: letter }; break; }
                }
            }
        }

        //--------------------------------------------------//
        // ══════════════════ NORMAL MODE ══════════════════
        //--------------------------------------------------//

        if (!inNumericMode) {

            // 1. Structural indicators
            const match = INDICATOR_TOKENS.find(([pat]) => patMatch(chord, pat));
            token = match ? { ...match[1] } : null;

            // guard: cap_terminator (dot3) only valid if a cap_word/cap_passage is open;
            // otherwise null it out so it falls through to g1_terminator/apostrophe logic
            if (token?.type === "cap_terminator") {
                let capOpen = false;
                for (let k = practiceBufferTokens.length - 1; k >= 0; k--) {
                    const t = practiceBufferTokens[k].type;
                    if (t === "cap_word" || t === "cap_passage") { capOpen = true; break; }
                    if (t === "cap_terminator") break;
                }
                if (!capOpen) token = null;
            }

            // 1a. dot6 alone: cap vs -- (dash) vs ' (single-quote prefix)
            if (token?.type === "cap") {
                const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                const nextExpected = targetTokens[practiceBufferTokens.length];

                if (nextExpected && nextExpected.type === "punctuation" &&
                    (nextExpected.visualText === "--" || nextExpected.visualText === "—" || nextExpected.visualText === "–")) {
                    token = { type: "punctuation", val: "--" };
                } else if (nextExpected && nextExpected.type === "punctuation" &&
                    nextExpected.visualText === "'" && nextExpected.pattern === capIndicatorPattern) {
                    token = { type: "punctuation", val: "'" };
                } else if (nextExpected && nextExpected.type === "cap_word") {
                    token = { type: "cap_word", val: "CAP-WORD" };
                } else if (nextExpected && nextExpected.type === "cap_passage") {
                    token = { type: "cap_passage", val: "CAP-PASS" };
                }
            }

            // 1b. Numeric indicator double tap = passage
            if (token?.type === "numeric_indicator" && isDoubleTap) {
                practiceBufferTokens.pop();
                token = { type: "num_passage", val: "NUM-PASS" };
            }

            // 1c. dot56 — g1_symbol / g1_word / g1_passage / generic prefix
            if (chordKey === dot56Key) {
                const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                const nextExpected = targetTokens[practiceBufferTokens.length];
                if (nextExpected && nextExpected.type === 'g1_symbol') {
                    token = { type: "g1_symbol", val: "G1-SYMBOL" };
                } else if (nextExpected && nextExpected.type === 'g1_word') {
                    token = { type: "g1_word", val: "G1-WORD" };
                } else if (nextExpected && nextExpected.type === 'g1_passage') {
                    token = { type: "g1_passage", val: "G1-PASSAGE" };
                } else if (nextExpected && nextExpected.type === 'g1_terminator') {
                    token = { type: "g1_terminator", val: "G1-TERM" };
                } else {
                    token = { type: "prefix", val: "dot56" };
                }
            }

            // 1d. dot46 — underscore vs [ ] bracket vs generic prefix
            if (chordKey === dot46Key) {
                const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                const nextExpected = targetTokens[practiceBufferTokens.length];

                if (nextExpected && nextExpected.type === 'punctuation' && nextExpected.visualText === '_') {
                    token = { type: "punctuation", val: "_" };
                } else if (nextExpected && nextExpected.type === 'punctuation' && '[]'.includes(nextExpected.visualText)) {
                    token = { type: "punctuation", val: nextExpected.visualText };
                } else {
                    token = { type: "prefix", val: "dot46" };
                }
            }

            // 1e. dot5 — ( ) bracket prefix vs day/ever-style prefix
            if (chordKey === dot5Key) {
                const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                const nextExpected = targetTokens[practiceBufferTokens.length];

                if (nextExpected && nextExpected.type === 'punctuation' && '()'.includes(nextExpected.visualText)) {
                    token = { type: "punctuation", val: nextExpected.visualText };
                }
            }

            // 1f. dot4 — < > bracket prefix vs currency prefix
            if (chordKey === dot4Key) {
                const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                const nextExpected = targetTokens[practiceBufferTokens.length];

                if (nextExpected && nextExpected.type === 'punctuation' && '<>'.includes(nextExpected.visualText)) {
                    token = { type: "punctuation", val: nextExpected.visualText };
                }
            }

            // dot456 — solidus prefix vs { } bracket vs generic prefix
            if (chordKey === dot456Key) {
                const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                const nextExpected = targetTokens[practiceBufferTokens.length];
                if (nextExpected && nextExpected.type === 'punctuation' && nextExpected.visualText === '/') {
                    token = { type: "punctuation", val: "/" };
                } else if (nextExpected && nextExpected.type === 'punctuation' && '{}'.includes(nextExpected.visualText)) {
                    token = { type: "punctuation", val: nextExpected.visualText };
                } else if (nextExpected && nextExpected.type === 'punctuation' && '«»'.includes(nextExpected.visualText)) {
                    token = { type: "punctuation", val: nextExpected.visualText };
                } else if (nextExpected && nextExpected.type === 'punctuation' && nextExpected.visualText === '\\') {
                    token = { type: "punctuation", val: "\\" };
                }
                // else: leave token as whatever INDICATOR_TOKENS assigned (generic dot456 prefix)
            }

            // 1h. solidus second cell (or 'j' letter)
            if (!token && patMatch(chord, solidusPattern)) {
                const lastToken = practiceBufferTokens[practiceBufferTokens.length - 1];
                if (lastToken && lastToken.type === "punctuation" && lastToken.val === "/") {
                    token = { type: "punctuation", val: "/" };
                }
            }

            // backslash second cell — ⠡ (dots 1,6)
            if (!token && patMatch(chord, backslashPattern)) {
                const lastToken = practiceBufferTokens[practiceBufferTokens.length - 1];
                if (lastToken && lastToken.type === "punctuation" && lastToken.val === "\\") {
                    token = { type: "punctuation", val: "\\" };
                }
            }

            // 1i. dot45 — two-cell quote prefix
            if (chordKey === dot45Key) {
                const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                const nextExpected = targetTokens[practiceBufferTokens.length];

                if (nextExpected && nextExpected.type === 'punctuation' && nextExpected.visualText === '"') {
                    token = { type: "punctuation", val: '"' };
                }
            }

            // 1j. underscore / double-dash second cell
            if (!token && patMatch(chord, brailleAlphabet['-'])) {
                const lastToken = practiceBufferTokens[practiceBufferTokens.length - 1];
                if (lastToken && lastToken.type === "punctuation" && lastToken.val === "_") {
                    token = { type: "punctuation", val: "_" };
                } else if (lastToken && lastToken.type === "punctuation" && lastToken.val === "--") {
                    token = { type: "punctuation", val: "--" };
                }
            }

            // 1k. quote base cell: ? vs " vs '
            if (!token && (patMatch(chord, dquoteOpenPattern) || patMatch(chord, dquoteClosePattern))) {
                const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                const nextExpected = targetTokens[practiceBufferTokens.length];
                const lastToken = practiceBufferTokens[practiceBufferTokens.length - 1];

                if (nextExpected && nextExpected.type === "punctuation" && nextExpected.visualText === "?") {
                    token = { type: "punctuation", val: "?" };
                } else if (lastToken && lastToken.type === "punctuation" && '«»'.includes(lastToken.val)) {
                    token = { type: "punctuation", val: lastToken.val };
                } else if (nextExpected && nextExpected.type === "contraction" && nextExpected.visualText === "his") {
                    token = { type: "char", val: "his" };
                } else if (nextExpected && nextExpected.type === "contraction" && nextExpected.visualText === "was") {
                    token = { type: "char", val: "was" };
                } else {
                    token = (lastToken && lastToken.type === "punctuation" && lastToken.val === "'")
                        ? { type: "punctuation", val: "'" }
                        : { type: "punctuation", val: '"' };
                }
            }

            // 1l. bracket second cell: ⠣ (open) / ⠜ (close)
            if (!token && (patMatch(chord, openBracketPattern) || patMatch(chord, closeBracketPattern))) {
                const lastToken = practiceBufferTokens[practiceBufferTokens.length - 1];
                if (lastToken && lastToken.type === "punctuation" && '()[]{}<>'.includes(lastToken.val)) {
                    token = { type: "punctuation", val: lastToken.val };
                }
            }

            // 1m. G1 terminator — apostrophe after dot56 / plain punctuation fallback
            if (!token) {
                const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                const nextExpected = targetTokens[practiceBufferTokens.length];
                if (patMatch(chord, brailleAlphabet["'"]) && nextExpected && nextExpected.type === 'g1_terminator') {
                    token = { type: "g1_terminator", val: "G1-TERM" };
                } else {
                    for (const p of punctuationChars) {
                        if (patMatch(chord, brailleAlphabet[p])) { token = { type: "punctuation", val: p }; break; }
                    }
                }
            }

            // 1n. prefix + whole-word/part-word resolution (day/ever/there/these/cannot/tion/ness/etc.)
            if (!token) {
                const lastToken = practiceBufferTokens[practiceBufferTokens.length - 1];
                if (lastToken && lastToken.type === "prefix") {
                    const prefixPattern = PREFIXES[lastToken.val];
                    if (prefixPattern) {
                        for (const [word, def] of Object.entries(g2WholeWords)) {
                            if (def.prefix && patMatch(prefixPattern, def.prefix) && patMatch(chord, def.pattern)) {
                                token = { type: "char", val: word };
                                break;
                            }
                        }
                        if (!token) {
                            for (const part of g2PartWords) {
                                if (part.prefix && patMatch(prefixPattern, part.prefix) && patMatch(chord, part.pattern)) {
                                    token = { type: "char", val: part.text };
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            // 1o. lone sign words (ch/sh/th/wh/ou/st) — same chord as the
            // ordinary letter-group contraction, but must resolve to the
            // whole word (child/shall/this/which/out/still) when the target
            // confirms this cell stands alone. Runs before step 2 since that
            // step's g2PartWords lookup would otherwise always claim the
            // chord first as the plain fragment (liblouis: word-boundary
            // gated, not just cell match).
            if (!token) {
                const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                const nextExpected = targetTokens[practiceBufferTokens.length];
                if (nextExpected && nextExpected.type === 'contraction') {
                    for (const [fragment, word] of Object.entries(LONE_SIGN_WORDS)) {
                        const part = g2PartWords.find(p => p.text === fragment);
                        if (part && patMatch(chord, part.pattern) && nextExpected.visualText === word) {
                            token = { type: "char", val: word };
                            break;
                        }
                    }
                }
            }

            // 1p. con / cc / colon — same chord (dots 2,5), context resolves which
            if (!token) {
                const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                const nextExpected = targetTokens[practiceBufferTokens.length];
                if (patMatch(chord, brailleAlphabet[':'])) {
                    if (nextExpected && nextExpected.type === 'contraction' && nextExpected.visualText === 'con') {
                        token = { type: "char", val: "con" };
                    } else if (nextExpected && nextExpected.type === 'contraction' && nextExpected.visualText === 'cc') {
                        token = { type: "char", val: "cc" };
                    } else {
                        token = { type: "punctuation", val: ":" };
                    }
                }
            }

            // 2. Part-of-word contractions (no prefix, non-conflicted)
            if (!token) {
                const conflictMap = { ',': 'ea', '.': 'dis', '!': 'ff' };
                const conflictedTexts = new Set([...Object.values(conflictMap), 'bb', 'be', 'en']);

                for (const part of g2PartWords) {
                    if (part.prefix) continue;
                    if (!patMatch(chord, part.pattern)) continue;
                    if (conflictedTexts.has(part.text)) continue;
                    if (part.pos === "mid" && !(/[a-z]/i.test(freeWriteText.slice(-1)))) continue;
                    if (part.pos === "start" && /[a-z]/i.test(freeWriteText.slice(-1))) continue;
                    token = { type: "char", val: part.text }; break;
                }
            }

            // 2b. Conflicted punctuation vs contractions
            if (!token) {
                const conflictMap = { ',': 'ea', '.': 'dis', '!': 'ff' };

                for (const [p, contraction] of Object.entries(conflictMap)) {
                    if (!patMatch(chord, brailleAlphabet[p])) continue;

                    const lastBufferChar = practiceBufferTokens.filter(t => t.type === "char").slice(-1)[0]?.val || "";
                    const prevIsLetter = /[a-z]/i.test(freeWriteText.slice(-1)) || /[a-z]/i.test(lastBufferChar);
                    const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                    const nextExpected = targetTokens[practiceBufferTokens.length];
                    const nextTargetToken = targetTokens[practiceBufferTokens.length + 1];
                    const nextIsDigit = nextTargetToken && nextTargetToken.type === "numeric_indicator";
                    // 7.3 — ellipsis: don't let a repeated period collapse into the
                    // 'dis' double-tap shortcut when the target actually expects
                    // another literal period cell here (i.e. we're mid-ellipsis).
                    const isEllipsisContinuation = p === '.' && nextExpected &&
                        nextExpected.type === 'punctuation' && nextExpected.visualText === '...';

                    if (isEllipsisContinuation) {
                        token = { type: "punctuation", val: "." };
                    } else if (isDoubleTap) {
                        practiceBufferTokens.pop();
                        token = { type: "char", val: contraction };
                    } else if (nextIsDigit) {
                        // 6.4.1 — period before number is punctuation not contraction
                        token = { type: "punctuation", val: p };
                    } else {
                        token = (nextExpected && nextExpected.type === "contraction" && nextExpected.visualText === contraction)
                            ? { type: "char", val: contraction }
                            : { type: "punctuation", val: p };
                    }
                    break;
                }

                // semicolon / bb / be — same pattern, but ask the (correct)
                // target what it expects here instead of guessing from
                // prevIsLetter, which can't tell "preceded by a letter
                // because bb/be belongs here" from "preceded by a letter
                // because a semicolon follows the end of a word"
                if (!token && patMatch(chord, brailleAlphabet[';'])) {
                    const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                    const nextExpected = targetTokens[practiceBufferTokens.length];
                    const expectsBb = nextExpected && nextExpected.type === "contraction" && nextExpected.visualText === "bb";
                    const expectsBe = nextExpected && nextExpected.type === "contraction" && nextExpected.visualText === "be";

                    if (isDoubleTap) {
                        practiceBufferTokens.pop();
                        token = { type: "char", val: expectsBb ? "bb" : "be" };
                    } else {
                        token = (expectsBb || expectsBe)
                            ? { type: "char", val: expectsBb ? "bb" : "be" }
                            : { type: "punctuation", val: ";" };
                    }
                }

                // en / enough — same pattern: ask the target instead of
                // assuming "en" every time, since "enough" shares the cell
                if (!token && patMatch(chord, g2WholeWords['enough'].pattern)) {
                    const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                    const nextExpected = targetTokens[practiceBufferTokens.length];
                    const expectsEnough = nextExpected && nextExpected.type === "contraction" && nextExpected.visualText === "enough";
                    token = expectsEnough ? { type: "char", val: "enough" } : { type: "char", val: "en" };
                }

                // gg / were — lower sign rule (10.5/10.6): "were" must stand
                // alone (no preceding letter), "gg" is a groupsign requiring
                // a preceding letter — check actual buffer position, not target
                if (!token && patMatch(chord, g2WholeWords['were'].pattern)) {
                    const lastBufferTok = practiceBufferTokens[practiceBufferTokens.length - 1];
                    const precededByLetter = lastBufferTok && (lastBufferTok.type === "char" || lastBufferTok.type === "contraction");
                    token = precededByLetter ? { type: "char", val: "gg" } : { type: "char", val: "were" };
                }
            }

            // 2c. single-letter wordsigns that share a cell with a plain letter
            // (but/can/do/it/you/as/etc.) — only valid when standing alone as a
            // whole word, so check the target's own word-boundary detection
            // (type "contraction" with a matching visualText) before falling
            // through to the plain alphabet match.
            if (!token) {
                const targetTokens = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(currentPracticeWord);
                const nextExpected = targetTokens[practiceBufferTokens.length];
                if (nextExpected && nextExpected.type === 'contraction') {
                    for (const [word, def] of Object.entries(g2WholeWords)) {
                        if (!def.prefix && patMatch(chord, def.pattern) && nextExpected.visualText === word) {
                            token = { type: "char", val: word };
                            break;
                        }
                    }
                }
            }

            // 3. Alphabet
            if (!token) {
                for (const [letter, bits] of Object.entries(brailleAlphabet)) {
                    if (patMatch(chord, bits)) { token = { type: "char", val: letter }; break; }
                }
            }

            // 4. Whole words with unique patterns (his, was, were, etc.)
            if (!token) {
                for (const [word, def] of Object.entries(g2WholeWords)) {
                    if (!def.prefix && patMatch(chord, def.pattern)) {
                        token = { type: "char", val: word }; break;
                    }
                }
            }
        }

        if (token) {
            practiceBufferTokens.push(token);
            renderFreeWriteContent();
            speakCharacter(token.val);
        } else {
            speakCharacter("error");
        }
        resetChord();
        return;
    }

    //--------------------------------------------------//
    //------------------- TIMED MODE --------------------//
    //--------------------------------------------------//

    if (gameMode === 'timed') {
        const token = targetBrailleSequence[currentIndex];
        const chordCopy = [...chord];
        keysHitInChord = [false, false, false, false, false, false];
        updateVisualCell();
        resolveNote(token && patMatch(chordCopy, token.pattern), false);
    }
}


//------------------------------------------------//
//-----INPUT HANDLING for Practice mode------------
//------------------------------------------------//

function decodePracticeBuffer() {
    if (!practiceBufferTokens.length) return "";

    // ── PASS 1: state machine decode (liblouis-style) ──
    // Walk tokens left to right, tracking mode as we go

    let mode = "normal"; // "normal" | "numeric" | "g1_symbol" | "g1_word" | "g1_passage"
    let isCapitalized = false;
    let capAllMode = false;
    let parts = [];
    let underscoreCellCount = 0;

    for (const t of practiceBufferTokens) {

        // mode-setting tokens — update state, produce no output
        if (t.type === "cap") { isCapitalized = true; continue; }
        if (t.type === "cap_word") { capAllMode = "word"; continue; }
        if (t.type === "cap_passage") { capAllMode = "passage"; continue; }
        if (t.type === "cap_terminator") { capAllMode = false; continue; }
        if (t.type === "numeric_indicator") { mode = "numeric"; continue; }
        if (t.type === "num_passage") { mode = "numeric"; continue; }
        if (t.type === "g1_symbol") { mode = "g1_symbol"; continue; }
        if (t.type === "g1_word") { mode = "g1_word"; continue; }
        if (t.type === "g1_passage") { mode = "g1_passage"; continue; }
        if (t.type === "g1_terminator") { mode = "normal"; continue; }
        if (t.type === "num_terminator") { mode = "normal"; continue; }
        if ('«»'.includes(t.val) && parts[parts.length - 1] === t.val) continue;
        if (t.type === "currency_prefix") { parts.push({ __currency: true }); continue; }

        // ── NUMERIC MODE ──
        if (mode === "numeric") {
            if (t.type === "num_space") { parts.push(" "); continue; } // stays in numeric mode, doesn't reset
            if (t.type === "num_comma") { parts.push(","); continue; }
            if (t.type === "num_period") { parts.push("."); continue; }
            if (t.type === "punctuation" && t.val === "-") {
                // 6.5.4 — hyphen terminates numeric mode
                parts.push("-"); mode = "normal"; continue;
            }
            if (t.type === "punctuation" && t.val === "-") {
                // 6.5.4 — hyphen terminates numeric mode
                parts.push("-"); mode = "normal"; continue;
            }
            if (t.type === "punctuation" && t.val === "/") {
                // 7.4 — solidus terminates numeric mode (not a valid numeric symbol)
                parts.push("/"); mode = "normal"; continue;
            }
            if (t.type === "space") { parts.push(" "); mode = "normal"; continue; }
            if (t.type === "space") { parts.push(" "); mode = "normal"; continue; }

            // digit or letter — look up as number (unless completing a currency symbol)
            const prevCurrency = parts[parts.length - 1];
            if (prevCurrency && prevCurrency.__currency) {
                parts.pop();
                const symbolMap = { s: '$', l: '£', e: '€', c: '¢' };
                parts.push(symbolMap[t.val] || t.val);
                continue;
            }
            const bits = brailleAlphabet[t.val];
            if (bits) {
                let found = false;
                for (const [n, pat] of Object.entries(brailleNumbers)) {
                    if (patMatch(pat, bits)) { parts.push(n); found = true; break; }
                }
                if (!found) parts.push(t.val); // fallback literal
            } else {
                parts.push(t.val || "");
            }
            continue;
        }

        // ── G1 SYMBOL MODE — next single token is literal, then back to normal ──
        if (mode === "g1_symbol") {
            parts.push(t.val || "");
            mode = "normal";
            continue;
        }

        // ── G1 WORD / PASSAGE MODE — all tokens are literal ──
        if (mode === "g1_word" || mode === "g1_passage") {
            parts.push(t.val || "");
            // g1_word resets after one word (space)
            if (mode === "g1_word" && (t.type === "space" || t.val === " ")) mode = "normal";
            continue;
        }

        // ── NORMAL MODE ──

        // space
        if (t.type === "space" || t.val === " ") {
            if (capAllMode === "word") capAllMode = false; // 8.4.2 — word indicator auto-terminates at space
            parts.push(" ");
            continue;
        }

        // punctuation
        if (t.type === "punctuation" || t.type === "num_comma" || t.type === "num_period") {
            if (t.val === "_") {
                underscoreCellCount++;
                if (underscoreCellCount % 2 === 0) parts.push("_");
                continue;
            }
            if (t.val === "--" && parts[parts.length - 1] === "--") continue;
            if (t.val === "'" && parts[parts.length - 1] === "'") continue;
            if (t.val === "/" && parts[parts.length - 1] === "/") continue;
            if (t.val === '"' && parts[parts.length - 1] === '"') continue;
            if (t.val === '\\' && parts[parts.length - 1] === '\\') continue;
            if ('()[]{}<>'.includes(t.val) && parts[parts.length - 1] === t.val) continue;
            parts.push(t.val); continue;
        }

        // con/cc resolved at input time (see handleChordRelease); pass through literally
        if (t.val === "con" || t.val === "cc") {
            parts.push(t.val);
            continue;
        }

        // lone sign words (ch, sh, th, wh, ou, st) — standalone whole-word
        // case is now resolved at input time (see handleChordRelease); if we
        // still see the bare fragment here it's genuinely mid-word, so it's
        // pushed literally via the generic char fallback below (no lookup
        // needed — this block intentionally does nothing now)

        // prefix + next char handled by looking ahead — collect prefix then next
        if (t.type === "prefix") {
            // prefix is held, next iteration will resolve with it
            parts.push({ __prefix: t.val });
            continue;
        }

        // resolve char — check if previous was a prefix
        if (t.type === "char") {

            const prevC = parts[parts.length - 1];
            if (prevC && prevC.__currency) {
                parts.pop();
                const symbolMap = { s: '$', l: '£', e: '€', c: '¢' };
                parts.push(symbolMap[t.val] || t.val);
                continue;
            }

            const prev = parts[parts.length - 1];
            if (prev && prev.__prefix) {
                parts.pop();
                const targetPfx = PREFIXES[prev.__prefix];
                let charBits = brailleAlphabet[t.val];
                if (!charBits) {
                    const part = g2PartWords.find(p => p.text === t.val);
                    if (part) charBits = part.pattern;
                }
                let resolved = null;
                if (targetPfx && charBits) {
                    for (const part of g2PartWords) {
                        if (part.prefix && patMatch(part.prefix, targetPfx) && patMatch(part.pattern, charBits)) {
                            resolved = part.text; break;
                        }
                    }
                    if (!resolved) {
                        for (const [word, def] of Object.entries(g2WholeWords)) {
                            if (def.prefix && patMatch(def.prefix, targetPfx) && patMatch(def.pattern, charBits)) {
                                resolved = word; break;
                            }
                        }
                    }
                }
                parts.push(resolved || t.val);
                continue;
            }

            // no prefix — check whole word contraction
            // no prefix — check whole word contraction (only if this letter
            // truly stands alone as a "word": bounded by spaces or the start/
            // end of the buffer. Punctuation like brackets/quotes does NOT
            // count as a boundary here, so "<x>" stays literal instead of
            // wrongly expanding to the wordsign "it".)
            const idx = practiceBufferTokens.indexOf(t);
            const prevTok = practiceBufferTokens[idx - 1];
            const nextTok = practiceBufferTokens[idx + 1];
            const isAlone = (!prevTok || prevTok.type === "space") && (!nextTok || nextTok.type === "space");
            const bits = brailleAlphabet[t.val];
            if (bits && isAlone) {
                let found = false;
                for (const [word, def] of Object.entries(g2WholeWords)) {
                    if (!def.prefix && patMatch(def.pattern, bits)) {
                        parts.push(word); found = true; break;
                    }
                }
                if (!found) parts.push(capAllMode ? t.val.toUpperCase() : t.val);
            } else {
                parts.push(capAllMode ? (t.val || "").toUpperCase() : (t.val || ""));
            }
            continue;
        }

        // shortform
        if (t.type === "shortform") {
            // shortforms already decoded via Case D below
            parts.push(t.val || "");
            continue;
        }

        // fallback
        parts.push(t.val || "");
    }

    // ── PASS 2: flatten, handle shortforms, capitalize ──
    let result = parts
        .filter(p => typeof p === "string")
        .join("");

    // shortform lookup — check whenever the buffer is ONLY plain letters
    // (skip if any contraction/prefix/whole-word token is present, since
    // those already produced a non-shortform result on purpose)
    const nonCharTokens = practiceBufferTokens.filter(t => t.type !== "cap" && t.type !== "char");
    if (nonCharTokens.length === 0) {
        const abbrStr = practiceBufferTokens
            .filter(t => t.type === "char")
            .map(t => t.val).join('');
        for (const [word, abbr] of Object.entries(shortforms)) {
            if (abbr === abbrStr) { result = word; break; }
        }
    }

    return isCapitalized && result ? result[0].toUpperCase() + result.slice(1) : result;
}

//-----------------------------//
//-----SENTENCE HANDLING---------
//-----------------------------//

function advanceCaret() {
    if (++currentIndex >= targetBrailleSequence.length) {
        // wait for last word to finish before ending
        setTimeout(() => {
            sentencePoolIndex++;
            if (sentencePoolIndex >= sentencePool.length) {
                endGame();
            } else {
                targetSentence = sentencePool[sentencePoolIndex];
                targetBrailleSequence = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(targetSentence);
                currentIndex = 0;
                buildSentenceHTML();
                spawnNextNote();
            }
        }, 300);
        return;
    }
    document.getElementById(`token - ${currentIndex} `).className = "char current";
    resetChord(); updateTargetClue();
}

function updateVisualCell() {
    if (gameMode !== 'practice') return;
    const keyIds = ['key-f', 'key-d', 'key-s', 'key-j', 'key-k', 'key-l'];
    keyIds.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('active', currentKeysPressed[i]);
    });
}

function resetChord() {
    currentKeysPressed = [false, false, false, false, false, false];
    keysHitInChord = [false, false, false, false, false, false];
    updateVisualCell();
}

function calculateRank(s) {
    return [{ n: 'S', c: '#f2f03e', t: 400 }, { n: 'A', c: '#48bb78', t: 250 }, { n: 'B', c: '#3182ce', t: 150 }]
        .find(r => s >= r.t) || { n: 'D', c: '#ca4754' };
}

function spawnNextNote() {
    if (currentIndex >= targetBrailleSequence.length) return;
    const token = targetBrailleSequence[currentIndex];
    const note = document.getElementById('falling-note');

    const bgLetter = document.getElementById('bg-letter');
    if (bgLetter) {
        const bgLabelMap = {
            cap: 'CAP',
            cap_word: 'CAP WORD',
            cap_passage: 'CAP PASSAGE',
            cap_terminator: 'CAP TERM',
            g1_symbol: 'G1',
            g1_word: 'G1 WORD',
            g1_passage: 'G1 PASSAGE',
            g1_terminator: 'G1 TERM',
            numeric_indicator: 'NUM',
            num_passage: 'NUM PASSAGE',
            num_terminator: 'NUM TERM'
        };
        bgLetter.textContent = token.type === 'space' ? 'space' :
            token.type === 'num_space' ? 'NUM SPACE' :
                bgLabelMap[token.type] ? bgLabelMap[token.type] :
                    token.type === 'shortform' ? token.abbrLetter :
                        token.visualText;
        bgLetter.style.fontSize = (token.type === 'space' || token.type === 'num_space') ? '5rem' : '8rem';
    }

    let unfolded = false;
    let hintRevealed = false;

    function renderBrailleCell() {
        note.innerHTML = '';
        note.className = 'falling-note-braille';
        const cell = document.createElement('div');
        cell.className = 'note-braille-cell';
        const keyLabels = ['F', 'J', 'D', 'K', 'S', 'L'];
        const showDots = dotHintsEnabled;
        [0, 3, 1, 4, 2, 5].forEach((i, pos) => {
            const d = document.createElement('div');
            d.className = 'note-cell-dot' + (showDots && token.pattern && token.pattern[i] ? ' filled' : '');
            d.textContent = keyLabels[pos];
            d.style.cssText = 'display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:11px;';
            cell.appendChild(d);
        });
        note.appendChild(cell);
    }

    function renderHorizontalKeys(showHints) {
        const oldDots = [...note.querySelectorAll('.note-cell-dot')];
        const dotRects = oldDots.map(d => d.getBoundingClientRect());

        note.innerHTML = '';
        note.className = 'falling-note-horizontal';
        const keyLabels = ['S', 'D', 'F', 'J', 'K', 'L'];
        const dotOrder = [2, 1, 0, 3, 4, 5];

        keyLabels.forEach((label, i) => {
            const key = document.createElement('div');
            const active = showHints && token.pattern && token.pattern[dotOrder[i]];
            key.className = 'note-key-hint' + (active ? ' filled' : '');
            key.textContent = label;
            note.appendChild(key);
        });

        const keys = [...note.querySelectorAll('.note-key-hint')];
        keys.forEach((key, i) => {
            const newRect = key.getBoundingClientRect();
            const oldRect = dotRects[i];
            if (!oldRect) return;
            const dx = oldRect.left - newRect.left;
            const dy = oldRect.top - newRect.top;
            key.style.transition = 'none';
            key.style.transform = `translate(${dx}px, ${dy}px) scale(0.7)`;
            key.style.opacity = '0';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    key.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.45, 0.64, 1), opacity 0.25s ease';
                    key.style.transform = 'translate(0, 0) scale(1)';
                    key.style.opacity = '1';
                });
            });
        });
    }

    if (note) renderBrailleCell();

    noteY = 0; noteActive = true; noteLastTime = null; inputLocked = true;
    if (noteRaf) cancelAnimationFrame(noteRaf);

    function tick(ts) {
        if (!isPlaying || !noteActive) return;
        if (!noteLastTime) noteLastTime = ts;
        noteY += noteSpeed * (ts - noteLastTime);
        noteLastTime = ts;
        const hw = document.getElementById('note-highway');
        const fn = document.getElementById('falling-note');
        if (hw && fn) {
            fn.style.top = Math.round(noteY * hw.clientHeight) + 'px';

            if (!unfolded && noteY >= 0.10) {
                unfolded = true;
                inputLocked = true;
                renderHorizontalKeys(false);
            }
            if (unfolded && inputLocked && noteY >= 0.25) {
                inputLocked = false;
            }
            if (unfolded && !hintRevealed && noteY >= 0.90) {
                hintRevealed = true;
                if (keyHintsEnabled) renderHorizontalKeys(true);
            }
        }
        if (noteY > GOOD_ZONE.bot + 0.06) {
            if (!inputLocked) resolveNote(false, true);
            return;
        }
        noteRaf = requestAnimationFrame(tick);
    }
    noteRaf = requestAnimationFrame(tick);
}

function stopNoteLoop() {
    noteActive = false;
    if (noteRaf) { cancelAnimationFrame(noteRaf); noteRaf = null; }
}

//-----------------------------//
//-----RESULT function-----------
//-----------------------------//

function showJudgment(type) {
    const el = document.getElementById('judgment-text');
    if (!el) return;
    el.textContent = type.toUpperCase();
    el.className = 'judgment-' + type;
    el.style.opacity = '1';
    clearTimeout(judgmentTimer);
    judgmentTimer = setTimeout(() => { el.style.opacity = '0'; }, 600);
}

function resolveNote(chordCorrect, autoMiss) {

    //--- JUDGMENT ---

    stopNoteLoop();
    const judgment = (!autoMiss && chordCorrect) ? 'good' : 'miss';
    showJudgment(judgment);

    //--- MISS ---

    if (judgment === 'miss') {
        missCount++;
        scoreMiss();
        missedLast = true;
        setTimeout(() => { if (isPlaying) spawnNextNote(); }, 500);
        return;
    }

    //--- HIT ---

    const points = missedLast ? 0 : noteY < 0.60 ? 10 : noteY < 0.90 ? 5 : 1;
    goodCount++;
    scoreHit(points);
    missedLast = false;

    const span = document.getElementById(`token-${currentIndex}`);
    const token = targetBrailleSequence[currentIndex];
    const next = targetBrailleSequence[currentIndex + 1];

    //--- SPEAK ---

    if (token.type === 'shortform') {
        speakCharacter(token.abbrLetter);
    } else {
        speakCharacter(token.visualText);
    }

    //--- HIGHLIGHT SPAN ---

    if (span) {
        if (token.type === 'shortform' && !token.isLastAbbr) {
            span.className = 'char current';
        } else if (token.type === 'shortform' && token.isLastAbbr) {
            let firstIdx = currentIndex;
            while (firstIdx > 0 && targetBrailleSequence[firstIdx - 1].type === 'shortform') firstIdx--;
            const firstSpan = document.getElementById(`token-${firstIdx}`);
            if (firstSpan) firstSpan.className = 'char correct';
        } else {
            span.className = 'char correct';
        }
    }

    //--- WORD SPEAK BUFFER ---

    if (token.type !== 'shortform' && token.visualText !== ' ')
        wordSpeakBuffer.push(token.visualText);

    //--- ADVANCE ---

    currentIndex++;

    //--- END OF SENTENCE ---

    if (currentIndex >= targetBrailleSequence.length) {
        wordSpeakBuffer = [];
        setTimeout(() => {
            sentencePoolIndex++;
            if (sentencePoolIndex >= sentencePool.length) {
                endGame();
                return;
            }
            targetSentence = sentencePool[sentencePoolIndex];
            targetBrailleSequence = (brailleGrade === 1 ? tokenizeGrade1 : tokenizeGrade2)(targetSentence);
            currentIndex = 0;
            buildSentenceHTML();

            const fn = document.getElementById('falling-note');
            if (fn) fn.innerHTML = '';
            const bgLetter = document.getElementById('bg-letter');
            if (bgLetter) bgLetter.textContent = '';

            speakCharacter(targetSentence, () => spawnNextNote());
        }, 300);
        return;
    }

    //--- END OF WORD ---

    if (!next || next.visualText === ' ') {
        if (wordSpeakBuffer.length) {
            const word = wordSpeakBuffer.join('');
            wordSpeakBuffer = [];
            setTimeout(() => speakCharacter(word), 400);
        }
    }

    //--- NEXT NOTE ---

    const currentTokenEl = document.getElementById(`token-${currentIndex}`);
    if (currentTokenEl) currentTokenEl.className = 'char current';
    resetChord();
    setTimeout(() => { if (isPlaying) spawnNextNote(); }, 250);
}

function scoreHit(basePoints) {
    streak++;
    const prev = multiplier;
    multiplier = streak >= 10 ? 4 : streak >= 6 ? 3 : streak >= 3 ? 2 : 1;
    if (multiplier > maxMultiplierAchieved) maxMultiplierAchieved = multiplier;
    if (multiplier > prev) pulseCombo();
    score += basePoints * multiplier;
    document.getElementById('score').textContent = score;
    updateMultiplierUI(); updateComboUI(); playTone('correct');
}

function scoreMiss() {
    streak = 0; multiplier = 1;
    score = Math.max(0, score - missPenaltyScore);
    document.getElementById('score').textContent = score;
    updateMultiplierUI(); updateComboUI(); playTone('error');
}

//-----------------------------//
//-----END GAME function---------
//-----------------------------//

function endGame() {

    //--- GUARD + CLEANUP ---

    if (!isPlaying) return;
    isPlaying = false;
    inputLocked = false;
    clearInterval(timerInterval);
    countdownTimeouts.forEach(t => clearTimeout(t));
    countdownTimeouts = [];
    const cdOverlay = document.getElementById('countdown-overlay');
    if (cdOverlay) cdOverlay.remove();

    //--- HIDE GAME UI ---

    ['stats-container', 'game-screen', 'combo-bar-wrapper', 'braille-cheat-sheet'].forEach(id =>
        document.getElementById(id).style.display = 'none');

    //--- SHOW RESULTS SCREEN ---

    document.getElementById('menu-screen').style.display = 'block';
    showScreen('end-game-stats');

    //--- MODE SETUP ---

    const isPractice = gameMode === 'practice';

    document.getElementById('results-title').textContent =
        isPractice ? 'End of Practice' : `Level ${currentStageLevel} ${LEVELS[currentStageLevel].name} `;

    //--- BUTTONS ---

    document.getElementById('replay-btn').style.display = isPractice ? 'none' : 'inline-block';
    document.getElementById('levels-btn').style.display = isPractice ? 'none' : 'inline-block';
    document.getElementById('return-btn').style.display = isPractice ? 'inline-block' : 'none';
    document.getElementById('next-level-btn').style.display =
        (!isPractice && currentStageLevel < maxLevelForGrade()) ? 'inline-block' : 'none';

    //--- SCORE PANEL ---

    document.getElementById('panel-score-label').textContent = isPractice ? "Characters Typed" : "Score";
    document.getElementById('final-score-val').textContent = isPractice ? practiceCharCount : score;
    document.getElementById('final-mult-val').textContent = `${maxMultiplierAchieved} x`;
    document.getElementById('mult-panel-box').style.display = isPractice ? 'none' : 'flex';
    document.getElementById('rank-panel-box').style.display = isPractice ? 'none' : 'flex';

    //--- RANK + UNLOCK (timed only) ---

    const unlockBanner = document.getElementById('unlock-banner');
    unlockBanner.style.display = 'none';

    if (!isPractice) {
        const rank = calculateRank(score);
        const rankEl = document.getElementById('final-rank-val');
        rankEl.textContent = rank.n;
        rankEl.style.color = rank.c;

        if (currentStageLevel < maxLevelForGrade()) {
            const next = currentStageLevel + 1;
            if (!unlockedLevels.has(next)) {
                unlockedLevels.add(next);
                document.getElementById('unlock-level-name').textContent = `${next}: ${LEVELS[next].name} `;
                unlockBanner.style.display = 'block';
            }
        }
    }

    //--- ACCURACY STATS ---

    const totalAttempts = goodCount + missCount;
    const accuracy = totalAttempts > 0 ? Math.round((goodCount / totalAttempts) * 100) : 0;
    document.getElementById('final-perfect-val').textContent = accuracy + '%';
    document.getElementById('final-good-val').textContent = goodCount;
    document.getElementById('final-miss-val').textContent = missCount;

    //--- JUDGMENT PANEL ---

    const jPanel = document.getElementById('judgment-panel');
    if (jPanel) jPanel.style.display = isPractice ? 'none' : 'flex';
}

generateCheatSheetDOM();
buildSongDropdowns();
