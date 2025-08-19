class FlappyBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'

        // Game elements
        this.bird = {
            x: 80,
            y: 300,
            width: 20,
            height: 20,
            velocity: 0,
            gravity: 0.5, // single gravity value for all devices
            jumpPower: -8,
            color: '#FFD700'
        };

        this.pipes = [];
        this.pipeWidth = 50;
        this.pipeGap = 150;
        this.pipeSpeed = 2;

        this.score = 0;
        this.highScore = localStorage.getItem('flappyHighScore') || 0;

        // DOM elements
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gameOverScreen = document.getElementById('gameOver');
        this.startScreen = document.getElementById('startScreen');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');

        this.lastTime = performance.now(); // Track last frame time

        this.birdStarted = false; // Bird only falls after input
        this.newHighScore = false; // Track if new high score was made

        this.init();
    }

    init() {
        this.highScoreElement.textContent = this.highScore;
        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'gameOver') {
                    this.restartGame();
                } else {
                    this.handleInput();
                }
            }
        });

        // Mouse/touch controls
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'gameOver') {
                this.restartGame();
            } else {
                this.handleInput();
            }
        });

        // Button controls
        this.startBtn.addEventListener('click', () => {
            this.startGame();
        });

        this.restartBtn.addEventListener('click', () => {
            this.restartGame();
        });
    }

    handleInput() {
        if (!this.birdStarted) {
            this.birdStarted = true;
        }
        if (this.gameState === 'playing') {
            this.bird.velocity = this.bird.jumpPower;
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.startScreen.style.display = 'none';
        this.resetGame();
    }

    restartGame() {
        this.gameState = 'playing';
        this.gameOverScreen.style.display = 'none';
        this.resetGame();
    }

    resetGame() {
        this.bird.y = 300;
        this.bird.velocity = 0;
        this.pipes = [];
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.birdStarted = false;
        this.addPipe();
    }

    addPipe() {
        const minHeight = 50;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight - 100; // 100 for ground
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            bottomHeight: this.canvas.height - (topHeight + this.pipeGap) - 100,
            passed: false
        });
    }

    updateBird(dt) {
        if (this.gameState !== 'playing') return;
        if (!this.birdStarted) return; // Don't fall until input

        // Gravity and velocity are per second, so multiply by dt
        this.bird.velocity += this.bird.gravity * 60 * dt;
        this.bird.y += this.bird.velocity * dt * 60;

        // Check ground collision
        if (this.bird.y + this.bird.height > this.canvas.height - 100) {
            this.gameOver();
        }

        // Check ceiling collision
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
    }

    updatePipes(dt) {
        if (this.gameState !== 'playing') return;
        if (!this.birdStarted) return; // Don't move pipes until input

        // Move pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed * dt * 60;

            // Remove pipes that are off screen
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                continue;
            }

            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.scoreElement.textContent = this.score;
            }

            // Check collision
            if (this.checkCollision(pipe)) {
                this.gameOver();
                return;
            }
        }

        // Add new pipe
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - 200) {
            this.addPipe();
        }
    }

    checkCollision(pipe) {
        const birdLeft = this.bird.x;
        const birdRight = this.bird.x + this.bird.width;
        const birdTop = this.bird.y;
        const birdBottom = this.bird.y + this.bird.height;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.pipeWidth;

        // Check if bird is within pipe's x range
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check collision with top pipe
            if (birdTop < pipe.topHeight) {
                return true;
            }
            // Check collision with bottom pipe
            if (birdBottom > pipe.bottomY) {
                return true;
            }
        }

        return false;
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.newHighScore = false;
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('flappyHighScore', this.highScore);
            this.newHighScore = true;
            // Show high score message in game over screen
            const gameOverDiv = document.getElementById('gameOver');
            let highScoreMsg = document.getElementById('highScoreMsg');
            if (!highScoreMsg) {
                highScoreMsg = document.createElement('div');
                highScoreMsg.id = 'highScoreMsg';
                highScoreMsg.style.color = '#FFD700';
                highScoreMsg.style.fontSize = '1.5em';
                highScoreMsg.style.fontWeight = 'bold';
                highScoreMsg.style.marginTop = '10px';
                gameOverDiv.appendChild(highScoreMsg);
            }
            highScoreMsg.textContent = '🎉 New High Score! 🎉';
        } else {
            // Remove high score message if not a new high score
            const highScoreMsg = document.getElementById('highScoreMsg');
            if (highScoreMsg) {
                highScoreMsg.textContent = '';
            }
        }
        this.finalScoreElement.textContent = this.score;
        this.gameOverScreen.style.display = 'flex';
    }

    drawBird() {
        this.ctx.fillStyle = this.bird.color;
        this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);

        // Add retro pixel effect
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);

        // Bird eye
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.bird.x + 12, this.bird.y + 5, 4, 4);
    }

    drawPipes() {
        this.ctx.fillStyle = '#228B22';

        this.pipes.forEach(pipe => {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);

            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);

            // Pipe borders for retro effect
            this.ctx.strokeStyle = '#006400';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            this.ctx.strokeRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);

            // Pipe caps
            this.ctx.fillStyle = '#32CD32';
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, this.pipeWidth + 10, 20);
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 20);

            this.ctx.strokeStyle = '#006400';
            this.ctx.strokeRect(pipe.x - 5, pipe.topHeight - 20, this.pipeWidth + 10, 20);
            this.ctx.strokeRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 20);
        });
    }

    drawGround() {
        // Ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);

        // Ground pattern
        this.ctx.fillStyle = '#A0522D';
        for (let x = 0; x < this.canvas.width; x += 20) {
            for (let y = this.canvas.height - 100; y < this.canvas.height; y += 20) {
                if ((x + y) % 40 === 0) {
                    this.ctx.fillRect(x, y, 10, 10);
                }
            }
        }
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        // Simple cloud shapes
        const clouds = [
            { x: 50, y: 100, size: 30 },
            { x: 200, y: 80, size: 25 },
            { x: 320, y: 120, size: 35 }
        ];

        clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + 20, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + 35, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background elements
        this.drawClouds();
        this.drawGround();

        // Draw game elements
        if (this.gameState === 'playing' || this.gameState === 'gameOver') {
            this.drawPipes();
        }

        this.drawBird();

        // Show message if waiting for user input
        if (this.gameState === 'playing' && !this.birdStarted) {
            this.ctx.save();
            this.ctx.font = '28px Arial';
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3;
            const msg = 'Press SPACE/tap/click to start!';
            this.ctx.strokeText(msg, this.canvas.width / 2, this.canvas.height / 2 - 40);
            this.ctx.fillText(msg, this.canvas.width / 2, this.canvas.height / 2 - 40);
            this.ctx.restore();
        }
        // Show new high score message on game over
        if (this.gameState === 'gameOver' && this.newHighScore) {
            this.ctx.save();
            this.ctx.font = '32px Arial';
            this.ctx.fillStyle = '#FFD700';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            const msg = 'New High Score!';
            this.ctx.strokeText(msg, this.canvas.width / 2, this.canvas.height / 2 - 80);
            this.ctx.fillText(msg, this.canvas.width / 2, this.canvas.height / 2 - 80);
            this.ctx.restore();
        }
    }

    gameLoop() {
        const now = performance.now();
        let dt = (now - this.lastTime) / 1000; // seconds
        dt = Math.min(dt, 0.05); // Clamp to max 50ms/frame
        this.lastTime = now;
        this.updateBird(dt);
        this.updatePipes(dt);
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new FlappyBird();
});
