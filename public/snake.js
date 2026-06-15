const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('current-score');
const overlay = document.getElementById('game-overlay');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let dx = 0;
let dy = 0;
let foodX;
let foodY;
let score = 0;
let gameLoopTimeout;
let isGameOver = false;

const colorBg = '#222222';
const colorSnakeBody = '#1ca6a6';
const colorSnakeHead = '#ffffff';
const colorFood = '#a61c1c';

function resetGame() {
    snake = [
        { x: 10, y: 10 },
    ];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    isGameOver = false;
    overlay.classList.add('hidden');
    placeFood();
    clearTimeout(gameLoopTimeout);
    gameLoop();
}

function gameLoop() {
    if (isGameOver) return;
    
    update();
    draw();
    
    const speed = Math.max(60, 150 - (score * 10));
    gameLoopTimeout = setTimeout(gameLoop, speed);
}

function update() {
    if (dx === 0 && dy === 0) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === foodX && head.y === foodY) {
        score += 1;
        scoreElement.textContent = score;
        placeFood();
    } else {
        snake.pop();
    }
}

function draw() {
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? colorSnakeHead : colorSnakeBody;
        ctx.fillRect(snake[i].x * gridSize + 1, snake[i].y * gridSize + 1, gridSize - 2, gridSize - 2);
    }

    ctx.fillStyle = colorFood;
    ctx.fillRect(foodX * gridSize + 1, foodY * gridSize + 1, gridSize - 2, gridSize - 2);
}

function placeFood() {
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);
    
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === foodX && snake[i].y === foodY) {
            placeFood();
            return;
        }
    }
}

function gameOver() {
    isGameOver = true;
    finalScoreElement.textContent = score;
    overlay.classList.remove('hidden');
}

document.addEventListener('keydown', (e) => {
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].indexOf(e.key) > -1) {
        e.preventDefault();
    }

    const key = e.key.toLowerCase();

    if ((key === 'arrowup' || key === 'w') && dy === 0) { dx = 0; dy = -1; }
    if ((key === 'arrowdown' || key === 's') && dy === 0) { dx = 0; dy = 1; }
    if ((key === 'arrowleft' || key === 'a') && dx === 0) { dx = -1; dy = 0; }
    if ((key === 'arrowright' || key === 'd') && dx === 0) { dx = 1; dy = 0; }
});

restartBtn.addEventListener('click', resetGame);

resetGame();
