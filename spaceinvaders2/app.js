// Space Invaders - Retro Arcade
// Main game logic

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Game constants
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 24;
const PLAYER_SPEED = 6;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 12;
const BULLET_SPEED = 10;
const ALIEN_ROWS = 5;
const ALIEN_COLS = 11;
const ALIEN_WIDTH = 32;
const ALIEN_HEIGHT = 24;
const ALIEN_H_GAP = 16;
const ALIEN_V_GAP = 18;
const ALIEN_X_START = 64;
const ALIEN_Y_START = 64;
const ALIEN_MOVE_INTERVAL = 40; // px before drop
const ALIEN_DROP = 32;
const ALIEN_BULLET_SPEED = 6;
const ALIEN_BULLET_WIDTH = 4;
const ALIEN_BULLET_HEIGHT = 12;
const BUNKER_WIDTH = 64;
const BUNKER_HEIGHT = 32;
const BUNKER_COUNT = 4;
const BUNKER_Y = CANVAS_HEIGHT - 140;
const FPS = 60;
const PLAYER_LIVES = 3;
const ALIEN_TYPES = [
  { points: 30, color: "#f00" }, // Top row
  { points: 20, color: "#ff0" }, // 2nd row
  { points: 20, color: "#ff0" }, // 3rd row
  { points: 10, color: "#0ff" }, // 4th row
  { points: 10, color: "#0ff" }, // 5th row
];

// Game state
let gameState = "start"; // start, playing, gameover, victory
let score = 0;
let lives = PLAYER_LIVES;
let wave = 1;
let player;
let playerBullets = [];
let aliens = [];
let alienBullets = [];
let alienDir = 1; // 1: right, -1: left
let alienMoveTimer = 0;
let bunkers = [];
let keys = {};
let lastFrame = 0;
let soundEnabled = true;

// UI elements
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const gameOverScreen = document.getElementById("game-over");
const finalScore = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const victoryScreen = document.getElementById("victory");
const victoryScore = document.getElementById("victory-score");
const nextWaveBtn = document.getElementById("next-wave-btn");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const waveEl = document.getElementById("wave");

// Sound effects
const sounds = {
  shoot: new Audio(
    "https://cdn.jsdelivr.net/gh/terkelg/spaceinvaders-assets/sounds/shoot.wav"
  ),
  explosion: new Audio(
    "https://cdn.jsdelivr.net/gh/terkelg/spaceinvaders-assets/sounds/explosion.wav"
  ),
  invader: new Audio(
    "https://cdn.jsdelivr.net/gh/terkelg/spaceinvaders-assets/sounds/invader.wav"
  ),
  gameover: new Audio(
    "https://cdn.jsdelivr.net/gh/terkelg/spaceinvaders-assets/sounds/gameover.wav"
  ),
  victory: new Audio(
    "https://cdn.jsdelivr.net/gh/terkelg/spaceinvaders-assets/sounds/victory.wav"
  ),
};
function playSound(name) {
  if (soundEnabled && sounds[name]) {
    sounds[name].currentTime = 0;
    sounds[name].play();
  }
}

// Classes
class Player {
  constructor() {
    this.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    this.y = CANVAS_HEIGHT - PLAYER_HEIGHT - 24;
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.cooldown = 0;
  }
  move(dir) {
    this.x += dir * PLAYER_SPEED;
    this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));
  }
  shoot() {
    if (this.cooldown <= 0) {
      playerBullets.push({
        x: this.x + this.width / 2 - BULLET_WIDTH / 2,
        y: this.y - BULLET_HEIGHT,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        active: true,
      });
      this.cooldown = 18;
      playSound("shoot");
    }
  }
  update() {
    if (this.cooldown > 0) this.cooldown--;
  }
  draw() {
    ctx.save();
    ctx.fillStyle = "#0f0";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Draw pixel details for retro look
    ctx.fillStyle = "#fff";
    ctx.fillRect(this.x + 12, this.y + 6, 24, 6);
    ctx.fillRect(this.x + 20, this.y, 8, 6);
    ctx.restore();
  }
}

class Alien {
  constructor(row, col, type) {
    this.row = row;
    this.col = col;
    this.type = type;
    this.width = ALIEN_WIDTH;
    this.height = ALIEN_HEIGHT;
    this.x = ALIEN_X_START + col * (ALIEN_WIDTH + ALIEN_H_GAP);
    this.y = ALIEN_Y_START + row * (ALIEN_HEIGHT + ALIEN_V_GAP);
    this.active = true;
    this.frame = 0;
  }
  draw() {
    ctx.save();
    ctx.fillStyle = this.type.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Pixel details
    ctx.fillStyle = "#fff";
    ctx.fillRect(this.x + 8, this.y + 8, 16, 4);
    ctx.fillRect(this.x + 12, this.y + 16, 8, 4);
    ctx.restore();
  }
}

class Bunker {
  constructor(x) {
    this.x = x;
    this.y = BUNKER_Y;
    this.width = BUNKER_WIDTH;
    this.height = BUNKER_HEIGHT;
    this.hp = 8; // 8 hits to destroy
  }
  hit() {
    this.hp--;
  }
  draw() {
    ctx.save();
    ctx.fillStyle = this.hp > 4 ? "#fff" : "#888";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Pixel details
    ctx.fillStyle = "#0f0";
    ctx.fillRect(this.x + 8, this.y + 8, this.width - 16, 8);
    ctx.restore();
  }
}

// Game functions
function resetGame() {
  score = 0;
  lives = PLAYER_LIVES;
  wave = 1;
  setupWave();
}

function setupWave() {
  player = new Player();
  playerBullets = [];
  alienBullets = [];
  aliens = [];
  alienDir = 1;
  alienMoveTimer = 0;
  bunkers = [];
  // Aliens
  for (let row = 0; row < ALIEN_ROWS; row++) {
    for (let col = 0; col < ALIEN_COLS; col++) {
      aliens.push(new Alien(row, col, ALIEN_TYPES[row]));
    }
  }
  // Bunkers
  for (let i = 0; i < BUNKER_COUNT; i++) {
    let x = (CANVAS_WIDTH / (BUNKER_COUNT + 1)) * (i + 1) - BUNKER_WIDTH / 2;
    bunkers.push(new Bunker(x));
  }
}

function updateGame() {
  // Player
  player.update();
  if (keys["ArrowLeft"]) player.move(-1);
  if (keys["ArrowRight"]) player.move(1);

  // Player bullets
  for (let bullet of playerBullets) {
    if (bullet.active) {
      bullet.y -= BULLET_SPEED;
      if (bullet.y < 0) bullet.active = false;
    }
  }
  // Remove inactive bullets
  playerBullets = playerBullets.filter((b) => b.active);

  // Aliens
  let minX = Infinity,
    maxX = -Infinity;
  for (let alien of aliens) {
    if (!alien.active) continue;
    minX = Math.min(minX, alien.x);
    maxX = Math.max(maxX, alien.x + alien.width);
  }
  alienMoveTimer += 1 + wave * 0.2;
  if (alienMoveTimer > ALIEN_MOVE_INTERVAL) {
    for (let alien of aliens) {
      if (!alien.active) continue;
      alien.x += alienDir * (8 + wave * 2);
    }
    alienMoveTimer = 0;
    // Edge detection
    if (maxX >= CANVAS_WIDTH - 16 && alienDir === 1) {
      alienDir = -1;
      for (let alien of aliens) if (alien.active) alien.y += ALIEN_DROP;
      playSound("invader");
    } else if (minX <= 16 && alienDir === -1) {
      alienDir = 1;
      for (let alien of aliens) if (alien.active) alien.y += ALIEN_DROP;
      playSound("invader");
    }
  }
  // Alien shooting
  if (Math.random() < 0.03 + wave * 0.01) {
    let shooters = aliens.filter((a) => a.active);
    if (shooters.length) {
      let shooter = shooters[Math.floor(Math.random() * shooters.length)];
      alienBullets.push({
        x: shooter.x + shooter.width / 2 - ALIEN_BULLET_WIDTH / 2,
        y: shooter.y + shooter.height,
        width: ALIEN_BULLET_WIDTH,
        height: ALIEN_BULLET_HEIGHT,
        active: true,
      });
    }
  }
  // Alien bullets
  for (let bullet of alienBullets) {
    if (bullet.active) {
      bullet.y += ALIEN_BULLET_SPEED + wave * 0.5;
      if (bullet.y > CANVAS_HEIGHT) bullet.active = false;
    }
  }
  alienBullets = alienBullets.filter((b) => b.active);

  // Collisions
  // Player bullet vs alien
  for (let bullet of playerBullets) {
    if (!bullet.active) continue;
    for (let alien of aliens) {
      if (!alien.active) continue;
      if (rectsCollide(bullet, alien)) {
        bullet.active = false;
        alien.active = false;
        score += alien.type.points;
        playSound("explosion");
        break;
      }
    }
  }
  // Alien bullet vs player
  for (let bullet of alienBullets) {
    if (!bullet.active) continue;
    if (rectsCollide(bullet, player)) {
      bullet.active = false;
      lives--;
      playSound("explosion");
      if (lives <= 0) {
        gameState = "gameover";
        playSound("gameover");
        finalScore.textContent = `Final Score: ${score}`;
        showScreen(gameOverScreen);
      }
    }
  }
  // Alien vs bottom
  for (let alien of aliens) {
    if (!alien.active) continue;
    if (alien.y + alien.height >= player.y) {
      lives = 0;
      gameState = "gameover";
      playSound("gameover");
      finalScore.textContent = `Final Score: ${score}`;
      showScreen(gameOverScreen);
      break;
    }
  }
  // Player bullet vs bunker
  for (let bullet of playerBullets) {
    if (!bullet.active) continue;
    for (let bunker of bunkers) {
      if (bunker.hp > 0 && rectsCollide(bullet, bunker)) {
        bullet.active = false;
        bunker.hit();
        break;
      }
    }
  }
  // Alien bullet vs bunker
  for (let bullet of alienBullets) {
    if (!bullet.active) continue;
    for (let bunker of bunkers) {
      if (bunker.hp > 0 && rectsCollide(bullet, bunker)) {
        bullet.active = false;
        bunker.hit();
        break;
      }
    }
  }
  // Victory
  if (aliens.every((a) => !a.active)) {
    gameState = "victory";
    playSound("victory");
    victoryScore.textContent = `Score: ${score}`;
    showScreen(victoryScreen);
  }
}

function drawGame() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // Draw player
  player.draw();
  // Draw player bullets
  for (let bullet of playerBullets) {
    if (bullet.active) {
      ctx.save();
      ctx.fillStyle = "#fff";
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      ctx.restore();
    }
  }
  // Draw aliens
  for (let alien of aliens) {
    if (alien.active) alien.draw();
  }
  // Draw alien bullets
  for (let bullet of alienBullets) {
    if (bullet.active) {
      ctx.save();
      ctx.fillStyle = "#f0f";
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      ctx.restore();
    }
  }
  // Draw bunkers
  for (let bunker of bunkers) {
    if (bunker.hp > 0) bunker.draw();
  }
}

function rectsCollide(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function showScreen(screen) {
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  victoryScreen.style.display = "none";
  screen.style.display = "block";
}
function hideScreens() {
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  victoryScreen.style.display = "none";
}

function updateHUD() {
  scoreEl.textContent = `SCORE: ${score}`;
  livesEl.textContent = `LIVES: ${lives}`;
  waveEl.textContent = `WAVE: ${wave}`;
}

function gameLoop(ts) {
  if (gameState === "playing") {
    updateGame();
    drawGame();
    updateHUD();
  }
  lastFrame = ts;
  requestAnimationFrame(gameLoop);
}

// Event listeners
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (gameState === "playing" && e.key === " ") {
    player.shoot();
  }
});
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});
startBtn.addEventListener("click", () => {
  hideScreens();
  resetGame();
  gameState = "playing";
});
restartBtn.addEventListener("click", () => {
  hideScreens();
  resetGame();
  gameState = "playing";
});
nextWaveBtn.addEventListener("click", () => {
  hideScreens();
  wave++;
  setupWave();
  gameState = "playing";
});

// Responsive canvas
function resizeCanvas() {
  let w = window.innerWidth;
  let h = window.innerHeight;
  let scale = Math.min(w / CANVAS_WIDTH, h / CANVAS_HEIGHT, 1);
  canvas.style.width = CANVAS_WIDTH * scale + "px";
  canvas.style.height = CANVAS_HEIGHT * scale + "px";
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Load font
const font = document.createElement("link");
font.rel = "stylesheet";
font.href =
  "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
document.head.appendChild(font);

// Start game loop
requestAnimationFrame(gameLoop);
