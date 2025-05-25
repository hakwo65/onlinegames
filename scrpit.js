const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('game-over-message');
const restartButton = document.getElementById('restart-button');

const gameWidth = gameContainer.offsetWidth;
const gameHeight = gameContainer.offsetHeight;
const playerWidth = player.offsetWidth;

// Lane positions (center of player in each lane)
const laneWidth = gameWidth / 3;
const lanePositions = [
    (laneWidth / 2) - (playerWidth / 2),             // Left lane
    (gameWidth / 2) - (playerWidth / 2),             // Middle lane
    gameWidth - (laneWidth / 2) - (playerWidth / 2)  // Right lane
];

let currentPlayerLane = 1; // 0: left, 1: middle, 2: right
let score = 0;
let obstacles = [];
let gameSpeed = 3; // Pixels per frame
let obstacleSpawnInterval = 2000; // Milliseconds
let gameInterval;
let spawnTimeout;
let isGameOver = false;

function startGame() {
    isGameOver = false;
    score = 0;
    currentPlayerLane = 1;
    player.style.left = lanePositions[currentPlayerLane] + 'px';
    scoreDisplay.textContent = score;
    obstacles.forEach(obs => obs.element.remove());
    obstacles = [];
    gameOverMessage.style.display = 'none';
    gameSpeed = 3;
    obstacleSpawnInterval = 2000;

    // Clear any existing intervals/timeouts
    if (gameInterval) clearInterval(gameInterval);
    if (spawnTimeout) clearTimeout(spawnTimeout);

    gameInterval = setInterval(gameLoop, 20); // approx 50 FPS
    scheduleNextObstacle();
}

function scheduleNextObstacle() {
    if (isGameOver) return;
    spawnTimeout = setTimeout(() => {
        createObstacle();
        scheduleNextObstacle();
    }, obstacleSpawnInterval);
}


function movePlayer(direction) {
    if (isGameOver) return;

    if (direction === 'left' && currentPlayerLane > 0) {
        currentPlayerLane--;
    } else if (direction === 'right' && currentPlayerLane < 2) {
        currentPlayerLane++;
    }
    player.style.left = lanePositions[currentPlayerLane] + 'px';
}

function createObstacle() {
    if (isGameOver) return;

    const obstacleEl = document.createElement('div');
    obstacleEl.classList.add('obstacle');
    const obstacleLane = Math.floor(Math.random() * 3); // Random lane (0, 1, or 2)
    const obstacleWidth = 60; // Must match CSS
    
    // Calculate left position for the obstacle to be centered in its lane
    const obstacleLeft = (obstacleLane * laneWidth) + (laneWidth / 2) - (obstacleWidth / 2);

    obstacleEl.style.left = obstacleLeft + 'px';
    obstacleEl.style.top = '-60px'; // Start above the screen

    gameContainer.appendChild(obstacleEl);
    obstacles.push({ element: obstacleEl, lane: obstacleLane, top: -60 });
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.top += gameSpeed;
        obs.element.style.top = obs.top + 'px';

        // Remove obstacle if it's off-screen
        if (obs.top > gameHeight) {
            obs.element.remove();
            obstacles.splice(i, 1);
            if (!isGameOver) {
                score++;
                scoreDisplay.textContent = score;
                // Increase difficulty
                if (score % 5 === 0) { // Every 5 points
                    gameSpeed += 0.2;
                    if (obstacleSpawnInterval > 800) { // Don't make it impossibly fast
                        obstacleSpawnInterval -= 100;
                    }
                }
            }
        }
    }
}

function checkCollision() {
    const playerRect = player.getBoundingClientRect();

    for (const obs of obstacles) {
        const obsRect = obs.element.getBoundingClientRect();

        // Simple AABB (Axis-Aligned Bounding Box) collision detection
        if (
            playerRect.left < obsRect.right &&
            playerRect.right > obsRect.left &&
            playerRect.top < obsRect.bottom &&
            playerRect.bottom > obsRect.top
        ) {
            gameOver();
            break;
        }
    }
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    clearTimeout(spawnTimeout); // Stop spawning new obstacles
    gameOverMessage.style.display = 'flex'; // or 'block'
}

function gameLoop() {
    if (isGameOver) return;
    updateObstacles();
    checkCollision();
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        movePlayer('left');
    } else if (e.key === 'ArrowRight') {
        movePlayer('right');
    }
});

restartButton.addEventListener('click', startGame);

// Initial game start
startGame();
