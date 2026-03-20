/* ================================================
   bfs.js — Door 1: Gryffindor — Breadth-First Search
   ================================================

   DATA STRUCTURES USED:
     - grid:       2D array (0 = open, 1 = wall)
     - queue:      Array used as FIFO (shift from front, push to back)
     - visited:    2D boolean array
     - parent:     2D array storing [row, col] of each node's parent
     - pathSet:    Set of "r,c" strings for the final shortest path
     - frontierSet: Set of nodes currently in the queue
     - visitedSet:  Set of nodes already explored

   PSEUDOCODE:
     BFS(start, end):
       queue = [start]
       visited[start] = true
       while queue not empty:
         node = queue.dequeue()
         if node == end: tracePath(); return
         for each neighbour of node:
           if not visited[neighbour] and not wall:
             visited[neighbour] = true
             parent[neighbour] = node
             queue.enqueue(neighbour)
   ================================================ */

let bfsState    = null;
let bfsInterval = null;

// ---- INITIALISE A NEW RANDOM MAZE ----
function initBFS() {
  const ROWS = 9, COLS = 15;
  const grid = [];

  for (let r = 0; r < ROWS; r++) {
    grid.push([]);
    for (let c = 0; c < COLS; c++) {
      // Border + checkerboard pillars + random walls
      const wall =
        (r === 0 || r === ROWS-1 || c === 0 || c === COLS-1) ? true :
        (r % 2 === 0 && c % 2 === 0) ? true :
        (Math.random() < 0.22) ? true : false;
      grid[r].push(wall ? 1 : 0);
    }
  }

  // Guarantee start & end are open
  const S = [1, 1], E = [ROWS-2, COLS-2];
  grid[S[0]][S[1]] = 0;   grid[E[0]][E[1]] = 0;
  grid[1][2] = 0;         grid[2][1] = 0;
  grid[ROWS-2][COLS-3] = 0; grid[ROWS-3][COLS-2] = 0;

  bfsState = {
    grid, ROWS, COLS, S, E,
    queue:       [S],
    visited:     Array.from({ length: ROWS }, (_, r) =>
                   Array.from({ length: COLS }, (_, c) => (r === S[0] && c === S[1]))),
    parent:      Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
    pathSet:     new Set(),
    frontierSet: new Set([`${S[0]},${S[1]}`]),
    visitedSet:  new Set(),
    done:  false,
    found: false,
    step:  0,
  };
}

// ---- SINGLE BFS STEP ----
function bfsStep() {
  if (!bfsState || bfsState.done) return;
  const { grid, ROWS, COLS, E, queue, visited, parent } = bfsState;

  if (!queue.length) { bfsState.done = true; return; }

  const [r, c] = queue.shift();           // dequeue (FIFO)
  bfsState.frontierSet.delete(`${r},${c}`);
  bfsState.visitedSet.add(`${r},${c}`);
  bfsState.step++;

  // Goal reached — trace back the shortest path
  if (r === E[0] && c === E[1]) {
    bfsState.done  = true;
    bfsState.found = true;
    let cur = [r, c];
    while (cur) {
      bfsState.pathSet.add(`${cur[0]},${cur[1]}`);
      cur = parent[cur[0]][cur[1]];
    }
    onDoorComplete(0, Math.max(10, 100 - bfsState.step));
    drawBFS();
    return;
  }

  // Expand neighbours (up, down, left, right)
  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS &&
        !visited[nr][nc] && grid[nr][nc] === 0) {
      visited[nr][nc]  = true;
      parent[nr][nc]   = [r, c];
      queue.push([nr, nc]);
      bfsState.frontierSet.add(`${nr},${nc}`);
    }
  }
  drawBFS();
}

// ---- DRAW THE BFS CANVAS ----
function drawBFS() {
  const canvas = document.getElementById('bfsCanvas');
  if (!canvas || !bfsState) return;
  const ctx = canvas.getContext('2d');
  const { grid, ROWS, COLS, S, E } = bfsState;
  const W = canvas.width, H = canvas.height;
  const cw = W / COLS, ch = H / ROWS;

  ctx.clearRect(0, 0, W, H);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const key = `${r},${c}`;
      if      (grid[r][c] === 1)                ctx.fillStyle = '#2a1a2e';               // wall
      else if (bfsState.pathSet.has(key))        ctx.fillStyle = '#FFD700';               // shortest path
      else if (bfsState.visitedSet.has(key))     ctx.fillStyle = 'rgba(139,0,0,0.6)';    // visited
      else if (bfsState.frontierSet.has(key))    ctx.fillStyle = 'rgba(255,100,100,0.8)';// frontier
      else                                        ctx.fillStyle = '#1a0f24';               // unvisited
      ctx.fillRect(c*cw + 1, r*ch + 1, cw - 2, ch - 2);
    }
  }

  // Start / End markers
  const fs = Math.min(cw, ch) * 0.7;
  ctx.font = `${fs}px sans-serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#00FF88';
  ctx.fillText('S', S[1]*cw + cw/2, S[0]*ch + ch/2);
  ctx.fillStyle = '#FF4444';
  ctx.fillText('E', E[1]*cw + cw/2, E[0]*ch + ch/2);

  // Update info panel
  const info = document.getElementById('bfsInfo');
  if (info) {
    if (bfsState.found)
      info.innerHTML = `<span class="info-step">PATH FOUND!</span> Reached exit in <span class="info-step">${bfsState.step}</span> BFS steps. Gold trail = shortest path.`;
    else
      info.innerHTML = `Queue: <span class="info-step">${bfsState.queue.length}</span> | Explored: <span class="info-step">${bfsState.visitedSet.size}</span> | Step: <span class="info-step">${bfsState.step}</span> — BFS explores all nodes at distance d before d+1`;
  }

  // Update stat chips
  const qs = document.getElementById('bfsQ'), vs = document.getElementById('bfsV');
  if (qs) qs.textContent = bfsState.queue.length;
  if (vs) vs.textContent = bfsState.visitedSet.size;
}

// ---- RUN / PAUSE ----
function bfsRun() {
  if (bfsInterval) {
    clearInterval(bfsInterval);
    bfsInterval = null;
    document.getElementById('bfsRunBtn').textContent = '⚡ Cast Spell';
    return;
  }
  document.getElementById('bfsRunBtn').textContent = '⏸ Pause';
  bfsInterval = setInterval(() => {
    if (!bfsState || bfsState.done) {
      clearInterval(bfsInterval);
      bfsInterval = null;
      return;
    }
    for (let i = 0; i < 3; i++) if (!bfsState.done) bfsStep();
  }, 80);
}

// ---- RENDER THE DOOR CARD ----
function renderBFS(house, isDone) {
  document.getElementById('roomDisplay').innerHTML = `
  <div class="door-card ${house.cls}" id="doorCard0">
    <div class="door-header">
      <div>
        <div class="door-house">${house.emoji} ${house.name}</div>
        <div class="door-algo">${house.algo} — Maze Pathfinding</div>
      </div>
      <div class="door-badge">${isDone ? '✓ UNLOCKED' : 'DOOR I'}</div>
    </div>

    <div class="viz-container">
      <canvas class="algo-canvas" id="bfsCanvas" width="450" height="150"></canvas>
    </div>

    <div class="legend">
      <div class="leg-item"><div class="leg-dot" style="background:#2a1a2e;border:1px solid #555"></div> Wall</div>
      <div class="leg-item"><div class="leg-dot" style="background:rgba(139,0,0,0.6)"></div> Visited</div>
      <div class="leg-item"><div class="leg-dot" style="background:rgba(255,100,100,0.8)"></div> Frontier</div>
      <div class="leg-item"><div class="leg-dot" style="background:#FFD700"></div> Shortest Path</div>
    </div>

    <div class="info-panel" id="bfsInfo">
      Press <strong>Cast Spell</strong> to activate BFS. The agent explores the maze level-by-level to find the shortest path.
    </div>

    <div class="door-controls">
      <button class="btn-spell btn-run" id="bfsRunBtn" onclick="bfsRun()">⚡ Cast Spell</button>
      <button class="btn-spell" onclick="bfsStep();bfsStep();bfsStep()">➤ Step</button>
      <button class="btn-spell" onclick="initBFS();drawBFS();document.getElementById('bfsRunBtn').textContent='⚡ Cast Spell';">↺ New Maze</button>
      <button class="btn-spell" onclick="toggleExplain('bfsExplain')">📖 Learn</button>
    </div>

    <div class="explain-panel" id="bfsExplain">
      <h4>BFS — Breadth-First Search</h4>
      BFS uses a <em>queue</em> (FIFO). It visits all neighbours at distance 1 before distance 2,
      guaranteeing the <strong>shortest path</strong> in unweighted graphs.<br><br>
      <strong>Data structure:</strong> Queue [ [row,col], ... ]<br>
      <strong>Time complexity:</strong> O(V + E)<br>
      <strong>Space complexity:</strong> O(V)<br>
      <strong>Key insight:</strong> The first time BFS reaches the goal node, it has found the optimal path.
    </div>

    <div class="stats-row">
      <div class="stat-chip">Queue: <span id="bfsQ">0</span></div>
      <div class="stat-chip">Visited: <span id="bfsV">0</span></div>
    </div>

    <div class="success-overlay" id="success0">
      <div class="success-rune">🔓</div>
      <div class="success-title">Gryffindor Door Unlocked!</div>
      <div class="success-desc">BFS found the shortest path through the maze.<br>The lion's door swings open...</div>
      <button class="btn-next" onclick="advanceDoor(1)">Proceed to Ravenclaw →</button>
    </div>
  </div>`;

  initBFS();
  drawBFS();
  if (isDone) document.getElementById('success0').classList.add('visible');
}
