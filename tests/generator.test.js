import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CELLS, PEERS } from '../src/engine/grid.js';
import { hasUniqueSolution } from '../src/engine/solver.js';
import { generateFull, dig } from '../src/engine/generator.js';

// Deterministic LCG so tests are reproducible.
function seededRng(seed) {
    let s = seed >>> 0;
    return () => {
        s = (1664525 * s + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

test('generateFull produces a complete, valid grid', () => {
    const g = generateFull(seededRng(42));
    assert.equal(g.length, CELLS);
    assert.ok(g.every((v) => v >= 1 && v <= 9));
    for (let i = 0; i < CELLS; i++) {
        for (const p of PEERS[i]) assert.notEqual(g[i], g[p]);
    }
});

test('dig yields a puzzle with a unique solution and blanks', () => {
    const full = generateFull(seededRng(7));
    const puzzle = dig(full, seededRng(7));
    assert.ok(puzzle.some((v) => v === 0), 'has blanks');
    assert.equal(hasUniqueSolution(puzzle), true);
    // givens must match the full solution
    for (let i = 0; i < CELLS; i++) {
        if (puzzle[i] !== 0) assert.equal(puzzle[i], full[i]);
    }
});
