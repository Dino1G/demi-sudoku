import { generatePuzzle } from './grader.js';

self.addEventListener('message', (event) => {
    const { type, difficulty, id } = event.data;
    if (type !== 'generate') return;
    const { puzzle, solution, difficulty: graded } = generatePuzzle(difficulty, Math.random);
    self.postMessage({ type: 'puzzle', id, difficulty: graded, puzzle, solution });
});
