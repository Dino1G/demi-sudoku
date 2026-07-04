# Demi 數獨

A mobile-first Sudoku PWA with technique-based difficulty and a world-animal
encyclopedia you unlock by winning games. Pure static front-end, no backend.

## Run locally

    cd demi-sudoku
    python3 -m http.server 8000
    # open http://localhost:8000/

## Test

    cd demi-sudoku
    npm test    # node --test, zero dependencies

## Deploy (GitHub Pages)

1. Push the repo to GitHub.
2. Settings > Pages > deploy from branch, folder `/demi-sudoku` (or move
   these files to the repo root of a dedicated Pages repo).
3. On iPhone Safari, open the Pages URL, tap Share > Add to Home Screen.
   Launch from the home-screen icon for full-screen, offline play.

## Structure

- `src/engine/` puzzle generation, solving, difficulty grading (Web Worker)
- `src/game/` game state, persistence, animal data
- `src/ui/` board, controls, menu, encyclopedia
- `src/data/` animals.json, world-map.svg
