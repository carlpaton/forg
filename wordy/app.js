const WORDS = [
    'apple', 'grape', 'crane', 'flame', 'sword', 'blitz', 'quake', 'vivid', 'glyph', 'fjord',
    'nymph', 'jumpy', 'zesty', 'fuzzy', 'pouch', 'waltz', 'vexed', 'plush', 'squad', 'tryst',
    'adobe', 'adopt', 'adult', 'agent', 'agree', 'ahead', 'aisle', 'alarm', 'album', 'alert',
    'alien', 'align', 'alike', 'alive', 'allow', 'alone', 'along', 'alpha', 'altar', 'amaze',
    'amber', 'amend', 'angel', 'anger', 'angle', 'angry', 'anime', 'ankle', 'apple', 'apply',
    'arena', 'argue', 'arise', 'armor', 'array', 'arrow', 'aside', 'asset', 'audio', 'audit',
    'avoid', 'await', 'awake', 'award', 'aware', 'awful', 'bacon', 'badge', 'baker', 'balmy',
    'banjo', 'basic', 'basil', 'batch', 'beach', 'beard', 'beast', 'begin', 'being', 'belly',
    'bench', 'berry', 'birth', 'black', 'blade', 'blame', 'blank', 'blast', 'bleak', 'blend',
    'bless', 'blind', 'blink', 'block', 'blood', 'bloom', 'blown', 'board', 'boast', 'bonus',
    'boost', 'booth', 'bound', 'brain', 'brake', 'brand', 'brave', 'bread', 'break', 'breed',
    'brick', 'bride', 'brief', 'bring', 'broad', 'broke', 'brown', 'brush', 'build', 'built',
    'bulky', 'bunny', 'burst', 'buyer', 'cabin', 'cable', 'cacao', 'cache', 'caddy', 'cadet',
    'cagey', 'camel', 'canal', 'candy', 'canoe', 'canon', 'cargo', 'carve', 'catch', 'cause',
    'cease', 'chain', 'chair', 'chalk', 'champ', 'chant', 'chaos', 'charm', 'chart', 'chase',
    'cheap', 'cheat', 'check', 'cheek', 'cheer', 'chess', 'chest', 'chief', 'child', 'chill',
    'china', 'choir', 'choke', 'chord', 'chose', 'chunk', 'cider', 'cigar', 'cinch', 'civic',
    'civil', 'claim', 'clamp', 'clash', 'class', 'clean', 'clear', 'clerk', 'click', 'cliff',
    'climb', 'cling', 'cloak', 'clock', 'clone', 'close', 'cloth', 'cloud', 'clown', 'coach',
    'coast', 'cobra', 'comet', 'comic', 'comma', 'conch', 'coral', 'couch', 'could', 'count',
    'court', 'cover', 'crack', 'craft', 'crane', 'crash', 'crate', 'crawl', 'crazy', 'cream',
    'creek', 'crest', 'crime', 'crisp', 'crook', 'cross', 'crowd', 'crown', 'crude', 'crush',
    'crust', 'curve', 'cycle', 'daily', 'dairy', 'dance', 'dated', 'dealt', 'death', 'debut',
    'debug', 'decay', 'defer', 'delay', 'delta', 'demon', 'dense', 'depth', 'derby', 'devil',
    'diary', 'digit', 'diner', 'dirty', 'ditch', 'diver', 'dizzy', 'donor', 'doubt', 'dozen',
    'draft', 'drain', 'drake', 'drama', 'drank', 'drawn', 'dream', 'dress', 'drift', 'drink',
    'drive', 'droid', 'drone', 'drown', 'drunk', 'dryer', 'eager', 'eagle', 'early', 'earth',
    'easel', 'eaten', 'ebony', 'edict', 'eight', 'elbow', 'elder', 'elect', 'elite', 'elope',
    'email', 'embed', 'ember', 'empty', 'enact', 'enemy', 'enjoy', 'enter', 'entry', 'envoy',
    'equal', 'equip', 'erase', 'error', 'essay', 'event', 'every', 'evict', 'exact', 'exile',
    'exist', 'extra', 'fable', 'facet', 'faith', 'false', 'fancy', 'fatal', 'favor', 'feast',
    'fence', 'fever', 'fiber', 'field', 'fiend', 'fight', 'final', 'finch', 'first', 'flair',
    'flame', 'flank', 'flash', 'fleet', 'flesh', 'flick', 'fling', 'float', 'flock', 'flora',
    'flour', 'fluid', 'flush', 'focus', 'force', 'forge', 'forth', 'found', 'frame', 'fraud',
    'fresh', 'fried', 'frill', 'front', 'frost', 'fruit', 'fudge', 'fully', 'funny', 'furry',
    'gauge', 'gazer', 'gecko', 'genie', 'genre', 'ghost', 'giant', 'giddy', 'given', 'glade',
    'gland', 'glare', 'glass', 'glide', 'gloom', 'glory', 'glove', 'glyph', 'gnome', 'grace',
    'grade', 'grain', 'grand', 'grant', 'grape', 'graph', 'grasp', 'grass', 'grave', 'great',
    'greed', 'green', 'greet', 'grief', 'grill', 'grind', 'grins', 'groan', 'grove', 'grown',
    'guard', 'guess', 'guest', 'guide', 'guild', 'guilt', 'guise', 'gulch', 'gummy', 'gusty',
    'habit', 'hairy', 'halve', 'happy', 'harsh', 'haste', 'hatch', 'haunt', 'haven', 'hazel',
    'heart', 'heavy', 'hedge', 'hello', 'hence', 'heron', 'hiker', 'hinge', 'hippo', 'hobby',
    'hoist', 'honey', 'honor', 'horse', 'hotel', 'hound', 'house', 'hover', 'human', 'humor',
    'hurry', 'husky', 'hydra', 'hyena', 'icing', 'ideal', 'idiom', 'idiot', 'image', 'imply',
    'index', 'infer', 'input', 'irate', 'irony', 'issue', 'ivory', 'jelly', 'jewel', 'joint',
    'judge', 'juice', 'jumbo', 'jumpy', 'junta', 'juror', 'karma', 'kayak', 'kebab', 'ketch',
    'khaki', 'kiosk', 'kitty', 'knack', 'kneel', 'knife', 'knock', 'known', 'koala', 'label',
    'labor', 'latch', 'later', 'laugh', 'layer', 'lemon', 'level', 'lever', 'light', 'limit',
    'linen', 'liver', 'lobby', 'local', 'logic', 'lofty', 'lodge', 'loose', 'lunar', 'lunch',
    'lunge', 'lupus', 'lyric', 'macro', 'madam', 'magic', 'major', 'maker', 'mango', 'manor',
    'maple', 'march', 'marsh', 'match', 'maybe', 'mayor', 'meant', 'medal', 'media', 'melon',
    'mercy', 'merge', 'merit', 'metal', 'meter', 'micro', 'mimic', 'miner', 'minor', 'minus',
    'mirth', 'model', 'modem', 'moist', 'money', 'month', 'moral', 'morph', 'motel', 'motor',
    'mount', 'mouse', 'mouth', 'movie', 'music', 'musty', 'myths', 'naked', 'nasal', 'nasty',
    'naval', 'nerve', 'never', 'niche', 'night', 'ninja', 'noble', 'noise', 'north', 'novel',
    'nudge', 'nymph', 'ocean', 'offer', 'often', 'olive', 'omega', 'onion', 'opera', 'orbit',
    'order', 'organ', 'other', 'otter', 'ounce', 'outer', 'owner', 'oxide', 'ozone', 'paddy',
    'paint', 'panel', 'panic', 'paper', 'parka', 'party', 'patch', 'pause', 'peace', 'peach',
    'pearl', 'pedal', 'penal', 'penny', 'perch', 'petal', 'phase', 'phone', 'photo', 'piano',
    'pilot', 'pinch', 'pinky', 'piper', 'pitch', 'pivot', 'pixel', 'pizza', 'plaid', 'plain',
    'plank', 'plant', 'plate', 'plaza', 'plead', 'plush', 'poach', 'point', 'poker', 'polar',
    'polka', 'pouch', 'pound', 'power', 'prank', 'press', 'price', 'pride', 'prime', 'print',
    'prior', 'prism', 'privy', 'prize', 'probe', 'prone', 'proof', 'proud', 'prove', 'proxy',
    'punch', 'pupil', 'puppy', 'purse', 'quack', 'quake', 'queen', 'query', 'quest', 'quick',
    'quiet', 'quilt', 'quirk', 'quota', 'quote', 'rabid', 'racer', 'radar', 'radio', 'rainy',
    'raise', 'rally', 'ranch', 'range', 'rapid', 'ratio', 'reach', 'react', 'ready', 'realm',
    'rebel', 'refer', 'reign', 'relax', 'relay', 'remit', 'renal', 'renew', 'reply', 'reset',
    'resin', 'retro', 'rider', 'ridge', 'rifle', 'right', 'rigid', 'rinse', 'risky', 'rival',
    'river', 'robot', 'rocky', 'rogue', 'roman', 'rough', 'round', 'route', 'royal', 'rugby',
    'ruler', 'rumor', 'rural', 'sable', 'salad', 'salon', 'salsa', 'sandy', 'sassy', 'satin',
    'sauce', 'sauna', 'scale', 'scarf', 'scary', 'scene', 'scent', 'scold', 'scoop', 'scope',
    'score', 'scout', 'scrap', 'screw', 'scrub', 'seize', 'sense', 'serve', 'setup', 'seven',
    'shade', 'shake', 'shaky', 'shame', 'shape', 'share', 'shark', 'sharp', 'sheep', 'sheer',
    'sheet', 'shelf', 'shell', 'shift', 'shine', 'shiny', 'shirt', 'shock', 'shook', 'shore',
    'short', 'shout', 'shove', 'shown', 'shrub', 'shrug', 'sight', 'silly', 'since', 'siren',
    'sixth', 'sixty', 'skate', 'skier', 'skill', 'skirt', 'skull', 'slack', 'slain', 'slang',
    'slant', 'slash', 'slave', 'sleek', 'sleep', 'sleet', 'slice', 'slide', 'slime', 'sling',
    'slope', 'sloth', 'small', 'smart', 'smash', 'smear', 'smell', 'smile', 'smirk', 'smoke',
    'snack', 'snail', 'snake', 'snare', 'sneak', 'sneer', 'snide', 'snipe', 'snore', 'snout',
    // ...existing code...
];

const LEVELS = 10;
let currentLevel = 1;
let secretWord = '';
let guesses = [];
let currentGuess = '';
let gameOver = false;
let maxTries = 6;

let shuffledWords = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('wordyHighScore')) || 0;
const scoreInfo = document.getElementById('score-info');

const board = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const gameOverDiv = document.getElementById('game-over');
const levelInfo = document.getElementById('level-info');

function shuffleWords() {
    shuffledWords = [...WORDS];
    for (let i = shuffledWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
    }
}

function pickWord(level) {
    // Use shuffled words for each game session
    return shuffledWords[(level - 1) % shuffledWords.length];
}

function resetGame(level = 1) {
    if (level === 1) shuffleWords();
    currentLevel = level;
    secretWord = pickWord(currentLevel);
    // Show the secret word in the footer for testing, hidden by color
    const secretFooter = document.getElementById('secret-word-footer');
    if (secretFooter) {
        secretFooter.textContent = ` (Word: ${secretWord})`;
    }
    guesses = [];
    currentGuess = '';
    gameOver = false;
    gameOverDiv.style.display = 'none';
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.style.display = 'none';
    renderBoard();
    renderKeyboard();
    updateLevelInfo();
    updateScoreInfo();
}

function updateLevelInfo() {
    levelInfo.textContent = `Level ${currentLevel} / ${LEVELS}`;
}

function updateScoreInfo() {
    if (scoreInfo) {
        scoreInfo.textContent = `Score: ${score} | High Score: ${highScore}`;
    }
}

function renderBoard() {
    board.innerHTML = '';
    for (let i = 0; i < maxTries; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('board-row');
        for (let j = 0; j < 5; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            let letter = '';
            let status = '';
            if (guesses[i]) {
                letter = guesses[i][j] || '';
                status = getTileStatus(guesses[i], j);
            } else if (i === guesses.length) {
                letter = currentGuess[j] || '';
            }
            if (status) tile.classList.add(status);
            tile.textContent = letter;
            rowDiv.appendChild(tile);
        }
        board.appendChild(rowDiv);
    }
}

function getTileStatus(guess, idx) {
    if (!guess) return '';
    if (secretWord[idx] === guess[idx]) return 'correct';
    if (secretWord.includes(guess[idx])) return 'present';
    return 'absent';
}

function renderKeyboard() {
    keyboard.innerHTML = '';
    const rows = [
        'QWERTYUIOP',
        'ASDFGHJKL',
        'ZXCVBNM'
    ];
    rows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
        row.split('').forEach(key => {
            const keyDiv = document.createElement('button');
            keyDiv.classList.add('key');
            keyDiv.textContent = key;
            keyDiv.onclick = () => handleKey(key);
            keyDiv.setAttribute('data-key', key);
            rowDiv.appendChild(keyDiv);
        });
        keyboard.appendChild(rowDiv);
    });
    // Add Enter and Backspace
    const controlRow = document.createElement('div');
    controlRow.classList.add('keyboard-row');
    ['Enter', 'Backspace'].forEach(ctrl => {
        const ctrlBtn = document.createElement('button');
        ctrlBtn.classList.add('key');
        ctrlBtn.textContent = ctrl;
        ctrlBtn.onclick = () => handleKey(ctrl);
        controlRow.appendChild(ctrlBtn);
    });
    keyboard.appendChild(controlRow);
}

function handleKey(key) {
    if (gameOver) return;
    if (key === 'Enter') {
        submitGuess();
    } else if (key === 'Backspace') {
        currentGuess = currentGuess.slice(0, -1);
        renderBoard();
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        currentGuess += key.toLowerCase();
        renderBoard();
    }
}

function submitGuess() {
    if (currentGuess.length !== 5) return;
    if (!WORDS.includes(currentGuess)) {
        // Shake the current row for invalid word
        const rows = document.querySelectorAll('#game-board .board-row');
        const rowIdx = guesses.length;
        const row = rows[rowIdx];
        if (row) {
            row.classList.add('shake');
            setTimeout(() => row.classList.remove('shake'), 400);
        }
        return;
    }
    guesses.push(currentGuess);
    renderBoard();
    if (currentGuess === secretWord) {
        showGameOver(true);
    } else if (guesses.length >= maxTries) {
        showGameOver(false);
    } else {
        currentGuess = '';
    }
}

function showGameOver(won) {
    gameOver = true;
    // Update score
    if (won) {
        score++;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('wordyHighScore', highScore);
        }
    } else {
        score = 0;
    }
    updateScoreInfo();
    // Show modal overlay
    const modal = document.getElementById('modal-overlay');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            ${won ? '🎉 <strong>You guessed it!</strong><br>Press Space or tap to go to next level.' : `Game Over! The word was <strong>${secretWord.toUpperCase()}</strong>.<br>Press Space or tap to restart.`}
            ${won && currentLevel >= LEVELS ? '<div>🏆 You completed all levels!</div>' : ''}
            <div>Score: ${score} | High Score: ${highScore}</div>
        </div>
    `;
    if (won) {
        if (currentLevel < LEVELS) {
            document.body.onkeydown = (e) => {
                if (e.code === 'Space') nextLevel();
            };
            modal.onclick = nextLevel;
        }
    } else {
        document.body.onkeydown = (e) => {
            if (e.code === 'Space') resetGame(currentLevel);
        };
        modal.onclick = () => resetGame(currentLevel);
    }
}

function nextLevel() {
    if (currentLevel < LEVELS) {
        resetGame(currentLevel + 1);
    }
}

// Physical keyboard support
window.addEventListener('keydown', (e) => {
    if (gameOver) return;
    let key = e.key;
    if (key === 'Enter') {
        handleKey('Enter');
    } else if (key === 'Backspace') {
        handleKey('Backspace');
    } else if (/^[a-zA-Z]$/.test(key)) {
        handleKey(key.toUpperCase());
    }
});

// Mobile touch controls: show keyboard always
function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}
if (isMobile()) {
    keyboard.style.display = 'block';
}

resetGame();
