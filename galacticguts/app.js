// Game state and configuration
const gameConfig = {
  canvas: null,
  ctx: null,
  gameRunning: false,
  gamePaused: false,
  lastTime: 0,
  deltaTime: 0,
  targetFPS: 60,
  frameTime: 1000 / 60,

  // Game dimensions
  width: 800,
  height: 600,

  // Game state
  score: 0,
  level: 1,
  lives: 3,
  maxLevel: 10,

  // Player
  player: {
    x: 400,
    y: 500,
    width: 40,
    height: 40,
    speed: 300,
    color: "#00ff00",
  },

  // Arrays for game objects
  bullets: [],
  enemies: [],
  powerUps: [],
  particles: [],

  // Input handling
  keys: {},
  mobileControls: {
    up: false,
    down: false,
    left: false,
    right: false,
    fire: false,
  },

  // Timing
  lastShot: 0,
  shotCooldown: 200,
  enemySpawnTimer: 0,
  enemySpawnRate: 1000,
  powerUpSpawnTimer: 0,
  powerUpSpawnRate: 5000,
};

// Enemy patterns and configurations
const enemyTypes = {
  basic: {
    width: 30,
    height: 30,
    speed: 100,
    health: 1,
    points: 10,
    color: "#ff0066",
  },
  fast: {
    width: 25,
    height: 25,
    speed: 200,
    health: 1,
    points: 20,
    color: "#ffff00",
  },
  tank: {
    width: 40,
    height: 40,
    speed: 50,
    health: 3,
    points: 50,
    color: "#ff6600",
  },
  zigzag: {
    width: 35,
    height: 35,
    speed: 150,
    health: 2,
    points: 30,
    color: "#ff00ff",
  },
};

// Power-up types
const powerUpTypes = {
  rapidFire: {
    width: 20,
    height: 20,
    color: "#00ffff",
    duration: 3000,
    effect: "rapidFire",
  },
  multiShot: {
    width: 20,
    height: 20,
    color: "#ffff00",
    duration: 4000,
    effect: "multiShot",
  },
  shield: {
    width: 20,
    height: 20,
    color: "#00ff00",
    duration: 5000,
    effect: "shield",
  },
};

// Initialize the game
function initGame() {
  gameConfig.canvas = document.getElementById("gameCanvas");
  gameConfig.ctx = gameConfig.canvas.getContext("2d");

  // Set canvas size
  gameConfig.canvas.width = gameConfig.width;
  gameConfig.canvas.height = gameConfig.height;

  // Initialize event listeners
  setupEventListeners();

  // Start game loop
  gameConfig.gameRunning = true;
  requestAnimationFrame(gameLoop);

  // Show mobile controls on touch devices
  detectMobileDevice();
}

// Detect mobile device
function detectMobileDevice() {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  if (isMobile) {
    document.getElementById("mobileControls").style.display = "block";
  }
}

// Setup event listeners
function setupEventListeners() {
  // Keyboard controls
  document.addEventListener("keydown", (e) => {
    gameConfig.keys[e.code] = true;
    if (e.code === "Space") {
      e.preventDefault();
      shoot();
    }
  });

  document.addEventListener("keyup", (e) => {
    gameConfig.keys[e.code] = false;
  });

  // Mobile controls
  setupMobileControls();

  // Restart button
  document.getElementById("restartBtn").addEventListener("click", restartGame);
}

// Setup mobile controls
function setupMobileControls() {
  const controls = {
    upBtn: "up",
    downBtn: "down",
    leftBtn: "left",
    rightBtn: "right",
    fireBtn: "fire",
  };

  Object.keys(controls).forEach((btnId) => {
    const btn = document.getElementById(btnId);
    const control = controls[btnId];

    // Touch events
    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      gameConfig.mobileControls[control] = true;
      if (control === "fire") {
        shoot();
      }
    });

    btn.addEventListener("touchend", (e) => {
      e.preventDefault();
      gameConfig.mobileControls[control] = false;
    });

    // Mouse events for desktop testing
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      gameConfig.mobileControls[control] = true;
      if (control === "fire") {
        shoot();
      }
    });

    btn.addEventListener("mouseup", (e) => {
      e.preventDefault();
      gameConfig.mobileControls[control] = false;
    });
  });
}

// Main game loop
function gameLoop(currentTime) {
  if (!gameConfig.gameRunning) return;

  // Calculate delta time for consistent frame rate
  gameConfig.deltaTime = Math.min(
    (currentTime - gameConfig.lastTime) / 1000,
    1 / 30
  );
  gameConfig.lastTime = currentTime;

  // Update game
  update(gameConfig.deltaTime);

  // Render game
  render();

  // Continue loop
  requestAnimationFrame(gameLoop);
}

// Update game state
function update(deltaTime) {
  if (gameConfig.gamePaused) return;

  // Update player
  updatePlayer(deltaTime);

  // Update game objects
  updateBullets(deltaTime);
  updateEnemies(deltaTime);
  updatePowerUps(deltaTime);
  updateParticles(deltaTime);

  // Spawn enemies
  spawnEnemies(deltaTime);

  // Spawn power-ups
  spawnPowerUps(deltaTime);

  // Check collisions
  checkCollisions();

  // Check level progression
  checkLevelProgression();

  // Update UI
  updateUI();
}

// Update player
function updatePlayer(deltaTime) {
  const player = gameConfig.player;
  const speed = player.speed * deltaTime;

  // Handle input
  if (gameConfig.keys["ArrowLeft"] || gameConfig.mobileControls.left) {
    player.x = Math.max(0, player.x - speed);
  }
  if (gameConfig.keys["ArrowRight"] || gameConfig.mobileControls.right) {
    player.x = Math.min(gameConfig.width - player.width, player.x + speed);
  }
  if (gameConfig.keys["ArrowUp"] || gameConfig.mobileControls.up) {
    player.y = Math.max(0, player.y - speed);
  }
  if (gameConfig.keys["ArrowDown"] || gameConfig.mobileControls.down) {
    player.y = Math.min(gameConfig.height - player.height, player.y + speed);
  }

  // Handle mobile fire button
  if (gameConfig.mobileControls.fire) {
    shoot();
  }
}

// Shooting mechanism
function shoot() {
  const now = Date.now();
  if (now - gameConfig.lastShot < gameConfig.shotCooldown) return;

  gameConfig.lastShot = now;

  // Create bullet
  gameConfig.bullets.push({
    x: gameConfig.player.x + gameConfig.player.width / 2 - 2,
    y: gameConfig.player.y,
    width: 4,
    height: 10,
    speed: 500,
    color: "#00ff00",
  });
}

// Update bullets
function updateBullets(deltaTime) {
  gameConfig.bullets = gameConfig.bullets.filter((bullet) => {
    bullet.y -= bullet.speed * deltaTime;
    return bullet.y > -bullet.height;
  });
}

// Spawn enemies
function spawnEnemies(deltaTime) {
  gameConfig.enemySpawnTimer += deltaTime * 1000;

  if (gameConfig.enemySpawnTimer >= gameConfig.enemySpawnRate) {
    gameConfig.enemySpawnTimer = 0;

    // Determine enemy type based on level
    const types = Object.keys(enemyTypes);
    let enemyType = "basic";

    if (gameConfig.level >= 3) types.push("fast");
    if (gameConfig.level >= 5) types.push("tank");
    if (gameConfig.level >= 7) types.push("zigzag");

    enemyType = types[Math.floor(Math.random() * types.length)];
    const enemy = { ...enemyTypes[enemyType] };

    enemy.x = Math.random() * (gameConfig.width - enemy.width);
    enemy.y = -enemy.height;
    enemy.type = enemyType;
    enemy.zigzagDirection = Math.random() > 0.5 ? 1 : -1;
    enemy.originalX = enemy.x;

    gameConfig.enemies.push(enemy);

    // Increase spawn rate with level
    gameConfig.enemySpawnRate = Math.max(300, 1000 - gameConfig.level * 50);
  }
}

// Update enemies
function updateEnemies(deltaTime) {
  gameConfig.enemies = gameConfig.enemies.filter((enemy) => {
    // Movement patterns
    switch (enemy.type) {
      case "zigzag":
        enemy.y += enemy.speed * deltaTime;
        enemy.x +=
          Math.sin(enemy.y * 0.01) * enemy.zigzagDirection * 100 * deltaTime;
        enemy.x = Math.max(
          0,
          Math.min(gameConfig.width - enemy.width, enemy.x)
        );
        break;
      default:
        enemy.y += enemy.speed * deltaTime;
        break;
    }

    return enemy.y < gameConfig.height + enemy.height;
  });
}

// Spawn power-ups
function spawnPowerUps(deltaTime) {
  gameConfig.powerUpSpawnTimer += deltaTime * 1000;

  if (gameConfig.powerUpSpawnTimer >= gameConfig.powerUpSpawnRate) {
    gameConfig.powerUpSpawnTimer = 0;

    const types = Object.keys(powerUpTypes);
    const type = types[Math.floor(Math.random() * types.length)];
    const powerUp = { ...powerUpTypes[type] };

    powerUp.x = Math.random() * (gameConfig.width - powerUp.width);
    powerUp.y = -powerUp.height;
    powerUp.type = type;

    gameConfig.powerUps.push(powerUp);
  }
}

// Update power-ups
function updatePowerUps(deltaTime) {
  gameConfig.powerUps = gameConfig.powerUps.filter((powerUp) => {
    powerUp.y += 100 * deltaTime;
    return powerUp.y < gameConfig.height + powerUp.height;
  });
}

// Update particles
function updateParticles(deltaTime) {
  gameConfig.particles = gameConfig.particles.filter((particle) => {
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    particle.life -= deltaTime;
    return particle.life > 0;
  });
}

// Check collisions
function checkCollisions() {
  // Bullet vs Enemy collisions
  gameConfig.bullets.forEach((bullet, bulletIndex) => {
    gameConfig.enemies.forEach((enemy, enemyIndex) => {
      if (isColliding(bullet, enemy)) {
        // Create explosion particles
        createExplosion(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2,
          enemy.color
        );

        // Damage enemy
        enemy.health--;
        if (enemy.health <= 0) {
          gameConfig.score += enemy.points;
          gameConfig.enemies.splice(enemyIndex, 1);
        }

        // Remove bullet
        gameConfig.bullets.splice(bulletIndex, 1);
      }
    });
  });

  // Player vs Enemy collisions
  gameConfig.enemies.forEach((enemy, enemyIndex) => {
    if (isColliding(gameConfig.player, enemy)) {
      // Create explosion
      createExplosion(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2,
        "#ff0066"
      );

      // Remove enemy and lose life
      gameConfig.enemies.splice(enemyIndex, 1);
      gameConfig.lives--;

      if (gameConfig.lives <= 0) {
        gameOver();
      }
    }
  });

  // Player vs Power-up collisions
  gameConfig.powerUps.forEach((powerUp, powerUpIndex) => {
    if (isColliding(gameConfig.player, powerUp)) {
      // Apply power-up effect (simplified for this implementation)
      if (powerUp.type === "rapidFire") {
        gameConfig.shotCooldown = 100;
        setTimeout(() => {
          gameConfig.shotCooldown = 200;
        }, powerUp.duration);
      }

      gameConfig.powerUps.splice(powerUpIndex, 1);
      gameConfig.score += 25;
    }
  });
}

// Collision detection
function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// Create explosion particles
function createExplosion(x, y, color) {
  for (let i = 0; i < 8; i++) {
    gameConfig.particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200,
      color: color,
      life: 0.5,
    });
  }
}

// Check level progression
function checkLevelProgression() {
  if (
    gameConfig.enemies.length === 0 &&
    gameConfig.score >= gameConfig.level * 100
  ) {
    if (gameConfig.level >= gameConfig.maxLevel) {
      // Game completed!
      alert("Congratulations! You completed all levels!");
      gameOver();
    } else {
      gameConfig.level++;
      // Bonus points for completing level
      gameConfig.score += 100;
    }
  }
}

// Update UI
function updateUI() {
  document.getElementById("score").textContent = gameConfig.score;
  document.getElementById("level").textContent = gameConfig.level;
  document.getElementById("lives").textContent = gameConfig.lives;
}

// Render game
function render() {
  const ctx = gameConfig.ctx;

  // Clear canvas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, gameConfig.width, gameConfig.height);

  // Draw stars background
  drawStars();

  // Draw player
  ctx.fillStyle = gameConfig.player.color;
  ctx.fillRect(
    gameConfig.player.x,
    gameConfig.player.y,
    gameConfig.player.width,
    gameConfig.player.height
  );

  // Draw bullets
  gameConfig.bullets.forEach((bullet) => {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  // Draw enemies
  gameConfig.enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    // Draw health indicator for tanks
    if (enemy.health > 1) {
      ctx.fillStyle = "#fff";
      ctx.font = "12px Courier New";
      ctx.fillText(enemy.health.toString(), enemy.x + 5, enemy.y - 5);
    }
  });

  // Draw power-ups
  gameConfig.powerUps.forEach((powerUp) => {
    ctx.fillStyle = powerUp.color;
    ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
  });

  // Draw particles
  gameConfig.particles.forEach((particle) => {
    ctx.globalAlpha = particle.life / 0.5;
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
    ctx.globalAlpha = 1;
  });
}

// Draw animated star field
let stars = [];
function drawStars() {
  const ctx = gameConfig.ctx;

  // Initialize stars
  if (stars.length === 0) {
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * gameConfig.width,
        y: Math.random() * gameConfig.height,
        speed: Math.random() * 50 + 25,
      });
    }
  }

  // Update and draw stars
  stars.forEach((star) => {
    star.y += star.speed * gameConfig.deltaTime;
    if (star.y > gameConfig.height) {
      star.y = 0;
      star.x = Math.random() * gameConfig.width;
    }

    ctx.fillStyle = "#444";
    ctx.fillRect(star.x, star.y, 1, 1);
  });
}

// Game over
function gameOver() {
  gameConfig.gameRunning = false;
  document.getElementById("finalScore").textContent = gameConfig.score;
  document.getElementById("finalLevel").textContent = gameConfig.level;
  document.getElementById("gameOverScreen").classList.remove("hidden");
}

// Restart game
function restartGame() {
  // Reset game state
  gameConfig.score = 0;
  gameConfig.level = 1;
  gameConfig.lives = 3;
  gameConfig.bullets = [];
  gameConfig.enemies = [];
  gameConfig.powerUps = [];
  gameConfig.particles = [];
  gameConfig.enemySpawnTimer = 0;
  gameConfig.powerUpSpawnTimer = 0;
  gameConfig.shotCooldown = 200;

  // Reset player position
  gameConfig.player.x = 400;
  gameConfig.player.y = 500;

  // Hide game over screen
  document.getElementById("gameOverScreen").classList.add("hidden");

  // Restart game
  gameConfig.gameRunning = true;
  gameConfig.lastTime = 0;
  requestAnimationFrame(gameLoop);

  // Update UI
  updateUI();
}

// Initialize game when page loads
document.addEventListener("DOMContentLoaded", initGame);
