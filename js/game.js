/* ================================================
   game.js — Core game state & shared utilities
   ================================================ */

// ---- GLOBAL GAME STATE ----
const state = {
  currentDoor: 0,
  completed:   [false, false, false, false],
  score:       0,
  agent:       'owl',
};

const HOUSES = [
  { name: 'Gryffindor', cls: 'house-gryff', emoji: '🦁', algo: 'Breadth-First Search' },
  { name: 'Ravenclaw',  cls: 'house-rav',   emoji: '🦅', algo: 'Depth-First Search'   },
  { name: 'Hufflepuff', cls: 'house-huff',  emoji: '🦡', algo: 'A* Search'             },
  { name: 'Slytherin',  cls: 'house-slyth', emoji: '🐍', algo: 'Minimax Strategy'      },
];

// ---- STARS BACKGROUND ----
function makeStars() {
  const bg = document.getElementById('starsBg');
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText =
      `left:${Math.random()*100}%;` +
      `top:${Math.random()*100}%;` +
      `--dur:${2 + Math.random()*4}s;` +
      `--op:${0.2 + Math.random()*0.6};` +
      `width:${1 + Math.random()*2}px;` +
      `height:${1 + Math.random()*2}px;`;
    bg.appendChild(s);
  }
}

// ---- CANDLES ----
function makeCandles() {
  const row = document.getElementById('candlesRow');
  row.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    row.innerHTML +=
      `<div class="candle">` +
        `<div class="candle-flame" style="animation-delay:${Math.random()*1.5}s"></div>` +
        `<div class="candle-body" style="height:${20 + Math.random()*20}px"></div>` +
      `</div>`;
  }
}

// ---- AGENT ----
function selectAgent(type) {
  state.agent = type;
  document.getElementById('agentAvatar').textContent = type === 'owl' ? '🦉' : '🧙‍♂️';
  document.getElementById('btnOwl').className    = 'agent-btn' + (type === 'owl'    ? ' active' : '');
  document.getElementById('btnWizard').className = 'agent-btn' + (type === 'wizard' ? ' active' : '');
}

// ---- PROGRESS TRACKER ----
function updateProgress() {
  for (let i = 0; i < 4; i++) {
    const pip = document.getElementById('pip' + i);
    pip.className = 'house-pip';
    if      (state.completed[i])   pip.classList.add('completed');
    else if (i === state.currentDoor) pip.classList.add('active');
    else                           pip.classList.add('locked');

    if (i < 3) {
      document.getElementById('conn' + i).className =
        'pip-connector' + (state.completed[i] ? ' lit' : '');
    }
  }
  document.getElementById('scoreDisplay').textContent = state.score;
}

// ---- DOOR ROUTER ----
function renderDoor(idx) {
  const house = HOUSES[idx];
  const rd    = document.getElementById('roomDisplay');

  if (idx > state.currentDoor) {
    rd.innerHTML = `
      <div class="door-card ${house.cls}">
        <div class="door-header">
          <div>
            <div class="door-house">${house.emoji} ${house.name}</div>
            <div class="door-algo">${house.algo}</div>
          </div>
          <div class="door-badge">SEALED</div>
        </div>
        <div class="lock-screen">
          <div class="lock-icon">🔒</div>
          <div class="lock-text">Complete previous challenges to unlock</div>
        </div>
      </div>`;
    return;
  }

  const done = state.completed[idx];
  switch (idx) {
    case 0: renderBFS(house, done);      break;
    case 1: renderDFS(house, done);      break;
    case 2: renderAStar(house, done);    break;
    case 3: renderMinimax(house, done);  break;
  }
}

// ---- DOOR COMPLETION ----
function onDoorComplete(doorIdx, points) {
  if (state.completed[doorIdx]) return;
  state.completed[doorIdx] = true;
  state.score += points;
  updateProgress();
  setTimeout(() => {
    const overlay = document.getElementById('success' + doorIdx);
    if (overlay) overlay.classList.add('visible');
  }, 500);
}

// ---- ADVANCE TO NEXT DOOR ----
function advanceDoor(doorIdx) {
  state.currentDoor = doorIdx;
  // Clear any running intervals from previous rooms
  if (typeof bfsInterval  !== 'undefined' && bfsInterval)  { clearInterval(bfsInterval);  bfsInterval  = null; }
  if (typeof dfsInterval  !== 'undefined' && dfsInterval)  { clearInterval(dfsInterval);  dfsInterval  = null; }
  if (typeof astarInterval !== 'undefined' && astarInterval){ clearInterval(astarInterval); astarInterval = null; }
  updateProgress();
  renderDoor(doorIdx);
}

// ---- SHOW CONGRATS ----
function showCongrats() {
  document.getElementById('finalScore').textContent = 'Score: ' + state.score + ' ✦';
  document.getElementById('congratsScreen').classList.add('visible');
}

// ---- RESTART ----
function restartGame() {
  state.currentDoor = 0;
  state.completed   = [false, false, false, false];
  state.score       = 0;
  document.getElementById('congratsScreen').classList.remove('visible');
  if (typeof bfsInterval  !== 'undefined' && bfsInterval)  { clearInterval(bfsInterval);  bfsInterval  = null; }
  if (typeof dfsInterval  !== 'undefined' && dfsInterval)  { clearInterval(dfsInterval);  dfsInterval  = null; }
  if (typeof astarInterval !== 'undefined' && astarInterval){ clearInterval(astarInterval); astarInterval = null; }
  updateProgress();
  renderDoor(0);
}

// ---- TOGGLE EXPLAIN PANEL ----
function toggleExplain(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('visible');
}
