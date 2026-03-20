# Algorithmia Escape Room 🧙‍♂️✦
### A Hogwarts-Inspired AI Escape Room

---

## How to Run Locally

### Option 1 — Simplest (just double-click)
1. Unzip the folder
2. Double-click `index.html`
3. It opens in your default browser — done!

> ⚠️ Note: Fonts (Cinzel + Crimson Text) load from Google Fonts and need an internet connection on first load. After that they may be cached. The game logic works fully offline.

### Option 2 — Local server (recommended for best experience)
If you have Python installed:

```bash
cd algorithmia_escape_room
python -m http.server 8080
```
Then open: http://localhost:8080

Or with Node.js (npx):
```bash
npx serve .
```

---

## Project Structure

```
algorithmia_escape_room/
├── index.html          ← Main HTML page
├── css/
│   └── style.css       ← All styles (dark theme, animations, layouts)
└── js/
    ├── game.js         ← Core game state, progress tracker, door router
    ├── bfs.js          ← Door 1: Gryffindor — Breadth-First Search
    ├── dfs.js          ← Door 2: Ravenclaw  — Depth-First Search
    ├── astar.js        ← Door 3: Hufflepuff — A* Search
    ├── minimax.js      ← Door 4: Slytherin  — Minimax + Alpha-Beta
    └── main.js         ← Entry point (boots the game on page load)
```

---

## The Four Algorithmic Doors

| Door | House      | Algorithm          | Puzzle                        |
|------|------------|--------------------|-------------------------------|
| I    | Gryffindor | Breadth-First Search | Find shortest path in maze  |
| II   | Ravenclaw  | Depth-First Search   | Explore deep corridors       |
| III  | Hufflepuff | A* Search            | Heuristic-guided navigation  |
| IV   | Slytherin  | Minimax + α-β        | Strategic Tic-Tac-Toe duel   |

---

## Controls

- **⚡ Cast Spell** — Run the algorithm automatically (click again to pause)
- **➤ Step** — Execute one step at a time
- **↺ New Maze** — Generate a fresh random maze
- **📖 Learn** — Toggle the educational explanation panel
- **Agent selector** — Choose between 🦉 Magical Owl or 🧙 Wizard on Broom

---

## Scoring

Points are awarded on door completion based on efficiency:
- Fewer steps explored = higher score
- Win the Minimax duel = bonus points
- Maximum possible score: ~300+ points

---

## Technologies Used

- Plain HTML5, CSS3, JavaScript (ES6+)
- Canvas API for algorithm visualization
- No frameworks, no dependencies — runs anywhere
