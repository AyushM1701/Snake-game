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
  highScore: localStorage.getItem("high-score") || 0
};

const initGame = () => {
  const existingOverlay = document.querySelector('.game-over-overlay');
  if (existingOverlay) playBoard.removeChild(existingOverlay);
  
  gameVariables = {
    ...gameVariables,
    snakeX: 5,
    snakeY: 5,
    velocityX: 0,
    velocityY: 0,
    snakeBody: [],
    score: 0,
    level: 1,
    speed: 200,
    isPaused: false,
    gameOver: false
  };
  
  updateUI();
  updateFoodPosition();
  playBoard.innerHTML = "";
};

const updateUI = () => {
  scoreElement.innerText = `Score: ${gameVariables.score}`;
  levelElement.innerText = `Level: ${gameVariables.level}`;
  highScoreElement.innerText = `High Score: ${gameVariables.highScore}`;
  pauseBtn.innerText = "Pause";
};

const updateFoodPosition = () => {
  gameVariables.foodX = Math.floor(Math.random() * 30) + 1;
  gameVariables.foodY = Math.floor(Math.random() * 30) + 1;
};

const handleGameOver = () => {
  clearInterval(gameVariables.setIntervalId);
  gameVariables.gameOver = true;
  hitSound.play();
  
  const overlay = document.createElement('div');
  overlay.className = 'game-over-overlay';
  overlay.innerHTML = `
    <div class="game-over-text">GAME OVER</div>
    <div class="final-score">Score: ${gameVariables.score}</div>
    <div class="final-level">Level: ${gameVariables.level}</div>
    <div class="high-score-display">High Score: ${gameVariables.highScore}</div>
    <button class="restart-btn">Play Again</button>
  `;
  
  playBoard.appendChild(overlay);
  
  overlay.querySelector('.restart-btn').addEventListener('click', () => {
  startBtn.click(); // simulate click on the main Start button
});

  
  startBtn.innerText = "Restart";
  startBtn.disabled = false;
};

const changeDirection = (e) => {
  if (gameVariables.gameOver || !gameVariables.gameStarted) return;
  
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
  }
};

controls.forEach(button => button.addEventListener("click", changeDirection));

const checkLevelUp = () => {
  const newLevel = Math.floor(gameVariables.score / 5) + 1;
  if (newLevel > gameVariables.level) {
    gameVariables.level = newLevel;
    levelElement.innerText = `Level: ${gameVariables.level}`;
    levelupSound.play();
    
    // Increase speed (max 50ms min)
    gameVariables.speed = Math.max(200 - (gameVariables.level * 15), 50);
    clearInterval(gameVariables.setIntervalId);
    gameVariables.setIntervalId = setInterval(gameLoop, gameVariables.speed);
    
    // Visual feedback
    playBoard.style.boxShadow = "0 0 20px #33ccff";
    setTimeout(() => playBoard.style.boxShadow = "none", 300);
  }
};

const gameLoop = () => {
  if (gameVariables.gameOver || gameVariables.isPaused) return;

  let html = `<div class="food" style="grid-area: ${gameVariables.foodY} / ${gameVariables.foodX}"></div>`;
  
  // Check if snake ate food
  if (gameVariables.snakeX === gameVariables.foodX && gameVariables.snakeY === gameVariables.foodY) {
    eatSound.play();
    updateFoodPosition();
    gameVariables.snakeBody.push([gameVariables.foodY, gameVariables.foodX]);
    gameVariables.score++;
    scoreElement.innerText = `Score: ${gameVariables.score}`;
    checkLevelUp();

    if (gameVariables.score > gameVariables.highScore) {
      gameVariables.highScore = gameVariables.score;
      localStorage.setItem("high-score", gameVariables.highScore);
      highScoreElement.innerText = `High Score: ${gameVariables.highScore}`;
    }
  }

  // Update snake position
  gameVariables.snakeX += gameVariables.velocityX;
  gameVariables.snakeY += gameVariables.velocityY;

  // Shift snake body
  for (let i = gameVariables.snakeBody.length - 1; i > 0; i--) {
    gameVariables.snakeBody[i] = gameVariables.snakeBody[i - 1];
  }
  gameVariables.snakeBody[0] = [gameVariables.snakeX, gameVariables.snakeY];

  // Check collisions
  if (gameVariables.snakeX <= 0 || gameVariables.snakeX > 30 || 
      gameVariables.snakeY <= 0 || gameVariables.snakeY > 30) {
    return handleGameOver();
  }

  for (let i = 1; i < gameVariables.snakeBody.length; i++) {
    if (gameVariables.snakeX === gameVariables.snakeBody[i][0] && 
        gameVariables.snakeY === gameVariables.snakeBody[i][1]) {
      return handleGameOver();
    }
  }

  // Render snake
  gameVariables.snakeBody.forEach(([x, y], i) => {
    html += `<div class="head" style="grid-area: ${y} / ${x}"></div>`;
  });

  playBoard.innerHTML = html;
};

const startGame = () => {
  if (gameVariables.gameStarted && !gameVariables.gameOver) return;
  
  initGame();
  gameVariables.gameStarted = true;
  startBtn.innerText = "Running";
  startBtn.disabled = true;
  gameVariables.setIntervalId = setInterval(gameLoop, gameVariables.speed);
};

startBtn.addEventListener("click", startGame);

pauseBtn.addEventListener("click", () => {
  if (!gameVariables.gameStarted || gameVariables.gameOver) return;
  
  gameVariables.isPaused = !gameVariables.isPaused;
  pauseBtn.innerText = gameVariables.isPaused ? "Resume" : "Pause";
});

document.addEventListener("keyup", (e) => {
  changeDirection(e);
  if ((e.code === "Space" || e.code === "Enter") && (!gameVariables.gameStarted || gameVariables.gameOver)) {
    startGame();
  }
});
