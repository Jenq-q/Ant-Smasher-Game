let baseSpawnInterval = 1200; // Base spawn rate (slower start)
let i = 0;
let lives = 5;
let gamePaused = false;
let gameInterval;
let baseDeletionTime = 4000; // Base time before ant disappears (longer)
let gameOver = false;
let highscores = [];

const squashSound = new Audio("./assets/squash sound.mp3");

const resetButton = document.getElementById("reset");
resetButton.onclick = restart;

const highscoreBtn = document.getElementById("highscoreBtn");
highscoreBtn.onclick = toggleHighscores;

const scoreDiv = document.getElementById("score");
const livesDiv = document.getElementById("lives");
const gameCanvas = document.getElementById("gameCanvas");
const highscorePanel = document.getElementById("highscorePanel");
const highscoreList = document.getElementById("highscoreList");

// Load highscores from memory (since localStorage not available)
loadHighscores();
updateDisplay();

function updateDisplay() {
  scoreDiv.textContent = "Score: " + i;
  livesDiv.textContent = "Lives: " + "❤️".repeat(lives);
}

function loadHighscores() {
  // Initialize with some sample scores if empty
  if (highscores.length === 0) {
    highscores = [];
  }
  renderHighscores();
}

function saveHighscore(name, score) {
  highscores.push({ name: name, score: score });
  highscores.sort((a, b) => b.score - a.score);
  highscores = highscores.slice(0, 10); // Keep top 10
  renderHighscores();
}

function renderHighscores() {
  if (highscores.length === 0) {
    highscoreList.innerHTML = '<div class="no-scores">No scores yet!</div>';
    return;
  }

  let html = "";
  highscores.forEach((entry, index) => {
    let className = "highscore-entry";
    if (index === 0) className += " top1";
    else if (index < 3) className += " top3";

    html += `
                    <div class="${className}">
                        <span class="highscore-rank">#${index + 1}</span>
                        <span class="highscore-name">${entry.name}</span>
                        <span class="highscore-score">${entry.score}</span>
                    </div>
                `;
  });
  highscoreList.innerHTML = html;
}

function toggleHighscores() {
  highscorePanel.classList.toggle("open");
}

function isHighscore(score) {
  return (
    highscores.length < 10 || score > highscores[highscores.length - 1].score
  );
}

function startGame() {
  if (gameOver) return;
  gameInterval = setInterval(spawnAnt, getCurrentSpawnInterval());
}

function getCurrentSpawnInterval() {
  // Decrease spawn interval by 15ms for every 5 points, minimum 300ms
  return Math.max(300, baseSpawnInterval - Math.floor(i / 3) * 50);
}

function getCurrentDeletionTime() {
  // Decrease deletion time by 100ms for every 8 points, minimum 1500ms
  return Math.max(1500, baseDeletionTime - Math.floor(i / 5) * 300);
}

function spawnAnt() {
  if (gamePaused || gameOver) return;

  const antDiv = document.createElement("div");
  antDiv.className = "ant";
  antDiv.onclick = antClicked;

  const antSize = 25;
  antDiv.style.position = "absolute";

  // Fixed positioning - removed the margin issue
  antDiv.style.top = Math.random() * (gameCanvas.clientHeight - antSize) + "px";
  antDiv.style.left = Math.random() * (gameCanvas.clientWidth - antSize) + "px";

  const antImg = document.createElement("img");
  antImg.src =
    "https://img.icons8.com/?size=100&id=9234&format=png&color=000000";
  antImg.width = 25;
  antDiv.appendChild(antImg);
  gameCanvas.appendChild(antDiv);

  // Remove ant after dynamic time if not clicked
  setTimeout(function () {
    if (antDiv.parentNode) {
      antDiv.remove();
      // Lose a life when ant escapes
      loseLife();
    }
  }, getCurrentDeletionTime());

  // Update spawn rate for next ant
  clearInterval(gameInterval);
  gameInterval = setInterval(spawnAnt, getCurrentSpawnInterval());

  console.log(
    "Spawn interval:",
    getCurrentSpawnInterval(),
    "Deletion time:",
    getCurrentDeletionTime()
  );
}

function loseLife() {
  if (gameOver) return;

  lives--;
  updateDisplay();

  if (lives <= 0) {
    endGame();
  }
}

function endGame() {
  gameOver = true;
  gamePaused = true;
  clearInterval(gameInterval);

  // Create game over screen
  const gameOverDiv = document.createElement("div");
  gameOverDiv.className = "game-over";

  if (isHighscore(i)) {
    gameOverDiv.innerHTML = `
                    <h2>🎉 New High Score!</h2>
                    <p>Your Score: ${i}</p>
                    <input type="text" id="playerName" placeholder="Enter your name" maxlength="20">
                    <br>
                    <button onclick="submitHighscore()">Submit Score</button>
                    <button onclick="restart()">Play Again</button>
                `;
  } else {
    gameOverDiv.innerHTML = `
                    <h2>Game Over!</h2>
                    <p>Final Score: ${i}</p>
                    <button onclick="restart()">Play Again</button>
                `;
  }

  gameCanvas.appendChild(gameOverDiv);
}

function submitHighscore() {
  const nameInput = document.getElementById("playerName");
  const name = nameInput.value.trim() || "Anonymous";

  saveHighscore(name, i);

  // Update game over screen
  const gameOverDiv = document.querySelector(".game-over");
  gameOverDiv.innerHTML = `
                <h2>Score Saved!</h2>
                <p>Name: ${name}</p>
                <p>Score: ${i}</p>
                <button onclick="restart()">Play Again</button>
            `;
}

function restart() {
  i = 0;
  lives = 5;
  gameOver = false;
  gamePaused = false;
  updateDisplay();

  // Clear all ants and game over screen
  document.querySelectorAll(".ant").forEach((ant) => ant.remove());
  const gameOverScreen = document.querySelector(".game-over");
  if (gameOverScreen) gameOverScreen.remove();

  clearInterval(gameInterval);
  startGame();
}

function resumeGame() {
  if (!gameOver) {
    gamePaused = false;
    startGame();
  }
}

function antClicked() {
  if (this.classList.contains("clicked")) return;
  this.classList.add("clicked");
  let clickedAnt = this.querySelector("img");
  clickedAnt.src =
    "https://img.icons8.com/?size=100&id=122601&format=png&color=000000";

  // Remove the ant element after showing squashed image
  setTimeout(() => {
    this.remove();
  }, 500);

  // Play squash sound
  squashSound.currentTime = 0;
  squashSound.play();

  i++;
  updateDisplay();
}

// Add pause/resume functionality
window.addEventListener("keydown", function (e) {
  if (e.code === "Space" && !gameOver) {
    if (gamePaused) {
      resumeGame();
    } else {
      gamePaused = true;
      clearInterval(gameInterval);
    }
  }
});

// Close highscore panel when clicking outside
document.addEventListener("click", function (e) {
  if (!highscorePanel.contains(e.target) && !highscoreBtn.contains(e.target)) {
    highscorePanel.classList.remove("open");
  }
});

// Start the game
startGame();
