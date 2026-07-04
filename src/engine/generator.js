import { CELLS, PEERS } from './grid.js';
import { hasUniqueSolution } from './solver.js';

function shuffled(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function generateFull(rng) {
    const grid = new Array(CELLS).fill(0);

    function fill(pos) {
        if (pos === CELLS) return true;
        if (grid[pos]) return fill(pos + 1);
        for (const v of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9], rng)) {
            if (PEERS[pos].every((p) => grid[p] !== v)) {
                grid[pos] = v;
                if (fill(pos + 1)) return true;
                grid[pos] = 0;
            }
        }
        return false;
    }

    fill(0);
    return grid;
}

export function dig(full, rng, maxRemoved = 64) {
    const puzzle = full.slice();
    let removed = 0;
    // Remove in symmetric pairs (i and its 180-degree partner) for aesthetics.
    for (const i of shuffled([...Array(CELLS).keys()], rng)) {
        if (removed >= maxRemoved) break;
        const j = CELLS - 1 - i;
        if (puzzle[i] === 0 && puzzle[j] === 0) continue;
        const savedI = puzzle[i];
        const savedJ = puzzle[j];
        puzzle[i] = 0;
        puzzle[j] = 0;
        if (hasUniqueSolution(puzzle)) {
            removed += i === j ? 1 : 2;
        } else {
            puzzle[i] = savedI;
            puzzle[j] = savedJ;
        }
    }
    return puzzle;
}
