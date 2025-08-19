// Game state and configuration
class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = 800;
    this.canvas.height = 400;

    // Game timing for consistent speed across devices
    this.lastTime = 0;
    this.deltaTime = 0;
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;

    // Game state
    this.isPaused = false;
    this.isGameOver = false;
    this.score = 0;
    this.lives = 3;
    this.currentLevel = 1;
    this.crystalsCollected = 0;
    this.totalCrystals = 0;
    this.highScore = this.loadHighScore();
    this.isNewHighScore = false;

    // Input handling
    this.keys = {};
    this.touchControls = {
      left: false,
      right: false,
      jump: false,
      action: false,
    };

    // Game objects
    this.player = null;
    this.enemies = [];
    this.platforms = [];
    this.collectibles = [];
    this.powerups = [];
    this.puzzleElements = [];

    // Level data
    this.levels = this.createLevels();

    // Initialize
    this.initializeInput();
    this.loadLevel(this.currentLevel);
    this.detectMobile();
    this.gameLoop();
  }

  detectMobile() {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768;
    const mobileControls = document.getElementById("mobileControls");
    if (isMobile) {
      mobileControls.style.display = "flex";
    }
  }

  initializeInput() {
    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      if (e.code === "KeyP") {
        this.togglePause();
      }
      if (this.isPaused && e.code === "Space") {
        this.togglePause();
      }
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // Mobile touch controls
    const leftBtn = document.getElementById("leftBtn");
    const rightBtn = document.getElementById("rightBtn");
    const jumpBtn = document.getElementById("jumpBtn");
    const actionBtn = document.getElementById("actionBtn");
    const restartBtn = document.getElementById("restartBtn");

    // Touch event handlers
    this.addTouchControl(leftBtn, "left");
    this.addTouchControl(rightBtn, "right");
    this.addTouchControl(jumpBtn, "jump");
    this.addTouchControl(actionBtn, "action");

    restartBtn.addEventListener("click", () => this.restartGame());
  }

  addTouchControl(element, control) {
    element.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.touchControls[control] = true;
    });

    element.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.touchControls[control] = false;
    });

    element.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.touchControls[control] = true;
    });

    element.addEventListener("mouseup", (e) => {
      e.preventDefault();
      this.touchControls[control] = false;
    });
  }

  loadHighScore() {
    const saved = localStorage.getItem("retroAdventureHighScore");
    return saved ? parseInt(saved) : 0;
  }

  saveHighScore() {
    localStorage.setItem("retroAdventureHighScore", this.highScore.toString());
  }

  checkHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.isNewHighScore = true;
      this.saveHighScore();
      return true;
    }
    return false;
  }

  createLevels() {
    const levels = [];
    for (let i = 1; i <= 15; i++) {
      levels.push({
        level: i,
        difficulty: Math.min(i * 0.3, 3),
        enemyCount: Math.min(2 + Math.floor(i / 2), 8),
        crystalCount: 3 + Math.floor(i / 3),
        puzzleElements: Math.floor(i / 2),
        platformCount: 5 + Math.floor(i / 2),
        theme: this.getLevelTheme(i),
      });
    }
    return levels;
  }

  getLevelTheme(level) {
    const themes = ["forest", "cave", "castle", "sky", "underground"];
    return themes[Math.floor((level - 1) / 3) % themes.length];
  }

  loadLevel(levelNumber) {
    if (levelNumber > this.levels.length) {
      this.gameWin();
      return;
    }

    const levelData = this.levels[levelNumber - 1];
    this.currentLevel = levelNumber;
    this.crystalsCollected = 0;
    this.totalCrystals = levelData.crystalCount;

    // Reset game objects
    this.enemies = [];
    this.platforms = [];
    this.collectibles = [];
    this.powerups = [];
    this.puzzleElements = [];

    // Create player
    this.player = new Player(50, 300);

    // Generate platforms
    this.generatePlatforms(levelData);

    // Generate enemies
    this.generateEnemies(levelData);

    // Generate collectibles
    this.generateCollectibles(levelData);

    // Generate puzzle elements
    this.generatePuzzleElements(levelData);

    this.updateUI();
  }

  generatePlatforms(levelData) {
    // Ground platforms
    this.platforms.push(new Platform(0, 350, 200, 50, "ground"));
    this.platforms.push(new Platform(600, 350, 200, 50, "ground"));

    // Floating platforms
    for (let i = 0; i < levelData.platformCount; i++) {
      const x = 100 + i * 120 + Math.random() * 50;
      const y = 200 + Math.random() * 100;
      const width = 80 + Math.random() * 40;
      this.platforms.push(new Platform(x, y, width, 20, "floating"));
    }
  }

  generateEnemies(levelData) {
    for (let i = 0; i < levelData.enemyCount; i++) {
      const x = 200 + i * 100 + Math.random() * 50;
      const y = 320;
      const type = Math.random() < 0.5 ? "walker" : "jumper";
      this.enemies.push(new Enemy(x, y, type, levelData.difficulty));
    }
  }

  generateCollectibles(levelData) {
    // Crystals
    for (let i = 0; i < levelData.crystalCount; i++) {
      const x = 150 + i * 120 + Math.random() * 80;
      const y = 150 + Math.random() * 100;
      this.collectibles.push(new Collectible(x, y, "crystal", 100));
    }

    // Coins
    for (let i = 0; i < 8; i++) {
      const x = 100 + i * 90 + Math.random() * 50;
      const y = 200 + Math.random() * 150;
      this.collectibles.push(new Collectible(x, y, "coin", 10));
    }
  }

  generatePuzzleElements(levelData) {
    if (levelData.puzzleElements > 0) {
      // Switches and doors
      for (let i = 0; i < levelData.puzzleElements; i++) {
        const switchX = 200 + i * 200;
        const doorX = switchX + 100;
        const switchEl = new PuzzleElement(switchX, 320, "switch", i);
        const doorEl = new PuzzleElement(doorX, 250, "door", i);
        this.puzzleElements.push(switchEl, doorEl);
      }
    }
  }

  gameLoop(currentTime = 0) {
    this.deltaTime = currentTime - this.lastTime;

    if (this.deltaTime >= this.frameInterval) {
      if (!this.isPaused && !this.isGameOver) {
        this.update(this.deltaTime / 1000);
        this.render();
      }
      this.lastTime = currentTime;
    }

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(dt) {
    // Update player
    this.player.update(dt, this);

    // Update enemies
    this.enemies.forEach((enemy) => enemy.update(dt, this));

    // Update collectibles
    this.collectibles.forEach((collectible) => collectible.update(dt));

    // Check collisions
    this.checkCollisions();

    // Check level completion
    this.checkLevelCompletion();
  }

  checkCollisions() {
    // Player-platform collisions
    this.platforms.forEach((platform) => {
      if (this.player.checkCollision(platform)) {
        this.player.handlePlatformCollision(platform);
      }
    });

    // Player-enemy collisions
    this.enemies.forEach((enemy, index) => {
      if (this.player.checkCollision(enemy)) {
        if (this.player.velocity.y > 0 && this.player.y < enemy.y) {
          // Player jumped on enemy
          this.enemies.splice(index, 1);
          this.player.velocity.y = -200;
          this.score += 50;
        } else {
          // Player hit enemy
          this.playerHit();
        }
      }
    });

    // Player-collectible collisions
    this.collectibles.forEach((collectible, index) => {
      if (this.player.checkCollision(collectible)) {
        this.collectibles.splice(index, 1);
        this.score += collectible.points;
        if (collectible.type === "crystal") {
          this.crystalsCollected++;
        }
      }
    });

    // Player-puzzle element interactions
    this.puzzleElements.forEach((element) => {
      if (this.player.checkCollision(element) && this.getActionInput()) {
        element.interact(this);
      }
    });
  }

  checkLevelCompletion() {
    // Check if player reached end of level and collected all crystals
    if (this.player.x > 750 && this.crystalsCollected >= this.totalCrystals) {
      this.nextLevel();
    }

    // Check if player fell off the map
    if (this.player.y > 500) {
      this.playerHit();
    }
  }

  getMovementInput() {
    const left = this.keys["ArrowLeft"] || this.touchControls.left;
    const right = this.keys["ArrowRight"] || this.touchControls.right;
    return { left, right };
  }

  getJumpInput() {
    return this.keys["Space"] || this.touchControls.jump;
  }

  getActionInput() {
    return this.keys["Enter"] || this.touchControls.action;
  }

  playerHit() {
    this.lives--;
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Reset player position
      this.player.x = 50;
      this.player.y = 300;
      this.player.velocity = { x: 0, y: 0 };
      this.player.jumpsRemaining = this.player.maxJumps; // Reset jumps on respawn
    }
    this.updateUI();
  }

  nextLevel() {
    this.score += this.crystalsCollected * 50;
    this.loadLevel(this.currentLevel + 1);
  }

  gameOver() {
    this.isGameOver = true;
    const previousHighScore = this.highScore;
    const isNewHigh = this.checkHighScore();

    document.getElementById("gameOverTitle").textContent = "Game Over!";
    document.getElementById("gameOverMessage").textContent =
      "Your adventure ends here...";
    document.getElementById("finalScore").textContent = this.score;

    // Show high score messages if applicable
    if (isNewHigh) {
      document.getElementById("highScoreMessage").style.display = "block";
      document.getElementById("previousHighScore").style.display = "block";
      document.getElementById("previousHighScoreValue").textContent =
        previousHighScore;
    } else {
      document.getElementById("highScoreMessage").style.display = "none";
      document.getElementById("previousHighScore").style.display = "none";
    }

    document.getElementById("gameOverScreen").style.display = "flex";
  }

  gameWin() {
    this.isGameOver = true;
    const previousHighScore = this.highScore;
    const isNewHigh = this.checkHighScore();

    document.getElementById("gameOverTitle").textContent = "Victory!";
    document.getElementById("gameOverMessage").textContent =
      "You completed all levels!";
    document.getElementById("finalScore").textContent = this.score;

    // Show high score messages if applicable
    if (isNewHigh) {
      document.getElementById("highScoreMessage").style.display = "block";
      document.getElementById("previousHighScore").style.display = "block";
      document.getElementById("previousHighScoreValue").textContent =
        previousHighScore;
    } else {
      document.getElementById("highScoreMessage").style.display = "none";
      document.getElementById("previousHighScore").style.display = "none";
    }

    document.getElementById("gameOverScreen").style.display = "flex";
  }

  restartGame() {
    this.isGameOver = false;
    this.score = 0;
    this.lives = 3;
    this.currentLevel = 1;
    this.crystalsCollected = 0;
    this.isNewHighScore = false;
    document.getElementById("gameOverScreen").style.display = "none";
    this.loadLevel(1);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseScreen = document.getElementById("pauseScreen");
    pauseScreen.style.display = this.isPaused ? "flex" : "none";
  }

  updateUI() {
    document.getElementById("score").textContent = this.score;
    document.getElementById("highScore").textContent = this.highScore;
    document.getElementById("level").textContent = this.currentLevel;
    document.getElementById("lives").textContent = this.lives;
    document.getElementById(
      "crystals"
    ).textContent = `${this.crystalsCollected}/${this.totalCrystals}`;
  }

  render() {
    // Clear canvas with gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#98FB98");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render platforms
    this.platforms.forEach((platform) => platform.render(this.ctx));

    // Render collectibles
    this.collectibles.forEach((collectible) => collectible.render(this.ctx));

    // Render puzzle elements
    this.puzzleElements.forEach((element) => element.render(this.ctx));

    // Render enemies
    this.enemies.forEach((enemy) => enemy.render(this.ctx));

    // Render player
    this.player.render(this.ctx);

    // Render level goal indicator
    this.renderGoal();
  }

  renderGoal() {
    this.ctx.fillStyle = "#FFD700";
    this.ctx.fillRect(750, 300, 50, 50);
    this.ctx.fillStyle = "#000";
    this.ctx.font = "12px monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillText("GOAL", 775, 330);
  }
}

// Player class
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.velocity = { x: 0, y: 0 };
    this.speed = 200;
    this.jumpPower = 300;
    this.grounded = false;
    this.color = "#FF6B6B";
    this.maxJumps = 2; // Allow double jump
    this.jumpsRemaining = this.maxJumps;
    this.jumpPressed = false; // Track jump input to prevent holding
  }

  update(dt, game) {
    const input = game.getMovementInput();
    const jumpInput = game.getJumpInput();

    // Horizontal movement
    if (input.left) {
      this.velocity.x = -this.speed;
    } else if (input.right) {
      this.velocity.x = this.speed;
    } else {
      this.velocity.x *= 0.8; // Friction
    }

    // Double jumping logic
    if (jumpInput && !this.jumpPressed && this.jumpsRemaining > 0) {
      this.velocity.y = -this.jumpPower;
      this.jumpsRemaining--;
      this.grounded = false;
      this.jumpPressed = true;
    }

    // Reset jump input tracking when key is released
    if (!jumpInput) {
      this.jumpPressed = false;
    }

    // Gravity
    this.velocity.y += 800 * dt;

    // Update position
    this.x += this.velocity.x * dt;
    this.y += this.velocity.y * dt;

    // Keep player in bounds
    if (this.x < 0) this.x = 0;
    if (this.x > 800 - this.width) this.x = 800 - this.width;
  }

  checkCollision(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  handlePlatformCollision(platform) {
    const overlapX = Math.min(
      this.x + this.width - platform.x,
      platform.x + platform.width - this.x
    );
    const overlapY = Math.min(
      this.y + this.height - platform.y,
      platform.y + platform.height - this.y
    );

    if (overlapX < overlapY) {
      // Horizontal collision
      if (this.x < platform.x) {
        this.x = platform.x - this.width;
      } else {
        this.x = platform.x + platform.width;
      }
      this.velocity.x = 0;
    } else {
      // Vertical collision
      if (this.y < platform.y) {
        this.y = platform.y - this.height;
        this.velocity.y = 0;
        this.grounded = true;
        this.jumpsRemaining = this.maxJumps; // Reset jumps when landing
      } else {
        this.y = platform.y + platform.height;
        this.velocity.y = 0;
      }
    }
  }

  render(ctx) {
    // Player body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Player details (simple pixel art style)
    ctx.fillStyle = "#FFF";
    ctx.fillRect(this.x + 8, this.y + 8, 4, 4); // Eye
    ctx.fillRect(this.x + 20, this.y + 8, 4, 4); // Eye

    ctx.fillStyle = "#000";
    ctx.fillRect(this.x + 12, this.y + 20, 8, 2); // Mouth
  }
}

// Platform class
class Platform {
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
  }

  render(ctx) {
    if (this.type === "ground") {
      ctx.fillStyle = "#8B4513";
    } else {
      ctx.fillStyle = "#654321";
    }
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Add texture
    ctx.fillStyle = "#A0522D";
    for (let i = 0; i < this.width; i += 10) {
      ctx.fillRect(this.x + i, this.y, 2, this.height);
    }
  }
}

// Enemy class
class Enemy {
  constructor(x, y, type, difficulty) {
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 24;
    this.type = type;
    this.velocity = { x: 0, y: 0 };
    this.speed = 50 + difficulty * 20;
    this.direction = Math.random() < 0.5 ? -1 : 1;
    this.jumpTimer = 0;
  }

  update(dt, game) {
    if (this.type === "walker") {
      this.velocity.x = this.speed * this.direction;

      // Change direction at edges or platforms
      if (this.x <= 0 || this.x >= 800 - this.width) {
        this.direction *= -1;
      }
    } else if (this.type === "jumper") {
      this.jumpTimer -= dt;
      if (this.jumpTimer <= 0) {
        this.velocity.y = -200;
        this.jumpTimer = 2 + Math.random() * 2;
      }
    }

    // Gravity
    this.velocity.y += 800 * dt;

    // Update position
    this.x += this.velocity.x * dt;
    this.y += this.velocity.y * dt;

    // Ground collision (simple)
    if (this.y > 320) {
      this.y = 320;
      this.velocity.y = 0;
    }
  }

  render(ctx) {
    ctx.fillStyle = this.type === "walker" ? "#FF4444" : "#44FF44";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Eyes
    ctx.fillStyle = "#FFF";
    ctx.fillRect(this.x + 4, this.y + 4, 3, 3);
    ctx.fillRect(this.x + 17, this.y + 4, 3, 3);

    ctx.fillStyle = "#000";
    ctx.fillRect(this.x + 5, this.y + 5, 1, 1);
    ctx.fillRect(this.x + 18, this.y + 5, 1, 1);
  }
}

// Collectible class
class Collectible {
  constructor(x, y, type, points) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.type = type;
    this.points = points;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
  }

  render(ctx) {
    const bobY = this.y + Math.sin(this.time * 3 + this.bobOffset) * 3;

    if (this.type === "crystal") {
      ctx.fillStyle = "#00FFFF";
      ctx.fillRect(this.x, bobY, this.width, this.height);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(this.x + 4, bobY + 4, 8, 8);
    } else if (this.type === "coin") {
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(this.x + 8, bobY + 8, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FFA500";
      ctx.beginPath();
      ctx.arc(this.x + 8, bobY + 8, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Puzzle Element class
class PuzzleElement {
  constructor(x, y, type, id) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.type = type;
    this.id = id;
    this.activated = false;
  }

  interact(game) {
    if (this.type === "switch") {
      this.activated = !this.activated;
      // Find corresponding door
      const door = game.puzzleElements.find(
        (el) => el.type === "door" && el.id === this.id
      );
      if (door) {
        door.activated = this.activated;
      }
    }
  }

  render(ctx) {
    if (this.type === "switch") {
      ctx.fillStyle = this.activated ? "#00FF00" : "#FF0000";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } else if (this.type === "door") {
      if (!this.activated) {
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(this.x, this.y, this.width, this.height * 2);
      }
    }
  }
}

// Initialize game when page loads
window.addEventListener("load", () => {
  new Game();
});
