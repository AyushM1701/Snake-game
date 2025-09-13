const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const levelElement = document.querySelector(".level");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const eatSound = document.getElementById("eat-sound");
const hitSound = document.getElementById("hit-sound");
const levelupSound = document.getElementById("levelup-sound");

let currentDirection = "";
let gameVariables = {
  foodX: 0,
  foodY: 0,
  snakeX: 5,
  snakeY: 5,
  velocityX: 0,
  velocityY: 0,
  snakeBody: [],
  setIntervalId: null,
  score: 0,
  level: 1,
  speed: 200,
  isPaused: false,
  gameStarted: false,
  gameOver: false,
  highScore: localStorage.getItem("high-score") || 0,
};

const initGame = () => {
  const existingOverlay = document.querySelector(".game-over-overlay");
  if (existingOverlay) existingOverlay.remove();

  // Clear any existing game loop
  if (gameVariables.setIntervalId) clearInterval(gameVariables.setIntervalId);

  gameVariables = {
    ...gameVariables, // Preserves high score
    snakeX: 5,
    snakeY: 5,
    velocityX: 0,
    velocityY: 0,
    snakeBody: [],
    score: 0,
    level: 1,
    speed: 200,
    isPaused: false,
    gameOver: false,
    gameStarted: false,
  };

  currentDirection = "";
  document
    .querySelectorAll(".arrow-grid i")
    .forEach((arrow) => arrow.classList.remove("active"));

  updateUI();
  updateFoodPosition();
  playBoard.innerHTML = ""; // Clear the board for a fresh start

  startBtn.innerText = "Start";
  startBtn.disabled = false;
  pauseBtn.innerText = "Pause";
};

const updateUI = () => {
  scoreElement.innerText = `Score: ${gameVariables.score}`;
  levelElement.innerText = `Level: ${gameVariables.level}`;
  highScoreElement.innerText = `High Score: ${gameVariables.highScore}`;
};

const updateFoodPosition = () => {
  gameVariables.foodX = Math.floor(Math.random() * 30) + 1;
  gameVariables.foodY = Math.floor(Math.random() * 30) + 1;
};

const handleGameOver = () => {
  clearInterval(gameVariables.setIntervalId);
  gameVariables.gameOver = true;
  hitSound.play();

  const overlay = document.createElement("div");
  overlay.className = "game-over-overlay";

  overlay.innerHTML = `
    <div class="game-over-text">GAME OVER</div>
    <div class="final-score">Score: ${gameVariables.score}</div>
    <div class="final-level">Level: ${gameVariables.level}</div>
    <div class="high-score-display">High Score: ${gameVariables.highScore}</div>
    <button class="restart-btn">Restart</button>
  `;
  playBoard.appendChild(overlay);

  overlay.querySelector(".restart-btn").addEventListener("click", startGame);

  startBtn.innerText = "Restart";
  startBtn.disabled = false;
  gameVariables.gameStarted = false;
};

const changeDirection = (e) => {
  if (
    gameVariables.gameOver ||
    !gameVariables.gameStarted ||
    gameVariables.isPaused
  )
    return;

  const key = e.key || e.target.dataset.key;

  if (key === "ArrowUp" && gameVariables.velocityY !== 1) {
    gameVariables.velocityX = 0;
    gameVariables.velocityY = -1;
  } else if (key === "ArrowDown" && gameVariables.velocityY !== -1) {
    gameVariables.velocityX = 0;
    gameVariables.velocityY = 1;
  } else if (key === "ArrowLeft" && gameVariables.velocityX !== 1) {
    gameVariables.velocityX = -1;
    gameVariables.velocityY = 0;
  } else if (key === "ArrowRight" && gameVariables.velocityX !== -1) {
    gameVariables.velocityX = 1;
    gameVariables.velocityY = 0;
  } else {
    return; // Do nothing if the direction is invalid or the same
  }

  // Update visual indicator for controls
  currentDirection = key;
  document.querySelectorAll(".arrow-grid i").forEach((arrow) => {
    arrow.classList.remove("active");
  });
  const currentArrow = document.querySelector(
    `.arrow-grid i[data-key="${currentDirection}"]`
  );
  if (currentArrow) currentArrow.classList.add("active");

  // Run a single game loop immediately for responsiveness
  gameLoop();
};

controls.forEach((button) => button.addEventListener("click", changeDirection));

const checkLevelUp = () => {
  const newLevel = Math.floor(gameVariables.score / 5) + 1;
  if (newLevel > gameVariables.level) {
    gameVariables.level = newLevel;
    levelupSound.play();
    gameVariables.speed = Math.max(200 - gameVariables.level * 15, 50);
    clearInterval(gameVariables.setIntervalId);
    gameVariables.setIntervalId = setInterval(gameLoop, gameVariables.speed);

    // Visual feedback for leveling up
    playBoard.style.boxShadow = "0 0 20px #ffffffff";
    setTimeout(() => (playBoard.style.boxShadow = "none"), 300);
    updateUI();
  }
};

const gameLoop = () => {
  if (gameVariables.gameOver || gameVariables.isPaused) return;

  gameVariables.snakeX += gameVariables.velocityX;
  gameVariables.snakeY += gameVariables.velocityY;

  // 1. Check for Wall Collision
  if (
    gameVariables.snakeX <= 0 ||
    gameVariables.snakeX > 30 ||
    gameVariables.snakeY <= 0 ||
    gameVariables.snakeY > 30
  ) {
    return handleGameOver();
  }

  // 2. Check for Food Collision
  let foodEaten = false;
  if (
    gameVariables.snakeX === gameVariables.foodX &&
    gameVariables.snakeY === gameVariables.foodY
  ) {
    foodEaten = true;
    eatSound.play();
    updateFoodPosition();
    gameVariables.score++;
    if (gameVariables.score > gameVariables.highScore) {
      gameVariables.highScore = gameVariables.score;
      localStorage.setItem("high-score", gameVariables.highScore);
    }
    updateUI();
    checkLevelUp();
  }

  // 3. Update Snake Body
  // Add new head to the front
  gameVariables.snakeBody.unshift([gameVariables.snakeX, gameVariables.snakeY]);

  // If no food was eaten, remove the tail to simulate movement
  if (!foodEaten) {
    gameVariables.snakeBody.pop();
  }

  // 4. Check for Self Collision
  // Start loop from 1 to avoid checking the head against itself
  for (let i = 1; i < gameVariables.snakeBody.length; i++) {
    if (
      gameVariables.snakeX === gameVariables.snakeBody[i][0] &&
      gameVariables.snakeY === gameVariables.snakeBody[i][1]
    ) {
      return handleGameOver();
    }
  }

  // 5. Render the Board
  let html = `<div class="food" style="grid-area: ${gameVariables.foodY} / ${gameVariables.foodX}"></div>`;
  gameVariables.snakeBody.forEach(([x, y], index) => {
    const segmentClass = index === 0 ? "head" : "body";
    html += `<div class="${segmentClass}" style="grid-area: ${y} / ${x}"></div>`;
  });
  playBoard.innerHTML = html;
};

const startGame = () => {
  if (gameVariables.gameStarted && !gameVariables.gameOver) return;

  initGame(); // Reset the game state

  gameVariables.gameStarted = true;
  startBtn.innerText = "Running";
  startBtn.disabled = true;

  // Set the snake's starting position and render it immediately
  gameVariables.snakeBody.push([gameVariables.snakeX, gameVariables.snakeY]);
  let html = `<div class="food" style="grid-area: ${gameVariables.foodY} / ${gameVariables.foodX}"></div>`;
  html += `<div class="head" style="grid-area: ${gameVariables.snakeY} / ${gameVariables.snakeX}"></div>`;
  playBoard.innerHTML = html;

  // Start moving right by default
  gameVariables.velocityX = 1;
  currentDirection = "ArrowRight";
  document
    .querySelector('.arrow-grid i[data-key="ArrowRight"]')
    .classList.add("active");

  gameVariables.setIntervalId = setInterval(gameLoop, gameVariables.speed);
};

startBtn.addEventListener("click", startGame);

pauseBtn.addEventListener("click", () => {
  if (!gameVariables.gameStarted || gameVariables.gameOver) return;
  gameVariables.isPaused = !gameVariables.isPaused;
  pauseBtn.innerText = gameVariables.isPaused ? "Resume" : "Pause";
});

document.addEventListener("keyup", (e) => {
  if (e.code === "Space" || e.code === "Enter") {
    if (!gameVariables.gameStarted || gameVariables.gameOver) {
      startGame();
    }
  } else {
    changeDirection(e);
  }
});

const vibrate = () => {
  if (navigator.vibrate) navigator.vibrate(50);
};

controls.forEach((button) => {
  button.addEventListener("click", (e) => {
    changeDirection(e);
    vibrate();
  });
});
