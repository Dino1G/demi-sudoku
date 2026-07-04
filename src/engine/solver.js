import { CELLS, PEERS } from './grid.js';

function candidatesFor(work, i) {
    const used = new Set();
    for (const p of PEERS[i]) {
        if (work[p]) used.add(work[p]);
    }
    const out = [];
    for (let v = 1; v <= 9; v++) {
        if (!used.has(v)) out.push(v);
    }
    return out;
}

export function countSolutions(grid, limit = 2) {
    const work = grid.slice();

    // Early check for contradictions in the initial grid
    for (let i = 0; i < CELLS; i++) {
        if (!work[i]) continue;
        for (const p of PEERS[i]) {
            if (work[p] === work[i]) {
                return { count: 0, solution: null };
            }
        }
    }

    let count = 0;
    let solution = null;

    function search() {
        let best = -1;
        let bestCands = null;
        for (let i = 0; i < CELLS; i++) {
            if (work[i]) continue;
            const cands = candidatesFor(work, i);
            if (cands.length === 0) return; // dead end
            if (best === -1 || cands.length < bestCands.length) {
                best = i;
                bestCands = cands;
                if (cands.length === 1) break; // forced move, expand now
            }
        }
        if (best === -1) {
            count++;
            if (!solution) solution = work.slice();
            return;
        }
        for (const v of bestCands) {
            work[best] = v;
            search();
            work[best] = 0;
            if (count >= limit) return;
        }
    }

    search();
    return { count, solution };
}

export function solve(grid) {
    return countSolutions(grid, 1).solution;
}

export function hasUniqueSolution(grid) {
    return countSolutions(grid, 2).count === 1;
}
