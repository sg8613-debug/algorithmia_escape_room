/* ================================================
   dfs.js — Door 2: Ravenclaw — Depth-First Search
   ================================================

   DATA STRUCTURES USED:
     - grid:        2D array (0 = open, 1 = wall)
     - stack:       Array used as LIFO (push/pop from end)
     - visited:     Set of "r,c" strings
     - parent:      Object mapping "r,c" → [parentR, parentC]
     - currentPath: Set of nodes currently on the active DFS stack
     - pathSet:     Set of nodes on the final traced path
     - artifacts:   Array of [r,c] hidden gem positions

   PSEUDOCODE:
     DFS(start, end):
       stack = [start]
       visited.add(start)
       while stack not empty:
         node = stack.peek()            // look at top, don't pop yet
         if node == end: tracePath(); return
         neighbour = first unvisited neighbour of node
         if neighbour exists:
           visited.add(neighbour)
           parent[neighbour] = node
           stack.push(neighbour)
         else:
           stack.pop()                  // backtrack
   ================================================ */

let dfsState    = null;
let dfsInterval = null;

// ---- INITIALISE A NEW RANDOM MAZE ----
function initDFS() {
  const ROWS = 9, COLS = 15;
  const grid = [];

  for (let r = 0; r < ROWS; r++) {
    grid.push([]);
    for (let c = 0; c < COLS; c++) {
      const wall =
        (r === 0 || r === ROWS-1 || c === 0 || c === COLS-1) ? true :
        (Math.random() < 0.28) ? true : false;
      grid[r].push(wall ? 1 : 0);
    }
  }

  const S = [1, 1], E = [ROWS-2, COLS-2];
  grid[S[0]][S[1]] = 0; grid[E[0]][E[1]] = 0;
  grid[1][2] = 0; grid[2][1] = 0;
  grid[ROWS-2][COLS-3] = 0; grid[ROWS-3][COLS-2] = 0;

  // Place 3 hidden gem artifacts
  const artifacts = [];
  for (let a = 0; a < 3; a++) {
    let ar, ac;
    do {
      ar = 1 + Math.floor(Math.random() * (ROWS - 2));
      ac = 1 + Math.floor(Math.random() * (COLS - 2));
    } while (
      grid[ar][ac] === 1 ||
      (ar === S[0] && ac === S[1]) ||
      (ar === E[0] && ac === E[1])
    );
    artifacts.push([ar, ac]);
  }

  dfsState = {
    grid, ROWS, COLS, S, E,
    stack:       [S],
    visited:     new Set([`${S[0]},${S[1]}`]),
    parent:      { [`${S[0]},${S[1]}`]: null },
    pathSet:     new Set(),
    currentPath: new Set([`${S[0]},${S[1]}`]),
    done:  false,
    found: false,
    step:  0,
    artifacts,
  };
}

// ---- SINGLE DFS STEP ----
function dfsStep() {
  if (!dfsState || dfsState.done) return;
  const { grid, ROWS, COLS, E, stack, visited, parent } = dfsState;

  if (!stack.length) { dfsState.done = true; return; }

  const [r, c] = stack[stack.length - 1];   // peek top of stack
  dfsState.step++;

  if (r === E[0] && c === E[1]) {
    dfsState.done  = true;
    dfsState.found = true;
    // Trace path back from goal to start
    let cur = `${r},${c}`;
    while (cur) {
      dfsState.pathSet.add(cur);
      const p = parent[cur];
      cur = p ? `${p[0]},${p[1]}` : null;
    }
    onDoorComplete(1, Math.max(10, 80 - Math.floor(dfsState.step * 0.5)));
    drawDFS();
    return;
  }

  // Try to go deeper; if no unvisited neighbours, backtrack
  let pushed = false;
  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
    const nr = r + dr, nc = c + dc;
    const key = `${nr},${nc}`;
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS &&
        !visited.has(key) && grid[nr][nc] === 0) {
      visited.add(key);
      parent[key] = [r, c];
      stack.push([nr, nc]);
      dfsState.currentPath.add(key);
      pushed = true;
      break;
    }
  }
  if (!pushed) stack.pop();   // backtrack

  drawDFS();
}

// ---- DRAW THE DFS CANVAS ----
function drawDFS() {
  const canvas = document.getElementById('dfsCanvas');
  if (!canvas || !dfsState) return;
  const ctx = canvas.getContext('2d');
  const { grid, ROWS, COLS, S, E, artifacts } = dfsState;
  const W = canvas.width, H = canvas.height;
  const cw = W / COLS, ch = H / ROWS;

  ctx.clearRect(0, 0, W, H);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const key = `${r},${c}`;
      if      (grid[r][c] === 1)                ctx.fillStyle = '#0a1a3e';
      else if (dfsState.pathSet.has(key))        ctx.fillStyle = '#C0C0C0';               // final path (silver)
      else if (dfsState.currentPath.has(key))    ctx.fillStyle = 'rgba(107,179,255,0.7)'; // active stack
      else if (dfsState.visited.has(key))        ctx.fillStyle = 'rgba(30,60,120,0.6)';   // visited
      else                                        ctx.fillStyle = '#0d1525';
      ctx.fillRect(c*cw + 1, r*ch + 1, cw - 2, ch - 2);
    }
  }

  const fs = Math.min(cw, ch) * 0.65;
  ctx.font = `${fs}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

  // Draw undiscovered artifacts
  for (const [ar, ac] of artifacts) {
    if (!dfsState.visited.has(`${ar},${ac}`)) {
      ctx.fillText('💎', ac*cw + cw/2, ar*ch + ch/2);
    }
  }

  ctx.fillStyle = '#00FF88';
  ctx.fillText('S', S[1]*cw + cw/2, S[0]*ch + ch/2);
  ctx.fillStyle = '#6BB3FF';
  ctx.fillText('E', E[1]*cw + cw/2, E[0]*ch + ch/2);

  // Agent at top of stack
  if (dfsState.stack.length) {
    const [ar, ac] = dfsState.stack[dfsState.stack.length - 1];
    ctx.font = `${Math.min(cw, ch) * 0.75}px sans-serif`;
    ctx.fillText(state.agent === 'owl' ? '🦉' : '🧙', ac*cw + cw/2, ar*ch + ch/2);
  }

  // Update info panel
  const info = document.getElementById('dfsInfo');
  if (info) {
    if (dfsState.found)
      info.innerHTML = `<span class="info-step">EXIT FOUND!</span> DFS reached the target in <span class="info-step">${dfsState.step}</span> steps. Silver = DFS path.`;
    else
      info.innerHTML = `Stack depth: <span class="info-step">${dfsState.stack.length}</span> | Visited: <span class="info-step">${dfsState.visited.size}</span> | Step: <span class="info-step">${dfsState.step}</span> — DFS dives deep before backtracking`;
  }

  const ss = document.getElementById('dfsS'), vs = document.getElementById('dfsV');
  if (ss) ss.textContent = dfsState.stack.length;
  if (vs) vs.textContent = dfsState.visited.size;
}

// ---- RUN / PAUSE ----
function dfsRun() {
  if (dfsInterval) {
    clearInterval(dfsInterval);
    dfsInterval = null;
    document.getElementById('dfsRunBtn').textContent = '⚡ Cast Spell';
    return;
  }
  document.getElementById('dfsRunBtn').textContent = '⏸ Pause';
  dfsInterval = setInterval(() => {
    if (!dfsState || dfsState.done) {
      clearInterval(dfsInterval);
      dfsInterval = null;
      return;
    }
    for (let i = 0; i < 2; i++) if (!dfsState.done) dfsStep();
  }, 80);
}

// ---- RENDER THE DOOR CARD ----
function renderDFS(house, isDone) {
  document.getElementById('roomDisplay').innerHTML = `
  <div class="door-card ${house.cls}" id="doorCard1">
    <div class="door-header">
      <div>
        <div class="door-house">${house.emoji} ${house.name}</div>
        <div class="door-algo">${house.algo} — Deep Corridor Exploration</div>
      </div>
      <div class="door-badge">${isDone ? '✓ UNLOCKED' : 'DOOR II'}</div>
    </div>

    <div class="viz-container">
      <canvas class="algo-canvas" id="dfsCanvas" width="450" height="150"></canvas>
    </div>

    <div class="legend">
      <div class="leg-item"><div class="leg-dot" style="background:#0a1a3e;border:1px solid #555"></div> Wall</div>
      <div class="leg-item"><div class="leg-dot" style="background:rgba(30,60,120,0.6)"></div> Visited</div>
      <div class="leg-item"><div class="leg-dot" style="background:rgba(107,179,255,0.7)"></div> Current Stack</div>
      <div class="leg-item"><div class="leg-dot" style="background:#C0C0C0"></div> Final Path</div>
    </div>

    <div class="info-panel" id="dfsInfo">
      Press <strong>Cast Spell</strong> to send your agent deep into Ravenclaw's corridors. Find hidden 💎 artifacts along the way!
    </div>

    <div class="door-controls">
      <button class="btn-spell btn-run" id="dfsRunBtn" onclick="dfsRun()">⚡ Cast Spell</button>
      <button class="btn-spell" onclick="dfsStep();dfsStep();dfsStep()">➤ Step</button>
      <button class="btn-spell" onclick="initDFS();drawDFS();document.getElementById('dfsRunBtn').textContent='⚡ Cast Spell';">↺ New Maze</button>
      <button class="btn-spell" onclick="toggleExplain('dfsExplain')">📖 Learn</button>
    </div>

    <div class="explain-panel" id="dfsExplain">
      <h4>DFS — Depth-First Search</h4>
      DFS uses a <em>stack</em> (LIFO). It dives as deep as possible down one branch before backtracking.<br><br>
      <strong>Data structure:</strong> Stack [ [row,col], ... ]<br>
      <strong>Time complexity:</strong> O(V + E)<br>
      <strong>Space complexity:</strong> O(V)<br>
      <strong>Key insight:</strong> DFS doesn't guarantee the shortest path but excels at exhaustive exploration
      and is memory-efficient for deep searches.
    </div>

    <div class="stats-row">
      <div class="stat-chip">Stack: <span id="dfsS">0</span></div>
      <div class="stat-chip">Visited: <span id="dfsV">0</span></div>
    </div>

    <div class="success-overlay" id="success1">
      <div class="success-rune">🔓</div>
      <div class="success-title">Ravenclaw Door Unlocked!</div>
      <div class="success-desc">DFS navigated the deep corridors.<br>The eagle's door creaks open...</div>
      <button class="btn-next" onclick="advanceDoor(2)">Proceed to Hufflepuff →</button>
    </div>
  </div>`;

  initDFS();
  drawDFS();
  if (isDone) document.getElementById('success1').classList.add('visible');
}
