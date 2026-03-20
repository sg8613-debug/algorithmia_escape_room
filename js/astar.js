/* ================================================
   astar.js — Door 3: Hufflepuff — A* Search
   ================================================

   DATA STRUCTURES USED:
     - grid:     2D array (0 = open, 1 = wall)
     - open:     Set of "r,c" strings (open list — candidates to explore)
     - closed:   Set of "r,c" strings (already expanded nodes)
     - gScore:   Object — g(n): exact cost from start to node n
     - fScore:   Object — f(n) = g(n) + h(n): estimated total cost
     - parent:   Object — maps "r,c" → "parentR,parentC"
     - pathSet:  Set of nodes on the optimal path

   HEURISTIC: Manhattan distance h(n) = |r-goalR| + |c-goalC|
   This is admissible (never overestimates) so A* is optimal.

   PSEUDOCODE:
     A*(start, end):
       open = { start }
       g[start] = 0
       f[start] = h(start, end)
       while open not empty:
         current = node in open with lowest f score
         if current == end: tracePath(); return
         open.remove(current); closed.add(current)
         for each neighbour of current:
           if neighbour in closed: skip
           tentativeG = g[current] + 1
           if tentativeG < g[neighbour]:
             parent[neighbour] = current
             g[neighbour] = tentativeG
             f[neighbour] = tentativeG + h(neighbour, end)
             open.add(neighbour)
   ================================================ */

let astarState    = null;
let astarInterval = null;

// ---- MANHATTAN DISTANCE HEURISTIC ----
function heuristic(r1, c1, r2, c2) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

// ---- INITIALISE A NEW RANDOM MAP ----
function initAStar() {
  const ROWS = 9, COLS = 15;
  const grid = [];

  for (let r = 0; r < ROWS; r++) {
    grid.push([]);
    for (let c = 0; c < COLS; c++) {
      const wall =
        (r === 0 || r === ROWS-1 || c === 0 || c === COLS-1) ? true :
        (Math.random() < 0.25) ? true : false;
      grid[r].push(wall ? 1 : 0);
    }
  }

  const S = [1, 1], E = [ROWS-2, COLS-2];
  grid[S[0]][S[1]] = 0; grid[E[0]][E[1]] = 0;
  grid[1][2] = 0; grid[2][1] = 0;
  grid[ROWS-2][COLS-3] = 0; grid[ROWS-3][COLS-2] = 0;

  const startKey = `${S[0]},${S[1]}`;
  const gScore   = { [startKey]: 0 };
  const fScore   = { [startKey]: heuristic(S[0], S[1], E[0], E[1]) };

  astarState = {
    grid, ROWS, COLS, S, E,
    open:        new Set([startKey]),
    closed:      new Set(),
    gScore,
    fScore,
    parent:      {},
    pathSet:     new Set(),
    done:        false,
    found:       false,
    step:        0,
    currentNode: null,
  };
}

// ---- SINGLE A* STEP ----
function astarStep() {
  if (!astarState || astarState.done) return;
  const { grid, ROWS, COLS, E, open, closed, gScore, fScore, parent } = astarState;

  if (!open.size) { astarState.done = true; return; }

  // Pick node with lowest f-score from the open set
  let best = null, bestF = Infinity;
  for (const key of open) {
    if ((fScore[key] || Infinity) < bestF) {
      bestF = fScore[key];
      best  = key;
    }
  }

  const [r, c] = best.split(',').map(Number);
  astarState.currentNode = [r, c];
  astarState.step++;

  // Goal reached
  if (r === E[0] && c === E[1]) {
    astarState.done  = true;
    astarState.found = true;
    let cur = best;
    while (cur) { astarState.pathSet.add(cur); cur = parent[cur]; }
    onDoorComplete(2, Math.max(10, 90 - astarState.step));
    drawAStar();
    return;
  }

  open.delete(best);
  closed.add(best);

  // Expand neighbours
  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
    const nr = r + dr, nc = c + dc;
    const nk = `${nr},${nc}`;
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS ||
        grid[nr][nc] === 1 || closed.has(nk)) continue;

    const tentG = (gScore[best] || 0) + 1;
    if (!open.has(nk) || tentG < (gScore[nk] || Infinity)) {
      parent[nk]  = best;
      gScore[nk]  = tentG;
      fScore[nk]  = tentG + heuristic(nr, nc, E[0], E[1]);
      open.add(nk);
    }
  }
  drawAStar();
}

// ---- DRAW THE A* CANVAS ----
function drawAStar() {
  const canvas = document.getElementById('astarCanvas');
  if (!canvas || !astarState) return;
  const ctx = canvas.getContext('2d');
  const { grid, ROWS, COLS, S, E, open, closed, fScore } = astarState;
  const W = canvas.width, H = canvas.height;
  const cw = W / COLS, ch = H / ROWS;

  ctx.clearRect(0, 0, W, H);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const key = `${r},${c}`;
      if (grid[r][c] === 1) {
        ctx.fillStyle = '#2d1f00';
      } else if (astarState.pathSet.has(key)) {
        ctx.fillStyle = '#FFD700';                              // optimal path
      } else if (astarState.currentNode &&
                 astarState.currentNode[0] === r &&
                 astarState.currentNode[1] === c) {
        ctx.fillStyle = '#FF8C00';                              // current node
      } else if (closed.has(key)) {
        ctx.fillStyle = 'rgba(107,83,16,0.55)';                // closed
      } else if (open.has(key)) {
        const h = heuristic(r, c, E[0], E[1]);
        const t = Math.min(1, h / 10);
        ctx.fillStyle = `rgba(255,${Math.round(180 - t*100)},0,0.7)`;  // open — warm colour
      } else {
        ctx.fillStyle = '#1a1000';
      }
      ctx.fillRect(c*cw + 1, r*ch + 1, cw - 2, ch - 2);

      // Display f-score on open cells when large enough
      if (open.has(key) && cw > 14) {
        ctx.fillStyle    = 'rgba(255,255,255,0.6)';
        ctx.font         = `${Math.min(cw, ch) * 0.35}px sans-serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(fScore[key] || 0), c*cw + cw/2, r*ch + ch/2);
      }
    }
  }

  // Start / End markers
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${Math.min(cw, ch) * 0.7}px sans-serif`;
  ctx.fillStyle = '#00FF88'; ctx.fillText('S', S[1]*cw + cw/2, S[0]*ch + ch/2);
  ctx.fillStyle = '#FF6644'; ctx.fillText('E', E[1]*cw + cw/2, E[0]*ch + ch/2);

  // Agent icon at current node
  if (astarState.currentNode) {
    ctx.font = `${Math.min(cw, ch) * 0.75}px sans-serif`;
    ctx.fillText(
      state.agent === 'owl' ? '🦉' : '🧙',
      astarState.currentNode[1]*cw + cw/2,
      astarState.currentNode[0]*ch + ch/2
    );
  }

  // Info panel
  const info = document.getElementById('astarInfo');
  if (info) {
    if (astarState.found)
      info.innerHTML = `<span class="info-step">OPTIMAL PATH FOUND!</span> A* solved in <span class="info-step">${astarState.step}</span> steps. Numbers on cells = f(n) = g(n) + h(n).`;
    else
      info.innerHTML = `Open: <span class="info-step">${open.size}</span> | Closed: <span class="info-step">${closed.size}</span> | Step: <span class="info-step">${astarState.step}</span> — Orange cells show f(n) cost estimates`;
  }

  const ao = document.getElementById('astarO');
  const ac = document.getElementById('astarC');
  const as = document.getElementById('astarSt');
  if (ao) ao.textContent = open.size;
  if (ac) ac.textContent = closed.size;
  if (as) as.textContent = astarState.step;
}

// ---- RUN / PAUSE ----
function astarRun() {
  if (astarInterval) {
    clearInterval(astarInterval);
    astarInterval = null;
    document.getElementById('astarRunBtn').textContent = '⚡ Cast Spell';
    return;
  }
  document.getElementById('astarRunBtn').textContent = '⏸ Pause';
  astarInterval = setInterval(() => {
    if (!astarState || astarState.done) {
      clearInterval(astarInterval);
      astarInterval = null;
      return;
    }
    for (let i = 0; i < 2; i++) if (!astarState.done) astarStep();
  }, 90);
}

// ---- RENDER THE DOOR CARD ----
function renderAStar(house, isDone) {
  document.getElementById('roomDisplay').innerHTML = `
  <div class="door-card ${house.cls}" id="doorCard2">
    <div class="door-header">
      <div>
        <div class="door-house">${house.emoji} ${house.name}</div>
        <div class="door-algo">${house.algo} — Heuristic Navigation</div>
      </div>
      <div class="door-badge">${isDone ? '✓ UNLOCKED' : 'DOOR III'}</div>
    </div>

    <div class="viz-container">
      <canvas class="algo-canvas" id="astarCanvas" width="450" height="150"></canvas>
    </div>

    <div class="legend">
      <div class="leg-item"><div class="leg-dot" style="background:#2d1f00;border:1px solid #555"></div> Wall</div>
      <div class="leg-item"><div class="leg-dot" style="background:rgba(107,83,16,0.55)"></div> Closed</div>
      <div class="leg-item"><div class="leg-dot" style="background:rgba(255,180,0,0.7)"></div> Open (f-score shown)</div>
      <div class="leg-item"><div class="leg-dot" style="background:#FFD700"></div> Optimal Path</div>
    </div>

    <div class="astar-legend">f(n) = g(n) + h(n) &nbsp;|&nbsp; g = cost from start &nbsp;|&nbsp; h = Manhattan distance to goal</div>

    <div class="info-panel" id="astarInfo">
      Press <strong>Cast Spell</strong> to activate A*. Watch how heuristic values guide the agent efficiently toward the exit.
    </div>

    <div class="door-controls">
      <button class="btn-spell btn-run" id="astarRunBtn" onclick="astarRun()">⚡ Cast Spell</button>
      <button class="btn-spell" onclick="astarStep();astarStep()">➤ Step</button>
      <button class="btn-spell" onclick="initAStar();drawAStar();document.getElementById('astarRunBtn').textContent='⚡ Cast Spell';">↺ New Map</button>
      <button class="btn-spell" onclick="toggleExplain('astarExplain')">📖 Learn</button>
    </div>

    <div class="explain-panel" id="astarExplain">
      <h4>A* Search</h4>
      A* combines BFS's completeness with a <em>heuristic</em> to guide search toward the goal.<br><br>
      f(n) = g(n) + h(n)<br>
      &nbsp; g(n) = exact cost from start to n<br>
      &nbsp; h(n) = heuristic estimate from n to goal (Manhattan distance here)<br><br>
      <strong>Data structure:</strong> Priority queue (min-heap) ordered by f-score<br>
      <strong>Time complexity:</strong> O(E log V)<br>
      <strong>Space complexity:</strong> O(V)<br>
      <strong>Key insight:</strong> With an admissible heuristic (never overestimates), A* is both complete and optimal.
    </div>

    <div class="stats-row">
      <div class="stat-chip">Open: <span id="astarO">1</span></div>
      <div class="stat-chip">Closed: <span id="astarC">0</span></div>
      <div class="stat-chip">Steps: <span id="astarSt">0</span></div>
    </div>

    <div class="success-overlay" id="success2">
      <div class="success-rune">🔓</div>
      <div class="success-title">Hufflepuff Door Unlocked!</div>
      <div class="success-desc">A* charted the optimal magical route.<br>The badger's door glows open...</div>
      <button class="btn-next" onclick="advanceDoor(3)">Proceed to Slytherin →</button>
    </div>
  </div>`;

  initAStar();
  drawAStar();
  if (isDone) document.getElementById('success2').classList.add('visible');
}
