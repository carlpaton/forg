// Astro Jumper - Retro Arcade Platformer
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

// Game constants
const GRAVITY = 0.5;
const JUMP_VELOCITY = -10;
const PLAYER_SPEED = 4;
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 16;
const PLATFORM_GAP = 100;
const COLORS = {
  bg: "#181825",
  player: "#f8e71c",
  platform: "#2e2e4d",
  enemy: "#e74c3c",
  powerup: "#00eaff",
  text: "#fff",
};

// Game state
let player = {
  x: W / 2 - 16,
  y: H - 80,
  w: 32,
  h: 32,
  vx: 0,
  vy: 0,
  onGround: false,
  alive: true,
  score: 0,
  power: null,
  powerTimer: 0,
};
let platforms = [];
let enemies = [];
let powerups = [];
let keys = {};
let gameOver = false;
let cameraY = 0;
let checkpointY = H - 80;
let level = 1;
let maxLevel = 10;
let levelWin = false;

function resetGame(newLevel = 1) {
  level = newLevel;
  levelWin = false;
  platforms = [];
  enemies = [];
  powerups = [];
  gameOver = false;
  generatePlatforms();
  // Place player above the first platform
  if (platforms.length > 0) {
    player.x = platforms[0].x + platforms[0].w / 2 - player.w / 2;
    player.y = platforms[0].y - player.h;
    checkpointY = platforms[0].y;
  } else {
    player.x = W / 2 - 16;
    player.y = H - 80;
    checkpointY = H - 80;
  }
  player.vx = 0;
  player.vy = 0;
  player.onGround = true;
  player.alive = true;
  player.score = 0;
  player.power = null;
  player.powerTimer = 0;
  cameraY = 0;
}

function generatePlatforms() {
  let y = H - 40;
  let gap = PLATFORM_GAP - (level - 1) * 7; // platforms further apart each level
  let numPlatforms = 12 + Math.floor(level / 2); // more platforms for higher levels
  for (let i = 0; i < numPlatforms; i++) {
    let x = Math.random() * (W - PLATFORM_WIDTH);
    platforms.push({ x, y, w: PLATFORM_WIDTH, h: PLATFORM_HEIGHT });
    // Add enemies and powerups, more frequent and faster as level increases
    if (i > 2 && Math.random() < 0.15 + level * 0.03) {
      enemies.push({
        x: x + 20,
        y: y - 24,
        w: 24,
        h: 24,
        dir: Math.random() < 0.5 ? -1 : 1,
        speed: 2 + level * 0.5,
      });
    }
    if (i > 1 && Math.random() < 0.1 + level * 0.02) {
      powerups.push({ x: x + 40, y: y - 32, w: 16, h: 16, type: "jetpack" });
    }
    y -= gap;
  }
}

function drawPixelRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(
    Math.floor(x),
    Math.floor(y - cameraY),
    Math.floor(w),
    Math.floor(h)
  );
}

function draw() {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);
  // Platforms
  platforms.forEach((p) => drawPixelRect(p.x, p.y, p.w, p.h, COLORS.platform));
  // Enemies
  enemies.forEach((e) => drawPixelRect(e.x, e.y, e.w, e.h, COLORS.enemy));
  // Powerups
  powerups.forEach((pu) =>
    drawPixelRect(pu.x, pu.y, pu.w, pu.h, COLORS.powerup)
  );
  // Player
  drawPixelRect(player.x, player.y, player.w, player.h, COLORS.player);
  // Score & Level
  ctx.font = "16px monospace";
  ctx.fillStyle = COLORS.text;
  ctx.fillText("Score: " + player.score, 16, 32);
  ctx.fillText("Level: " + level, W - 120, 32);
  // Game Over
  if (gameOver) {
    ctx.font = "32px monospace";
    ctx.fillStyle = COLORS.text;
    ctx.fillText("GAME OVER", W / 2 - 80, H / 2);
    ctx.font = "16px monospace";
    ctx.fillText("Press Space or Jump to Restart", W / 2 - 120, H / 2 + 32);
  }
  // Level Win
  if (levelWin) {
    ctx.font = "32px monospace";
    ctx.fillStyle = COLORS.text;
    if (level < maxLevel) {
      ctx.fillText("LEVEL " + level + " COMPLETE!", W / 2 - 120, H / 2);
      ctx.font = "16px monospace";
      ctx.fillText(
        "Press Space or Jump for Next Level",
        W / 2 - 140,
        H / 2 + 32
      );
    } else {
      ctx.fillText("YOU WIN!", W / 2 - 80, H / 2);
    }
  }
}

function update() {
  if (!player.alive) return;
  // Horizontal movement
  if (keys["ArrowLeft"]) player.vx = -PLAYER_SPEED;
  else if (keys["ArrowRight"]) player.vx = PLAYER_SPEED;
  else player.vx = 0;
  player.x += player.vx;
  // Gravity
  player.vy += GRAVITY;
  player.y += player.vy;
  // Platform collision
  player.onGround = false;
  platforms.forEach((p) => {
    if (
      player.x + player.w > p.x &&
      player.x < p.x + p.w &&
      player.y + player.h > p.y &&
      player.y + player.h < p.y + p.h + 8 &&
      player.vy > 0
    ) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
      checkpointY = p.y;
      player.score += 10;
    }
  });
  // Enemy collision
  enemies.forEach((e) => {
    e.x += e.dir * (e.speed || 2);
    if (e.x < 0 || e.x + e.w > W) e.dir *= -1;
    if (
      player.x + player.w > e.x &&
      player.x < e.x + e.w &&
      player.y + player.h > e.y &&
      player.y < e.y + e.h
    ) {
      if (!player.power) {
        player.alive = false;
        gameOver = true;
      }
    }
  });
  // Level progression: if player reaches above the highest platform, go to next level
  if (
    !levelWin &&
    platforms.length > 0 &&
    player.y < platforms[platforms.length - 1].y - 100
  ) {
    if (level < maxLevel) {
      levelWin = true;
      player.alive = false;
    } else {
      levelWin = true;
      player.alive = false;
    }
  }
  // Powerup collision
  powerups.forEach((pu, i) => {
    if (
      player.x + player.w > pu.x &&
      player.x < pu.x + pu.w &&
      player.y + player.h > pu.y &&
      player.y < pu.y + pu.h
    ) {
      player.power = pu.type;
      player.powerTimer = 180;
      powerups.splice(i, 1);
    }
  });
  // Powerup effects
  if (player.power) {
    if (player.power === "jetpack") {
      // Allow double jump
      if (player.powerTimer > 0 && keys["Space"] && player.vy > -2) {
        player.vy = JUMP_VELOCITY * 1.2;
        player.powerTimer -= 1;
      }
    }
    player.powerTimer--;
    if (player.powerTimer <= 0) player.power = null;
  }
  // Boundaries
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > W) player.x = W - player.w;
  if (player.y > checkpointY + 200) {
    player.alive = false;
    gameOver = true;
  }
  // Camera follows player upward
  if (player.y < H / 2) cameraY = player.y - H / 2;
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (gameOver && (e.code === "Space" || e.code === "ArrowUp")) resetGame(1);
  if (levelWin && (e.code === "Space" || e.code === "ArrowUp")) {
    if (level < maxLevel) {
      resetGame(level + 1);
    } else {
      resetGame(1);
    }
  }
  if (player.onGround && (e.code === "Space" || e.code === "ArrowUp")) {
    player.vy = JUMP_VELOCITY - (level - 1) * 0.5; // slightly higher jump for higher levels
    player.onGround = false;
  }
});
window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});
// Mobile controls
const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");
const jumpBtn = document.getElementById("jump-btn");
if (leftBtn && rightBtn && jumpBtn) {
  leftBtn.addEventListener("touchstart", () => (keys["ArrowLeft"] = true));
  leftBtn.addEventListener("touchend", () => (keys["ArrowLeft"] = false));
  rightBtn.addEventListener("touchstart", () => (keys["ArrowRight"] = true));
  rightBtn.addEventListener("touchend", () => (keys["ArrowRight"] = false));
  jumpBtn.addEventListener("touchstart", () => {
    if (player.onGround) {
      player.vy = JUMP_VELOCITY - (level - 1) * 0.5;
      player.onGround = false;
    }
    if (gameOver) resetGame(1);
    if (levelWin) {
      if (level < maxLevel) {
        resetGame(level + 1);
      } else {
        resetGame(1);
      }
    }
  });
}

resetGame();
gameLoop();
