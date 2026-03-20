/* ================================================
   main.js — Entry point: boot the game
   ================================================ */

window.addEventListener('DOMContentLoaded', () => {
  makeStars();      // animated star field
  makeCandles();    // flickering candles in header
  updateProgress(); // draw house progress tracker
  renderDoor(0);    // start at Door 1 (Gryffindor / BFS)
});
