// Cosmic Drifter - Retro Space Shooter
// Core game logic

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

// Game constants
const PLAYER_SIZE = 32;
const ENEMY_SIZE = 28;
const BULLET_SIZE = 8;
const POWERUP_SIZE = 20;
const LEVELS = 10;
const COLORS = ["#fff", "#0ff", "#f0f", "#ff0", "#08f", "#f80", "#0f0", "#f00"];

// Game state
let player,
  enemies,
  bullets,
  powerups,
  level,
  score,
  lives,
  gameOver,
  boss,
  hazards;
let keys = {};
let lastTime = 0;
let mobile = window.matchMedia("(pointer: coarse)").matches;

// Utility
function rand(a, b) {
  return Math.random() * (b - a) + a;
}
function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

function resetGame() {
  player = {
    x: W / 2,
    y: H - 80,
    vx: 0,
    vy: 0,
    speed: 4,
    cooldown: 0,
    power: 1,
    shield: 0,
  };
  enemies = [];
  bullets = [];
  powerups = [];
  hazards = [];
  level = 1;
  score = 0;
  lives = 3;
  gameOver = false;
  boss = null;
  spawnEnemies();
}

function spawnEnemies() {
  enemies = [];
  hazards = [];
  let n = 4 + level * 2;
  for (let i = 0; i < n; i++) {
    let type =
      level >= 3 && i % 3 === 0
        ? "seeker"
        : level >= 5 && i % 5 === 0
        ? "shooter"
        : "drone";
    enemies.push({
      x: rand(ENEMY_SIZE, W - ENEMY_SIZE),
      y: rand(-200, -ENEMY_SIZE),
      vx: 0,
      vy: rand(1, 2 + level * 0.2),
      type,
      hp: type === "boss" ? 20 : 2 + level * 0.5,
      cooldown: 0,
    });
  }
  // Hazards
  for (let i = 0; i < level; i++) {
    hazards.push({
      x: rand(POWERUP_SIZE, W - POWERUP_SIZE),
      y: rand(-400, -POWERUP_SIZE),
      vx: rand(-1, 1),
      vy: rand(1, 2),
      type: "asteroid",
      size: rand(18, 32),
    });
  }
  // Boss every 5th/10th level
  if (level === 5 || level === 10) {
    boss = {
      x: W / 2 - 48,
      y: -96,
      vx: 0,
      vy: 1.2 + level * 0.2,
      hp: 40 + level * 8,
      cooldown: 0,
      type: "boss",
    };
  }
}

function spawnPowerup() {
  let types = ["shield", "double", "speed", "score"];
  let type = types[Math.floor(rand(0, types.length))];
  powerups.push({
    x: rand(POWERUP_SIZE, W - POWERUP_SIZE),
    y: -POWERUP_SIZE,
    vy: 2,
    type,
  });
}

function drawPixelArt() {
  // Background
  ctx.fillStyle = "#181828";
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = COLORS[i % COLORS.length] + "44";
    ctx.fillRect(rand(0, W), rand(0, H), 2, 2);
  }
  // CRT scanlines
  ctx.globalAlpha = 0.12;
  for (let y = 0; y < H; y += 3) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, y, W, 1);
  }
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = "#0ff";
  ctx.beginPath();
  ctx.moveTo(0, -PLAYER_SIZE / 2);
  ctx.lineTo(-PLAYER_SIZE / 2, PLAYER_SIZE / 2);
  ctx.lineTo(PLAYER_SIZE / 2, PLAYER_SIZE / 2);
  ctx.closePath();
  ctx.fill();
  // Thruster
  ctx.fillStyle = "#ff0";
  ctx.fillRect(-6, PLAYER_SIZE / 2, 12, 8);
  // Shield
  if (player.shield > 0) {
    ctx.strokeStyle = "#0f0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_SIZE / 2 + 6, 0, 2 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEnemies() {
  enemies.forEach((e) => {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.fillStyle =
      e.type === "seeker" ? "#f0f" : e.type === "shooter" ? "#f80" : "#fff";
    ctx.beginPath();
    ctx.arc(0, 0, ENEMY_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  });
  if (boss) {
    ctx.save();
    ctx.translate(boss.x, boss.y);
    ctx.fillStyle = "#f00";
    ctx.fillRect(-48, -32, 96, 64);
    ctx.fillStyle = "#fff";
    ctx.fillRect(-24, -16, 48, 32);
    ctx.restore();
  }
}

function drawBullets() {
  bullets.forEach((b) => {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.fillStyle = b.friendly ? "#0ff" : "#f80";
    ctx.fillRect(-BULLET_SIZE / 2, -BULLET_SIZE / 2, BULLET_SIZE, BULLET_SIZE);
    ctx.restore();
  });
}

function drawPowerups() {
  powerups.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle =
      p.type === "shield"
        ? "#0f0"
        : p.type === "double"
        ? "#ff0"
        : p.type === "speed"
        ? "#08f"
        : "#fff";
    ctx.beginPath();
    ctx.arc(0, 0, POWERUP_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  });
}

function drawHazards() {
  hazards.forEach((h) => {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.fillStyle = "#888";
    ctx.beginPath();
    ctx.arc(0, 0, h.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  });
}

function drawUI() {
  ctx.fillStyle = "#fff";
  ctx.font = "20px monospace";
  ctx.fillText("Level: " + level, 16, 32);
  ctx.fillText("Score: " + score, W - 160, 32);
  ctx.fillText("Lives: " + lives, 16, 60);
}

function updatePlayer() {
  let moveX = 0,
    moveY = 0;
  if (keys["ArrowLeft"]) moveX -= 1;
  if (keys["ArrowRight"]) moveX += 1;
  if (keys["ArrowUp"]) moveY -= 1;
  if (keys["ArrowDown"]) moveY += 1;
  if (mobile) {
    if (keys["left"]) moveX -= 1;
    if (keys["right"]) moveX += 1;
    if (keys["up"]) moveY -= 1;
    if (keys["down"]) moveY += 1;
  }
  let speed = player.speed + (player.speedBoost ? 2 : 0);
  player.x += moveX * speed;
  player.y += moveY * speed;
  // Screen wrap
  if (player.x < 0) player.x = W;
  if (player.x > W) player.x = 0;
  player.y = clamp(player.y, PLAYER_SIZE / 2, H - PLAYER_SIZE / 2);
  // Shooting
  if ((keys[" "] || keys["fire"]) && player.cooldown <= 0) {
    shootBullet();
    player.cooldown = player.power > 1 ? 8 : 12;
  }
  if (player.cooldown > 0) player.cooldown--;
}

function shootBullet() {
  bullets.push({
    x: player.x,
    y: player.y - PLAYER_SIZE / 2,
    vx: 0,
    vy: -8,
    friendly: true,
  });
  if (player.power > 1) {
    bullets.push({
      x: player.x - 12,
      y: player.y - PLAYER_SIZE / 2,
      vx: -1,
      vy: -8,
      friendly: true,
    });
    bullets.push({
      x: player.x + 12,
      y: player.y - PLAYER_SIZE / 2,
      vx: 1,
      vy: -8,
      friendly: true,
    });
  }
}

function updateEnemies() {
  enemies.forEach((e) => {
    if (e.type === "seeker") {
      let dx = player.x - e.x,
        dy = player.y - e.y;
      let d = Math.sqrt(dx * dx + dy * dy);
      e.vx += clamp(dx / d, -0.2, 0.2);
      e.vy += clamp(dy / d, -0.2, 0.2);
    }
    e.x += e.vx;
    e.y += e.vy;
    // Shooters fire
    if (e.type === "shooter" && e.cooldown <= 0) {
      bullets.push({
        x: e.x,
        y: e.y + ENEMY_SIZE / 2,
        vx: 0,
        vy: 4,
        friendly: false,
      });
      e.cooldown = 60 - level * 2;
    }
    if (e.cooldown > 0) e.cooldown--;
  });
  // Remove offscreen
  enemies = enemies.filter((e) => e.y < H + ENEMY_SIZE && e.hp > 0);
  // Boss
  if (boss) {
    boss.y += boss.vy;
    if (boss.cooldown <= 0) {
      for (let i = -2; i <= 2; i++) {
        bullets.push({
          x: boss.x + 48 + i * 16,
          y: boss.y + 32,
          vx: i,
          vy: 4,
          friendly: false,
        });
      }
      boss.cooldown = 40;
    }
    if (boss.cooldown > 0) boss.cooldown--;
    if (boss.y > H / 3) boss.vy = 0;
  }
}

function updateBullets() {
  bullets.forEach((b) => {
    b.x += b.vx;
    b.y += b.vy;
  });
  bullets = bullets.filter(
    (b) =>
      b.x > -BULLET_SIZE &&
      b.x < W + BULLET_SIZE &&
      b.y > -BULLET_SIZE &&
      b.y < H + BULLET_SIZE
  );
}

function updatePowerups() {
  powerups.forEach((p) => {
    p.y += p.vy;
  });
  powerups = powerups.filter((p) => p.y < H + POWERUP_SIZE);
}

function updateHazards() {
  hazards.forEach((h) => {
    h.x += h.vx;
    h.y += h.vy;
  });
  hazards = hazards.filter((h) => h.y < H + h.size);
}

function checkCollisions() {
  // Player vs enemies
  enemies.forEach((e) => {
    if (
      Math.abs(player.x - e.x) < (PLAYER_SIZE + ENEMY_SIZE) / 2 &&
      Math.abs(player.y - e.y) < (PLAYER_SIZE + ENEMY_SIZE) / 2
    ) {
      if (player.shield > 0) {
        player.shield = 0;
        e.hp = 0;
        score += 50;
      } else loseLife();
    }
  });
  // Player vs hazards
  hazards.forEach((h) => {
    if (
      Math.abs(player.x - h.x) < (PLAYER_SIZE + h.size) / 2 &&
      Math.abs(player.y - h.y) < (PLAYER_SIZE + h.size) / 2
    ) {
      if (player.shield > 0) {
        player.shield = 0;
        h.y = H + 100;
        score += 20;
      } else loseLife();
    }
  });
  // Player vs powerups
  powerups.forEach((p) => {
    if (
      Math.abs(player.x - p.x) < (PLAYER_SIZE + POWERUP_SIZE) / 2 &&
      Math.abs(player.y - p.y) < (PLAYER_SIZE + POWERUP_SIZE) / 2
    ) {
      collectPowerup(p.type);
      p.y = H + 100;
    }
  });
  // Bullets vs enemies
  bullets.forEach((b) => {
    if (!b.friendly) return;
    enemies.forEach((e) => {
      if (
        Math.abs(b.x - e.x) < (BULLET_SIZE + ENEMY_SIZE) / 2 &&
        Math.abs(b.y - e.y) < (BULLET_SIZE + ENEMY_SIZE) / 2
      ) {
        e.hp--;
        b.y = -100;
        if (e.hp <= 0) score += 20;
      }
    });
    if (boss && Math.abs(b.x - boss.x) < 60 && Math.abs(b.y - boss.y) < 40) {
      boss.hp--;
      b.y = -100;
      if (boss.hp <= 0) {
        score += 200;
        boss = null;
      }
    }
  });
  // Bullets vs player
  bullets.forEach((b) => {
    if (b.friendly) return;
    if (
      Math.abs(b.x - player.x) < (BULLET_SIZE + PLAYER_SIZE) / 2 &&
      Math.abs(b.y - player.y) < (BULLET_SIZE + PLAYER_SIZE) / 2
    ) {
      if (player.shield > 0) {
        player.shield = 0;
        b.y = -100;
      } else loseLife();
    }
  });
}

function loseLife() {
  lives--;
  if (lives <= 0) {
    gameOver = true;
    document.getElementById("game-over").classList.remove("hidden");
  } else {
    player.x = W / 2;
    player.y = H - 80;
    player.shield = 0;
  }
}

function collectPowerup(type) {
  if (type === "shield") player.shield = 1;
  if (type === "double") player.power = 3;
  setTimeout(() => (player.power = 1), 6000);
  if (type === "speed") player.speedBoost = 1;
  setTimeout(() => (player.speedBoost = 0), 6000);
  if (type === "score") score += 100;
}

function nextLevel() {
  level++;
  if (level > LEVELS) {
    gameOver = true;
    document.getElementById("game-over").classList.remove("hidden");
    document.querySelector("#game-over h2").textContent = "You Win!";
    return;
  }
  spawnEnemies();
  if (rand(0, 1) > 0.5) spawnPowerup();
}

function gameLoop(ts) {
  if (!lastTime) lastTime = ts;
  let dt = Math.min((ts - lastTime) / 16.67, 2); // ~60fps
  lastTime = ts;
  if (!gameOver) {
    updatePlayer();
    updateEnemies();
    updateBullets();
    updatePowerups();
    updateHazards();
    checkCollisions();
    if (enemies.length === 0 && !boss) {
      nextLevel();
    }
    if (rand(0, 1) < 0.01 + level * 0.002) spawnPowerup();
  }
  drawPixelArt();
  drawPlayer();
  drawEnemies();
  drawBullets();
  drawPowerups();
  drawHazards();
  drawUI();
  requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener("keydown", (e) => {
  if (
    e.key === " " ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "ArrowUp" ||
    e.key === "ArrowDown"
  ) {
    keys[e.key] = true;
    e.preventDefault();
  }
});
window.addEventListener("keyup", (e) => {
  if (
    e.key === " " ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "ArrowUp" ||
    e.key === "ArrowDown"
  ) {
    keys[e.key] = false;
    e.preventDefault();
  }
});
// Mobile controls
["left", "right", "up", "down", "fire"].forEach((id) => {
  let btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("touchstart", () => {
      keys[id] = true;
    });
    btn.addEventListener("touchend", () => {
      keys[id] = false;
    });
    btn.addEventListener("mousedown", () => {
      keys[id] = true;
    });
    btn.addEventListener("mouseup", () => {
      keys[id] = false;
    });
  }
});
// Restart
const restartBtn = document.getElementById("restart");
if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    document.getElementById("game-over").classList.add("hidden");
    resetGame();
  });
}

// Show mobile controls if needed
if (mobile) {
  document.getElementById("mobile-controls").classList.remove("hidden");
}

resetGame();
requestAnimationFrame(gameLoop);
