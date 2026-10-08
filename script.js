const gameArea = document.getElementById('gameArea');
const butterflyContainer = document.getElementById('butterflyContainer');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const bestScoreEl = document.getElementById('bestScore');
const messageEl = document.getElementById('message');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

const GAME_TIME = 30;
let score = 0;
let timeLeft = GAME_TIME;
let bestScore = Number(localStorage.getItem('butterfly-best-score') || 0);
let timerInterval = null;
let butterflySpawnInterval = null;
let isGameRunning = false;
let isPaused = false;
let butterflies = [];

bestScoreEl.textContent = bestScore;

function createButterfly() {
  const butterfly = document.createElement('div');
  butterfly.className = 'butterfly';

  const leftWing = document.createElement('div');
  leftWing.className = 'wing left';

  const rightWing = document.createElement('div');
  rightWing.className = 'wing right';

  const body = document.createElement('div');
  body.className = 'body';

  butterfly.appendChild(leftWing);
  butterfly.appendChild(rightWing);
  butterfly.appendChild(body);

  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;
  const size = 50 + Math.random() * 30;

  const x = Math.random() * (areaWidth - size);
  const y = Math.random() * (areaHeight - size);

  butterfly.style.width = `${size}px`;
  butterfly.style.height = `${size * 0.72}px`;
  butterfly.style.left = `${x}px`;
  butterfly.style.top = `${y}px`;

  const colors = [
    ['#f472b6', '#f9a8d4'],
    ['#a78bfa', '#c4b5fd'],
    ['#34d399', '#86efac'],
    ['#fbbf24', '#fcd34d'],
    ['#60a5fa', '#93c5fd']
  ];

  const colorSet = colors[Math.floor(Math.random() * colors.length)];
  butterfly.style.setProperty('--wing-color-a', colorSet[0]);
  butterfly.style.setProperty('--wing-color-b', colorSet[1]);

  const dx = (Math.random() - 0.5) * 2.7;
  const dy = (Math.random() - 0.5) * 2.2;

  const butterflyData = {
    el: butterfly,
    x: x,
    y: y,
    dx,
    dy,
    size,
    active: true
  };

  butterfly.addEventListener('click', () => {
    if (!isGameRunning || isPaused || !butterflyData.active) return;
    butterflyData.active = false;
    butterfly.classList.add('dead');
    score += 1;
    scoreEl.textContent = score;
    messageEl.textContent = 'Nice catch!';

    setTimeout(() => {
      butterfly.remove();
      butterflies = butterflies.filter((item) => item !== butterflyData);
    }, 180);
  });

  butterflyContainer.appendChild(butterfly);
  butterflies.push(butterflyData);
  return butterflyData;
}

function updateButterflies() {
  if (!isGameRunning || isPaused) return;

  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;

  butterflies.forEach((butterfly) => {
    if (!butterfly.active) return;

    butterfly.x += butterfly.dx;
    butterfly.y += butterfly.dy;

    if (butterfly.x <= 0 || butterfly.x >= areaWidth - butterfly.size) {
      butterfly.dx *= -1;
      butterfly.x = Math.min(Math.max(butterfly.x, 0), areaWidth - butterfly.size);
    }

    if (butterfly.y <= 0 || butterfly.y >= areaHeight - butterfly.size) {
      butterfly.dy *= -1;
      butterfly.y = Math.min(Math.max(butterfly.y, 0), areaHeight - butterfly.size);
    }

    butterfly.el.style.left = `${butterfly.x}px`;
    butterfly.el.style.top = `${butterfly.y}px`;
  });
}

function startGame() {
  if (isGameRunning && !isPaused) return;

  isGameRunning = true;
  isPaused = false;
  score = 0;
  timeLeft = GAME_TIME;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  messageEl.textContent = 'Catch as many butterflies as you can!';

  butterflies.forEach((butterfly) => {
    butterfly.el.remove();
  });
  butterflies = [];

  for (let i = 0; i < 8; i += 1) {
    createButterfly();
  }

  clearInterval(timerInterval);
  clearInterval(butterflySpawnInterval);

  timerInterval = setInterval(() => {
    if (!isGameRunning || isPaused) return;

    timeLeft -= 1;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  butterflySpawnInterval = setInterval(() => {
    if (!isGameRunning || isPaused) return;
    createButterfly();
  }, 1200);

  setInterval(updateButterflies, 30);
}

function endGame() {
  isGameRunning = false;
  clearInterval(timerInterval);
  clearInterval(butterflySpawnInterval);

  if (score > bestScore) {
    bestScore = score;
    bestScoreEl.textContent = bestScore;
    localStorage.setItem('butterfly-best-score', String(bestScore));
  }

  messageEl.textContent = `Time's up! Final score: ${score}. Press Start to play again.`;
  startBtn.textContent = 'Play Again';
}

function togglePause() {
  if (!isGameRunning) {
    messageEl.textContent = 'Press Start to begin the game.';
    return;
  }

  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
  messageEl.textContent = isPaused ? 'Game paused.' : 'Catch as many butterflies as you can!';
}

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

window.addEventListener('resize', () => {
  butterflies.forEach((butterfly) => {
    if (!butterfly.active) return;

    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;

    butterfly.x = Math.min(Math.max(butterfly.x, 0), areaWidth - butterfly.size);
    butterfly.y = Math.min(Math.max(butterfly.y, 0), areaHeight - butterfly.size);
    butterfly.el.style.left = `${butterfly.x}px`;
    butterfly.el.style.top = `${butterfly.y}px`;
  });
});

startBtn.textContent = 'Start Game';
pauseBtn.textContent = 'Pause';
messageEl.textContent = 'Tap the butterflies before time runs out.';
