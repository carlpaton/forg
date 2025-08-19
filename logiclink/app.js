// Logic Link - Retro Puzzle Game
class LogicLink {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");

    // Game state
    this.currentLevel = 1;
    this.maxLevel = 10;
    this.moveCount = 0;
    this.score = 0;
    this.gameState = "playing"; // 'playing', 'paused', 'complete', 'gameover'

    // Grid and game mechanics
    this.gridSize = 6;
    this.cellSize = 80;
    this.nodes = [];
    this.connections = [];
    this.cursor = { x: 0, y: 0 };
    this.selectedNode = null;
    this.isConnecting = false;

    // Colors for different node types
    this.nodeColors = [
      "#ff0080",
      "#00ff80",
      "#8000ff",
      "#ff8000",
      "#0080ff",
      "#ffff00",
    ];

    // Mobile detection
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;

    // Timing for consistent speed across devices
    this.lastTime = 0;
    this.deltaTime = 0;

    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.setupMobileControls();
    this.generateLevel(this.currentLevel);
    this.updateUI();
    this.gameLoop();
  }

  setupCanvas() {
    // Adjust canvas size for mobile
    if (this.isMobile) {
      this.canvas.width = 350;
      this.canvas.height = 250;
      this.cellSize = 50;
      this.gridSize = 6;
    } else {
      this.canvas.width = 600;
      this.canvas.height = 400;
      this.cellSize = 80;
      this.gridSize = 6;
    }

    // Center the grid
    this.offsetX = (this.canvas.width - this.gridSize * this.cellSize) / 2;
    this.offsetY = (this.canvas.height - this.gridSize * this.cellSize) / 2;
  }

  setupEventListeners() {
    // Keyboard controls for desktop
    document.addEventListener("keydown", (e) => {
      if (this.gameState !== "playing") return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          this.moveCursor(0, -1);
          break;
        case "ArrowDown":
          e.preventDefault();
          this.moveCursor(0, 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          this.moveCursor(-1, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          this.moveCursor(1, 0);
          break;
        case " ":
          e.preventDefault();
          this.handleSelection();
          break;
        case "Escape":
          this.togglePause();
          break;
      }
    });

    // Mouse/touch controls for canvas
    this.canvas.addEventListener("click", (e) => {
      if (this.gameState !== "playing") return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const gridX = Math.floor((x - this.offsetX) / this.cellSize);
      const gridY = Math.floor((y - this.offsetY) / this.cellSize);

      if (
        gridX >= 0 &&
        gridX < this.gridSize &&
        gridY >= 0 &&
        gridY < this.gridSize
      ) {
        this.cursor.x = gridX;
        this.cursor.y = gridY;
        this.handleSelection();
      }
    });

    // UI button events
    document
      .getElementById("next-level-btn")
      .addEventListener("click", () => this.nextLevel());
    document
      .getElementById("restart-level-btn")
      .addEventListener("click", () => this.restartLevel());
    document
      .getElementById("resume-btn")
      .addEventListener("click", () => this.togglePause());
    document
      .getElementById("restart-game-btn")
      .addEventListener("click", () => this.restartGame());
  }

  setupMobileControls() {
    if (!this.isMobile) return;

    const controls = {
      "move-up": () => this.moveCursor(0, -1),
      "move-down": () => this.moveCursor(0, 1),
      "move-left": () => this.moveCursor(-1, 0),
      "move-right": () => this.moveCursor(1, 0),
      "select-btn": () => this.handleSelection(),
      "undo-btn": () => this.undoLastConnection(),
      "pause-btn": () => this.togglePause(),
    };

    Object.keys(controls).forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("touchstart", (e) => {
          e.preventDefault();
          controls[id]();
        });
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          controls[id]();
        });
      }
    });
  }

  generateLevel(levelNumber) {
    this.nodes = [];
    this.connections = [];
    this.selectedNode = null;
    this.isConnecting = false;

    // Level difficulty scaling
    const nodeCount = Math.min(2 + Math.floor(levelNumber / 2), 6);
    const pairsCount = Math.min(2 + Math.floor(levelNumber / 3), 4);

    // Track all used positions to prevent overlap
    const usedPositions = new Set();

    // Generate node pairs
    for (let i = 0; i < pairsCount; i++) {
      const color = this.nodeColors[i];
      const positions = this.getUniqueRandomPositions(2, usedPositions);

      this.nodes.push({
        x: positions[0].x,
        y: positions[0].y,
        color: color,
        type: i,
        connected: false,
      });

      this.nodes.push({
        x: positions[1].x,
        y: positions[1].y,
        color: color,
        type: i,
        connected: false,
      });
    }

    // Add obstacles for higher levels
    if (levelNumber > 5) {
      const obstacleCount = Math.floor((levelNumber - 5) / 2);
      for (let i = 0; i < obstacleCount; i++) {
        const pos = this.getRandomEmptyPositionFromSet(usedPositions);
        if (pos) {
          usedPositions.add(`${pos.x},${pos.y}`);
          this.nodes.push({
            x: pos.x,
            y: pos.y,
            color: "#666666",
            type: "obstacle",
            connected: false,
          });
        }
      }
    }
  }

  getRandomPositions(count) {
    const positions = [];
    const usedPositions = new Set();

    while (positions.length < count) {
      const x = Math.floor(Math.random() * this.gridSize);
      const y = Math.floor(Math.random() * this.gridSize);
      const key = `${x},${y}`;

      if (!usedPositions.has(key)) {
        usedPositions.add(key);
        positions.push({ x, y });
      }
    }

    return positions;
  }

  getUniqueRandomPositions(count, globalUsedPositions) {
    const positions = [];

    while (positions.length < count) {
      const x = Math.floor(Math.random() * this.gridSize);
      const y = Math.floor(Math.random() * this.gridSize);
      const key = `${x},${y}`;

      if (!globalUsedPositions.has(key)) {
        globalUsedPositions.add(key);
        positions.push({ x, y });
      }
    }

    return positions;
  }

  getRandomEmptyPosition() {
    const usedPositions = new Set();
    this.nodes.forEach((node) => {
      usedPositions.add(`${node.x},${node.y}`);
    });

    const emptyPositions = [];
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        if (!usedPositions.has(`${x},${y}`)) {
          emptyPositions.push({ x, y });
        }
      }
    }

    return emptyPositions.length > 0
      ? emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
      : null;
  }

  getRandomEmptyPositionFromSet(usedPositions) {
    const emptyPositions = [];
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        if (!usedPositions.has(`${x},${y}`)) {
          emptyPositions.push({ x, y });
        }
      }
    }

    return emptyPositions.length > 0
      ? emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
      : null;
  }

  moveCursor(dx, dy) {
    this.cursor.x = Math.max(
      0,
      Math.min(this.gridSize - 1, this.cursor.x + dx)
    );
    this.cursor.y = Math.max(
      0,
      Math.min(this.gridSize - 1, this.cursor.y + dy)
    );
  }

  handleSelection() {
    const nodeAtCursor = this.getNodeAt(this.cursor.x, this.cursor.y);

    if (!nodeAtCursor || nodeAtCursor.type === "obstacle") return;

    if (!this.selectedNode) {
      // Select first node
      this.selectedNode = nodeAtCursor;
      this.isConnecting = true;
    } else if (this.selectedNode === nodeAtCursor) {
      // Deselect current node
      this.selectedNode = null;
      this.isConnecting = false;
    } else if (
      this.selectedNode.type === nodeAtCursor.type &&
      !this.selectedNode.connected &&
      !nodeAtCursor.connected
    ) {
      // Connect matching nodes
      if (this.isValidConnection(this.selectedNode, nodeAtCursor)) {
        this.createConnection(this.selectedNode, nodeAtCursor);
        this.moveCount++;
        this.updateUI();

        // Check if level is complete
        if (this.isLevelComplete()) {
          this.completeLevel();
        }
      }

      this.selectedNode = null;
      this.isConnecting = false;
    } else {
      // Select different node
      this.selectedNode = nodeAtCursor;
    }
  }

  getNodeAt(x, y) {
    return this.nodes.find((node) => node.x === x && node.y === y);
  }

  isValidConnection(node1, node2) {
    // Check if path would cross existing connections
    const path = this.getPath(node1, node2);

    for (const connection of this.connections) {
      const existingPath = this.getPath(connection.node1, connection.node2);
      if (this.pathsIntersect(path, existingPath)) {
        return false;
      }
    }

    return true;
  }

  getPath(node1, node2) {
    // Simple L-shaped path (horizontal then vertical, or vertical then horizontal)
    const path = [];

    // Try horizontal first, then vertical
    let currentX = node1.x;
    let currentY = node1.y;

    // Move horizontally
    while (currentX !== node2.x) {
      currentX += currentX < node2.x ? 1 : -1;
      path.push({ x: currentX, y: currentY });
    }

    // Move vertically
    while (currentY !== node2.y) {
      currentY += currentY < node2.y ? 1 : -1;
      path.push({ x: currentX, y: currentY });
    }

    return path;
  }

  pathsIntersect(path1, path2) {
    // Check if any segments of the paths intersect
    for (const point1 of path1) {
      for (const point2 of path2) {
        if (point1.x === point2.x && point1.y === point2.y) {
          return true;
        }
      }
    }
    return false;
  }

  createConnection(node1, node2) {
    node1.connected = true;
    node2.connected = true;

    this.connections.push({
      node1: node1,
      node2: node2,
      path: this.getPath(node1, node2),
    });

    // Play connection sound effect (placeholder)
    this.playSound("connect");
  }

  undoLastConnection() {
    if (this.connections.length === 0) return;

    const lastConnection = this.connections.pop();
    lastConnection.node1.connected = false;
    lastConnection.node2.connected = false;

    this.moveCount++;
    this.updateUI();
    this.playSound("undo");
  }

  isLevelComplete() {
    return this.nodes.every(
      (node) => node.connected || node.type === "obstacle"
    );
  }

  completeLevel() {
    this.gameState = "complete";

    // Calculate score based on moves and level
    const baseScore = 1000;
    const levelBonus = this.currentLevel * 100;
    const movesPenalty = this.moveCount * 10;
    const levelScore = Math.max(100, baseScore + levelBonus - movesPenalty);

    this.score += levelScore;

    // Calculate star rating
    const optimalMoves = this.getOptimalMoves(this.currentLevel);
    const stars =
      this.moveCount <= optimalMoves
        ? 3
        : this.moveCount <= optimalMoves * 1.5
        ? 2
        : 1;

    this.showGameOverScreen(true, stars);
    this.playSound("levelComplete");
  }

  getOptimalMoves(level) {
    // Estimate optimal moves based on level complexity
    return Math.max(2, Math.floor(level / 2) + 2);
  }

  showGameOverScreen(isWin = true, stars = 0) {
    const overlay = document.getElementById("game-over-overlay");
    const title = document.getElementById("game-over-title");
    const message = document.getElementById("game-over-message");
    const starRating = document.getElementById("star-rating");
    const nextBtn = document.getElementById("next-level-btn");

    if (isWin) {
      title.textContent =
        this.currentLevel >= this.maxLevel
          ? "Game Complete!"
          : "Level Complete!";
      message.textContent = `Great job! You completed level ${this.currentLevel} in ${this.moveCount} moves.`;
      starRating.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
      nextBtn.style.display =
        this.currentLevel >= this.maxLevel ? "none" : "block";
    } else {
      title.textContent = "Game Over";
      message.textContent = "Try again and connect all the nodes!";
      starRating.textContent = "";
      nextBtn.style.display = "none";
    }

    overlay.classList.remove("hidden");
  }

  nextLevel() {
    if (this.currentLevel < this.maxLevel) {
      this.currentLevel++;
      this.restartLevel();
    }
  }

  restartLevel() {
    this.gameState = "playing";
    this.moveCount = 0;
    this.generateLevel(this.currentLevel);
    this.updateUI();
    document.getElementById("game-over-overlay").classList.add("hidden");
    document.getElementById("pause-overlay").classList.add("hidden");
  }

  restartGame() {
    this.currentLevel = 1;
    this.score = 0;
    this.restartLevel();
  }

  togglePause() {
    if (this.gameState === "playing") {
      this.gameState = "paused";
      document.getElementById("pause-overlay").classList.remove("hidden");
    } else if (this.gameState === "paused") {
      this.gameState = "playing";
      document.getElementById("pause-overlay").classList.add("hidden");
    }
  }

  updateUI() {
    document.getElementById("current-level").textContent = this.currentLevel;
    document.getElementById("move-count").textContent = this.moveCount;
    document.getElementById("score").textContent = this.score;
  }

  playSound(type) {
    // Placeholder for sound effects
    // In a full implementation, this would play actual audio
    console.log(`Playing sound: ${type}`);
  }

  gameLoop(currentTime = 0) {
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (this.gameState === "playing") {
      this.render();
    }

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.drawGrid();

    // Draw connections
    this.drawConnections();

    // Draw nodes
    this.drawNodes();

    // Draw cursor
    this.drawCursor();
  }

  drawGrid() {
    this.ctx.strokeStyle = "#333333";
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= this.gridSize; x++) {
      const pixelX = this.offsetX + x * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(pixelX, this.offsetY);
      this.ctx.lineTo(pixelX, this.offsetY + this.gridSize * this.cellSize);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= this.gridSize; y++) {
      const pixelY = this.offsetY + y * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(this.offsetX, pixelY);
      this.ctx.lineTo(this.offsetX + this.gridSize * this.cellSize, pixelY);
      this.ctx.stroke();
    }
  }

  drawConnections() {
    this.connections.forEach((connection) => {
      this.ctx.strokeStyle = connection.node1.color;
      this.ctx.lineWidth = 4;
      this.ctx.lineCap = "round";

      this.ctx.beginPath();
      const startX =
        this.offsetX + connection.node1.x * this.cellSize + this.cellSize / 2;
      const startY =
        this.offsetY + connection.node1.y * this.cellSize + this.cellSize / 2;
      this.ctx.moveTo(startX, startY);

      // Draw path
      connection.path.forEach((point) => {
        const x = this.offsetX + point.x * this.cellSize + this.cellSize / 2;
        const y = this.offsetY + point.y * this.cellSize + this.cellSize / 2;
        this.ctx.lineTo(x, y);
      });

      this.ctx.stroke();
    });
  }

  drawNodes() {
    this.nodes.forEach((node) => {
      const x = this.offsetX + node.x * this.cellSize + this.cellSize / 2;
      const y = this.offsetY + node.y * this.cellSize + this.cellSize / 2;
      const radius = this.cellSize / 4;

      // Node shadow
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      this.ctx.beginPath();
      this.ctx.arc(x + 2, y + 2, radius, 0, 2 * Math.PI);
      this.ctx.fill();

      // Node body
      this.ctx.fillStyle = node.color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
      this.ctx.fill();

      // Node border
      this.ctx.strokeStyle = node === this.selectedNode ? "#ffffff" : "#000000";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Connected indicator
      if (node.connected && node.type !== "obstacle") {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius / 3, 0, 2 * Math.PI);
        this.ctx.fill();
      }
    });
  }

  drawCursor() {
    const x = this.offsetX + this.cursor.x * this.cellSize;
    const y = this.offsetY + this.cursor.y * this.cellSize;

    this.ctx.strokeStyle = "#00ff41";
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([5, 5]);

    this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);

    this.ctx.setLineDash([]);
  }
}

// Initialize game when page loads
document.addEventListener("DOMContentLoaded", () => {
  const game = new LogicLink();
});
