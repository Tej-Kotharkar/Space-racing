const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const numPlayersSelect = document.getElementById('numPlayers');
const player1Select = document.getElementById('player1');
const player2Select = document.getElementById('player2');
const player3Select = document.getElementById('player3');
const player2Control = document.getElementById('player2Control');
const player3Control = document.getElementById('player3Control');

let players = [];
let asteroids = [];
let gameInterval, startTime;
let currentPlayerIndex = 0;
let turnDuration = 5000; // Duration of each player's turn in milliseconds
let turnEndTime;
let activePlayer = null;

const shipImages = {
    ship1: 'ship1.png',
    ship2: 'ship2.png',
    ship3: 'ship3.png'
};

const asteroidImageSrc = 'asteroid.png';
let asteroidImage = new Image();
asteroidImage.src = asteroidImageSrc;

class Spaceship {
    constructor(x, y, imageSrc) {
        this.x = x;
        this.y = y;
        this.image = new Image();
        this.image.src = imageSrc;
        this.width = 80; // Increased size
        this.height = 80; // Increased size
        this.survivalTime = 0;
        this.alive = true;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    updateSurvivalTime() {
        if (this.alive) {
            this.survivalTime = Math.floor((Date.now() - startTime) / 1000);
        }
    }
}

class Asteroid {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
    }

    draw() {
        ctx.drawImage(asteroidImage, this.x, this.y, this.size, this.size);
    }

    move(dy) {
        this.y += dy;
        if (this.y > canvas.height) {
            this.y = -this.size;
            this.x = Math.random() * canvas.width;
        }
    }
}

numPlayersSelect.addEventListener('change', () => {
    const numPlayers = parseInt(numPlayersSelect.value);
    player3Control.style.display = numPlayers === 3 ? 'block' : 'none';
});

startBtn.addEventListener('click', () => {
    initializeGame();
    startGame();
});

function initializeGame() {
    players = [];
    asteroids = [];
    const numPlayers = parseInt(numPlayersSelect.value);

    players.push({ player: new Spaceship(100, canvas.height - 50, shipImages[player1Select.value]), alive: true, survivalTime: 0 });
    players.push({ player: new Spaceship(100, canvas.height - 50, shipImages[player2Select.value]), alive: true, survivalTime: 0 });

    if (numPlayers === 3) {
        players.push({ player: new Spaceship(100, canvas.height - 50, shipImages[player3Select.value]), alive: true, survivalTime: 0 });
    }

    for (let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * -canvas.height;
        asteroids.push(new Asteroid(x, y, 80)); // Increased size
    }

    startTime = Date.now();
    currentPlayerIndex = 0;
    turnEndTime = Date.now() + turnDuration;
    activePlayer = players[currentPlayerIndex].player;
}

function startGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }

    gameInterval = setInterval(() => {
        updateGame();
        drawGame();
    }, 1000 / 60);
}

function updateGame() {
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.innerText = `Time: ${timeElapsed}s`;

    asteroids.forEach(asteroid => asteroid.move(2));

    activePlayer.updateSurvivalTime();

    checkCollisions();
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (activePlayer.alive) {
        activePlayer.draw();
    }

    asteroids.forEach(asteroid => asteroid.draw());
}

function checkCollisions() {
    for (const asteroid of asteroids) {
        if (
            activePlayer.x < asteroid.x + asteroid.size &&
            activePlayer.x + activePlayer.width > asteroid.x &&
            activePlayer.y < asteroid.y + asteroid.size &&
            activePlayer.y + activePlayer.height > asteroid.y
        ) {
            activePlayer.alive = false;
            players[currentPlayerIndex].alive = false;
            players[currentPlayerIndex].survivalTime = activePlayer.survivalTime;
            handleDeath();
            break;
        }
    }
}

function handleDeath() {
    if (currentPlayerIndex < players.length - 1) {
        currentPlayerIndex++;
        activePlayer = players[currentPlayerIndex].player;
        startTime = Date.now();
    } else {
        endGame();
    }
}

function endGame() {
    clearInterval(gameInterval);
    const winner = players.reduce((prev, current) => (prev.survivalTime > current.survivalTime ? prev : current));
    alert(`Game Over! The winner is Player ${players.indexOf(winner) + 1} with a survival time of ${winner.survivalTime} seconds.`);
}

document.addEventListener('keydown', (e) => {
    if (activePlayer.alive) {
        switch (e.key) {
            case 'ArrowLeft':
                activePlayer.move(-10, 0);
                break;
            case 'ArrowRight':
                activePlayer.move(10, 0);
                break;
            case 'ArrowUp':
                activePlayer.move(0, -10);
                break;
            case 'ArrowDown':
                activePlayer.move(0, 10);
                break;
        }
    }
});
