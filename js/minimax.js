/* ================================================
   minimax.js — Door 4: Slytherin — Minimax + Alpha-Beta
   ================================================

   DATA STRUCTURES USED:
     - board:    Array(9) — flat Tic-Tac-Toe board
                 null = empty, 'X' = human, 'O' = AI
     - Game tree: recursive call stack (implicit)
     - alpha:    Best score MAX player can guarantee (pruning bound)
     - beta:     Best score MIN player can guarantee (pruning bound)

   WINNING LINES: all rows, columns, and diagonals
     [[0,1,2],[3,4,5],[6,7,8],    ← rows
      [0,3,6],[1,4,7],[2,5,8],    ← columns
      [0,4,8],[2,4,6]]            ← diagonals

   PSEUDOCODE:
     minimax(board, depth, isMaximising, alpha, beta):
       if terminal(board): return evaluate(board, depth)
       if isMaximising:                    // AI turn
         best = -∞
         for each empty cell:
           board[cell] = 'O'
           score = minimax(board, depth+1, false, alpha, beta)
           board[cell] = null             // undo move
           best = max(best, score)
           alpha = max(alpha, best)
           if beta ≤ alpha: break         // α-β prune
         return best
       else:                              // Human turn
         best = +∞
         for each empty cell:
           board[cell] = 'X'
           score = minimax(board, depth+1, true, alpha, beta)
           board[cell] = null
           best = min(best, score)
           beta = min(beta, best)
           if beta ≤ alpha: break
         return best
   ================================================ */

let mmState = null;

// ---- WINNING LINES ----
const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],  // rows
  [0,3,6],[1,4,7],[2,5,8],  // columns
  [0,4,8],[2,4,6],           // diagonals
];

// ---- CHECK WINNER ----
function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

// ---- MINIMAX WITH ALPHA-BETA PRUNING ----
function minimax(board, depth, isMax, alpha, beta) {
  const winner = checkWinner(board);
  if (winner === 'O') return 10 - depth;    // AI wins — prefer faster wins
  if (winner === 'X') return depth - 10;    // Human wins — penalise
  if (board.every(c => c !== null)) return 0; // Draw
  if (depth > 6) return 0;                  // Depth limit safety

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best  = Math.max(best, minimax(board, depth+1, false, alpha, beta));
        board[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;             // Prune remaining branches
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best  = Math.min(best, minimax(board, depth+1, true, alpha, beta));
        board[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

// ---- INITIALISE A NEW DUEL ----
function initMinimax() {
  mmState = {
    board:          Array(9).fill(null),
    playerTurn:     true,   // true = X (human), false = O (AI)
    winner:         null,
    gameOver:       false,
    lastAiMove:     null,
    thinkingDepths: [],
  };
}

// ---- HUMAN MAKES A MOVE ----
function mmHumanMove(idx) {
  if (!mmState || mmState.gameOver || !mmState.playerTurn || mmState.board[idx]) return;

  mmState.board[idx] = 'X';
  const w = checkWinner(mmState.board);
  const full = mmState.board.every(c => c !== null);

  if (w || full) {
    mmState.winner   = w;
    mmState.gameOver = true;
    renderMMBoard();
    updateMMStatus();
    if (w === 'X') onDoorComplete(3, 60);   // human wins — top score
    else if (!w)   onDoorComplete(3, 30);   // draw
    else           onDoorComplete(3, 10);   // AI wins — still complete
    return;
  }

  mmState.playerTurn = false;
  renderMMBoard();
  updateMMStatus();
  setTimeout(mmAiMove, 450);                // slight delay for dramatic effect
}

// ---- AI MAKES A MOVE ----
function mmAiMove() {
  if (!mmState || mmState.gameOver) return;

  let bestScore = -Infinity, bestMove = null;
  const moveScores = [];

  // Evaluate every possible move
  for (let i = 0; i < 9; i++) {
    if (!mmState.board[i]) {
      mmState.board[i] = 'O';
      const s = minimax(mmState.board, 0, false, -Infinity, Infinity);
      mmState.board[i] = null;
      moveScores.push({ i, s });
      if (s > bestScore) { bestScore = s; bestMove = i; }
    }
  }

  mmState.thinkingDepths = moveScores;   // expose for educational display
  mmState.board[bestMove] = 'O';
  mmState.lastAiMove = bestMove;

  const w    = checkWinner(mmState.board);
  const full = mmState.board.every(c => c !== null);

  if (w || full) {
    mmState.winner   = w;
    mmState.gameOver = true;
    if (w === 'X')   onDoorComplete(3, 60);
    else if (!w)     onDoorComplete(3, 30);
    else             onDoorComplete(3, 10);
  }

  mmState.playerTurn = true;
  renderMMBoard();
  updateMMStatus();
}

// ---- DRAW THE GAME BOARD ----
function renderMMBoard() {
  const grid = document.getElementById('mmGrid');
  if (!grid) return;

  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'mm-cell';
    if      (mmState.board[i] === 'X') cell.textContent = '✦';  // human
    else if (mmState.board[i] === 'O') cell.textContent = '⬡';  // AI

    if (i === mmState.lastAiMove) cell.style.background = 'rgba(13,74,31,0.5)';

    if (!mmState.board[i] && !mmState.gameOver && mmState.playerTurn) {
      cell.onclick = () => mmHumanMove(i);
    }
    grid.appendChild(cell);
  }

  // Show the AI's evaluated scores for each candidate move
  const scoreDiv = document.getElementById('mmScores');
  if (scoreDiv && mmState.thinkingDepths.length) {
    scoreDiv.innerHTML =
      '<span style="color:var(--text-muted);font-size:11px;font-family:\'Cinzel\',serif">AI evaluated: </span>' +
      mmState.thinkingDepths.map(({ i, s }) =>
        `<span style="color:${s > 0 ? '#55CC88' : s < 0 ? '#FF6B6B' : '#FFD700'};font-size:11px">` +
        `Cell ${i+1}: ${s > 0 ? '+' : ''}${s}</span>`
      ).join(' &nbsp;');
  }
}

// ---- UPDATE STATUS LINE ----
function updateMMStatus() {
  const st = document.getElementById('mmStatus');
  if (!st) return;
  if      (mmState.winner === 'X') st.textContent = '✦ You won! The Serpent bows to your strategy!';
  else if (mmState.winner === 'O') st.textContent = '⬡ Slytherin AI wins! The serpent is cunning...';
  else if (mmState.gameOver)       st.textContent = 'A perfect draw — equally matched!';
  else if (mmState.playerTurn)     st.textContent = 'Your turn — you are ✦. Choose a cell!';
  else                             st.textContent = 'The Slytherin AI ponders its next move...';
}

// ---- RENDER THE DOOR CARD ----
function renderMinimax(house, isDone) {
  document.getElementById('roomDisplay').innerHTML = `
  <div class="door-card ${house.cls}" id="doorCard3">
    <div class="door-header">
      <div>
        <div class="door-house">${house.emoji} ${house.name}</div>
        <div class="door-algo">${house.algo} — Strategic Duel</div>
      </div>
      <div class="door-badge">${isDone ? '✓ UNLOCKED' : 'FINAL DOOR'}</div>
    </div>

    <div style="padding:4px 14px 0;font-size:12px;color:var(--text-muted);">
      You are <span style="color:#55CC88;font-weight:600">✦</span>.
      The AI serpent is <span style="color:silver;font-weight:600">⬡</span>.
      Win, draw, or survive — you still pass the door!
    </div>

    <div class="mm-status" id="mmStatus">Your turn — you are ✦. Choose a cell!</div>
    <div class="mm-board" id="mmGrid"></div>
    <div id="mmScores" style="padding:6px 14px;min-height:24px;line-height:2;"></div>

    <div class="info-panel" id="mmInfo">
      The Slytherin AI uses <strong>Minimax with Alpha-Beta pruning</strong> to evaluate every possible game tree.
      Each move score shows AI's calculated advantage: positive = AI wins, negative = you win, 0 = draw.
    </div>

    <div class="door-controls">
      <button class="btn-spell" onclick="initMinimax();renderMMBoard();updateMMStatus();document.getElementById('mmScores').innerHTML='';">↺ New Duel</button>
      <button class="btn-spell" onclick="toggleExplain('mmExplain')">📖 Learn</button>
    </div>

    <div class="explain-panel" id="mmExplain">
      <h4>Minimax + Alpha-Beta Pruning</h4>
      Minimax explores a complete game tree: the MAX player (AI) maximises its score,
      the MIN player (you) minimises the AI's score.<br><br>
      <strong>Alpha-Beta pruning</strong> cuts branches that cannot affect the final result,
      reducing the search tree from O(b^m) to O(b^(m/2)).<br><br>
      <strong>Data structure:</strong> Recursive game tree, depth-limited<br>
      <strong>Evaluation:</strong> +10−depth (AI win), −10+depth (human win), 0 (draw)<br>
      <strong>Key insight:</strong> With perfect play, Tic-Tac-Toe always ends in a draw.
      The AI is unbeatable — but can you force a draw?
    </div>

    <div class="success-overlay" id="success3">
      <div class="success-rune">🏆</div>
      <div class="success-title">Slytherin Door Unlocked!</div>
      <div class="success-desc">You have conquered all four algorithmic trials!<br>The castle escape is complete!</div>
      <button class="btn-next" onclick="showCongrats()">🧙 Claim Victory ✦</button>
    </div>
  </div>`;

  initMinimax();
  renderMMBoard();
  updateMMStatus();
  if (isDone) document.getElementById('success3').classList.add('visible');
}
