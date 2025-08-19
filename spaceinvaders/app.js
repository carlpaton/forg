const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Player
const player = {
    x: CANVAS_WIDTH / 2 - 20,
    y: CANVAS_HEIGHT - 60,
    width: 40,
    height: 20,
    speed: 5,
    color: '#0f0',
    dx: 0
};

// Bullets
let bullets = [];
const bulletSpeed = 7;

// Invaders
const invaderRows = 5;
const invaderCols = 10;
const invaderWidth = 30;
const invaderHeight = 20;
const invaderPadding = 10;
const invaderOffsetTop = 40;
const invaderOffsetLeft = 30;
let invaders = [];
let invaderDirection = 1;
let invaderSpeed = 1;

// Game state
let score = 0;
let gameOver = false;

function createInvaders() {
    invaders = [];
    for (let r = 0; r < invaderRows; r++) {
        for (let c = 0; c < invaderCols; c++) {
            invaders.push({
                x: invaderOffsetLeft + c * (invaderWidth + invaderPadding),
                y: invaderOffsetTop + r * (invaderHeight + invaderPadding),
                width: invaderWidth,
                height: invaderHeight,
                alive: true
            });
        }
    }
}

createInvaders();

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Draw a triangle for the ship's tip
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + player.width / 2, player.y - 15);
    ctx.lineTo(player.x + player.width, player.y);
    ctx.closePath();
    ctx.fill();
}

function drawBullets() {
    ctx.fillStyle = '#fff';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, 4, 10);
    });
}

function drawInvaders() {
    ctx.fillStyle = '#f00';
    invaders.forEach(invader => {
        if (invader.alive) {
            ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
            // Eyes
            ctx.fillStyle = '#fff';
            ctx.fillRect(invader.x + 6, invader.y + 6, 4, 4);
            ctx.fillRect(invader.x + invader.width - 10, invader.y + 6, 4, 4);
            ctx.fillStyle = '#f00';
        }
    });
}

function drawScore() {
    ctx.font = '20px Courier New';
    ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + score, 20, 30);
}

function drawGameOver() {
    ctx.font = '40px Courier New';
    ctx.fillStyle = '#ff0';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2 - 120, CANVAS_HEIGHT / 2);
    ctx.font = '20px Courier New';
    ctx.fillText('Press R to Restart', CANVAS_WIDTH / 2 - 90, CANVAS_HEIGHT / 2 + 40);
}

function movePlayer() {
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > CANVAS_WIDTH) player.x = CANVAS_WIDTH - player.width;
}

function moveBullets() {
    bullets.forEach(bullet => {
        bullet.y -= bulletSpeed;
    });
    bullets = bullets.filter(bullet => bullet.y > 0);
}

function moveInvaders() {
    let hitEdge = false;
    invaders.forEach(invader => {
        if (invader.alive) {
            invader.x += invaderDirection * invaderSpeed;
            if (invader.x < 0 || invader.x + invader.width > CANVAS_WIDTH) {
                hitEdge = true;
            }
        }
    });
    if (hitEdge) {
        invaderDirection *= -1;
        invaders.forEach(invader => {
            invader.y += invaderHeight;
        });
    }
}

function checkCollisions() {
    bullets.forEach((bullet, bIdx) => {
        invaders.forEach((invader, iIdx) => {
            if (
                invader.alive &&
                bullet.x < invader.x + invader.width &&
                bullet.x + 4 > invader.x &&
                bullet.y < invader.y + invader.height &&
                bullet.y + 10 > invader.y
            ) {
                invader.alive = false;
                bullets.splice(bIdx, 1);
                score += 10;
            }
        });
    });
    // Invader reaches player
    invaders.forEach(invader => {
        if (
            invader.alive &&
            invader.y + invader.height >= player.y &&
            invader.x < player.x + player.width &&
            invader.x + invader.width > player.x
        ) {
            gameOver = true;
        }
    });
}

function checkWin() {
    if (invaders.every(invader => !invader.alive)) {
        invaderSpeed += 0.5;
        score += 100;
        createInvaders();
    }
}

function update() {
    if (gameOver) return;
    movePlayer();
    moveBullets();
    moveInvaders();
    checkCollisions();
    checkWin();
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawPlayer();
    drawBullets();
    drawInvaders();
    drawScore();
    if (gameOver) drawGameOver();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

// Controls
window.addEventListener('keydown', e => {
    if (gameOver && e.key.toLowerCase() === 'r') {
        score = 0;
        invaderSpeed = 1;
        player.x = CANVAS_WIDTH / 2 - 20;
        bullets = [];
        gameOver = false;
        createInvaders();
    }
    if (e.key === 'ArrowLeft') player.dx = -player.speed;
    if (e.key === 'ArrowRight') player.dx = player.speed;
    if (e.key === ' ' && !gameOver) {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y - 10
        });
    }
});

window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
});
